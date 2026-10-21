import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

type AboutIntroProps = {
  label?: string;
  title?: string;
  paragraphs?: string[];
};

// Placeholder copy: replace with your real "Built For Progress" text
const DEFAULT_PARAGRAPHS = [
  "Founded in 2022 in the Kingdom of Saudi Arabia, Himmat has grown from a trusted provider of lifting equipment and accessories into a diversified company supporting industrial, infrastructure, and construction projects across the Kingdom.",
  "We are committed to maintaining high standards of quality, safety, and efficiency in every service we provide, building lasting partnerships through reliability, timely execution, and customer satisfaction.",
];

/**
 * Intro block under the page banner: small label on the left, big heading + text on the right.
 * Reusable: <AboutIntro label="..." title="..." paragraphs={[...]} />
 */
function AboutIntro({
  label = "Himmat Contracting Company",
  title = "Built For Progress",
  paragraphs = DEFAULT_PARAGRAPHS,
}: AboutIntroProps) {
  return (
    <section className={`${manrope.className} w-full bg-[#F8F9FB] py-12 sm:py-14 2xl:pb-[80px] 2xl:pt-[71px]`}>
      <div
        className="grid grid-cols-1 gap-4 px-5
                   sm:px-8
                   lg:grid-cols-[28%_1fr] lg:gap-x-10 lg:gap-y-0 lg:px-12
                   xl:px-[8%]
                   2xl:ml-[15%] 2xl:mr-[14.9%] 2xl:grid-cols-[25.5%_1fr] 2xl:gap-x-0 2xl:px-0"
      >
        {/* Label (left column) */}
        <p className="text-lg font-medium text-[#111] sm:text-xl lg:pt-2.5 2xl:text-[clamp(18px,1.15vw,22px)]">
          {label}
        </p>

        {/* Heading + text (right column) */}
        <div>
          <h2 className="text-3xl font-semibold leading-[1.18] tracking-[-0.02em] text-[#195992] sm:text-4xl xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
            {title}
          </h2>

          {paragraphs.length > 0 && (
            <div className="mt-5 flex flex-col gap-3.5 text-[15px] font-medium leading-[1.5] text-[#666] sm:mt-6 2xl:text-[clamp(14px,0.784vw,15px)]">
              {paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AboutIntro;