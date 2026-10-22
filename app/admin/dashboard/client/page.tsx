"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowDown,
  ArrowUp,
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
import { Switch } from "@/components/ui/switch";

// ================= CONFIG =================

const ENDPOINT = "/clients-page";
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

interface Client {
  _id?: string;
  name: string;
  logo: string;
  logoAlt: string;
  link: string;
  order: number;
}

interface ClientsData {
  _id?: string;
  hero: Hero;
  clients: Client[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface ClientsPayload {
  hero: Hero;
  clients: Omit<Client, "_id">[];
}

// ================= HELPERS =================

const EMPTY_FORM: ClientsPayload = {
  hero: {
    title: "",
    image: "",
    imageAlt: "",
    breadcrumbHome: "Home",
    breadcrumbHomeLink: "/",
    breadcrumbCurrent: "Clients",
  },
  clients: [],
};

const EMPTY_CLIENT: Client = {
  name: "",
  logo: "",
  logoAlt: "",
  link: "#",
  order: 0,
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

function mapToForm(entry: Partial<ClientsData> | null | undefined): ClientsPayload {
  return {
    hero: { ...EMPTY_FORM.hero, ...(entry?.hero || {}) },
    clients: [...(entry?.clients || [])]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((c, i) => ({ ...c, order: i })),
  };
}

function stripIds(clients: Client[]): Omit<Client, "_id">[] {
  return clients.map(({ _id: _unused, ...rest }) => rest);
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
  objectFit = "object-cover",
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
          className={`relative mb-[10px] ${previewHeight} w-full overflow-hidden rounded-[8px] bg-white`}
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

export default function ClientsPageAdmin() {
  const [entry, setEntry] = useState<ClientsData | null>(null);
  const [form, setForm] = useState<ClientsPayload>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const [heroModal, setHeroModal] = useState(false);
  const [clientModal, setClientModal] = useState(false);
  const [clientDraft, setClientDraft] = useState<Client | null>(null);
  const [clientIndex, setClientIndex] = useState<number | null>(null);

  // ---------- LOAD ----------

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const res = await api.get<ClientsData | ClientsData[]>(ENDPOINT);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setEntry(data || null);
      setForm(mapToForm(data));
    } catch (err) {
      const status =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 404) {
        setEntry(null);
        setForm(EMPTY_FORM);
      } else {
        toast.error(getErrorMessage(err, "Failed to load Clients page"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntry();
  }, []);

  // ---------- SAVE ----------

  const handleSave = async () => {
    if (!form.hero.title.trim()) {
      toast.error("Hero title is required");
      return;
    }
    if (!form.hero.image.trim()) {
      toast.error("Hero image is required");
      return;
    }
    if (form.clients.length === 0) {
      toast.error("Add at least one client");
      return;
    }
    for (const c of form.clients) {
      if (!c.name.trim() || !c.logo.trim()) {
        toast.error("Every client needs a name and logo");
        return;
      }
    }

    try {
      setSaving(true);
      const payload: ClientsPayload = {
        hero: form.hero,
        clients: stripIds(form.clients).map((c, i) => ({ ...c, order: i })),
      };

      if (entry?._id) {
        const res = await api.patch<ClientsData>(ENDPOINT, payload);
        const updated = res.data && !Array.isArray(res.data) ? res.data : null;
        if (updated) {
          setEntry(updated);
          setForm(mapToForm(updated));
        } else {
          setEntry({ ...(entry as ClientsData), ...payload });
        }
        toast.success("Clients page updated");
      } else {
        const res = await api.patch<ClientsData>(ENDPOINT, payload);
        const created = Array.isArray(res.data) ? res.data[0] : res.data;
        setEntry(created || null);
        setForm(mapToForm(created));
        toast.success("Clients page created");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save Clients page"));
    } finally {
      setSaving(false);
    }
  };

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

  // ---------- CLIENTS ----------

  const openAddClient = () => {
    setClientDraft({ ...EMPTY_CLIENT, order: form.clients.length });
    setClientIndex(null);
    setClientModal(true);
  };

  const openEditClient = (idx: number) => {
    setClientDraft({ ...form.clients[idx] });
    setClientIndex(idx);
    setClientModal(true);
  };

  const saveClient = () => {
    if (!clientDraft) return;
    if (!clientDraft.name.trim()) {
      toast.error("Client name is required");
      return;
    }
    if (!clientDraft.logo.trim()) {
      toast.error("Client logo is required");
      return;
    }
    setForm((prev) => {
      const clients = [...prev.clients];
      if (clientIndex !== null) {
        clients[clientIndex] = clientDraft;
      } else {
        clients.push(clientDraft);
      }
      return {
        ...prev,
        clients: clients.map((c, i) => ({ ...c, order: i })),
      };
    });
    setClientModal(false);
    setClientDraft(null);
    setClientIndex(null);
  };

  const removeClient = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      clients: prev.clients
        .filter((_, i) => i !== idx)
        .map((c, i) => ({ ...c, order: i })),
    }));
    toast.success("Client removed");
  };

  const moveClient = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= form.clients.length) return;
    setForm((prev) => {
      const clients = [...prev.clients];
      [clients[idx], clients[target]] = [clients[target], clients[idx]];
      return {
        ...prev,
        clients: clients.map((c, i) => ({ ...c, order: i })),
      };
    });
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
            Clients Page
          </h1>
          <p className="mt-[6px] text-[13px] leading-[1.6] text-[#666666] sm:text-[14px]">
            Manage the hero banner and client logos.
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

      {loading ? (
        <div className="mx-auto mt-[22px] flex min-h-[200px] max-w-[1600px] items-center justify-center">
          <Loader2 className="h-[26px] w-[26px] animate-spin text-[#67003E]" />
        </div>
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

          {/* ================= CLIENTS ================= */}
          <Card className="rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
            <CardContent className="p-[16px] sm:p-[20px]">
              <div className="mb-[14px] flex flex-col gap-[10px] xs:flex-row xs:items-center xs:justify-between">
                <h2 className="text-[16px] font-semibold text-[#111111]">
                  Clients ({form.clients.length})
                </h2>
                <Button
                  onClick={openAddClient}
                  className="h-[38px] w-full gap-[6px] rounded-[10px] bg-[#67003E] text-[13px] font-medium text-white hover:bg-[#4F0030] xs:w-auto"
                >
                  <Plus className="h-[14px] w-[14px]" />
                  Add Client
                </Button>
              </div>

              {form.clients.length === 0 ? (
                <div className="rounded-[14px] border border-dashed border-[#D4B8A8] bg-white/60 p-[32px] text-center">
                  <ImageIcon className="mx-auto h-[26px] w-[26px] text-[#67003E]/50" />
                  <p className="mt-[8px] text-[13px] font-medium text-[#333]">
                    No clients yet
                  </p>
                  <p className="text-[11px] text-[#888]">
                    Add your first client logo above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
                  {form.clients.map((c, i) => (
                    <div
                      key={`${c.name}-${i}`}
                      className="group relative flex flex-col overflow-hidden rounded-[12px] border border-[#ECECEC] bg-white shadow-sm"
                    >
                      <div className="relative aspect-[3/2] w-full bg-white">
                        {c.logo ? (
                          <Image
                            src={resolveImage(c.logo)}
                            alt={c.logoAlt || c.name}
                            fill
                            unoptimized
                            className="object-contain p-3"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-[20px] w-[20px] text-[#67003E]/30" />
                          </div>
                        )}

                        {/* Reorder buttons */}
                        <div className="absolute left-[6px] top-[6px] flex gap-[4px] opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => moveClient(i, -1)}
                            disabled={i === 0}
                            className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white/90 text-[#67003E] shadow-sm disabled:opacity-40"
                            aria-label="Move up"
                          >
                            <ArrowUp className="h-[12px] w-[12px]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveClient(i, 1)}
                            disabled={i === form.clients.length - 1}
                            className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white/90 text-[#67003E] shadow-sm disabled:opacity-40"
                            aria-label="Move down"
                          >
                            <ArrowDown className="h-[12px] w-[12px]" />
                          </button>
                        </div>
                      </div>

                      <div className="p-[10px]">
                        <p className="truncate text-[12px] font-medium text-[#111]">
                          {c.name || "Unnamed"}
                        </p>
                        <p className="truncate text-[10px] text-[#888]">
                          {c.link || "No link"}
                        </p>

                        <div className="mt-[8px] flex gap-[6px]">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => openEditClient(i)}
                            className="h-[28px] flex-1 gap-[4px] rounded-[6px] border-[#D4B8A8] px-[6px] text-[11px] text-[#67003E] hover:bg-[#F8F0F5]"
                          >
                            <Pencil className="h-[10px] w-[10px]" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeClient(i)}
                            className="h-[28px] w-[28px] rounded-[6px] border-[#F3D0D0] p-0 text-[#DC2626] hover:bg-[#FEF2F2]"
                            aria-label="Remove client"
                          >
                            <Trash2 className="h-[11px] w-[11px]" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  placeholder="Our Clients"
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
                  placeholderAlt="Business Handshake for Clients Page"
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
                    placeholder="Clients"
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

      {/* ================= CLIENT MODAL ================= */}
      <AnimatePresence>
        {clientModal && clientDraft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[4px] sm:items-center sm:p-[20px]"
            onClick={() => {
              setClientModal(false);
              setClientDraft(null);
              setClientIndex(null);
            }}
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
                <h2 className="text-[18px] font-semibold text-[#111111] sm:text-[22px]">
                  {clientIndex !== null ? "Edit Client" : "Add Client"}
                </h2>
                <button
                  onClick={() => {
                    setClientModal(false);
                    setClientDraft(null);
                    setClientIndex(null);
                  }}
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#F4F1EA] text-[#666666] hover:bg-[#EDE3D6]"
                >
                  <X className="h-[17px] w-[17px]" />
                </button>
              </div>

              <div className="space-y-[14px]">
                <FormField
                  label="Client Name"
                  value={clientDraft.name}
                  onChange={(v) => setClientDraft({ ...clientDraft, name: v })}
                  placeholder="Aramco"
                />

                <ImageUploadField
                  label="Logo"
                  value={clientDraft.logo}
                  altValue={clientDraft.logoAlt}
                  onImageChange={(url) =>
                    setClientDraft({ ...clientDraft, logo: url })
                  }
                  onAltChange={(alt) =>
                    setClientDraft({ ...clientDraft, logoAlt: alt })
                  }
                  placeholderAlt="Aramco Logo"
                  previewHeight="h-[120px]"
                  objectFit="object-contain"
                />

                <FormField
                  label="Link"
                  value={clientDraft.link}
                  onChange={(v) => setClientDraft({ ...clientDraft, link: v })}
                  placeholder="https://example.com or #"
                />

                <div className="flex flex-col gap-[10px] pt-[4px] xs:flex-row xs:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setClientModal(false);
                      setClientDraft(null);
                      setClientIndex(null);
                    }}
                    className="h-[46px] rounded-[12px] border-[#E4E4E4] bg-white px-[18px] text-[14px] text-[#666666]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveClient}
                    className="h-[46px] rounded-[12px] bg-[#67003E] px-[22px] text-[14px] font-medium text-white hover:bg-[#4F0030]"
                  >
                    {clientIndex !== null ? "Save Client" : "Add Client"}
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