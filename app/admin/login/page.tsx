"use client";
import LoginPage from "@/components/login/LoginPage";
import { Suspense } from "react";
const page = () => {
  return (
    <Suspense>

      <LoginPage />
    </Suspense>
  );
};

export default page;
