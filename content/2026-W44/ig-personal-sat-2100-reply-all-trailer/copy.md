## Caption
Comment "AI" and I'll send you my AI Employee Starter Pack.

The scariest movie of the year is 20 seconds long.

Would you give your agent the company card?

#AI #AIagents #halloween #AIhumor #techmemes

## Script
NARRATOR: It was supposed to answer a few emails.
NARRATOR: Then we gave it... the company card.
NARRATOR: This Halloween.
KOREDE (whisper): It replied... all.
TITLE: REPLY ALL. only in your inbox.
END CARD: follow for AI. comment "AI" for my starter pack. @koredekola

## On-screen
it was supposed to answer a few emails · then we gave it the company card · this halloween · "it replied... all." · REPLY ALL · only in your inbox · follow for AI

## Alt text
AI-generated fake horror movie trailer starring Korede. Lightning flashes as he stares at his laptop in a dark kitchen. A narrator says it was supposed to answer a few emails. In a red-lit office corridor a printer spews endless receipts while Korede backs away in terror. In a close-up lit by his phone, he whispers "It replied... all." Title card: REPLY ALL, only in your inbox. End card: follow for AI.

## Notes
20 s, 9:16, 1080x1920, 30 fps, letterboxed. Fake-movie-trailer format from the web scan (see research/style-ai-slop.md), slotted for Halloween night.
Generation (kie.ai): stills nano-banana-2 1K (laptop in storm, printer corridor, phone-lit close-up; the laptop still was generated twice by accident, 4 x 8 credits). Moving shots bytedance/seedance-2-mini 720p 5 s first-frame (2 x 41 credits). Whisper shot kling/ai-avatar-standard 720p with Korede's cloned voice (16 credits). Narrator google/gemini-3-8-flash-tts (Algenib), sped 1.15x. Music Suno V6 "horror movie trailer score, low drones, eerie music box melody, deep braams, heartbeat pulse, risers, no vocals" (12 credits), plus a rage-trap tail on the end card. The laptop's logo sits under the letterbox bar, so no brand logo is visible.
Reel cost about $0.65.
Freebie for keyword AI: AI Employee Starter Pack (assets/freebies/ai-employee-starter-pack.pdf, listed in config/offers.json).
Format research: research/style-ai-slop.md. All Korede shots are generated from his likeness photos (assets/talking-head/likeness/korede-terrace.jpg, korede-ubahn.jpg, assets/talking-head/korede-still.png) via nano-banana-2 image editing, then animated. No real people other than Korede, no brand logos on screen (the chat and voice-mode UIs are generic, drawn in HTML).
Korede voice: HeyGen heygen-voice-1-turbo-free, instant clone 2119a56717374a708188f84e99e8f2c4. Assembly: ffmpeg (scratchpad assembler), captions rendered with Playwright (Anton), loudness -14 LUFS. SFX from assets/sfx. Not yet linted by Korede; status draft. Consider a trending IG audio swap at queue time.

Likeness rebuild 2026-10-24 (Korede: "looks insanely not like me"):
- Laptop and printer stills re-made with nano-banana-2 editing REAL photos of Korede (laptop-rooftop.jpg, korede-ubahn.jpg) with his front plate frame and terrace photo as identity refs, 2K; outputs checked face-to-face against the refs (young round face, braids, ear studs). Saved in src/. Slow push-ins instead of AI motion so the face can't drift.
- Whisper close-up ("it replied... all.") is now his REAL face: a 3.2 s cut of the W43 lip-sync plate, re-lip-synced to the whisper line (volcengine lite), dark blue phone-lit grade.
- Music removed (Korede adds his own); SFX: impact, whoosh, riser, notify, print, explode, thud.
- Spend $0.32 (4 stills + 1 lip-sync). Assembly spec: src/assemble-spec.json (scratchpad assembler).
