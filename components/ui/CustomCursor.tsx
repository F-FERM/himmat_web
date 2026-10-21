"use client";

import { useEffect, useRef } from "react";

type CursorTheme = "image" | "blue" | "yellow" | "white" | "dark";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!hasPointer) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = -100;
    let mouseY = -100;
    let rafId: number | null = null;
    let isVisible = false;
    let currentTheme: CursorTheme = "white";

    const isImageUnderCursor = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      if (
        el.tagName === "IMG" ||
        el.tagName === "PICTURE" ||
        el.tagName === "VIDEO" ||
        el.tagName === "CANVAS" ||
        el.hasAttribute("data-cursor-image")
      ) {
        return true;
      }
      if (el.closest("picture, figure, [data-cursor-image]")) {
        return true;
      }

      const style = window.getComputedStyle(el);
      if (style.backgroundImage && style.backgroundImage !== "none") {
        return true;
      }

      const parent = el.parentElement;
      if (parent) {
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.backgroundImage && parentStyle.backgroundImage !== "none") {
          return true;
        }
        if (parent.querySelector(":scope > img")) {
          return true;
        }
      }

      return false;
    };

    const isYellowUnderCursor = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      let curr: HTMLElement | null = el;
      for (let i = 0; i < 6 && curr && curr !== document.documentElement; i++) {
        const style = window.getComputedStyle(curr);
        const bg = style.backgroundColor;
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
          if (a > 0.15) {
            // Yellow / Gold check: Red and Green are high, Blue is lower
            if (r > 160 && g > 120 && b < 120 && r - b > 50 && g - b > 30) {
              return true;
            }
            break;
          }
        }
        const cls = typeof curr.className === "string" ? curr.className.toLowerCase() : "";
        if (
          cls.includes("yellow") ||
          cls.includes("amber") ||
          cls.includes("gold") ||
          cls.includes("daa732") ||
          cls.includes("e0a82e")
        ) {
          return true;
        }
        curr = curr.parentElement;
      }
      return false;
    };

    const isBlueUnderCursor = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      let curr: HTMLElement | null = el;
      for (let i = 0; i < 6 && curr && curr !== document.documentElement; i++) {
        const style = window.getComputedStyle(curr);
        const bg = style.backgroundColor;
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
          if (a > 0.15) {
            // Blue dominant check
            if (b > 90 && b > r * 1.2 && b > g * 1.05) {
              return true;
            }
            break;
          }
        }
        const cls = typeof curr.className === "string" ? curr.className.toLowerCase() : "";
        if (cls.includes("blue") || cls.includes("sky") || cls.includes("indigo") || cls.includes("cyan")) {
          return true;
        }
        curr = curr.parentElement;
      }
      return false;
    };

    const isWhiteUnderCursor = (el: HTMLElement | null): boolean => {
      if (!el) return true;
      let curr: HTMLElement | null = el;
      for (let i = 0; i < 6 && curr && curr !== document.documentElement; i++) {
        const style = window.getComputedStyle(curr);
        const bg = style.backgroundColor;
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
          if (a > 0.15) {
            return r > 200 && g > 200 && b > 200;
          }
        }
        curr = curr.parentElement;
      }
      return true;
    };

    const render = () => {
      if (!cursor) {
        rafId = null;
        return;
      }

      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;

      const target = document.elementFromPoint(mouseX, mouseY) as HTMLElement | null;

      if (target) {
        // Color / Theme check
        let nextTheme: CursorTheme = "white";
        if (isImageUnderCursor(target)) {
          nextTheme = "image";
        } else if (isYellowUnderCursor(target)) {
          nextTheme = "yellow";
        } else if (isBlueUnderCursor(target)) {
          nextTheme = "blue";
        } else if (isWhiteUnderCursor(target)) {
          nextTheme = "white";
        } else {
          nextTheme = "dark";
        }

        if (nextTheme !== currentTheme) {
          cursor.classList.remove(
            "cursor-on-image",
            "cursor-on-blue",
            "cursor-on-yellow",
            "cursor-on-white",
            "cursor-on-dark"
          );
          if (nextTheme === "image") cursor.classList.add("cursor-on-image");
          else if (nextTheme === "yellow") cursor.classList.add("cursor-on-yellow");
          else if (nextTheme === "blue") cursor.classList.add("cursor-on-blue");
          else if (nextTheme === "white") cursor.classList.add("cursor-on-white");
          else cursor.classList.add("cursor-on-dark");

          currentTheme = nextTheme;
        }
      }

      rafId = null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        cursor.classList.remove("cursor-hidden");
      }

      if (!rafId) {
        rafId = requestAnimationFrame(render);
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      cursor.classList.add("cursor-hidden");
    };

    const handleMouseEnter = () => {
      isVisible = true;
      cursor.classList.remove("cursor-hidden");
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return <div ref={cursorRef} aria-hidden="true" className="cursor cursor-hidden cursor-on-white" />;
}
