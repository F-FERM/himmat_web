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
    let isOnPointer = false;

    /** Returns true when the element (or an ancestor) is a clickable/pointer target */
    const isPointerElement = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      let curr: HTMLElement | null = el;
      for (let i = 0; i < 6 && curr && curr !== document.documentElement; i++) {
        const tag = curr.tagName;
        if (tag === "A" || tag === "BUTTON" || tag === "LABEL" || tag === "SELECT" || tag === "INPUT") {
          return true;
        }
        if (curr.getAttribute("role") === "button" || curr.getAttribute("role") === "link") {
          return true;
        }
        if (curr.hasAttribute("onClick") || typeof (curr as any).onclick === "function") {
          return true;
        }
        try {
          const computed = window.getComputedStyle(curr).cursor;
          if (computed === "pointer") return true;
        } catch {
          // ignore
        }
        curr = curr.parentElement;
      }
      return false;
    };

    /** Returns true when the cursor is over an image or media element */
    const isImageUnderCursor = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      // If inside footer, footer's blue background takes precedence
      if (el.closest("footer")) return false;

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

      // Check if inside a slide or card with full image
      const slide = el.closest(".hero-slide, [data-hero-slide]");
      if (slide) return true;

      // Check direct parent or self for next/image
      let curr: HTMLElement | null = el;
      for (let i = 0; i < 3 && curr && curr !== document.documentElement; i++) {
        if (curr.querySelector(":scope > img, :scope > span > img")) {
          return true;
        }
        curr = curr.parentElement;
      }

      return false;
    };

    /** Accurately detects the background theme underneath the cursor */
    const detectTheme = (el: HTMLElement | null): CursorTheme => {
      if (!el) return "white";

      // 1. Image check
      if (isImageUnderCursor(el)) {
        return "image";
      }

      // 2. Climb up ancestors to find the visible background
      let curr: HTMLElement | null = el;
      for (let i = 0; i < 15 && curr && curr !== document.documentElement; i++) {
        const cls = typeof curr.className === "string" ? curr.className.toLowerCase() : "";

        // Check explicit background classes (bg-, not text- or border-)
        // Yellow / Amber / Gold backgrounds -> Blue dot
        if (
          cls.includes("bg-yellow") ||
          cls.includes("bg-amber") ||
          cls.includes("bg-gold") ||
          cls.includes("bg-[#daa732]") ||
          cls.includes("bg-[#e0a82e]") ||
          cls.includes("bg-[#d4a22f]")
        ) {
          return "yellow";
        }

        // Blue backgrounds -> Yellow dot
        if (
          cls.includes("bg-blue") ||
          cls.includes("bg-sky") ||
          cls.includes("bg-indigo") ||
          cls.includes("bg-cyan") ||
          cls.includes("bg-[#1b5287]") ||
          cls.includes("bg-[#15497b]") ||
          cls.includes("bg-[#195992]") ||
          curr.tagName === "FOOTER"
        ) {
          return "blue";
        }

        // Dark backgrounds -> White dot
        if (
          cls.includes("bg-black") ||
          cls.includes("bg-[#1a1a1a]") ||
          cls.includes("bg-gray-900") ||
          cls.includes("bg-zinc-900") ||
          cls.includes("bg-slate-900")
        ) {
          return "dark";
        }

        // White / light backgrounds -> Black dot
        if (
          cls.includes("bg-white") ||
          cls.includes("bg-[#ffffff]") ||
          cls.includes("bg-[#f5f5f5]") ||
          cls.includes("bg-[#fafafa]") ||
          cls.includes("bg-gray-50")
        ) {
          return "white";
        }

        // Check computed backgroundColor if non-transparent
        try {
          const style = window.getComputedStyle(curr);
          const bg = style.backgroundColor;
          if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
            const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (match) {
              const r = parseInt(match[1], 10);
              const g = parseInt(match[2], 10);
              const b = parseInt(match[3], 10);
              const a = match[4] !== undefined ? parseFloat(match[4]) : 1;

              if (a > 0.25) {
                // Yellow / Gold check
                if (r > 160 && g > 120 && b < 120 && r - b > 40 && g - b > 25) {
                  return "yellow";
                }
                // Blue dominant check
                if (b > 85 && b > r * 1.15 && b > g * 1.05) {
                  return "blue";
                }
                // Dark check
                if (r < 55 && g < 55 && b < 55) {
                  return "dark";
                }
                // White / Light check
                if (r > 180 && g > 180 && b > 180) {
                  return "white";
                }
              }
            }
          }
        } catch {
          // ignore
        }

        curr = curr.parentElement;
      }

      // Default fallback is white screen -> black dot
      return "white";
    };

    const render = () => {
      if (!cursor) {
        rafId = null;
        return;
      }

      // Smooth position update
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;

      const target = document.elementFromPoint(mouseX, mouseY) as HTMLElement | null;

      if (target) {
        // Pointer state: scales slightly on interactive targets, NEVER hides or blinks
        const onPointer = isPointerElement(target);
        if (onPointer !== isOnPointer) {
          if (onPointer) {
            cursor.classList.add("cursor-on-pointer");
          } else {
            cursor.classList.remove("cursor-on-pointer");
          }
          isOnPointer = onPointer;
        }

        // Color theme check
        const nextTheme = detectTheme(target);
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
