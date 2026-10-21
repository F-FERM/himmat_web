"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import client1 from "../../public/images/home/client-1.jpg";
import client2 from "../../public/images/home/client-2.jpg";
import client3 from "../../public/images/home/client-3.jpg";
import client4 from "../../public/images/home/client-4.jpg";
import client5 from "../../public/images/home/client-5.jpg";
import client6 from "../../public/images/home/client-6.jpg";
import client7 from "../../public/images/home/client-7.jpg";
import client8 from "../../public/images/home/client-8.jpg";
import client9 from "../../public/images/home/client-9.jpg";
import client10 from "../../public/images/home/client-10.jpg";

const brands = [
  { name: "Marafiq", src: client1 },
  { name: "BFIM Trading Division", src: client2 },
  { name: "NHME Group", src: client3 },
  { name: "Saudi Electricity Company", src: client4 },
  { name: "Kingdom of Saudi Arabia", src: client5 },
  { name: "Wison", src: client6 },
  { name: "Red Sea Global", src: client7 },
  { name: "Aramco", src: client8 },
  { name: "Sabic", src: client9 },
  { name: "Saline Water Conversion Corporation", src: client10 },
];

/** Flips to true once the element scrolls into view (runs once), like WOW.js. */
function useInView<T extends HTMLElement>(rootMargin = "0px 0px -60px 0px", threshold = 0.1) {
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

function Brands() {
  // The section never moves and keeps the strip's height, so it is the reliable trigger
  const { ref, inView } = useInView<HTMLElement>();

  return (
    // overflow-visible + z-20: the strip starts OUTSIDE this box (over the footer)
    // and slides up into place. No clipping.
    <section ref={ref} className="relative z-20 w-full overflow-visible bg-white" aria-label="Our clients">
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
          animation: brands-marquee 40s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .brands-fade-in-up { animation: none; opacity: 1; transform: none; }
          .brands-track { animation: none; }
        }
      `}</style>

      {/* The whole strip: hidden until in view, then fadeInUp */}
      <div className={`bg-white ${inView ? "brands-fade-in-up" : "brands-hidden"}`}>
        <div className="relative w-full overflow-hidden border-y border-gray-200/70">
          {/* The list is rendered twice, so moving it by -50% loops seamlessly */}
          <div className="brands-track flex w-max">
            {[...brands, ...brands].map((brand, i) => (
              <div
                key={`${brand.name}-${i}`}
                className="flex h-[140px] w-[240px] shrink-0 items-center justify-center border-r border-gray-200/70 px-8
                           sm:h-[170px] sm:w-[300px] lg:h-[200px] lg:w-[350px] lg:px-10"
                aria-hidden={i >= brands.length}
              >
                <Image
                  src={brand.src}
                  alt={i < brands.length ? brand.name : ""}
                  width={220}
                  height={110}
                  className="h-auto max-h-[70px] w-auto max-w-full object-contain sm:max-h-[85px] lg:max-h-[100px]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Brands;