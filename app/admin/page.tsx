"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      router.replace("/admin/dashboard/");
    } else {
      router.replace("/admin/login/");
    }
  }, [router]);

  // Render nothing while redirecting
  return null;
}
