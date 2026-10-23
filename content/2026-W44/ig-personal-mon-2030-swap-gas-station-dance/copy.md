## Caption
Gave an AI 1 photo of me and a dance video. It did the rest.
Same moves, same song, same gas station. I've never done this dance in my life.

The video model copies every step from the original clip and rebuilds it with my face. 15 seconds, under a dollar.

Follow for more AI experiments like this.

#AI #AIvideo #aitools #klingai #motioncontrol

## Script
No dialogue. Original audio: "hey, hey, hey" trending track. Korede dances at a gas station at night, move for move with the original clip.

## On-screen
No text on screen.

## Alt text
AI-generated video of Korede in a white t-shirt, chain and ripped grey jeans dancing at a gas station at night, matching a viral dance clip move for move.

## Notes
Straight swap of instagram.com/reel/DeUTDAHTfne: same audio (original track copied bit for bit, md5-checked), same timing and camera. Format inspired by @neegy_official.
Models (kie.ai): character still nano-banana-2 2K image edit (Korede's likeness photos korede-still.png, korede-terrace.jpg + the reference's first frame), then kling-2.6/motion-control 720p, character_orientation video, driven by the original clip (165 credits, $0.83). Upscaled to 1080x1920 with ffmpeg, original audio muxed back.
First try with wan/2-2-animate-replace 720p ($0.94) failed QA: it couldn't segment the original's gold toy head, so a gold helmet stayed on Korede from 3 s. Not used.
Face QA: convincingly Korede in the face-to-camera beats (4 to 6 s, 9 to 10 s); some drift in fast spins (face a touch longer, expressions exaggerated because the source character is a cartoon duck). Hands fine. Body lean and tall, matching his full-body photos. Korede's bar is exactly him: this is close, not exact. A re-render with a character still built from all 5 likeness photos (like character-lfc-v2.png in the millionaire swap) would tighten it, about 165 credits ($0.83). Korede to judge before approval.
No watermarks or handles in frame (Kling renders the whole frame fresh).
No end card, so no comment keyword. Status draft.
