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

type ApiGetInTouch = {
  subtitle?: string;
  title?: string;
  image?: string;
  imageAlt?: string;
  buttonText?: string;
  buttonLink?: string;
};

type ApiHomePage = { getInTouch?: ApiGetInTouch };

type CtaContent = {
  subtitle: string;
  title: string;
  image: string;
  imageAlt: string;
  buttonText: string;
  buttonLink: string;
};

const FALLBACK_CTA: CtaContent = {
  subtitle: "Himmat Contracting Company",
  title: "Delivering Excellence Beyond Every Expectation",
  image: "/images/home/calltoaction.jpg",
  imageAlt: "Construction site",
  buttonText: "Get In Touch",
  buttonLink: "/contact",
};

function resolveImage(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${IMAGE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function mapApiGetInTouch(
  data: ApiHomePage | ApiHomePage[] | null | undefined
): CtaContent {
  const doc = Array.isArray(data) ? data[0] : data;
  const gi = doc?.getInTouch;
  return {
    subtitle: gi?.subtitle || FALLBACK_CTA.subtitle,
    title: gi?.title || FALLBACK_CTA.title,
    image: gi?.image ? resolveImage(gi.image) : FALLBACK_CTA.image,
    imageAlt: gi?.imageAlt || FALLBACK_CTA.imageAlt,
    buttonText: gi?.buttonText || FALLBACK_CTA.buttonText,
    buttonLink: gi?.buttonLink || FALLBACK_CTA.buttonLink,
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

const SECTION = "relative w-full overflow-x-clip bg-black text-white";

const INNER =
  "relative mx-auto flex w-full max-w-[1920px] flex-col items-center px-4 py-16 text-center " +
  "sm:px-8 sm:py-24 lg:py-28 2xl:py-[118px]";

function CallToActionSkeleton() {
  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <div className="absolute inset-0 bg-[#1a1a1a]" />
      <div className="absolute inset-0 bg-black/55" />

      <div className={INNER}>
        {/* Subtitle bar */}
        <div className="h-5 w-48 animate-pulse rounded bg-white/20 sm:h-[22px] sm:w-56" />

        {/* Headline bars */}
        <div className="mt-5 w-full max-w-[18em] space-y-3 sm:mt-7">
          <div className="mx-auto h-8 w-full animate-pulse rounded bg-white/20 sm:h-12 xl:h-[52px]" />
          <div className="mx-auto h-8 w-[70%] animate-pulse rounded bg-white/20 sm:h-12 xl:h-[52px]" />
        </div>

        {/* Button */}
        <div className="mt-8 sm:mt-11">
          <div className="h-[46px] w-[148px] animate-pulse rounded bg-[#DAA732]/60 sm:h-[50px] sm:w-[160px]" />
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  const { ref, inView } = useInView<HTMLHeadingElement>();

  const [content, setContent] = useState<CtaContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiHomePage | ApiHomePage[]>(ENDPOINT);
        if (cancelled) return;
        setContent(mapApiGetInTouch(res.data));
      } catch {
        if (!cancelled) setContent(FALLBACK_CTA);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !content) return <CallToActionSkeleton />;

  return (
    <section className={`${manrope.className} ${SECTION}`}>
      {/* Background image + dark overlay */}
      {content.image && (
        <Image
          src={content.image}
          alt=""
          fill
          sizes="100vw"
          unoptimized
          className="object-cover"
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-black/55" />

      <div className={INNER}>
        {/* Static */}
        <p className="text-[15px] sm:text-lg 2xl:text-[clamp(17px,1vw,20px)]">
          {content.subtitle}
        </p>

        {/* Slide-in headline */}
        <h2
          ref={ref}
          className={`mt-5 max-w-[18em] text-[28px] font-medium leading-[1.2] tracking-[-0.02em] sm:mt-7 sm:text-4xl sm:leading-[1.16] md:text-5xl xl:text-[52px] 2xl:text-[clamp(48px,2.93vw,58px)]
                      transition-all duration-1000 ease-out
                      motion-reduce:!translate-x-0 motion-reduce:!opacity-100 motion-reduce:transition-none
                      ${
                        inView
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-10 opacity-0 sm:-translate-x-24"
                      }`}
        >
          {content.title}
        </h2>

        {/* Static button */}
        <div className="mt-8 sm:mt-11">
          <Link
            href={content.buttonLink}
            className="group inline-flex items-center gap-3 bg-[#DAA732] px-5 py-3 text-sm font-medium text-white
                       transition-colors duration-300 hover:bg-white hover:text-black
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white
                       sm:py-3.5 sm:text-base"
          >
            {content.buttonText}
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
      </div>
    </section>
  );
}

export default CallToAction;