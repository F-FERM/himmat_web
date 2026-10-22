"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  ImageIcon,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
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

const ENDPOINT = "/side-panel";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// ================= TYPES =================

interface Logo {
  image: string;
  imageAlt: string;
}

interface About {
  description: string;
}

interface Contact {
  title: string;
  address: string;
  email: string;
  phoneNumbers: string[];
}

interface SidePanelData {
  _id?: string;
  logo: Logo;
  about: About;
  contact: Contact;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface SidePanelPayload {
  logo: Logo;
  about: About;
  contact: Contact;
}

// ================= HELPERS =================

const EMPTY_FORM: SidePanelPayload = {
  logo: {
    image: "",
    imageAlt: "",
  },
  about: {
    description: "",
  },
  contact: {
    title: "Contact",
    address: "",
    email: "",
    phoneNumbers: [],
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

function mapToForm(entry: Partial<SidePanelData> | null | undefined): SidePanelPayload {
  return {
    logo: { ...EMPTY_FORM.logo, ...(entry?.logo || {}) },
    about: { ...EMPTY_FORM.about, ...(entry?.about || {}) },
    contact: {
      ...EMPTY_FORM.contact,
      ...(entry?.contact || {}),
      phoneNumbers: [...(entry?.contact?.phoneNumbers || [])],
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
  previewHeight = "h-[120px]",
  objectFit = "object-contain",
}: {
  label: string;
  value: string;
  altValue?: string;
  onImageChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
  placeholderAlt?: string;
  previewHeight?: string;
  objectFit?: "object-cover" | "object-contain";
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
          className={`relative mb-[10px] ${previewHeight} w-full overflow-hidden rounded-[8px] bg-[#1a1a1a]`}
        >
          <Image
            src={resolveImage(value)}
            alt={altValue || label}
            fill
            unoptimized
            className={objectFit}
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
        accept="image/*,.svg"
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
      <Label className="mb-[8px] block text-[13px] font-medium text-[#2A2A2A]">
        Phone Numbers ({numbers.length})
      </Label>

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

// ================= SHARED MODAL =================

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[4px] sm:items-center sm:p-[20px]"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[94vh] w-full overflow-y-auto rounded-t-[24px] bg-white p-[18px] shadow-[0_30px_80px_rgba(0,0,0,0.25)] xs:p-[22px] sm:max-h-[92vh] sm:max-w-[560px] sm:rounded-[28px] sm:p-[28px]"
          >
            <div className="mb-[16px] flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-[#111111] sm:text-[20px]">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#F4F1EA] text-[#666666] hover:bg-[#EDE3D6]"
              >
                <X className="h-[17px] w-[17px]" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ================= MAIN PAGE =================

export default function SidePanelAdmin() {
  const [entry, setEntry] = useState<SidePanelData | null>(null);
  const [form, setForm] = useState<SidePanelPayload>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [logoModal, setLogoModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);
  const [contactModal, setContactModal] = useState(false);

  // ---------- LOAD ----------

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const res = await api.get<SidePanelData | SidePanelData[]>(ENDPOINT);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setEntry(data || null);
      setForm(mapToForm(data));
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load Side Panel"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntry();
  }, []);

  // ---------- SAVE ----------

  const handleSave = async () => {
    if (!entry?._id) {
      toast.error("Side panel not found — create via API/seed first");
      return;
    }
    if (!form.logo.image.trim()) {
      toast.error("Logo image is required");
      return;
    }
    if (!form.about.description.trim()) {
      toast.error("About description is required");
      return;
    }
    if (!form.contact.title.trim()) {
      toast.error("Contact title is required");
      return;
    }

    try {
      setSaving(true);
      const payload: SidePanelPayload = {
        logo: form.logo,
        about: form.about,
        contact: {
          ...form.contact,
          phoneNumbers: form.contact.phoneNumbers
            .map((n) => n.trim())
            .filter(Boolean),
        },
      };

      const res = await api.patch<SidePanelData>(ENDPOINT, payload);
      const updated = res.data && !Array.isArray(res.data) ? res.data : null;
      if (updated) {
        setEntry(updated);
        setForm(mapToForm(updated));
      } else {
        setEntry({ ...(entry as SidePanelData), ...payload });
      }
      toast.success("Side panel updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save Side Panel"));
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
            Side Panel
          </h1>
          <p className="mt-[6px] text-[13px] leading-[1.6] text-[#666666] sm:text-[14px]">
            Manage the logo, about text, and contact details shown in the side menu.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || loading || !entry}
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
            <p className="text-[14px] font-medium text-[#333]">Side panel not found</p>
            <p className="mt-[4px] text-[12px] text-[#888]">
              This endpoint supports PATCH only — create the document via API/seed first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mx-auto mt-[22px] grid max-w-[1600px] grid-cols-1 gap-4 lg:grid-cols-2">
          {/* ================= LOGO CARD ================= */}
          <Card className="overflow-hidden rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
            <div className="relative flex h-[140px] w-full items-center justify-center bg-[#1a1a1a]">
              {form.logo.image ? (
                <div className="relative h-[70px] w-[200px]">
                  <Image
                    src={resolveImage(form.logo.image)}
                    alt={form.logo.imageAlt || "Logo"}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
              ) : (
                <ImageIcon className="h-[26px] w-[26px] text-white/30" />
              )}
              <span className="absolute left-[12px] top-[12px] rounded-full bg-[#67003E]/90 px-[10px] py-[5px] text-[11px] font-medium text-white backdrop-blur-sm">
                Logo
              </span>
            </div>
            <CardContent className="p-[16px] sm:p-[18px]">
              <h3 className="text-[16px] font-semibold text-[#111111] sm:text-[17px]">
                Logo
              </h3>
              <p className="mt-[4px] text-[12px] text-[#666666]">
                {form.logo.imageAlt || "No alt text"}
              </p>
              <div className="mt-[14px]">
                <Button
                  onClick={() => setLogoModal(true)}
                  className="h-[38px] w-full gap-[6px] rounded-[10px] bg-[#67003E] text-[13px] font-medium text-white hover:bg-[#4F0030]"
                >
                  <Pencil className="h-[13px] w-[13px]" />
                  Edit Logo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ================= ABOUT CARD ================= */}
          <Card className="overflow-hidden rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
            <CardContent className="p-[16px] sm:p-[20px]">
              <div className="mb-[14px] flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-[#111111]">
                  About
                </h3>
                <Button
                  onClick={() => setAboutModal(true)}
                  className="h-[34px] gap-[6px] rounded-[8px] bg-[#67003E] px-[10px] text-[12px] font-medium text-white hover:bg-[#4F0030]"
                >
                  <Pencil className="h-[12px] w-[12px]" />
                  Edit
                </Button>
              </div>
              <p className="line-clamp-6 text-[13px] leading-[1.6] text-[#555]">
                {form.about.description || "No about description yet."}
              </p>
            </CardContent>
          </Card>

          {/* ================= CONTACT CARD ================= */}
          <Card className="overflow-hidden rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)] lg:col-span-2">
            <CardContent className="p-[16px] sm:p-[20px]">
              <div className="mb-[14px] flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-[#111111]">
                  Contact
                </h3>
                <Button
                  onClick={() => setContactModal(true)}
                  className="h-[34px] gap-[6px] rounded-[8px] bg-[#67003E] px-[10px] text-[12px] font-medium text-white hover:bg-[#4F0030]"
                >
                  <Pencil className="h-[12px] w-[12px]" />
                  Edit
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[10px] border border-[#E4E4E4] p-[10px]">
                  <p className="text-[10px] uppercase tracking-wide text-[#999]">
                    Title
                  </p>
                  <p className="mt-[2px] text-[13px] font-medium text-[#111]">
                    {form.contact.title || "—"}
                  </p>
                </div>
                <div className="rounded-[10px] border border-[#E4E4E4] p-[10px]">
                  <div className="flex items-center gap-[4px] text-[10px] uppercase tracking-wide text-[#999]">
                    <Mail className="h-[10px] w-[10px]" /> Email
                  </div>
                  <p className="mt-[2px] truncate text-[13px] font-medium text-[#111]">
                    {form.contact.email || "—"}
                  </p>
                </div>
                <div className="rounded-[10px] border border-[#E4E4E4] p-[10px]">
                  <div className="flex items-center gap-[4px] text-[10px] uppercase tracking-wide text-[#999]">
                    <Phone className="h-[10px] w-[10px]" /> Phones
                  </div>
                  <p className="mt-[2px] text-[13px] font-medium text-[#111]">
                    {form.contact.phoneNumbers.length} number
                    {form.contact.phoneNumbers.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="rounded-[10px] border border-[#E4E4E4] p-[10px]">
                  <div className="flex items-center gap-[4px] text-[10px] uppercase tracking-wide text-[#999]">
                    <MapPin className="h-[10px] w-[10px]" /> Address
                  </div>
                  <p className="mt-[2px] line-clamp-2 text-[12px] text-[#333]">
                    {form.contact.address || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= LOGO MODAL ================= */}
      <Modal open={logoModal} title="Edit Logo" onClose={() => setLogoModal(false)}>
        <div className="space-y-[12px]">
          <ImageUploadField
            label="Logo Image"
            value={form.logo.image}
            altValue={form.logo.imageAlt}
            onImageChange={(url) =>
              setForm({ ...form, logo: { ...form.logo, image: url } })
            }
            onAltChange={(alt) =>
              setForm({ ...form, logo: { ...form.logo, imageAlt: alt } })
            }
            placeholderAlt="Himmat Logo"
            previewHeight="h-[100px]"
            objectFit="object-contain"
          />

          <div className="flex flex-col gap-[10px] pt-[4px] xs:flex-row xs:justify-end">
            <Button
              variant="outline"
              onClick={() => setLogoModal(false)}
              className="h-[44px] rounded-[12px] border-[#E4E4E4] bg-white px-[18px] text-[14px] text-[#666666]"
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================= ABOUT MODAL ================= */}
      <Modal open={aboutModal} title="Edit About" onClose={() => setAboutModal(false)}>
        <div className="space-y-[12px]">
          <FormField
            label="Description"
            value={form.about.description}
            onChange={(v) =>
              setForm({ ...form, about: { ...form.about, description: v } })
            }
            placeholder="Founded in 2022 in the Kingdom of Saudi Arabia..."
            textarea
            rows={6}
          />
          <div className="flex flex-col gap-[10px] pt-[4px] xs:flex-row xs:justify-end">
            <Button
              variant="outline"
              onClick={() => setAboutModal(false)}
              className="h-[44px] rounded-[12px] border-[#E4E4E4] bg-white px-[18px] text-[14px] text-[#666666]"
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================= CONTACT MODAL ================= */}
      <Modal
        open={contactModal}
        title="Edit Contact"
        onClose={() => setContactModal(false)}
      >
        <div className="space-y-[12px]">
          <FormField
            label="Title"
            value={form.contact.title}
            onChange={(v) =>
              setForm({ ...form, contact: { ...form.contact, title: v } })
            }
            placeholder="Contact"
          />
          <FormField
            label="Address"
            value={form.contact.address}
            onChange={(v) =>
              setForm({ ...form, contact: { ...form.contact, address: v } })
            }
            placeholder="#502, 5th Floor, Al Dana Tower..."
            textarea
            rows={2}
          />
          <FormField
            label="Email"
            value={form.contact.email}
            onChange={(v) =>
              setForm({ ...form, contact: { ...form.contact, email: v } })
            }
            placeholder="info@himmat.com.sa"
          />
          <div className="rounded-[12px] border border-[#E4E4E4] p-[12px]">
            <PhoneNumbersEditor
              numbers={form.contact.phoneNumbers}
              onChange={(numbers) =>
                setForm({
                  ...form,
                  contact: { ...form.contact, phoneNumbers: numbers },
                })
              }
            />
          </div>
          <div className="flex flex-col gap-[10px] pt-[4px] xs:flex-row xs:justify-end">
            <Button
              variant="outline"
              onClick={() => setContactModal(false)}
              className="h-[44px] rounded-[12px] border-[#E4E4E4] bg-white px-[18px] text-[14px] text-[#666666]"
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}