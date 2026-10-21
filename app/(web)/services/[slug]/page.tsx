import CallToAction from "@/components/home/CalltoAction";
import Expertise from "@/components/home/Expertise";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import GallerySlider from "@/components/services/GallerySlider";
import PageBanner from "@/components/services/Hero";
import ServiceDetail from "@/components/services/ServiceDetail";


export default function ServicePage() {
  return (
    <main>
<PageBanner/>
<ServiceDetail/>
<GallerySlider/>
   <Expertise/>
    <CallToAction/>
      <WhyChooseUs/>

  
    </main>
  );
}

