"use client";
import PageBanner, { PageBannerSkeleton } from "@/components/services/Hero";
import api from "@/lib/axios";
import fallbackBannerImage from "@/public/images/contact.jpg";
import type { StaticImageData } from "next/image";
import { useEffect, useState } from "react";

// ================= API =================
const ENDPOINT = "/contact-page";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
const CURRENT_PAGE_HREF = "/contact"; 

type ApiHero = {
  title?: string;
  image?: string;
  imageAlt?: string;
  breadcrumbHome?: string;
  breadcrumbHomeLink?: string;
  breadcrumbCurrent?: string;
};

type ApiContactPage = { hero?: ApiHero };

type BannerData = {
  title: string;
  image: StaticImageData | string;
  breadcrumbs: { label: string; href: string }[];
};

const FALLBACK_BANNER: BannerData = {
  title: "Contact Us",
  image: fallbackBannerImage, 
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Contact", href: CURRENT_PAGE_HREF },
  ],
};

function resolveImage(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${IMAGE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function mapApiHero(
  data: ApiContactPage | ApiContactPage[] | null | undefined
): BannerData {
  const doc = Array.isArray(data) ? data[0] : data;
  const hero = doc?.hero;
  if (!hero) return FALLBACK_BANNER;

  return {
    title: hero.title || FALLBACK_BANNER.title,
    image: hero.image ? resolveImage(hero.image) : FALLBACK_BANNER.image,
    breadcrumbs: [
      {
        label: hero.breadcrumbHome || "Home",
        href: hero.breadcrumbHomeLink || "/",
      },
      {
        label: hero.breadcrumbCurrent || "Contact",
        href: CURRENT_PAGE_HREF,
      },
    ],
  };
}

function ContactBanner() {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiContactPage | ApiContactPage[]>(ENDPOINT);
        if (cancelled) return;
        setBanner(mapApiHero(res.data));
      } catch {
        if (!cancelled) setBanner(FALLBACK_BANNER);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !banner) return <PageBannerSkeleton />;

  return (
    <PageBanner
      title={banner.title}
      image={banner.image}
      breadcrumbs={banner.breadcrumbs}
    />
  );
}

export default ContactBanner;