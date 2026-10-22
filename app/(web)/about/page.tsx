import AboutIntro from "@/components/about/BuiltProgress";
import AboutBanner from "@/components/about/Hero";
import CallToAction from "@/components/home/CalltoAction";
import Expertise from "@/components/home/Expertise";
import WhyChooseUs from "@/components/home/WhyChooseUs";


export default function AboutPage() {
  return (
    <main>
<AboutBanner />

<AboutIntro/>
<Expertise/>
<CallToAction/>
<WhyChooseUs/>

  
    </main>
  );
}

