"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  ImageIcon,
  ImagePlus,
  Loader2,
  Save,
  UploadCloud,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import { fileUpload } from "@/app/api/admin/upload/upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// ================= CONFIG =================

const ENDPOINT = "/about-page";
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

interface BuiltForProgress {
  companyName: string;
  title: string;
  image: string;
  imageAlt: string;
  yearsNumber: string;
  yearsLabel: string;
  description: string;
}

interface AboutData {
  _id?: string;
  hero: Hero;
  builtForProgress: BuiltForProgress;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Only the editable fields — avoids clobbering other sections
interface AboutPayload {
  hero: Hero;
  builtForProgress: BuiltForProgress;
}

const EMPTY_FORM: AboutPayload = {
  hero: {
    title: "",
    image: "",
    imageAlt: "",
    breadcrumbHome: "Home",
    breadcrumbHomeLink: "/",
    breadcrumbCurrent: "About",
  },
  builtForProgress: {
    companyName: "",
    title: "",
    image: "",
    imageAlt: "",
    yearsNumber: "",
    yearsLabel: "",
    description: "",
  },
};

// ================= HELPERS =================

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

function mapEntryToForm(entry: Partial<AboutData> | null | undefined): AboutPayload {
  return {
    hero: { ...EMPTY_FORM.hero, ...(entry?.hero || {}) },
    builtForProgress: {
      ...EMPTY_FORM.builtForProgress,
      ...(entry?.builtForProgress || {}),
    },
  };
}

// ================= REUSABLE FORM FIELD =================

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
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="rounded-[12px] border-[#E4E4E4] bg-white text-[14px] focus-visible:ring-[#67003E]/30"
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

// ================= IMAGE UPLOAD FIELD =================

function ImageUploadField({
  label,
  value,
  altValue,
  onImageChange,
  onAltChange,
  placeholderAlt = "Image alt text",
  previewHeight = "h-[140px]",
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
          className={`relative mb-[10px] ${previewHeight} w-full overflow-hidden rounded-[8px] bg-[#E8D5E0]`}
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

// ================= MAIN PAGE =================

export default function AboutPageAdmin() {
  const [entry, setEntry] = useState<AboutData | null>(null);
  const [form, setForm] = useState<AboutPayload>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Which section opens in the edit modal
  const [openModal, setOpenModal] = useState<null | "hero" | "built">(null);

  // ---------- LOAD ----------

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const res = await api.get<AboutData | AboutData[]>(ENDPOINT);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setEntry(data || null);
      setForm(mapEntryToForm(data));
    } catch (err) {
      const status =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 404) {
        setEntry(null);
        setForm(EMPTY_FORM);
      } else {
        toast.error(getErrorMessage(err, "Failed to load About page"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntry();
  }, []);

  // ---------- SAVE (PATCH only hero + builtForProgress) ----------

  const handleSave = async () => {
    if (!form.hero.title.trim()) {
      toast.error("Hero title is required");
      return;
    }
    if (!form.hero.image.trim()) {
      toast.error("Hero image is required");
      return;
    }
    if (!form.builtForProgress.title.trim()) {
      toast.error("Built For Progress title is required");
      return;
    }
    if (!form.builtForProgress.image.trim()) {
      toast.error("Built For Progress image is required");
      return;
    }

    try {
      setSaving(true);
      const payload: AboutPayload = {
        hero: form.hero,
        builtForProgress: form.builtForProgress,
      };

      if (entry?._id) {
        const res = await api.patch<AboutData>(ENDPOINT, payload);
        const updated = res.data && !Array.isArray(res.data) ? res.data : null;
        if (updated) {
          setEntry(updated);
          setForm(mapEntryToForm(updated));
        } else {
          setEntry({ ...(entry as AboutData), ...payload });
        }
        toast.success("About page updated");
      } else {
        // No doc yet: create one with only these two sections
        const res = await api.post<AboutData>(ENDPOINT, payload);
        const created = Array.isArray(res.data) ? res.data[0] : res.data;
        setEntry(created || null);
        setForm(mapEntryToForm(created));
        toast.success("About page created");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save About page"));
    } finally {
      setSaving(false);
    }
  };

  // ---------- TOGGLE ACTIVE ----------

  const toggleActive = async () => {
    if (!entry?._id) {
      toast.error("Save the page first");
      return;
    }
    try {
      setToggling(true);
      const next = !entry.isActive;
      await api.patch(ENDPOINT, { isActive: next });
      setEntry({ ...entry, isActive: next });
      toast.success(next ? "Page activated" : "Page deactivated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update status"));
    } finally {
      setToggling(false);
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
            About Page
          </h1>
          <p className="mt-[6px] text-[13px] leading-[1.6] text-[#666666] sm:text-[14px]">
            Manage the Hero and Built For Progress sections.
          </p>
        </div>

        <div className="flex flex-col gap-[10px] xs:flex-row xs:items-center">
          {entry?._id && (
            <div className="flex items-center gap-[8px] rounded-[12px] border border-[#E4E4E4] bg-white px-[12px] py-[10px]">
              <span className="text-[12px] font-medium text-[#111]">Active</span>
              <Switch
                checked={!!entry.isActive}
                onCheckedChange={toggleActive}
                disabled={toggling}
              />
            </div>
          )}
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
            {saving ? "Saving..." : entry?._id ? "Save Changes" : "Create Page"}
          </Button>
        </div>
      </div>

      {/* LIST */}
      <div className="mx-auto mt-[22px] max-w-[1600px] sm:mt-[28px]">
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-[26px] w-[26px] animate-spin text-[#67003E]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {/* HERO CARD */}
            <Card className="group overflow-hidden rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)] sm:rounded-[22px]">
              <div className="relative h-[160px] w-full overflow-hidden bg-[#E8D5E0] sm:h-[180px]">
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
              <CardContent className="p-[16px] sm:p-[20px]">
                <h3 className="text-[16px] font-semibold text-[#111111] sm:text-[18px]">
                  {form.hero.title || "Hero Section"}
                </h3>
                <p className="mt-[4px] text-[12px] text-[#666666] sm:text-[13px]">
                  Breadcrumb: {form.hero.breadcrumbHome} / {form.hero.breadcrumbCurrent}
                </p>
                <div className="mt-[14px]">
                  <Button
                    onClick={() => setOpenModal("hero")}
                    className="h-[38px] w-full gap-[6px] rounded-[10px] bg-[#67003E] text-[13px] font-medium text-white hover:bg-[#4F0030]"
                  >
                    Edit Hero
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* BUILT FOR PROGRESS CARD */}
            <Card className="group overflow-hidden rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)] sm:rounded-[22px]">
              <div className="relative h-[160px] w-full overflow-hidden bg-[#E8D5E0] sm:h-[180px]">
                {form.builtForProgress.image ? (
                  <Image
                    src={resolveImage(form.builtForProgress.image)}
                    alt={form.builtForProgress.imageAlt || form.builtForProgress.title}
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
                  Built For Progress
                </span>
                {form.builtForProgress.yearsNumber && (
                  <span className="absolute right-[12px] top-[12px] rounded-full bg-white/90 px-[10px] py-[5px] text-[11px] font-semibold text-[#67003E] backdrop-blur-sm">
                    {form.builtForProgress.yearsNumber}
                  </span>
                )}
              </div>
              <CardContent className="p-[16px] sm:p-[20px]">
                <h3 className="text-[16px] font-semibold text-[#111111] sm:text-[18px]">
                  {form.builtForProgress.title || "Built For Progress"}
                </h3>
                <p className="mt-[4px] text-[12px] text-[#666666] sm:text-[13px]">
                  {form.builtForProgress.companyName || "Company name"}
                </p>
                <div className="mt-[14px]">
                  <Button
                    onClick={() => setOpenModal("built")}
                    className="h-[38px] w-full gap-[6px] rounded-[10px] bg-[#67003E] text-[13px] font-medium text-white hover:bg-[#4F0030]"
                  >
                    Edit Built For Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ================= HERO MODAL ================= */}
      <AnimatePresence>
        {openModal === "hero" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[4px] sm:items-center sm:p-[20px]"
            onClick={() => setOpenModal(null)}
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
                  onClick={() => setOpenModal(null)}
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
                  placeholder="Who We Are"
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
                  placeholderAlt="Business Handshake"
                  previewHeight="h-[160px]"
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
                    placeholder="About"
                    className="mt-3"
                  />
                </div>

                <div className="flex flex-col gap-[10px] pt-[4px] xs:flex-row xs:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setOpenModal(null)}
                    className="h-[46px] rounded-[12px] border-[#E4E4E4] bg-white px-[18px] text-[14px] text-[#666666]"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => setOpenModal(null)}
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

      {/* ================= BUILT FOR PROGRESS MODAL ================= */}
      <AnimatePresence>
        {openModal === "built" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[4px] sm:items-center sm:p-[20px]"
            onClick={() => setOpenModal(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[94vh] w-full overflow-y-auto rounded-t-[24px] bg-white p-[18px] shadow-[0_30px_80px_rgba(0,0,0,0.25)] xs:p-[22px] sm:max-h-[92vh] sm:max-w-[800px] sm:rounded-[28px] sm:p-[28px]"
            >
              <div className="mb-[16px] flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-[#111111] sm:text-[22px]">
                  Edit Built For Progress
                </h2>
                <button
                  onClick={() => setOpenModal(null)}
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#F4F1EA] text-[#666666] hover:bg-[#EDE3D6]"
                >
                  <X className="h-[17px] w-[17px]" />
                </button>
              </div>

              <div className="space-y-[14px]">
                <FormField
                  label="Company Name"
                  value={form.builtForProgress.companyName}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      builtForProgress: { ...form.builtForProgress, companyName: v },
                    })
                  }
                  placeholder="Himmat Contracting Company"
                />

                <FormField
                  label="Title"
                  value={form.builtForProgress.title}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      builtForProgress: { ...form.builtForProgress, title: v },
                    })
                  }
                  placeholder="Built For Progress"
                />

                <ImageUploadField
                  label="Image"
                  value={form.builtForProgress.image}
                  altValue={form.builtForProgress.imageAlt}
                  onImageChange={(url) =>
                    setForm({
                      ...form,
                      builtForProgress: { ...form.builtForProgress, image: url },
                    })
                  }
                  onAltChange={(alt) =>
                    setForm({
                      ...form,
                      builtForProgress: { ...form.builtForProgress, imageAlt: alt },
                    })
                  }
                  placeholderAlt="Engineers reviewing plans on site"
                  previewHeight="h-[160px]"
                />

                <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
                  <FormField
                    label="Years Number"
                    value={form.builtForProgress.yearsNumber}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        builtForProgress: { ...form.builtForProgress, yearsNumber: v },
                      })
                    }
                    placeholder="4+"
                  />
                  <FormField
                    label="Years Label"
                    value={form.builtForProgress.yearsLabel}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        builtForProgress: { ...form.builtForProgress, yearsLabel: v },
                      })
                    }
                    placeholder="Years Of Experience"
                  />
                </div>

                <FormField
                  label="Description"
                  value={form.builtForProgress.description}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      builtForProgress: { ...form.builtForProgress, description: v },
                    })
                  }
                  placeholder="Long-form description..."
                  textarea
                  rows={8}
                />

                <div className="flex flex-col gap-[10px] pt-[4px] xs:flex-row xs:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setOpenModal(null)}
                    className="h-[46px] rounded-[12px] border-[#E4E4E4] bg-white px-[18px] text-[14px] text-[#666666]"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => setOpenModal(null)}
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