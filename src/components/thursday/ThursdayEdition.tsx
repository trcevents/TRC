// The Thursday-night page template. Every edition renders these sections in
// this order, styled only by its theme (CSS custom properties + three layout
// switches), so all designs stay structurally identical:
//
//   1. Hero      presenter, name, intro, facts, address, directions + calendar, flyer
//   2. Feature   photo + two-line heading + story   (only if the edition has one)
//   3. Takeout   the takeout offer, with the edition's photo if it has one
//   4. Story     two "what to expect" columns
//   5. Clip      the edition's animated flyer, or a picture if it has none
//   6. Holidays  upcoming holiday nights + link to all events
// A banner above the hero names the edition's Thursday and any special night.
//
// Theme variables (all required, set in the edition's theme.vars):
//   --bg --fg --muted          page background, text, secondary text
//   --line --line-strong       rules and borders
//   --accent --on-accent       accent colour and text on it (facts pill, card tops, photo rules)
//   --glow --offset            frame "glow" shadow / frame "offset" block colour
//   --surface                  card and video placeholder background
//   --label --label-font       small uppercase labels
//   --body-font --lede-font    body text / intro paragraph
//   --display-font --display-style --display-track --display-accent
//                              big uppercase headings (h1, feature, takeout); accent = second line
//   --h2-font --h2-style --h2-weight --h2-track
//                              section headings (story, clip, holidays)
//   --btn-bg --btn-fg --ghost  primary button / secondary button colour
//   --hero-bg --feature-bg --takeout-bg --story-bg --story-fg --story-muted
//                              section backgrounds and story text
import { type CSSProperties, type RefObject, useEffect } from "react";
import { googleCalendarUrl, startsLabel, venueLine } from "@/lib/thursday/calendar";
import { longDate, specialOn } from "@/lib/thursday/schedule";
import type { ThursdayEdition, ThursdayEvent } from "@/lib/thursday/types";

const CSS = `
.thx{background:var(--bg);color:var(--fg);font:1rem/1.6 var(--body-font)}
.thx h1,.thx h2,.thx h3,.thx p,.thx figure{margin:0}
.thx a{color:inherit;text-underline-offset:.25em}
.thx a:focus-visible{outline:3px solid var(--accent);outline-offset:4px}
.thx .wrap{width:min(92%,80rem);margin-inline:auto}
.thx .label{font-family:var(--label-font);font-size:.76rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--label)}
.thx .display{font-family:var(--display-font);font-style:var(--display-style);font-weight:900;letter-spacing:var(--display-track);text-transform:uppercase;line-height:.92}
.thx .display span{display:block;color:var(--display-accent)}
.thx h1.display{font-size:clamp(2.6rem,6vw,6.4rem);margin:.25em 0 .3em}
.thx h2.display{font-size:clamp(2rem,4.2vw,4rem)}
.thx .h2{font-family:var(--h2-font);font-style:var(--h2-style);font-weight:var(--h2-weight);letter-spacing:var(--h2-track);font-size:clamp(1.9rem,4vw,3.6rem);line-height:1.02}
.thx h3{font-family:var(--body-font);font-size:1.1rem;line-height:1.25}
.thx .lede{font-family:var(--lede-font);font-size:clamp(1.12rem,2vw,1.45rem);line-height:1.35;max-width:34ch}
.thx .muted{color:var(--muted)}
.thx .week{border-bottom:1px solid var(--line);background:var(--surface)}
.thx .week .wrap{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.3rem 2rem;padding-block:.8rem}
.thx .week p{max-width:70ch}
.thx .still figcaption{margin-top:1.2rem;color:var(--muted)}
.thx .still img{display:block;width:100%;height:auto}
.thx a.card{display:block;text-decoration:none}
.thx a.card:hover h3{text-decoration:underline}
.thx .hero{background:var(--hero-bg);overflow:hidden}
.thx .hero-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"copy art";align-items:center;gap:clamp(2rem,5vw,5rem);padding-block:clamp(2.2rem,6vw,5.5rem)}
.thx[data-art=left] .hero-grid{grid-template-areas:"art copy"}
.thx .hero-copy{grid-area:copy}
.thx .hero-art{grid-area:art;width:min(100%,36rem);justify-self:center}
.thx .facts{display:flex;flex-wrap:wrap;gap:.35rem 1.1rem;margin:1.3rem 0 .9rem;font-weight:800}
.thx .facts strong{color:var(--accent)}
.thx[data-facts=rule] .facts{padding:.7rem 0;border-block:1px solid var(--line);font-size:.78rem;letter-spacing:.13em;text-transform:uppercase}
.thx[data-facts=pill] .facts{padding:.45rem 1rem;background:var(--accent);color:var(--on-accent);clip-path:polygon(2% 0,100% 0,98% 100%,0 100%);text-transform:uppercase;font-size:.85rem;font-weight:900;width:fit-content;max-width:100%}
.thx[data-facts=pill] .facts strong{color:inherit}
.thx address{font-style:normal;color:var(--muted)}
.thx address strong{color:var(--fg)}
.thx .actions{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem 1rem;margin-top:1.25rem}
.thx .btn{display:inline-block;padding:.65rem 1.05rem;font-weight:800;text-decoration:none;background:var(--btn-bg);color:var(--btn-fg);border:1px solid var(--btn-bg)}
.thx .btn.ghost{background:transparent;color:var(--ghost);border-color:var(--ghost)}
.thx .btn:hover{filter:brightness(1.12)}
.thx .textlink{font-weight:700;font-size:.92rem}
.thx .framed{position:relative;isolation:isolate}
.thx .framed img,.thx .framed video{display:block;width:100%;height:auto}
.thx[data-frame=offset] .framed{margin:0 .7rem .7rem 0}
.thx[data-frame=offset] .framed::after{content:"";position:absolute;inset:.7rem -.7rem -.7rem .7rem;background:var(--offset);z-index:-1}
.thx[data-frame=glow] .framed img,.thx[data-frame=glow] .framed video{border:1px solid var(--line-strong);box-shadow:0 0 50px var(--glow)}
.thx[data-frame=glow] .hero-art::before{content:"";position:absolute;inset:-1.1rem;border:1px solid var(--line);pointer-events:none}
.thx .band{border-top:1px solid var(--line)}
.thx .feature{background:var(--feature-bg)}
.thx .takeout{background:var(--takeout-bg)}
.thx .split{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);align-items:center;gap:clamp(1.4rem,4vw,3.5rem);padding-block:clamp(2.2rem,5vw,4.5rem)}
.thx .split.solo{grid-template-columns:minmax(0,1fr)}
.thx .photo{border-bottom:4px solid var(--accent)}
.thx .photo img{display:block;width:100%;height:auto}
.thx .split-copy p{margin-top:.8rem;max-width:44ch}
.thx .hook{font-weight:800;font-size:1.2rem}
.thx .story{background:var(--story-bg);color:var(--story-fg)}
.thx .story .wrap{display:grid;grid-template-columns:1fr 1fr;gap:2rem 4rem;padding-block:clamp(2.4rem,5vw,4.5rem)}
.thx .story p{margin-top:.9rem;max-width:52ch;color:var(--story-muted)}
.thx .clip{padding-block:clamp(2.4rem,5vw,4rem)}
.thx .clip .framed,.thx .still{max-width:56rem;margin-top:1.4rem}
.thx .clip video{aspect-ratio:16/9;object-fit:cover;background:var(--surface)}
.thx .holidays{padding-block:clamp(2.4rem,5vw,4rem)}
.thx .holidays-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.5rem 2rem}
.thx .holidays-note{margin-top:.6rem}
.thx .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:1rem;margin-top:1.4rem}
.thx .card{padding:1.2rem 1.3rem;background:var(--surface);border-top:3px solid var(--accent)}
.thx .card h3{margin-top:.45rem}
.thx .card p:not(.label){margin-top:.4rem;color:var(--muted)}
@media(max-width:760px){
.thx .hero-grid,.thx[data-art=left] .hero-grid{grid-template-columns:1fr;grid-template-areas:"copy" "art"}
.thx .hero-art{width:min(92%,30rem)}
.thx .split,.thx .story .wrap{grid-template-columns:1fr}
.thx .split-copy{order:-1}
}
`;

/** The template's stylesheet. Render once per page, before any ThursdayEditionView. */
export function ThursdayStyles() {
  return <style>{CSS}</style>;
}

type Props = {
  event: ThursdayEvent;
  edition: ThursdayEdition;
  /** The Thursday this page is about (ISO date). */
  date: string;
};

export function ThursdayEditionView({ event, edition, date }: Props) {
  const id = (name: string) => `${edition.key}-${name}`;
  const { theme, flyer, feature, takeoutImage, clip, still } = edition;
  const v = event.venue;
  const holiday = event.holidays.find((h) => h.date === date);
  const special = specialOn(date);
  const holidays = event.holidays.filter((h) => h.date >= date);

  return (
    <div
      className="thx"
      style={theme.vars as CSSProperties}
      data-art={theme.heroArt}
      data-frame={theme.frame}
      data-facts={theme.facts}
    >
      <section className="week" aria-label="This edition's date">
        <div className="wrap">
          <p>
            <span className="label">
              {edition.label} edition · {longDate(date)}
            </span>
            <br />
            {holiday ? (
              <a href={holiday.href}>
                <strong>{holiday.title}</strong>, ${holiday.price}, replaces the free night this
                Thursday →
              </a>
            ) : special ? (
              <>
                <strong>{special.title}.</strong> {special.description}
              </>
            ) : (
              <>
                {event.admission}, {event.schedule.timeLabel}.
              </>
            )}
          </p>
          <a className="textlink" href={`/${event.slug}/calendar`}>
            Every Thursday&rsquo;s city →
          </a>
        </div>
      </section>

      <section className="hero" aria-labelledby={id("title")}>
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="label">{event.presenter} presents</p>
            <h1 id={id("title")} className="display">
              {event.name[0]} <span>{event.name[1]}</span>
            </h1>
            <p className="lede">{edition.intro}</p>
            <p className="facts">
              <span>Thursdays · {event.schedule.timeLabel}</span>
              <strong>{event.admission}</strong>
              <span>{startsLabel(event)}</span>
            </p>
            <address>
              <strong>{v.name}</strong>
              <br />
              {venueLine(event)}
              <br />
              <a href={`tel:${v.phone.tel}`}>{v.phone.display}</a>
            </address>
            <div className="actions">
              <a className="btn" href={v.mapsUrl} target="_blank" rel="noreferrer">
                Get directions
              </a>
              {/* No `download` attribute: served as text/calendar, so iPhones offer
                  "Add to Calendar" instead of saving the file to Files. */}
              <a className="btn ghost" href={event.icsHref}>
                Add to calendar
              </a>
              <a
                className="textlink"
                href={googleCalendarUrl(event)}
                target="_blank"
                rel="noreferrer"
              >
                Google Calendar
              </a>
            </div>
          </div>
          <figure className="hero-art framed">
            <img
              src={flyer.src}
              srcSet={flyer.srcSet}
              sizes={flyer.sizes}
              width={flyer.width}
              height={flyer.height}
              alt={flyer.alt}
              decoding="async"
              fetchPriority="high"
            />
          </figure>
        </div>
      </section>

      {feature && (
        <section className="band feature" aria-labelledby={id("feature")}>
          <div className="wrap split">
            <figure className="photo">
              <img
                loading="lazy"
                decoding="async"
                src={feature.image.src}
                srcSet={feature.image.srcSet}
                sizes={feature.image.sizes}
                width={feature.image.width}
                height={feature.image.height}
                alt={feature.image.alt}
              />
            </figure>
            <div className="split-copy">
              <h2 id={id("feature")} className="display">
                {feature.heading[0]} <span>{feature.heading[1]}</span>
              </h2>
              <p className="hook">{feature.hook}</p>
              <p className="muted">{feature.body}</p>
              <p>
                <strong>Free entry · Thursdays, {event.schedule.timeLabel}</strong>
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="band takeout" id={id("takeout")} aria-labelledby={id("takeout-title")}>
        <div className={takeoutImage ? "wrap split" : "wrap split solo"}>
          {takeoutImage && (
            <figure className="photo">
              <img
                loading="lazy"
                decoding="async"
                src={takeoutImage.src}
                srcSet={takeoutImage.srcSet}
                sizes={takeoutImage.sizes}
                width={takeoutImage.width}
                height={takeoutImage.height}
                alt={takeoutImage.alt}
              />
            </figure>
          )}
          <div className="split-copy">
            <h2 id={id("takeout-title")} className="display">
              {event.takeout.heading[0]} <span>{event.takeout.heading[1]}</span>
            </h2>
            <p className="hook">{event.takeout.offer}</p>
            <p className="muted">{event.takeout.items}</p>
            <p className="muted">{event.takeout.pickup}</p>
            <p>
              <a className="textlink" href={`tel:${v.phone.tel}`}>
                Call ahead: {v.phone.display}
              </a>
            </p>
          </div>
        </div>
      </section>

      <section className="band story" aria-label="What to expect">
        <div className="wrap">
          {edition.story.map((s) => (
            <div key={s.heading}>
              <h2 className="h2">{s.heading}</h2>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {clip ? (
        <section className="band clip" aria-labelledby={id("clip-title")}>
          <div className="wrap">
            <h2 id={id("clip-title")} className="h2">
              See the vibe.
            </h2>
            <figure className="framed">
              <video
                controls
                loop
                muted
                playsInline
                preload="none"
                width={1920}
                height={1080}
                data-thx-clip=""
                data-poster={clip.poster}
                poster={clip.poster}
                aria-label={clip.label}
              >
                <source src={clip.src} type="video/mp4" />
              </video>
            </figure>
          </div>
        </section>
      ) : still ? (
        <section className="band clip" aria-labelledby={id("clip-title")}>
          <div className="wrap">
            <h2 id={id("clip-title")} className="h2">
              See the vibe.
            </h2>
            <figure className="still">
              <img
                loading="lazy"
                decoding="async"
                src={still.image.src}
                srcSet={still.image.srcSet}
                sizes={still.image.sizes}
                width={still.image.width}
                height={still.image.height}
                alt={still.image.alt}
              />
              <figcaption>{still.caption}</figcaption>
            </figure>
          </div>
        </section>
      ) : null}

      {holidays.length > 0 && (
        <section className="band holidays" aria-labelledby={id("holidays")}>
          <div className="wrap">
            <div className="holidays-head">
              <h2 id={id("holidays")} className="h2">
                Holiday nights at {v.shortName}
              </h2>
              <a className="textlink" href={event.allEventsHref}>
                All events at {v.shortName} →
              </a>
            </div>
            {holidays.some((h) => h.replacesWeekly) && (
              <p className="muted holidays-note">
                On these Thursdays the holiday party replaces the regular free night.
              </p>
            )}
            <div className="cards">
              {holidays.map((h) => (
                <a key={h.date} className="card" href={h.href}>
                  <p className="label">
                    <time dateTime={h.date}>{h.dateLabel}</time> · ${h.price}
                  </p>
                  <h3>{h.title}</h3>
                  <p>{h.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Gives the visible edition's clip its poster (if deferred) and autoplays it,
 * muted and looping, once it nears the viewport. `root` contains exactly one
 * visible edition; `selector` narrows to it when several are on the page.
 */
export function useEditionClip(root: RefObject<HTMLElement | null>, selector: () => string) {
  useEffect(() => {
    const video = root.current?.querySelector<HTMLVideoElement>(
      `${selector()} video[data-thx-clip]`,
    );
    if (!video) return;
    if (video.dataset.poster && !video.poster) video.poster = video.dataset.poster;
    // Respect the OS "reduce motion" setting: keep the cover image, no autoplay.
    // The clip still plays from its controls.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const start = () => {
      video.preload = "auto";
      video.play().catch(() => {});
    };
    if (!("IntersectionObserver" in window)) {
      start();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(video);
    return () => io.disconnect();
    // `selector` is read once, on mount: a new edition remounts the page.
  }, [root]);
}
