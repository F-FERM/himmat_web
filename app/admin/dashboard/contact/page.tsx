"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  ImageIcon,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import { fileUpload } from "@/app/api/admin/upload/upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ================= CONFIG =================

const ENDPOINT = "/contact-page";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// ================= TYPES =================

interface Hero {
  title: string;
  image: string;
  imageAlt: string;
  breadcrumbHome: string;
  breadcrumbHomeLink: string;
  breadcrumbCurrent: string;
}

interface ContactInfo {
  title: string;
  phoneTitle: string;
  phoneNumbers: string[];
  emailTitle: string;
  email: string;
  locationTitle: string;
  address: string;
  formTitle: string;
  formButtonText: string;
}

interface ContactData {
  _id?: string;
  hero: Hero;
  contactInfo: ContactInfo;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface ContactPayload {
  hero: Hero;
  contactInfo: ContactInfo;
}

// ================= HELPERS =================

const EMPTY_FORM: ContactPayload = {
  hero: {
    title: "",
    image: "",
    imageAlt: "",
    breadcrumbHome: "Home",
    breadcrumbHomeLink: "/",
    breadcrumbCurrent: "Contact",
  },
  contactInfo: {
    title: "",
    phoneTitle: "Call Us:",
    phoneNumbers: [],
    emailTitle: "Email :",
    email: "",
    locationTitle: "Location:",
    address: "",
    formTitle: "Request For Quote",
    formButtonText: "Submit",
  },
};

function resolveImage(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${IMAGE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "data" in err.response &&
    err.response.data &&
    typeof err.response.data === "object" &&
    "message" in err.response.data
  ) {
    return String(err.response.data.message);
  }
  return fallback;
}

function mapToForm(entry: Partial<ContactData> | null | undefined): ContactPayload {
  return {
    hero: { ...EMPTY_FORM.hero, ...(entry?.hero || {}) },
    contactInfo: {
      ...EMPTY_FORM.contactInfo,
      ...(entry?.contactInfo || {}),
      phoneNumbers: [...(entry?.contactInfo?.phoneNumbers || [])],
    },
  };
}

// ================= REUSABLE FIELDS =================

function FormField({
  label,
  value,
  onChange,
  placeholder,
  className = "",
  textarea = false,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div className={className}>
      <Label className="mb-[8px] block text-[13px] font-medium text-[#2A2A2A]">
        {label}
      </Label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full rounded-[12px] border border-[#E4E4E4] bg-white px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#67003E]/30"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-[46px] rounded-[12px] border-[#E4E4E4] bg-white text-[14px] focus-visible:ring-[#67003E]/30 sm:h-[48px]"
        />
      )}
    </div>
  );
}

function ImageUploadField({
  label,
  value,
  altValue,
  onImageChange,
  onAltChange,
  placeholderAlt,
  previewHeight = "h-[160px]",
}: {
  label: string;
  value: string;
  altValue?: string;
  onImageChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
  placeholderAlt?: string;
  previewHeight?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const result = await fileUpload(file);
      onImageChange(result.url);
      toast.success(`${label} uploaded`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload image"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-[12px] border border-[#D4B8A8] bg-[#F8F0F5] p-[12px]">
      <Label className="mb-[6px] block text-[12px] font-medium text-[#2A2A2A]">
        {label}
      </Label>

      {value ? (
        <div
          className={`relative mb-[10px] ${previewHeight} w-full overflow-hidden rounded-[8px] bg-white`}
        >
          <Image
            src={resolveImage(value)}
            alt={altValue || label}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className={`mb-[10px] flex ${previewHeight} w-full items-center justify-center rounded-[8px] border border-dashed border-[#D4B8A8] bg-white/60`}
        >
          <ImageIcon className="h-[22px] w-[22px] text-[#67003E]/40" />
        </div>
      )}

      {onAltChange && (
        <FormField
          label="Alt Text"
          value={altValue || ""}
          onChange={onAltChange}
          placeholder={placeholderAlt}
          className="mb-2"
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="h-[38px] w-full gap-[6px] rounded-[8px] border-[#D4B8A8] bg-white text-[12px] font-medium text-[#67003E] hover:bg-[#F8F0F5] hover:text-[#67003E]"
      >
        {uploading ? (
          <Loader2 className="h-[14px] w-[14px] animate-spin" />
        ) : value ? (
          <ImagePlus className="h-[14px] w-[14px]" />
        ) : (
          <UploadCloud className="h-[14px] w-[14px]" />
        )}
        {value ? `Replace ${label}` : `Upload ${label}`}
      </Button>
    </div>
  );
}

// ================= PHONE NUMBER EDITOR =================

function PhoneNumbersEditor({
  numbers,
  onChange,
}: {
  numbers: string[];
  onChange: (numbers: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...numbers, v]);
    setDraft("");
  };

  const remove = (idx: number) => onChange(numbers.filter((_, i) => i !== idx));

  const update = (idx: number, value: string) =>
    onChange(numbers.map((n, i) => (i === idx ? value : n)));

  return (
    <div>
      <div className="mb-[8px] flex items-center justify-between">
        <Label className="block text-[13px] font-medium text-[#2A2A2A]">
          Phone Numbers ({numbers.length})
        </Label>
      </div>

      <div className="mb-2 space-y-2">
        {numbers.length === 0 && (
          <p className="text-[12px] text-[#888888]">No phone numbers yet.</p>
        )}
        {numbers.map((n, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-[10px] border border-[#E4E4E4] bg-white p-[8px]"
          >
            <Input
              value={n}
              onChange={(e) => update(i, e.target.value)}
              className="h-[38px] flex-1 rounded-[8px] border-[#E4E4E4] text-[13px]"
              placeholder="+966 54 060 5978"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => remove(i)}
              className="h-[38px] w-[38px] rounded-[8px] border-[#F3D0D0] p-0 text-[#DC2626] hover:bg-[#FEF2F2]"
              aria-label="Remove phone number"
            >
              <Trash2 className="h-[14px] w-[14px]" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add phone number and press Add"
          className="h-[40px] flex-1 rounded-[10px] border-[#E4E4E4] bg-white text-[13px]"
        />
        <Button
          type="button"
          onClick={add}
          className="h-[40px] gap-[4px] rounded-[10px] bg-[#67003E] px-3 text-[12px] text-white hover:bg-[#4F0030]"
        >
          <Plus className="h-[12px] w-[12px]" /> Add
        </Button>
      </div>
    </div>
  );
}

// ================= MAIN PAGE =================

export default function ContactPageAdmin() {
  const [entry, setEntry] = useState<ContactData | null>(null);
  const [form, setForm] = useState<ContactPayload>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [heroModal, setHeroModal] = useState(false);

  // ---------- LOAD ----------

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const res = await api.get<ContactData | ContactData[]>(ENDPOINT);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setEntry(data || null);
      setForm(mapToForm(data));
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load Contact page"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntry();
  }, []);

  // ---------- SAVE (PATCH only) ----------

  const handleSave = async () => {
    if (!entry?._id) {
      toast.error("Page not found — cannot patch");
      return;
    }
    if (!form.hero.title.trim()) {
      toast.error("Hero title is required");
      return;
    }
    if (!form.hero.image.trim()) {
      toast.error("Hero image is required");
      return;
    }
    if (!form.contactInfo.title.trim()) {
      toast.error("Contact info title is required");
      return;
    }

    try {
      setSaving(true);
      const payload: ContactPayload = {
        hero: form.hero,
        contactInfo: {
          ...form.contactInfo,
          phoneNumbers: form.contactInfo.phoneNumbers
            .map((n) => n.trim())
            .filter(Boolean),
        },
      };

      const res = await api.patch<ContactData>(ENDPOINT, payload);
      const updated = res.data && !Array.isArray(res.data) ? res.data : null;
      if (updated) {
        setEntry(updated);
        setForm(mapToForm(updated));
      } else {
        setEntry({ ...(entry as ContactData), ...payload });
      }
      toast.success("Contact page updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save Contact page"));
    } finally {
      setSaving(false);
    }
  };

  // ---------- RENDER ----------

  return (
    <section className="min-h-screen bg-[#F8F0F5] px-[16px] py-[24px] xs:px-[20px] sm:px-[28px] sm:py-[36px] md:px-[36px] lg:px-[48px] lg:py-[48px] 2xl:px-[64px]">
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
          success: { iconTheme: { primary: "#67003E", secondary: "#fff" } },
          error: { iconTheme: { primary: "#DC2626", secondary: "#fff" } },
        }}
      />

      {/* HEADER */}
      <div className="mx-auto flex max-w-[1600px] flex-col gap-[14px] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.5px] text-[#111111] xs:text-[24px] sm:text-[28px] lg:text-[32px]">
            Contact Page
          </h1>
          <p className="mt-[6px] text-[13px] leading-[1.6] text-[#666666] sm:text-[14px]">
            Manage the hero banner and contact information.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="h-[46px] w-full gap-[8px] rounded-[14px] bg-[#67003E] px-[22px] text-[14px] font-medium text-white hover:bg-[#4F0030] sm:w-auto"
        >
          {saving ? (
            <Loader2 className="h-[16px] w-[16px] animate-spin" />
          ) : (
            <Save className="h-[16px] w-[16px]" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {loading ? (
        <div className="mx-auto mt-[22px] flex min-h-[200px] max-w-[1600px] items-center justify-center">
          <Loader2 className="h-[26px] w-[26px] animate-spin text-[#67003E]" />
        </div>
      ) : !entry ? (
        <Card className="mx-auto mt-[22px] max-w-[1600px] rounded-[20px] border border-dashed border-[#D4B8A8] bg-white/60">
          <CardContent className="p-[32px] text-center">
            <p className="text-[14px] font-medium text-[#333]">Contact page not found</p>
            <p className="mt-[4px] text-[12px] text-[#888]">
              This endpoint supports PATCH only — create the document via API/seed first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mx-auto mt-[22px] grid max-w-[1600px] grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
          {/* ================= HERO CARD ================= */}
          <Card className="group h-fit overflow-hidden rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
            <div className="relative h-[170px] w-full overflow-hidden bg-[#E8D5E0]">
              {form.hero.image ? (
                <Image
                  src={resolveImage(form.hero.image)}
                  alt={form.hero.imageAlt || form.hero.title}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-[26px] w-[26px] text-[#67003E]/40" />
                </div>
              )}
              <span className="absolute left-[12px] top-[12px] rounded-full bg-[#67003E]/90 px-[10px] py-[5px] text-[11px] font-medium text-white backdrop-blur-sm">
                Hero
              </span>
            </div>
            <CardContent className="p-[16px] sm:p-[18px]">
              <h3 className="text-[16px] font-semibold text-[#111111] sm:text-[17px]">
                {form.hero.title || "Hero Section"}
              </h3>
              <p className="mt-[4px] text-[12px] text-[#666666]">
                Breadcrumb: {form.hero.breadcrumbHome} / {form.hero.breadcrumbCurrent}
              </p>
              <div className="mt-[14px]">
                <Button
                  onClick={() => setHeroModal(true)}
                  className="h-[38px] w-full gap-[6px] rounded-[10px] bg-[#67003E] text-[13px] font-medium text-white hover:bg-[#4F0030]"
                >
                  <Pencil className="h-[13px] w-[13px]" />
                  Edit Hero
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ================= CONTACT INFO ================= */}
          <Card className="rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
            <CardContent className="p-[16px] sm:p-[20px]">
              <h2 className="mb-[14px] text-[16px] font-semibold text-[#111111]">
                Contact Info
              </h2>

              <div className="space-y-[14px]">
                <FormField
                  label="Heading Title"
                  value={form.contactInfo.title}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      contactInfo: { ...form.contactInfo, title: v },
                    })
                  }
                  placeholder="Contact Us Today And Let's Bring Your Vision To Life"
                  textarea
                  rows={2}
                />

                {/* PHONE */}
                <div className="rounded-[14px] border border-[#E4E4E4] p-[14px]">
                  <h3 className="mb-3 text-[13px] font-semibold text-[#111]">Phone</h3>
                  <FormField
                    label="Phone Title"
                    value={form.contactInfo.phoneTitle}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        contactInfo: { ...form.contactInfo, phoneTitle: v },
                      })
                    }
                    placeholder="Call Us:"
                    className="mb-3"
                  />
                  <PhoneNumbersEditor
                    numbers={form.contactInfo.phoneNumbers}
                    onChange={(numbers) =>
                      setForm({
                        ...form,
                        contactInfo: { ...form.contactInfo, phoneNumbers: numbers },
                      })
                    }
                  />
                </div>

                {/* EMAIL */}
                <div className="rounded-[14px] border border-[#E4E4E4] p-[14px]">
                  <h3 className="mb-3 text-[13px] font-semibold text-[#111]">Email</h3>
                  <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
                    <FormField
                      label="Email Title"
                      value={form.contactInfo.emailTitle}
                      onChange={(v) =>
                        setForm({
                          ...form,
                          contactInfo: { ...form.contactInfo, emailTitle: v },
                        })
                      }
                      placeholder="Email :"
                    />
                    <FormField
                      label="Email"
                      value={form.contactInfo.email}
                      onChange={(v) =>
                        setForm({
                          ...form,
                          contactInfo: { ...form.contactInfo, email: v },
                        })
                      }
                      placeholder="info@himmat.com.sa"
                    />
                  </div>
                </div>

                {/* LOCATION */}
                <div className="rounded-[14px] border border-[#E4E4E4] p-[14px]">
                  <h3 className="mb-3 text-[13px] font-semibold text-[#111]">Location</h3>
                  <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
                    <FormField
                      label="Location Title"
                      value={form.contactInfo.locationTitle}
                      onChange={(v) =>
                        setForm({
                          ...form,
                          contactInfo: { ...form.contactInfo, locationTitle: v },
                        })
                      }
                      placeholder="Location:"
                    />
                    <FormField
                      label="Address"
                      value={form.contactInfo.address}
                      onChange={(v) =>
                        setForm({
                          ...form,
                          contactInfo: { ...form.contactInfo, address: v },
                        })
                      }
                      placeholder="#502, 5th Floor, Al Dana Tower..."
                    />
                  </div>
                </div>

                {/* FORM */}
                <div className="rounded-[14px] border border-[#E4E4E4] p-[14px]">
                  <h3 className="mb-3 text-[13px] font-semibold text-[#111]">Form</h3>
                  <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
                    <FormField
                      label="Form Title"
                      value={form.contactInfo.formTitle}
                      onChange={(v) =>
                        setForm({
                          ...form,
                          contactInfo: { ...form.contactInfo, formTitle: v },
                        })
                      }
                      placeholder="Request For Quote"
                    />
                    <FormField
                      label="Button Text"
                      value={form.contactInfo.formButtonText}
                      onChange={(v) =>
                        setForm({
                          ...form,
                          contactInfo: { ...form.contactInfo, formButtonText: v },
                        })
                      }
                      placeholder="Submit"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= HERO MODAL ================= */}
      <AnimatePresence>
        {heroModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[4px] sm:items-center sm:p-[20px]"
            onClick={() => setHeroModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[94vh] w-full overflow-y-auto rounded-t-[24px] bg-white p-[18px] shadow-[0_30px_80px_rgba(0,0,0,0.25)] xs:p-[22px] sm:max-h-[92vh] sm:max-w-[720px] sm:rounded-[28px] sm:p-[28px]"
            >
              <div className="mb-[16px] flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-[#111111] sm:text-[22px]">
                  Edit Hero
                </h2>
                <button
                  onClick={() => setHeroModal(false)}
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#F4F1EA] text-[#666666] hover:bg-[#EDE3D6]"
                >
                  <X className="h-[17px] w-[17px]" />
                </button>
              </div>

              <div className="space-y-[14px]">
                <FormField
                  label="Title"
                  value={form.hero.title}
                  onChange={(v) => setForm({ ...form, hero: { ...form.hero, title: v } })}
                  placeholder="Contact Us"
                />

                <ImageUploadField
                  label="Hero Image"
                  value={form.hero.image}
                  altValue={form.hero.imageAlt}
                  onImageChange={(url) =>
                    setForm({ ...form, hero: { ...form.hero, image: url } })
                  }
                  onAltChange={(alt) =>
                    setForm({ ...form, hero: { ...form.hero, imageAlt: alt } })
                  }
                  placeholderAlt="Contact Us Banner"
                />

                <div className="rounded-[12px] border border-[#E4E4E4] p-[14px]">
                  <h3 className="mb-3 text-[14px] font-semibold text-[#111111]">
                    Breadcrumb
                  </h3>
                  <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
                    <FormField
                      label="Home Label"
                      value={form.hero.breadcrumbHome}
                      onChange={(v) =>
                        setForm({ ...form, hero: { ...form.hero, breadcrumbHome: v } })
                      }
                      placeholder="Home"
                    />
                    <FormField
                      label="Home Link"
                      value={form.hero.breadcrumbHomeLink}
                      onChange={(v) =>
                        setForm({
                          ...form,
                          hero: { ...form.hero, breadcrumbHomeLink: v },
                        })
                      }
                      placeholder="/"
                    />
                  </div>
                  <FormField
                    label="Current Page"
                    value={form.hero.breadcrumbCurrent}
                    onChange={(v) =>
                      setForm({ ...form, hero: { ...form.hero, breadcrumbCurrent: v } })
                    }
                    placeholder="Contact"
                    className="mt-3"
                  />
                </div>

                <div className="flex flex-col gap-[10px] pt-[4px] xs:flex-row xs:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setHeroModal(false)}
                    className="h-[46px] rounded-[12px] border-[#E4E4E4] bg-white px-[18px] text-[14px] text-[#666666]"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => setHeroModal(false)}
                    className="h-[46px] rounded-[12px] bg-[#67003E] px-[22px] text-[14px] font-medium text-white hover:bg-[#4F0030]"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}