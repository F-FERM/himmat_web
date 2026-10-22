"use client";
import api from "@/lib/axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// ================= API =================
const ENDPOINT = "/clients-page";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

type ApiClient = {
  _id?: string;
  name: string;
  logo: string;
  logoAlt?: string;
  link?: string;
  order?: number;
};

type ApiClientsPage = { clients?: ApiClient[] };

type Client = {
  id: string;
  name: string;
  logo: string;
  logoAlt: string;
  href: string | null; 
  external: boolean;
};

function resolveImage(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${IMAGE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}


function parseLink(link?: string): { href: string | null; external: boolean } {
  const l = (link ?? "").trim();
  if (!l || l === "#") return { href: null, external: false };
  if (/^https?:\/\//i.test(l)) return { href: l, external: true };
  return { href: l.startsWith("/") ? l : `/${l}`, external: false };
}

function mapApiClients(
  data: ApiClientsPage | ApiClientsPage[] | null | undefined
): Client[] {
  const doc = Array.isArray(data) ? data[0] : data;
  return [...(doc?.clients ?? [])]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((c) => Boolean(c.logo) && Boolean(c.name))
    .map((c, i) => {
      const { href, external } = parseLink(c.link);
      return {
        id: c._id || `${c.name}-${i}`,
        name: c.name,
        logo: resolveImage(c.logo),
        logoAlt: c.logoAlt || c.name,
        href,
        external,
      };
    });
}

const SECTION =
  "w-full overflow-x-clip bg-white py-10 sm:py-14 lg:py-16 2xl:pb-[89px] 2xl:pt-[70px]";

const GRID =
  "grid grid-cols-2 gap-3 px-4 " +
  "sm:grid-cols-3 sm:gap-4 sm:px-8 " +
  "lg:grid-cols-4 lg:gap-5 lg:px-12 " +
  "xl:grid-cols-6 xl:px-[8%] " +
  "2xl:ml-[15%] 2xl:mr-[14.9%] 2xl:gap-x-[1.87%] 2xl:px-0";

const CARD =
  "relative block aspect-[203/107] bg-[#FDFDFD] shadow-[0_0_30px_rgba(0,0,0,0.06)]";

function ClientsSkeleton() {
  return (
    <section className={SECTION} aria-busy="true">
      <div className="mx-auto max-w-[1920px]">
        <ul className={GRID}>
          {Array.from({ length: 12 }).map((_, i) => (
            <li key={i} className={`${CARD} animate-pulse bg-[#E9EEF4]`}>
              <div className="absolute inset-0 p-4 sm:p-5 2xl:p-[10%]">
                <div className="h-full w-full bg-white/50" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ClientCard({ client }: { client: Client }) {
  const logo = (
    <div className="absolute inset-0 p-4 sm:p-5 2xl:p-[10%]">
      <div className="relative h-full w-full">
        <Image
          src={client.logo}
          alt={client.logoAlt}
          fill
          sizes="(min-width: 1280px) 15vw, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
          unoptimized
          className="object-contain"
        />
      </div>
    </div>
  );

  // No link => plain card
  if (!client.href) {
    return <div className={CARD}>{logo}</div>;
  }

  const linked =
    `${CARD} transition-shadow duration-300 hover:shadow-[0_0_36px_rgba(0,0,0,0.12)] ` +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5B96]";

  // External link
  if (client.external) {
    return (
      <a
        href={client.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${client.name} (opens in a new tab)`}
        className={linked}
      >
        {logo}
      </a>
    );
  }

  // Internal link
  return (
    <Link href={client.href} aria-label={client.name} className={linked}>
      {logo}
    </Link>
  );
}

function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiClientsPage | ApiClientsPage[]>(ENDPOINT);
        if (cancelled) return;
        setClients(mapApiClients(res.data));
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <ClientsSkeleton />;

  // Error / empty state
  if (error || clients.length === 0) {
    return (
      <section className={SECTION}>
        <p className="px-4 text-center text-sm text-[#666] sm:text-base">
          {error
            ? "We couldn’t load our clients right now. Please try again later."
            : "Our client list will be available soon."}
        </p>
      </section>
    );
  }

  return (
    <section className={SECTION}>
      <div className="mx-auto max-w-[1920px]">
        <ul className={GRID}>
          {clients.map((client) => (
            <li key={client.id}>
              <ClientCard client={client} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Clients;