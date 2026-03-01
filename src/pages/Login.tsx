import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { firebaseConfigured } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import {
  AlertCircle, ArrowRight, Eye, EyeOff, FileText,
  Loader2, Lock, Mail, Moon, Sun,
} from "lucide-react";
import { gsap } from "gsap";

/* ---------- tiny Google SVG icon ---------- */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function Login() {
  const { signIn, signInWithGoogle, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/tools";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [socialLoading, setSocialLoading] = useState<"google" | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.from(panelRef.current, { y: 32, opacity: 0, duration: 0.7, ease: "power3.out" });
  }, []);

  useEffect(() => {
    if (!orbRef.current) return;
    gsap.to(orbRef.current, {
      x: 40, y: -30, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut",
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code ?? "";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError("Invalid email or password.");
      } else if (msg.includes("too-many-requests")) {
        setError("Too many attempts. Try again later.");
      } else {
        setError("Sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setSocialLoading("google");
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch {
      setError("Google sign-in failed.");
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center p-4">
      {/* Ambient orbs */}
      <div ref={orbRef} className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

      {/* Theme toggle */}
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute top-5 right-5 z-50 grid h-9 w-9 place-items-center rounded-full border border-border/50 bg-card/70 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark"
            ? <Sun className="h-4 w-4" />
            : <Moon className="h-4 w-4" />}
        </button>
      )}

      <div ref={panelRef} className="relative z-10 w-full max-w-5xl">
        <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border/40 shadow-2xl shadow-primary/10 md:grid-cols-2">

          {/* ── Left: Branding Panel ── */}
          <div className="relative hidden flex-col justify-between overflow-hidden p-10 md:flex"
            style={{ background: "linear-gradient(145deg, hsl(155,100%,10%) 0%, hsl(212,55%,8%) 60%, hsl(200,80%,8%) 100%)" }}>
            {/* grid pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: "linear-gradient(hsl(155,100%,70%) 1px, transparent 1px), linear-gradient(90deg, hsl(155,100%,70%) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

            {/* Logo */}
            <div className="relative flex items-center gap-3">
              <div className="relative grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5">
                <div className="absolute inset-[2px] rounded-full"
                  style={{ background: "linear-gradient(135deg, hsl(155,100%,48%), hsl(180,100%,50%), hsl(210,100%,55%))" }} />
                <span className="relative text-sm font-bold text-white">D</span>
              </div>
              <span className="text-lg font-bold text-white">Dr. PDF Pro</span>
            </div>

            {/* Hero copy */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                <FileText className="h-3 w-3" /> Professional PDF Suite
              </div>
              <h2 className="text-3xl font-extrabold leading-tight text-white xl:text-4xl">
                All your PDF work,<br />
                <span style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundImage: "linear-gradient(90deg, hsl(155,100%,55%), hsl(180,100%,60%))" }}>
                  in one place.
                </span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                Edit, merge, compress, sign, extract &amp; secure PDFs — all locally in your browser. Zero uploads. Zero data leaks.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {["17+ Tools", "Browser-Only", "AI Assistant", "Lightning Fast"].map((f) => (
                <span key={f} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">{f}</span>
              ))}
            </div>
          </div>

          {/* ── Right: Form Panel ── */}
          <div className="flex flex-col justify-center bg-card/95 px-6 py-10 backdrop-blur-xl sm:px-10">
            {/* Mobile logo */}
            <Link to="/" className="flex items-center gap-2 mb-8 md:hidden">
              <div className="relative grid h-9 w-9 place-items-center rounded-full border border-border/60">
                <div className="absolute inset-[2px] rounded-full"
                  style={{ background: "linear-gradient(135deg, hsl(155,100%,48%), hsl(180,100%,50%), hsl(210,100%,55%))" }} />
                <span className="relative text-xs font-bold text-white">D</span>
              </div>
              <span className="font-semibold">Dr. PDF Pro</span>
            </Link>

            <div className="mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to access your PDF workspace
              </p>
            </div>

            {/* Social logins */}
            <Button type="button" variant="outline" className="w-full gap-2 text-sm h-11" onClick={handleGoogle} disabled={!!socialLoading || loading}>
              {socialLoading === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </Button>

            <div className="my-5 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or continue with email</span>
              <Separator className="flex-1" />
            </div>

            {/* Firebase not configured notice */}
            {!firebaseConfigured && (
              <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
                <strong>Firebase not configured.</strong> Add your <code className="text-xs bg-black/10 dark:bg-white/10 px-1 rounded">VITE_FIREBASE_*</code> keys to a <code className="text-xs bg-black/10 dark:bg-white/10 px-1 rounded">.env</code> file. See <code className="text-xs">.env.example</code>.
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Email / password form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 gap-2 text-sm font-semibold"
                style={{ background: "linear-gradient(90deg, hsl(155,100%,42%), hsl(200,100%,50%))", color: "hsl(212,55%,5%)" }}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Create one free
              </Link>
            </p>

            <p className="mt-4 text-center text-xs text-muted-foreground/60">
              By signing in you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
