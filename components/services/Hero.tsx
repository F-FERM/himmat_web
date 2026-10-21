import { Manrope } from "next/font/google";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import defaultBanner from "../../public/images/detailpage/Hero1.jpg";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

type Crumb = { label: string; href: string };

type PageBannerProps = {
  title?: string;
  image?: StaticImageData;
  breadcrumbs?: Crumb[];
};

/**
 * Inner-page banner. Reusable: pass a different title / image / breadcrumbs per page, e.g.
 * <PageBanner title="Gypsum Works" image={gypsumImg} breadcrumbs={[{label:"Home",href:"/"},{label:"Services",href:"/services"}]} />
 */
function PageBanner({
  title = "Equipment Rental",
  image = defaultBanner,
  breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
  ],
}: PageBannerProps) {
  return (
    <section
      className={`${manrope.className} relative flex w-full items-end overflow-hidden bg-black text-white
                  min-h-[380px] pt-[70px]
                  sm:min-h-[420px] sm:pt-[80px]
                  md:pt-[90px]
                  lg:min-h-[500px] lg:pt-[105px]
                  xl:min-h-[630px] xl:pt-[125px]`}
    >
      {/* Background image + dark overlay */}
      <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" aria-hidden="true" />
      <div className="absolute inset-0 bg-black/25" />

      {/* Content */}
      <div
        className="relative flex min-w-0 flex-1 flex-col items-start gap-4 px-5 pb-12
                   sm:px-8 sm:pb-16
                   md:flex-row md:items-center md:justify-between md:gap-8
                   lg:px-12 lg:pb-20
                   xl:px-[8%] xl:pb-24
                   2xl:ml-[15%] 2xl:mr-[14.6%] 2xl:px-0 2xl:pb-[115px]"
      >
        {/* Title: fadeInUp */}
        <h1
          className="fade-in-up text-3xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-4xl lg:text-[44px] 2xl:text-[clamp(38px,2.3vw,46px)]"
        >
          {title}
        </h1>

        {/* Breadcrumb: fadeInUp, a little later */}
        <nav
          aria-label="Breadcrumb"
          className="fade-in-up flex items-center text-sm sm:text-base"
          style={{ animationDelay: "0.25s" }}
        >
          {breadcrumbs.map((crumb) => (
            <span key={crumb.label} className="flex items-center">
              <Link href={crumb.href} className="hover:underline">
                {crumb.label}
              </Link>
              <span aria-hidden="true" className="ml-5 mr-3 text-xs">
                /
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* fadeInUp (same as animate.css) */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate3d(0, 100%, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .fade-in-up {
          animation-name: fadeInUp;
          animation-duration: 1s;
          animation-fill-mode: both;
          animation-timing-function: ease;
        }
        @media (prefers-reduced-motion: reduce) { .fade-in-up { animation: none; } }
      `}</style>
    </section>
  );
}

export default PageBanner;