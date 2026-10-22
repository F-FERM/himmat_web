"use client";
import api from "@/lib/axios";
import { Manrope } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// ================= API =================
const ENDPOINT = "/home-page";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

type ApiServiceCard = {
  _id?: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt?: string;
  link: string;
  order?: number;
};

type ApiHomePage = {
  services?: {
    tagline?: string;
    title?: string;
    cards?: ApiServiceCard[];
  };
};

type Service = {
  image: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  href: string;
};

const FALLBACK_SERVICES: Service[] = [
  { image: "/images/home/Hero1.jpg", imageAlt: "Engineering & Construction", title: "Engineering & Construction", subtitle: "Design & Execution", href: "/services" },
  { image: "/images/home/Hero2.jpg", imageAlt: "Interior & Exterior Work", title: "Interior & Exterior Work", subtitle: "Fit-Out & Renovation", href: "/services" },
  { image: "/images/home/Hero3.jpg", imageAlt: "Gypsum Works", title: "Gypsum Works", subtitle: "Ceilings & Partitions", href: "/services" },
  { image: "/images/home/Hero4.jpg", imageAlt: "MEP Works", title: "MEP Works", subtitle: "Mechanical & Electrical", href: "/services" },
];

const FALLBACK_HEADING = {
  tagline: "Our Services",
  title: "Integrated Solutions For Every Project Need",
};

const INTERVAL_MS = 3000;
const SLIDE_MS = 1000;

function resolveImage(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${IMAGE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function mapApiServices(data: ApiHomePage | ApiHomePage[] | null | undefined) {
  const doc = Array.isArray(data) ? data[0] : data;
  const svc = doc?.services;
  const cards = svc?.cards ?? [];
  const services: Service[] = [...cards]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((c) => Boolean(c.image) && Boolean(c.title))
    .map((c) => ({
      image: resolveImage(c.image),
      imageAlt: c.imageAlt || c.title,
      title: c.title,
      subtitle: c.subtitle || "",
      href: c.link || "/services",
    }));
  return {
    heading: {
      tagline: svc?.tagline || FALLBACK_HEADING.tagline,
      title: svc?.title || FALLBACK_HEADING.title,
    },
    services: services.length ? services : FALLBACK_SERVICES,
  };
}


function useInView<T extends HTMLElement>() {
  const [el, setEl] = useState<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [el]);

  return { ref: setEl, inView };
}

const SECTION =
  "relative w-full overflow-x-clip bg-[#D4A22F] py-12 text-white sm:py-14 lg:py-16 2xl:pb-24 2xl:pt-[75px]";

const LEFT = "ml-4 sm:ml-8 lg:ml-12 xl:ml-[10%] 2xl:ml-[15%]";
const HEADING_WRAP = `${LEFT} mr-4 sm:mr-8 lg:mr-12`;

const CARD_W =
  "w-[78vw] shrink-0 sm:w-[46vw] md:w-[40vw] lg:w-[32vw] xl:w-[27vw] 2xl:w-[24vw] min-[1920px]:w-[440px]";

const TRACK_GAP = "gap-4 sm:gap-6 lg:gap-8 xl:gap-12";

function ServicesSkeleton() {
  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <div className="relative">
        {/* Heading skeleton */}
        <div className={HEADING_WRAP}>
          <div className="h-4 w-28 animate-pulse rounded bg-white/25 sm:h-[17px]" />
          <div className="mt-3 space-y-2.5">
            <div className="h-7 w-[85%] max-w-[680px] animate-pulse rounded bg-white/25 sm:h-9 xl:h-10" />
            <div className="h-7 w-[55%] max-w-[680px] animate-pulse rounded bg-white/25 sm:h-9 xl:h-10" />
          </div>
        </div>

        {/* Cards skeleton */}
        <div className={`${LEFT} mt-7 overflow-hidden sm:mt-9`}>
          <div className={`flex ${TRACK_GAP}`}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={CARD_W}>
                <div className="aspect-[4/3] w-full animate-pulse bg-white/20" />
                <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-white/25 sm:mt-5 sm:h-6" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-white/20 sm:h-5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const { ref, inView } = useInView<HTMLDivElement>();

  const [data, setData] = useState<{
    heading: { tagline: string; title: string };
    services: Service[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiHomePage | ApiHomePage[]>(ENDPOINT);
        if (cancelled) return;
        setData(mapApiServices(res.data));
      } catch {
        if (!cancelled)
          setData({ heading: FALLBACK_HEADING, services: FALLBACK_SERVICES });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const heading = data?.heading ?? FALLBACK_HEADING;
  const services = data?.services ?? FALLBACK_SERVICES;
  const total = services.length;

  const track = useMemo(
    () => [...services, ...services, ...services, ...services],
    [services]
  );

  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const startX = useRef(0);
  const moved = useRef(false);

  useEffect(() => {
    if (loading) return;
    setAnimate(false);
    setIndex(total);
    setDragX(0);
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimate(true))
    );
    return () => cancelAnimationFrame(id);
  }, [total, loading]);

  useEffect(() => {
    if (loading) return;
    const trackEl = trackRef.current;
    const first = trackEl?.firstElementChild as HTMLElement | null;
    if (!trackEl || !first) return;

    const measure = () => {
      const gap = parseFloat(getComputedStyle(trackEl).columnGap) || 0;
      setStep(first.getBoundingClientRect().width + gap);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(first);
    return () => ro.disconnect();
  }, [track, loading]);

  // Autoplay
  useEffect(() => {
    if (loading || paused || !inView || !total) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setIndex((i) => i + 1), INTERVAL_MS);
    return () => clearTimeout(id);
  }, [loading, paused, inView, index, total]);

  // Loop bounds
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
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimate(true))
    );
    return () => cancelAnimationFrame(id);
  }, [animate]);

  // Drag / swipe
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
    if (step > 0) {
      if (dragX < -threshold) delta = Math.max(1, Math.round(-dragX / step));
      if (dragX > threshold) delta = -Math.max(1, Math.round(dragX / step));
    }
    delta = Math.max(-2, Math.min(2, delta));
    setIndex((i) => i + delta);
    setDragX(0);
    if (e.pointerType !== "mouse") setPaused(false);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = false;
    }
  };

  if (loading) return <ServicesSkeleton />;

  const headingAnim = inView ? "services-fade-in-up" : "services-hidden";
  const sliderAnim = inView
    ? "services-fade-in-up services-fade-in-up-delay"
    : "services-hidden";

  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <style>{`
        @keyframes services-fade-in-up {
          from { opacity: 0; transform: translate3d(0, 60px, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .services-hidden { visibility: hidden; }
        .services-fade-in-up {
          visibility: visible;
          animation-name: services-fade-in-up;
          animation-duration: 1s;
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        .services-fade-in-up-delay { animation-delay: 0.4s; }
        @media (prefers-reduced-motion: reduce) {
          .services-hidden { visibility: visible; }
          .services-fade-in-up { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      <div ref={ref} className="relative">
        {/* Heading */}
        <div className={`${headingAnim} ${HEADING_WRAP}`}>
          <p className="text-[15px] font-medium sm:text-base lg:text-[17px]">
            {heading.tagline}
          </p>
          <h2 className="mt-2.5 max-w-[680px] text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] sm:text-3xl md:text-4xl xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
            {heading.title}
          </h2>
        </div>

        {/* Slider */}
        <div
          className={`${sliderAnim} ${LEFT} mt-7 select-none overflow-hidden sm:mt-9 ${
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
            className={`flex ${TRACK_GAP}`}
            style={{
              transform: `translate3d(${dragX - index * step}px, 0, 0)`,
              transition:
                animate && !dragging
                  ? `transform ${SLIDE_MS}ms ease-in-out`
                  : "none",
            }}
          >
            {track.map((s, i) => {
              const isClone = i < total || i >= total * 2;
              return (
                <Link
                  key={`${s.image}-${i}`}
                  href={s.href}
                  aria-hidden={isClone ? true : undefined}
                  tabIndex={isClone ? -1 : undefined}
                  draggable={false}
                  className={`group ${CARD_W} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={s.image}
                      alt={s.imageAlt}
                      fill
                      sizes="(min-width: 1920px) 440px, (min-width: 1536px) 24vw, (min-width: 1280px) 27vw, (min-width: 1024px) 32vw, (min-width: 768px) 40vw, (min-width: 640px) 46vw, 78vw"
                      draggable={false}
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-4 text-lg font-medium sm:mt-5 sm:text-xl lg:text-2xl">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm sm:text-base">{s.subtitle}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;