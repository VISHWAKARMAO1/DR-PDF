import React from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Globe, Clock3 } from "lucide-react";

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      <TopNav />
      <main className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-8 text-center md:p-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-purple-500/15" />
          <h1 className="relative text-5xl font-extrabold tracking-tight md:text-7xl">Contact</h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Have questions, feedback, or partnership inquiries? Reach out anytime.
          </p>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2 rounded-2xl border-border/70 bg-card/80 p-6 md:p-7">
            <h2 className="text-xl font-semibold">Contact details</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/70 p-3">
                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">support@drpdfpro.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/70 p-3">
                <Globe className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Website</p>
                  <p className="text-muted-foreground">drpdfpro.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/70 p-3">
                <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Response time</p>
                  <p className="text-muted-foreground">Within 24–48 hours</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-3 rounded-2xl border-border/70 bg-card/80 p-6 md:p-7">
            <h2 className="text-xl font-semibold">Send a message</h2>
            <form className="mt-5 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Write your message..." className="min-h-36" />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 text-primary-foreground">
                Send message
              </Button>
            </form>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Contact;
