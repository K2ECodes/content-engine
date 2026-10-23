# SFX kit: sources and licences

All files: trimmed of silence, 48 kHz stereo 16-bit WAV, peak-normalised to -3 dBFS, short fades
(build script logic: atrim, silenceremove at -60 dB, afade, volume, alimiter). Every licence below allows
commercial use with no attribution required. Built 2026-10-23.

Licences:
- **CC0 1.0** (public domain dedication): https://creativecommons.org/publicdomain/zero/1.0/
- **Kenney** packs are CC0 (License.txt in each zip): https://kenney.nl
- **Pixabay Content License** (commercial use, no attribution): https://pixabay.com/service/license-summary/ .
  These came from the HyperFrames media-use skill's bundled library
  (~/.claude/skills/media-use/audio/assets/sfx, its CREDITS.md states Pixabay origin; per-file Pixabay page URLs are not recorded there).

| File | Source | Licence |
|---|---|---|
| whoosh-subtle-1.wav | Pixabay via media-use bundle `whoosh.mp3` | Pixabay Content License |
| whoosh-subtle-2.wav | "Whoosh #1" by Kinoton, https://freesound.org/people/Kinoton/sounds/427823/ | CC0 |
| whoosh-subtle-3.wav | "Whoosh2.wav" by huw2k8, https://freesound.org/people/huw2k8/sounds/459940/ (first 1.0 s) | CC0 |
| whoosh-big-1.wav | "Sound Design Elements Whoosh SFX 017" by AudioPapkin, https://freesound.org/people/AudioPapkin/sounds/812652/ | CC0 |
| whoosh-big-2.wav | Pixabay via media-use bundle `whoosh-cinematic.mp3` (2.4 s to 4.6 s) | Pixabay Content License |
| riser-1.wav | "Short Resonant Riser" by D_Yonqui, https://freesound.org/people/D_Yonqui/sounds/863826/ | CC0 |
| riser-2.wav | "Cinematic Riser #3 subtle" by BeaconStudio, https://freesound.org/people/BeaconStudio/sounds/859482/ (1.6 s to 2.85 s) | CC0 |
| ding-1.wav | "ding.wav" by Daphne_in_Wonderland, https://freesound.org/people/Daphne_in_Wonderland/sounds/127149/ | CC0 |
| ding-2.wav | "bell ding 1.wav" by 5ro4, https://freesound.org/people/5ro4/sounds/611113/ (first 1.6 s) | CC0 |
| chime-1.wav | Pixabay via media-use bundle `sparkle.mp3` | Pixabay Content License |
| chime-2.wav | Pixabay via media-use bundle `chime.mp3` | Pixabay Content License |
| pop-1.wav | "The Best Bubble Pop Sound For Game and UI" by el_boss, https://freesound.org/people/el_boss/sounds/669918/ | CC0 |
| pop-2.wav | "Bubble Pop" by Mafon2, https://freesound.org/people/Mafon2/sounds/253956/ | CC0 |
| pop-3.wav | "BubblePopping" by Sess8it, https://freesound.org/people/Sess8it/sounds/762781/ | CC0 |
| tap-1.wav | Kenney Interface Sounds `click_002.ogg`, https://kenney.nl/assets/interface-sounds | CC0 |
| tap-2.wav | Kenney Interface Sounds `click_003.ogg`, https://kenney.nl/assets/interface-sounds | CC0 |
| tap-3.wav | Kenney Interface Sounds `click_004.ogg`, https://kenney.nl/assets/interface-sounds | CC0 |
| shutter-1.wav | "Camera shutter (Pentax K20D)" by tnk, https://freesound.org/people/tnk/sounds/538142/ | CC0 |
| impact-soft-1.wav | "soft_impact3" by peoplearehappy, https://freesound.org/people/peoplearehappy/sounds/841274/ | CC0 |
| impact-soft-2.wav | Kenney Impact Sounds `impactSoft_heavy_000.ogg`, https://kenney.nl/assets/impact-sounds | CC0 |
| impact-big-1.wav | "Sound Design Elements Impact SFX PS 016" by AudioPapkin, https://freesound.org/people/AudioPapkin/sounds/754564/ | CC0 |
| boing-1.wav | "Boing 2" by magnuswaker, https://freesound.org/people/magnuswaker/sounds/540790/ | CC0 |
| keyboard-1.wav | Pixabay via media-use bundle `key-press.mp3` | Pixabay Content License |
| counter-tick-1.wav | Kenney Interface Sounds `tick_001.ogg`, https://kenney.nl/assets/interface-sounds | CC0 |
| success-1.wav | "Success notification" by _lucy, https://freesound.org/people/_lucy/sounds/780010/ | CC0 |
| notify-1.wav | "Message Notification 4" by AnthonyRox, https://freesound.org/people/AnthonyRox/sounds/740423/ | CC0 |

Freesound files were taken from the public HQ previews (128 kbps MP3) linked on each sound page; each page
was checked on 2026-10-23 and shows the CC0 licence.

## How the renderer uses them
`scripts/render.mjs` plays `<kit>-<n>.wav` for a cue kind when kit files exist, rotating variants by cue index:
whoosh→whoosh-subtle, pop→pop, tick/click→tap, thud→impact-soft, blast→impact-big, shutter→shutter,
key→keyboard, roll→counter-tick; whoosh-big, riser, ding, chime, success, notify, boing map to themselves.
Kinds without kit files (print, scratch, snore, the arena 8-bit cues) keep their synths. `SFX_KIT=0` forces synths.
To add a variant, drop `<kit>-<next n>.wav` here and add a row above.
