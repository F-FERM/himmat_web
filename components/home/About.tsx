"use client";
import { useEffect, useRef, useState } from "react";
import { Manrope } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import aboutImage from "../../public/images/home/home-about.jpg"; // change to your image

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const CONTENT = {
  label: "Himmat Contracting Company",
  title: "Turning Every Challenge Into A Solution That Works",
  paragraphs: [
    "Every project brings different requirements, timelines, and challenges. Our approach is built around understanding these needs and providing practical solutions backed by skilled people, reliable resources, and responsible execution. From construction and engineering to manpower, equipment, materials, and logistics, we work to keep every project moving in the right direction.",
    "We are committed to maintaining high standards of quality, safety, and efficiency in every service we provide. By combining industry expertise with careful planning and seamless coordination, we deliver dependable solutions that support projects from start to finish. Our focus on reliability, timely execution, and customer satisfaction enables us to build lasting partnerships while contributing to the successful completion of projects across diverse industries.",
  ],
  href: "/about",
  vision: {
    title: "Our Vision",
    text: "To grow as a trusted and capable service provider known for quality work, dependable support, and lasting value across every project we undertake.",
  },
  mission: {
    title: "Our Mission",
    text: "To meet our clients’ project needs with skilled teams, reliable resources, and well-managed services while maintaining quality, safety, timely execution, and strong working relationships.",
  },
};

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

function About() {
  const { ref, inView } = useInView<HTMLDivElement>();
  // Vision / Mission box has its own trigger, so it animates when YOU scroll down to it
  const { ref: boxRef, inView: boxInView } = useInView<HTMLDivElement>();

  // Transition base for the Vision / Mission box (bottom -> top).
  const base =
    "transition-all duration-1000 ease-out motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none";
  const boxFromBottom = boxInView ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0"; // bigger travel

  return (
    <section className={`${manrope.className} w-full overflow-x-clip bg-white py-12 sm:py-16 lg:py-20 2xl:pb-24 2xl:pt-[68px]`}>
      <style>{`
        /* img-anim-top: image is revealed from the top edge downwards */
        @keyframes about-img-anim-top {
          0%   { transform: translate3d(0, -5%, 0); clip-path: inset(0 0 100% 0); }
          100% { transform: translate3d(0, 0, 0);   clip-path: inset(0 0 0 0); }
        }
        .about-img-hidden {
          clip-path: inset(0 0 100% 0);
        }
        .about-img-reveal {
          animation: 1.3s cubic-bezier(0.645, 0.045, 0.355, 1) 0s 1 normal forwards running about-img-anim-top;
        }

        /* animate.css fadeInUp: from one full element-height lower + transparent, to place */
        @keyframes about-fade-in-up {
          from { opacity: 0; transform: translate3d(0, 100%, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .about-text-hidden {
          visibility: hidden;
        }
        .about-fade-in-up {
          visibility: visible;
          animation-name: about-fade-in-up;
          animation-duration: 1s;
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        @media (prefers-reduced-motion: reduce) {
          .about-img-hidden,
          .about-img-reveal { animation: none; clip-path: none; transform: none; }
          .about-text-hidden { visibility: visible; }
          .about-fade-in-up { animation: none; opacity: 1; transform: none; }
        }
      `}</style>

      <div
        ref={ref}
        className="mx-auto grid w-full max-w-[1920px] grid-cols-1 px-5 sm:px-8 lg:grid-cols-[45%_1fr] lg:gap-x-10 lg:px-12
                   2xl:ml-[6.2%] 2xl:w-[78.8%] 2xl:max-w-[1509px] 2xl:grid-cols-[47%_53%] 2xl:gap-x-0 2xl:px-0"
      >
        {/* ---------- Image (img-anim-top reveal) ---------- */}
        <div className="relative">
          <div
            className={`relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[420px] 2xl:aspect-[710/714] 2xl:h-auto
                        ${inView ? "about-img-reveal" : "about-img-hidden"}`}
          >
            <Image
              src={aboutImage}
              alt="Himmat team on site"
              fill
              sizes="(min-width: 1536px) 40vw, (min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* ---------- Text (fadeInUp, 0.2s delay) ---------- */}
        <div
          className={`${inView ? "about-fade-in-up" : "about-text-hidden"} mt-8 flex flex-col justify-center lg:mt-0
                      2xl:justify-start 2xl:pb-[21.75%] 2xl:pl-[12%] 2xl:pt-[13%]`}
        >
          <p className="text-base text-[#DAA732] sm:text-[17px] 2xl:text-[clamp(15px,0.89vw,17px)] font-medium">{CONTENT.label}</p>

          <h2 className="mt-2.5 text-3xl font-semibold leading-[1.18] tracking-[-0.02em] text-[#195992] sm:text-4xl xl:text-[38px] 2xl:text-[clamp(30px,2vw,38px)]">
            {CONTENT.title}
          </h2>

          <div className="mt-6 flex flex-col gap-3.5 text-[15px] leading-[1.5] text-[#555] 2xl:text-[clamp(14px,0.784vw,15px)]">
            {CONTENT.paragraphs.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>

          <Link
            href={CONTENT.href}
            className="group mt-8 inline-flex w-fit items-center gap-3 bg-[#DAA732] px-5 py-3.5 text-sm font-medium text-white
                       transition-colors duration-300 hover:bg-[#1a1a1a] sm:mt-9 sm:text-base"
          >
            Know More
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            >
              <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* ---------- Vision / Mission box (overlaps the image on 2xl) ---------- */}
        <div
          ref={boxRef}
          className="relative z-10 mt-10 lg:col-span-2 2xl:ml-[33.8%] 2xl:-mt-[7.7%] 2xl:w-[66.2%]"
        >
          <div className={`${base} duration-[1400ms] ${boxFromBottom} bg-[#1B5B96] text-white`}>
            <div className="grid grid-cols-1 items-center gap-y-8 px-6 py-10 sm:grid-cols-[1fr_auto_1fr] sm:px-8 lg:px-11 2xl:py-12">
              <div className="sm:pr-8 2xl:pr-10">
                <h3 className="text-xl font-medium sm:text-[22px]">{CONTENT.vision.title}</h3>
                <p className="mt-4 max-w-[380px] text-[15px] leading-[1.5]">{CONTENT.vision.text}</p>
              </div>

              {/* Gold divider: horizontal on mobile, vertical from sm */}
              <span className="h-px w-full bg-[#C9A03A] sm:h-24 sm:w-px" aria-hidden="true" />

              <div className="sm:pl-8 xl:pl-14 2xl:pl-[107px]">
                <h3 className="text-xl font-medium sm:text-[22px]">{CONTENT.mission.title}</h3>
                <p className="mt-4 max-w-[380px] text-[15px] leading-[1.5]">{CONTENT.mission.text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;