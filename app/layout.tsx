import type { Metadata } from "next";
import { Geist_Mono, Poppins, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import CustomCursor from "@/components/ui/CustomCursor";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Himmath",
  description: "Himmath",
  icons: {
    icon: "/images/metaicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${poppins.variable} ${geistMono.variable} antialiased`}>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
