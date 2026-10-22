"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { Manrope } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/axios";
import footerBg from "../../public/images/home/footer-bg.jpg"; // change to your wave background image
import ScrollToTop from "@/components/ui/ScrollToTop";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// ================= API =================
// ⚠️ Adjust if your axios baseURL does not already include "/api"
const ENDPOINT = "/footer";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

type ApiLink = {
  _id?: string;
  label: string;
  url: string;
  openInNewTab?: boolean;
  order?: number;
};

type ApiColumn = {
  _id?: string;
  title: string;
  links?: ApiLink[];
  order?: number;
};

type ApiSocial = { platform: string; url: string; icon?: string };

type ApiFooter = {
  contactInfo?: {
    title?: string;
    address?: string;
    email?: string;
    phoneNumbers?: string[];
  };
  linkColumns?: ApiColumn[];
  bottomBar?: {
    copyrightText?: string;
    socialLinks?: ApiSocial[];
  };
};

type FooterLink = { label: string; href: string; newTab: boolean };
type FooterColumn = { title: string; links: FooterLink[] };
type FooterSocial = { platform: string; url: string; icon: string };

type FooterData = {
  contact: { title: string; address: string; email: string; phones: string[] };
  columns: FooterColumn[];
  copyright: string;
  socials: FooterSocial[];
};

// Fallback (identical to your previous hard-coded footer)
const FALLBACK_FOOTER: FooterData = {
  contact: {
    title: "Get In Touch",
    address: "#502, 5th Floor, Al Dana Tower, Opp. KIMS Hospital, Al Jubail 35514.",
    email: "info@himmat.com.sa",
    phones: ["+966 54 060 5978", "+966 54 926 2880"],
  },
  columns: [
    {
      title: "Quick Links",
      links: [
        { label: "Home", href: "/", newTab: false },
        { label: "About us", href: "/about", newTab: false },
        { label: "Company Profile", href: "/profilepdf/profile.pdf", newTab: true },
        { label: "Clients", href: "/clients", newTab: false },
        { label: "Contact", href: "/contact", newTab: false },
      ],
    },
    {
      title: "Services",
      links: [
        { label: "Equipment Rental", href: "/services/equipment-rental", newTab: false },
        { label: "Manpower Supply", href: "/services/manpower-supply", newTab: false },
        { label: "Engineering & Construction", href: "/services/engineering-construction", newTab: false },
        { label: "Interior & Exterior Work", href: "/services/interior-exterior-work", newTab: false },
        { label: "Gypsum Works", href: "/services/gypsum-works", newTab: false },
        { label: "MEP Works", href: "/services/mep-works", newTab: false },
        { label: "Painting & Putty Works", href: "/services/painting-putty-works", newTab: false },
        { label: "Flooring Works", href: "/services/flooring-works", newTab: false },
        { label: "Materials Trading & Manufacturing", href: "/services/materials-trading-manufacturing", newTab: false },
        { label: "Transportation & Logistics", href: "/services/transportation-logistics", newTab: false },
      ],
    },
  ],
  copyright: "© 2026 Himmat Contracting Company. All rights reserved.",
  socials: [
    { platform: "facebook", url: "#", icon: "" },
    { platform: "linkedin", url: "#", icon: "" },
    { platform: "instagram", url: "#", icon: "" },
  ],
};

function resolveImage(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${IMAGE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function mapLink(l: ApiLink): FooterLink {
  const url = (l.url || "").trim() || "/";
  const isAbsolute = /^https?:\/\//i.test(url);
  const isPdf = /\.pdf($|\?)/i.test(url);
  return {
    label: l.label,
    href: isAbsolute || url.startsWith("/") || url.startsWith("#") ? url : `/${url}`,
    newTab: Boolean(l.openInNewTab) || isAbsolute || isPdf,
  };
}

function mapApiFooter(data: ApiFooter | ApiFooter[] | null | undefined): FooterData {
  const doc = Array.isArray(data) ? data[0] : data;
  if (!doc) return FALLBACK_FOOTER;

  const ci = doc.contactInfo;
  const phones = (ci?.phoneNumbers ?? []).filter(Boolean);

  const columns: FooterColumn[] = [...(doc.linkColumns ?? [])]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((col) => ({
      title: col.title,
      links: [...(col.links ?? [])]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .filter((l) => Boolean(l.label))
        .map(mapLink),
    }))
    .filter((col) => col.title && col.links.length);

  const socials: FooterSocial[] = (doc.bottomBar?.socialLinks ?? [])
    .filter((s) => Boolean(s.url) && Boolean(s.platform))
    .map((s) => ({
      platform: s.platform.toLowerCase(),
      url: s.url,
      icon: s.icon ? resolveImage(s.icon) : "",
    }));

  return {
    contact: {
      title: ci?.title || FALLBACK_FOOTER.contact.title,
      address: ci?.address || FALLBACK_FOOTER.contact.address,
      email: ci?.email || FALLBACK_FOOTER.contact.email,
      phones: phones.length ? phones : FALLBACK_FOOTER.contact.phones,
    },
    columns: columns.length ? columns : FALLBACK_FOOTER.columns,
    copyright: doc.bottomBar?.copyrightText || FALLBACK_FOOTER.copyright,
    socials: socials.length ? socials : FALLBACK_FOOTER.socials,
  };
}

/** Splits a list into two balanced halves (used for long link columns). */
function splitInTwo<T>(items: T[]): [T[], T[]] {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

/**
 * Flips to true once the element scrolls into view (runs once).
 * Callback ref (state) => the observer attaches when the element actually
 * mounts (after the skeleton), which fixes the "stays hidden after loading" bug.
 */
function useInView<T extends HTMLElement>(
  rootMargin = "0px 0px -40px 0px",
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

// ---------- Shared responsive classes (skeleton + real footer match) ----------
const FOOTER_BASE = "relative z-0 w-full overflow-hidden bg-[#1B5287] text-white";

const COLUMNS_WRAP =
  "px-4 pb-10 pt-10 sm:px-8 sm:pb-14 sm:pt-14 lg:px-12 lg:pb-16 lg:pt-16 xl:px-20 2xl:px-[15%]";

const COLUMNS_GRID =
  "grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-8";

const BAR_INNER =
  "flex flex-col items-center gap-5 px-4 py-6 pb-24 text-center " +
  "sm:px-8 md:flex-row md:justify-between md:pb-6 md:text-left " +
  "lg:px-12 lg:pr-28 xl:px-20 xl:pr-32 2xl:px-[15%] 2xl:pr-[16%]";

// Hover = underline only (no text color change).
const underlineHover =
  "hover:underline decoration-1 underline-offset-4 hover:decoration-[#DAA732] focus-visible:underline";

const linkClass = `inline-block text-sm leading-[22px] text-white/95 ${underlineHover} sm:text-[15px]`;

// ---------- Social icons (inline, so they keep the white/gold design) ----------
const SOCIAL_PATHS: Record<string, { label: string; d: string }> = {
  facebook: {
    label: "Facebook",
    d: "M14 8V6.5c0-.8.3-1.2 1.3-1.2H17V2h-2.5C11.7 2 10.5 3.6 10.5 6v2H8v3.2h2.5V22H14V11.2h2.7L17 8h-3Z",
  },
  linkedin: {
    label: "LinkedIn",
    d: "M4.5 9h3.6v11H4.5V9Zm1.8-5.5a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2ZM10 9h3.4v1.5h.1c.5-.9 1.7-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.4V20h-3.6v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.700V20H10V9Z",
  },
  instagram: {
    label: "Instagram",
    d: "M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.900A3.100 3.100 0 1 1 12 8.900a3.100 3.100 0 0 1 0 6.200ZM17.200 6a1.100 1.100 0 1 0 0 2.200 1.100 1.100 0 0 0 0-2.200ZM12 3.800c2.500 0 2.800 0 3.800.1 2.600.1 3.800 1.300 3.900 3.900.1 1 .1 1.300.1 3.800s0 2.800-.1 3.800c-.1 2.600-1.300 3.800-3.900 3.900-1 .1-1.300.1-3.800.1s-2.800 0-3.800-.1c-2.600-.1-3.800-1.300-3.900-3.900-.1-1-.1-1.300-.1-3.800s0-2.800.1-3.800C4.400 5.200 5.600 4 8.200 3.900c1-.1 1.300-.1 3.800-.1ZM12 2.100c-2.500 0-2.900 0-3.900.1C4.700 2.300 2.300 4.700 2.200 8.100c-.1 1-.1 1.400-.1 3.900s0 2.900.1 3.900c.1 3.400 2.500 5.800 5.900 5.900 1 .1 1.400.1 3.900.1s2.900 0 3.900-.1c3.400-.1 5.800-2.500 5.900-5.900.1-1 .1-1.400.1-3.900s0-2.900-.1-3.900c-.1-3.400-2.500-5.800-5.900-5.900-1-.1-1.400-.1-3.900-.1Z",
  },
};

function SocialLink({ social }: { social: FooterSocial }) {
  const known = SOCIAL_PATHS[social.platform];
  const label = known?.label ?? social.platform;

  // Unknown platform with no icon from the API => nothing sensible to show
  if (!known && !social.icon) return null;

  return (
    <a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#E0A82E] transition-transform duration-300
                 hover:bg-[#DAA732] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white
                 sm:h-[46px] sm:w-[46px]"
    >
      {known ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={known.d} />
        </svg>
      ) : (
        // Fallback: icon file from the API for platforms we don't have an inline icon for
        <Image
          src={social.icon}
          alt=""
          width={20}
          height={20}
          unoptimized
          className="h-5 w-5 object-contain"
          aria-hidden="true"
        />
      )}
    </a>
  );
}

function FooterLinkItem({ link }: { link: FooterLink }) {
  if (link.newTab) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={linkClass}>
      {link.label}
    </Link>
  );
}

function FooterSkeleton() {
  return (
    <footer className={`${manrope.className} ${FOOTER_BASE}`} aria-busy="true">
      <Image src={footerBg} alt="" fill sizes="100vw" className="object-cover" aria-hidden="true" />
      <div className="absolute inset-0 bg-[#1B5287]/70" />

      <div className="relative mx-auto w-full max-w-[1920px]">
        <div className={COLUMNS_WRAP}>
          <div className={COLUMNS_GRID}>
            {/* Contact skeleton */}
            <div>
              <div className="h-6 w-36 animate-pulse rounded bg-white/25" />
              <div className="mt-4 space-y-2">
                <div className="h-3.5 w-full max-w-[22rem] animate-pulse rounded bg-white/20" />
                <div className="h-3.5 w-[70%] animate-pulse rounded bg-white/20" />
              </div>
              <div className="mt-5 space-y-2.5">
                <div className="h-5 w-44 animate-pulse rounded bg-white/20" />
                <div className="h-5 w-40 animate-pulse rounded bg-white/20" />
                <div className="h-5 w-40 animate-pulse rounded bg-white/20" />
              </div>
            </div>

            {/* Quick links skeleton */}
            <div>
              <div className="h-6 w-28 animate-pulse rounded bg-white/25" />
              <div className="mt-4 space-y-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 w-32 animate-pulse rounded bg-white/20" />
                ))}
              </div>
            </div>

            {/* Services skeleton */}
            <div className="sm:col-span-2">
              <div className="h-6 w-24 animate-pulse rounded bg-white/25" />
              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-4 animate-pulse rounded bg-white/20 ${i % 2 ? "w-44" : "w-52"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/60">
          <div className={BAR_INNER}>
            <div className="h-4 w-64 max-w-full animate-pulse rounded bg-white/20" />
            <div className="flex gap-3 sm:gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 w-10 animate-pulse rounded-full bg-white/30 sm:h-[46px] sm:w-[46px]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Footer() {
  // Observe the STATIC footer so the trigger never depends on a moving element
  const { ref, inView } = useInView<HTMLElement>();

  const [data, setData] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiFooter | ApiFooter[]>(ENDPOINT);
        if (cancelled) return;
        setData(mapApiFooter(res.data));
      } catch {
        if (!cancelled) setData(FALLBACK_FOOTER);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !data) return <FooterSkeleton />;

  const { contact, columns, copyright, socials } = data;

  // WhatsApp uses the last phone number (same as before: the second number)
  const waNumber = "https://api.whatsapp.com/send?phone=966549262880";

  // Bottom -> top reveal. The footer has overflow-hidden, so nothing can spill over the section above.
  const rise =
    "transition-all duration-700 ease-out motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none";
  const hidden = "translate-y-10 opacity-0";
  const shown = "translate-y-0 opacity-100";
  const delay = (ms: number) => ({ transitionDelay: inView ? `${ms}ms` : "0ms" });
  const state = inView ? shown : hidden;

  return (
    <>
      <footer ref={ref} className={`${manrope.className} ${FOOTER_BASE}`}>
        {/* Background image + tint */}
        <Image src={footerBg} alt="" fill sizes="100vw" className="object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-[#1B5287]/70" />

        <div className="relative mx-auto w-full max-w-[1920px]">
          {/* Columns */}
          <div className={COLUMNS_WRAP}>
            <div className={COLUMNS_GRID}>
              {/* Get In Touch */}
              <div className={`${rise} ${state}`} style={delay(0)}>
                <h3 className="text-xl font-medium sm:text-[22px]">{contact.title}</h3>
                <p className="mt-3 max-w-[22rem] text-sm leading-relaxed sm:text-[15px]">
                  {contact.address}
                </p>
                <ul className="mt-4 text-base leading-7 sm:text-[18px]">
                  <li>
                    <a
                      href={`mailto:${contact.email}`}
                      className={`break-all ${underlineHover}`}
                    >
                      {contact.email}
                    </a>
                  </li>
                  {contact.phones.map((p) => (
                    <li key={p}>
                      <a href={`tel:${p.replace(/[^\d+]/g, "")}`} className={underlineHover}>
                        {p}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Link columns from the API (long lists become two side-by-side lists) */}
              {columns.map((col, i) => {
                const isLong = col.links.length > 6;
                const [left, right] = isLong ? splitInTwo(col.links) : [col.links, []];

                return (
                  <div
                    key={`${col.title}-${i}`}
                    className={`${rise} ${state} ${isLong ? "sm:col-span-2" : ""}`}
                    style={delay(120 * (i + 1))}
                  >
                    <h3 className="text-xl font-medium sm:text-[22px]">{col.title}</h3>

                    {isLong ? (
                      <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                        {[left, right].map((list, n) => (
                          <ul key={n} className="space-y-2">
                            {list.map((l) => (
                              <li key={`${l.label}-${l.href}`}>
                                <FooterLinkItem link={l} />
                              </li>
                            ))}
                          </ul>
                        ))}
                      </div>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {left.map((l) => (
                          <li key={`${l.label}-${l.href}`}>
                            <FooterLinkItem link={l} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom bar */}
          <div className={`${rise} ${state} border-t border-white/60`} style={delay(360)}>
            <div className={BAR_INNER}>
              <p className="text-xs sm:text-sm">{copyright}</p>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {socials.map((s) => (
                  <SocialLink key={`${s.platform}-${s.url}`} social={s} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating buttons (outside the footer so overflow-hidden never affects them) */}
      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-center gap-3 sm:right-6">
        {waNumber && (
          <a
            href={waNumber}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-110 sm:h-12 sm:w-12"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.600 15.100L2 22l5-1.300A10 10 0 1 0 12 2Zm0 18.200a8.200 8.200 0 0 1-4.200-1.200l-.3-.2-3 .8.8-2.900-.2-.3A8.200 8.200 0 1 1 12 20.200Zm4.500-6.100c-.2-.1-1.500-.7-1.700-.8-.2-.1-.4-.1-.6.100l-.8 1c-.1.200-.3.200-.5.100a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.200-.4.700-1.300.1-.2 0-.3 0-.5l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.100-.7.300-.2.300-.9.900-.9 2.200s.9 2.500 1 2.700c.1.200 1.800 2.800 4.400 3.900 1.600.7 2.300.8 3.100.7.500-.1 1.500-.6 1.700-1.200.2-.6.2-1.100.2-1.200-.1-.1-.3-.2-.5-.3Z" />
            </svg>
          </a>
        )}

        <ScrollToTop />
      </div>
    </>
  );
}

export default Footer;