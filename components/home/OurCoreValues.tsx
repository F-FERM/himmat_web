"use client";
import api from "@/lib/axios";
import { Manrope } from "next/font/google";
import { useEffect, useState } from "react";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// ================= API =================
const ENDPOINT = "/home-page";

type ApiCoreValueItem = {
  _id?: string;
  title: string;
  description: string;
  order?: number;
};

type ApiHomePage = {
  coreValues?: {
    tagline?: string;
    title?: string;
    items?: ApiCoreValueItem[];
  };
};

type CoreValue = { title: string; text: string };

const FALLBACK_HEADING = {
  tagline: "Our Core Values",
  title: "Values That Drive Excellence",
};

const FALLBACK_VALUES: CoreValue[] = [
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

function mapApiCoreValues(data: ApiHomePage | ApiHomePage[] | null | undefined) {
  const doc = Array.isArray(data) ? data[0] : data;
  const cv = doc?.coreValues;
  const raw = cv?.items ?? [];
  const values: CoreValue[] = [...raw]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((it) => Boolean(it.title))
    .map((it) => ({ title: it.title, text: it.description || "" }));
  return {
    heading: {
      tagline: cv?.tagline || FALLBACK_HEADING.tagline,
      title: cv?.title || FALLBACK_HEADING.title,
    },
    values: values.length ? values : FALLBACK_VALUES,
  };
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
  "w-full overflow-x-clip bg-white py-12 sm:py-14 lg:py-16 2xl:py-[72px]";

const GRID =
  "grid grid-cols-1 gap-8 px-4 sm:gap-10 sm:px-8 " +
  "lg:grid-cols-[1fr_1.1fr] lg:gap-x-12 lg:px-12 " +
  "xl:gap-x-16 xl:px-[8%] " +
  "2xl:ml-[15%] 2xl:mr-[14.9%] 2xl:grid-cols-[796fr_545fr] 2xl:gap-x-0 2xl:px-0";

function CoreValuesSkeleton() {
  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <div className="mx-auto max-w-[1920px]">
        <div className={GRID}>
          {/* Heading skeleton */}
          <div>
            <div className="h-4 w-36 animate-pulse rounded bg-[#E9EEF4] sm:h-[17px]" />
            <div className="mt-3 space-y-2.5">
              <div className="h-7 w-[85%] animate-pulse rounded bg-[#E9EEF4] sm:h-9 xl:h-10" />
              <div className="h-7 w-[55%] animate-pulse rounded bg-[#E9EEF4] sm:h-9 xl:h-10" />
            </div>
          </div>

          {/* Accordion skeleton */}
          <div className="border-b border-[#E4E4E4]">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="border-t border-[#E4E4E4]">
                <div className="pt-[21px]">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-[#E9EEF4]" />
                </div>

                {/* First row is "open" in the skeleton to match the default open index 0 */}
                {i === 0 ? (
                  <div className="overflow-hidden">
                    <div className="max-w-[88%] space-y-2 pt-4">
                      <div className="h-3.5 w-full animate-pulse rounded bg-[#E9EEF4]" />
                      <div className="h-3.5 w-[85%] animate-pulse rounded bg-[#E9EEF4]" />
                    </div>
                    <div className="h-[21px]" />
                  </div>
                ) : (
                  <div className="h-[21px]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CoreValues() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [open, setOpen] = useState<number | null>(0); 

  const [data, setData] = useState<ReturnType<typeof mapApiCoreValues> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiHomePage | ApiHomePage[]>(ENDPOINT);
        if (cancelled) return;
        setData(mapApiCoreValues(res.data));
      } catch {
        if (!cancelled) setData(mapApiCoreValues(null));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !data) return <CoreValuesSkeleton />;

  const { heading, values } = data;

  const headingAnim = inView ? "values-fade-in-up" : "values-hidden";
  const accordionAnim = inView
    ? "values-fade-in-up values-fade-in-up-delay"
    : "values-hidden";

  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <style>{`
        @keyframes values-fade-in-up {
          from { opacity: 0; transform: translate3d(0, 60px, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .values-hidden { visibility: hidden; }
        .values-fade-in-up {
          visibility: visible;
          animation-name: values-fade-in-up;
          animation-duration: 1s;
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        .values-fade-in-up-delay { animation-delay: 0.4s; }
        @media (prefers-reduced-motion: reduce) {
          .values-hidden { visibility: visible; }
          .values-fade-in-up { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      <div className="mx-auto max-w-[1920px]">
        <div ref={ref} className={GRID}>
          {/* ---------- Heading ---------- */}
          <div className={headingAnim}>
            <p className="text-[15px] font-medium text-[#DAA732] sm:text-base lg:text-[17px] 2xl:text-[clamp(15px,0.89vw,17px)]">
              {heading.tagline}
            </p>
            <h2 className="mt-2.5 text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#195992] sm:text-3xl md:text-4xl lg:text-[32px] xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
              {heading.title}
            </h2>
          </div>

          {/* ---------- Accordion ---------- */}
          <div className={`${accordionAnim} border-b border-[#E4E4E4]`}>
            {values.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={`${item.title}-${i}`} className="border-t border-[#E4E4E4]">
                  <button
                    type="button"
                    id={`value-btn-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`value-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full cursor-pointer px-0 pb-0 pt-[21px] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5B96]"
                  >
                    <span className="block text-lg font-medium leading-[1.4] text-[#19191a] sm:text-xl sm:leading-[30px] 2xl:text-[clamp(20px,1.25vw,24px)]">
                      {item.title}
                    </span>
                  </button>

                  <div
                    id={`value-panel-${i}`}
                    role="region"
                    aria-labelledby={`value-btn-${i}`}
                    aria-hidden={!isOpen}
                    className={`grid transition-all duration-500 ease-in-out motion-reduce:transition-none ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-full pt-3 text-sm font-medium leading-[1.6] text-[#666666] sm:max-w-[88%] sm:pt-4 sm:text-[15px] sm:leading-[1.5] 2xl:text-[clamp(14px,0.784vw,15px)]">
                        {item.text}
                      </p>
                      <div className="h-[21px]" />
                    </div>
                  </div>

                  <div
                    className={`transition-all duration-500 ease-in-out motion-reduce:transition-none ${
                      isOpen ? "h-0" : "h-[21px]"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CoreValues;