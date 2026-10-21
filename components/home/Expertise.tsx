"use client";
import { useEffect, useRef, useState } from "react";
import { Manrope } from "next/font/google";
import Image from "next/image";
import iconSite from "../../public/images/home/home-expertise-1.png";
import iconTechnical from "../../public/images/home/home-expertise-2.png";
import iconResource from "../../public/images/home/home-expertise-3.png";
import iconLogistics from "../../public/images/home/home-expertise-4.png";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ITEMS = [
  {
    icon: iconSite,
    title: "Site Solutions",
    text: "Practical site support designed to keep construction activities organized, efficient, and on schedule.",
  },
  {
    icon: iconTechnical,
    title: "Technical Services",
    text: "Professional engineering and MEP solutions tailored to meet the technical needs of each project.",
  },
  {
    icon: iconResource,
    title: "Resource Support",
    text: "Reliable manpower, equipment, and material solutions to support projects from start to completion.",
  },
  {
    icon: iconLogistics,
    title: "Logistics Support",
    text: "Well-coordinated transportation and logistics services for smooth movement of materials, equipment, and project resources.",
  },
];

/** Flips to true once the element scrolls into view (runs once). */
function useInView<T extends HTMLElement>() {
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
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, inView };
}

function Expertise() {
  const { ref, inView } = useInView<HTMLDivElement>();

  // Everything comes from bottom -> top
  const base =
    "transition-all duration-1000 ease-out motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none";
  const hidden = "translate-y-24 opacity-0";
  const shown = "translate-y-0 opacity-100";

  return (
    <section className={`${manrope.className} w-full overflow-x-clip bg-white py-14 sm:py-16 2xl:py-[70px]`}>
      <div
        ref={ref}
        className="grid grid-cols-1 gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.5fr] lg:gap-x-10 lg:px-12
                   xl:px-[8%]
                   2xl:ml-[14.8%] 2xl:mr-[13.9%] 2xl:grid-cols-[569fr_796fr] 2xl:gap-x-0 2xl:px-0"
      >
        {/* ---------- Heading ---------- */}
        <div className={`${base} ${inView ? shown : hidden}`}>
          <p className="text-base text-[#DAA732] sm:text-[17px] 2xl:text-[clamp(15px,0.89vw,17px)] font-medium">
            Our Expertise
          </p>
          <h2 className="mt-2.5 max-w-[11em] text-3xl font-semibold leading-[1.18] tracking-[-0.02em] text-[#195992] sm:text-4xl xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
            Delivering The Support Every Project Needs
          </h2>
        </div>

        {/* ---------- 2 x 2 items ---------- */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:gap-y-14 2xl:gap-x-0 2xl:gap-y-[71px]">
          {ITEMS.map((item, i) => (
            <div
              key={item.title}
              className={`${base} ${inView ? shown : hidden} 2xl:pr-[20%]`}
              style={{ transitionDelay: inView ? `${200 + i * 150}ms` : "0ms" }}
            >
              {/* Icon (image) */}
              <Image
                src={item.icon}
                alt=""
                aria-hidden="true"
                className="h-14 w-auto sm:h-16"
              />

              <h3 className="mt-6 text-xl font-medium text-[#111] sm:mt-7 sm:text-2xl">{item.title}</h3>
              <p className="mt-3 text-[15px] font-medium leading-[1.5] text-[#666666] 2xl:text-[clamp(14px,0.784vw,15px)]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Expertise;