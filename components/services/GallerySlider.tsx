"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import img1 from "../../public/images/home/Hero1.jpg";
import img2 from "../../public/images/home/Hero2.jpg";
import img3 from "../../public/images/home/Hero3.jpg";
import img4 from "../../public/images/home/Hero4.jpg";

const IMAGES = [
  { src: img1, alt: "Light tower on site" },
  { src: img2, alt: "Scissor lift and boom lift" },
  { src: img3, alt: "Motor grader" },
  { src: img4, alt: "Low-bed trailer" },
];

const INTERVAL_MS = 3000; // time between moves
const SLIDE_MS = 800; // how long one move takes

const total = IMAGES.length;
// 4 copies: we always sit in the middle ones, so there is room to move both left and right
const TRACK = [...IMAGES, ...IMAGES, ...IMAGES, ...IMAGES];

function GallerySlider() {
  const [index, setIndex] = useState(total); // start on the first real copy
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0); // width of one card + gap, in px
  const trackRef = useRef<HTMLDivElement>(null);

  // Drag / swipe state
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const startX = useRef(0);
  const moved = useRef(false);

  // Measure one step (card width + gap); re-measure on resize
  useEffect(() => {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return;

    const measure = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      setStep(first.getBoundingClientRect().width + gap);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(first);
    return () => ro.disconnect();
  }, []);

  // Move one image to the left every INTERVAL_MS (timer restarts after any move or drag)
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setIndex((i) => i + 1), INTERVAL_MS);
    return () => clearTimeout(id);
  }, [paused, index]);

  // Stay inside the middle copies: silently jump by one full set when we leave them
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (index >= total * 2) {
      setAnimate(false);
      setIndex(index - total);
    } else if (index < total) {
      setAnimate(false);
      setIndex(index + total);
    }
  };
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  // ---- Drag / swipe (mouse + touch) ----
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startX.current = e.clientX;
    moved.current = false;
    setDragging(true);
    setPaused(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 6) moved.current = true;
    setDragX(dx);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    const threshold = Math.max(40, step * 0.15);
    let delta = 0;
    if (dragX < -threshold) delta = Math.max(1, Math.round(-dragX / step)); // dragged left -> next
    if (dragX > threshold) delta = -Math.max(1, Math.round(dragX / step)); // dragged right -> previous
    delta = Math.max(-2, Math.min(2, delta));
    setIndex((i) => i + delta);
    setDragX(0);
    if (e.pointerType !== "mouse") setPaused(false); // touch has no "mouse leave"
  };

  return (
    <section className="w-full overflow-x-clip bg-[#F5F5F5] py-10 sm:py-14 2xl:pb-[82px] 2xl:pt-[69px]">
      <div
        className={`mx-auto w-full select-none overflow-hidden px-5 sm:px-8 lg:px-12 xl:px-[8%]
                    2xl:ml-[15%] 2xl:w-[70%] 2xl:px-0 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ touchAction: "pan-y" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Images per screen: 1 / 2 / 3 / 4, gap 16 -> 20px */}
        <div
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          className="flex gap-[var(--gap)] [--gap:16px] [--n:1] sm:[--gap:20px] sm:[--n:2] lg:[--n:3] xl:[--n:4]"
          style={{
            transform: `translate3d(${dragX - index * step}px, 0, 0)`,
            transition: animate && !dragging ? `transform ${SLIDE_MS}ms ease-in-out` : "none",
          }}
        >
          {TRACK.map((img, i) => (
            <div
              key={i}
              aria-hidden={i < total || i >= total * 2 ? true : undefined}
              className="relative aspect-[8/7] shrink-0 overflow-hidden rounded-[14px]"
              style={{ width: "calc((100% - (var(--n) - 1) * var(--gap)) / var(--n))" }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                draggable={false}
                sizes="(min-width: 1536px) 18vw, (min-width: 1280px) 20vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 90vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default GallerySlider;