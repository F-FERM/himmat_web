import Clients from "@/components/clients/Clients";
import PageBanner from "@/components/services/Hero";
import clientsBanner from "@/public/images/about/hero-image.jpg";

export default function ClientsPage() {
  return (
    <main>
        <PageBanner

  title="Clients"
  image={clientsBanner}
  breadcrumbs={[
    { label: "Home", href: "/" },
    { label: "Clients", href: "/clients" },
  ]}
/>
  <Clients/>
    </main>
  );
}

