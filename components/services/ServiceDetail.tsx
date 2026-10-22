import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

type ServiceDetailProps = {
  title: string;
  paragraphs: string[];
};

const WRAPPER =
  "mx-auto w-full px-5 sm:px-8 lg:px-[8%] xl:px-[14%] 2xl:w-[58.2%] 2xl:max-w-[1113px] 2xl:px-0";
const SECTION = "w-full bg-white py-12 sm:py-16 2xl:pb-[88px] 2xl:pt-[75px]";

function ServiceDetail({ title, paragraphs }: ServiceDetailProps) {
  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <div className={WRAPPER}>
        <h2 className="break-words text-3xl font-semibold leading-[1.18] tracking-[-0.02em] text-[#195992] sm:text-4xl xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
          {title}
        </h2>

        <div className="mt-6 flex flex-col gap-3.5 text-[15px] font-medium leading-[1.5] text-[#666666] sm:mt-8 sm:text-justify 2xl:text-[clamp(14px,0.784vw,15px)]">
          {paragraphs.map((p, i) => (
            <p key={i} className="break-words">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServiceDetailSkeleton() {
  return (
    <section className={SECTION} aria-hidden>
      <div className={`${WRAPPER} animate-pulse`}>
        <div className="h-9 w-2/3 rounded bg-gray-200 sm:w-1/2" />
        <div className="mt-6 space-y-3 sm:mt-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={`h-3.5 rounded bg-gray-200 ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceDetail;