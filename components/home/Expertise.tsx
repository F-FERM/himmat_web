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

type ApiExpertiseItem = {
  _id?: string;
  title: string;
  description: string;
  icon: string;
  order?: number;
};

type ApiHomePage = {
  expertise?: {
    tagline?: string;
    title?: string;
    items?: ApiExpertiseItem[];
  };
};

type ExpertiseItem = {
  icon: string;
  title: string;
  text: string;
};

const FALLBACK_ITEMS: ExpertiseItem[] = [
  {
    icon: "/images/home/home-expertise-1.png",
    title: "Site Solutions",
    text: "Practical site support designed to keep construction activities organized, efficient, and on schedule.",
  },
  {
    icon: "/images/home/home-expertise-2.png",
    title: "Technical Services",
    text: "Professional engineering and MEP solutions tailored to meet the technical needs of each project.",
  },
  {
    icon: "/images/home/home-expertise-3.png",
    title: "Resource Support",
    text: "Reliable manpower, equipment, and material solutions to support projects from start to completion.",
  },
  {
    icon: "/images/home/home-expertise-4.png",
    title: "Logistics Support",
    text: "Well-coordinated transportation and logistics services for smooth movement of materials, equipment, and project resources.",
  },
];

const FALLBACK_HEADING = {
  tagline: "Our Expertise",
  title: "Delivering The Support Every Project Needs",
};

function resolveImage(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${IMAGE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function mapApiExpertise(data: ApiHomePage | ApiHomePage[] | null | undefined) {
  const doc = Array.isArray(data) ? data[0] : data;
  const exp = doc?.expertise;
  const raw = exp?.items ?? [];
  const items: ExpertiseItem[] = [...raw]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((it) => Boolean(it.icon) && Boolean(it.title))
    .map((it) => ({
      icon: resolveImage(it.icon),
      title: it.title,
      text: it.description || "",
    }));
  return {
    heading: {
      tagline: exp?.tagline || FALLBACK_HEADING.tagline,
      title: exp?.title || FALLBACK_HEADING.title,
    },
    items: items.length ? items : FALLBACK_ITEMS,
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
  "w-full overflow-x-clip bg-white py-12 sm:py-14 lg:py-16 2xl:py-[70px]";

const GRID =
  "grid grid-cols-1 gap-8 px-4 sm:gap-10 sm:px-8 " +
  "lg:grid-cols-[1fr_1.5fr] lg:gap-x-10 lg:px-12 " +
  "xl:gap-x-14 xl:px-[8%] " +
  "2xl:ml-[14.8%] 2xl:mr-[13.9%] 2xl:grid-cols-[569fr_796fr] 2xl:gap-x-0 2xl:px-0";

const ITEMS_GRID =
  "grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 sm:gap-y-12 lg:gap-y-14 2xl:gap-x-0 2xl:gap-y-[71px]";

function ExpertiseSkeleton() {
  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <div className="mx-auto max-w-[1920px]">
        <div className={GRID}>
          {/* Heading skeleton */}
          <div>
            <div className="h-4 w-32 animate-pulse rounded bg-[#E9EEF4] sm:h-[17px]" />
            <div className="mt-3 max-w-[16em] space-y-2.5 sm:max-w-[11em]">
              <div className="h-7 w-[90%] animate-pulse rounded bg-[#E9EEF4] sm:h-9 xl:h-10" />
              <div className="h-7 w-[80%] animate-pulse rounded bg-[#E9EEF4] sm:h-9 xl:h-10" />
              <div className="h-7 w-[60%] animate-pulse rounded bg-[#E9EEF4] sm:h-9 xl:h-10" />
            </div>
          </div>

          {/* Items skeleton */}
          <div className={ITEMS_GRID}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="2xl:pr-[20%]">
                <div className="h-14 w-14 animate-pulse rounded bg-[#E9EEF4] sm:h-16 sm:w-16" />
                <div className="mt-5 h-5 w-3/4 animate-pulse rounded bg-[#E9EEF4] sm:mt-7 sm:h-6" />
                <div className="mt-3 space-y-2">
                  <div className="h-3.5 w-full animate-pulse rounded bg-[#E9EEF4]" />
                  <div className="h-3.5 w-full animate-pulse rounded bg-[#E9EEF4]" />
                  <div className="h-3.5 w-[75%] animate-pulse rounded bg-[#E9EEF4]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Expertise() {
  const { ref, inView } = useInView<HTMLDivElement>();

  const [data, setData] = useState<{
    heading: { tagline: string; title: string };
    items: ExpertiseItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiHomePage | ApiHomePage[]>(ENDPOINT);
        if (cancelled) return;
        setData(mapApiExpertise(res.data));
      } catch {
        if (!cancelled)
          setData({ heading: FALLBACK_HEADING, items: FALLBACK_ITEMS });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <ExpertiseSkeleton />;

  const heading = data?.heading ?? FALLBACK_HEADING;
  const items = data?.items ?? FALLBACK_ITEMS;

  // Everything comes from bottom -> top
  const base =
    "transition-all duration-1000 ease-out motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none";
  const hidden = "translate-y-12 opacity-0 sm:translate-y-24";
  const shown = "translate-y-0 opacity-100";

  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <div className="mx-auto max-w-[1920px]">
        <div ref={ref} className={GRID}>
          {/* ---------- Heading ---------- */}
          <div className={`${base} ${inView ? shown : hidden}`}>
            <p className="text-[15px] font-medium text-[#DAA732] sm:text-base lg:text-[17px] 2xl:text-[clamp(15px,0.89vw,17px)]">
              {heading.tagline}
            </p>
            <h2 className="mt-2.5 max-w-[16em] text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#195992] sm:max-w-[11em] sm:text-3xl md:text-4xl lg:text-[32px] xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
              {heading.title}
            </h2>
          </div>

          {/* ---------- Items ---------- */}
          <div className={ITEMS_GRID}>
            {items.map((item, i) => (
              <div
                key={`${item.icon}-${i}`}
                className={`${base} ${inView ? shown : hidden} 2xl:pr-[20%]`}
                style={{ transitionDelay: inView ? `${200 + i * 150}ms` : "0ms" }}
              >
                {item.icon && (
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={64}
                    height={64}
                    unoptimized
                    className="h-14 w-auto object-contain sm:h-16"
                  />
                )}

                <h3 className="mt-5 text-lg font-medium text-[#111] sm:mt-7 sm:text-xl lg:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-[1.6] text-[#666666] sm:text-[15px] sm:leading-[1.5] 2xl:text-[clamp(14px,0.784vw,15px)]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Expertise;