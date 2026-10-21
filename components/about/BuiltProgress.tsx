"use client";
import { useEffect, useRef, useState } from "react";
import { Manrope } from "next/font/google";
import Image from "next/image";
import introImage from "../../public/images/about/builtprogress.jpg"; // change to your image

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const COUNT_DURATION_MS = 1600;

const CONTENT = {
  label: "Himmat Contracting Company",
  title: "Built For Progress",
  value: 4, // the number counts 0 -> value
  suffix: "+",
  counterLabel: "Years Of Experience",
  text: "Founded in 2022 in the Kingdom of Saudi Arabia, Himmat has grown from a trusted provider of lifting equipment and accessories into a diversified company supporting industrial, infrastructure, and construction projects across the Kingdom. Based at Al Dana Tower, Al Jubail, KSA, our capabilities extend across equipment rental, manpower supply, engineering and construction, interior and exterior works, MEP, materials trading and manufacturing, and transportation and logistics. Through practical expertise, dependable resources, and a strong understanding of project needs, we provide integrated solutions that support clients at every stage. Guided by our commitment to Engineer Success Together, we continue to build lasting partnerships through quality, reliability, and responsible execution.",
};

/** Flips to true once the element scrolls into view (runs once). */
function useInView<T extends HTMLElement>(rootMargin = "0px 0px -15% 0px", threshold = 0) {
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

function AboutIntro() {
  const { ref: counterRef, inView } = useInView<HTMLDivElement>();
  const [count, setCount] = useState(0); // starts at 0, so the number is only animated

  useEffect(() => {
    if (!inView) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(CONTENT.value);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / COUNT_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out
      setCount(Math.round(CONTENT.value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <section className={`${manrope.className} w-full overflow-x-clip bg-[#F8F9FB] py-12 sm:py-14 2xl:pb-[68px] 2xl:pt-[70px]`}>
      <div className="px-5 sm:px-8 lg:px-12 xl:px-[8%] 2xl:ml-[15%] 2xl:mr-[14.9%] 2xl:px-0">
        {/* ---------- Header: label + heading ---------- */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[28%_1fr] lg:gap-x-10 2xl:grid-cols-[25.5%_1fr] 2xl:gap-x-0">
          <p className="text-lg font-medium text-[#111] sm:text-xl 2xl:text-[clamp(18px,1.15vw,22px)]">
            {CONTENT.label}
          </p>
          <h2 className="text-3xl font-semibold leading-[1.18] tracking-[-0.02em] text-[#195992] sm:text-4xl xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
            {CONTENT.title}
          </h2>
        </div>

        {/* ---------- Image + counter ---------- */}
        <div className="mt-8 grid grid-cols-1 gap-10 sm:mt-10 lg:grid-cols-[1fr_1.2fr] lg:gap-x-12 2xl:mt-[46px] 2xl:grid-cols-[545fr_659fr] 2xl:gap-x-[10.2%]">
          {/* Image */}
          <div className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto lg:min-h-[360px] 2xl:aspect-[545/455] 2xl:min-h-0">
            <Image
              src={introImage}
              alt="Engineers reviewing site plans"
              fill
              sizes="(min-width: 1536px) 28vw, (min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>

          {/* Counter + text */}
          <div className="lg:pt-6 2xl:pt-[2%]">
            {/* Animated number: 0 -> 4, the + stays */}
            <div
              ref={counterRef}
              className="flex items-start font-medium leading-none text-[#DAA732]
                         text-[84px] sm:text-[100px] lg:text-[120px] 2xl:text-[clamp(100px,6.5vw,125px)]"
              aria-label={`${CONTENT.value}${CONTENT.suffix} ${CONTENT.counterLabel}`}
            >
              <span aria-hidden="true" className="tabular-nums">
                {count}
              </span>
              <span aria-hidden="true" className="ml-[0.06em] -translate-y-[0.02em] text-[0.8em]">
                {CONTENT.suffix}
              </span>
            </div>

            <div className="border-t border-[#E2E2E2]">
              <p className="mt-4 text-base font-medium text-[#111] sm:text-[17px]">{CONTENT.counterLabel}</p>
              <p className="mt-4 text-[15px] font-medium leading-[1.5] text-[#666] 2xl:text-[clamp(14px,0.784vw,15px)]">
                {CONTENT.text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutIntro;