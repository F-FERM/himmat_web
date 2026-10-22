"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { Manrope } from "next/font/google";
import { Toaster, toast } from "sonner"; 
import api from "@/lib/axios";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// ================= API =================

const ENDPOINT = "/contact-page";
const SUBMIT_ENDPOINT = "/contact-page/submit";

type ApiContactInfo = {
  title?: string;
  phoneTitle?: string;
  phoneNumbers?: string[];
  emailTitle?: string;
  email?: string;
  locationTitle?: string;
  address?: string;
  formTitle?: string;
  formButtonText?: string;
};

type ApiContactPage = { contactInfo?: ApiContactInfo };

type ContactContent = {
  title: string;
  phoneTitle: string;
  phones: string[];
  emailTitle: string;
  email: string;
  locationTitle: string;
  address: string;
  formTitle: string;
  buttonText: string;
};

const FALLBACK_CONTENT: ContactContent = {
  title: "Contact Us Today And Let’s Bring Your Vision To Life",
  phoneTitle: "Call Us:",
  phones: ["+966 54 060 5978", "+966 54 926 2880"],
  emailTitle: "Email :",
  email: "info@himmat.com.sa",
  locationTitle: "Location:",
  address: "#502, 5th Floor, Al Dana Tower, Opp. KIMS Hospital, Al Jubail 35514.",
  formTitle: "Request For Quote",
  buttonText: "Submit",
};

function mapApiContact(
  data: ApiContactPage | ApiContactPage[] | null | undefined
): ContactContent {
  const doc = Array.isArray(data) ? data[0] : data;
  const ci = doc?.contactInfo;
  if (!ci) return FALLBACK_CONTENT;

  const phones = (ci.phoneNumbers ?? []).filter(Boolean);

  return {
    title: ci.title || FALLBACK_CONTENT.title,
    phoneTitle: ci.phoneTitle || FALLBACK_CONTENT.phoneTitle,
    phones: phones.length ? phones : FALLBACK_CONTENT.phones,
    emailTitle: ci.emailTitle || FALLBACK_CONTENT.emailTitle,
    email: ci.email || FALLBACK_CONTENT.email,
    locationTitle: ci.locationTitle || FALLBACK_CONTENT.locationTitle,
    address: ci.address || FALLBACK_CONTENT.address,
    formTitle: ci.formTitle || FALLBACK_CONTENT.formTitle,
    buttonText: ci.formButtonText || FALLBACK_CONTENT.buttonText,
  };
}

// ================= Form submission =================
type Enquiry = { name: string; phone: string; email: string; message: string };

async function sendEnquiry(data: Enquiry) {
  await api.post(SUBMIT_ENDPOINT, data);
}

function getErrorMessage(err: unknown): string {
  const fallback = "Sorry, something went wrong. Please try again.";
  const msg = (err as { response?: { data?: { message?: unknown } } })?.response?.data
    ?.message;
  if (typeof msg === "string" && msg.trim()) return msg;
  if (Array.isArray(msg) && msg.length) return String(msg[0]);
  return fallback;
}

const toastBase = {
  fontFamily: manrope.style.fontFamily,
  fontSize: "16px",
  lineHeight: 1.4,
  borderRadius: "6px",
  padding: "16px",
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

const SECTION =
  "w-full overflow-x-clip bg-white py-10 sm:py-14 lg:py-16 2xl:pb-[60px] 2xl:pt-[73px]";

const GRID =
  "grid grid-cols-1 gap-10 px-4 " +
  "sm:px-8 " +
  "lg:grid-cols-2 lg:gap-x-12 lg:px-12 " +
  "xl:gap-x-16 xl:px-[8%] " +
  "2xl:ml-[15%] 2xl:mr-[14.9%] 2xl:grid-cols-[683fr_657fr] 2xl:gap-x-0 2xl:px-0";

const CARD = "border border-[#E5E5E5] bg-white p-5 sm:p-8 2xl:p-[45px]";

const fieldClass =
  "block w-full h-[54px] border-0 border-b border-[#E3E3E3] bg-transparent px-0 text-base text-[#111] " +
  "placeholder:text-[#111] outline-none transition-colors focus:border-[#DAA732] " +
  "disabled:opacity-60 sm:h-[58px] sm:text-[17px]";

function ContactSkeleton() {
  return (
    <section className={`${manrope.className} ${SECTION}`} aria-busy="true">
      <div className="mx-auto max-w-[1920px]">
        <div className={GRID}>
          {/* Left skeleton */}
          <div className="2xl:pr-10">
            <div className="space-y-2.5">
              <div className="h-7 w-[90%] max-w-[420px] animate-pulse rounded bg-[#E9EEF4] sm:h-9 xl:h-10" />
              <div className="h-7 w-[70%] max-w-[340px] animate-pulse rounded bg-[#E9EEF4] sm:h-9 xl:h-10" />
              <div className="h-7 w-[50%] max-w-[240px] animate-pulse rounded bg-[#E9EEF4] sm:h-9 xl:h-10" />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className={i === 0 ? "mt-8 sm:mt-10 2xl:mt-12" : "mt-7"}>
                <div className="h-4 w-20 animate-pulse rounded bg-[#E9EEF4]" />
                <div className="mt-4 h-5 w-48 animate-pulse rounded bg-[#E9EEF4] sm:h-6" />
              </div>
            ))}
          </div>

          {/* Right skeleton */}
          <div className={CARD}>
            <div className="h-7 w-48 animate-pulse rounded bg-[#E9EEF4] sm:h-8" />
            <div className="mt-5 space-y-[23px]">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[54px] w-full animate-pulse bg-[#E9EEF4]/60 sm:h-[58px]" />
              ))}
              <div className="h-[141px] w-full animate-pulse bg-[#E9EEF4]/60" />
            </div>
            <div className="mt-8 h-[52px] w-32 animate-pulse rounded-lg bg-[#DAA732]/50" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [content, setContent] = useState<ContactContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiContactPage | ApiContactPage[]>(ENDPOINT);
        if (cancelled) return;
        setContent(mapApiContact(res.data));
      } catch {
        if (!cancelled) setContent(FALLBACK_CONTENT);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

 
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  const [slotH, setSlotH] = useState(0);

  useEffect(() => {
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
  }, [slot]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;

    const form = e.currentTarget;
    const fd = new FormData(form);
    const data: Enquiry = {
      name: String(fd.get("name") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
    };

    setSending(true);
    try {
      await sendEnquiry(data);
      toast.dismiss();
      toast("Thank you! Your enquiry has been submitted successfully.", {
        style: successStyle,
        duration: 5000,
      });
      form.reset();
    } catch (err) {
      toast.dismiss();
      toast(getErrorMessage(err), { style: errorStyle, duration: 5000 });
    } finally {
      setSending(false);
    }
  };

  if (loading || !content) return <ContactSkeleton />;

  const c = content;

  return (
    <section className={`${manrope.className} ${SECTION}`}>
      <div className="mx-auto max-w-[1920px]">
        <div className={GRID}>
          {/* ---------- Left: contact details ---------- */}
          <div className="2xl:pr-10">
            <h2 className="max-w-[13em] text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#195992] sm:text-3xl md:text-4xl lg:text-[32px] xl:text-[38px] 2xl:text-[clamp(30px,2vw,40px)]">
              {c.title}
            </h2>

            <div className="mt-7 sm:mt-10 2xl:mt-12">
              <p className="text-[15px] font-medium text-[#666666]">{c.phoneTitle}</p>
              <div className="mt-3 flex flex-col text-base leading-[34px] text-[#111] sm:mt-4 sm:text-lg">
                {c.phones.map((p) => (
                  <a
                    key={p}
                    href={`tel:${p.replace(/[^\d+]/g, "")}`}
                    className="w-fit hover:underline focus-visible:underline"
                  >
                    {p}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-6 sm:mt-7">
              <p className="text-[15px] font-medium text-[#666666]">{c.emailTitle}</p>
              <a
                href={`mailto:${c.email}`}
                className="mt-3 block w-fit break-all text-base text-[#111] hover:underline focus-visible:underline sm:mt-4 sm:text-lg"
              >
                {c.email}
              </a>
            </div>

            <div className="mt-6 sm:mt-7">
              <p className="text-[15px] font-medium text-[#666666]">{c.locationTitle}</p>
              <address className="mt-3 max-w-[540px] text-base not-italic leading-7 text-[#111] sm:mt-4 sm:text-lg">
                {c.address}
              </address>
            </div>
          </div>

          {/* ---------- Right: Request For Quote card ---------- */}
          <div className={CARD}>
            <h3 className="text-[22px] font-medium text-[#111] sm:text-[28px]">
              {c.formTitle}
            </h3>

            <div
              ref={setSlot}
              className="relative overflow-hidden transition-[height,margin] duration-300 ease-out [transform:translateZ(0)]"
              style={{ height: slotH, marginTop: slotH ? 20 : 0 }}
              aria-live="polite"
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

            <form onSubmit={handleSubmit} className="mt-4 sm:mt-5">
              <fieldset disabled={sending} className="m-0 min-w-0 border-0 p-0">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  required
                  autoComplete="name"
                  className={fieldClass}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  required
                  autoComplete="tel"
                  className={`${fieldClass} mt-5 sm:mt-[23px]`}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  autoComplete="email"
                  className={`${fieldClass} mt-5 sm:mt-[23px]`}
                />
                <textarea
                  name="message"
                  placeholder="Message"
                  required
                  rows={4}
                  className="mt-5 block min-h-[120px] w-full resize-y border-0 border-b border-[#E3E3E3] bg-transparent px-0 pt-4 text-base text-[#111]
                             outline-none transition-colors placeholder:text-[#111] focus:border-[#DAA732] disabled:opacity-60
                             sm:mt-[23px] sm:min-h-[141px] sm:text-[17px]"
                />

                <button
                  type="submit"
                  disabled={sending}
                  className="mt-7 h-[52px] w-full cursor-pointer rounded-lg border-2 border-[#767676] bg-[#DAA732] px-[21px] text-base text-white
                             [border-style:outset] disabled:cursor-not-allowed disabled:opacity-70
                             focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5B96]
                             sm:mt-8 sm:w-auto sm:text-lg"
                >
                  {sending ? "Sending…" : c.buttonText}
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;