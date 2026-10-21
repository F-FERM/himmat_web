
// import Footer from "../components/layout/Footer";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Suspense } from "react";


export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
  <>
      <Navbar
      
      />
      <div className="w-full">{children}</div>
      <Footer/>
    </>
    </Suspense>
  
  );
}
