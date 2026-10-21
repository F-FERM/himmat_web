"use client";
import { useEffect, useRef, useState } from "react";
import { Manrope } from "next/font/google";
import Image from "next/image";
import whyImage from "../../public/images/home/home-why-choose-us.jpg"; // change to your image

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const SKILLS = [
  { label: "Quality Work", value: 95 },
  { label: "Trusted Support", value: 100 },
  { label: "Smart Solutions", value: 90 },
];

const BAR_DURATION_MS = 1600;
const START_AT = 50; // bars begin at the center and run to their end value

// Same curve as Tailwind's `ease-out` (cubic-bezier(0, 0, 0.2, 1)), so the number
// counts in perfect sync with the CSS transition of the bar.
function easeOut(t: number) {
  const [x1, y1, x2, y2] = [0, 0, 0.2, 1];
  if (t <= 0 || t >= 1) return t;
  let lo = 0;
  let hi = 1;
  let u = t;
  for (let i = 0; i < 30; i++) {
    const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
    if (Math.abs(x - t) < 1e-5) break;
    if (x < t) lo = u;
    else hi = u;
    u = (lo + hi) / 2;
  }
  return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
}

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

function WhyChooseUs() {
  const { ref, inView } = useInView<HTMLDivElement>();

  // Bars have their own trigger: fires once, as soon as they are inside the lower part of the screen
  // (works even when this section is the last one on the page and can't scroll any higher)
  const { ref: barsRef, inView: barsInView } = useInView<HTMLDivElement>("0px 0px -15% 0px", 0);

  // Drives only the number (0 -> value). The bars themselves use a smooth CSS transition.
  const [countP, setCountP] = useState(0);

  useEffect(() => {
    if (!barsInView) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCountP(1);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / BAR_DURATION_MS, 1);
      setCountP(easeOut(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [barsInView]);

  const base =
    "transition-all duration-1000 ease-out motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none";

  return (
    <section className={`${manrope.className} w-full overflow-x-clip bg-[#F5F5F5] py-14 sm:py-16 2xl:py-[72px]`}>
      <div
        ref={ref}
        className="grid grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:gap-x-12 lg:px-12
                   xl:px-[8%]
                   2xl:ml-[13.3%] 2xl:mr-[15.3%] 2xl:grid-cols-[572fr_796fr] 2xl:gap-x-0 2xl:px-0"
      >
        {/* ---------- Image (top -> bottom) ---------- */}
        <div className={`${base} ${inView ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"}`}>
          <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] lg:aspect-[572/562]">
            <Image
              src={whyImage}
              alt="Handshake between site engineers"
              fill
              sizes="(min-width: 1536px) 30vw, (min-width: 1024px) 42vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* ---------- Content (bottom -> top) ---------- */}
        <div
          className={`${base} delay-200 ${
            inView ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
          } 2xl:pl-[12.3%]`}
        >
          <p className="text-base text-[#DAA732] sm:text-[17px] 2xl:text-[clamp(15px,0.89vw,17px)] font-medium">Why Choose Us</p>

          <h2 className="mt-2.5 text-3xl font-semibold leading-[1.18] tracking-[-0.02em] text-[#195992] sm:text-4xl xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
            Built To Support Every Project With Confidence
          </h2>

          <p className="mt-5 max-w-[700px] text-[15px] leading-[1.5] text-[#666666] font-medium sm:mt-6 2xl:text-[clamp(14px,0.784vw,15px)]">
            We bring together skilled people, reliable resources, and practical solutions to meet diverse project
            requirements. Our focus on quality, coordination, and timely execution helps deliver a smooth experience
            from start to finish.
          </p>

          {/* Progress bars */}
          <div ref={barsRef} className="mt-9 flex flex-col gap-7 sm:mt-10">
            {SKILLS.map((skill) => (
              <div key={skill.label}>
                <p className="text-lg text-[#666666] sm:text-xl font-medium">{skill.label}</p>

                {/* Track: label sits just after the tip of the bar */}
                <div className="relative mt-2 h-[5px] w-[85%] sm:w-[94%]">
                  {/* Bar starts at the center (50%) and runs to the right end (value) */}
                  <div
                    className="absolute left-0 top-0 h-full bg-[#DAA732] motion-reduce:transition-none"
                    style={{
                      width: barsInView ? `${skill.value}%` : `${START_AT}%`,
                      transition: `width ${BAR_DURATION_MS}ms cubic-bezier(0, 0, 0.2, 1)`,
                    }}
                  />
                  <span
                    className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-base text-[#111] motion-reduce:transition-none"
                    style={{
                      left: barsInView ? `calc(${skill.value}% + 10px)` : `calc(${START_AT}% + 10px)`,
                      transition: `left ${BAR_DURATION_MS}ms cubic-bezier(0, 0, 0.2, 1)`,
                    }}
                    aria-label={`${skill.value}%`}
                  >
                    {Math.round(START_AT + (skill.value - START_AT) * countP)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;