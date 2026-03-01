
import React from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Card } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Linkedin, Instagram, Sparkles, Target, Users } from "lucide-react";

const principles = [
  {
    title: "Clarity first",
    text: "Every screen is designed to reduce friction so tasks are completed with less effort.",
    icon: Sparkles,
  },
  {
    title: "Practical workflows",
    text: "Tools focus on real document actions users perform daily: edit, merge, extract, protect, and more.",
    icon: Target,
  },
  {
    title: "Built for users",
    text: "Fast interactions, consistent UI, and clear outcomes help people stay productive.",
    icon: Users,
  },
];

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/VISHWAKARMAO1",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ankit-vishwakarma",
    icon: Linkedin,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: Instagram,
  },
];

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      <TopNav />
      <main className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-8 text-center md:p-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-sky-500/15" />
          <h1 className="relative text-5xl font-extrabold tracking-tight md:text-7xl">
            About Dr. PDF Pro
          </h1>
          <p className="relative mt-6 text-lg text-muted-foreground md:text-xl">
            Dr. PDF Pro is a modern PDF toolkit focused on speed, simplicity, and dependable document workflows.
          </p>
        </div>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="rounded-2xl border-border/70 bg-card/80 p-6">
                <Icon className="h-5 w-5 text-primary" />
                <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </Card>
            );
          })}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3 rounded-2xl border-border/70 bg-card/80 p-7">
            <h2 className="text-2xl font-bold tracking-tight">Our Mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              We build focused PDF tools that remove complexity from document work. Instead of juggling multiple apps,
              users can complete core tasks in one clear interface.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              The product direction stays practical: fewer distractions, stronger outcomes, and faster results.
            </p>
          </Card>

          <Card className="lg:col-span-2 rounded-2xl border-border/70 bg-card/80 p-7">
            <h3 className="text-lg font-semibold">Built by</h3>
            <p className="mt-2 text-2xl font-bold brand-gradient-text brand-gradient-animate">Ankit Vishwakarma</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Product-focused development with emphasis on usable UX and reliable PDF operations.
            </p>
            <Button asChild className="mt-6 w-full gap-2 bg-gradient-to-r from-primary to-sky-500 text-primary-foreground">
              <NavLink to="/contact" activeClassName="">
                Contact
                <ArrowRight className="h-4 w-4" />
              </NavLink>
            </Button>
          </Card>
        </section>

        <section className="mt-10">
          <Card className="rounded-2xl border-border/70 bg-card/80 p-7 md:p-10">
            <h2 className="text-2xl font-bold tracking-tight">What you get</h2>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
              <p>• One place for all key PDF actions</p>
              <p>• Consistent interaction patterns across tools</p>
              <p>• Fast, browser-based workflows</p>
              <p>• Clear export and file management outcomes</p>
            </div>
          </Card>
        </section>

        <section className="mt-10">
          <Card className="rounded-2xl border-border/70 bg-card/80 p-7 md:p-10">
            <h2 className="text-2xl font-bold tracking-tight">Social</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Follow updates, projects, and product progress.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default About;
