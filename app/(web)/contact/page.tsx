import PageBanner from "@/components/services/Hero";
import contactBanner from "../../../public/images/contact.jpg"
import ContactSection from "@/components/contact/ContactSection";


export default function ContactPage() {
  return (
    <main>
<PageBanner
  title="Contact Us"
  image={contactBanner}
  breadcrumbs={[
    { label: "Home", href: "/" },
    { label: "Contact", href: "/contact" },
  ]}
/>

<ContactSection/>

  
    </main>
  );
}

