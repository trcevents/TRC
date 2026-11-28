import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { MapPin, Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

const EVENT_LINKS = [
  { to: "/lunch", label: "Lunch" },
  { to: "/blaqs/", label: "Reggae Wednesdays", staticPage: true },
  { to: "/irie-jerk-and-juggling", label: "Irie Jerk Thursdays" },
  { to: "/friday-lime", label: "Friday Lime" },
  { to: "/sing-ova-sundays/chicago", label: "Sing Ova Sundays" },
  { to: "/events", label: "Events" },
  { to: "/dinner-in-jamaica", label: "Dinner in Jamaica" },
  { to: "/past-events", label: "Past Events" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // Close the menu after moving to another page (including with Back).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src={logo}
              alt="TRC Events"
              width={40}
              height={40}
              className="size-9 object-contain"
            />
            <span className="font-display text-lg font-bold tracking-wide">
              TRC <span className="text-gold">Events</span>
            </span>
          </Link>

          {/* The links need about 1050px, so narrower screens get the menu button. */}
          <nav className="hidden items-center gap-4 xl:flex">
            {EVENT_LINKS.map((event) => {
              const style =
                "text-sm font-medium text-muted-foreground transition-colors hover:text-gold [&.active]:text-gold";
              return "staticPage" in event ? (
                <a key={event.to} href={event.to} className={style}>
                  {event.label}
                </a>
              ) : (
                <Link key={event.to} to={event.to} className={style}>
                  {event.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="gold" size="sm">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Irie+Jerk+Bar+and+Grill+1413+W+127th+St+Calumet+Park+IL+60827"
              target="_blank"
              rel="noreferrer"
              aria-label="Get Directions"
            >
              <MapPin className="size-4" />
              <span className="hidden sm:inline">Get Directions</span>
            </a>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex size-11 items-center justify-center rounded-md border border-border text-foreground hover:text-gold xl:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="site-menu"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border/60 bg-background px-4 py-2 sm:px-6 xl:hidden"
        >
          {EVENT_LINKS.map((event) => {
            const style =
              "block border-b border-border/40 py-3.5 text-base font-medium text-muted-foreground last:border-0 hover:text-gold [&.active]:text-gold";
            return "staticPage" in event ? (
              <a key={event.to} href={event.to} className={style}>
                {event.label}
              </a>
            ) : (
              <Link key={event.to} to={event.to} onClick={() => setOpen(false)} className={style}>
                {event.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
