"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  ImageIcon,
  ImagePlus,
  Layout,
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
import { Textarea } from "@/components/ui/textarea";

// ================= CONFIG =================

const ENDPOINT = "/home-page";
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// ================= TYPES =================

interface InlineLink {
  text: string;
  url: string;
  type: string;
  openInNewTab: boolean;
  position: number;
}

interface HeroSlide {
  _id?: string;
  subtitle: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  readMoreLink: string;
  readMoreText: string;
  order: number;
  inlineLinks: InlineLink[];
}

interface MissionVision {
  tagline: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  buttonText: string;
  buttonLink: string;
  visionTitle: string;
  visionDescription: string;
  missionTitle: string;
  missionDescription: string;
  inlineLinks: InlineLink[];
}

interface ServiceCard {
  _id?: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  link: string;
  order: number;
}

interface ExpertiseItem {
  _id?: string;
  title: string;
  description: string;
  icon: string; // uploaded image path
  order: number;
}

interface WhyStat {
  _id?: string;
  label: string;
  percentage: number;
  order: number;
}

interface WhyChooseUs {
  tagline: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  stats: WhyStat[];
}

interface CoreValueItem {
  _id?: string;
  title: string;
  description: string;
  order: number;
}

interface CoreValues {
  tagline: string;
  title: string;
  items: CoreValueItem[];
}

interface GetInTouch {
  subtitle: string;
  title: string;
  image: string;
  imageAlt: string;
  buttonText: string;
  buttonLink: string;
}

interface HomePageData {
  _id?: string;
  heroSlides: HeroSlide[];
  missionVision: MissionVision;
  services: {
    tagline: string;
    title: string;
    cards: ServiceCard[];
  };
  expertise: {
    tagline: string;
    title: string;
    items: ExpertiseItem[];
  };
  whyChooseUs: WhyChooseUs;
  coreValues: CoreValues;
  getInTouch: GetInTouch;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// ================= HELPERS =================

function resolveImage(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
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

function stripIds<T extends { _id?: string }>(items: T[]): Omit<T, "_id">[] {
  return items.map(({ _id: _unused, ...rest }) => rest);
}

const EMPTY_FORM: HomePageData = {
  heroSlides: [],
  missionVision: {
    tagline: "",
    title: "",
    description: "",
    image: "",
    imageAlt: "",
    buttonText: "",
    buttonLink: "",
    visionTitle: "",
    visionDescription: "",
    missionTitle: "",
    missionDescription: "",
    inlineLinks: [],
  },
  services: { tagline: "", title: "", cards: [] },
  expertise: { tagline: "", title: "", items: [] },
  whyChooseUs: {
    tagline: "",
    title: "",
    description: "",
    image: "",
    imageAlt: "",
    stats: [],
  },
  coreValues: { tagline: "", title: "", items: [] },
  getInTouch: {
    subtitle: "",
    title: "",
    image: "",
    imageAlt: "",
    buttonText: "",
    buttonLink: "",
  },
  isActive: true,
};

function normalizeEntry(entry: Partial<HomePageData>): HomePageData {
  return {
    ...EMPTY_FORM,
    ...entry,
    heroSlides: [...(entry.heroSlides || [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    ),
    missionVision: { ...EMPTY_FORM.missionVision, ...(entry.missionVision || {}) },
    services: {
      ...EMPTY_FORM.services,
      ...(entry.services || {}),
      cards: [...(entry.services?.cards || [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      ),
    },
    expertise: {
      ...EMPTY_FORM.expertise,
      ...(entry.expertise || {}),
      items: [...(entry.expertise?.items || [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      ),
    },
    whyChooseUs: {
      ...EMPTY_FORM.whyChooseUs,
      ...(entry.whyChooseUs || {}),
      stats: [...(entry.whyChooseUs?.stats || [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      ),
    },
    coreValues: {
      ...EMPTY_FORM.coreValues,
      ...(entry.coreValues || {}),
      items: [...(entry.coreValues?.items || [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      ),
    },
    getInTouch: { ...EMPTY_FORM.getInTouch, ...(entry.getInTouch || {}) },
    isActive: entry.isActive ?? true,
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
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  textarea?: boolean;
  rows?: number;
  type?: string;
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
          type={type}
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
  previewHeight = "h-[120px]",
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
    <div className="rounded-[10px] border border-[#D4B8A8] bg-[#F8F0F5] p-[10px]">
      <Label className="mb-[6px] block text-[12px] font-medium text-[#2A2A2A]">
        {label}
      </Label>
      {value && (
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

// ================= INLINE LINK MANAGER =================

function InlineLinkManager({
  links,
  onChange,
  label = "Inline Links",
}: {
  links: InlineLink[];
  onChange: (links: InlineLink[]) => void;
  label?: string;
}) {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [newTab, setNewTab] = useState(false);

  const add = () => {
    if (!text.trim() || !url.trim()) {
      toast.error("Text and URL required");
      return;
    }
    onChange([
      ...links,
      {
        text: text.trim(),
        url: url.trim(),
        type: "external",
        openInNewTab: newTab,
        position: links.length,
      },
    ]);
    setText("");
    setUrl("");
    setNewTab(false);
  };

  const remove = (idx: number) =>
    onChange(links.filter((_, i) => i !== idx).map((l, i) => ({ ...l, position: i })));

  return (
    <div className="mt-2 border-t border-[#D4B8A8] pt-2">
      <Label className="mb-1 block text-[11px] font-medium text-[#2A2A2A]">
        {label}
      </Label>
      {links.map((l, i) => (
        <div
          key={`${l.text}-${i}`}
          className="mb-1 flex items-center justify-between rounded-[6px] border border-[#E4E4E4] bg-white px-2 py-1 text-[11px]"
        >
          <span className="truncate">
            <b className="text-[#67003E]">"{l.text}"</b> → {l.url}
          </span>
          <button type="button" onClick={() => remove(i)} className="text-[#DC2626]">
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-1 xs:grid-cols-4">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Text"
          className="h-8 text-[11px]"
        />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL"
          className="h-8 text-[11px]"
        />
        <label className="flex items-center gap-1 text-[10px] text-[#666]">
          <Switch checked={newTab} onCheckedChange={setNewTab} className="h-4 w-7" />
          New tab
        </label>
        <Button
          type="button"
          onClick={add}
          className="h-8 rounded-[6px] bg-[#67003E] text-[11px] text-white hover:bg-[#4F0030]"
        >
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>
    </div>
  );
}

// ================= ARRAY ITEM SHELL =================

function ItemShell({
  title,
  subtitle,
  onEdit,
  onRemove,
  onUp,
  onDown,
  canUp,
  canDown,
  children,
}: {
  title: string;
  subtitle?: string;
  onEdit: () => void;
  onRemove: () => void;
  onUp?: () => void;
  onDown?: () => void;
  canUp?: boolean;
  canDown?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[10px] rounded-[12px] border border-[#ECECEC] bg-white p-[10px] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        {children}
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-[#111111]">{title}</p>
          {subtitle && (
            <p className="truncate text-[11px] text-[#888]">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-[6px] sm:shrink-0">
        {onUp && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onUp}
            disabled={!canUp}
            className="h-[30px] rounded-[8px] px-[8px] text-[11px]"
          >
            ↑
          </Button>
        )}
        {onDown && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDown}
            disabled={!canDown}
            className="h-[30px] rounded-[8px] px-[8px] text-[11px]"
          >
            ↓
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          className="h-[30px] gap-[4px] rounded-[8px] border-[#D4B8A8] px-[8px] text-[11px] text-[#67003E] hover:bg-[#F8F0F5]"
        >
          <Pencil className="h-3 w-3" /> Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onRemove}
          className="h-[30px] rounded-[8px] border-[#F3D0D0] px-[8px] text-[11px] text-[#DC2626] hover:bg-[#FEF2F2]"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ================= MODAL SHELL =================

function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = "max-w-[720px]",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
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
            className={`relative max-h-[94vh] w-full overflow-y-auto rounded-t-[24px] bg-white p-[18px] shadow-[0_30px_80px_rgba(0,0,0,0.25)] xs:p-[22px] sm:max-h-[92vh] sm:rounded-[28px] sm:p-[28px] ${maxWidth}`}
          >
            <div className="mb-[16px] flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-[#111111] sm:text-[20px]">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#F4F1EA] text-[#666] hover:bg-[#EDE3D6]"
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

export default function HomePageAdmin() {
  const [entry, setEntry] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  // Hero slide modal
  const [slideModal, setSlideModal] = useState(false);
  const [slideDraft, setSlideDraft] = useState<HeroSlide | null>(null);
  const [slideIndex, setSlideIndex] = useState<number | null>(null);

  // Service card modal
  const [cardModal, setCardModal] = useState(false);
  const [cardDraft, setCardDraft] = useState<ServiceCard | null>(null);
  const [cardIndex, setCardIndex] = useState<number | null>(null);

  // Expertise modal
  const [expModal, setExpModal] = useState(false);
  const [expDraft, setExpDraft] = useState<ExpertiseItem | null>(null);
  const [expIndex, setExpIndex] = useState<number | null>(null);

  // Why-stat modal
  const [statModal, setStatModal] = useState(false);
  const [statDraft, setStatDraft] = useState<WhyStat | null>(null);
  const [statIndex, setStatIndex] = useState<number | null>(null);

  // Core value modal
  const [cvModal, setCvModal] = useState(false);
  const [cvDraft, setCvDraft] = useState<CoreValueItem | null>(null);
  const [cvIndex, setCvIndex] = useState<number | null>(null);

  // ---------- LOAD ----------

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const res = await api.get<HomePageData | HomePageData[]>(ENDPOINT);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setEntry(data ? normalizeEntry(data) : normalizeEntry({}));
    } catch (err) {
      // 404 → start fresh
      setEntry(normalizeEntry({}));
      const status =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      if (status !== 404) {
        toast.error(getErrorMessage(err, "Failed to load home page"));
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
    if (!entry) return;
    try {
      setSaving(true);
      const payload = {
        ...entry,
        heroSlides: stripIds(entry.heroSlides),
        services: {
          ...entry.services,
          cards: stripIds(entry.services.cards),
        },
        expertise: {
          ...entry.expertise,
          items: stripIds(entry.expertise.items),
        },
        whyChooseUs: {
          ...entry.whyChooseUs,
          stats: stripIds(entry.whyChooseUs.stats),
        },
        coreValues: {
          ...entry.coreValues,
          items: stripIds(entry.coreValues.items),
        },
      };
      delete (payload as { _id?: string })._id;
      delete (payload as { __v?: number }).__v;
      delete (payload as { createdAt?: string }).createdAt;
      delete (payload as { updatedAt?: string }).updatedAt;

      if (entry._id) {
        await api.patch(ENDPOINT, payload);
        toast.success("Home page updated");
      } else {
        const res = await api.post<HomePageData>(ENDPOINT, payload);
        setEntry(normalizeEntry(res.data));
        toast.success("Home page created");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save home page"));
    } finally {
      setSaving(false);
    }
  };

  // ---------- HERO SLIDES ----------

  const openSlideCreate = () => {
    setSlideDraft({
      subtitle: "",
      title: "",
      description: "",
      image: "",
      imageAlt: "",
      readMoreLink: "",
      readMoreText: "Read More",
      order: entry?.heroSlides.length || 0,
      inlineLinks: [],
    });
    setSlideIndex(null);
    setSlideModal(true);
  };

  const openSlideEdit = (idx: number) => {
    if (!entry) return;
    setSlideDraft({ ...entry.heroSlides[idx] });
    setSlideIndex(idx);
    setSlideModal(true);
  };

  const saveSlide = () => {
    if (!entry || !slideDraft) return;
    if (!slideDraft.title.trim()) {
      toast.error("Slide title required");
      return;
    }
    if (!slideDraft.image.trim()) {
      toast.error("Slide image required");
      return;
    }
    const slides = [...entry.heroSlides];
    if (slideIndex !== null) slides[slideIndex] = slideDraft;
    else slides.push(slideDraft);
    setEntry({
      ...entry,
      heroSlides: slides.map((s, i) => ({ ...s, order: i })),
    });
    setSlideModal(false);
    setSlideDraft(null);
    setSlideIndex(null);
  };

  const removeSlide = (idx: number) => {
    if (!entry) return;
    setEntry({
      ...entry,
      heroSlides: entry.heroSlides
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, order: i })),
    });
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    if (!entry) return;
    const target = idx + dir;
    if (target < 0 || target >= entry.heroSlides.length) return;
    const slides = [...entry.heroSlides];
    [slides[idx], slides[target]] = [slides[target], slides[idx]];
    setEntry({
      ...entry,
      heroSlides: slides.map((s, i) => ({ ...s, order: i })),
    });
  };

  // ---------- SERVICE CARDS ----------

  const openCardCreate = () => {
    setCardDraft({
      title: "",
      subtitle: "",
      image: "",
      imageAlt: "",
      link: "",
      order: entry?.services.cards.length || 0,
    });
    setCardIndex(null);
    setCardModal(true);
  };

  const openCardEdit = (idx: number) => {
    if (!entry) return;
    setCardDraft({ ...entry.services.cards[idx] });
    setCardIndex(idx);
    setCardModal(true);
  };

  const saveCard = () => {
    if (!entry || !cardDraft) return;
    if (!cardDraft.title.trim()) {
      toast.error("Card title required");
      return;
    }
    const cards = [...entry.services.cards];
    if (cardIndex !== null) cards[cardIndex] = cardDraft;
    else cards.push(cardDraft);
    setEntry({
      ...entry,
      services: {
        ...entry.services,
        cards: cards.map((c, i) => ({ ...c, order: i })),
      },
    });
    setCardModal(false);
    setCardDraft(null);
    setCardIndex(null);
  };

  const removeCard = (idx: number) => {
    if (!entry) return;
    setEntry({
      ...entry,
      services: {
        ...entry.services,
        cards: entry.services.cards
          .filter((_, i) => i !== idx)
          .map((c, i) => ({ ...c, order: i })),
      },
    });
  };

  const moveCard = (idx: number, dir: -1 | 1) => {
    if (!entry) return;
    const target = idx + dir;
    if (target < 0 || target >= entry.services.cards.length) return;
    const cards = [...entry.services.cards];
    [cards[idx], cards[target]] = [cards[target], cards[idx]];
    setEntry({
      ...entry,
      services: {
        ...entry.services,
        cards: cards.map((c, i) => ({ ...c, order: i })),
      },
    });
  };

  // ---------- EXPERTISE ----------

  const openExpCreate = () => {
    setExpDraft({
      title: "",
      description: "",
      icon: "",
      order: entry?.expertise.items.length || 0,
    });
    setExpIndex(null);
    setExpModal(true);
  };

  const openExpEdit = (idx: number) => {
    if (!entry) return;
    setExpDraft({ ...entry.expertise.items[idx] });
    setExpIndex(idx);
    setExpModal(true);
  };

  const saveExp = () => {
    if (!entry || !expDraft) return;
    if (!expDraft.title.trim()) {
      toast.error("Expertise title required");
      return;
    }
    if (!expDraft.icon.trim()) {
      toast.error("Expertise icon required");
      return;
    }
    const items = [...entry.expertise.items];
    if (expIndex !== null) items[expIndex] = expDraft;
    else items.push(expDraft);
    setEntry({
      ...entry,
      expertise: {
        ...entry.expertise,
        items: items.map((it, i) => ({ ...it, order: i })),
      },
    });
    setExpModal(false);
    setExpDraft(null);
    setExpIndex(null);
  };

  const removeExp = (idx: number) => {
    if (!entry) return;
    setEntry({
      ...entry,
      expertise: {
        ...entry.expertise,
        items: entry.expertise.items
          .filter((_, i) => i !== idx)
          .map((it, i) => ({ ...it, order: i })),
      },
    });
  };

  const moveExp = (idx: number, dir: -1 | 1) => {
    if (!entry) return;
    const target = idx + dir;
    if (target < 0 || target >= entry.expertise.items.length) return;
    const items = [...entry.expertise.items];
    [items[idx], items[target]] = [items[target], items[idx]];
    setEntry({
      ...entry,
      expertise: {
        ...entry.expertise,
        items: items.map((it, i) => ({ ...it, order: i })),
      },
    });
  };

  // ---------- WHY STATS ----------

  const openStatCreate = () => {
    setStatDraft({
      label: "",
      percentage: 0,
      order: entry?.whyChooseUs.stats.length || 0,
    });
    setStatIndex(null);
    setStatModal(true);
  };

  const openStatEdit = (idx: number) => {
    if (!entry) return;
    setStatDraft({ ...entry.whyChooseUs.stats[idx] });
    setStatIndex(idx);
    setStatModal(true);
  };

  const saveStat = () => {
    if (!entry || !statDraft) return;
    if (!statDraft.label.trim()) {
      toast.error("Stat label required");
      return;
    }
    const stats = [...entry.whyChooseUs.stats];
    if (statIndex !== null) stats[statIndex] = statDraft;
    else stats.push(statDraft);
    setEntry({
      ...entry,
      whyChooseUs: {
        ...entry.whyChooseUs,
        stats: stats.map((s, i) => ({ ...s, order: i })),
      },
    });
    setStatModal(false);
    setStatDraft(null);
    setStatIndex(null);
  };

  const removeStat = (idx: number) => {
    if (!entry) return;
    setEntry({
      ...entry,
      whyChooseUs: {
        ...entry.whyChooseUs,
        stats: entry.whyChooseUs.stats
          .filter((_, i) => i !== idx)
          .map((s, i) => ({ ...s, order: i })),
      },
    });
  };

  // ---------- CORE VALUES ----------

  const openCvCreate = () => {
    setCvDraft({
      title: "",
      description: "",
      order: entry?.coreValues.items.length || 0,
    });
    setCvIndex(null);
    setCvModal(true);
  };

  const openCvEdit = (idx: number) => {
    if (!entry) return;
    setCvDraft({ ...entry.coreValues.items[idx] });
    setCvIndex(idx);
    setCvModal(true);
  };

  const saveCv = () => {
    if (!entry || !cvDraft) return;
    if (!cvDraft.title.trim()) {
      toast.error("Core value title required");
      return;
    }
    const items = [...entry.coreValues.items];
    if (cvIndex !== null) items[cvIndex] = cvDraft;
    else items.push(cvDraft);
    setEntry({
      ...entry,
      coreValues: {
        ...entry.coreValues,
        items: items.map((it, i) => ({ ...it, order: i })),
      },
    });
    setCvModal(false);
    setCvDraft(null);
    setCvIndex(null);
  };

  const removeCv = (idx: number) => {
    if (!entry) return;
    setEntry({
      ...entry,
      coreValues: {
        ...entry.coreValues,
        items: entry.coreValues.items
          .filter((_, i) => i !== idx)
          .map((it, i) => ({ ...it, order: i })),
      },
    });
  };

  // ---------- RENDER ----------

  const TABS = [
    { id: "hero", label: "Hero Slides" },
    { id: "mission", label: "Mission / Vision" },
    { id: "services", label: "Services" },
    { id: "expertise", label: "Expertise" },
    { id: "why", label: "Why Choose Us" },
    { id: "values", label: "Core Values" },
    { id: "cta", label: "Get In Touch" },
  ];

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
            Home Page Content
          </h1>
          <p className="mt-[6px] text-[13px] leading-[1.6] text-[#666] sm:text-[14px]">
            Manage all home page sections.
          </p>
        </div>
        <div className="flex flex-col gap-[10px] xs:flex-row xs:items-center">
          <div className="flex items-center gap-[8px] rounded-[12px] border border-[#E4E4E4] bg-white px-[12px] py-[10px]">
            <span className="text-[12px] font-medium text-[#111]">Active</span>
            <Switch
              checked={entry?.isActive ?? true}
              onCheckedChange={(checked) =>
                setEntry((prev) => (prev ? { ...prev, isActive: checked } : prev))
              }
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="h-[46px] gap-[8px] rounded-[14px] bg-[#67003E] px-[22px] text-[14px] font-medium text-white hover:bg-[#4F0030]"
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
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-[28px] w-[28px] animate-spin text-[#67003E]" />
        </div>
      ) : !entry ? null : (
        <div className="mx-auto mt-[22px] max-w-[1600px] sm:mt-[28px]">
          {/* TABS — horizontally scrollable on mobile */}
          <div className="mb-[16px] flex gap-[6px] overflow-x-auto pb-[4px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-[14px] py-[8px] text-[12px] font-medium transition-colors sm:text-[13px] ${
                  activeTab === tab.id
                    ? "bg-[#67003E] text-white"
                    : "bg-white text-[#666] hover:bg-[#F0E4EC]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Card className="rounded-[18px] border border-white/60 bg-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.06)] sm:rounded-[22px]">
            <CardContent className="p-[16px] sm:p-[22px] lg:p-[28px]">
              {/* ================= HERO SLIDES ================= */}
              {activeTab === "hero" && (
                <div>
                  <div className="mb-[14px] flex flex-col gap-[10px] xs:flex-row xs:items-center xs:justify-between">
                    <h2 className="text-[16px] font-semibold text-[#111]">
                      Hero Slides ({entry.heroSlides.length})
                    </h2>
                    <Button
                      onClick={openSlideCreate}
                      className="h-[38px] w-full gap-[6px] rounded-[10px] bg-[#67003E] text-[13px] font-medium text-white hover:bg-[#4F0030] xs:w-auto"
                    >
                      <Plus className="h-[14px] w-[14px]" /> Add Slide
                    </Button>
                  </div>
                  <div className="space-y-[10px]">
                    {entry.heroSlides.length === 0 && (
                      <p className="text-[12px] text-[#888]">No slides yet.</p>
                    )}
                    {entry.heroSlides.map((s, i) => (
                      <ItemShell
                        key={s._id || i}
                        title={s.title || "Untitled slide"}
                        subtitle={s.subtitle}
                        onEdit={() => openSlideEdit(i)}
                        onRemove={() => removeSlide(i)}
                        onUp={() => moveSlide(i, -1)}
                        onDown={() => moveSlide(i, 1)}
                        canUp={i > 0}
                        canDown={i < entry.heroSlides.length - 1}
                      >
                        {s.image && (
                          <div className="relative h-[40px] w-[64px] shrink-0 overflow-hidden rounded-[6px] bg-[#E8D5E0]">
                            <Image
                              src={resolveImage(s.image)}
                              alt={s.imageAlt || s.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        )}
                      </ItemShell>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= MISSION / VISION ================= */}
              {activeTab === "mission" && (
                <div className="space-y-[14px]">
                  <h2 className="text-[16px] font-semibold text-[#111]">Mission / Vision</h2>
                  <FormField
                    label="Tagline"
                    value={entry.missionVision.tagline}
                    onChange={(v) =>
                      setEntry({ ...entry, missionVision: { ...entry.missionVision, tagline: v } })
                    }
                    placeholder="Himmat Contracting Company"
                  />
                  <FormField
                    label="Title"
                    value={entry.missionVision.title}
                    onChange={(v) =>
                      setEntry({ ...entry, missionVision: { ...entry.missionVision, title: v } })
                    }
                    placeholder="Turning Every Challenge..."
                  />
                  <FormField
                    label="Description"
                    value={entry.missionVision.description}
                    onChange={(v) =>
                      setEntry({ ...entry, missionVision: { ...entry.missionVision, description: v } })
                    }
                    textarea
                    rows={4}
                  />
                  <InlineLinkManager
                    links={entry.missionVision.inlineLinks}
                    onChange={(links) =>
                      setEntry({
                        ...entry,
                        missionVision: { ...entry.missionVision, inlineLinks: links },
                      })
                    }
                  />
                  <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
                    <FormField
                      label="Button Text"
                      value={entry.missionVision.buttonText}
                      onChange={(v) =>
                        setEntry({ ...entry, missionVision: { ...entry.missionVision, buttonText: v } })
                      }
                    />
                    <FormField
                      label="Button Link"
                      value={entry.missionVision.buttonLink}
                      onChange={(v) =>
                        setEntry({ ...entry, missionVision: { ...entry.missionVision, buttonLink: v } })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
                    <FormField
                      label="Vision Title"
                      value={entry.missionVision.visionTitle}
                      onChange={(v) =>
                        setEntry({ ...entry, missionVision: { ...entry.missionVision, visionTitle: v } })
                      }
                    />
                    <FormField
                      label="Mission Title"
                      value={entry.missionVision.missionTitle}
                      onChange={(v) =>
                        setEntry({ ...entry, missionVision: { ...entry.missionVision, missionTitle: v } })
                      }
                    />
                    <FormField
                      label="Vision Description"
                      value={entry.missionVision.visionDescription}
                      onChange={(v) =>
                        setEntry({
                          ...entry,
                          missionVision: { ...entry.missionVision, visionDescription: v },
                        })
                      }
                      textarea
                      rows={3}
                    />
                    <FormField
                      label="Mission Description"
                      value={entry.missionVision.missionDescription}
                      onChange={(v) =>
                        setEntry({
                          ...entry,
                          missionVision: { ...entry.missionVision, missionDescription: v },
                        })
                      }
                      textarea
                      rows={3}
                    />
                  </div>
                  <ImageUploadField
                    label="Image"
                    value={entry.missionVision.image}
                    altValue={entry.missionVision.imageAlt}
                    onImageChange={(url) =>
                      setEntry({ ...entry, missionVision: { ...entry.missionVision, image: url } })
                    }
                    onAltChange={(alt) =>
                      setEntry({ ...entry, missionVision: { ...entry.missionVision, imageAlt: alt } })
                    }
                    previewHeight="h-[160px]"
                  />
                </div>
              )}

              {/* ================= SERVICES ================= */}
              {activeTab === "services" && (
                <div className="space-y-[14px]">
                  <h2 className="text-[16px] font-semibold text-[#111]">Services</h2>
                  <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
                    <FormField
                      label="Tagline"
                      value={entry.services.tagline}
                      onChange={(v) =>
                        setEntry({ ...entry, services: { ...entry.services, tagline: v } })
                      }
                    />
                    <FormField
                      label="Title"
                      value={entry.services.title}
                      onChange={(v) =>
                        setEntry({ ...entry, services: { ...entry.services, title: v } })
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-[10px] xs:flex-row xs:items-center xs:justify-between">
                    <h3 className="text-[14px] font-semibold text-[#111]">
                      Cards ({entry.services.cards.length})
                    </h3>
                    <Button
                      onClick={openCardCreate}
                      className="h-[38px] w-full gap-[6px] rounded-[10px] bg-[#67003E] text-[13px] font-medium text-white hover:bg-[#4F0030] xs:w-auto"
                    >
                      <Plus className="h-[14px] w-[14px]" /> Add Card
                    </Button>
                  </div>
                  <div className="space-y-[10px]">
                    {entry.services.cards.length === 0 && (
                      <p className="text-[12px] text-[#888]">No cards yet.</p>
                    )}
                    {entry.services.cards.map((c, i) => (
                      <ItemShell
                        key={c._id || i}
                        title={c.title}
                        subtitle={c.subtitle}
                        onEdit={() => openCardEdit(i)}
                        onRemove={() => removeCard(i)}
                        onUp={() => moveCard(i, -1)}
                        onDown={() => moveCard(i, 1)}
                        canUp={i > 0}
                        canDown={i < entry.services.cards.length - 1}
                      >
                        {c.image && (
                          <div className="relative h-[40px] w-[64px] shrink-0 overflow-hidden rounded-[6px] bg-[#E8D5E0]">
                            <Image
                              src={resolveImage(c.image)}
                              alt={c.imageAlt || c.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        )}
                      </ItemShell>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= EXPERTISE (icon = image) ================= */}
              {activeTab === "expertise" && (
                <div className="space-y-[14px]">
                  <h2 className="text-[16px] font-semibold text-[#111]">Expertise</h2>
                  <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
                    <FormField
                      label="Tagline"
                      value={entry.expertise.tagline}
                      onChange={(v) =>
                        setEntry({ ...entry, expertise: { ...entry.expertise, tagline: v } })
                      }
                    />
                    <FormField
                      label="Title"
                      value={entry.expertise.title}
                      onChange={(v) =>
                        setEntry({ ...entry, expertise: { ...entry.expertise, title: v } })
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-[10px] xs:flex-row xs:items-center xs:justify-between">
                    <h3 className="text-[14px] font-semibold text-[#111]">
                      Items ({entry.expertise.items.length})
                    </h3>
                    <Button
                      onClick={openExpCreate}
                      className="h-[38px] w-full gap-[6px] rounded-[10px] bg-[#67003E] text-[13px] font-medium text-white hover:bg-[#4F0030] xs:w-auto"
                    >
                      <Plus className="h-[14px] w-[14px]" /> Add Item
                    </Button>
                  </div>
                  <div className="space-y-[10px]">
                    {entry.expertise.items.length === 0 && (
                      <p className="text-[12px] text-[#888]">No items yet.</p>
                    )}
                    {entry.expertise.items.map((it, i) => (
                      <ItemShell
                        key={it._id || i}
                        title={it.title}
                        subtitle={it.description}
                        onEdit={() => openExpEdit(i)}
                        onRemove={() => removeExp(i)}
                        onUp={() => moveExp(i, -1)}
                        onDown={() => moveExp(i, 1)}
                        canUp={i > 0}
                        canDown={i < entry.expertise.items.length - 1}
                      >
                        {it.icon && (
                          <div className="relative h-[36px] w-[36px] shrink-0 overflow-hidden rounded-[8px] bg-[#F8F0F5]">
                            <Image
                              src={resolveImage(it.icon)}
                              alt={it.title}
                              fill
                              unoptimized
                              className="object-contain p-[2px]"
                            />
                          </div>
                        )}
                      </ItemShell>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= WHY CHOOSE US ================= */}
              {activeTab === "why" && (
                <div className="space-y-[14px]">
                  <h2 className="text-[16px] font-semibold text-[#111]">Why Choose Us</h2>
                  <FormField
                    label="Tagline"
                    value={entry.whyChooseUs.tagline}
                    onChange={(v) =>
                      setEntry({ ...entry, whyChooseUs: { ...entry.whyChooseUs, tagline: v } })
                    }
                  />
                  <FormField
                    label="Title"
                    value={entry.whyChooseUs.title}
                    onChange={(v) =>
                      setEntry({ ...entry, whyChooseUs: { ...entry.whyChooseUs, title: v } })
                    }
                  />
                  <FormField
                    label="Description"
                    value={entry.whyChooseUs.description}
                    onChange={(v) =>
                      setEntry({ ...entry, whyChooseUs: { ...entry.whyChooseUs, description: v } })
                    }
                    textarea
                    rows={3}
                  />
                  <ImageUploadField
                    label="Image"
                    value={entry.whyChooseUs.image}
                    altValue={entry.whyChooseUs.imageAlt}
                    onImageChange={(url) =>
                      setEntry({ ...entry, whyChooseUs: { ...entry.whyChooseUs, image: url } })
                    }
                    onAltChange={(alt) =>
                      setEntry({ ...entry, whyChooseUs: { ...entry.whyChooseUs, imageAlt: alt } })
                    }
                  />

                  <div className="flex flex-col gap-[10px] xs:flex-row xs:items-center xs:justify-between">
                    <h3 className="text-[14px] font-semibold text-[#111]">
                      Stats ({entry.whyChooseUs.stats.length})
                    </h3>
                    <Button
                      onClick={openStatCreate}
                      className="h-[38px] w-full gap-[6px] rounded-[10px] bg-[#67003E] text-[13px] font-medium text-white hover:bg-[#4F0030] xs:w-auto"
                    >
                      <Plus className="h-[14px] w-[14px]" /> Add Stat
                    </Button>
                  </div>
                  <div className="space-y-[10px]">
                    {entry.whyChooseUs.stats.length === 0 && (
                      <p className="text-[12px] text-[#888]">No stats yet.</p>
                    )}
                    {entry.whyChooseUs.stats.map((s, i) => (
                      <ItemShell
                        key={s._id || i}
                        title={s.label}
                        subtitle={`${s.percentage}%`}
                        onEdit={() => openStatEdit(i)}
                        onRemove={() => removeStat(i)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ================= CORE VALUES ================= */}
              {activeTab === "values" && (
                <div className="space-y-[14px]">
                  <h2 className="text-[16px] font-semibold text-[#111]">Core Values</h2>
                  <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
                    <FormField
                      label="Tagline"
                      value={entry.coreValues.tagline}
                      onChange={(v) =>
                        setEntry({ ...entry, coreValues: { ...entry.coreValues, tagline: v } })
                      }
                    />
                    <FormField
                      label="Title"
                      value={entry.coreValues.title}
                      onChange={(v) =>
                        setEntry({ ...entry, coreValues: { ...entry.coreValues, title: v } })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-[10px] xs:flex-row xs:items-center xs:justify-between">
                    <h3 className="text-[14px] font-semibold text-[#111]">
                      Values ({entry.coreValues.items.length})
                    </h3>
                    <Button
                      onClick={openCvCreate}
                      className="h-[38px] w-full gap-[6px] rounded-[10px] bg-[#67003E] text-[13px] font-medium text-white hover:bg-[#4F0030] xs:w-auto"
                    >
                      <Plus className="h-[14px] w-[14px]" /> Add Value
                    </Button>
                  </div>
                  <div className="space-y-[10px]">
                    {entry.coreValues.items.length === 0 && (
                      <p className="text-[12px] text-[#888]">No core values yet.</p>
                    )}
                    {entry.coreValues.items.map((it, i) => (
                      <ItemShell
                        key={it._id || i}
                        title={it.title}
                        subtitle={it.description}
                        onEdit={() => openCvEdit(i)}
                        onRemove={() => removeCv(i)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ================= GET IN TOUCH ================= */}
              {activeTab === "cta" && (
                <div className="space-y-[14px]">
                  <h2 className="text-[16px] font-semibold text-[#111]">Get In Touch</h2>
                  <FormField
                    label="Subtitle"
                    value={entry.getInTouch.subtitle}
                    onChange={(v) =>
                      setEntry({ ...entry, getInTouch: { ...entry.getInTouch, subtitle: v } })
                    }
                  />
                  <FormField
                    label="Title"
                    value={entry.getInTouch.title}
                    onChange={(v) =>
                      setEntry({ ...entry, getInTouch: { ...entry.getInTouch, title: v } })
                    }
                  />
                  <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
                    <FormField
                      label="Button Text"
                      value={entry.getInTouch.buttonText}
                      onChange={(v) =>
                        setEntry({ ...entry, getInTouch: { ...entry.getInTouch, buttonText: v } })
                      }
                    />
                    <FormField
                      label="Button Link"
                      value={entry.getInTouch.buttonLink}
                      onChange={(v) =>
                        setEntry({ ...entry, getInTouch: { ...entry.getInTouch, buttonLink: v } })
                      }
                    />
                  </div>
                  <ImageUploadField
                    label="Image"
                    value={entry.getInTouch.image}
                    altValue={entry.getInTouch.imageAlt}
                    onImageChange={(url) =>
                      setEntry({ ...entry, getInTouch: { ...entry.getInTouch, image: url } })
                    }
                    onAltChange={(alt) =>
                      setEntry({ ...entry, getInTouch: { ...entry.getInTouch, imageAlt: alt } })
                    }
                    previewHeight="h-[160px]"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= HERO SLIDE MODAL ================= */}
      <Modal
        open={slideModal && !!slideDraft}
        title={slideIndex !== null ? "Edit Slide" : "New Slide"}
        onClose={() => {
          setSlideModal(false);
          setSlideDraft(null);
          setSlideIndex(null);
        }}
      >
        {slideDraft && (
          <div className="space-y-[12px]">
            <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
              <FormField
                label="Subtitle"
                value={slideDraft.subtitle}
                onChange={(v) => setSlideDraft({ ...slideDraft, subtitle: v })}
              />
              <FormField
                label="Title"
                value={slideDraft.title}
                onChange={(v) => setSlideDraft({ ...slideDraft, title: v })}
              />
            </div>
            <FormField
              label="Description"
              value={slideDraft.description}
              onChange={(v) => setSlideDraft({ ...slideDraft, description: v })}
              textarea
              rows={3}
            />
            <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
              <FormField
                label="Read More Text"
                value={slideDraft.readMoreText}
                onChange={(v) => setSlideDraft({ ...slideDraft, readMoreText: v })}
              />
              <FormField
                label="Read More Link"
                value={slideDraft.readMoreLink}
                onChange={(v) => setSlideDraft({ ...slideDraft, readMoreLink: v })}
              />
            </div>
            <InlineLinkManager
              links={slideDraft.inlineLinks}
              onChange={(links) => setSlideDraft({ ...slideDraft, inlineLinks: links })}
            />
            <ImageUploadField
              label="Image"
              value={slideDraft.image}
              altValue={slideDraft.imageAlt}
              onImageChange={(url) => setSlideDraft({ ...slideDraft, image: url })}
              onAltChange={(alt) => setSlideDraft({ ...slideDraft, imageAlt: alt })}
              previewHeight="h-[140px]"
            />
            <div className="flex flex-col gap-[10px] pt-[4px] xs:flex-row xs:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSlideModal(false);
                  setSlideDraft(null);
                  setSlideIndex(null);
                }}
                className="h-[44px] rounded-[12px] border-[#E4E4E4] bg-white text-[14px] text-[#666]"
              >
                Cancel
              </Button>
              <Button
                onClick={saveSlide}
                className="h-[44px] rounded-[12px] bg-[#67003E] px-[22px] text-[14px] font-medium text-white hover:bg-[#4F0030]"
              >
                {slideIndex !== null ? "Save Slide" : "Add Slide"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= SERVICE CARD MODAL ================= */}
      <Modal
        open={cardModal && !!cardDraft}
        title={cardIndex !== null ? "Edit Service Card" : "New Service Card"}
        onClose={() => {
          setCardModal(false);
          setCardDraft(null);
          setCardIndex(null);
        }}
      >
        {cardDraft && (
          <div className="space-y-[12px]">
            <div className="grid grid-cols-1 gap-[10px] xs:grid-cols-2">
              <FormField
                label="Title"
                value={cardDraft.title}
                onChange={(v) => setCardDraft({ ...cardDraft, title: v })}
              />
              <FormField
                label="Subtitle"
                value={cardDraft.subtitle}
                onChange={(v) => setCardDraft({ ...cardDraft, subtitle: v })}
              />
            </div>
            <FormField
              label="Link"
              value={cardDraft.link}
              onChange={(v) => setCardDraft({ ...cardDraft, link: v })}
              placeholder="/services/interior"
            />
            <ImageUploadField
              label="Image"
              value={cardDraft.image}
              altValue={cardDraft.imageAlt}
              onImageChange={(url) => setCardDraft({ ...cardDraft, image: url })}
              onAltChange={(alt) => setCardDraft({ ...cardDraft, imageAlt: alt })}
            />
            <div className="flex flex-col gap-[10px] pt-[4px] xs:flex-row xs:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setCardModal(false);
                  setCardDraft(null);
                  setCardIndex(null);
                }}
                className="h-[44px] rounded-[12px] border-[#E4E4E4] bg-white text-[14px] text-[#666]"
              >
                Cancel
              </Button>
              <Button
                onClick={saveCard}
                className="h-[44px] rounded-[12px] bg-[#67003E] px-[22px] text-[14px] font-medium text-white hover:bg-[#4F0030]"
              >
                {cardIndex !== null ? "Save Card" : "Add Card"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= EXPERTISE MODAL (ICON = IMAGE) ================= */}
      <Modal
        open={expModal && !!expDraft}
        title={expIndex !== null ? "Edit Expertise" : "New Expertise"}
        onClose={() => {
          setExpModal(false);
          setExpDraft(null);
          setExpIndex(null);
        }}
      >
        {expDraft && (
          <div className="space-y-[12px]">
            <FormField
              label="Title"
              value={expDraft.title}
              onChange={(v) => setExpDraft({ ...expDraft, title: v })}
            />
            <FormField
              label="Description"
              value={expDraft.description}
              onChange={(v) => setExpDraft({ ...expDraft, description: v })}
              textarea
              rows={3}
            />
            <ImageUploadField
              label="Icon (Image)"
              value={expDraft.icon}
              onImageChange={(url) => setExpDraft({ ...expDraft, icon: url })}
              previewHeight="h-[100px]"
            />
            <div className="flex flex-col gap-[10px] pt-[4px] xs:flex-row xs:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setExpModal(false);
                  setExpDraft(null);
                  setExpIndex(null);
                }}
                className="h-[44px] rounded-[12px] border-[#E4E4E4] bg-white text-[14px] text-[#666]"
              >
                Cancel
              </Button>
              <Button
                onClick={saveExp}
                className="h-[44px] rounded-[12px] bg-[#67003E] px-[22px] text-[14px] font-medium text-white hover:bg-[#4F0030]"
              >
                {expIndex !== null ? "Save Item" : "Add Item"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= WHY STAT MODAL ================= */}
      <Modal
        open={statModal && !!statDraft}
        title={statIndex !== null ? "Edit Stat" : "New Stat"}
        onClose={() => {
          setStatModal(false);
          setStatDraft(null);
          setStatIndex(null);
        }}
      >
        {statDraft && (
          <div className="space-y-[12px]">
            <FormField
              label="Label"
              value={statDraft.label}
              onChange={(v) => setStatDraft({ ...statDraft, label: v })}
            />
            <FormField
              label="Percentage (0-100)"
              value={statDraft.percentage}
              onChange={(v) =>
                setStatDraft({
                  ...statDraft,
                  percentage: Math.min(100, Math.max(0, Number(v) || 0)),
                })
              }
              type="number"
            />
            <div className="flex flex-col gap-[10px] pt-[4px] xs:flex-row xs:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStatModal(false);
                  setStatDraft(null);
                  setStatIndex(null);
                }}
                className="h-[44px] rounded-[12px] border-[#E4E4E4] bg-white text-[14px] text-[#666]"
              >
                Cancel
              </Button>
              <Button
                onClick={saveStat}
                className="h-[44px] rounded-[12px] bg-[#67003E] px-[22px] text-[14px] font-medium text-white hover:bg-[#4F0030]"
              >
                {statIndex !== null ? "Save Stat" : "Add Stat"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= CORE VALUE MODAL ================= */}
      <Modal
        open={cvModal && !!cvDraft}
        title={cvIndex !== null ? "Edit Core Value" : "New Core Value"}
        onClose={() => {
          setCvModal(false);
          setCvDraft(null);
          setCvIndex(null);
        }}
      >
        {cvDraft && (
          <div className="space-y-[12px]">
            <FormField
              label="Title"
              value={cvDraft.title}
              onChange={(v) => setCvDraft({ ...cvDraft, title: v })}
            />
            <FormField
              label="Description"
              value={cvDraft.description}
              onChange={(v) => setCvDraft({ ...cvDraft, description: v })}
              textarea
              rows={3}
            />
            <div className="flex flex-col gap-[10px] pt-[4px] xs:flex-row xs:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setCvModal(false);
                  setCvDraft(null);
                  setCvIndex(null);
                }}
                className="h-[44px] rounded-[12px] border-[#E4E4E4] bg-white text-[14px] text-[#666]"
              >
                Cancel
              </Button>
              <Button
                onClick={saveCv}
                className="h-[44px] rounded-[12px] bg-[#67003E] px-[22px] text-[14px] font-medium text-white hover:bg-[#4F0030]"
              >
                {cvIndex !== null ? "Save Value" : "Add Value"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}