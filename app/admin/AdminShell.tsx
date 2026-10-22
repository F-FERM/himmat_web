"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/", label: "Dashboard" },
  { href: "/admin/cred/", label: "Home Hero Slides" },
  { href: "/admin/services/", label: "Services" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login/";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="hidden shrink-0 border-slate-200 bg-white px-6 py-8 lg:block lg:w-80 lg:border-r">
          <div className="mb-10">
            <Link
              href="/admin/"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              WWD Admin
            </Link>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Enterprise admin shell for managing content, slides, and site
              configuration.
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-10 text-sm text-slate-500">
            <p className="font-semibold text-slate-700">Management</p>
            <p className="mt-2 leading-6">
              Secure admin workflows, content editing, and slide management all
              in one place.
            </p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur-md lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Admin panel
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-950">
                  {pathname === "/admin/"
                    ? "Dashboard"
                    : pathname === "/admin/cred/"
                      ? "Home Hero Slides"
                      : pathname === "/admin/services/"
                        ? "Services"
                        : "Administration"}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 sm:block">
                  Administrator
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
