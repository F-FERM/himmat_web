"use client";
import api from "@/lib/axios";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";


const ENDPOINT = "/clients-page";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

type ApiClient = {
  _id?: string;
  name: string;
  logo: string;
  logoAlt?: string;
  link?: string;
  order?: number;
};

type ApiClientsPage = { clients?: ApiClient[] };

type Brand = { id: string; name: string; logo: string; logoAlt: string };

const SECONDS_PER_LOGO = 4;

const MIN_GROUP_WIDTH = 2400;
const MIN_CARD_WIDTH = 240;

function resolveImage(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${IMAGE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function mapApiBrands(
  data: ApiClientsPage | ApiClientsPage[] | null | undefined
): Brand[] {
  const doc = Array.isArray(data) ? data[0] : data;
  return [...(doc?.clients ?? [])]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((c) => Boolean(c.logo) && Boolean(c.name))
    .map((c, i) => ({
      id: c._id || `${c.name}-${i}`,
      name: c.name,
      logo: resolveImage(c.logo),
      logoAlt: c.logoAlt || c.name,
    }));
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

const CARD =
  "flex h-[140px] w-[240px] shrink-0 items-center justify-center border-r border-gray-200/70 px-8 " +
  "sm:h-[170px] sm:w-[300px] lg:h-[200px] lg:w-[350px] lg:px-10";

function BrandsSkeleton() {
  return (
    <section className="relative z-20 w-full overflow-visible bg-white" aria-busy="true">
      <div className="w-full overflow-hidden border-y border-gray-200/70">
        <div className="flex w-max">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={CARD}>
              <div className="h-[50px] w-[150px] max-w-full animate-pulse rounded bg-gray-200/70 sm:h-[60px] sm:w-[180px] lg:h-[70px]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Brands() {
  const { ref, inView } = useInView<HTMLElement>();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiClientsPage | ApiClientsPage[]>(ENDPOINT);
        if (cancelled) return;
        setBrands(mapApiBrands(res.data));
      } catch {
        if (!cancelled) setBrands([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  
  const group = useMemo(() => {
    if (!brands.length) return [];
    const copies = Math.max(1, Math.ceil(MIN_GROUP_WIDTH / (MIN_CARD_WIDTH * brands.length)));
    return Array.from({ length: copies }, (_, c) =>
      brands.map((b) => ({ ...b, key: `${b.id}-${c}` }))
    ).flat();
  }, [brands]);

  if (loading) return <BrandsSkeleton />;
  if (!brands.length) return null;

  const duration = group.length * SECONDS_PER_LOGO;

  return (
    
    <section
      ref={ref}
      className="relative z-20 w-full overflow-visible bg-white"
      aria-label="Our clients"
    >
      <style>{`
        /* animate.css fadeInUp: from one full element-height lower + transparent, to place */
        @keyframes brandsFadeInUp {
          from { opacity: 0; transform: translate3d(0, 100%, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .brands-fade-in-up {
          visibility: visible;
          animation-name: brandsFadeInUp;
          animation-duration: 1s;
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        .brands-hidden { visibility: hidden; }

        /* Constant-speed marquee (linear, no easing, endless) */
        @keyframes brands-marquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .brands-track {
          animation-name: brands-marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .brands-fade-in-up { animation: none; opacity: 1; transform: none; }
          .brands-track { animation: none; }
        }
      `}</style>

      <div className={`bg-white ${inView ? "brands-fade-in-up" : "brands-hidden"}`}>
        <div className="relative w-full overflow-hidden border-y border-gray-200/70">
          <div
            className="brands-track flex w-max"
            style={{ animationDuration: `${duration}s` }}
          >
            {[0, 1].flatMap((copy) =>
              group.map((brand) => (
                <div
                  key={`${brand.key}-${copy}`}
                  className={CARD}
                  aria-hidden={copy === 1 || !brand.key.endsWith("-0") ? true : undefined}
                >
                  <Image
                    src={brand.logo}
                    alt={copy === 0 && brand.key.endsWith("-0") ? brand.logoAlt : ""}
                    width={220}
                    height={110}
                    unoptimized
                    className="h-auto max-h-[70px] w-auto max-w-full object-contain sm:max-h-[85px] lg:max-h-[100px]"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Brands;