"use client";
import { useEffect, useRef, useState } from "react";
import { Manrope } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import ctaBg from "../../public/images/home/calltoaction.jpg"; // change to your image

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

/** Flips to true once the element scrolls into view (runs once). */
function useInView<T extends HTMLElement>(rootMargin = "0px 0px -80px 0px", threshold = 0.2) {
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
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold]);

  return { ref, inView };
}

function CallToAction() {
  // Observe the heading itself so it animates exactly when it enters the viewport
  const { ref, inView } = useInView<HTMLHeadingElement>();

  return (
    <section
      className={`${manrope.className} relative w-full overflow-x-clip bg-black text-white`}
    >
      {/* Background image + dark overlay */}
      <Image src={ctaBg} alt="" fill sizes="100vw" className="object-cover" aria-hidden="true" />
      <div className="absolute inset-0 bg-black/55" />

      <div
        className="relative mx-auto flex w-full max-w-[1920px] flex-col items-center px-5 py-20 text-center
                   sm:px-8 sm:py-24 lg:py-28 2xl:py-[118px]"
      >
        {/* Static */}
        <p className="text-base sm:text-lg 2xl:text-[clamp(17px,1vw,20px)]">
          Himmat Contracting Company
        </p>

        {/* Only this slides in, left -> right, on scroll */}
        <h2
          ref={ref}
          className={`mt-6 max-w-[18em] text-[32px] font-medium leading-[1.16] tracking-[-0.02em] sm:mt-7 sm:text-5xl xl:text-[52px] 2xl:text-[clamp(48px,2.93vw,58px)]
                      transition-all duration-1000 ease-out
                      motion-reduce:!translate-x-0 motion-reduce:!opacity-100 motion-reduce:transition-none
                      ${inView ? "translate-x-0 opacity-100" : "-translate-x-24 opacity-0"}`}
        >
          Delivering Excellence Beyond Every Expectation
        </h2>

        {/* Static */}
        <div className="mt-9 sm:mt-11">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 bg-[#DAA732] px-5 py-3.5 text-sm font-medium text-white
                       transition-colors duration-300 hover:bg-white hover:text-black sm:text-base"
          >
            Get In Touch
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            >
              <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CallToAction;