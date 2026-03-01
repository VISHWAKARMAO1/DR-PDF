import { useEffect, useRef } from "react";
import { NavLink } from "@/components/NavLink";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { gsap } from "gsap";
import { ArrowRight, ShieldCheck, WandSparkles } from "lucide-react";

const imageFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%237c3aed'/%3E%3Cstop offset='100%25' stop-color='%230ea5e9'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' fill='white' font-size='54' font-family='Arial, Helvetica, sans-serif' text-anchor='middle' dominant-baseline='middle'%3EDr PDF Pro%3C/text%3E%3C/svg%3E";

const Index = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const gradientRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (gradientRef.current) {
        gsap.to(gradientRef.current, {
          backgroundPosition: "200% 50%",
          duration: 16,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });
      }

      gsap.from(".home-reveal", {
        y: 32,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power2.out",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav variant="home" />

      <main>
        <section ref={heroRef} className="relative overflow-hidden pt-6">
          <div
            ref={gradientRef}
            className="pointer-events-none absolute inset-0 opacity-75"
            style={{
              backgroundImage:
                "linear-gradient(120deg, hsla(259, 95%, 65%, 0.28), hsla(215, 90%, 60%, 0.24), hsla(190, 90%, 55%, 0.2), hsla(259, 95%, 65%, 0.28))",
              backgroundSize: "200% 200%",
              backgroundPosition: "0% 50%",
            }}
          />

          <div className="container relative mx-auto max-w-6xl px-4 py-24 md:py-32">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="home-reveal text-balance text-5xl font-extrabold tracking-tight md:text-7xl">
                Make documents look
                <span className="brand-gradient-text brand-gradient-animate"> pro</span>
                <br />
                without desktop software
              </h1>

              <p className="home-reveal mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
                Edit, merge, secure, extract, and optimize PDFs in seconds using a focused tool suite built for speed and clarity.
              </p>

              <div className="home-reveal mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="gap-2 px-8 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground shadow-lg hover:shadow-xl transition-shadow">
                  <NavLink to="/tools" activeClassName="">
                    Open All Tools
                    <ArrowRight className="h-4 w-4" />
                  </NavLink>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8">
                  <NavLink to="/about" activeClassName="">Learn More</NavLink>
                </Button>
              </div>

              <div className="home-reveal mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: "Tool Suite", value: "13+" },
                  { label: "Browser-Only", value: "100%" },
                  { label: "Workflow Time", value: "Faster" },
                ].map((item) => (
                  <Card key={item.label} className="rounded-2xl border-border/70 bg-card/70 p-4 text-left">
                    <p className="text-2xl font-bold brand-gradient-text brand-gradient-animate">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-8">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
                  alt: "Team document workflow",
                },
                {
                  src: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80",
                  alt: "Document editing workspace",
                },
                {
                  src: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1200",
                  alt: "Productivity dashboard",
                },
              ].map((image) => (
                <Card key={image.src} className="home-reveal overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-0">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="h-56 w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = imageFallback;
                    }}
                  />
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="home-reveal rounded-2xl border border-border/60 bg-card/85 p-6">
                <WandSparkles className="h-5 w-5 text-primary" />
                <h2 className="mt-4 text-lg font-semibold">Simple by design</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Focused UI that keeps only what you need for everyday PDF workflows.
                </p>
              </Card>

              <Card className="home-reveal rounded-2xl border border-border/60 bg-card/85 p-6">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="mt-4 text-lg font-semibold">Secure workflow</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Protection, unlock, and controlled exports in one trusted workspace.
                </p>
              </Card>

              <Card className="home-reveal rounded-2xl border border-border/60 bg-card/85 p-6">
                <ArrowRight className="h-5 w-5 text-primary" />
                <h2 className="mt-4 text-lg font-semibold">Ready in seconds</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Upload a file, apply changes, and download your updated PDF quickly.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="container mx-auto max-w-6xl px-4">
            <Card className="home-reveal relative overflow-hidden rounded-3xl border border-border/70 bg-card/85 px-6 py-10 md:px-10">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-purple-500/15" />
              <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight md:text-3xl">Start your next PDF task now</h3>
                  <p className="mt-2 text-sm text-muted-foreground md:text-base">
                    Open the full toolset and choose the exact workflow you need.
                  </p>
                </div>
                <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground">
                  <NavLink to="/tools" activeClassName="">
                    Launch Tools
                    <ArrowRight className="h-4 w-4" />
                  </NavLink>
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <footer className="border-t border-border/60 bg-background/95">
          <div className="container mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-12">
            <Card className="md:col-span-6 rounded-2xl border-border/70 bg-card/75 p-6">
              <h3 className="text-xl font-bold brand-gradient-text brand-gradient-animate">Dr PDF Pro</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Professional PDF workspace for editing, organizing, securing, and exporting files with a clean web-first workflow.
              </p>
              <Button asChild className="mt-5 gap-2 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground">
                <NavLink to="/tools" activeClassName="">
                  Open Tools
                  <ArrowRight className="h-4 w-4" />
                </NavLink>
              </Button>
            </Card>

            <div className="md:col-span-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Navigation</h4>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <NavLink to="/" className="hover:text-foreground transition-colors" activeClassName="text-foreground">Home</NavLink>
                <NavLink to="/tools" className="hover:text-foreground transition-colors" activeClassName="text-foreground">Tools</NavLink>
                <NavLink to="/about" className="hover:text-foreground transition-colors" activeClassName="text-foreground">About</NavLink>
                <NavLink to="/contact" className="hover:text-foreground transition-colors" activeClassName="text-foreground">Contact</NavLink>
              </div>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Built By</h4>
              <p className="mt-3 text-base font-medium">Ankit Vishwakarma</p>
              <p className="mt-1 text-sm text-muted-foreground">Built With Love And Lots Of Coffee ☕</p>
            </div>
          </div>

          <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ankit Vishwakarma. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
