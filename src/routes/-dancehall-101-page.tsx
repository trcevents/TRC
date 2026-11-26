// Shared by src/routes/dancehall-101.tsx. The "-" prefix excludes this file
// from route generation (TanStack Router convention) -- see
// src/routes/README.md.
//
// Archived: Dancehall 101 has ended. The page stays up as a record and is
// listed on /past-events. The school picker and .edu signup form were removed,
// so old ?school= links land here too.
import { ArchivedEventBanner } from "@/components/site/ArchivedEventBanner";
import {
  DH101_BG,
  DH101_FONT_LINKS,
  DH101_TEXT,
  DH101_TEXT_DIM,
  Dh101Footer,
  Dh101Topbar,
  SITE_URL,
  dh101Vars,
} from "./-dancehall-101-shared";

const DESCRIPTION =
  "Dancehall 101 was a Friday series at Irie Jerk with free entry for college students 21+. It has ended.";

export function dancehall101Head() {
  return {
    meta: [
      { title: "Dancehall 101 (Past Series) | TRC Events" },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Dancehall 101" },
      { property: "og:title", content: "Dancehall 101 (Past Series)" },
      { property: "og:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/dancehall-101/` }, ...DH101_FONT_LINKS],
  };
}

export function Dancehall101Page() {
  return (
    <div className="w-full" style={{ background: DH101_BG, color: DH101_TEXT, ...dh101Vars(null) }}>
      <ArchivedEventBanner title="Dancehall 101 has ended." detail="Signups are closed." />
      <Dh101Topbar tagline="Lessons in Dancehall Culture" />
      <main className="px-6 pt-12 pb-20 text-center">
        <h1 className="font-[Anton] text-[clamp(2rem,6vw,3.4rem)] uppercase leading-[1.05] tracking-[0.02em]">
          Dancehall <span style={{ color: "var(--school-primary)" }}>101</span>
        </h1>
        <p
          className="mx-auto mt-3.5 max-w-[560px] text-[1.05rem]"
          style={{ color: DH101_TEXT_DIM }}
        >
          A Friday series at Irie Jerk, with free entry for college students 21+ who verified their
          .edu email.
        </p>
      </main>
      <Dh101Footer />
    </div>
  );
}
