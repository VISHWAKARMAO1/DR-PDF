import { NavLink } from "@/components/NavLink";
import { ChevronLeft } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description: string;
  /** Gradient colors for the decorative overlay, e.g. "from-primary/15 ... to-purple-500/15" */
  gradientFrom?: string;
  gradientTo?: string;
  icon?: LucideIcon;
  backTo?: string;
  backLabel?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  gradientFrom = "from-primary/15",
  gradientTo = "to-purple-500/15",
  icon: Icon,
  backTo = "/tools",
  backLabel = "All Tools",
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-6 sm:px-8", className)}>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-r via-transparent",
          gradientFrom,
          gradientTo
        )}
      />

      {/* Back link */}
      <NavLink
        to={backTo}
        className="relative mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        activeClassName=""
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {backLabel}
      </NavLink>

      <div className="relative flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/60">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
