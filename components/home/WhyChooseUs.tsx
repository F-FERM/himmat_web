"use client";
import api from "@/lib/axios";
import { Manrope } from "next/font/google";
import Image from "next/image";
import { useEffect, useState } from "react";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// ================= API =================
const ENDPOINT = "/home-page";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

type ApiWhyStat = {
  _id?: string;
  label: string;
  percentage: number;
  order?: number;
};

type ApiWhyChooseUs = {
  tagline?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  stats?: ApiWhyStat[];
};

type ApiHomePage = { whyChooseUs?: ApiWhyChooseUs };

type Skill = { label: string; value: number };

const FALLBACK_SKILLS: Skill[] = [
  { label: "Quality Work", value: 95 },
  { label: "Trusted Support", value: 100 },
  { label: "Smart Solutions", value: 90 },
];

const FALLBACK_HEADING = {
  tagline: "Why Choose Us",
  title: "Built To Support Every Project With Confidence",
  description:
    "We bring together skilled people, reliable resources, and practical solutions to meet diverse project requirements. Our focus on quality, coordination, and timely execution helps deliver a smooth experience from start to finish.",
  image: "/images/home/home-why-choose-us.jpg",
  imageAlt: "Handshake between site engineers",
};

const BAR_DURATION_MS = 1600;
const START_AT = 50;

function resolveImage(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${IMAGE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function mapApiWhyChooseUs(data: ApiHomePage | ApiHomePage[] | null | undefined) {
  const doc = Array.isArray(data) ? data[0] : data;
  const why = doc?.whyChooseUs;

  const skills: Skill[] = [...(why?.stats ?? [])]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((s) => Boolean(s.label))
    .map((s) => ({
      label: s.label,
      value: Math.max(0, Math.min(100, Number(s.percentage) || 0)),
    }));

  return {
    tagline: why?.tagline || FALLBACK_HEADING.tagline,
    title: why?.title || FALLBACK_HEADING.title,
    description: why?.description || FALLBACK_HEADING.description,
    image: why?.image ? resolveImage(why.image) : FALLBACK_HEADING.image,
    imageAlt: why?.imageAlt || FALLBACK_HEADING.imageAlt,
    skills: skills.length ? skills : FALLBACK_SKILLS,
  };
}

// Same curve as Tailwind's `ease-out`
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

function useInView<T extends HTMLElement>(
  rootMargin = "0px 0px -60px 0px",
  threshold = 0.1
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

const SECTION =
  "w-full overflow-x-clip bg-[#F5F5F5] py-12 sm:py-14 lg:py-16 2xl:py-[72px]";

const GRID =
  "grid grid-cols-1 items-center gap-8 px-4 sm:gap-10 sm:px-8 " +
  "lg:grid-cols-[1fr_1.2fr] lg:gap-x-12 lg:px-12 " +
  "xl:px-[8%] " +
  "2xl:ml-[13.3%] 2xl:mr-[15.3%] 2xl:grid-cols-[572fr_796fr] 2xl:gap-x-0 2xl:px-0";

const IMAGE_BOX =
  "relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] lg:aspect-[572/562]";

const BAR_TRACK = "relative mt-2 h-[5px] w-[80%] sm:w-[90%] lg:w-[94%]";

function WhyChooseUsSkeleton() {
  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <div className="mx-auto max-w-[1920px]">
        <div className={GRID}>
          {/* Image skeleton */}
          <div>
            <div className={`${IMAGE_BOX} animate-pulse bg-[#E5E5E5]`} />
          </div>

          {/* Content skeleton */}
          <div className="2xl:pl-[12.3%]">
            <div className="h-4 w-32 animate-pulse rounded bg-[#E5E5E5] sm:h-[17px]" />
            <div className="mt-3 space-y-2.5">
              <div className="h-7 w-[90%] animate-pulse rounded bg-[#E5E5E5] sm:h-9 xl:h-10" />
              <div className="h-7 w-[65%] animate-pulse rounded bg-[#E5E5E5] sm:h-9 xl:h-10" />
            </div>

            <div className="mt-5 max-w-[700px] space-y-2 sm:mt-6">
              <div className="h-3.5 w-full animate-pulse rounded bg-[#E5E5E5]" />
              <div className="h-3.5 w-full animate-pulse rounded bg-[#E5E5E5]" />
              <div className="h-3.5 w-[80%] animate-pulse rounded bg-[#E5E5E5]" />
            </div>

            {/* Progress bars skeleton */}
            <div className="mt-8 flex flex-col gap-6 sm:mt-10 sm:gap-7">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <div className="h-5 w-40 animate-pulse rounded bg-[#E5E5E5] sm:h-6" />
                  <div className={`${BAR_TRACK} bg-[#E5E5E5]/60`}>
                    <div className="absolute left-0 top-0 h-full w-1/2 bg-[#E5E5E5]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const { ref: barsRef, inView: barsInView } = useInView<HTMLDivElement>(
    "0px 0px -15% 0px",
    0
  );

  const [data, setData] = useState<ReturnType<typeof mapApiWhyChooseUs> | null>(null);
  const [loading, setLoading] = useState(true);
  const [countP, setCountP] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiHomePage | ApiHomePage[]>(ENDPOINT);
        if (cancelled) return;
        setData(mapApiWhyChooseUs(res.data));
      } catch {
        if (!cancelled) setData(mapApiWhyChooseUs(null));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Count animation
  useEffect(() => {
    if (!barsInView || loading) return;

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
  }, [barsInView, loading]);

  if (loading || !data) return <WhyChooseUsSkeleton />;

  const { tagline, title, description, image, imageAlt, skills } = data;

  const base =
    "transition-all duration-1000 ease-out motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none";

  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <div className="mx-auto max-w-[1920px]">
        <div ref={ref} className={GRID}>
          {/* ---------- Image ---------- */}
          <div
            className={`${base} ${
              inView
                ? "translate-y-0 opacity-100"
                : "-translate-y-12 opacity-0 sm:-translate-y-20"
            }`}
          >
            <div className={IMAGE_BOX}>
              {image && (
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  sizes="(min-width: 1536px) 30vw, (min-width: 1024px) 42vw, 100vw"
                  unoptimized
                  className="object-cover"
                />
              )}
            </div>
          </div>

          {/* ---------- Content ---------- */}
          <div
            className={`${base} delay-200 ${
              inView
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0 sm:translate-y-24"
            } 2xl:pl-[12.3%]`}
          >
            <p className="text-[15px] font-medium text-[#DAA732] sm:text-base lg:text-[17px] 2xl:text-[clamp(15px,0.89vw,17px)]">
              {tagline}
            </p>

            <h2 className="mt-2.5 text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#195992] sm:text-3xl md:text-4xl lg:text-[32px] xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
              {title}
            </h2>

            <p className="mt-4 max-w-[700px] text-sm font-medium leading-[1.6] text-[#666666] sm:mt-6 sm:text-[15px] sm:leading-[1.5] 2xl:text-[clamp(14px,0.784vw,15px)]">
              {description}
            </p>

            {/* Progress bars */}
            <div ref={barsRef} className="mt-8 flex flex-col gap-6 sm:mt-10 sm:gap-7">
              {skills.map((skill) => (
                <div key={skill.label}>
                  <p className="text-base font-medium text-[#666666] sm:text-lg lg:text-xl">
                    {skill.label}
                  </p>

                  <div className={BAR_TRACK}>
                    <div
                      className="absolute left-0 top-0 h-full bg-[#DAA732] motion-reduce:transition-none"
                      style={{
                        width: barsInView ? `${skill.value}%` : `${START_AT}%`,
                        transition: `width ${BAR_DURATION_MS}ms cubic-bezier(0, 0, 0.2, 1)`,
                      }}
                    />
                    <span
                      className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-sm text-[#111] motion-reduce:transition-none sm:text-base"
                      style={{
                        left: barsInView
                          ? `calc(${skill.value}% + 10px)`
                          : `calc(${START_AT}% + 10px)`,
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
      </div>
    </section>
  );
}

export default WhyChooseUs;