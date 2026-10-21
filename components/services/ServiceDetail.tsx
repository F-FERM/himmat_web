import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

type ServiceDetailProps = {
  title?: string;
  paragraphs?: string[];
};

const DEFAULT_PARAGRAPHS = [
  "We provide reliable equipment rental solutions to support construction, industrial, infrastructure, commercial, and maintenance projects of all sizes. A comprehensive range of equipment is available to meet diverse site requirements, ensuring that every project has access to the right machinery when needed. Our flexible rental options allow clients to choose short-term or long-term arrangements based on project duration, budget, and operational demands, eliminating the high costs and maintenance responsibilities associated with equipment ownership.",
  "Every piece of equipment is selected with careful attention to performance, safety, and operational efficiency. We coordinate equipment availability, transportation, and delivery schedules to ensure timely deployment and minimize downtime on site. Whether the requirement is for earthmoving equipment, lifting machinery, generators, compressors, or other specialized equipment, we strive to provide dependable solutions that contribute to uninterrupted project progress and improved productivity.",
  "Our commitment extends beyond equipment supply by offering responsive customer support and efficient coordination throughout the rental period. We work closely with clients to understand project requirements, recommend suitable equipment, and ensure seamless logistics from mobilization to demobilization. With a focus on quality, reliability, and timely service, our equipment rental solutions help businesses complete projects safely, efficiently, and within schedule.",
];

/**
 * Service description block. Reusable: <ServiceDetail title="Gypsum Works" paragraphs={[...]} />
 */
function ServiceDetail({ title = "Equipment Rental", paragraphs = DEFAULT_PARAGRAPHS }: ServiceDetailProps) {
  return (
    <section className={`${manrope.className} w-full bg-white py-12 sm:py-16 2xl:pb-[88px] 2xl:pt-[75px]`}>
      <div className="mx-auto w-full px-5 sm:px-8 lg:px-[8%] xl:px-[14%] 2xl:w-[58.2%] 2xl:max-w-[1113px] 2xl:px-0">
        <h2 className="text-3xl font-semibold leading-[1.18] tracking-[-0.02em] text-[#195992] sm:text-4xl xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
          {title}
        </h2>

        <div className="mt-6 flex flex-col gap-3.5 text-[15px] font-medium leading-[1.5] text-[#666666] sm:mt-8 sm:text-justify 2xl:text-[clamp(14px,0.784vw,15px)]">
          {paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceDetail;