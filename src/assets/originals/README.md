# Irie Jerk & Juggling originals

Byte-for-byte copies of the supplied artwork. They are kept here for reference and
are **not** published: Vite only ships files the code imports, and the pages import the
WebP web copies in `src/assets/` instead.

| Original | Supplied file | Web copies |
|---|---|---|
| `irie-jerk-juggling-tokyo-flyer.png` | `Every Thursday_ Free 5P–9P-1.png` | `-560.webp`, `-1122.webp` |
| `irie-jerk-juggling-copenhagen-flyer.png` | `Thursday Free 5P–9P poster-4.png` | `-560.webp`, `-1122.webp` |
| `irie-jerk-juggling-flyer.png` (Seoul) | `Free Thursday evening event poster-3.png` | `-560.webp`, `-1122.webp` |
| `irie-jerk-juggling-chorus.png` (Tokyo) | `Chrome Tonearm Dancehall Chorus.png` | `-724.webp`, `-1448.webp` |
| `irie-jerk-juggling-table.png` (Copenhagen) | photo embedded in the Copenhagen HTML | `-724.webp`, `-1448.webp` |
| `irie-jerk-juggling-takeout.png` (Seoul) | supplied takeout photo | `-724.webp`, `-1448.webp` |

Video cover images (`irie-jerk-juggling-*-clip-poster.webp`) are the first frame of each
clip at 1280px wide. The clips (`.mp4`) are the supplied files, untouched.

## Regenerating (ffmpeg)

Flyers (1122×1402): a 560px copy and a full-width copy.

    ffmpeg -i originals/NAME.png -vf scale=560:-2:flags=lanczos -c:v libwebp -quality 80 NAME-560.webp
    ffmpeg -i originals/NAME.png -c:v libwebp -quality 80 NAME-1122.webp

Photos (1448×1086): use 724 and 1448 instead. Video cover image:

    ffmpeg -i NAME-clip.mp4 -frames:v 1 -vf scale=1280:-2:flags=lanczos -c:v libwebp -quality 80 NAME-clip-poster.webp

For a new Thursday edition, follow the same pattern (and see
src/components/thursday/README.md): original in `originals/`, two WebP widths in
`src/assets/`, and a clip cover image.
