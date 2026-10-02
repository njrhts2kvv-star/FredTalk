import {ProductSafeImage as Img} from "./ProductSafeImage";
import {cleanStaticFile as staticFile} from "./clean-assets";
import React from "react";
import { AbsoluteFill,  OffthreadVideo } from "remotion";
import manifest from "../manifest.json";
import b036TextOpacity from "../b036-native-text-opacity.json";
const facts = manifest.pages.filter((x) => x.number >= 26 && x.number <= 50);

// Reference choreography is separate from reusable content and Fred palette.
export type Batch2Overrides = {
  words?: string[];
  accent?: string;
  ink?: string;
  background?: string;
  timeScale?: number;
  assets?: Record<string, string>;
};
export const batch2Configs = facts;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
const p = (t: number, a: number, d = 0.45) => ease((t - a) / d);
const lerp = (a: number, b: number, v: number) => a + (b - a) * v;
const shadow = "0 15px 35px #00000028";
const Pos: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ x = 0, y = 0, w, h, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      ...style,
    }}
  >
    {children}
  </div>
);
const Picture: React.FC<{
  name: string;
  x?: number;
  y?: number;
  w: number;
  h: number;
  style?: React.CSSProperties;
  fit?: "cover" | "contain";
}> = ({ name, x = 0, y = 0, w, h, style, fit = "cover" }) => (
  <Pos x={x} y={y} w={w} h={h} style={{ overflow: "hidden", ...style }}>
    <Img
      src={staticFile(name.includes("/") ? name : `batch2/${name}.jpg`)}
      style={{ width: "100%", height: "100%", objectFit: fit }}
    />
  </Pos>
);
const Window: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  ink?: string;
}> = ({ children, style, ink = "#121214" }) => (
  <Pos
    x={300}
    y={80}
    w={1320}
    h={940}
    style={{
      background: ink,
      borderRadius: 32,
      boxShadow: shadow,
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        height: 74,
        background: "#00000045",
        display: "flex",
        gap: 16,
        alignItems: "center",
        paddingLeft: 44,
      }}
    >
      {["#8960ca", "#d2b8f2", "#eeeeef"].map((c) => (
        <span
          key={c}
          style={{ width: 20, height: 20, borderRadius: 20, background: c }}
        />
      ))}
    </div>
    {children}
  </Pos>
);
const Label: React.FC<{
  children?: React.ReactNode;
  x?: number;
  y?: number;
  w?: number;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({
  children,
  x = 0,
  y = 0,
  w = 1920,
  size = 120,
  color = "#121214",
  style,
}) => (
  <Pos
    x={x}
    y={y}
    w={w}
    style={{
      fontSize: size,
      lineHeight: 1.28,
      fontWeight: 700,
      color,
      textAlign: "center",
      whiteSpace: "pre-line",
      ...style,
    }}
  >
    {children}
  </Pos>
);
const Pill: React.FC<{
  text: string;
  x: number;
  y: number;
  w: number;
  h?: number;
  scale?: number;
  ink: string;
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, x, y, w, h = 280, scale = 1, ink, color = "#fff", style }) => (
  <Pos
    x={x}
    y={y}
    w={w}
    h={h}
    style={{
      background: ink,
      borderRadius: Math.min(90, h / 2),
      boxShadow: shadow,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 750,
      fontSize: 130,
      color,
      transform: `scale(${scale})`,
      ...style,
    }}
  >
    {text}
  </Pos>
);
const reveal = (t: number, a: number, d = 0.4) => ({
  clipPath: `inset(0 ${(1 - p(t, a, d)) * 100}% 0 0)`,
  transform: `translateY(${(1 - p(t, a, d)) * 28}px)`,
});

export const Batch2: React.FC<{
  number: number;
  t: number;
  duration: number;
  overrides?: Batch2Overrides;
}> = ({ number, t: raw, duration, overrides = {} }) => {
  const cfg = facts.find((x) => x.number === number)!;
  const words = overrides.words ?? cfg.exactScreenWords;
  const t = raw * (overrides.timeScale ?? 1);
  const cue = (i: number) => cfg.cues[i]?.time ?? 0;
  const ink = overrides.ink ?? "#121214";
  const purple = overrides.accent ?? "#8960ca";
  const pic = (
    name: string,
    x: number,
    y: number,
    w: number,
    h: number,
    style: React.CSSProperties = {},
  ) => (
    <Picture
      name={overrides.assets?.[name] ?? name}
      x={x}
      y={y}
      w={w}
      h={h}
      style={style}
    />
  );
  const label = (
    text: string,
    x: number,
    y: number,
    w: number,
    size = 130,
    style: React.CSSProperties = {},
  ) => (
    <Label x={x} y={y} w={w} size={size} color={ink} style={style}>
      {text}
    </Label>
  );
  const pill = (
    text: string,
    x: number,
    y: number,
    w: number,
    h = 280,
    style: React.CSSProperties = {},
  ) => <Pill text={text} x={x} y={y} w={w} h={h} ink={ink} style={style} />;
  let scene: React.ReactNode = null;
  switch (number) {
    case 26: {
      const focus = p(t, cue(1) - 0.15, 0.45);
      scene = (
        <>
          <AbsoluteFill style={{ background: ink }} />
          <div style={{ filter: `blur(${focus * 20}px)` }}>
            {pic("26-a", 210, 80, 770, 420, { borderRadius: 35 })}
            {pic("26-b", 210, 555, 770, 430, { borderRadius: 35 })}
            {pic("26-c", 1180, 60, 520, 930, { borderRadius: 35 })}
          </div>
          {t > 1.65 &&
            t < 6.1 &&
            label(t < 4.45 ? words[0] : words[1], 0, 400, 1920, 210, {
              color: "#fff",
              clipPath: `inset(0 0 ${(1 - p(t, t < 4.45 ? 1.7 : 4.45, 0.35)) * 100}% 0)`,
            })}
          {t > 5.8 && (
            <>
              {pic("26-scenic", 0, 0, 1920, 1080, { filter: "grayscale(1)" })}
              {words.slice(2).map((s, i) =>
                label(s, 1250 - i * 220, 200 + i * 210, 550, 150, {
                  color: "#fff",
                  textShadow: "0 3px 10px #000c",
                  WebkitTextStroke: "1px #0008",
                  transform: `translateY(${(1 - p(t, 6.2 + i * 0.4)) * 900}px) rotate(${[8, -18, -35, 35][i]}deg)`,
                }),
              )}
            </>
          )}
        </>
      );
      break;
    }
    case 27: {
      const cluster = p(t, cue(2) - 0.25, 0.7),
        merge = p(t, cue(3) - 0.2, 0.65);
      scene = (
        <>
          {["27-a", "27-b", "27-c", "27-d"].map((s, i) => {
            const xs = [80, 540, 1000, 1460],
              cx = [650, 970, 650, 970],
              cy = [160, 160, 480, 480];
            const x = lerp(lerp(xs[i], cx[i], cluster), 1190, merge),
              y = lerp(320, cy[i], cluster);
            return pic(s, x, lerp(y, 280, merge), 480, 480, {
              borderRadius: "50%",
              boxShadow: shadow,
              transform: `scale(${lerp(1, i === 0 ? 1 : 0, merge)})`,
            });
          })}
          {label(words[0], 100, 385, 1060, 200, {
            color: ink,
            ...reveal(t, 3.5, 0.6),
          })}
          {label(words[1], 1190, 410, 480, 175, {
            color: "#fff",
            background: "#17131ee6",
            borderRadius: 80,
            textShadow: "0 3px 6px #0008",
            ...reveal(t, 4, 0.45),
          })}
        </>
      );
      break;
    }
    case 28: {
      scene = (
        <>
          {t < 1.4 && (
            <Window
              style={{
                transform: `translateY(${-p(t, cue(1) - 0.15, 0.25) * 1150}px)`,
              }}
            >
              {label(words[0], 0, 350, 1320, 175, {
                color: "#fff",
                fontWeight: 500,
                letterSpacing: 12,
              })}
            </Window>
          )}
          {t >= 1.3 && t < 3.8 && (
            <>
              {label(words[1], 80, 430, 830, 180, {
                color: purple,
                ...reveal(t, 1.45),
              })}
              {label(words[2], 1010, 430, 830, 180, {
                color: purple,
                ...reveal(t, 2.05),
              })}
            </>
          )}
          {t >= 3.5 &&
            pic("28-land", 170, 100, 1580, 875, {
              borderRadius: 48,
              boxShadow: shadow,
              transform: `translateX(${(1 - p(t, cue(4) - 0.1, 0.55)) * 1920}px)`,
            })}
        </>
      );
      break;
    }
    case 29: {
      const blur = t >= 2 && t < 5.4;
      scene = (
        <>
          <AbsoluteFill style={{ background: ink }} />
          <div
            style={{
              filter: blur ? "blur(16px)" : "none",
              transform: `scale(${1 + 0.05 * p(t, cue(5) - 0.05)})`,
            }}
          >
            {[0, 1].map((i) => (
              <React.Fragment key={i}>
                {pic(`29-man${i + 1}`, 230, 160 + i * 500, 640, 390, {
                  borderRadius: 8,
                })}
                <Pos
                  x={980}
                  y={160 + i * 500}
                  w={710}
                  h={390}
                  style={{
                    border: "3px solid #606067",
                    borderRadius: 16,
                    background: "#242428",
                  }}
                >
                  <svg width="710" height="390">
                    <path
                      d="M 50 200 C 180 200 190 60 400 60"
                      stroke="#777"
                      fill="none"
                      strokeWidth="3"
                    />
                  </svg>
                </Pos>
                <Pos
                  x={840}
                  y={340 + i * 500}
                  w={170}
                  h={3}
                  style={{ background: "#7d7d85" }}
                />
              </React.Fragment>
            ))}
          </div>
          {blur &&
            words.map((s, i) =>
              label(
                s,
                70 + (i % 2) * 940,
                190 + Math.floor(i / 2) * 500,
                860,
                150,
                { color: purple, ...reveal(t, [2, 3.1, 4, 4.7][i], 0.35) },
              ),
            )}
        </>
      );
      break;
    }
    case 30:
    case 31:
    case 40: {
      const start = number === 30 ? cue(1) : 0;
      const listTimes =
        number === 30
          ? [cue(2), cue(3), cue(4)]
          : number === 31
            ? [cue(1), cue(2), cue(3)]
            : [cue(0), cue(1), cue(2)];
      scene = (
        <>
          {number === 30 &&
            t < 2.2 &&
            pic("30-actor", 535, 160, 800, 890, {
              transform: `translateY(${p(t, 1.6, 0.5) * 1080}px)`,
            })}
          {number === 31 &&
            t > 6.55 &&
            pic("31-avatar", 835, 340, 250, 275, {
              transform: `scale(${p(t, 6.55, 0.35)})`,
            })}
          {t >= start && (
            <Window
              ink={ink}
              style={{
                transform: `translateY(${number === 30 ? (1 - p(t, start, 0.5)) * -1150 : number === 31 ? -p(t, 6.55, 0.35) * 1150 : 0}px)`,
              }}
            >
              {words.map((s, i) =>
                label(
                  number === 40
                    ? s.slice(
                        0,
                        Math.ceil(clamp((t - listTimes[i]) / 0.5) * s.length),
                      )
                    : s,
                  50,
                  180 + i * 245,
                  1220,
                  number === 40 ? 172 : 156,
                  {
                    color: number === 40 ? purple : "#fff",
                    ...(number !== 40 ? reveal(t, listTimes[i], 0.4) : {}),
                  },
                ),
              )}
            </Window>
          )}
        </>
      );
      break;
    }
    case 32: {
      const focused = p(t, cue(2) - 0.2, 0.4);
      scene = (
        <>
          <Window ink={ink} style={{ filter: `blur(${focused * 17}px)` }}>
            {t < 2.6
              ? label(words[0], 0, 370, 1320, 170, {
                  color: "#fff",
                  letterSpacing: 24,
                  ...reveal(t, 0.2, 0.6),
                })
              : label(words[1], 70, 325, 1180, 83, {
                  color: "#fff",
                  fontWeight: 500,
                  whiteSpace: "normal",
                  ...reveal(t, 2.65, 0.9),
                })}
          </Window>
          {words.slice(2).map((s, i) =>
            label(
              s,
              30 + (i % 2) * 950,
              270 + Math.floor(i / 2) * 440,
              890,
              150,
              {
                color: purple,
                ...reveal(t, [4.75, 5.7, 6.55, 7.75][i], 0.4),
              },
            ),
          )}
        </>
      );
      break;
    }
    case 33:
    case 43: {
      const out = p(t, number === 33 ? 3.75 : 2.55, 0.4);
      scene = (
        <>
          {pic(number === 33 ? "33-table" : "43-table", 80, 55, 1760, 950, {
            borderRadius: 32,
            boxShadow: shadow,
            filter: `blur(${(1 - out) * 13}px)`,
          })}
          {words.map((s, i) =>
            label(
              s,
              number === 33 ? 170 : 100 + i * 345,
              number === 33 ? 100 + i * 315 : 440,
              number === 33 ? 1580 : 335,
              number === 33 ? 170 : 125,
              {
                color: purple,
                ...reveal(t, number === 33 ? [0, 0.65, 1.65][i] : 0, 0.4),
                transform: `translateY(${out * -1000}px)`,
              },
            ),
          )}
        </>
      );
      break;
    }
    case 34: {
      const starts = [cue(0) - 0.9, cue(1), cue(2), cue(3)],
        ends = starts.map((a, i) => a + [2.2, 2.5, 2.75, 3.7][i]),
        keys = ["讨论内容", "项目、时间、主题", "会议结束", "知识库"];
      scene = (
        <Window ink={ink}>
          {words.map((s, i) => {
            const count = Math.floor(
              clamp((t - starts[i]) / (ends[i] - starts[i])) * s.length,
            );
            const shown = s.slice(0, count),
              key = keys[i],
              ix = shown.indexOf(key);
            return (
              <Pos
                key={i}
                x={65}
                y={205 + i * 155}
                w={1180}
                style={{ fontSize: 56, lineHeight: 1.6, color: "#fff" }}
              >
                {ix < 0 ? (
                  shown
                ) : (
                  <>
                    {shown.slice(0, ix)}
                    <span style={{ color: purple }}>{key}</span>
                    {shown.slice(ix + key.length)}
                  </>
                )}
                {count < s.length && t >= starts[i] && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 7,
                      height: 54,
                      background: purple,
                      verticalAlign: "middle",
                    }}
                  />
                )}
              </Pos>
            );
          })}
        </Window>
      );
      break;
    }
    case 35: {
      scene = (
        <>
          {[0, 1, 2, 3].map((i) => (
            <Pos
              key={i}
              x={55 + i * 480}
              y={120 + (1 - p(t, -0.18 + i * 0.04, 0.45)) * 1000}
              w={405}
              h={840}
              style={{
                background: ink,
                padding: 12,
                borderRadius: 63,
                boxShadow: shadow,
                overflow: "hidden",
              }}
            >
              {pic(`35-ui${i + 1}`, 12, 12, 381, 816, {
                borderRadius: 49,
                transform: `translateY(${-p(t, 1.5 + i * 0.3, 2) * i * 12}px) scale(1.025)`,
              })}
              <div
                style={{
                  position: "absolute",
                  top: 15,
                  left: 151,
                  width: 104,
                  height: 20,
                  background: ink,
                  borderRadius: 20,
                }}
              />
            </Pos>
          ))}
        </>
      );
      break;
    }
    case 36: {
      // Measured native timeline, expressed in the 60 fps output clock.
      // Capsules stay fixed while each label fades independently.
      const frame = t * 60;
      const fade = (start: number, end: number) => 1 - clamp((frame - start) / (end - start));
      const leftOpacity = fade(216, 248);
      const rightOpacity = fade(242, 272);
      const equalsOpacity = clamp((frame - 84) / 30) * fade(260, 290);
      // The native capsule expands quickly from a small oval, then settles.
      const growthFrames = [22, 24, 26, 28, 30, 32, 34, 36, 38, 40];
      const growthValues = [0, 0.22, 0.40, 0.55, 0.67, 0.80, 0.88, 0.95, 0.98, 1];
      let rightScale = frame >= 40 ? 1 : 0;
      for (let i = 1; i < growthFrames.length; i++) {
        if (frame >= growthFrames[i - 1] && frame < growthFrames[i]) {
          rightScale = lerp(growthValues[i - 1], growthValues[i],
            (frame - growthFrames[i - 1]) / (growthFrames[i] - growthFrames[i - 1]));
        }
      }
      scene = (
        <>
          {t > 190 / 60 &&
            pic("36-actor", 600, 135, 730, 945, {
              opacity: clamp((frame - 190) / 40),
              filter: `blur(${(1 - p(t, 4.8, 0.5)) * 15}px)`,
              mixBlendMode: "multiply",
            })}
          {pill(words[0], 290, 390, 400, 280, {opacity: leftOpacity})}
          {pill("", 1230, 390, 400, 280, {
            transform: `scale(${rightScale})`,
            opacity: rightOpacity,
            color: "#fff",
          })}
          {/* Keep the measured per-character native flicker unchanged. */}
          <div style={{position: "absolute", left: 1230, top: 390, width: 400, height: 280,
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 750,
            fontSize: 130, color: "#fff", opacity: rightOpacity,
            transform: `scale(${rightScale})`}}>{Array.from(words[2]).map((char, i, chars) => {
              const nativeFrame = Math.max(0, Math.min(b036TextOpacity.samples.length - 1, Math.floor(t * 30 + 1e-6)));
              const track = Math.min(1, Math.floor(i * 2 / chars.length));
              return <span key={i} style={{opacity: b036TextOpacity.samples[nativeFrame][track + 1]}}>{char}</span>;
            })}</div>
          {label(words[1], 800, 350, 320, 275, {opacity: equalsOpacity})}
        </>
      );
      break;
    }
    case 37: {
      const palette = [
        "#121214",
        "#d2b8f2",
        "#eeeef0",
        "#8960ca",
        "#29292e",
        "#bda4fa",
        "#fafafa",
        "#5e3d91",
      ];
      scene = (
        <>
          {pic("37-event", 0, 0, 1920, 1080, {
            filter: `grayscale(1) blur(${p(t, cue(1) - 0.1) * 16}px)`,
          })}
          {label(
            words[0],
            t < 4.5 ? 0 : 100,
            t < 4.5 ? 420 : 90,
            t < 4.5 ? 1920 : 900,
            t < 4.5 ? 145 : 105,
            { color: "#fff", ...reveal(t, 2.7, 0.65) },
          )}
          {palette.map((c, i) => {
            const q = p(t, 4.5 + i * 0.23, 0.7);
            return (
              <Pos
                key={i}
                x={430 + (i % 4) * 275}
                y={300 + Math.floor(i / 4) * 275}
                w={300}
                h={300}
                style={{
                  transform: `translate(${(1 - q) * (i % 2 ? 650 : -650)}px,${(1 - q) * 1500}px) rotate(${(1 - q) * 80}deg)`,
                }}
              >
                <svg viewBox="0 0 300 300" width="300" height="300">
                  <path
                    d="M20 20H104C80 -30 180 -30 156 20H260V104C310 80 310 180 260 156V260H176C200 210 100 210 124 260H20V176C-30 200 -30 100 20 124Z"
                    fill={c}
                    stroke="#ffffff66"
                    strokeWidth="3"
                  />
                </svg>
              </Pos>
            );
          })}
        </>
      );
      break;
    }
    case 38: {
      const small = 1 - p(t, cue(5) - 0.2, 0.65),
        first = p(t, 0.6, 0.55),
        second = p(t, cue(3) - 0.1, 0.65);
      scene = (
        <>
          {pic("38-event", 0, 0, 1920, 1080, {
            filter: `grayscale(1) blur(${(1 - p(t, cue(6), 0.5)) * 18}px)`,
          })}
          <div
            style={{ transform: `translateY(${-p(t, 9.45, 0.6) * 1500}px)` }}
          >
            {pill(
              words[0],
              lerp(420, 580, first * small),
              lerp(lerp(370, 75, first), 30, 1 - small),
              lerp(1080, 760, first * small),
              lerp(300, 210, first * small),
              { fontSize: lerp(160, 115, first * small) },
            )}
            {t > 0.95 &&
              pill(
                words[1],
                lerp(400, 585, second * small),
                lerp(lerp(390, 830, second), 760, 1 - small),
                lerp(1120, 750, second * small),
                lerp(300, 205, second * small),
                {
                  transform: `scale(${p(t, 0.95, 0.5)})`,
                  fontSize: lerp(155, 110, second * small),
                },
              )}
            {t > 4.25 &&
              pill(words[2], 400, 435, 1120, 300, {
                transform: `scale(${p(t, 4.25, 0.55)})`,
                fontSize: 150,
              })}
          </div>
        </>
      );
      break;
    }
    case 39: {
      const grow = p(t, 0.05, 0.8),
        shrink = p(t, cue(2) - 0.15, 0.6),
        multi = p(t, cue(3) - 0.1, 0.55),
        ui = p(t, cue(5) - 0.15, 0.45);
      scene = (
        <>
          {t < 5.1 && (
            <>
              {pill(
                "",
                lerp(820, 130, grow) + shrink * 470,
                lerp(420, 65, grow),
                lerp(250, 1660, grow) - shrink * 780,
                lerp(250, 940, grow) - shrink * 80,
                { transform: `translateY(${-multi * 500}px)` },
              )}
              {[0, 1, 2].map((i) =>
                pill("", 60 + i * 650, 40 - multi * 500, 565, 870, {
                  transform: `scale(${multi})`,
                }),
              )}
              {pill(
                t > 3.3 ? words.join("\n") : "",
                100,
                lerp(1080, 390, p(t, 3, 0.45)),
                1720,
                600,
                {
                  color: purple,
                  fontSize: 150,
                  whiteSpace: "pre-line",
                  textAlign: "center",
                },
              )}
            </>
          )}
          {t > 4.75 && (
            <>
              {pic("39-nodes", 150, 70, 1630, 820, {
                borderRadius: 80,
                boxShadow: shadow,
                transform: `translateY(${(1 - ui) * -1100}px)`,
              })}
              {[0, 1, 2].map((i) =>
                pill("", 60 + i * 650, 930, 550, 500, { fontSize: 60 }),
              )}
            </>
          )}
          {t > 6.8 &&
            pic("39-files", 110, 90, 1700, 900, {
              borderRadius: 60,
              boxShadow: shadow,
              transform: `translateX(${(1 - p(t, cue(6) - 0.2, 0.8)) * -2000}px)`,
            })}
        </>
      );
      break;
    }
    case 41: {
      const assets = [
        "41-beads",
        "41-ancient",
        "41-poster",
        "41-portrait",
        "41-perfume",
        "41-car",
        "41-power",
        "41-clip",
        "41-room",
        "41-woman",
      ];
      let shift = t < 3.5 ? 0 : Math.min(7, (t - 3.5) / 2.2) * 640;
      scene = (
        <>
          {assets.map((s, i) => {
            // Source opens with the bead image partly below stage and the second portrait already established.
            const intro =
              i === 1 ? 1 : i === 0 ? p(t, -0.2, 0.5) : p(t, i * 0.16, 0.7);
            return pic(s, 120 + i * 640 - shift, 100, 570, 890, {
              borderRadius: 50,
              boxShadow: shadow,
              transform: `translateY(${(1 - intro) * 1200}px) rotate(${t < 3.5 ? (i % 2 ? 1 : -1) * 8 * Math.sin(p(t, 0.8, 2) * Math.PI) : 0}deg)`,
            });
          })}
        </>
      );
      break;
    }
    case 42: {
      scene = (
        <>
          {t < 4.6 && (
            <Window
              ink={ink}
              style={{
                transform: `translateY(${(1 - p(t, -0.16, 0.5)) * -1200}px) translateX(${-p(t, cue(4) - 0.15, 0.4) * 1900}px)`,
              }}
            >
              {words.map((s, i) =>
                label(s, 70 + i * 330, 190 + i * 230, 520, 170, {
                  color: "#fff",
                  ...reveal(t, 0.3 + i * 0.45, 0.35),
                }),
              )}
            </Window>
          )}
          {t > 4.25 &&
            pic("42-paper", 1120, 90, 600, 900, {
              boxShadow: shadow,
              transform: `translateX(${(1 - p(t, cue(4) - 0.15, 0.65)) * 1300}px) rotate(5deg)`,
            })}
        </>
      );
      break;
    }
    case 44: {
      const zoom = p(t, cue(1), 0.5) * (1 - p(t, cue(3) - 0.4, 0.5));
      scene = (
        <>
          <div style={{ filter: `blur(${zoom * 14}px)` }}>
            {Array.from({ length: 8 }, (_, i) =>
              pic(
                `44-card${i}`,
                70 + (i % 4) * 470,
                35 + Math.floor(i / 4) * 525,
                370,
                490,
                {
                  borderRadius: 24,
                  boxShadow: shadow,
                  transform: `translateY(${(1 - (i < 2 ? 1 : p(t, i * 0.16, 0.6))) * 1150}px)`,
                },
              ),
            )}
          </div>
          {t > 3 &&
            t < 6.5 &&
            pic(
              "44-sheet",
              lerp(690, 150, p(t, cue(2) - 0.4, 0.7)),
              60,
              540,
              1010,
              {
                borderRadius: 22,
                boxShadow: shadow,
                transform: `scale(${zoom})`,
              },
            )}
        </>
      );
      break;
    }
    case 45: {
      const show = p(t, cue(1) - 0.1, 0.6),
        focus = p(t, cue(2) - 0.05, 0.4) * (1 - p(t, 5, 0.4)),
        collapse = p(t, cue(4) - 0.1, 0.5);
      scene = (
        <>
          {t < 1.8 &&
            pic("45-document", 350, 100, 1220, 870, {
              transform: `translateX(${-show * 1920}px)`,
            })}
          <div style={{ filter: `blur(${focus * 15}px)` }}>
            {Array.from({ length: 8 }, (_, i) => {
              const x = lerp(
                  110 + (i % 4) * 480,
                  700 + (i % 4) * 130,
                  collapse,
                ),
                y = lerp(
                  190 + Math.floor(i / 4) * 465,
                  390 + Math.floor(i / 4) * 140,
                  collapse,
                ),
                settle = i === 0 ? p(t, 5.65, 0.3) : 0,
                s = lerp(lerp(1, 0.28, collapse), 0.7, settle);
              return (
                <Pos
                  key={i}
                  x={lerp(x, 840, settle)}
                  y={lerp(y, 420, settle)}
                  w={350}
                  h={280}
                  style={{
                    transform: `scale(${s * show * (i === 0 ? 1 : 1 - p(t, 5.65, 0.3))})`,
                    transformOrigin: "top left",
                  }}
                >
                  <svg width="350" height="280" viewBox="0 0 350 280">
                    <path
                      d="M 10 45 Q10 22 35 22 H130 L160 52 H315 Q340 52 340 75 V245 Q340 265 315 265 H35 Q10 265 10 240Z"
                      fill={i % 3 === 0 ? purple : "#29292e"}
                    />
                    <path
                      d="M10 88H340V245Q340 265 315 265H35Q10 265 10 240Z"
                      fill={i % 3 === 0 ? "#bda4fa" : "#55555b"}
                    />
                  </svg>
                </Pos>
              );
            })}
          </div>
          {words.map((s, i) =>
            label(s, 200, 310 + i * 350, 1520, 190, {
              color: purple,
              ...reveal(t, 2.5 + i, 0.35),
              transform: `translateY(${-p(t, 4.9, 0.4) * 1500}px)`,
            }),
          )}
        </>
      );
      break;
    }
    case 46: {
      const q = p(t, cue(1) - 0.05, 0.65);
      const subIndex =
        t < 0.65
          ? 0
          : t < 1.75
            ? 1
            : t < 3.5
              ? 2
              : t < 4.65
                ? 3
                : t < 5.5
                  ? 4
                  : 5;
      scene = (
        <>
          <Pos
            x={lerp(240, 5, q)}
            y={lerp(140, 20, q)}
            w={lerp(1450, 1160, q)}
            h={lerp(800, 650, q)}
            style={{ borderRadius: 55, boxShadow: shadow, overflow: "hidden" }}
          >
            <Img
              src={staticFile(
                overrides.assets?.[t < cue(3) ? "46-main-a" : "46-main-b"] ??
                  (t < cue(3)
                    ? "batch2/46-clean-a.jpg"
                    : "batch2/46-clean-c.jpg"),
              )}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Pos>
          <Pos
            x={870}
            y={510 + (1 - p(t, cue(2) - 0.2, 0.6)) * 900}
            w={1030}
            h={520}
            style={{ borderRadius: 45, boxShadow: shadow, overflow: "hidden" }}
          >
            <Img
              src={staticFile(
                overrides.assets?.[
                  t < cue(3) ? "46-secondary-a" : "46-secondary-b"
                ] ??
                  (t < cue(3)
                    ? "batch2/46-clean-b.jpg"
                    : "batch2/46-clean-d.jpg"),
              )}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Pos>
          {label(words[subIndex], 50, 1015, 1820, 48, {
            color: "#fff",
            WebkitTextStroke: "4px #121214",
            paintOrder: "stroke fill",
          })}
        </>
      );
      break;
    }
    case 47: {
      const poses = [
        [520, 25, 200],
        [490, 320, 230],
        [1400, 15, 145],
        [1390, 210, 190],
        [85, 280, 150],
        [1350, 440, 155],
        [1400, 615, 145],
        [90, 700, 180],
        [940, 650, 185],
        [1480, 840, 130],
        [60, 30, 135],
        [850, 910, 95],
        [450, 900, 140],
        [1110, 900, 125],
      ];
      scene = (
        <>
          {words.map((s, i) => {
            const xy = poses[i] ?? [80 + i * 30, 100 + i * 30, 90],
              exit = i === 3 ? 0 : p(t, 8.1 + i * 0.18, 1.1),
              intro = p(t, i * 0.12 - 0.65, 0.7),
              end = p(t, cue(3) + 0.1, 0.9);
            return label(
              s,
              lerp(
                xy[0],
                i === 3 ? 560 : xy[0] + (i % 2 ? 1200 : -1700),
                exit || (i === 3 ? end : 0),
              ),
              lerp(xy[1], i === 3 ? 420 : -500, exit || (i === 3 ? end : 0)),
              i === 3 ? lerp(600, 800, end) : 600,
              i === 3 ? lerp(xy[2], 320, end) : xy[2],
              {
                color: i % 4 === 0 || i === 3 ? purple : ink,
                fontWeight: 800,
                whiteSpace: "nowrap",
                transform: `scale(${intro}) rotate(${exit * (i % 2 ? 60 : -60)}deg)`,
              },
            );
          })}
        </>
      );
      break;
    }
    case 48: {
      const merge = p(t, cue(2) - 0.3, 0.4) * (1 - p(t, cue(3) - 0.3, 0.45)),
        pills = p(t, cue(4) - 0.1, 0.6);
      scene = (
        <>
          {t < 6.9 && (
            <>
              <Pill
                text={words[0]}
                x={lerp(430, 650, merge)}
                y={440 - pills * 1200}
                w={380}
                h={380}
                ink={ink}
                style={{
                  borderRadius: "50%",
                  transform: `scale(${p(t, -0.3, 0.45)})`,
                }}
              />
              <Pill
                text={words[1]}
                x={lerp(1100, 990, merge)}
                y={440 - pills * 1200}
                w={380}
                h={380}
                ink={ink}
                style={{
                  borderRadius: "50%",
                  transform: `scale(${p(t, 0.85, 0.45)})`,
                }}
              />
              {t > 2.1 &&
                words.slice(2, 6).map((s, i) =>
                  (i < 2 ? t < 4.6 : t >= 4.6)
                    ? label(
                        s,
                        300 + (i % 2) * 670,
                        190 + (i % 2) * 25,
                        750,
                        110,
                        {
                          color: purple,
                          ...reveal(
                            t,
                            i < 2 ? 2.1 + i * 0.7 : 4.6 + (i - 2) * 0.55,
                            0.35,
                          ),
                          transform: `rotate(${i % 2 ? 12 : -12}deg) translateY(${-p(t, 6.1, 0.3) * 1200}px)`,
                        },
                      )
                    : null,
                )}
            </>
          )}
          {t > 6.4 && (
            <>
              {pill(t > 7.9 ? words[6] : "", 520, 240, 880, 350, {
                transform: `translateX(${p(t, 9.4, 0.6) * 650}px) scale(${pills})`,
              })}
              {pill(t > 9.1 ? words[7] : "", 520, 700, 880, 350, {
                transform: `translateX(${-p(t, 9.4, 0.6) * 650}px) scale(${p(t, 7.3, 0.5)})`,
              })}
            </>
          )}
          {t > 9.5 &&
            pic("48-actor", 610, 120 + (1 - p(t, 9.5, 0.6)) * 1100, 750, 960, {
              clipPath: "polygon(0 0,100% 0,100% 100%,15% 100%,15% 45%,0 40%)",
            })}
        </>
      );
      break;
    }
    case 49: {
      scene = (
        <>
          {[0, 1, 2].map((i) => {
            const a = [4.3, 5.2, 6.1][i];
            const replace = p(t, a, 0.35);
            const txt = words[t < a ? i : i + 3];
            return pill(txt, 55 + i * 615, 200 + i * 235, 565, 310, {
              fontSize: 150,
              color: t < a ? "#fff" : i === 2 ? purple : "#fff",
              clipPath: `inset(0 0 0 0)`,
              transform: `translateY(${(1 - p(t, 0.05 + i * 0.5, 0.4)) * 25}px)`,
              filter: `blur(${Math.sin(replace * Math.PI) * 4}px)`,
            });
          })}
        </>
      );
      break;
    }
    case 50: {
      scene = (
        <>
          {words.map((s, i) =>
            label(
              s,
              150 - p(t, 3 + i * 0.14, 0.55) * 2300,
              120 + i * 175,
              1620,
              105,
              {
                color: i === 0 || i === 4 ? purple : ink,
                fontWeight: 700,
                letterSpacing: 12,
              },
            ),
          )}
        </>
      );
      break;
    }
  }
  return (
    <AbsoluteFill
      style={{
        background: overrides.background ?? "#fff",
        fontFamily: "MiSans, sans-serif",
        overflow: "hidden",
      }}
    >
      {scene}
    </AbsoluteFill>
  );
};
