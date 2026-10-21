import About from "@/components/home/About";
import Brands from "@/components/home/Brands";
import CallToAction from "@/components/home/CalltoAction";
import Expertise from "@/components/home/Expertise";
import Hero from "@/components/home/Hero";
import CoreValues from "@/components/home/OurCoreValues";
import Services from "@/components/home/Services";
import WhyChooseUs from "@/components/home/WhyChooseUs";

export default function HomePage() {
  return (
    <main>
   <Hero/>
   <About/>
   <Services/>
   <Expertise/>
   <WhyChooseUs/>
   <CoreValues/>
   <CallToAction/>
   <Brands/>
  
    </main>
  );
}

