"use client";
import api from "@/lib/axios";
import { Manrope } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// ================= API =================
const ENDPOINT = "/home-page";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

type ApiInlineLink = {
  text: string;
  url: string;
  type: string;
  openInNewTab: boolean;
  position: number;
};

type ApiMissionVision = {
  tagline?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  buttonText?: string;
  buttonLink?: string;
  visionTitle?: string;
  visionDescription?: string;
  missionTitle?: string;
  missionDescription?: string;
  inlineLinks?: ApiInlineLink[];
};

type ApiHomePage = { missionVision?: ApiMissionVision };

type Content = {
  label: string;
  title: string;
  paragraphs: string[];
  image: string;
  imageAlt: string;
  href: string;
  buttonText: string;
  vision: { title: string; text: string };
  mission: { title: string; text: string };
};

const FALLBACK_CONTENT: Content = {
  label: "Himmat Contracting Company",
  title: "Turning Every Challenge Into A Solution That Works",
  paragraphs: [
    "Every project brings different requirements, timelines, and challenges. Our approach is built around understanding these needs and providing practical solutions backed by skilled people, reliable resources, and responsible execution. From construction and engineering to manpower, equipment, materials, and logistics, we work to keep every project moving in the right direction.",
    "We are committed to maintaining high standards of quality, safety, and efficiency in every service we provide. By combining industry expertise with careful planning and seamless coordination, we deliver dependable solutions that support projects from start to finish. Our focus on reliability, timely execution, and customer satisfaction enables us to build lasting partnerships while contributing to the successful completion of projects across diverse industries.",
  ],
  image: "/images/home/home-about.jpg",
  imageAlt: "Himmat team on site",
  href: "/about",
  buttonText: "Know More",
  vision: {
    title: "Our Vision",
    text: "To grow as a trusted and capable service provider known for quality work, dependable support, and lasting value across every project we undertake.",
  },
  mission: {
    title: "Our Mission",
    text: "To meet our clients' project needs with skilled teams, reliable resources, and well-managed services while maintaining quality, safety, timely execution, and strong working relationships.",
  },
};

function resolveImage(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${IMAGE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function toParagraphs(description: string): string[] {
  if (!description) return [];
  return description
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function mapApiToContent(
  data: ApiHomePage | ApiHomePage[] | null | undefined
): Content | null {
  const doc = Array.isArray(data) ? data[0] : data;
  const mv = doc?.missionVision;
  if (!mv) return null;

  const paragraphs = toParagraphs(mv.description || "");
  if (!paragraphs.length && !mv.title) return null;

  return {
    label: mv.tagline || FALLBACK_CONTENT.label,
    title: mv.title || FALLBACK_CONTENT.title,
    paragraphs: paragraphs.length ? paragraphs : FALLBACK_CONTENT.paragraphs,
    image: mv.image ? resolveImage(mv.image) : FALLBACK_CONTENT.image,
    imageAlt: mv.imageAlt || FALLBACK_CONTENT.imageAlt,
    href: mv.buttonLink || FALLBACK_CONTENT.href,
    buttonText: mv.buttonText || FALLBACK_CONTENT.buttonText,
    vision: {
      title: mv.visionTitle || FALLBACK_CONTENT.vision.title,
      text: mv.visionDescription || FALLBACK_CONTENT.vision.text,
    },
    mission: {
      title: mv.missionTitle || FALLBACK_CONTENT.mission.title,
      text: mv.missionDescription || FALLBACK_CONTENT.mission.text,
    },
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
  "w-full overflow-x-clip bg-white py-10 sm:py-14 lg:py-20 2xl:pb-24 2xl:pt-[68px]";

const GRID =
  "mx-auto grid w-full max-w-[1920px] grid-cols-1 px-4 sm:px-8 lg:grid-cols-[45%_1fr] lg:gap-x-10 lg:px-12 " +
  "xl:grid-cols-[46%_1fr] xl:gap-x-14 " +
  "2xl:ml-[6.2%] 2xl:w-[78.8%] 2xl:max-w-[1509px] 2xl:grid-cols-[47%_53%] 2xl:gap-x-0 2xl:px-0";

const IMAGE_WRAP = "relative lg:min-h-[420px] xl:min-h-[480px] 2xl:min-h-0";

const IMAGE_BOX =
  "relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] " +
  "lg:absolute lg:inset-0 lg:aspect-auto " +
  "2xl:static 2xl:aspect-[710/714]";

const TEXT_WRAP =
  "mt-8 flex flex-col justify-center lg:mt-0 lg:py-4 " +
  "2xl:justify-start 2xl:pb-[21.75%] 2xl:pl-[12%] 2xl:pt-[13%] 2xl:py-0";

const BOX_WRAP =
  "relative z-10 mt-8 sm:mt-10 lg:col-span-2 " +
  "xl:ml-[30%] xl:w-[70%] xl:-mt-12 " +
  "2xl:ml-[33.8%] 2xl:-mt-[7.7%] 2xl:w-[66.2%]";

const BOX_GRID =
  "grid grid-cols-1 items-center gap-y-6 px-5 py-8 " +
  "sm:grid-cols-[1fr_auto_1fr] sm:gap-y-0 sm:px-8 sm:py-10 " +
  "lg:px-11 2xl:py-12";

function AboutSkeleton() {
  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <div className={GRID}>
        {/* Image skeleton */}
        <div className={IMAGE_WRAP}>
          <div className={`${IMAGE_BOX} animate-pulse bg-[#E9EEF4]`} />
        </div>

        {/* Text skeleton */}
        <div className={TEXT_WRAP}>
          <div className="h-4 w-40 animate-pulse rounded bg-[#E9EEF4]" />
          <div className="mt-3 space-y-2.5">
            <div className="h-7 w-[85%] animate-pulse rounded bg-[#E9EEF4] sm:h-9 xl:h-10" />
            <div className="h-7 w-[60%] animate-pulse rounded bg-[#E9EEF4] sm:h-9 xl:h-10" />
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-3.5 w-full animate-pulse rounded bg-[#E9EEF4]" />
            <div className="h-3.5 w-full animate-pulse rounded bg-[#E9EEF4]" />
            <div className="h-3.5 w-[92%] animate-pulse rounded bg-[#E9EEF4]" />
            <div className="h-3.5 w-full animate-pulse rounded bg-[#E9EEF4]" />
            <div className="h-3.5 w-[80%] animate-pulse rounded bg-[#E9EEF4]" />
          </div>
          <div className="mt-8 h-11 w-36 animate-pulse rounded bg-[#E9EEF4] sm:mt-9" />
        </div>

        {/* Vision / Mission skeleton */}
        <div className={BOX_WRAP}>
          <div className="bg-[#1B5B96]/90">
            <div className={BOX_GRID}>
              <div className="sm:pr-8 2xl:pr-10">
                <div className="h-5 w-28 animate-pulse rounded bg-white/25" />
                <div className="mt-4 space-y-2">
                  <div className="h-3.5 w-full animate-pulse rounded bg-white/20" />
                  <div className="h-3.5 w-[90%] animate-pulse rounded bg-white/20" />
                  <div className="h-3.5 w-[70%] animate-pulse rounded bg-white/20" />
                </div>
              </div>
              <span
                className="h-px w-full bg-[#C9A03A]/60 sm:h-24 sm:w-px"
                aria-hidden="true"
              />
              <div className="sm:pl-8 xl:pl-14 2xl:pl-[107px]">
                <div className="h-5 w-28 animate-pulse rounded bg-white/25" />
                <div className="mt-4 space-y-2">
                  <div className="h-3.5 w-full animate-pulse rounded bg-white/20" />
                  <div className="h-3.5 w-[90%] animate-pulse rounded bg-white/20" />
                  <div className="h-3.5 w-[70%] animate-pulse rounded bg-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const { ref: boxRef, inView: boxInView } = useInView<HTMLDivElement>();

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiHomePage | ApiHomePage[]>(ENDPOINT);
        if (cancelled) return;
        setContent(mapApiToContent(res.data) ?? FALLBACK_CONTENT);
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

  if (loading) return <AboutSkeleton />;
  const c = content ?? FALLBACK_CONTENT;

  const base =
    "transition-all duration-[1400ms] ease-out motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none";
  const boxFromBottom = boxInView
    ? "translate-y-0 opacity-100"
    : "translate-y-16 opacity-0 sm:translate-y-32";

  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <style>{`
        @keyframes about-img-anim-top {
          0%   { transform: translate3d(0, -5%, 0); clip-path: inset(0 0 100% 0); }
          100% { transform: translate3d(0, 0, 0);   clip-path: inset(0 0 0 0); }
        }
        .about-img-hidden { clip-path: inset(0 0 100% 0); }
        .about-img-reveal {
          animation: 1.3s cubic-bezier(0.645, 0.045, 0.355, 1) 0s 1 normal forwards running about-img-anim-top;
        }
        @keyframes about-fade-in-up {
          from { opacity: 0; transform: translate3d(0, 60px, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .about-text-hidden { visibility: hidden; }
        .about-fade-in-up {
          visibility: visible;
          animation-name: about-fade-in-up;
          animation-duration: 1s;
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        @media (prefers-reduced-motion: reduce) {
          .about-img-hidden, .about-img-reveal { animation: none; clip-path: none; transform: none; }
          .about-text-hidden { visibility: visible; }
          .about-fade-in-up { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      <div ref={ref} className={GRID}>
        {/* ---------- Image ---------- */}
        <div className={IMAGE_WRAP}>
          <div className={`${IMAGE_BOX} ${inView ? "about-img-reveal" : "about-img-hidden"}`}>
            {c.image && (
              <Image
                src={c.image}
                alt={c.imageAlt}
                fill
                sizes="(min-width: 1536px) 40vw, (min-width: 1024px) 45vw, 100vw"
                unoptimized
                priority
                className="object-cover"
              />
            )}
          </div>
        </div>

        {/* ---------- Text ---------- */}
        <div className={`${inView ? "about-fade-in-up" : "about-text-hidden"} ${TEXT_WRAP}`}>
          <p className="text-[15px] font-medium text-[#DAA732] sm:text-base lg:text-[17px] 2xl:text-[clamp(15px,0.89vw,17px)]">
            {c.label}
          </p>

          <h2 className="mt-2.5 text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#195992] sm:text-3xl md:text-4xl lg:text-[32px] xl:text-[38px] 2xl:text-[clamp(30px,2vw,38px)]">
            {c.title}
          </h2>

          <div className="mt-5 flex flex-col gap-3.5 text-sm leading-[1.6] text-[#555] sm:mt-6 sm:text-[15px] sm:leading-[1.5] 2xl:text-[clamp(14px,0.784vw,15px)]">
            {c.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <Link
            href={c.href}
            className="group mt-7 inline-flex w-fit items-center gap-3 bg-[#DAA732] px-5 py-3 text-sm font-medium text-white
                       transition-colors duration-300 hover:bg-[#1a1a1a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5B96]
                       sm:mt-9 sm:py-3.5 sm:text-base"
          >
            {c.buttonText}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            >
              <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* ---------- Vision / Mission box ---------- */}
        <div ref={boxRef} className={BOX_WRAP}>
          <div className={`${base} ${boxFromBottom} bg-[#1B5B96] text-white`}>
            <div className={BOX_GRID}>
              <div className="sm:pr-8 2xl:pr-10">
                <h3 className="text-lg font-medium sm:text-xl md:text-[22px]">
                  {c.vision.title}
                </h3>
                <p className="mt-3 max-w-[420px] text-sm leading-[1.6] sm:mt-4 sm:text-[15px] sm:leading-[1.5]">
                  {c.vision.text}
                </p>
              </div>

              <span
                className="h-px w-full bg-[#C9A03A] sm:h-24 sm:w-px"
                aria-hidden="true"
              />

              <div className="sm:pl-8 xl:pl-14 2xl:pl-[107px]">
                <h3 className="text-lg font-medium sm:text-xl md:text-[22px]">
                  {c.mission.title}
                </h3>
                <p className="mt-3 max-w-[420px] text-sm leading-[1.6] sm:mt-4 sm:text-[15px] sm:leading-[1.5]">
                  {c.mission.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;