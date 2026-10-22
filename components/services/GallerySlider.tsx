"use client";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type GalleryImage = { src: string; alt: string };

const INTERVAL_MS = 3000; 
const SLIDE_MS = 800; 
const MAX_VISIBLE = 4; 

function GallerySlider({ images }: { images: GalleryImage[] }) {
 
  const { track, total } = useMemo(() => {
    if (images.length === 0) return { track: [] as GalleryImage[], total: 0 };
    const reps = Math.ceil(MAX_VISIBLE / images.length);
    const base = Array.from({ length: reps }, () => images).flat();
    return { track: [...base, ...base, ...base, ...base], total: base.length };
  }, [images]);

  const [index, setIndex] = useState(total); 
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0); 
  const trackRef = useRef<HTMLDivElement>(null);

  
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const startX = useRef(0);

 
  useEffect(() => {
    const el = trackRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;

    const measure = () => {
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      setStep(first.getBoundingClientRect().width + gap);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(first);
    return () => ro.disconnect();
  }, [total]);

  useEffect(() => {
    if (paused || total === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setIndex((i) => i + 1), INTERVAL_MS);
    return () => clearTimeout(id);
  }, [paused, index, total]);

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

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startX.current = e.clientX;
    setDragging(true);
    setPaused(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragX(e.clientX - startX.current);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    const threshold = Math.max(40, step * 0.15);
    let delta = 0;
    if (dragX < -threshold) delta = Math.max(1, Math.round(-dragX / step));
    if (dragX > threshold) delta = -Math.max(1, Math.round(dragX / step));
    delta = Math.max(-2, Math.min(2, delta));
    setIndex((i) => i + delta);
    setDragX(0);
    if (e.pointerType !== "mouse") setPaused(false);
  };

  if (total === 0) return null;

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
        <div
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          className="flex gap-[var(--gap)] [--gap:16px] [--n:1] sm:[--gap:20px] sm:[--n:2] lg:[--n:3] xl:[--n:4]"
          style={{
            transform: `translate3d(${dragX - index * step}px, 0, 0)`,
            transition: animate && !dragging ? `transform ${SLIDE_MS}ms ease-in-out` : "none",
          }}
        >
          {track.map((img, i) => (
            <div
              key={i}
              aria-hidden={i < total || i >= total * 2 ? true : undefined}
              className="relative aspect-[8/7] shrink-0 overflow-hidden rounded-[14px] bg-[#E5E5E5]"
              style={{ width: "calc((100% - (var(--n) - 1) * var(--gap)) / var(--n))" }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                unoptimized
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