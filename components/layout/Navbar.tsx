"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Manrope } from "next/font/google";
import LOGO from "../../public/images/logo.svg";
import LOGO_WHITE from "../../public/images/side-barlogo.svg";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    children: [
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
    ],
  },
  { label: "Company Profile", href: "/company-profile" },
  { label: "Clients", href: "/clients" },
  { label: "Contact", href: "/contact" },
];

const ABOUT_TEXT =
  "Founded in 2022 in the Kingdom of Saudi Arabia, Himmat has grown from a trusted provider of lifting equipment and accessories into a diversified company supporting industrial, infrastructure, and construction projects across the Kingdom.";

const CONTACT = {
  address: "#502, 5th Floor, Al Dana Tower, Opp. KIMS Hospital, Al Jubail 35514.",
  email: "info@himmat.com.sa",
  phones: ["+966 54 060 5978", "+966 54 926 2880"],
};

function Navbar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false); // mobile accordion

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

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
        className={`${manrope.className} fixed top-0 left-0 right-0 z-50 w-full border-t-[3px] border-t-[#3d2b1f] bg-white`}
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
          {/* Logo (image) */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src={LOGO}
              alt="Himmat"
              priority
              className="h-auto w-[85px] sm:w-[100px] md:w-[110px] lg:w-[120px] xl:w-[135px]"
              style={{ objectFit: "contain" }}
            />
          </Link>

          {/* Right group: links + dots, all pushed to the right */}
          <div className="flex items-center gap-8 xl:gap-14">
            {/* Desktop links (from lg) */}
            <ul className="hidden items-center gap-6 lg:flex xl:gap-12">
              {NAV_LINKS.map((link) => (
                <li key={link.label} className="group relative">
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

                  {/* Dropdown */}
                  {link.children && (
                    <div
                      className="invisible absolute left-0 top-full pt-6 opacity-0 transition-all duration-200
                                 group-hover:visible group-hover:opacity-100"
                    >
                      <ul className="w-max bg-white py-3 shadow-lg ring-1 ring-black/5">
                        {link.children.map((child) => (
                          <li key={child.label}>
                            <Link
                              href={child.href}
                              className="block px-5 py-1.5 text-base font-medium leading-6 text-black"
                            >
                              {/* Underline slides in from the left on hover */}
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

            {/* 9-dot button: opens sidebar on every screen size */}
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

      {/* ================= SIDEBAR ================= */}
      <aside
        aria-hidden={!sidebarOpen}
        className={`${manrope.className} fixed right-0 top-0 z-[70] h-full w-full overflow-y-auto bg-black text-white
                    transition-transform duration-300 ease-in-out
                    sm:w-[460px] lg:w-[530px]
                    ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex min-h-full flex-col px-8 pb-12 pt-10 sm:px-14 lg:px-20">
          {/* Close */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="group ml-auto flex h-10 w-10 items-center justify-center"
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

          {/* Logo (image) */}
          <Link href="/" className="mt-14 inline-block sm:mt-20">
            <Image
              src={LOGO_WHITE}
              alt="Himmat"
              className="h-auto w-[170px] sm:w-[200px]"
              style={{ objectFit: "contain" }}
            />
          </Link>

          {/* About text */}
          <p className="mt-9 text-base leading-[30px] sm:text-[17px]">{ABOUT_TEXT}</p>

          {/* Mobile / tablet only: nav links (desktop already has them in navbar) */}
          <ul className="mt-10 flex flex-col gap-5 border-t border-white/15 pt-8 lg:hidden">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                {link.children ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setServicesOpen((p) => !p)}
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
                          <li key={child.label}>
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

          {/* Contact */}
          <div className="mt-15 sm:mt-20">
            <h3 className="text-base font-semibold">Contact</h3>
            <address className="mt-6 max-w-[260px] text-base not-italic leading-[30px] sm:text-[17px]">
              {CONTACT.address}
            </address>
            <div className="mt-5 flex flex-col text-base leading-[30px] sm:text-[17px]">
              <a href={`mailto:${CONTACT.email}`} className="w-fit underline">
                {CONTACT.email}
              </a>
              {CONTACT.phones.map((p) => (
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