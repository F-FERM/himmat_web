"use client";

import { useEffect, useRef, useState } from "react";

type ButtonTheme = "blue" | "white" | "image" | "yellow" | "dark";

export default function ScrollToTop() {
  const [theme, setTheme] = useState<ButtonTheme>("image");
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;

    const detectTheme = (): ButtonTheme => {
      const button = buttonRef.current;
      if (!button) return "white";

      const rect = button.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      // Get all elements stacked under the center of the button
      const elements = document.elementsFromPoint(x, y);

      // Filter out the button itself and its svg/path children, as well as custom cursor
      const candidates = elements.filter(
        (el) =>
          el !== button &&
          !button.contains(el) &&
          !el.classList.contains("cursor") &&
          el.tagName !== "HTML" &&
          el.tagName !== "BODY"
      );

      if (candidates.length === 0) return "white";

      // 1. Check for Blue (Footer or other blue sections/overlays)
      // High priority so footer with background image + blue overlay is recognized as blue
      for (const el of candidates) {
        const cls = typeof el.className === "string" ? el.className.toLowerCase() : "";
        if (
          cls.includes("1b5287") ||
          cls.includes("15497b") ||
          cls.includes("195992") ||
          cls.includes("0f3860") ||
          cls.includes("bg-blue") ||
          cls.includes("bg-sky")
        ) {
          return "blue";
        }

        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
          if (a > 0.2) {
            // Blue dominant check
            if (b > 90 && b > r * 1.15 && b > g * 1.05) {
              return "blue";
            }
          }
        }
      }

      // 2. Check for Yellow / Gold (e.g. Services section)
      for (const el of candidates) {
        const cls = typeof el.className === "string" ? el.className.toLowerCase() : "";
        if (
          cls.includes("d4a22f") ||
          cls.includes("daa732") ||
          cls.includes("e0a82e") ||
          cls.includes("bg-yellow") ||
          cls.includes("bg-amber") ||
          cls.includes("bg-gold")
        ) {
          return "yellow";
        }

        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
          if (a > 0.2) {
            if (r > 160 && g > 120 && b < 120 && r - b > 40 && g - b > 25) {
              return "yellow";
            }
          }
        }
      }

      // 3. Check for Image (e.g. Hero slide, CallToAction)
      const hasImage = candidates.some((el) => {
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
        const section = el.closest("section, header, div");
        if (section && section.querySelector(":scope > img, :scope > div > img")) {
          const sStyle = window.getComputedStyle(section);
          const sBg = sStyle.backgroundColor;
          const sMatch = sBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          const sA = sMatch && sMatch[4] !== undefined ? parseFloat(sMatch[4]) : 0;
          return sA < 0.8;
        }
        return false;
      });

      if (hasImage) {
        return "image";
      }

      // 4. Check for White / Light vs Dark
      for (const el of candidates) {
        const cls = typeof el.className === "string" ? el.className.toLowerCase() : "";
        if (cls.includes("bg-white") || cls.includes("bg-[#f5f5f5]")) {
          return "white";
        }
        if (cls.includes("bg-black") || cls.includes("bg-[#1a1a1a]")) {
          return "dark";
        }

        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
          if (a > 0.25) {
            if (r > 190 && g > 190 && b > 190) {
              return "white";
            }
            if (r < 70 && g < 70 && b < 70) {
              return "dark";
            }
          }
        }
      }

      return "white";
    };

    const update = () => {
      const next = detectTheme();
      setTheme((prev) => (prev !== next ? next : prev));
      rafId = null;
    };

    const onScrollOrResize = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(update);
      }
    };

    // Run on initial mount
    update();

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Theme-specific styles matching the user images and cursor theme
  const getThemeClasses = () => {
    switch (theme) {
      case "blue":
        // In Blue background -> Yellow circle with Dark Blue arrow (Image 1)
        return "bg-[#DAA732] text-[#15497B] border border-[#DAA732]/40 shadow-lg";
      case "white":
        // In White background -> Black circle with White arrow (Image 2)
        return "bg-black text-white border border-black/10 shadow-lg";
      case "image":
        // In Image background -> Frosted translucent circle with Dark arrow (Image 3)
        return "bg-white/50 text-[#1F2937] border border-white/70 backdrop-blur-md shadow-lg";
      case "yellow":
        // In Yellow background -> Blue circle with Gold arrow
        return "bg-[#1B5287] text-[#DAA732] border border-[#1B5287]/40 shadow-lg";
      case "dark":
      default:
        // In Dark background -> White circle with Black arrow
        return "bg-white text-black border border-white/20 shadow-lg";
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      data-cursor-button="scroll-to-top"
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-105 active:scale-95 sm:h-11 sm:w-11 ${getThemeClasses()}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
        className="transition-colors duration-300"
      >
        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
