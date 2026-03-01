import * as React from "react";
import { useTheme } from "next-themes";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, Menu, Moon, Sun, User, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TopNavProps = {
  variant?: "home" | "editor";
  rightSlot?: React.ReactNode;
};

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/tools", label: "Tools", end: false },
  { to: "/about", label: "About", end: false },
  { to: "/contact", label: "Contact", end: false },
];

export function TopNav({ variant = "home", rightSlot }: TopNavProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  /* Avatar initials helper */
  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0].toUpperCase() ?? "U";

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95vw] max-w-6xl z-50 rounded-2xl border border-border/40 bg-background/35 backdrop-blur-xl shadow-2xl shadow-primary/10">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        {/* Logo */}
        <NavLink to="/" className="inline-flex items-center gap-3 shrink-0" activeClassName="">
          <div className="relative grid h-10 w-10 place-items-center rounded-full border border-border/60 bg-background/70">
            <div className="brand-gradient-bg brand-gradient-animate absolute inset-[2px] rounded-full opacity-90" />
            <span className="relative text-sm font-bold text-primary-foreground">D</span>
          </div>
          <div className="text-base font-semibold tracking-tight brand-gradient-text brand-gradient-animate hidden sm:block">
            Dr. PDF Pro
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav className="ml-6 hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className="relative py-1 hover:text-foreground transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
              activeClassName="text-foreground after:!w-full"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {rightSlot}

          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="relative h-9 w-9 rounded-full"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          )}

          {user ? (
            /* ── Authenticated: user avatar dropdown ── */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-primary/40 bg-primary/10 text-xs font-bold text-primary ring-offset-background transition-all hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 focus-visible:outline-none"
                  aria-label="User menu"
                >
                  {user.photoURL
                    ? <img src={user.photoURL} alt="" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
                    : initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold truncate">{user.displayName ?? "User"}</span>
                  <span className="text-xs font-normal text-muted-foreground truncate">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavLink to="/tools" activeClassName="" className="flex w-full cursor-pointer items-center gap-2">
                    <User className="h-4 w-4" /> My Tools
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* ── Unauthenticated: Sign In + Get Started ── */
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-sm">
                <NavLink to="/login" activeClassName="">Sign In</NavLink>
              </Button>
              <Button
                asChild
                size="sm"
                className="hidden sm:inline-flex bg-gradient-to-r from-primary to-sky-500 text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
              >
                <NavLink to="/register" activeClassName="">Get Started</NavLink>
              </Button>
            </>
          )}

          {/* Hamburger — mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out md:hidden",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 pb-4 pt-2 border-t border-border/30">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeClassName="bg-accent text-foreground font-medium"
            >
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-accent"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-block rounded-xl px-3 py-2.5 text-center text-sm font-medium border border-border/50 text-foreground hover:bg-accent"
                activeClassName=""
              >
                Sign In
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="mt-1 inline-block rounded-xl px-3 py-2.5 text-center text-sm font-medium text-primary-foreground bg-gradient-to-r from-primary to-sky-500"
                activeClassName=""
              >
                Get Started
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
