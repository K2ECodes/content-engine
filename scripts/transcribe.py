#!/usr/bin/env python3
"""Word-level timestamps for a voiceover or talking-head clip, via local faster-whisper.

  ~/.local/whisper-venv/bin/python scripts/transcribe.py <audio-or-video> <out.json> [--model small] [--prompt "names, jargon"]

Writes {"words": [{"w": "Your", "start": 0.12, "end": 0.31}, ...], "text": "..."}.
The split template uses these to place captions and graphics on the exact word.
"""
import json
import re
import sys

from faster_whisper import WhisperModel


def main(argv):
    src, out = argv[1], argv[2]
    model_name = argv[argv.index("--model") + 1] if "--model" in argv else "small"
    prompt = argv[argv.index("--prompt") + 1] if "--prompt" in argv else "Content Systems.ai, 3PL, WMS, Korede"
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(src, language="en", word_timestamps=True, initial_prompt=prompt, vad_filter=True)
    words, text = [], []
    for seg in segments:
        text.append(seg.text.strip())
        for w in seg.words or []:
            words.append({"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
    # Whisper sometimes splits "180,000" into "180" + ",000": glue punctuation-led tokens to the previous word.
    merged = []
    for w in words:
        if merged and re.match(r"^[,.%']", w["w"]):
            merged[-1]["w"] += w["w"]
            merged[-1]["end"] = w["end"]
        else:
            merged.append(w)
    words = merged
    with open(out, "w") as f:
        json.dump({"words": words, "text": " ".join(text)}, f, indent=1)
    print(f"{len(words)} words, {words[-1]['end'] if words else 0:.2f}s -> {out}")


if __name__ == "__main__":
    main(sys.argv)
