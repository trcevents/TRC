import { Link, useRouterState } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import logo from "@/assets/logo.png";
import { TikTokIcon, PinterestIcon } from "@/components/site/BrandIcons";
import { SOCIAL_LINKS } from "@/lib/social";
import { venueLine } from "@/lib/thursday/calendar";
import { IRIE_JERK_JUGGLING } from "@/lib/thursday/irie-jerk-juggling-event";

const SOCIALS = [
  { Icon: Instagram, href: SOCIAL_LINKS.instagram, label: "Instagram" },
  { Icon: Facebook, href: SOCIAL_LINKS.facebook, label: "Facebook" },
  { Icon: Twitter, href: SOCIAL_LINKS.twitter, label: "X (Twitter)" },
  { Icon: TikTokIcon, href: SOCIAL_LINKS.tiktok, label: "TikTok" },
  { Icon: Youtube, href: SOCIAL_LINKS.youtube, label: "YouTube" },
  { Icon: PinterestIcon, href: SOCIAL_LINKS.pinterest, label: "Pinterest" },
  { Icon: Linkedin, href: SOCIAL_LINKS.linkedin, label: "LinkedIn" },
];

// Archives never change: the venue address block stays off these pages and
// their sub-pages. Add a path here when an event is archived.
const ARCHIVED_PATHS = [
  "/past-events",
  "/chicago-vybez",
  "/work-fi-di-beach",
  "/charly-black",
  "/st-catherine-linkup",
  "/jamaicaday",
  "/jamaica64",
  "/dancehall-fridays",
  "/dancehall-101",
];

export function Footer() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const archived = ARCHIVED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img
                src={logo}
                alt="TRC Events"
                width={44}
                height={44}
                className="size-10 object-contain"
              />
              <span className="font-display text-xl font-bold tracking-wide">
                TRC <span className="text-gold">Events</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              The Right Connection. The Reggae Connection. Chicago's home for reggae DJs, promoters,
              venues, and the community that keeps the sound alive.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="eyebrow mb-4">Events</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-gold">
                  Irie Jerk &amp; Juggling — Free Thursdays
                </Link>
              </li>
              {!archived && (
                <li>
                  <Link to="/lunch" className="hover:text-gold">
                    Lunch, 7 Days a Week
                  </Link>
                </li>
              )}
              {!archived && (
                <li>
                  <Link to="/friday-lime" className="hover:text-gold">
                    The Ultimate Friday Lime
                  </Link>
                </li>
              )}
              {!archived && (
                <li>
                  <address className="not-italic">
                    {IRIE_JERK_JUGGLING.venue.name}
                    <br />
                    {venueLine(IRIE_JERK_JUGGLING)}
                    <br />
                    <a href={`tel:${IRIE_JERK_JUGGLING.venue.phone.tel}`} className="hover:text-gold">
                      {IRIE_JERK_JUGGLING.venue.phone.display}
                    </a>
                  </address>
                </li>
              )}
              <li>
                <a href={IRIE_JERK_JUGGLING.venue.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-gold">
                  Get Directions
                </a>
              </li>
              <li>
                <Link to="/past-events" className="hover:text-gold">
                  Past Events
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="eyebrow mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-gold">
                  About TRC
                </Link>
              </li>
              <li>
                <a href={`mailto:${SOCIAL_LINKS.email}`} className="hover:text-gold">
                  Contact
                </a>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-gold">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gold">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} TRC Events. Built for Chicago's sound.</p>
          <p className="italic">The Right Connection. The Reggae Connection.</p>
        </div>
      </div>
    </footer>
  );
}
