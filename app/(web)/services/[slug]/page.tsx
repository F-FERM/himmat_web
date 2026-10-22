"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import PageBanner, { PageBannerSkeleton } from "@/components/services/Hero"; 
import ServiceDetail, { ServiceDetailSkeleton } from "@/components/services/ServiceDetail";
import GallerySlider from "@/components/services/GallerySlider"; 
import Expertise from "@/components/home/Expertise";
import CallToAction from "@/components/home/CalltoAction";
import WhyChooseUs from "@/components/home/WhyChooseUs";


const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

type ApiService = {
  slug?: string;
  hero?: {
    title?: string;
    image?: string;
    imageAlt?: string;
    breadcrumbHome?: string;
    breadcrumbHomeLink?: string;
    breadcrumbCurrent?: string;
  };
  content?: {
    title?: string;
    description?: string;
    images?: { url: string; alt?: string }[];
  };
};

type ServiceData = {
  slug: string;
  banner: {
    title: string;
    image: string;
    breadcrumbs: { label: string; href: string }[];
  };
  detail: { title: string; paragraphs: string[] };
  gallery: { src: string; alt: string }[];
};

function resolveImage(path?: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${IMAGE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function mapService(data: ApiService | ApiService[], fallbackSlug: string): ServiceData {
  const doc = Array.isArray(data) ? data[0] : data;
  const slug = doc?.slug || fallbackSlug;
  const hero = doc?.hero;
  const content = doc?.content;

  return {
    slug,
    banner: {
      title: hero?.title || content?.title || "Services",
      image: resolveImage(hero?.image),
      breadcrumbs: [
        { label: hero?.breadcrumbHome || "Home", href: hero?.breadcrumbHomeLink || "/" },
        { label: hero?.breadcrumbCurrent || "Services", href: `/services/${slug}` },
      ],
    },
    detail: {
      title: content?.title || hero?.title || "",
      paragraphs: (content?.description || "")
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean),
    },
    gallery: (content?.images || [])
      .filter((img) => img?.url)
      .map((img) => ({ src: resolveImage(img.url), alt: img.alt || content?.title || "Service image" })),
  };
}

export default function ServicePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const [data, setData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get<ApiService | ApiService[]>(`/services/${slug}`);
        if (cancelled) return;
        setData(mapService(res.data, slug));
      } catch {
        if (!cancelled) {
          setData(null);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <main>
        <PageBannerSkeleton />
        <ServiceDetailSkeleton />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <h1 className="text-2xl font-semibold text-[#195992] sm:text-3xl">Service not found</h1>
        <p className="mt-2 text-sm text-[#666666]">We couldn&apos;t load this service. Please try again later.</p>
      </main>
    );
  }

  return (
    <main>
      <PageBanner
        title={data.banner.title}
        image={data.banner.image}
        breadcrumbs={data.banner.breadcrumbs}
      />
      <ServiceDetail title={data.detail.title} paragraphs={data.detail.paragraphs} />
      {data.gallery.length > 0 && <GallerySlider key={data.slug} images={data.gallery} />}
      <Expertise />
      <CallToAction />
      <WhyChooseUs />
    </main>
  );
}