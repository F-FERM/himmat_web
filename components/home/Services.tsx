"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Manrope } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import bgImage from "../../public/images/home/home-service-bg.jpg"; 
import service1 from "../../public/images/home/Hero1.jpg";
import service2 from "../../public/images/home/Hero2.jpg";
import service3 from "../../public/images/home/Hero3.jpg";
import service4 from "../../public/images/home/Hero4.jpg";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const SERVICES = [
  { image: service1, title: "Engineering & Construction", subtitle: "Design & Execution", href: "/services" },
  { image: service2, title: "Interior & Exterior Work", subtitle: "Fit-Out & Renovation", href: "/services" },
  { image: service3, title: "Gypsum Works", subtitle: "Ceilings & Partitions", href: "/services" },
  { image: service4, title: "MEP Works", subtitle: "Mechanical & Electrical", href: "/services" },
];

const INTERVAL_MS = 3000; // time between moves
const SLIDE_MS = 1000; // how long one move takes

// 4 copies: we always sit in the middle ones, so there is room to move both left and right
const TRACK = [...SERVICES, ...SERVICES, ...SERVICES, ...SERVICES];

/** Flips to true once the element scrolls into view (runs once). */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, inView };
}

function Services() {
  const { ref, inView } = useInView<HTMLDivElement>();

  const total = SERVICES.length;
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

  // Move one card to the left every INTERVAL_MS (timer restarts after any move or drag)
  useEffect(() => {
    if (paused || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setIndex((i) => i + 1), INTERVAL_MS);
    return () => clearTimeout(id);
  }, [paused, inView, index]);

  // Stay inside the middle copies: silently jump by one full set when we leave them
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return; // ignore the image hover zoom
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

  // Don't follow the card link when the user was dragging
  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = false;
    }
  };

  // Scroll-in animation: animate.css fadeInUp (hidden until in view, then plays once)
  const headingAnim = inView ? "services-fade-in-up" : "services-hidden";
  const sliderAnim = inView ? "services-fade-in-up services-fade-in-up-delay" : "services-hidden";

  // Left edge shared by heading and slider (matches the reference)
  const left = "ml-5 sm:ml-8 lg:ml-12 xl:ml-[10%] 2xl:ml-[15%]";

  return (
    <section
      className={`${manrope.className} relative w-full overflow-x-clip bg-[#D4A22F] py-14 text-white sm:py-16 2xl:pb-24 2xl:pt-[75px]`}
    >
      <style>{`
        /* animate.css fadeInUp: from one full element-height lower + transparent, to place */
        @keyframes services-fade-in-up {
          from { opacity: 0; transform: translate3d(0, 100%, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .services-hidden {
          visibility: hidden;
        }
        .services-fade-in-up {
          visibility: visible;
          animation-name: services-fade-in-up;
          animation-duration: 1s;
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        /* the slider follows the heading */
        .services-fade-in-up-delay {
          animation-delay: 0.4s;
        }

        @media (prefers-reduced-motion: reduce) {
          .services-hidden { visibility: visible; }
          .services-fade-in-up { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      {/* Background image */}
      <Image src={bgImage} alt="" fill sizes="100vw" className="object-cover" aria-hidden="true" />

      <div ref={ref} className="relative">
        {/* Heading (fadeInUp) */}
        <div className={`${headingAnim} ${left} mr-5 sm:mr-8 lg:mr-12`}>
          <p className="text-base font-medium sm:text-[17px]">Our Services</p>
          <h2 className="mt-2.5 max-w-[680px] text-3xl font-semibold leading-[1.18] tracking-[-0.02em] sm:text-4xl xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
            Integrated Solutions For Every Project Need
          </h2>
        </div>

        {/* Slider (fadeInUp): clipped on the left edge, runs off the right edge of the screen */}
        <div
          className={`${sliderAnim} ${left} mt-8 select-none overflow-hidden sm:mt-9 ${
            dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ touchAction: "pan-y" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
        >
          <div
            ref={trackRef}
            onTransitionEnd={handleTransitionEnd}
            className="flex gap-5 sm:gap-8 xl:gap-12"
            style={{
              transform: `translate3d(${dragX - index * step}px, 0, 0)`,
              transition: animate && !dragging ? `transform ${SLIDE_MS}ms ease-in-out` : "none",
            }}
          >
            {TRACK.map((s, i) => (
              <Link
                key={i}
                href={s.href}
                aria-hidden={i < total || i >= total * 2 ? true : undefined}
                tabIndex={i < total || i >= total * 2 ? -1 : undefined}
                draggable={false}
                className="group w-[72vw] shrink-0 sm:w-[46vw] lg:w-[32vw] xl:w-[27vw] 2xl:w-[24vw]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="(min-width: 1536px) 24vw, (min-width: 1280px) 27vw, (min-width: 1024px) 32vw, (min-width: 640px) 46vw, 72vw"
                    draggable={false}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-5 text-xl font-medium sm:text-2xl">{s.title}</h3>
                <p className="mt-1 text-sm sm:text-base">{s.subtitle}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;