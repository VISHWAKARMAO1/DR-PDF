import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { ArrowLeft, Home, Wrench } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopNav />

      <main className="flex flex-1 items-center justify-center px-4 pt-24 pb-16">
        <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-10 text-center">
          {/* Background gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />

          {/* 404 display */}
          <div className="relative">
            <p className="text-[7rem] font-extrabold leading-none tracking-tighter brand-gradient-text brand-gradient-animate select-none">
              404
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Page not found</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              The route{" "}
              <code className="rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5 text-xs font-mono">
                {location.pathname}
              </code>{" "}
              doesn't exist. It may have been moved or was never here.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="gap-2 w-full sm:w-auto"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button
                asChild
                className="gap-2 w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 text-primary-foreground"
              >
                <NavLink to="/" activeClassName="">
                  <Home className="h-4 w-4" />
                  Home
                </NavLink>
              </Button>
              <Button asChild variant="secondary" className="gap-2 w-full sm:w-auto">
                <NavLink to="/tools" activeClassName="">
                  <Wrench className="h-4 w-4" />
                  Tools
                </NavLink>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
