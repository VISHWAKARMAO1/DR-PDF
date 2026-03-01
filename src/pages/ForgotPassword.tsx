import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { gsap } from "gsap";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.from(panelRef.current, { y: 32, opacity: 0, duration: 0.65, ease: "power3.out" });
  }, []);

  useEffect(() => {
    if (!orbRef.current) return;
    gsap.to(orbRef.current, { x: 30, y: -20, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code ?? "";
      if (msg.includes("user-not-found")) {
        setError("No account found with this email.");
      } else {
        setError("Failed to send reset email. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center p-4">
      <div ref={orbRef} className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

      <div ref={panelRef} className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-border/40 bg-card/95 px-8 py-10 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-full border border-border/60">
              <div className="absolute inset-[2px] rounded-full"
                style={{ background: "linear-gradient(135deg, hsl(155,100%,48%), hsl(180,100%,50%), hsl(210,100%,55%))" }} />
              <span className="relative text-xs font-bold text-white">D</span>
            </div>
            <span className="font-semibold">Dr. PDF Pro</span>
          </div>

          <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Reset password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email and we'll send you a reset link.
          </p>

          {sent ? (
            <div className="mt-6 flex flex-col items-center gap-4 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/15">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Reset link sent to <strong className="text-foreground">{email}</strong>. Check your inbox.
              </p>
              <Link to="/login"
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input id="email" type="email" placeholder="you@example.com" className="pl-10 h-11"
                      value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                </div>

                <Button type="submit"
                  className="w-full h-11 gap-2 text-sm font-semibold"
                  style={{ background: "linear-gradient(90deg, hsl(155,100%,42%), hsl(200,100%,50%))", color: "hsl(212,55%,5%)" }}
                  disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {loading ? "Sending…" : "Send Reset Link"}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Remember it?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
