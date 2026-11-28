// The two holiday parties, each on its own page, in the owner's own designs
// (Christmas Eve and Winter Ball drafts, 2026-11-25). Date, price and title for
// the page head come from irie-jerk-juggling-event.ts. No start time has been given.
import { IRIE_JERK_JUGGLING as EVENT } from "@/lib/thursday/irie-jerk-juggling-event";
import christmasSmall from "@/assets/irie-jerk-christmas-eve-flyer-560.webp";
import christmasLarge from "@/assets/irie-jerk-christmas-eve-flyer-1024.webp";
import ballSmall from "@/assets/irie-jerk-winter-ball-flyer-560.webp";
import ballLarge from "@/assets/irie-jerk-winter-ball-flyer-1024.webp";

const SITE_URL = "https://trcevent.com";

const DATES = { "christmas-eve": "2026-12-24", "winter-ball": "2026-12-31" } as const;

export type HolidayKey = keyof typeof DATES;

function facts(key: HolidayKey) {
  return { holiday: EVENT.holidays.find((h) => h.date === DATES[key])! };
}

export function irieJerkHolidayHead(key: HolidayKey) {
  const { holiday } = facts(key);
  const url = `${SITE_URL}/irie-jerk-and-juggling/${key}/`;
  const title = `${holiday.title} | ${holiday.dateLabel}`;
  const description = `${holiday.title} at ${EVENT.venue.name}, Calumet Park. ${holiday.dateLabel}, $${holiday.price} admission.`;
  const image = `${SITE_URL}/og-thursdays/${key}.jpg`;
  return {
    meta: [
      { title: `${title} | TRC Events` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

const CHRISTMASEVE_CSS = `
.xmas{color-scheme:dark;--night:#12182b;--frost:#b7c9e4;--ivory:#fff0d6;--amber:#ffc082;--rule:#768099}
.xmas *{box-sizing:border-box}
.xmas{margin:0;background:var(--night);color:var(--ivory);font:1rem/1.65 system-ui,sans-serif}
.xmas a{color:inherit;text-underline-offset:.23em}
.xmas a:focus-visible{outline:2px solid var(--amber);outline-offset:5px}
.xmas p,.xmas h1,.xmas h2,.xmas figure{margin:0}
.xmas .wrap{width:min(91%,78rem);margin:auto}
.xmas .skip{position:absolute;left:1rem;top:-6rem}
.xmas .skip:focus{top:.5rem;z-index:4;background:var(--night);padding:.35rem .7rem}
.xmas .topbar{border-bottom:1px solid #929eb75e;background:#0d1322}
.xmas nav,.xmas nav ul{display:flex;align-items:center;flex-wrap:wrap;gap:.45rem 1.2rem}
.xmas nav{justify-content:space-between;padding-block:1rem}
.xmas nav ul{list-style:none;margin:0;padding:0}
.xmas nav a{font-size:.88rem;font-weight:700;text-decoration:none}
.xmas nav a:hover,.xmas nav a[aria-current]{text-decoration:underline;color:var(--amber)}
.xmas .credit,.xmas .nav-brand,.xmas .edition,.xmas .date{font-size:.8rem;font-weight:750;letter-spacing:.135em;text-transform:uppercase}
.xmas .credit,.xmas .nav-brand{color:var(--frost)}
.xmas .window{position:relative;isolation:isolate;overflow:hidden;background:radial-gradient(ellipse at 66% 76%,#663719 0%,transparent 56%),linear-gradient(115deg,#12182b,#1d2b43 48%,#161a2c)}
.xmas .window::after{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:repeating-linear-gradient(126deg,transparent 0 19px,#d5e5fc09 20px,transparent 21px 48px)}
.xmas .entry{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);align-items:center;gap:clamp(2rem,6vw,6rem);padding-block:clamp(2.4rem,6vw,5.5rem)}
.xmas .wordmark{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto 1fr 1fr;align-items:center;width:max-content;max-width:100%;font:700 clamp(2rem,5.15vw,5.4rem)/.83 Georgia,serif;letter-spacing:-.072em;margin:1rem 0 1.3rem}
.xmas .small{grid-column:1 / -1;font:italic 750 .78rem/1.1 system-ui,sans-serif;letter-spacing:.34em;color:var(--frost);opacity:.78;margin:0 0 .6rem 1rem}
.xmas .shared{grid-row:2 / 4;font-size:2.18em;line-height:.76;align-self:center;margin-right:.06em}
.xmas .wordmark span:not(.small):not(.shared){white-space:nowrap}
.xmas .edition{color:var(--amber)}
.xmas h1{font:500 clamp(2rem,4.7vw,4.9rem)/1.03 Georgia,serif;letter-spacing:-.045em;margin:.35rem 0 .7rem}
.xmas .intro{max-width:38ch;font-size:1.08rem;color:#e5eaf6}
.xmas .details{border-block:1px solid var(--rule);margin:1.25rem 0 1rem;padding:.7rem 0;display:flex;align-items:center;flex-wrap:wrap;gap:.25rem 1rem}
.xmas .details strong{color:var(--amber)}
.xmas address{font-style:normal;color:#e5eaf6}
.xmas .directions{display:inline-block;margin-top:1.05rem;padding:.6rem .95rem;background:var(--amber);color:#26160c;text-decoration:none;font-weight:850}
.xmas .art{position:relative;padding:.5rem;border:1px solid #9fb0c7;border-radius:48% 48% 1px 1px / 7% 7% 1px 1px;box-shadow:0 0 0 .3rem #d5e2f510,0 1rem 4rem #090d1f78;background:#0d1322}
.xmas .art img{width:100%;height:auto;display:block;border-radius:inherit}
.xmas .inside{background:#251b1a;border-top:1px solid #94684f}
.xmas .inside .wrap{display:grid;grid-template-columns:1fr 1fr;gap:2rem 4rem;padding-block:clamp(2.4rem,6vw,5rem)}
.xmas h2{font:italic 500 clamp(1.9rem,4vw,3.8rem)/1 Georgia,serif;letter-spacing:-.045em}
.xmas .inside p,.xmas .next p{margin-top:.85rem;max-width:51ch;color:#f0dfd2}
.xmas .next{padding-block:2.5rem}
.xmas .next a{display:inline-block;margin-top:.8rem;color:var(--amber);font-weight:750}
.xmas .credit-line{border-top:1px solid var(--rule);padding:1rem 0;color:var(--frost)}
@media(max-width:750px){.xmas .entry,.xmas .inside .wrap{grid-template-columns:1fr}
.xmas .wordmark{font-size:clamp(1.8rem,9vw,4rem)}
.xmas .art{max-width:37rem;margin:auto}
.xmas .entry{gap:1.65rem}
}
@media(max-width:360px){.xmas .wordmark{font-size:8.1vw}
}
.xmas ul{list-style-position:outside}
.xmas .steps ul{list-style:disc}
/* Sit the flyer below the arch so its top line isn't cut off. */
.xmas .art{padding-top:7.5%}
.xmas .art img{border-radius:0}
`;

function ChristmasEve() {
  return (
    <div className="xmas">
      <style>{CHRISTMASEVE_CSS}</style>
<div className="topbar"><nav className="wrap" aria-label="Event navigation"><a className="nav-brand" href="/">TRC Events</a><ul>
<li><a href="/irie-jerk-and-juggling/tokyo">Tokyo</a></li>
<li><a href="/irie-jerk-and-juggling/copenhagen">Copenhagen</a></li>
<li><a href="/irie-jerk-and-juggling/seoul">Seoul</a></li>
<li><a href="#main" aria-current="page">Christmas Eve</a></li><li><a href="#nye">New Year’s Eve</a></li></ul></nav></div>
<div id="main">
<section className="window" aria-labelledby="title"><div className="wrap entry">
<div><p className="credit">Prestige Promotion presents</p>
<div className="wordmark" role="img" aria-label="Irie Jerk and Juggling"><span className="small" aria-hidden="true">IRIE</span><span className="shared" aria-hidden="true">J</span><span aria-hidden="true">ERK &</span><span aria-hidden="true">UGGLING</span></div>
<p className="edition">Dancehall & Jamaican cooking</p>
<h1 id="title">Christmas Eve</h1>
<p className="intro">Step in from the cold on 127th Street. There’s a plate coming out of the Jamaican kitchen, and the DJ is already playing something you know.</p>
<div className="details"><time className="date" dateTime="2026-12-24">Thursday, December 24, 2026</time><strong>$20 admission</strong></div>
<address><strong>Irie Jerk Bar and Grill</strong><br />1413 W 127th St, Calumet Park, IL 60827</address>
<a className="directions" href="https://www.google.com/maps/search/?api=1&query=1413+W+127th+St%2C+Calumet+Park%2C+IL+60827" target="_blank" rel="noreferrer">Get directions</a>
</div>
<figure className="art"><img
  src={christmasLarge}
  srcSet={`${christmasSmall} 560w, ${christmasLarge} 1024w`}
  sizes="(min-width: 760px) 560px, 91vw"
  width={1024}
  height={1280}
  alt="Christmas Eve flyer showing dancers and friends in amber light through a sweep of clear glass in a frost-covered window."
  fetchPriority="high"
/></figure>
</div></section>
<section className="inside" aria-label="What to expect"><div className="wrap">
<div><h2>Come in hungry.</h2><p>Start at the table with food from Irie Jerk’s state-of-the-art Jamaican kitchen. Catch up with your people over a plate while the DJ takes the room from one familiar riddim to the next.</p></div>
<div><h2>Sing it back.</h2><p>Christmas Eve is an evening dance party with dancehall up front. When the DJ turns down a tune you know and calls for voices, the room finishes the hook. That’s the sound of this Thursday on 127th Street.</p></div>
</div></section>
<section className="wrap next" id="nye" aria-labelledby="next"><p className="edition">Thursday, December 31, 2026 · $40 admission</p><h2 id="next">GQ Meets VOGUE Winter Ball</h2><p>Formalwear, red-carpet photography, and a Best Dressed runway at Irie Jerk. Ring in 2027.</p><a href="/irie-jerk-and-juggling/winter-ball">View the Winter Ball flyer</a></section>
</div>
<div className="credit-line"><div className="wrap">Presented by Prestige Promotion · <a href="/">TRC Events</a></div></div>
    </div>
  );
}

const WINTERBALL_CSS = `
.ball{color-scheme:dark;--ink:#120b0e;--wine:#30101a;--ivory:#fff2dc;--gold:#ecc58c;--muted:#ddc8bc;--line:#9c7154}
.ball *{box-sizing:border-box}
.ball{margin:0;background:var(--ink);color:var(--ivory);font:1rem/1.6 system-ui,sans-serif}
.ball h1,.ball h2,.ball h3,.ball p,.ball figure{margin:0}
.ball a{color:inherit;text-underline-offset:.3em}
.ball a:focus-visible{outline:2px solid var(--gold);outline-offset:4px}
.ball .wrap{width:min(91%,79rem);margin:auto}
.ball .skip{position:absolute;top:-7rem}
.ball .skip:focus{top:0;background:var(--ink);z-index:2}
.ball .caps{font-size:.75rem;letter-spacing:.15em;text-transform:uppercase;font-weight:750;color:var(--gold)}
.ball .topbar{border-bottom:1px solid var(--line);background:#12090d}
.ball nav,.ball nav ul{display:flex;align-items:center;flex-wrap:wrap;gap:.5rem 1.3rem}
.ball nav{justify-content:space-between;padding-block:.9rem}
.ball nav ul{list-style:none;padding:0;margin:0}
.ball nav a{font-size:.88rem;text-decoration:none}
.ball nav a:hover,.ball nav [aria-current]{text-decoration:underline;color:var(--gold)}
.ball .hero{background:radial-gradient(ellipse at 18% 72%,#551d28,transparent 55%),linear-gradient(125deg,#231016 15%,#120b0e 55%)}
.ball .spread{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,.88fr);gap:clamp(2rem,6vw,6rem);align-items:center;padding-block:clamp(2.5rem,6vw,5.5rem)}
.ball .lead{padding-block:1rem;border-block:1px solid var(--line)}
.ball h1{font:500 clamp(2.7rem,6.9vw,7rem)/.87 Georgia,serif;letter-spacing:-.07em;text-transform:uppercase;margin:.23em 0 .27em}
.ball h1 span{display:block;color:var(--gold);font-style:italic;font-size:.71em;letter-spacing:-.035em;margin-top:.22em}
.ball .dek{font:clamp(1.13rem,2.2vw,1.6rem)/1.3 Georgia,serif;max-width:31ch}
.ball .ticket{display:flex;align-items:center;gap:.8rem 1.2rem;flex-wrap:wrap;margin:1.4rem 0 .95rem}
.ball .ticket time{font-weight:700}
.ball .ticket strong{display:inline-block;background:var(--gold);color:#1d0e0e;padding:.2rem .65rem}
.ball address{font-style:normal;color:var(--muted)}
.ball .actions{display:flex;gap:.65rem 1rem;flex-wrap:wrap;margin-top:1rem}
.ball .actions a{display:inline-block;padding:.55rem .8rem;border:1px solid var(--line);text-decoration:none;font-weight:700}
.ball .actions a:hover{background:var(--gold);color:var(--ink)}
.ball .poster{border:1px solid var(--line);padding:.45rem;background:#221417;box-shadow:0 1.3rem 3.5rem #060205a8}
.ball .poster img{display:block;width:100%;height:auto}
.ball .program{background:#f5e6d0;color:#311821;padding-block:clamp(2.4rem,6vw,5rem)}
.ball h2{font:italic 500 clamp(2rem,4.6vw,4rem)/1 Georgia,serif;letter-spacing:-.055em}
.ball .steps{margin-top:1.6rem;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:3.5rem}
.ball .steps article{border-top:1px solid #9e735e;padding:1.15rem 0}
.ball .steps h3{font:700 clamp(1.22rem,2vw,1.6rem)/1.18 Georgia,serif;margin-bottom:.4rem}
.ball .steps p{max-width:58ch}
.ball .steps ul{margin:.45rem 0 0;padding-left:1.2rem}
.ball .dress{padding-block:clamp(2rem,5vw,3.8rem);display:grid;grid-template-columns:1fr 1fr;gap:.8rem 2rem;align-items:center}
.ball .dress p{max-width:45ch;color:var(--muted)}
.ball .credit-line{border-top:1px solid var(--line);padding:1rem 0;color:var(--muted)}
@media(max-width:740px){.ball .spread,.ball .steps,.ball .dress{grid-template-columns:1fr}
.ball .poster{width:min(100%,31rem);margin:auto}
.ball h1{font-size:clamp(2.6rem,10vw,4.7rem)}
}
.ball ul{list-style-position:outside}
.ball .steps ul{list-style:disc}
`;

function WinterBall() {
  return (
    <div className="ball">
      <style>{WINTERBALL_CSS}</style>
<div className="topbar"><nav className="wrap" aria-label="Event navigation"><a className="caps" href="/">TRC Events</a><ul>
<li><a href="/irie-jerk-and-juggling/tokyo">Tokyo</a></li>
<li><a href="/irie-jerk-and-juggling/copenhagen">Copenhagen</a></li>
<li><a href="/irie-jerk-and-juggling/seoul">Seoul</a></li>
<li><a href="/irie-jerk-and-juggling/christmas-eve">Christmas Eve</a></li>
<li><a href="#main" aria-current="page">New Year’s Eve</a></li></ul></nav></div>
<div id="main">
<section className="hero" aria-labelledby="title"><div className="wrap spread">
<div className="lead"><p className="caps">Prestige Promotion presents · Irie Jerk & Juggling</p>
<h1 id="title">GQ Meets VOGUE <span>Winter Ball</span></h1>
<p className="dek">A red-carpet New Year’s Eve on 127th Street. Dress for the cameras. Stay for the runway and dance into 2027.</p>
<div className="ticket"><time dateTime="2026-12-31">Thursday, December 31, 2026</time><strong>$40 admission</strong></div>
<address><strong>Irie Jerk Bar and Grill</strong><br />1413 W 127th St, Calumet Park, IL 60827</address>
<div className="actions"><a href="#evening">Explore the evening</a><a href="https://www.google.com/maps/search/?api=1&query=Irie+Jerk+Bar+and+Grill+1413+W+127th+St+Calumet+Park+IL+60827" target="_blank" rel="noreferrer">Get directions</a></div>
</div>
<figure className="poster"><img
  src={ballLarge}
  srcSet={`${ballSmall} 560w, ${ballLarge} 1024w`}
  sizes="(min-width: 760px) 560px, 91vw"
  width={1024}
  height={1536}
  alt="GQ Meets VOGUE Winter Ball flyer featuring a couple in formalwear on the red carpet beside a vintage calendar dated Thursday, December 31, 2026."
  fetchPriority="high"
/></figure>
</div></section>
<section className="program" id="evening" aria-labelledby="programme"><div className="wrap"><h2 id="programme">The evening</h2><div className="steps">
<article><h3>The red carpet</h3><p>Make your entrance under sculptural lighting and stop for professional step-and-repeat photography.</p></article>
<article><h3>Dinner with strings</h3><p>A string quartet reworks classic reggae and Afrobeats during dinner at Irie Jerk, with Jamaican cooking from the house kitchen.</p></article>
<article><h3>Best Dressed runway</h3><p>Midway through the evening, local designers and fashion influencers judge two categories.</p><ul><li>Most Fashion Forward Male</li><li>Most Elegant Female</li></ul></article>
<article><h3>Ring in 2027</h3><p>After midnight, the floor opens into a full party. Catch a familiar dancehall hook and sing it back when the DJ turns it down.</p></article>
</div></div></section>
<section className="wrap dress" aria-labelledby="dress"><h2 id="dress">Strict formal attire</h2><p>Sharply tailored suits and avant-garde gowns. Choose a look you’d want photographed from the moment you step onto the carpet.</p></section>
</div><div className="credit-line"><div className="wrap">Presented by Prestige Promotion · <a href="/">TRC Events</a></div></div>
    </div>
  );
}

export function IrieJerkHolidayPage({ night }: { night: HolidayKey }) {
  return night === "christmas-eve" ? <ChristmasEve /> : <WinterBall />;
}
