## Caption
When your boss catches you sleeping and you wake up with a whole new haircut.
Same office, same tap on the shoulder, same stare. The only new thing is me.

A few photos of me and 1 viral clip. AI rebuilt every frame, the camera move, the timing, even the hairpiece.

Follow for more AI experiments like this.

#AI #AIvideo #aitools #klingai #officehumor

## Script
No dialogue. Original meme audio. Korede asleep face-down at his office desk, a hand taps his shoulder, he slowly wakes and lifts his head to reveal a giant glossy bowl wig, then stares into the camera.

## On-screen
"When your boss catch you sleeping" with 3 crying-laughing emojis, top of frame, whole video.

## Alt text
AI-generated video of Korede in a teal checkered suit and orange turtleneck asleep at an office desk. A hand taps his shoulder, he wakes and lifts his head wearing a huge glossy black bowl wig and stares at the camera.

## Notes
Straight swap of instagram.com/reel/DepwLuVJVkI: original audio copied bit for bit (md5-checked), same timing, moves and camera. Format inspired by @bubba.crickets.
Model (kie.ai): kling-4.0/reference-to-video 720p, 15 s, 9:16. @Korede element from 4 face crops (korede-cafe-smile.jpg primary, W43 HeyGen plate frame, korede-sanjana-night.jpg cropped to him, korede-terrace.jpg) plus korede-terrace.jpg for height and build; the original clip as @video_1. 510 credits ($2.55; kie bills input plus output seconds with a video input). The last 0.7 s holds the final frame so the video runs the full length of the original audio. Upscaled to 1080x1920.
The original's burned-in caption and creator handle are gone (Kling renders every frame fresh, prompted for no text). Our own clean caption is overlaid with Playwright + ffmpeg, kept in the top band so it never covers his face.
Face QA: the reveal reads as Korede (round face, broad nose, full lips, goatee, diamond studs); tall and lean. Known flaw: his braids morph into the bowl wig at about 8 s while his head is down. Korede to judge.
No end card, so no comment keyword. Status draft.

v2 (2026-10-24, Korede's fixes): regenerated with kling-4.0/reference-to-video (task ae45410cd66e4eacd13b5544bde69fd3, 510 credits, $2.55; prompt in src/kling-prompt-v2.txt) asking for his own twist braids the entire time and no wig/hat/helmet; the braids now hold through 7 to 9 s and the reveal (bowl wig gone). Kling ignored "green suit", so the suit is recoloured in post: ffmpeg huesaturation=hue=-55:colors=c+b:strength=20:saturation=0.1 (only cyans/blues; orange turtleneck, skin, desk untouched). Caption moved down to top 330 px (src/caption.mjs). Original audio still copied bit for bit (md5 matched). Likeness checked side by side with cafe/plate refs: braids, studs, goatee, broad nose and full lips match; face reads a touch longer than v1. v1 kept at scratchpad out/boss-v1-backup.mp4.
