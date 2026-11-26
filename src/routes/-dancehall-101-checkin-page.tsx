// Shared by src/routes/dancehall-101_.checkin.tsx. The "-" prefix excludes
// this file from route generation (TanStack Router convention) -- see
// src/routes/README.md. The trailing underscore opts this route out of
// nesting under dancehall-101.tsx -- see -charly-black-comp-page.tsx for why
// that matters.
//
// Archived: Dancehall 101 has ended, and door check-in is switched off in the
// database (migration 0028). The route stays so old links explain why.
import { ArchivedEventBanner } from "@/components/site/ArchivedEventBanner";
import {
  DH101_BG,
  DH101_FONT_LINKS,
  DH101_TEXT,
  DH101_TEXT_DIM,
  Dh101Topbar,
  SITE_URL,
} from "./-dancehall-101-shared";

export function dancehall101CheckinHead() {
  return {
    meta: [
      { title: "Dancehall 101 — Door Check-In" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/dancehall-101/checkin/` }, ...DH101_FONT_LINKS],
  };
}

export function Dancehall101CheckinPage() {
  return (
    <div className="w-full" style={{ background: DH101_BG, color: DH101_TEXT }}>
      <ArchivedEventBanner title="Dancehall 101 has ended." detail="Door check-in is closed." />
      <Dh101Topbar tagline="Door Check-In" />
      <p className="px-6 py-16 text-center" style={{ color: DH101_TEXT_DIM }}>
        Door check-in is closed.
      </p>
    </div>
  );
}
