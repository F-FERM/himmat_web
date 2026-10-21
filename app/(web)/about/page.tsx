import PageBanner from "@/components/services/Hero";
import aboutBanner from "../../../public/images/about/hero-image.jpg"
import AboutIntro from "@/components/about/BuiltProgress";
import Expertise from "@/components/home/Expertise";
import CallToAction from "@/components/home/CalltoAction";
import WhyChooseUs from "@/components/home/WhyChooseUs";


export default function AboutPage() {
  return (
    <main>
<PageBanner
  title="Who We Are"
  image={aboutBanner}
  breadcrumbs={[
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
  ]}
/>

<AboutIntro/>
<Expertise/>
<CallToAction/>
<WhyChooseUs/>

  
    </main>
  );
}

