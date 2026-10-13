"""Subtitles from the timeline: episodes/<ep>-*/subtitles.en.srt (deliverable) and .work/<ep>/subs.ass (burn-in).
python3 scripts/subs.py <ep>"""
import json, re, textwrap
from epconf import DOCS, WORK, SRC
tl = json.load(open(SRC / 'timeline.json'))
MAXL = 42


def split_cue(text, a, b):
    if len(text) <= MAXL * 2 - 4:
        return [(text, a, b)]
    mid = len(text) // 2
    c = [m.end() for m in re.finditer(r'[,;:.!?…]\s', text)]
    cut = min(c, key=lambda x: abs(x - mid)) if c else text.rfind(' ', 0, mid)
    x, y = text[:cut].strip(), text[cut:].strip()
    tm = a + (b - a) * len(x) / len(text)
    return split_cue(x, a, tm) + split_cue(y, tm, b)


def wrap(t):
    ls = textwrap.wrap(t, MAXL)
    if len(ls) > 2 or (len(ls) == 2 and abs(len(ls[0]) - len(ls[1])) > 18):
        ls = textwrap.wrap(t, (len(t) + 1) // 2 + 3)
    return ls


cues = []
for ln in tl['lines']:
    for t, a, b in split_cue(ln['text'].replace('...', '…'), ln['start'], ln['end'] + 0.25):
        cues.append([a, b, wrap(t)])
for i in range(len(cues) - 1):
    cues[i][1] = min(cues[i][1], cues[i + 1][0] - 0.04)


def ts(t):
    return f'{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round((t % 1) * 1000)) % 1000:03d}'


def ats(t):
    return f'{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}'


with open(DOCS / 'subtitles.en.srt', 'w') as f:
    for i, (a, b, ls) in enumerate(cues, 1):
        f.write(f'{i}\n{ts(a)} --> {ts(b)}\n' + '\n'.join(ls) + '\n\n')
head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,NunitoSub,50,&H00FFFFFF,&H00FFFFFF,&H28442A1E,&H28442A1E,0,0,0,0,100,100,0,0,3,14,0,2,200,200,56,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
open(WORK / 'subs.ass', 'w').write(head + ''.join(f'Dialogue: 0,{ats(a)},{ats(b)},Sub,,0,0,0,,' + '\\N'.join(ls) + '\n' for a, b, ls in cues))
print(len(cues), 'cues')
