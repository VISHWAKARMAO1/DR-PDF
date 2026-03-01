import { useMemo, useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PenLine,
  Layers,
  Shuffle,
  LayoutGrid,
  Minimize2,
  ScissorsLineDashed,
  Trash2,
  FilePen,
  FormInput,
  Stamp,
  Lock,
  LockOpen,
  ScanText,
  ArrowUpRight,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";

type Category = "Edit" | "Organize" | "Security" | "Extract";

interface Tool {
  name: string;
  description: string;
  to: string;
  icon: LucideIcon;
  category: Category;
  gradient: string;
  iconBg: string;
}

const tools: Tool[] = [
  {
    name: "Editor",
    description: "Edit PDF text, annotations, and export updated files.",
    to: "/editor",
    icon: PenLine,
    category: "Edit",
    gradient: "from-primary/20 via-primary/5 to-transparent",
    iconBg: "bg-primary/15 text-primary border-primary/30",
  },
  {
    name: "Merge",
    description: "Combine multiple PDFs into a single document with custom ordering.",
    to: "/merge",
    icon: Layers,
    category: "Organize",
    gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
    iconBg: "bg-violet-500/15 text-violet-500 border-violet-500/30",
  },
  {
    name: "Alternate & Mix",
    description: "Mix pages from multiple PDFs in alternating order.",
    to: "/alternate-mix",
    icon: Shuffle,
    category: "Organize",
    gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    iconBg: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
  },
  {
    name: "Organize",
    description: "Reorder, rotate, and delete pages within a PDF.",
    to: "/organize",
    icon: LayoutGrid,
    category: "Organize",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    iconBg: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  },
  {
    name: "Compress",
    description: "Reduce PDF file size while preserving quality.",
    to: "/compress",
    icon: Minimize2,
    category: "Edit",
    gradient: "from-fuchsia-500/20 via-fuchsia-500/5 to-transparent",
    iconBg: "bg-fuchsia-500/15 text-fuchsia-500 border-fuchsia-500/30",
  },
  {
    name: "Extract Pages",
    description: "Create a new PDF from a selected range of pages.",
    to: "/extract",
    icon: ScissorsLineDashed,
    category: "Extract",
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  },
  {
    name: "Delete Pages",
    description: "Permanently remove unwanted pages from a PDF.",
    to: "/delete-pages",
    icon: Trash2,
    category: "Extract",
    gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
    iconBg: "bg-rose-500/15 text-rose-500 border-rose-500/30",
  },
  {
    name: "Fill & Sign",
    description: "Fill form fields and add your digital signature.",
    to: "/fill-sign",
    icon: FilePen,
    category: "Edit",
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  },
  {
    name: "Create Forms",
    description: "Add interactive form fields to any PDF document.",
    to: "/create-forms",
    icon: FormInput,
    category: "Edit",
    gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
    iconBg: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
  },
  {
    name: "Watermark",
    description: "Overlay text or image watermarks on PDF pages.",
    to: "/watermark",
    icon: Stamp,
    category: "Edit",
    gradient: "from-sky-500/20 via-sky-500/5 to-transparent",
    iconBg: "bg-sky-500/15 text-sky-500 border-sky-500/30",
  },
  {
    name: "Protect",
    description: "Encrypt PDFs with a password to restrict access.",
    to: "/protect",
    icon: Lock,
    category: "Security",
    gradient: "from-red-500/20 via-red-500/5 to-transparent",
    iconBg: "bg-red-500/15 text-red-500 border-red-500/30",
  },
  {
    name: "Unlock",
    description: "Remove password protection from PDFs.",
    to: "/unlock",
    icon: LockOpen,
    category: "Security",
    gradient: "from-green-500/20 via-green-500/5 to-transparent",
    iconBg: "bg-green-500/15 text-green-500 border-green-500/30",
  },
  {
    name: "OCR",
    description: "Extract and recognize text from scanned PDF pages.",
    to: "/ocr",
    icon: ScanText,
    category: "Extract",
    gradient: "from-teal-500/20 via-teal-500/5 to-transparent",
    iconBg: "bg-teal-500/15 text-teal-500 border-teal-500/30",
  },
];

const categories: Category[] = ["Edit", "Organize", "Extract", "Security"];

const categoryColors: Record<Category, string> = {
  Edit: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  Organize: "bg-violet-500/10 text-violet-500 border-violet-500/20 hover:bg-violet-500/20",
  Extract: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
  Security: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
};

export default function Tools() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      const matchesSearch =
        !search.trim() ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !activeCategory || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pt-24">
      <TopNav variant="editor" />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-4 pb-12">
        {/* Hero header */}
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-7 sm:px-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-purple-500/15" />
          <h1 className="relative text-2xl font-semibold tracking-tight">All Tools</h1>
          <p className="relative mt-1 text-sm text-muted-foreground">
            {tools.length} PDF tools, all browser-based. No installation needed.
          </p>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools…"
              className="pl-9 pr-9 bg-card/70 border-border/70"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                !activeCategory
                  ? "bg-foreground text-background border-foreground"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/40"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  activeCategory === cat
                    ? categoryColors[cat]
                    : "border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/40"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {(search || activeCategory) && (
          <p className="text-xs text-muted-foreground -mt-2">
            {filtered.length} tool{filtered.length !== 1 ? "s" : ""} found
            {activeCategory ? ` in "${activeCategory}"` : ""}
            {search ? ` matching "${search}"` : ""}
          </p>
        )}

        {/* Tools grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/40 py-16 text-center">
            <Search className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm font-medium">No tools found</p>
            <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filter.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(""); setActiveCategory(null); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.name}
                  className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                >
                  {/* Gradient tint */}
                  <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", tool.gradient)} />

                  <div className="relative flex flex-col h-full gap-4">
                    {/* Top row: icon + badge */}
                    <div className="flex items-start justify-between">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", tool.iconBg)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", categoryColors[tool.category])}
                      >
                        {tool.category}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h2 className="text-base font-semibold leading-snug">{tool.name}</h2>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tool.description}</p>
                    </div>

                    {/* CTA */}
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 border-border/60 bg-background/60 text-foreground transition-all hover:bg-gradient-to-r hover:from-primary hover:to-purple-600 hover:text-primary-foreground hover:border-transparent"
                    >
                      <NavLink to={tool.to} activeClassName="">
                        Open Tool
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </NavLink>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

