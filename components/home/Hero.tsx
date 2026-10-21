"use client";
import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Manrope } from "next/font/google";
import image1 from "../../public/images/home/Hero1.jpg";
import image2 from "../../public/images/home/Hero2.jpg";
import image3 from "../../public/images/home/Hero3.jpg";
import image4 from "../../public/images/home/Hero4.jpg";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Edit images and text here
const SLIDES = [
  {
    image: image1,
    subtitle: "Integrated Project Solutions",
    title: "Engineering & Construction Excellence",
    description:
      "Delivering reliable engineering and construction solutions with quality workmanship, timely execution, and lasting value.",
    href: "/services",
  },
  {
    image: image2,
    subtitle: "Heavy Lifting Specialists",
    title: "Lifting Equipment You Can Trust",
    description:
      "Certified lifting equipment and accessories supplied to industrial, infrastructure, and construction sites across the Kingdom.",
    href: "/services",
  },
  {
    image: image3,
    subtitle: "Built for the Kingdom",
    title: "Supporting Projects Across Saudi Arabia",
    description:
      "From supply to site support, we help teams keep complex projects safe, on schedule, and on budget.",
    href: "/projects",
  },
  {
    image: image4,
    subtitle: "Reliable Equipment Solutions",
    title: "Equipment Rental For Every Project",
    description:
      "High-performance equipment rentals supporting construction, industrial, and infrastructure projects with maximum efficiency.",
    href: "/services",
  },
];

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path
        d={dir === "left" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Hero() {
  const [current, setCurrent] = useState(0);
  const total = SLIDES.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  const slide = SLIDES[current];

  const arrowClass =
    "flex h-11 w-11 items-center justify-center rounded-full bg-[#ffffff1a] text-white backdrop-blur-[5px] " +
    "transition-colors duration-300 hover:bg-white hover:text-whhite sm:h-12 sm:w-12 lg:h-[54px] lg:w-[54px]";

  return (
    <section
      className={`${manrope.className} relative w-full overflow-hidden bg-black text-white min-h-[100svh]`}
    >
      {/* Background images (cross-fade) */}
      {SLIDES.map((s, i) => (
        <Image
          key={i}
          src={s.image}
          alt={s.title}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[1584px] flex-col justify-end px-5 pb-10 pt-32 sm:px-8 sm:pb-14 md:pb-20 lg:px-10 lg:pb-24 xl:px-12 xl:pb-[120px] 2xl:px-0">
        <div key={current} className="hero-anim grid grid-cols-1 gap-y-6 md:grid-cols-[1fr_auto] md:gap-x-10 md:gap-y-8">
          {/* Subtitle + title */}
          <div className="order-1 md:col-start-1 md:row-start-1 md:self-end">
            <p className="text-base font-normal sm:text-xl lg:text-2xl">{slide.subtitle}</p>
            <h1 className="mt-3 md:mt-5 text-3xl font-medium leading-[1.15] sm:text-4xl md:text-5xl xl:text-[56px]">
              {slide.title}
            </h1>
          </div>

          {/* Arrows + Read More */}
          <div className="order-3 flex items-center justify-between gap-4 md:col-start-2 md:row-start-1 md:flex-col md:items-end md:justify-end md:gap-12 md:self-end lg:gap-[72px]">
            <Link
              href={slide.href}
              className="group inline-flex items-center gap-3 bg-[#E0A82E] px-5 py-3.5 text-sm font-medium text-white
                         transition-colors duration-300 hover:bg-white hover:text-black sm:text-base md:order-2 md:mb-1"
            >
              Read More
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <div className="flex gap-3 md:order-1 md:mr-6 md:gap-[18px] lg:mr-10 xl:mr-14">
              <button type="button" aria-label="Previous slide" onClick={prev} className={arrowClass}>
                <ChevronIcon dir="left" />
              </button>
              <button type="button" aria-label="Next slide" onClick={next} className={arrowClass}>
                <ChevronIcon dir="right" />
              </button>
            </div>
          </div>

          {/* Divider + description */}
          <div className="order-2 border-t border-white/25 pt-4 sm:pt-[17px] md:col-span-2 md:row-start-2">
            <p className="max-w-[720px] text-sm leading-relaxed sm:text-base">{slide.description}</p>
          </div>
        </div>
      </div>

      {/* Text entrance animation, runs each time the slide changes */}
      <style>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-anim { animation: heroIn 0.7s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .hero-anim { animation: none; } }
      `}</style>
    </section>
  );
}

export default Hero;