"use client";
import { useEffect, useRef, useState } from "react";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const VALUES = [
  {
    title: "Quality Without Compromise",
    text: "We maintain high standards across every service and project. Our focus remains on dependable work and consistent results.",
  },
  {
    title: "Partnership Built Strong",
    text: "We build long-term relationships based on trust, transparency, and shared goals, working closely with clients from planning to handover.",
  },
  {
    title: "Safety Without Compromise",
    text: "Safety guides every decision on site. We follow strict procedures and best practices to protect our people, partners, and projects.",
  },
  {
    title: "Commitment To Delivery",
    text: "We plan carefully, coordinate closely, and keep every project on schedule so our clients receive what they expect, when they expect it.",
  },
];

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

function CoreValues() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [open, setOpen] = useState<number | null>(0); // first item open by default

  // animate.css fadeInUp: hidden until in view, then plays once
  const headingAnim = inView ? "values-fade-in-up" : "values-hidden";
  const accordionAnim = inView ? "values-fade-in-up values-fade-in-up-delay" : "values-hidden";

  return (
    <section className={`${manrope.className} w-full overflow-x-clip bg-white py-14 sm:py-16 2xl:py-[72px]`}>
      <style>{`
        /* animate.css fadeInUp: from one full element-height lower + transparent, to place */
        @keyframes values-fade-in-up {
          from { opacity: 0; transform: translate3d(0, 100%, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .values-hidden {
          visibility: hidden;
        }
        .values-fade-in-up {
          visibility: visible;
          animation-name: values-fade-in-up;
          animation-duration: 1s;
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        /* the accordion follows the heading */
        .values-fade-in-up-delay {
          animation-delay: 0.4s;
        }

        @media (prefers-reduced-motion: reduce) {
          .values-hidden { visibility: visible; }
          .values-fade-in-up { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      <div
        ref={ref}
        className="grid grid-cols-1 gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-x-12 lg:px-12
                   xl:px-[8%]
                   2xl:ml-[15%] 2xl:mr-[14.9%] 2xl:grid-cols-[796fr_545fr] 2xl:gap-x-0 2xl:px-0"
      >
        {/* ---------- Heading (fadeInUp) ---------- */}
        <div className={`${headingAnim} lg:pt-0`}>
          <p className="text-base  text-[#DAA732] sm:text-[17px] 2xl:text-[clamp(15px,0.89vw,17px)] font-medium">
            Our Core Values
          </p>
          <h2 className="mt-2.5 text-3xl font-semibold leading-[1.18] tracking-[-0.02em] text-[#195992] sm:text-4xl xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
            Values That Drive Excellence
          </h2>
        </div>

        {/* ---------- Accordion (fadeInUp) ---------- */}
        <div className={`${accordionAnim} border-b border-[#E4E4E4]`}>
          {VALUES.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.title} className="border-t border-[#E4E4E4]">
                <button
                  type="button"
                  id={`value-btn-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`value-panel-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full cursor-pointer px-0 pb-0 pt-[21px] text-left"
                >
                  <span className="block text-xl font-medium leading-[30px] text-[#19191a] sm:text-[20px] 2xl:text-[clamp(20px,1.25vw,24px)]">
                    {item.title}
                  </span>
                </button>

                {/* Smooth open / close (grid-rows trick, no fixed heights) */}
                <div
                  id={`value-panel-${i}`}
                  role="region"
                  aria-labelledby={`value-btn-${i}`}
                  className={`grid transition-all duration-500 ease-in-out motion-reduce:transition-none ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[88%] pt-4 text-[15px] font-medium leading-[1.5] text-[#666666] 2xl:text-[clamp(14px,0.784vw,15px)]">
                      {item.text}
                    </p>
                    <div className="h-[21px]" />
                  </div>
                </div>

                {/* Bottom padding for closed rows (open rows get it from the spacer above) */}
                <div className={`transition-all duration-500 ease-in-out ${isOpen ? "h-0" : "h-[21px]"}`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CoreValues;