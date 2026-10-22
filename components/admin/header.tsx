"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminHeader() {
  return (
    <header
      className="
        sticky
        top-0
        z-40

        flex
        h-[70px]

        items-center
        gap-4

        border-b
        border-[#ECECEC]

        bg-white

        px-6
      "
    >
      <SidebarTrigger />

      <h1
        className="
          text-[20px]
          font-semibold

          text-[#1A1A1A]
        "
      >
        Admin Dashboard
      </h1>
    </header>
  );
}