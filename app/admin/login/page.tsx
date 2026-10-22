"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Lock, ShieldCheck, User2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";



import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      router.replace("/admin/dashboard/");
    }
  }, [router]);

  const login = async () => {
    if (!username || !password) {
      return toast.error("Please enter username and password");
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login/", {
        username,
        password,
      });

      localStorage.setItem("access_token", res.data.access_token);

      toast.success("Login successful");

      router.replace("/admin/dashboard/");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="
        relative

        flex
        min-h-screen

        flex-col

        overflow-hidden

        bg-[#FFF4EC]

        lg:flex-row
      "
    >
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            background: "#111111",
            color: "#fff",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#EA580C",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#DC2626",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* ================= ANIMATED BACKGROUND ================= */}

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute

            left-[-120px]
            top-[-120px]

            h-[260px]
            w-[260px]

            rounded-full

            bg-[#EA580C]/20

            blur-[100px]

            sm:h-[420px]
            sm:w-[420px]

            sm:blur-[120px]
          "
        />

        <motion.div
          animate={{
            x: [0, -70, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute

            bottom-[-140px]
            right-[-120px]

            h-[260px]
            w-[260px]

            rounded-full

            bg-[#FB923C]/25

            blur-[100px]

            sm:h-[420px]
            sm:w-[420px]

            sm:blur-[120px]
          "
        />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 12, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute

            left-[40%]
            top-[20%]

            h-[200px]
            w-[200px]

            rounded-full

            bg-[#FDBA74]/15

            blur-[80px]

            sm:h-[320px]
            sm:w-[320px]

            sm:blur-[100px]
          "
        />

        {/* ================= GRID ================= */}

        <div
          className="
            absolute
            inset-0

            bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)]
            bg-[size:60px_60px]

            opacity-[0.35]
          "
        />
      </div>

      {/* ================= LEFT PANEL ================= */}

      <div
        className="
          relative
          z-10

          hidden

          w-full

          flex-col
          justify-between

          overflow-hidden

          bg-[#C2410C]

          p-[32px]

          text-white

          sm:p-[48px]

          lg:flex
          lg:w-1/2
          lg:p-[60px]
        "
      >
        <div
          className="
            absolute
            inset-0

            bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_100%)]
          "
        />

        {/* ================= TOP ================= */}

        <div className="relative z-10">
          <div
            className="
              inline-flex
              items-center
              gap-[10px]
            "
          >
            <div
              className="
                flex
                h-[54px]
                w-[54px]

                items-center
                justify-center

                rounded-[18px]

                bg-white/10

                backdrop-blur-md
              "
            >
              <ShieldCheck className="h-7 w-7" />
            </div>

            <div>
              <h2
                className="
                  text-[28px]
                  font-semibold
                "
              >
               Himmat
              </h2>

              <p
                className="
                  mt-[2px]

                  text-[14px]

                  text-white/70
                "
              >
                Admin Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* ================= CENTER ================= */}

        <div
          className="
            relative
            z-10

            max-w-[520px]
          "
        >
          <h1
            className="
              text-[42px]
              font-semibold

              leading-[1.1]

              tracking-[-1.5px]

              xl:text-[58px]
              xl:leading-[1.05]
              xl:tracking-[-2px]
            "
          >
         Himmat
          </h1>

          <p
            className="
              mt-[26px]

              max-w-[460px]

              text-[16px]

              leading-[1.8]

              text-white/75

              xl:text-[17px]
              xl:leading-[1.9]
            "
          >
            Manage services, clients, careers, contact requests, and office
            solutions from a centralized Himmat admin platform.
          </p>
        </div>

        {/* ================= FOOTER ================= */}

        <div
          className="
            relative
            z-10

            flex
            items-center
            gap-[14px]
          "
        >
          <div
            className="
              h-[12px]
              w-[12px]

              rounded-full

              bg-green-400
            "
          />

          <p
            className="
              text-[15px]

              text-white/70
            "
          >
            Secure Admin Authentication Enabled
          </p>
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}

      <div
        className="
          relative
          z-10

          flex
          flex-1

          items-center
          justify-center

          px-[16px]
          py-[32px]

          sm:px-[30px]
          sm:py-[50px]
        "
      >
        {/* ================= LOGIN CARD ================= */}

        <Card
          className="
            w-full
            max-w-[520px]

            rounded-[24px]

            border
            border-white/60

            bg-white/70

            shadow-[0_25px_80px_rgba(0,0,0,0.08)]

            backdrop-blur-[18px]

            sm:rounded-[32px]
          "
        >
          <CardContent
            className="
              p-[22px]

              sm:p-[40px]
            "
          >
            {/* ================= MOBILE LOGO ================= */}

            <div
              className="
                mb-[24px]

                flex
                items-center
                gap-[12px]

                sm:mb-[30px]

                lg:hidden
              "
            >
              <div
                className="
                  flex
                  h-[48px]
                  w-[48px]

                  items-center
                  justify-center

                  rounded-[16px]

                  bg-[#C2410C]

                  text-white

                  sm:h-[52px]
                  sm:w-[52px]
                "
              >
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <h2
                  className="
                    text-[20px]
                    font-semibold

                    text-[#111111]

                    sm:text-[24px]
                  "
                >
                  Himmat
                </h2>

                <p
                  className="
                    text-[13px]

                    text-[#777777]
                  "
                >
                  Admin Dashboard
                </p>
              </div>
            </div>

            {/* ================= HEADER ================= */}

            <div>
              <h2
                className="
                  text-[28px]
                  font-semibold

                  tracking-[-1px]

                  text-[#111111]

                  sm:text-[34px]

                  md:text-[42px]
                "
              >
                Welcome Back
              </h2>

              <p
                className="
                  mt-[10px]

                  text-[14px]

                  leading-[1.7]

                  text-[#666666]

                  sm:text-[15px]

                  sm:leading-[1.8]
                "
              >
                Login to manage your solutions and dashboard settings.
              </p>
            </div>

            {/* ================= FORM ================= */}

            <div className="mt-[26px] sm:mt-[34px]">
              {/* USERNAME */}

              <div>
                <Label
                  className="
                    mb-[8px]

                    block

                    text-[14px]
                    font-medium

                    text-[#2A2A2A]

                    sm:mb-[10px]
                  "
                >
                  Username
                </Label>

                <div className="relative">
                  <User2
                    className="
                      absolute

                      left-[16px]
                      top-1/2

                      z-10

                      h-[18px]
                      w-[18px]

                      -translate-y-1/2

                      text-[#8C8C8C]

                      sm:left-[18px]
                    "
                  />

                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="
                      h-[52px]

                      rounded-[14px]

                      border-[#E4E4E4]

                      bg-white

                      pl-[48px]

                      text-[15px]

                      shadow-none

                      focus-visible:ring-[#EA580C]/30

                      sm:h-[58px]

                      sm:rounded-[16px]

                      sm:pl-[52px]
                    "
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="mt-[18px] sm:mt-[22px]">
                <Label
                  className="
                    mb-[8px]

                    block

                    text-[14px]
                    font-medium

                    text-[#2A2A2A]

                    sm:mb-[10px]
                  "
                >
                  Password
                </Label>

                <div className="relative">
                  <Lock
                    className="
                      absolute

                      left-[16px]
                      top-1/2

                      z-10

                      h-[18px]
                      w-[18px]

                      -translate-y-1/2

                      text-[#8C8C8C]

                      sm:left-[18px]
                    "
                  />

                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="
                      h-[52px]

                      rounded-[14px]

                      border-[#E4E4E4]

                      bg-white

                      pl-[48px]

                      text-[15px]

                      shadow-none

                      focus-visible:ring-[#EA580C]/30

                      sm:h-[58px]

                      sm:rounded-[16px]

                      sm:pl-[52px]
                    "
                  />
                </div>
              </div>

              {/* BUTTON */}

              <Button
                onClick={login}
                disabled={loading}
                className="
                  group

                  relative

                  mt-[26px]

                  h-[54px]
                  w-full

                  overflow-hidden

                  rounded-[16px]

                  bg-[#EA580C]

                  text-[15px]
                  font-medium

                  text-white

                  transition-all
                  duration-500

                  hover:bg-[#EA580C]
                  hover:shadow-[0_18px_40px_rgba(234,88,12,0.35)]

                  sm:mt-[30px]

                  sm:h-[60px]

                  sm:rounded-[18px]

                  sm:text-[16px]
                "
              >
                <span
                  className="
                    absolute

                    bottom-0
                    left-1/2

                    h-[220%]
                    w-[220%]

                    origin-bottom

                    -translate-x-1/2
                    translate-y-full

                    rounded-[100%]

                    bg-white

                    transition-all
                    duration-700
                    ease-[cubic-bezier(0.22,1,0.36,1)]

                    group-hover:translate-y-0
                  "
                />

                <span
                  className="
                    relative
                    z-10

                    flex
                    items-center
                    gap-[10px]
                  "
                >
                  {loading ? (
                    <div
                      className="
                        h-[22px]
                        w-[22px]

                        animate-spin

                        rounded-full

                        border-2
                        border-white
                        border-t-transparent

                        group-hover:border-[#EA580C]
                      "
                    />
                  ) : (
                    <>
                      <span
                        className="
                          transition-all
                          duration-500

                          group-hover:text-[#EA580C]
                        "
                      >
                        Login To Dashboard
                      </span>

                      <ArrowRight
                        className="
                          h-[18px]
                          w-[18px]

                          transition-all
                          duration-500

                          group-hover:translate-x-[4px]
                          group-hover:text-[#EA580C]
                        "
                      />
                    </>
                  )}
                </span>
              </Button>
            </div>

            {/* ================= FOOTER ================= */}

            <p
              className="
                mt-[24px]

                text-center

                text-[12px]

                text-[#888888]

                sm:mt-[28px]

                sm:text-[13px]
              "
            >
              © {new Date().getFullYear()} . All rights reserved.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}