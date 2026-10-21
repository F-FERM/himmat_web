"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Manrope } from "next/font/google";
import { Toaster, toast } from "sonner"; // npm i sonner

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const CONTACT = {
  phones: ["+966 54 060 5978", "+966 54 926 2880"],
  email: "info@himmat.com.sa",
  address: "#502, 5th Floor, Al Dana Tower, Opp. KIMS Hospital, Al Jubail 35514.",
};

type Enquiry = { name: string; phone: string; email: string; message: string };

/**
 * TODO: replace the body with your real request, e.g.
 * const res = await fetch("/api/contact", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) });
 * if (!res.ok) throw new Error("Request failed");
 * For now it only waits a moment and succeeds.
 */
async function sendEnquiry(data: Enquiry) {
  void data;
  await new Promise((resolve) => setTimeout(resolve, 600));
}

// Toast look = the green "alert" from the design (success) and a matching red one (error)
const toastBase = {
  fontFamily: manrope.style.fontFamily,
  fontSize: "17px",
  lineHeight: 1.4,
  borderRadius: "6px",
  padding: "18px",
  width: "100%",
  boxShadow: "none",
} as const;

const successStyle = {
  ...toastBase,
  background: "#D1E7DD",
  color: "#0F5132",
  border: "1px solid #A3CFBB",
} as const;

const errorStyle = {
  ...toastBase,
  background: "#F8D7DA",
  color: "#842029",
  border: "1px solid #F1AEB5",
} as const;

const fieldClass =
  "block w-full h-[58px] border-0 border-b border-[#E3E3E3] bg-transparent text-base text-[#111] " +
  "placeholder:text-[#111] outline-none transition-colors focus:border-[#DAA732] sm:text-[17px]";

function ContactSection() {
  const [sending, setSending] = useState(false);

  // The toast is shown INSIDE the card, between the title and the Name field (like the design).
  // We measure it so the form slides down to make room, and slides back up when the toast closes.
  const slotRef = useRef<HTMLDivElement>(null);
  const [slotH, setSlotH] = useState(0);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    let ro: ResizeObserver | null = null;
    let current: HTMLElement | null = null;

    const update = () => {
      const t = slot.querySelector<HTMLElement>("[data-sonner-toast]");
      if (t !== current) {
        ro?.disconnect();
        current = t;
        if (t) {
          ro = new ResizeObserver(() => setSlotH(t.offsetHeight));
          ro.observe(t);
        }
      }
      setSlotH(t ? t.offsetHeight : 0);
    };

    const mo = new MutationObserver(update);
    mo.observe(slot, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      ro?.disconnect();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data: Enquiry = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
    };

    setSending(true);
    try {
      await sendEnquiry(data);
      toast.dismiss();
      toast("Thank you! Your enquiry has been submitted successfully.", { style: successStyle, duration: 5000 });
      form.reset();
    } catch {
      toast.dismiss();
      toast("Sorry, something went wrong. Please try again.", { style: errorStyle, duration: 5000 });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={`${manrope.className} w-full overflow-x-clip bg-white py-12 sm:py-14 2xl:pb-[60px] 2xl:pt-[73px]`}>
      <div
        className="grid grid-cols-1 gap-10 px-5
                   sm:px-8
                   lg:grid-cols-2 lg:gap-x-12 lg:px-12
                   xl:px-[8%]
                   2xl:ml-[15%] 2xl:mr-[14.9%] 2xl:grid-cols-[683fr_657fr] 2xl:gap-x-0 2xl:px-0"
      >
        {/* ---------- Left: contact details ---------- */}
        <div className="2xl:pr-10">
          <h2 className="max-w-[13em] text-3xl font-semibold leading-[1.18] tracking-[-0.02em] text-[#195992] sm:text-4xl xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
            Contact Us Today And Let’s Bring Your Vision To Life
          </h2>

          <div className="mt-8 sm:mt-10 2xl:mt-12">
            <p className="text-[15px] font-medium text-[#666666]">Call Us:</p>
            <div className="mt-4 flex flex-col text-base leading-[34px] text-[#111] sm:text-lg">
              {CONTACT.phones.map((p) => (
                <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="w-fit">
                  {p}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <p className="text-[15px] font-medium text-[#666666]">Email :</p>
            <a href={`mailto:${CONTACT.email}`} className="mt-4 block w-fit break-all text-base text-[#111] sm:text-lg">
              {CONTACT.email}
            </a>
          </div>

          <div className="mt-7">
            <p className="text-[15px] font-medium text-[#666666]">Location:</p>
            <address className="mt-4 max-w-[540px] text-base not-italic leading-7 text-[#111] sm:text-lg">
              {CONTACT.address}
            </address>
          </div>
        </div>

        {/* ---------- Right: Request For Quote card ---------- */}
        <div className="border border-[#E5E5E5] bg-white p-6 sm:p-8 2xl:p-[45px]">
          <h3 className="text-2xl font-medium text-[#111] sm:text-[28px]">Request For Quote</h3>

          {/*
            Toast slot. The wrapper has a transform, which makes Sonner's "fixed" toast position itself
            relative to THIS box (not the screen), so the toast appears exactly here, full card width.
          */}
          <div
            ref={slotRef}
            className="relative overflow-hidden transition-[height,margin] duration-300 ease-out [transform:translateZ(0)]"
            style={{ height: slotH, marginTop: slotH ? 23 : 0 }}
          >
            <Toaster
              position="top-center"
              offset={0}
              visibleToasts={1}
              style={
                {
                  "--width": "100%",
                  "--offset": "0px",
                  "--offset-top": "0px",
                  "--mobile-offset": "0px",
                } as React.CSSProperties
              }
            />
          </div>

          <form onSubmit={handleSubmit} className="mt-5">
            <input type="text" name="name" placeholder="Name" required autoComplete="name" className={fieldClass} />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              required
              autoComplete="tel"
              className={`${fieldClass} mt-[23px]`}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              autoComplete="email"
              className={`${fieldClass} mt-[23px]`}
            />
            <textarea
              name="message"
              placeholder="Message"
              required
              rows={4}
              className="mt-[23px] block min-h-[141px] w-full resize-y border-0 border-b border-[#E3E3E3] bg-transparent pt-4 text-base
                         text-[#111] outline-none transition-colors placeholder:text-[#111] focus:border-[#DAA732] sm:text-[17px]"
            />

            {/* Submit: gold, rounded, with the default grey "outset" border like the design */}
            <button
              type="submit"
              disabled={sending}
              className="mt-8 h-[52px] cursor-pointer rounded-lg border-2 border-[#767676] bg-[#DAA732] px-[21px]
                         text-lg text-white [border-style:outset] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {sending ? "Sending…" : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;