"use client";
import api from "@/lib/axios";
import { Manrope } from "next/font/google";
import Image from "next/image";
import { useEffect, useState } from "react";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

// ================= API =================

const ENDPOINT = "/about-page";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

const COUNT_DURATION_MS = 1600;

type ApiBuiltForProgress = {
  companyName?: string;
  title?: string;
  image?: string;
  imageAlt?: string;
  yearsNumber?: string;
  yearsLabel?: string;
  description?: string;
};

type ApiAboutPage = { builtForProgress?: ApiBuiltForProgress };

type IntroContent = {
  label: string;
  title: string;
  image: string;
  imageAlt: string;
  value: number; 
  suffix: string; 
  counterLabel: string;
  text: string;
};

const FALLBACK_CONTENT: IntroContent = {
  label: "Himmat Contracting Company",
  title: "Built For Progress",
  image: "/images/about/builtprogress.jpg",
  imageAlt: "Engineers reviewing site plans",
  value: 4,
  suffix: "+",
  counterLabel: "Years Of Experience",
  text: "Founded in 2022 in the Kingdom of Saudi Arabia, Himmat has grown from a trusted provider of lifting equipment and accessories into a diversified company supporting industrial, infrastructure, and construction projects across the Kingdom. Based at Al Dana Tower, Al Jubail, KSA, our capabilities extend across equipment rental, manpower supply, engineering and construction, interior and exterior works, MEP, materials trading and manufacturing, and transportation and logistics. Through practical expertise, dependable resources, and a strong understanding of project needs, we provide integrated solutions that support clients at every stage. Guided by our commitment to Engineer Success Together, we continue to build lasting partnerships through quality, reliability, and responsible execution.",
};

function resolveImage(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${IMAGE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function parseYears(raw?: string): { value: number; suffix: string } {
  const match = (raw ?? "").trim().match(/^(\d+)\s*(.*)$/);
  if (!match) return { value: FALLBACK_CONTENT.value, suffix: FALLBACK_CONTENT.suffix };
  return { value: parseInt(match[1], 10), suffix: match[2] };
}

function mapApiBuiltForProgress(
  data: ApiAboutPage | ApiAboutPage[] | null | undefined
): IntroContent {
  const doc = Array.isArray(data) ? data[0] : data;
  const b = doc?.builtForProgress;
  if (!b) return FALLBACK_CONTENT;

  const years = parseYears(b.yearsNumber);

  return {
    label: b.companyName || FALLBACK_CONTENT.label,
    title: b.title || FALLBACK_CONTENT.title,
    image: b.image ? resolveImage(b.image) : FALLBACK_CONTENT.image,
    imageAlt: b.imageAlt || FALLBACK_CONTENT.imageAlt,
    value: b.yearsNumber ? years.value : FALLBACK_CONTENT.value,
    suffix: b.yearsNumber ? years.suffix : FALLBACK_CONTENT.suffix,
    counterLabel: b.yearsLabel || FALLBACK_CONTENT.counterLabel,
    text: b.description || FALLBACK_CONTENT.text,
  };
}


function useInView<T extends HTMLElement>(
  rootMargin = "0px 0px -15% 0px",
  threshold = 0
) {
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
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [el, rootMargin, threshold]);

  return { ref: setEl, inView };
}

function RollingDigit({
  digit,
  active,
  index,
}: {
  digit: number;
  active: boolean;
  index: number;
}) {
  return (
    <span
      aria-hidden="true"
      className="relative inline-block h-[1em] overflow-hidden tabular-nums"
    >
      <span
        className="flex flex-col transition-transform ease-out motion-reduce:transition-none"
        style={{
          transform: `translateY(-${active ? digit : 0}em)`,
          transitionDuration: `${COUNT_DURATION_MS}ms`,
          transitionDelay: `${index * 120}ms`,
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] leading-none">
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

const SECTION =
  "w-full overflow-x-clip bg-[#F8F9FB] py-10 sm:py-14 lg:py-16 2xl:pb-[68px] 2xl:pt-[70px]";

const WRAP =
  "px-4 sm:px-8 lg:px-12 xl:px-[8%] 2xl:ml-[15%] 2xl:mr-[14.9%] 2xl:px-0";

const HEADER_GRID =
  "grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[28%_1fr] lg:gap-x-10 2xl:grid-cols-[25.5%_1fr] 2xl:gap-x-0";

const BODY_GRID =
  "mt-7 grid grid-cols-1 gap-8 sm:mt-10 sm:gap-10 " +
  "lg:grid-cols-[1fr_1.2fr] lg:gap-x-12 " +
  "xl:gap-x-16 " +
  "2xl:mt-[46px] 2xl:grid-cols-[545fr_659fr] 2xl:gap-x-[10.2%]";

const IMAGE_BOX =
  "relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] " +
  "lg:aspect-auto lg:min-h-[360px] xl:min-h-[420px] " +
  "2xl:aspect-[545/455] 2xl:min-h-0";

const TEXT_COL = "lg:pt-6 2xl:pt-[2%]";

const COUNTER_SIZE =
  "text-[72px] sm:text-[100px] lg:text-[110px] xl:text-[120px] 2xl:text-[clamp(100px,6.5vw,125px)]";

function AboutIntroSkeleton() {
  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <div className="mx-auto max-w-[1920px]">
        <div className={WRAP}>
          {/* Header skeleton */}
          <div className={HEADER_GRID}>
            <div className="h-5 w-44 animate-pulse rounded bg-[#E9EEF4] sm:h-6" />
            <div className="h-8 w-[60%] max-w-[360px] animate-pulse rounded bg-[#E9EEF4] sm:h-10 xl:h-11" />
          </div>

          <div className={BODY_GRID}>
            {/* Image skeleton */}
            <div className={`${IMAGE_BOX} animate-pulse bg-[#E9EEF4]`} />

            {/* Counter + text skeleton */}
            <div className={TEXT_COL}>
              <div className={`${COUNTER_SIZE} leading-none`}>
                <div className="h-[0.9em] w-[1.4em] animate-pulse rounded bg-[#E9EEF4]" />
              </div>
              <div className="mt-4 border-t border-[#E2E2E2] pt-4">
                <div className="h-5 w-44 animate-pulse rounded bg-[#E9EEF4]" />
                <div className="mt-4 space-y-2">
                  <div className="h-3.5 w-full animate-pulse rounded bg-[#E9EEF4]" />
                  <div className="h-3.5 w-full animate-pulse rounded bg-[#E9EEF4]" />
                  <div className="h-3.5 w-full animate-pulse rounded bg-[#E9EEF4]" />
                  <div className="h-3.5 w-[92%] animate-pulse rounded bg-[#E9EEF4]" />
                  <div className="h-3.5 w-[70%] animate-pulse rounded bg-[#E9EEF4]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutIntro() {
  const { ref: counterRef, inView } = useInView<HTMLDivElement>();

  const [content, setContent] = useState<IntroContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiAboutPage | ApiAboutPage[]>(ENDPOINT);
        if (cancelled) return;
        setContent(mapApiBuiltForProgress(res.data));
      } catch {
        if (!cancelled) setContent(FALLBACK_CONTENT);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !content) return <AboutIntroSkeleton />;

  const c = content;

  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <div className="mx-auto max-w-[1920px]">
        <div className={WRAP}>
          {/* ---------- Header: label + heading ---------- */}
          <div className={HEADER_GRID}>
            <p className="text-base font-medium text-[#111] sm:text-xl 2xl:text-[clamp(18px,1.15vw,22px)]">
              {c.label}
            </p>
            <h2 className="text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#195992] sm:text-3xl md:text-4xl xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
              {c.title}
            </h2>
          </div>

          {/* ---------- Image + counter ---------- */}
          <div className={BODY_GRID}>
            {/* Image */}
            <div className={IMAGE_BOX}>
              {c.image && (
                <Image
                  src={c.image}
                  alt={c.imageAlt}
                  fill
                  sizes="(min-width: 1536px) 28vw, (min-width: 1024px) 40vw, 100vw"
                  unoptimized
                  className="object-cover"
                />
              )}
            </div>

            {/* Counter + text */}
            <div className={TEXT_COL}>
              <div
                ref={counterRef}
                className={`flex items-start font-medium leading-none text-[#DAA732] ${COUNTER_SIZE}`}
                aria-label={`${c.value}${c.suffix} ${c.counterLabel}`}
              >
                <span className="flex">
                  {String(c.value)
                    .split("")
                    .map((d, i) => (
                      <RollingDigit
                        key={i}
                        digit={Number(d)}
                        active={inView}
                        index={i}
                      />
                    ))}
                </span>
                <span
                  aria-hidden="true"
                  className="ml-[0.06em] -translate-y-[0.02em] text-[0.8em]"
                >
                  {c.suffix}
                </span>
              </div>

              <div className="border-t border-[#E2E2E2]">
                <p className="mt-4 text-[15px] font-medium text-[#111] sm:text-[17px]">
                  {c.counterLabel}
                </p>
                <p className="mt-3 text-sm font-medium leading-[1.6] text-[#666] sm:mt-4 sm:text-[15px] sm:leading-[1.5] 2xl:text-[clamp(14px,0.784vw,15px)]">
                  {c.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutIntro;