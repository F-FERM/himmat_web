"use client";
import { useEffect, useRef, useState } from "react";
import { Manrope } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import footerBg from "../../public/images/home/footer-bg.jpg"; // change to your wave background image

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  { label: "Company Profile", href: "/company-profile" },
  { label: "Clients", href: "/clients" },
  { label: "Contact", href: "/contact" },
];

const servicesLeft = [
  { label: "Equipment Rental", href: "/services/equipment-rental" },
  { label: "Manpower Supply", href: "/services/manpower-supply" },
  { label: "Engineering & Construction", href: "/services/engineering-construction" },
  { label: "Interior & Exterior Work", href: "/services/interior-exterior-work" },
  { label: "Gypsum Works", href: "/services/gypsum-works" },
];

const servicesRight = [
  { label: "MEP Works", href: "/services/mep-works" },
  { label: "Painting & Putty Works", href: "/services/painting-putty-works" },
  { label: "Flooring Works", href: "/services/flooring-works" },
  { label: "Materials Trading & Manufacturing", href: "/services/materials-trading-manufacturing" },
  { label: "Transportation & Logistics", href: "/services/transportation-logistics" },
];

/** Flips to true once the element scrolls into view (runs once). */
function useInView<T extends HTMLElement>(rootMargin = "0px 0px -40px 0px", threshold = 0.1) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
  }, [rootMargin, threshold]);

  return { ref, inView };
}

// Hover = underline only (no text color change).
// Fixed 22px line height + space-y-2 (8px) = 30px between rows, same as the design.
const underlineHover = "hover:underline decoration-1 underline-offset-4 hover:decoration-[#DAA732]";

const linkClass = `inline-block text-sm leading-[22px] text-white/95 ${underlineHover} sm:text-[15px]`;

function Footer() {
  // Observe the STATIC footer so the trigger never depends on a moving element
  const { ref, inView } = useInView<HTMLElement>();

  // Bottom -> top reveal. The footer has overflow-hidden, so nothing can spill over the section above.
  const rise =
    "transition-all duration-700 ease-out motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none";
  const hidden = "translate-y-10 opacity-0";
  const shown = "translate-y-0 opacity-100";
  const delay = (ms: number) => ({ transitionDelay: inView ? `${ms}ms` : "0ms" });
  const state = inView ? shown : hidden;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <footer
        ref={ref}
        className={`${manrope.className} relative z-0 w-full overflow-hidden bg-[#1B5287] text-white`}
      >
        {/* Background image + tint */}
        <Image src={footerBg} alt="" fill sizes="100vw" className="object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-[#1B5287]/70" />

        <div className="relative mx-auto w-full max-w-[1920px]">
          {/* Columns */}
          <div className="px-5 pb-12 pt-12 sm:px-8 sm:pb-14 sm:pt-14 lg:px-12 lg:pb-16 lg:pt-16 xl:px-20 2xl:px-[15%]">
            <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
              {/* Get In Touch */}
              <div className={`${rise} ${state}`} style={delay(0)}>
                <h3 className="text-xl font-medium sm:text-[22px]">Get In Touch</h3>
                <p className="mt-3 max-w-[22rem] text-sm leading-relaxed sm:text-[15px]">
                  #502, 5th Floor, Al Dana Tower, Opp. KIMS Hospital, Al Jubail 35514.
                </p>
                <ul className="mt-4 text-base leading-7 sm:text-[18px]">
                  <li>
                    <a href="mailto:info@himmat.com.sa" className={`break-all `}>
                      info@himmat.com.sa
                    </a>
                  </li>
                  <li>
                    <a href="tel:+966549605978" >
                      +966 54 060 5978
                    </a>
                  </li>
                  <li>
                    <a href="tel:+966549262880" >
                      +966 54 926 2880
                    </a>
                  </li>
                </ul>
              </div>

              {/* Quick Links */}
              <div className={`${rise} ${state}`} style={delay(120)}>
                <h3 className="text-xl font-medium sm:text-[22px]">Quick Links</h3>
                <ul className="mt-3 space-y-2">
                  {quickLinks.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className={linkClass}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services (two lists under one heading) */}
              <div className={`${rise} ${state} sm:col-span-2`} style={delay(240)}>
                <h3 className="text-xl font-medium sm:text-[22px]">Services</h3>
                <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                  <ul className="space-y-2">
                    {servicesLeft.map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} className={linkClass}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <ul className="space-y-2">
                    {servicesRight.map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} className={linkClass}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className={`${rise} ${state} border-t border-white/60`} style={delay(360)}>
            <div
              className="flex flex-col items-center gap-5 px-5 py-6 pb-24 text-center
                         sm:px-8 md:flex-row md:justify-between md:pb-6 md:text-left
                         lg:px-12 lg:pr-28 xl:px-20 xl:pr-32 2xl:px-[15%] 2xl:pr-[16%]"
            >
              <p className="text-xs sm:text-sm">
                &copy; 2026 Himmat Contracting Company. All rights reserved.
              </p>

              <div className="flex items-center gap-3 sm:gap-4">
                <SocialLink href="#" label="Facebook">
                  <path d="M14 8V6.5c0-.8.3-1.2 1.3-1.2H17V2h-2.5C11.7 2 10.5 3.6 10.5 6v2H8v3.2h2.5V22H14V11.2h2.7L17 8h-3Z" />
                </SocialLink>
                <SocialLink href="#" label="LinkedIn">
                  <path d="M4.5 9h3.6v11H4.5V9Zm1.8-5.5a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2ZM10 9h3.4v1.5h.1c.5-.9 1.7-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.4V20h-3.6v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.700V20H10V9Z" />
                </SocialLink>
                <SocialLink href="#" label="Instagram">
                  <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.900A3.100 3.100 0 1 1 12 8.900a3.100 3.100 0 0 1 0 6.200ZM17.200 6a1.100 1.100 0 1 0 0 2.200 1.100 1.100 0 0 0 0-2.200ZM12 3.800c2.500 0 2.800 0 3.800.1 2.600.1 3.800 1.300 3.900 3.900.1 1 .1 1.300.1 3.800s0 2.800-.1 3.800c-.1 2.600-1.300 3.800-3.900 3.900-1 .1-1.300.1-3.800.1s-2.800 0-3.800-.1c-2.600-.1-3.800-1.300-3.900-3.900-.1-1-.1-1.300-.1-3.800s0-2.800.1-3.800C4.400 5.200 5.600 4 8.200 3.900c1-.1 1.300-.1 3.800-.1ZM12 2.100c-2.500 0-2.900 0-3.900.1C4.700 2.300 2.300 4.700 2.200 8.100c-.1 1-.1 1.400-.1 3.900s0 2.900.1 3.900c.1 3.400 2.500 5.800 5.900 5.900 1 .1 1.400.1 3.900.1s2.900 0 3.900-.1c3.400-.1 5.800-2.500 5.900-5.900.1-1 .1-1.400.1-3.900s0-2.900-.1-3.900c-.1-3.400-2.500-5.800-5.900-5.900-1-.1-1.400-.1-3.900-.1Z" />
                </SocialLink>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating buttons (outside the footer so overflow-hidden never affects them) */}
      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-center gap-3 sm:right-6">
        <a
          href="https://wa.me/966549262880"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-300 hover:scale-110 sm:h-12 sm:w-12"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.600 15.100L2 22l5-1.300A10 10 0 1 0 12 2Zm0 18.200a8.200 8.200 0 0 1-4.200-1.200l-.3-.2-3 .8.8-2.900-.2-.3A8.200 8.200 0 1 1 12 20.200Zm4.500-6.100c-.2-.1-1.500-.7-1.700-.8-.2-.1-.4-.1-.6.100l-.8 1c-.1.200-.3.200-.5.100a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.200-.4.700-1.300.1-.2 0-.3 0-.5l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.100-.7.300-.2.300-.9.900-.9 2.200s.9 2.500 1 2.700c.1.200 1.800 2.800 4.400 3.900 1.600.7 2.300.8 3.100.7.500-.1 1.500-.6 1.700-1.200.2-.6.2-1.100.2-1.200-.1-.1-.3-.2-.5-.3Z" />
          </svg>
        </a>

        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#E0A82E] shadow-lg transition-transform duration-300 hover:-translate-y-1 sm:h-11 sm:w-11"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#E0A82E] hover:bg-[#DAA732] hover:text-white
                 transition-transform duration-300  sm:h-[46px] sm:w-[46px]"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {children}
      </svg>
    </a>
  );
}

export default Footer;