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
  image?: StaticImageData | string;
  breadcrumbs?: Crumb[];
};

const SECTION =
  "relative flex w-full items-end overflow-hidden bg-black text-white " +
  "min-h-[340px] pt-[70px] " +
  "sm:min-h-[420px] sm:pt-[80px] " +
  "md:pt-[90px] " +
  "lg:min-h-[500px] lg:pt-[105px] " +
  "xl:min-h-[630px] xl:pt-[125px]";

const OUTER = "relative mx-auto flex w-full max-w-[1920px]";

const CONTENT =
  "flex min-w-0 flex-1 flex-col items-start gap-3 px-4 pb-10 " +
  "sm:px-8 sm:pb-14 " +
  "md:flex-row md:items-center md:justify-between md:gap-8 " +
  "lg:px-12 lg:pb-20 " +
  "xl:px-[8%] xl:pb-24 " +
  "2xl:ml-[15%] 2xl:mr-[14.6%] 2xl:px-0 2xl:pb-[115px]";
const IMG_AREA =
  "absolute inset-x-0 bottom-0 top-[70px] sm:top-[80px] md:top-[90px] lg:top-[105px] xl:top-[125px]";

function PageBanner({
  title = "Equipment Rental",
  image = defaultBanner,
  breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
  ],
}: PageBannerProps) {
  const isRemote = typeof image === "string";

  return (
    <section className={`${manrope.className} ${SECTION}`}>
        <div className={IMG_AREA}>
    {(!isRemote || image) && (
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        unoptimized={isRemote}
        className="object-cover"
        aria-hidden="true"
      />
    )}
    <div className="absolute inset-0 bg-black/25" />
  </div>


      {/* Content */}
      <div className={OUTER}>
        <div className={CONTENT}>
          {/* Title: fadeInUp */}
          <h1 className="fade-in-up min-w-0 break-words text-[28px] font-medium leading-[1.15] tracking-[-0.02em] sm:text-4xl lg:text-[44px] 2xl:text-[clamp(38px,2.3vw,46px)]">
            {title}
          </h1>

          {/* Breadcrumb: fadeInUp, a little later */}
          <nav
            aria-label="Breadcrumb"
            className="fade-in-up flex shrink-0 flex-wrap items-center text-sm sm:text-base"
            style={{ animationDelay: "0.25s" }}
          >
            {breadcrumbs.map((crumb, i) => (
              <span key={`${crumb.href}-${i}`} className="flex items-center">
                <Link
                  href={crumb.href}
                  aria-current={i === breadcrumbs.length - 1 ? "page" : undefined}
                  className="hover:underline focus-visible:underline"
                >
                  {crumb.label}
                </Link>
                <span aria-hidden="true" className="ml-4 mr-2.5 text-xs sm:ml-5 sm:mr-3">
                  /
                </span>
              </span>
            ))}
          </nav>
        </div>
      </div>

      {/* fadeInUp (same as animate.css) */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate3d(0, 60px, 0); }
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

export function PageBannerSkeleton() {
  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <div className="absolute inset-0 bg-[#1a1a1a]" />
      <div className="absolute inset-0 bg-black/25" />

      <div className={OUTER}>
        <div className={CONTENT}>
          <div className="h-9 w-48 animate-pulse rounded bg-white/20 sm:h-11 sm:w-64 lg:h-[52px] lg:w-80" />
          <div className="h-5 w-32 animate-pulse rounded bg-white/20 sm:h-6 sm:w-40" />
        </div>
      </div>
    </section>
  );
}

export default PageBanner;