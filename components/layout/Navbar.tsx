"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Manrope } from "next/font/google";
import LOGO from "../../public/images/logo.svg";
import LOGO_WHITE from "../../public/images/side-barlogo.svg";
import api from "@/lib/axios";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// =====================================================================
// SERVICES API
// =====================================================================
const SERVICES_ENDPOINT = "/services";

type ApiService = {
  _id?: string;
  slug: string;
  hero?: { title?: string; image?: string };
  content?: { title?: string };
};

type ServiceChild = { label: string; href: string };

// Fallback — used until the API responds or if it fails
const FALLBACK_SERVICES: ServiceChild[] = [
  { label: "Equipment Rental", href: "/services/equipment-rental" },
  { label: "Manpower Supply", href: "/services/manpower-supply" },
  { label: "Engineering & Construction", href: "/services/engineering-construction" },
  { label: "Interior & Exterior Work", href: "/services/interior-exterior-work" },
  { label: "Gypsum Works", href: "/services/gypsum-works" },
  { label: "MEP Works", href: "/services/mep-works" },
  { label: "Painting & Putty Works", href: "/services/painting-putty-works" },
  { label: "Flooring Works", href: "/services/flooring-works" },
  { label: "Materials Trading & Manufacturing", href: "/services/materials-trading-manufacturing" },
  { label: "Transportation & Logistics", href: "/services/transportation-logistics" },
];

interface NavItem {
  label: string;
  href: string;
  target?: string;
  rel?: string;
  children?: ServiceChild[];
}

function buildNavLinks(services: ServiceChild[]): NavItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    {
      label: "Services",
      href: "",
      children: services,
    },
    {
      label: "Company Profile",
      href: "/profilepdf/profile.pdf",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    { label: "Clients", href: "/clients" },
    { label: "Contact", href: "/contact" },
  ];
}

function mapApiServices(
  data: ApiService[] | { services?: ApiService[] } | null | undefined
): ServiceChild[] {
  const list = Array.isArray(data) ? data : data?.services ?? [];
  return list
    .filter((s) => Boolean(s?.slug))
    .map((s) => ({
      label: s.hero?.title || s.content?.title || s.slug,
      href: `/services/${s.slug}`,
    }));
}

// =====================================================================
// SIDE PANEL API
// =====================================================================
// Use "/api/side-panel" if your axios baseURL does not already end with /api
const SIDE_PANEL_ENDPOINT = "/side-panel";

// Set only if the API's image paths are served from another host
// (e.g. NEXT_PUBLIC_ASSET_URL=https://api.himmat.com.sa).
// Leave empty if "/images/logo/himmat-white.svg" lives in this site's /public folder.
const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_URL ?? "";

type ApiSidePanel = {
  logo?: { image?: string; imageAlt?: string };
  about?: { description?: string };
  contact?: {
    title?: string;
    address?: string;
    email?: string;
    phoneNumbers?: string[];
  };
  isActive?: boolean;
};

type SidePanel = {
  logoSrc: StaticImageData | string;
  logoAlt: string;
  about: string;
  contactTitle: string;
  address: string;
  email: string;
  phones: string[];
};

// Fallback — identical to the previous hardcoded content
const FALLBACK_PANEL: SidePanel = {
  logoSrc: LOGO_WHITE,
  logoAlt: "Himmat",
  about:
    "Founded in 2022 in the Kingdom of Saudi Arabia, Himmat has grown from a trusted provider of lifting equipment and accessories into a diversified company supporting industrial, infrastructure, and construction projects across the Kingdom.",
  contactTitle: "Contact",
  address: "#502, 5th Floor, Al Dana Tower, Opp. KIMS Hospital, Al Jubail 35514.",
  email: "info@himmat.com.sa",
  phones: ["+966 54 060 5978", "+966 54 926 2880"],
};

const resolveAsset = (path?: string) => {
  if (!path) return undefined;
  return /^https?:\/\//i.test(path) ? path : `${ASSET_BASE}${path}`;
};

// Every field falls back individually, so a partial response never leaves a blank spot
function mapApiSidePanel(data: ApiSidePanel | null | undefined): SidePanel {
  if (!data) return FALLBACK_PANEL;
  return {
    logoSrc: resolveAsset(data.logo?.image) ?? FALLBACK_PANEL.logoSrc,
    logoAlt: data.logo?.imageAlt || FALLBACK_PANEL.logoAlt,
    about: data.about?.description || FALLBACK_PANEL.about,
    contactTitle: data.contact?.title || FALLBACK_PANEL.contactTitle,
    address: data.contact?.address || FALLBACK_PANEL.address,
    email: data.contact?.email || FALLBACK_PANEL.email,
    phones: data.contact?.phoneNumbers?.length
      ? data.contact.phoneNumbers
      : FALLBACK_PANEL.phones,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================
function Navbar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const [services, setServices] = useState<ServiceChild[]>(FALLBACK_SERVICES);
  const [panel, setPanel] = useState<SidePanel>(FALLBACK_PANEL);

  // ---- Services (API) ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiService[] | { services?: ApiService[] }>(SERVICES_ENDPOINT);
        if (cancelled) return;
        const mapped = mapApiServices(res.data);
        if (mapped.length) setServices(mapped);
      } catch {
        // keep fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Side panel (API) ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiSidePanel | { data?: ApiSidePanel }>(SIDE_PANEL_ENDPOINT);
        if (cancelled) return;
        const payload = (
          "data" in res.data && res.data.data ? res.data.data : res.data
        ) as ApiSidePanel;
        if (payload.isActive === false) return; // keep fallback if switched off
        setPanel(mapApiSidePanel(payload));
      } catch {
        // keep fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const NAV_LINKS = buildNavLinks(services);

  // Lock body scroll + close on ESC while sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSidebarOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [sidebarOpen]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav
        className={`${manrope.className} fixed left-0 right-0 top-0 z-50 w-full border-t-[3px] border-t-[#3d2b1f] bg-white`}
      >
        <div
          className="mx-auto flex w-full max-w-[1584px] items-center justify-between
                     min-h-[70px] px-4
                     sm:min-h-[80px] sm:px-6
                     md:min-h-[90px] md:px-8
                     lg:min-h-[105px] lg:px-10
                     xl:min-h-[125px] xl:px-12
                     2xl:px-0"
        >
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src={LOGO}
              alt="Himmat"
              priority
              className="h-auto w-[85px] sm:w-[100px] md:w-[110px] lg:w-[120px] xl:w-[135px]"
              style={{ objectFit: "contain" }}
            />
          </Link>

          <div className="flex items-center gap-4 sm:gap-8 xl:gap-14">
            {/* Desktop links */}
            <ul className="hidden items-center gap-6 lg:flex xl:gap-12">
              {NAV_LINKS.map((link) => (
                <li key={link.label} className="group relative">
                  {link.target ? (
                    <a
                      href={link.href}
                      target={link.target}
                      rel={link.rel}
                      className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-black xl:text-base"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-black xl:text-base"
                    >
                      {link.label}
                      {link.children && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="transition-transform duration-200 group-hover:rotate-180"
                        >
                          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </Link>
                  )}

                  {/* Dropdown — driven by API `services` */}
                  {link.children && (
                    <div
                      className="invisible absolute left-0 top-full pt-6 opacity-0 transition-all duration-200
                                 group-hover:visible group-hover:opacity-100"
                    >
                      <ul className="w-max bg-white py-3 shadow-lg ring-1 ring-black/5">
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block px-5 py-1.5 text-base font-medium leading-6 text-black"
                            >
                              <span
                                className="relative inline-block pb-0.5
                                           after:absolute after:bottom-0 after:left-0 after:h-px after:w-full
                                           after:origin-left after:scale-x-0 after:bg-black
                                           after:transition-transform after:duration-300 after:ease-out
                                           hover:after:scale-x-100"
                              >
                                {child.label}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* 9-dot button */}
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
              className="grid h-10 w-10 shrink-0 grid-cols-3 place-content-center gap-[5px] p-2"
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="h-[5px] w-[5px] rounded-full bg-black" />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* ================= OVERLAY ================= */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* ================= SIDEBAR (API driven) ================= */}
      <aside
        aria-hidden={!sidebarOpen}
        className={`${manrope.className} fixed right-0 top-0 z-[70] h-dvh w-full overflow-y-auto overscroll-contain bg-black text-white
                    transition-transform duration-300 ease-in-out
                    sm:w-[420px] md:w-[460px] lg:w-[530px]
                    ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex min-h-full flex-col px-6 pb-10 pt-6 sm:px-10 sm:pb-12 sm:pt-10 lg:px-16 xl:px-20">
          {/* Close */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="group ml-auto flex h-10 w-10 shrink-0 items-center justify-center"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              className="transition-transform duration-300 ease-out group-hover:rotate-45"
            >
              <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
            </svg>
          </button>

          {/* Logo (from API) */}
          <Link href="/" className="mt-8 inline-block sm:mt-14 lg:mt-20">
            <Image
              src={panel.logoSrc}
              alt={panel.logoAlt}
              width={200}
              height={70}
              unoptimized={typeof panel.logoSrc === "string"}
              className="h-auto w-[140px] sm:w-[170px] lg:w-[200px]"
              style={{ objectFit: "contain" }}
            />
          </Link>

          {/* About text (from API) */}
          <p className="mt-6 text-[15px] leading-[27px] sm:mt-9 sm:text-base sm:leading-[30px] lg:text-[17px]">
            {panel.about}
          </p>

          {/* Mobile / tablet nav links */}
          <ul className="mt-8 flex flex-col gap-4 border-t border-white/15 pt-6 sm:mt-10 sm:gap-5 sm:pt-8 lg:hidden">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                {link.children ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setServicesOpen((p) => !p)}
                      aria-expanded={servicesOpen}
                      className="flex w-full items-center justify-between text-base font-medium"
                      style={{ color: "#fff" }}
                    >
                      {link.label}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className={`transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                      >
                        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {servicesOpen && (
                      <ul className="mt-3 flex flex-col gap-3 pl-4">
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className="text-sm text-white/80"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : link.target ? (
                  <a
                    href={link.href}
                    target={link.target}
                    rel={link.rel}
                    onClick={() => setSidebarOpen(false)}
                    className="text-base font-medium"
                    style={{ color: "#fff" }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className="text-base font-medium"
                    style={{ color: "#fff" }}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Contact (from API) */}
          <div className="mt-10 sm:mt-14 lg:mt-20">
            <h3 className="text-base font-semibold">{panel.contactTitle}</h3>
            <address className="mt-4 max-w-[240px] text-[15px] not-italic leading-[27px] sm:mt-6 sm:text-base sm:leading-[30px] lg:text-[17px]">
              {panel.address}
            </address>
            <div className="mt-4 flex flex-col text-[15px] leading-[27px] sm:mt-5 sm:text-base sm:leading-[30px] lg:text-[17px]">
              <a href={`mailto:${panel.email}`} className="w-fit max-w-full break-all underline">
                {panel.email}
              </a>
              {panel.phones.map((p) => (
                <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="w-fit">
                  {p}
                </a>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Navbar;