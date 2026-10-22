"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  ImageIcon,
  ImagePlus,
  Link as LinkIcon,
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

const ENDPOINT = "/footer";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// ================= TYPES =================

interface ContactInfo {
  title: string;
  address: string;
  email: string;
  phoneNumbers: string[];
}

interface LinkItem {
  _id?: string;
  label: string;
  url: string;
  openInNewTab: boolean;
  order: number;
}

interface LinkColumn {
  _id?: string;
  title: string;
  links: LinkItem[];
  order: number;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface BottomBar {
  copyrightText: string;
  socialLinks: SocialLink[];
}

interface FooterData {
  _id?: string;
  contactInfo: ContactInfo;
  linkColumns: LinkColumn[];
  bottomBar: BottomBar;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface FooterPayload {
  contactInfo: ContactInfo;
  linkColumns: Omit<LinkColumn, "_id">[];
  bottomBar: BottomBar;
}

// ================= HELPERS =================

const EMPTY_FORM: FooterPayload = {
  contactInfo: {
    title: "",
    address: "",
    email: "",
    phoneNumbers: [],
  },
  linkColumns: [],
  bottomBar: {
    copyrightText: "",
    socialLinks: [],
  },
};

const EMPTY_LINK: LinkItem = {
  label: "",
  url: "",
  openInNewTab: false,
  order: 0,
};

const EMPTY_COLUMN: LinkColumn = {
  title: "",
  links: [],
  order: 0,
};

const EMPTY_SOCIAL: SocialLink = {
  platform: "",
  url: "",
  icon: "",
};

const SOCIAL_PLATFORMS = [
  "facebook",
  "linkedin",
  "instagram",
  "twitter",
  "x",
  "youtube",
  "whatsapp",
  "tiktok",
  "snapchat",
] as const;

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

function mapToForm(entry: Partial<FooterData> | null | undefined): FooterPayload {
  return {
    contactInfo: {
      ...EMPTY_FORM.contactInfo,
      ...(entry?.contactInfo || {}),
      phoneNumbers: [...(entry?.contactInfo?.phoneNumbers || [])],
    },
    linkColumns: [...(entry?.linkColumns || [])]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((col, i) => ({
        ...col,
        order: i,
        links: [...(col.links || [])]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((l, j) => ({ ...l, order: j })),
      })),
    bottomBar: {
      copyrightText: entry?.bottomBar?.copyrightText || "",
      socialLinks: [...(entry?.bottomBar?.socialLinks || [])],
    },
  };
}

function stripColumnIds(columns: LinkColumn[]): Omit<LinkColumn, "_id">[] {
  return columns.map(({ _id: _unused, links, ...rest }) => ({
    ...rest,
    links: links.map(({ _id: _unusedL, ...l }) => l),
  }));
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

function IconUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const result = await fileUpload(file);
      onChange(result.url);
      toast.success(`${label} uploaded`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to upload icon"));
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
        <div className="relative mb-[10px] flex h-[70px] w-full items-center justify-center rounded-[8px] bg-white">
          <Image
            src={resolveImage(value)}
            alt={label}
            width={32}
            height={32}
            unoptimized
            className="object-contain"
          />
        </div>
      ) : (
        <div className="mb-[10px] flex h-[70px] w-full items-center justify-center rounded-[8px] border border-dashed border-[#D4B8A8] bg-white/60">
          <ImageIcon className="h-[20px] w-[20px] text-[#67003E]/40" />
        </div>
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
        className="h-[36px] w-full gap-[6px] rounded-[8px] border-[#D4B8A8] bg-white text-[12px] font-medium text-[#67003E] hover:bg-[#F8F0F5] hover:text-[#67003E]"
      >
        {uploading ? (
          <Loader2 className="h-[14px] w-[14px] animate-spin" />
        ) : value ? (
          <ImagePlus className="h-[14px] w-[14px]" />
        ) : (
          <UploadCloud className="h-[14px] w-[14px]" />
        )}
        {value ? "Replace Icon" : "Upload Icon"}
      </Button>
    </div>
  );
}

// ================= MAIN PAGE =================

export default function FooterAdmin() {
  const [entry, setEntry] = useState<FooterData | null>(null);
  const [form, setForm] = useState<FooterPayload>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Contact info modal
  const [contactModal, setContactModal] = useState(false);

  // Column modal
  const [columnModal, setColumnModal] = useState(false);
  const [columnDraft, setColumnDraft] = useState<LinkColumn | null>(null);
  const [columnIndex, setColumnIndex] = useState<number | null>(null);

  // Link (inside a column) modal
  const [linkModal, setLinkModal] = useState(false);
  const [linkDraft, setLinkDraft] = useState<LinkItem | null>(null);
  const [linkColumnIndex, setLinkColumnIndex] = useState<number | null>(null);
  const [linkIndex, setLinkIndex] = useState<number | null>(null);

  // Social link modal
  const [socialModal, setSocialModal] = useState(false);
  const [socialDraft, setSocialDraft] = useState<SocialLink | null>(null);
  const [socialIndex, setSocialIndex] = useState<number | null>(null);

  // ---------- LOAD ----------

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const res = await api.get<FooterData | FooterData[]>(ENDPOINT);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setEntry(data || null);
      setForm(mapToForm(data));
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load Footer"));
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
      toast.error("Footer not found — create via API/seed first");
      return;
    }
    if (!form.contactInfo.title.trim()) {
      toast.error("Contact title is required");
      return;
    }
    if (!form.bottomBar.copyrightText.trim()) {
      toast.error("Copyright text is required");
      return;
    }
    for (const col of form.linkColumns) {
      if (!col.title.trim()) {
        toast.error("Every column needs a title");
        return;
      }
    }

    try {
      setSaving(true);
      const payload: FooterPayload = {
        contactInfo: {
          ...form.contactInfo,
          phoneNumbers: form.contactInfo.phoneNumbers
            .map((n) => n.trim())
            .filter(Boolean),
        },
        linkColumns: stripColumnIds(form.linkColumns).map((c, i) => ({
          ...c,
          order: i,
          links: c.links.map((l, j) => ({ ...l, order: j })),
        })),
        bottomBar: {
          copyrightText: form.bottomBar.copyrightText,
          socialLinks: form.bottomBar.socialLinks
            .filter((s) => s.platform.trim() && s.url.trim())
            .map((s) => ({
              platform: s.platform.trim().toLowerCase(),
              url: s.url.trim(),
              icon: s.icon,
            })),
        },
      };

      const res = await api.patch<FooterData>(ENDPOINT, payload);
      const updated = res.data && !Array.isArray(res.data) ? res.data : null;
      if (updated) {
        setEntry(updated);
        setForm(mapToForm(updated));
      } else {
        setEntry({ ...(entry as FooterData), ...payload });
      }
      toast.success("Footer updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save Footer"));
    } finally {
      setSaving(false);
    }
  };

  // ---------- CONTACT PHONE HELPERS ----------

  const updatePhone = (idx: number, value: string) =>
    setForm((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        phoneNumbers: prev.contactInfo.phoneNumbers.map((n, i) =>
          i === idx ? value : n,
        ),
      },
    }));

  const removePhone = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        phoneNumbers: prev.contactInfo.phoneNumbers.filter((_, i) => i !== idx),
      },
    }));

  const [phoneDraft, setPhoneDraft] = useState("");
  const addPhone = () => {
    const v = phoneDraft.trim();
    if (!v) return;
    setForm((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        phoneNumbers: [...prev.contactInfo.phoneNumbers, v],
      },
    }));
    setPhoneDraft("");
  };

  // ---------- COLUMNS ----------

  const openAddColumn = () => {
    setColumnDraft({ ...EMPTY_COLUMN, order: form.linkColumns.length, links: [] });
    setColumnIndex(null);
    setColumnModal(true);
  };

  const openEditColumn = (idx: number) => {
    setColumnDraft({ ...form.linkColumns[idx] });
    setColumnIndex(idx);
    setColumnModal(true);
  };

  const saveColumn = () => {
    if (!columnDraft) return;
    if (!columnDraft.title.trim()) {
      toast.error("Column title is required");
      return;
    }
    setForm((prev) => {
      const cols = [...prev.linkColumns];
      if (columnIndex !== null) cols[columnIndex] = columnDraft;
      else cols.push(columnDraft);
      return {
        ...prev,
        linkColumns: cols.map((c, i) => ({ ...c, order: i })),
      };
    });
    setColumnModal(false);
    setColumnDraft(null);
    setColumnIndex(null);
  };

  const removeColumn = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      linkColumns: prev.linkColumns
        .filter((_, i) => i !== idx)
        .map((c, i) => ({ ...c, order: i })),
    }));
    toast.success("Column removed");
  };

  const moveColumn = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= form.linkColumns.length) return;
    setForm((prev) => {
      const cols = [...prev.linkColumns];
      [cols[idx], cols[target]] = [cols[target], cols[idx]];
      return { ...prev, linkColumns: cols.map((c, i) => ({ ...c, order: i })) };
    });
  };

  // ---------- LINKS (inside column) ----------

  const openAddLink = (columnIdx: number) => {
    const existing = form.linkColumns[columnIdx].links;
    setLinkDraft({ ...EMPTY_LINK, order: existing.length });
    setLinkColumnIndex(columnIdx);
    setLinkIndex(null);
    setLinkModal(true);
  };

  const openEditLink = (columnIdx: number, idx: number) => {
    setLinkDraft({ ...form.linkColumns[columnIdx].links[idx] });
    setLinkColumnIndex(columnIdx);
    setLinkIndex(idx);
    setLinkModal(true);
  };

  const saveLink = () => {
    if (!linkDraft || linkColumnIndex === null) return;
    if (!linkDraft.label.trim()) {
      toast.error("Link label is required");
      return;
    }
    if (!linkDraft.url.trim()) {
      toast.error("Link URL is required");
      return;
    }
    setForm((prev) => {
      const cols = [...prev.linkColumns];
      const links = [...cols[linkColumnIndex].links];
      if (linkIndex !== null) links[linkIndex] = linkDraft;
      else links.push(linkDraft);
      cols[linkColumnIndex] = {
        ...cols[linkColumnIndex],
        links: links.map((l, i) => ({ ...l, order: i })),
      };
      return { ...prev, linkColumns: cols };
    });
    setLinkModal(false);
    setLinkDraft(null);
    setLinkColumnIndex(null);
    setLinkIndex(null);
  };

  const removeLink = (columnIdx: number, idx: number) => {
    setForm((prev) => {
      const cols = [...prev.linkColumns];
      cols[columnIdx] = {
        ...cols[columnIdx],
        links: cols[columnIdx].links
          .filter((_, i) => i !== idx)
          .map((l, i) => ({ ...l, order: i })),
      };
      return { ...prev, linkColumns: cols };
    });
  };

  const moveLink = (columnIdx: number, idx: number, dir: -1 | 1) => {
    const links = form.linkColumns[columnIdx].links;
    const target = idx + dir;
    if (target < 0 || target >= links.length) return;
    setForm((prev) => {
      const cols = [...prev.linkColumns];
      const next = [...cols[columnIdx].links];
      [next[idx], next[target]] = [next[target], next[idx]];
      cols[columnIdx] = {
        ...cols[columnIdx],
        links: next.map((l, i) => ({ ...l, order: i })),
      };
      return { ...prev, linkColumns: cols };
    });
  };

  // ---------- SOCIALS ----------

  const openAddSocial = () => {
    setSocialDraft({ ...EMPTY_SOCIAL });
    setSocialIndex(null);
    setSocialModal(true);
  };

  const openEditSocial = (idx: number) => {
    setSocialDraft({ ...form.bottomBar.socialLinks[idx] });
    setSocialIndex(idx);
    setSocialModal(true);
  };

  const saveSocial = () => {
    if (!socialDraft) return;
    if (!socialDraft.platform.trim()) {
      toast.error("Platform is required");
      return;
    }
    if (!socialDraft.url.trim()) {
      toast.error("URL is required");
      return;
    }
    setForm((prev) => {
      const socialLinks = [...prev.bottomBar.socialLinks];
      if (socialIndex !== null) socialLinks[socialIndex] = socialDraft;
      else socialLinks.push(socialDraft);
      return { ...prev, bottomBar: { ...prev.bottomBar, socialLinks } };
    });
    setSocialModal(false);
    setSocialDraft(null);
    setSocialIndex(null);
  };

  const removeSocial = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      bottomBar: {
        ...prev.bottomBar,
        socialLinks: prev.bottomBar.socialLinks.filter((_, i) => i !== idx),
      },
    }));
    toast.success("Social link removed");
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
            Footer
          </h1>
          <p className="mt-[6px] text-[13px] leading-[1.6] text-[#666666] sm:text-[14px]">
            Manage contact info, link columns, and bottom bar.
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
            <p className="text-[14px] font-medium text-[#333]">Footer not found</p>
            <p className="mt-[4px] text-[12px] text-[#888]">
              This endpoint supports PATCH only — create the document via API/seed first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mx-auto mt-[22px] max-w-[1600px] space-y-4">
          {/* ================= CONTACT INFO CARD ================= */}
          <Card className="rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
            <CardContent className="p-[16px] sm:p-[20px]">
              <div className="mb-[14px] flex flex-col gap-[10px] xs:flex-row xs:items-center xs:justify-between">
                <h2 className="text-[16px] font-semibold text-[#111111]">
                  Contact Info
                </h2>
                <Button
                  onClick={() => setContactModal(true)}
                  className="h-[36px] w-full gap-[6px] rounded-[10px] bg-[#67003E] text-[12px] font-medium text-white hover:bg-[#4F0030] xs:w-auto"
                >
                  <Pencil className="h-[12px] w-[12px]" />
                  Edit Contact
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 text-[13px] sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[10px] border border-[#E4E4E4] p-[10px]">
                  <p className="text-[10px] uppercase tracking-wide text-[#999]">
                    Title
                  </p>
                  <p className="mt-[2px] font-medium text-[#111]">
                    {form.contactInfo.title || "—"}
                  </p>
                </div>
                <div className="rounded-[10px] border border-[#E4E4E4] p-[10px]">
                  <p className="text-[10px] uppercase tracking-wide text-[#999]">
                    Email
                  </p>
                  <p className="mt-[2px] truncate font-medium text-[#111]">
                    {form.contactInfo.email || "—"}
                  </p>
                </div>
                <div className="rounded-[10px] border border-[#E4E4E4] p-[10px]">
                  <p className="text-[10px] uppercase tracking-wide text-[#999]">
                    Phones
                  </p>
                  <p className="mt-[2px] font-medium text-[#111]">
                    {form.contactInfo.phoneNumbers.length} number
                    {form.contactInfo.phoneNumbers.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="rounded-[10px] border border-[#E4E4E4] p-[10px]">
                  <p className="text-[10px] uppercase tracking-wide text-[#999]">
                    Address
                  </p>
                  <p className="mt-[2px] line-clamp-2 text-[12px] text-[#333]">
                    {form.contactInfo.address || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ================= LINK COLUMNS ================= */}
          <Card className="rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
            <CardContent className="p-[16px] sm:p-[20px]">
              <div className="mb-[14px] flex flex-col gap-[10px] xs:flex-row xs:items-center xs:justify-between">
                <h2 className="text-[16px] font-semibold text-[#111111]">
                  Link Columns ({form.linkColumns.length})
                </h2>
                <Button
                  onClick={openAddColumn}
                  className="h-[38px] w-full gap-[6px] rounded-[10px] bg-[#67003E] text-[13px] font-medium text-white hover:bg-[#4F0030] xs:w-auto"
                >
                  <Plus className="h-[14px] w-[14px]" />
                  Add Column
                </Button>
              </div>

              {form.linkColumns.length === 0 ? (
                <div className="rounded-[14px] border border-dashed border-[#D4B8A8] bg-white/60 p-[32px] text-center">
                  <LinkIcon className="mx-auto h-[26px] w-[26px] text-[#67003E]/50" />
                  <p className="mt-[8px] text-[13px] font-medium text-[#333]">
                    No columns yet
                  </p>
                  <p className="text-[11px] text-[#888]">
                    Add a link column to get started.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {form.linkColumns.map((col, ci) => (
                    <div
                      key={ `col-${ci}`}
                      className="rounded-[12px] border border-[#ECECEC] bg-white p-[12px]"
                    >
                      <div className="mb-[10px] flex items-center justify-between gap-2">
                        <h3 className="truncate text-[14px] font-semibold text-[#111]">
                          {col.title || "Untitled column"}
                          <span className="ml-[6px] text-[11px] font-normal text-[#888]">
                            ({col.links.length})
                          </span>
                        </h3>
                        <div className="flex gap-[4px]">
                          <button
                            type="button"
                            onClick={() => moveColumn(ci, -1)}
                            disabled={ci === 0}
                            className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#F8F0F5] text-[#67003E] disabled:opacity-40"
                            aria-label="Move column up"
                          >
                            <ArrowUp className="h-[12px] w-[12px]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveColumn(ci, 1)}
                            disabled={ci === form.linkColumns.length - 1}
                            className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#F8F0F5] text-[#67003E] disabled:opacity-40"
                            aria-label="Move column down"
                          >
                            <ArrowDown className="h-[12px] w-[12px]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditColumn(ci)}
                            className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#F8F0F5] text-[#67003E]"
                            aria-label="Edit column"
                          >
                            <Pencil className="h-[12px] w-[12px]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeColumn(ci)}
                            className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#FEF2F2] text-[#DC2626]"
                            aria-label="Remove column"
                          >
                            <Trash2 className="h-[12px] w-[12px]" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-[6px]">
                        {col.links.length === 0 && (
                          <p className="text-[11px] text-[#999]">No links yet.</p>
                        )}
                        {col.links.map((l, li) => (
                          <div
                            key={l._id || `lnk-${ci}-${li}`}
                            className="flex items-center justify-between gap-2 rounded-[8px] border border-[#E4E4E4] bg-white px-[8px] py-[6px]"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[12px] font-medium text-[#111]">
                                {l.label}
                                {l.openInNewTab && (
                                  <ExternalLink className="ml-[4px] inline h-[10px] w-[10px] text-[#999]" />
                                )}
                              </p>
                              <p className="truncate text-[10px] text-[#888]">
                                {l.url}
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-[2px]">
                              <button
                                type="button"
                                onClick={() => moveLink(ci, li, -1)}
                                disabled={li === 0}
                                className="flex h-[22px] w-[22px] items-center justify-center rounded text-[#67003E] hover:bg-[#F8F0F5] disabled:opacity-30"
                                aria-label="Move link up"
                              >
                                <ArrowUp className="h-[10px] w-[10px]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveLink(ci, li, 1)}
                                disabled={li === col.links.length - 1}
                                className="flex h-[22px] w-[22px] items-center justify-center rounded text-[#67003E] hover:bg-[#F8F0F5] disabled:opacity-30"
                                aria-label="Move link down"
                              >
                                <ArrowDown className="h-[10px] w-[10px]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditLink(ci, li)}
                                className="flex h-[22px] w-[22px] items-center justify-center rounded text-[#67003E] hover:bg-[#F8F0F5]"
                                aria-label="Edit link"
                              >
                                <Pencil className="h-[10px] w-[10px]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeLink(ci, li)}
                                className="flex h-[22px] w-[22px] items-center justify-center rounded text-[#DC2626] hover:bg-[#FEF2F2]"
                                aria-label="Remove link"
                              >
                                <Trash2 className="h-[10px] w-[10px]" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openAddLink(ci)}
                        className="mt-[10px] h-[32px] w-full gap-[4px] rounded-[8px] border-[#D4B8A8] text-[11px] font-medium text-[#67003E] hover:bg-[#F8F0F5]"
                      >
                        <Plus className="h-[11px] w-[11px]" />
                        Add Link
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ================= BOTTOM BAR ================= */}
          <Card className="rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
            <CardContent className="p-[16px] sm:p-[20px]">
              <div className="mb-[14px] flex flex-col gap-[10px] xs:flex-row xs:items-center xs:justify-between">
                <h2 className="text-[16px] font-semibold text-[#111111]">
                  Bottom Bar
                </h2>
                <Button
                  onClick={openAddSocial}
                  className="h-[38px] w-full gap-[6px] rounded-[10px] bg-[#67003E] text-[13px] font-medium text-white hover:bg-[#4F0030] xs:w-auto"
                >
                  <Plus className="h-[14px] w-[14px]" />
                  Add Social
                </Button>
              </div>

              <FormField
                label="Copyright Text"
                value={form.bottomBar.copyrightText}
                onChange={(v) =>
                  setForm({
                    ...form,
                    bottomBar: { ...form.bottomBar, copyrightText: v },
                  })
                }
                placeholder="© 2026 Himmat Contracting Company. All rights reserved."
                className="mb-3"
              />

              <div className="mb-[10px] mt-[6px] flex items-center justify-between">
                <p className="text-[12px] font-medium text-[#2A2A2A]">
                  Social Links ({form.bottomBar.socialLinks.length})
                </p>
              </div>

              {form.bottomBar.socialLinks.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-[#D4B8A8] bg-white/60 p-[20px] text-center">
                  <p className="text-[12px] text-[#888]">No social links yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {form.bottomBar.socialLinks.map((s, si) => (
                    <div
                      key={`${s.platform}-${si}`}
                      className="flex items-center gap-2 rounded-[10px] border border-[#E4E4E4] bg-white p-[8px]"
                    >
                      {s.icon ? (
                        <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[6px] bg-[#F8F0F5]">
                          <Image
                            src={resolveImage(s.icon)}
                            alt={s.platform}
                            width={18}
                            height={18}
                            unoptimized
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[6px] bg-[#F8F0F5]">
                          <LinkIcon className="h-[14px] w-[14px] text-[#67003E]/60" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium capitalize text-[#111]">
                          {s.platform}
                        </p>
                        <p className="truncate text-[10px] text-[#888]">{s.url}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEditSocial(si)}
                        className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] text-[#67003E] hover:bg-[#F8F0F5]"
                        aria-label="Edit social"
                      >
                        <Pencil className="h-[12px] w-[12px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSocial(si)}
                        className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] text-[#DC2626] hover:bg-[#FEF2F2]"
                        aria-label="Remove social"
                      >
                        <Trash2 className="h-[12px] w-[12px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= CONTACT INFO MODAL ================= */}
      <Modal open={contactModal} title="Edit Contact Info" onClose={() => setContactModal(false)}>
        <div className="space-y-[12px]">
          <FormField
            label="Title"
            value={form.contactInfo.title}
            onChange={(v) =>
              setForm({ ...form, contactInfo: { ...form.contactInfo, title: v } })
            }
            placeholder="Get In Touch"
          />
          <FormField
            label="Address"
            value={form.contactInfo.address}
            onChange={(v) =>
              setForm({ ...form, contactInfo: { ...form.contactInfo, address: v } })
            }
            placeholder="#502, 5th Floor, Al Dana Tower..."
            textarea
            rows={2}
          />
          <FormField
            label="Email"
            value={form.contactInfo.email}
            onChange={(v) =>
              setForm({ ...form, contactInfo: { ...form.contactInfo, email: v } })
            }
            placeholder="info@himmat.com.sa"
          />

          <div className="rounded-[12px] border border-[#E4E4E4] p-[12px]">
            <div className="mb-[8px] flex items-center justify-between">
              <Label className="text-[12px] font-medium text-[#2A2A2A]">
                Phone Numbers ({form.contactInfo.phoneNumbers.length})
              </Label>
            </div>
            <div className="mb-2 space-y-2">
              {form.contactInfo.phoneNumbers.length === 0 && (
                <p className="text-[11px] text-[#888]">No phone numbers yet.</p>
              )}
              {form.contactInfo.phoneNumbers.map((n, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={n}
                    onChange={(e) => updatePhone(i, e.target.value)}
                    placeholder="+966 54 060 5978"
                    className="h-[38px] flex-1 rounded-[8px] border-[#E4E4E4] text-[13px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removePhone(i)}
                    className="h-[38px] w-[38px] rounded-[8px] border-[#F3D0D0] p-0 text-[#DC2626] hover:bg-[#FEF2F2]"
                    aria-label="Remove phone"
                  >
                    <Trash2 className="h-[13px] w-[13px]" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={phoneDraft}
                onChange={(e) => setPhoneDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPhone();
                  }
                }}
                placeholder="Add phone number"
                className="h-[38px] flex-1 rounded-[8px] border-[#E4E4E4] text-[13px]"
              />
              <Button
                type="button"
                onClick={addPhone}
                className="h-[38px] gap-[4px] rounded-[8px] bg-[#67003E] px-3 text-[12px] text-white hover:bg-[#4F0030]"
              >
                <Plus className="h-[12px] w-[12px]" /> Add
              </Button>
            </div>
          </div>

          <ModalActions onClose={() => setContactModal(false)} />
        </div>
      </Modal>

      {/* ================= COLUMN MODAL ================= */}
      <Modal
        open={columnModal && !!columnDraft}
        title={columnIndex !== null ? "Edit Column" : "Add Column"}
        onClose={() => {
          setColumnModal(false);
          setColumnDraft(null);
          setColumnIndex(null);
        }}
      >
        {columnDraft && (
          <div className="space-y-[12px]">
            <FormField
              label="Column Title"
              value={columnDraft.title}
              onChange={(v) => setColumnDraft({ ...columnDraft, title: v })}
              placeholder="Quick Links"
            />
            <p className="text-[11px] text-[#888]">
              Links are managed from the column card after saving this modal.
            </p>
            <ModalActions
              onClose={() => {
                setColumnModal(false);
                setColumnDraft(null);
                setColumnIndex(null);
              }}
              onSave={saveColumn}
              saveLabel={columnIndex !== null ? "Save Column" : "Add Column"}
            />
          </div>
        )}
      </Modal>

      {/* ================= LINK MODAL ================= */}
      <Modal
        open={linkModal && !!linkDraft}
        title={linkIndex !== null ? "Edit Link" : "Add Link"}
        onClose={() => {
          setLinkModal(false);
          setLinkDraft(null);
          setLinkColumnIndex(null);
          setLinkIndex(null);
        }}
      >
        {linkDraft && (
          <div className="space-y-[12px]">
            <FormField
              label="Label"
              value={linkDraft.label}
              onChange={(v) => setLinkDraft({ ...linkDraft, label: v })}
              placeholder="Home"
            />
            <FormField
              label="URL"
              value={linkDraft.url}
              onChange={(v) => setLinkDraft({ ...linkDraft, url: v })}
              placeholder="/ or https://example.com"
            />
            <div className="flex items-center justify-between rounded-[10px] border border-[#E4E4E4] px-[12px] py-[10px]">
              <div>
                <p className="text-[12px] font-medium text-[#111]">Open in new tab</p>
                <p className="text-[11px] text-[#888]">
                  Opens this link in a new browser tab.
                </p>
              </div>
              <Switch
                checked={linkDraft.openInNewTab}
                onCheckedChange={(v) =>
                  setLinkDraft({ ...linkDraft, openInNewTab: v })
                }
              />
            </div>
            <ModalActions
              onClose={() => {
                setLinkModal(false);
                setLinkDraft(null);
                setLinkColumnIndex(null);
                setLinkIndex(null);
              }}
              onSave={saveLink}
              saveLabel={linkIndex !== null ? "Save Link" : "Add Link"}
            />
          </div>
        )}
      </Modal>

      {/* ================= SOCIAL MODAL ================= */}
      <Modal
        open={socialModal && !!socialDraft}
        title={socialIndex !== null ? "Edit Social" : "Add Social"}
        onClose={() => {
          setSocialModal(false);
          setSocialDraft(null);
          setSocialIndex(null);
        }}
      >
        {socialDraft && (
          <div className="space-y-[12px]">
            <div>
              <Label className="mb-[8px] block text-[13px] font-medium text-[#2A2A2A]">
                Platform
              </Label>
              <select
                value={socialDraft.platform}
                onChange={(e) =>
                  setSocialDraft({ ...socialDraft, platform: e.target.value })
                }
                className="h-[44px] w-full rounded-[10px] border border-[#E4E4E4] bg-white px-3 text-[13px]"
              >
                <option value="">Select platform…</option>
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <FormField
              label="URL"
              value={socialDraft.url}
              onChange={(v) => setSocialDraft({ ...socialDraft, url: v })}
              placeholder="https://facebook.com/yourpage"
            />

            <IconUploadField
              label="Icon"
              value={socialDraft.icon}
              onChange={(url) => setSocialDraft({ ...socialDraft, icon: url })}
            />

            <ModalActions
              onClose={() => {
                setSocialModal(false);
                setSocialDraft(null);
                setSocialIndex(null);
              }}
              onSave={saveSocial}
              saveLabel={socialIndex !== null ? "Save Social" : "Add Social"}
            />
          </div>
        )}
      </Modal>
    </section>
  );
}

// ================= SHARED MODAL + ACTIONS =================

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

function ModalActions({
  onClose,
  onSave,
  saveLabel = "Save",
}: {
  onClose: () => void;
  onSave?: () => void;
  saveLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-[10px] pt-[4px] xs:flex-row xs:justify-end">
      <Button
        variant="outline"
        onClick={onClose}
        className="h-[44px] rounded-[12px] border-[#E4E4E4] bg-white px-[18px] text-[14px] text-[#666666]"
      >
        {onSave ? "Cancel" : "Done"}
      </Button>
      {onSave && (
        <Button
          onClick={onSave}
          className="h-[44px] rounded-[12px] bg-[#67003E] px-[22px] text-[14px] font-medium text-white hover:bg-[#4F0030]"
        >
          {saveLabel}
        </Button>
      )}
    </div>
  );
}