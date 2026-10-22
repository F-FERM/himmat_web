"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  ImageIcon,
  ImagePlus,
  Loader2,
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
import { Textarea } from "@/components/ui/textarea";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

type Hero = {
  title: string;
  image: string;
  imageAlt: string;
  breadcrumbHome: string;
  breadcrumbHomeLink: string;
  breadcrumbCurrent: string;
};

type ContentImage = { url: string; alt: string };

type Content = {
  title: string;
  description: string;
  images: ContentImage[];
};

type ServiceDetail = {
  _id?: string;
  slug: string;
  hero: Hero;
  content: Content;
  isActive?: boolean;
};

type Payload = {
  hero: Hero;
  content: Content;
};

const EMPTY_FORM: Payload = {
  hero: {
    title: "",
    image: "",
    imageAlt: "",
    breadcrumbHome: "Home",
    breadcrumbHomeLink: "/",
    breadcrumbCurrent: "Services",
  },
  content: {
    title: "",
    description: "",
    images: [],
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

function mapToForm(doc: Partial<ServiceDetail> | null | undefined): Payload {
  return {
    hero: { ...EMPTY_FORM.hero, ...(doc?.hero || {}) },
    content: {
      title: doc?.content?.title || "",
      description: doc?.content?.description || "",
      images: [...(doc?.content?.images || [])],
    },
  };
}

// ---------- Image uploader (single) ----------
function SingleImageUpload({
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
      toast.error(getErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-[12px] border border-[#D4B8A8] bg-[#F8F0F5] p-[12px]">
      <Label className="mb-[6px] block text-[12px] font-medium text-[#2A2A2A]">{label}</Label>
      {value ? (
        <div className={`relative mb-[10px] ${previewHeight} w-full overflow-hidden rounded-[8px] bg-[#E8D5E0]`}>
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
        <div className="mb-2">
          <Label className="mb-[6px] block text-[12px] font-medium text-[#2A2A2A]">
            Alt Text
          </Label>
          <Input
            value={altValue || ""}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder={placeholderAlt}
            className="h-[40px] rounded-[10px] border-[#E4E4E4] bg-white text-[13px]"
          />
        </div>
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

// ---------- Content gallery editor ----------
function ContentImagesEditor({
  images,
  onChange,
}: {
  images: ContentImage[];
  onChange: (imgs: ContentImage[]) => void;
}) {
  const [draftUrl, setDraftUrl] = useState("");
  const [draftAlt, setDraftAlt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const add = () => {
    if (!draftUrl.trim()) {
      toast.error("Image URL is required");
      return;
    }
    onChange([...images, { url: draftUrl.trim(), alt: draftAlt.trim() }]);
    setDraftUrl("");
    setDraftAlt("");
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const result = await fileUpload(file);
      onChange([...images, { url: result.url, alt: draftAlt.trim() || file.name }]);
      setDraftAlt("");
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(getErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const updateAlt = (idx: number, alt: string) =>
    onChange(images.map((img, i) => (i === idx ? { ...img, alt } : img)));

  return (
    <div className="rounded-[14px] border border-[#E4E4E4] p-[14px]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[#111111]">
          Gallery ({images.length})
        </h3>
      </div>

      {images.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((img, i) => (
            <div
              key={`${img.url}-${i}`}
              className="relative overflow-hidden rounded-[10px] border border-[#E4E4E4] bg-white"
            >
              <div className="relative aspect-[4/3] w-full bg-[#F8F0F5]">
                <Image
                  src={resolveImage(img.url)}
                  alt={img.alt || `Gallery image ${i + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute right-[6px] top-[6px] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-black/60 text-white hover:bg-[#DC2626]"
                  aria-label="Remove image"
                >
                  <X className="h-[13px] w-[13px]" />
                </button>
              </div>
              <div className="p-[8px]">
                <Input
                  value={img.alt}
                  onChange={(e) => updateAlt(i, e.target.value)}
                  placeholder="Alt text"
                  className="h-[32px] rounded-[8px] border-[#E4E4E4] text-[11px]"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="mb-3 text-[12px] text-[#888888]">No gallery images yet.</p>
      )}

      <div className="rounded-[12px] border border-[#D4B8A8] bg-[#F8F0F5] p-[10px]">
        <div className="grid grid-cols-1 gap-2 xs:grid-cols-[1fr_1fr_auto]">
          <Input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="/images/services/equipment-5.jpg"
            className="h-[36px] rounded-[8px] border-[#E4E4E4] bg-white text-[12px]"
          />
          <Input
            value={draftAlt}
            onChange={(e) => setDraftAlt(e.target.value)}
            placeholder="Alt text"
            className="h-[36px] rounded-[8px] border-[#E4E4E4] bg-white text-[12px]"
          />
          <Button
            type="button"
            onClick={add}
            className="h-[36px] rounded-[8px] bg-[#67003E] px-3 text-[12px] text-white hover:bg-[#4F0030]"
          >
            <Plus className="h-[12px] w-[12px]" /> Add
          </Button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" onChange={upload} className="hidden" />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="mt-2 h-[36px] w-full gap-[6px] rounded-[8px] border-[#D4B8A8] bg-white text-[12px] font-medium text-[#67003E] hover:bg-[#F8F0F5] hover:text-[#67003E]"
        >
          {uploading ? (
            <Loader2 className="h-[14px] w-[14px] animate-spin" />
          ) : (
            <UploadCloud className="h-[14px] w-[14px]" />
          )}
          Upload from device
        </Button>
      </div>
    </div>
  );
}
type ServiceListItem = {
  _id: string;
  slug: string;
  hero: { title: string; image: string };
  content: { title: string };
};
export default function ServiceDetailAdmin() {
  // list
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);

  // selected service detail
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [entry, setEntry] = useState<ServiceDetail | null>(null);
  const [form, setForm] = useState<Payload>(EMPTY_FORM);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1) call the list API first
  const fetchList = async () => {
    try {
      setListLoading(true);
      const res = await api.get<ServiceListItem[]>("/services");
      setServices(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load services"));
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // 2) call the detail API on click
  const selectService = async (slug: string) => {
    if (slug === selectedSlug || detailLoading) return;
    try {
      setSelectedSlug(slug);
      setDetailLoading(true);
      setEntry(null);
      const res = await api.get<ServiceDetail>(`/services/${slug}`);
      setEntry(res.data);
      setForm(mapToForm(res.data));
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load service"));
      setEntry(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const save = async () => {
    if (!selectedSlug) return;
    if (!form.hero.title.trim()) return toast.error("Hero title is required");
    if (!form.hero.image.trim()) return toast.error("Hero image is required");
    if (!form.content.title.trim()) return toast.error("Content title is required");

    try {
      setSaving(true);
      const payload: Payload = { hero: form.hero, content: form.content };
      const res = await api.patch<ServiceDetail>(`/services/${selectedSlug}`, payload);

      if (res.data && !Array.isArray(res.data)) {
        setEntry(res.data);
        setForm(mapToForm(res.data));
      } else {
        setEntry({ ...(entry as ServiceDetail), ...payload, slug: selectedSlug });
      }

      // keep the list in sync with edited titles/images
      setServices((prev) =>
        prev.map((s) =>
          s.slug === selectedSlug
            ? {
                ...s,
                hero: { title: form.hero.title, image: form.hero.image },
                content: { title: form.content.title },
              }
            : s
        )
      );
      toast.success("Service updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save service"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#F8F0F5] px-[16px] py-[24px] xs:px-[20px] sm:px-[28px] sm:py-[36px] md:px-[36px] lg:px-[48px] lg:py-[48px] 2xl:px-[64px]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "12px", background: "#111111", color: "#fff", fontSize: "14px" },
          success: { iconTheme: { primary: "#67003E", secondary: "#fff" } },
          error: { iconTheme: { primary: "#DC2626", secondary: "#fff" } },
        }}
      />

      {/* HEADER */}
      <div className="mx-auto flex max-w-[1400px] flex-col gap-[14px] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-[10px]">
          <Link
            href="/admin"
            className="inline-flex w-fit items-center gap-[6px] text-[13px] text-[#67003E] hover:underline"
          >
            <ArrowLeft className="h-[14px] w-[14px]" />
            Back
          </Link>
          <h1 className="text-[22px] font-semibold tracking-[-0.5px] text-[#111111] xs:text-[24px] sm:text-[28px]">
            {selectedSlug ? form.hero.title || selectedSlug : "Services"}
          </h1>
          {selectedSlug && <p className="text-[12px] text-[#888888]">/services/{selectedSlug}</p>}
        </div>

        {selectedSlug && (
          <Button
            onClick={save}
            disabled={saving || detailLoading || !entry}
            className="h-[46px] w-full gap-[8px] rounded-[14px] bg-[#67003E] px-[22px] text-[14px] font-medium text-white hover:bg-[#4F0030] sm:w-auto"
          >
            {saving ? (
              <Loader2 className="h-[16px] w-[16px] animate-spin" />
            ) : (
              <Save className="h-[16px] w-[16px]" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      <div className="mx-auto mt-[22px] grid max-w-[1400px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* SERVICES LIST */}
        <Card className="h-fit rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <CardContent className="p-[12px]">
            <h2 className="mb-2 px-[6px] text-[15px] font-semibold text-[#111111]">
              All Services {!listLoading && `(${services.length})`}
            </h2>

            {listLoading ? (
              <div className="flex min-h-[120px] items-center justify-center">
                <Loader2 className="h-[22px] w-[22px] animate-spin text-[#67003E]" />
              </div>
            ) : services.length === 0 ? (
              <p className="px-[6px] py-[12px] text-[12px] text-[#888888]">No services found.</p>
            ) : (
              <ul className="space-y-[6px]">
                {services.map((s) => {
                  const active = s.slug === selectedSlug;
                  return (
                    <li key={s._id}>
                      <button
                        type="button"
                        onClick={() => selectService(s.slug)}
                        className={`flex w-full items-center gap-[10px] rounded-[10px] border p-[8px] text-left transition ${
                          active
                            ? "border-[#67003E] bg-[#F8F0F5]"
                            : "border-transparent hover:bg-[#F8F0F5]"
                        }`}
                      >
                        <div className="relative h-[40px] w-[52px] shrink-0 overflow-hidden rounded-[6px] bg-[#E8D5E0]">
                          {s.hero?.image && (
                            <Image
                              src={resolveImage(s.hero.image)}
                              alt={s.hero.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="text-[13px] font-medium text-[#111111]">
                          {s.hero?.title || s.slug}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* DETAIL */}
        <div>
          {!selectedSlug ? (
            <Card className="rounded-[20px] border border-dashed border-[#D4B8A8] bg-white/60">
              <CardContent className="p-[32px] text-center">
                <p className="text-[14px] font-medium text-[#333333]">Select a service to edit</p>
              </CardContent>
            </Card>
          ) : detailLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-[26px] w-[26px] animate-spin text-[#67003E]" />
            </div>
          ) : !entry ? (
            <Card className="rounded-[20px] border border-dashed border-[#D4B8A8] bg-white/60">
              <CardContent className="p-[32px] text-center">
                <p className="text-[14px] font-medium text-[#333333]">Service not found</p>
                <p className="mt-[4px] text-[12px] text-[#888888]">
                  The slug &quot;{selectedSlug}&quot; could not be loaded.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
              {/* HERO */}
              <div className="space-y-[14px]">
                <Card className="rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
                  <CardContent className="p-[16px] sm:p-[20px]">
                    <h2 className="mb-3 text-[15px] font-semibold text-[#111111]">Hero</h2>
                    <div className="space-y-[12px]">
                      <div>
                        <Label className="mb-[6px] block text-[12px] font-medium text-[#2A2A2A]">Title</Label>
                        <Input
                          value={form.hero.title}
                          onChange={(e) => setForm({ ...form, hero: { ...form.hero, title: e.target.value } })}
                          placeholder="Equipment Rental"
                          className="h-[44px] rounded-[10px] border-[#E4E4E4] bg-white text-[13px]"
                        />
                      </div>

                      <SingleImageUpload
                        label="Hero Image"
                        value={form.hero.image}
                        altValue={form.hero.imageAlt}
                        onImageChange={(url) => setForm({ ...form, hero: { ...form.hero, image: url } })}
                        onAltChange={(alt) => setForm({ ...form, hero: { ...form.hero, imageAlt: alt } })}
                        placeholderAlt="Equipment Rental Banner"
                      />

                      <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
                        <div>
                          <Label className="mb-[6px] block text-[12px] font-medium text-[#2A2A2A]">Breadcrumb Home</Label>
                          <Input
                            value={form.hero.breadcrumbHome}
                            onChange={(e) => setForm({ ...form, hero: { ...form.hero, breadcrumbHome: e.target.value } })}
                            placeholder="Home"
                            className="h-[40px] rounded-[10px] border-[#E4E4E4] bg-white text-[13px]"
                          />
                        </div>
                        <div>
                          <Label className="mb-[6px] block text-[12px] font-medium text-[#2A2A2A]">Home Link</Label>
                          <Input
                            value={form.hero.breadcrumbHomeLink}
                            onChange={(e) => setForm({ ...form, hero: { ...form.hero, breadcrumbHomeLink: e.target.value } })}
                            placeholder="/"
                            className="h-[40px] rounded-[10px] border-[#E4E4E4] bg-white text-[13px]"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="mb-[6px] block text-[12px] font-medium text-[#2A2A2A]">Breadcrumb Current</Label>
                        <Input
                          value={form.hero.breadcrumbCurrent}
                          onChange={(e) => setForm({ ...form, hero: { ...form.hero, breadcrumbCurrent: e.target.value } })}
                          placeholder="Services"
                          className="h-[40px] rounded-[10px] border-[#E4E4E4] bg-white text-[13px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CONTENT */}
              <div className="space-y-[14px]">
                <Card className="rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
                  <CardContent className="p-[16px] sm:p-[20px]">
                    <h2 className="mb-3 text-[15px] font-semibold text-[#111111]">Content</h2>
                    <div className="space-y-[12px]">
                      <div>
                        <Label className="mb-[6px] block text-[12px] font-medium text-[#2A2A2A]">Title</Label>
                        <Input
                          value={form.content.title}
                          onChange={(e) => setForm({ ...form, content: { ...form.content, title: e.target.value } })}
                          placeholder="Equipment Rental"
                          className="h-[44px] rounded-[10px] border-[#E4E4E4] bg-white text-[13px]"
                        />
                      </div>
                      <div>
                        <Label className="mb-[6px] block text-[12px] font-medium text-[#2A2A2A]">Description</Label>
                        <Textarea
                          value={form.content.description}
                          onChange={(e) => setForm({ ...form, content: { ...form.content, description: e.target.value } })}
                          placeholder="Long-form description..."
                          rows={10}
                          className="rounded-[10px] border-[#E4E4E4] bg-white text-[13px] focus-visible:ring-[#67003E]/30"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
                  <CardContent className="p-[16px] sm:p-[20px]">
                    <ContentImagesEditor
                      images={form.content.images}
                      onChange={(imgs) => setForm({ ...form, content: { ...form.content, images: imgs } })}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}