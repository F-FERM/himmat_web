import Clients from "@/components/clients/Clients";
import ClientsBanner from "@/components/clients/ClientsBanner";

export default function ClientsPage() {
  return (
    <main>
      <ClientsBanner />
      <Clients />
    </main>
  );
}