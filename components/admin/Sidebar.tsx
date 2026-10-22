"use client";

import * as React from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  BriefcaseBusiness,
  ChevronRight,
  Command,
  Contact,
  Home,
  Info,
  LogOut,
  Rss,
  Settings2
} from "lucide-react";


import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { logout } from "@/lib/auth";


const data = {
  navMain: [
    {
      title: "Home",
      icon: Home,
      items: [
        { title: "Hero", url: "/admin/dashboard/home/hero" },
    
        




      ],
    },

    {
      title: "About",
      icon: Rss,
      items: [{ title: "About", url: "/admin/dashboard/about/" }],
    },
    {
      title: "Services",
      icon: Rss,
      items: [{ title: "Services", url: "/admin/dashboard/services/" },],
    },
      {
      title: "Clients",
      icon: Rss,
      items: [{ title: "Clients", url: "/admin/dashboard/client/" },],
    },
    {
      title: "Contact",
      icon: Contact,
      items: [
        { title: "Contact section", url: "/admin/dashboard/contact/" },
      ],
    },
    {
      title: "Sidebar",
      icon: Contact,
      items: [
        { title: "Sidebar", url: "/admin/dashboard/sidebar/" },
      ],
    },
    {
      title: "Footer",
      icon: Settings2,
      items: [{ title: "Footer", url: "/admin/dashboard/footer/" }],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ================= HEADER ================= */}

      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/admin/dashboard/" />}>
              <div
                className="
                  flex
                  aspect-square
                  size-8

                  shrink-0

                  items-center
                  justify-center

                  rounded-lg

                  bg-[#67003E]

                  text-white
                "
              >
                <Command className="size-4" />
              </div>

              <div
                className="
                  grid
                  flex-1

                  text-left
                  text-sm

                  leading-tight
                "
              >
                <span className="truncate font-semibold">Himmat</span>
                <span className="truncate text-xs">Admin Dashboard</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ================= CONTENT ================= */}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <Collapsible
                  key={item.title}
                  defaultOpen
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton tooltip={item.title}>
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronRight
                            className="
                              ml-auto
                              shrink-0

                              transition-transform
                              duration-200

                              group-data-[state=open]/collapsible:rotate-90
                            "
                          />
                        </SidebarMenuButton>
                      }
                    />

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              render={<Link href={subItem.url} />}
                              isActive={pathname === subItem.url}
                              className="
                                data-active:bg-[#67003E]
                                data-active:text-white
                              "
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ================= FOOTER ================= */}

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              className="
                text-red-500

                hover:bg-red-50
                hover:text-red-600
              "
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}