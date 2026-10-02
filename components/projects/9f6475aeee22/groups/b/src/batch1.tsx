import {DARK_PURPLE,purpleOnDark,purpleOnSurface} from "../../../surface-purple.ts";
import {ProductSafeImage as Img} from "./ProductSafeImage";
import {cleanStaticFile as staticFile} from "./clean-assets";
import React from "react";
import {  interpolate, Easing } from "remotion";
import manifest from "../manifest.json";

export type Batch1Overrides = {
  words?: string[];
  texts?: string[];
  assets?: Record<string, string>;
  accent?: string;
  ink?: string;
  background?: string;
  timeScale?: number;
};
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const p = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
const linearProgress = (t: number, a: number, b: number) =>
  Math.max(0, Math.min(1, (t - a) / (b - a)));
const mix = (a: number, b: number, v: number) => a + (b - a) * v;
const soft = "9px 14px 25px #0002";
type Env = {
  t: number;
  d: number;
  w: string[];
  accent: string;
  ink: string;
  bg: string;
  assets: Record<string, string>;
};
const Box = ({
  x = 960,
  y = 540,
  w = 100,
  h = 100,
  children,
  style = {},
}: {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      transform: "translate(-50%,-50%)",
      ...style,
    }}
  >
    {children}
  </div>
);
const Text = ({
  text,
  x = 960,
  y = 540,
  size = 140,
  color = "#121214",
  width = 1800,
  progress = 1,
  style = {},
}: {
  text: string;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  width?: number;
  progress?: number;
  style?: React.CSSProperties;
}) => {
  const lines = text.split("\n");
  const units = Math.max(
    1,
    ...lines.map((line) =>
      Array.from(line).reduce(
        (sum, char) => sum + (/[\u0000-\u007f]/.test(char) ? 0.58 : 1),
        0,
      ),
    ),
  );
  const fontSize = Math.min(size, (width - 24) / units);
  return (
    <Box
      x={x}
      y={y}
      w={width}
      h={fontSize * (1.15 * lines.length + 0.5)}
      style={{
        fontSize,
        color,
        fontWeight: 700,
        display: "grid",
        placeItems: "center",
        whiteSpace: "pre",
        textAlign: "center",
        lineHeight: 1.15,
        clipPath: `inset(0 ${100 * (1 - progress)}% 0 0)`,
        ...style,
      }}
    >
      {text}
    </Box>
  );
};
const Asset = ({
  name,
  e,
  style = {},
}: {
  name: string;
  e: Env;
  style?: React.CSSProperties;
}) => (
  <Img
    src={staticFile(e.assets[name] || `batch1/${name}.jpg`)}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      filter: "grayscale(1)",
      ...style,
    }}
  />
);
const Window = ({
  children,
  x = 960,
  y = 540,
  w = 1320,
  h = 940,
  e,
  style = {},
}: {
  children?: React.ReactNode;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  e: Env;
  style?: React.CSSProperties;
}) => (
  <Box
    x={x}
    y={y}
    w={w}
    h={h}
    style={{
      borderRadius: 24,
      background: e.ink,
      overflow: "hidden",
      boxShadow: soft,
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 72,
        background: "#09090c",
        display: "flex",
        gap: 14,
        alignItems: "center",
        paddingLeft: 32,
      }}
    >
      {[e.accent, "#aaa", "#555"].map((c, i) => (
        <i
          key={i}
          style={{ width: 20, height: 20, background: c, borderRadius: 30 }}
        />
      ))}
    </div>
    {children}
  </Box>
);
const Pill = ({
  text,
  x = 960,
  y = 540,
  w = 1400,
  h = 330,
  e,
  progress = 1,
  fontSize = 150,
  style = {},
}: {
  text: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  e: Env;
  progress?: number;
  fontSize?: number;
  style?: React.CSSProperties;
}) => (
  <Box
    x={x}
    y={y}
    w={mix(Math.min(h, w), w, progress)}
    h={h}
    style={{
      borderRadius: Math.min(h * 0.33, 110),
      background: e.ink,
      boxShadow: soft,
      overflow: "hidden",
      ...style,
    }}
  >
    <Text
      text={text}
      x={mix(Math.min(h, w), w, progress) / 2}
      y={h / 2}
      width={w - 70}
      size={fontSize}
      color="white"
      progress={p(progress, 0.45, 1)}
    />
  </Box>
);
const Phone = ({
  e,
  x = 960,
  y = 520,
  s = 1,
  rotation = 0,
  bg = "white",
  children,
}: {
  e: Env;
  x?: number;
  y?: number;
  s?: number;
  rotation?: number;
  bg?: string;
  children?: React.ReactNode;
}) => (
  <Box
    x={x}
    y={y}
    w={440}
    h={930}
    style={{
      transform: `translate(-50%,-50%) scale(${s}) rotate(${rotation}deg)`,
      border: `12px solid ${e.ink}`,
      borderRadius: 85,
      background: bg,
      boxShadow: "inset 0 0 0 4px #aaa, 10px 12px 22px #0003",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 8,
        borderRadius: 65,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 20,
        width: 130,
        height: 34,
        borderRadius: 40,
        background: "#080808",
        transform: "translateX(-50%)",
      }}
    />
  </Box>
);
const Line = ({
  x1,
  y1,
  x2,
  y2,
  v = 1,
  color = "#121214",
  dash = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  v?: number;
  color?: string;
  dash?: boolean;
}) => (
  <svg
    style={{
      position: "absolute",
      inset: 0,
      width: 1920,
      height: 1080,
      overflow: "visible",
    }}
  >
    <path
      d={`M${x1} ${y1} L${mix(x1, x2, v)} ${mix(y1, y2, v)}`}
      stroke={color}
      strokeWidth={9}
      strokeDasharray={dash ? "22 24" : undefined}
      fill="none"
    />
  </svg>
);

function IconPair(e: Env) {
  const { t, w } = e;
  const pair = p(t, 2.4, 2.95),
    exit = p(t, 6.05, 6.65);
  return (
    <>
      {t < 1 && (
        <Box
          x={960}
          y={540}
          w={1000}
          h={1080}
          style={{
            transform: `translate(-50%,-50%) translateX(${-1600 * linearProgress(t, 0.68, 0.98)}px)`,
          }}
        >
          <Asset name="actor-one" e={e} />
        </Box>
      )}
      {t > 5.7 && (
        <Box w={1920} h={1080} style={{ opacity: p(t, 5.7, 6.2) }}>
          <Asset name="page-one" e={e} />
        </Box>
      )}
      {[0, 1].map((i) => {
        const a = p(t, i ? 2.4 : 0.6, i ? 2.95 : 0.95);
        const x = i ? 1280 : mix(960, 640, pair);
        return (
          <Box
            key={i}
            x={x + (i ? 1 : -1) * 1600 * exit}
            y={540}
            w={580}
            h={580}
            style={{
              background: e.ink,
              borderRadius: 105,
              boxShadow: soft,
              transform: `translate(-50%,-50%) perspective(1500px) rotateY(${90 * (1 - a)}deg)`,
              visibility: a === 0 ? "hidden" : "visible",
            }}
          >
            <svg
              width={380}
              height={370}
              viewBox="0 0 200 200"
              style={{ position: "absolute", left: 100, top: 45 }}
              fill="none"
              stroke={e.accent}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {i === 0 ? (
                <>
                  <path d="M100 8 175 50v92l-75 47-75-47V50z" />
                  <path d="M74 65 110 80v50L74 145V65 M110 80l27 8v34l-27 8 M45 76h29 M45 95h29 M45 114h29 M45 133h29 M138 94h21 M138 106h21 M138 118h21" />
                  {[76, 95, 114, 133].map((y) => (
                    <circle key={y} cx={40} cy={y} r={3} />
                  ))}
                </>
              ) : (
                <>
                  <path d="M100 50 145 78v55l-45 28-45-28V78z M55 78l45 29 45-29 M100 107v54 M100 10v40 M100 160v34 M55 130l-39 24 M145 132l39 25 M30 116V65l49-31 M169 116V65l-49-31" />
                  <path d="M100 35 159 68v70l-59 37-59-37V68z" />
                </>
              )}
            </svg>
            <Text
              text={w[i]}
              x={290}
              y={492}
              width={560}
              size={57}
              color="white"
            />
          </Box>
        );
      })}
    </>
  );
}
function PillExpand(e: Env) {
  const { t } = e;
  const v = p(t, 1.05, 1.9),
    cover = p(t, 4.74, 5.25);
  return (
    <>
      {t < 1.2 &&
        [0, 1].map((i) => (
          <Box
            key={i}
            x={480 + i * 960 + (i ? 1 : -1) * 2100 * linearProgress(t, 0.65, 1.1)}
            y={540}
            w={960}
            h={540}
            style={{ borderRadius: 38, overflow: "hidden", boxShadow: soft }}
          >
            <Asset name={i ? "film-right" : "film-left"} e={e} />
          </Box>
        ))}
      {t >= 0.68 && (
        <Box
          w={mix(mix(320, 1500, v), 2400, cover)}
          h={mix(350, 1600, cover)}
          style={{
            background: e.ink,
            borderRadius: mix(175, 120, v),
            boxShadow: soft,
          }}
        >
          <Text
            text={e.w[0]}
            x={mix(mix(320, 1500, v), 2400, cover) / 2}
            y={mix(350, 1600, cover) / 2}
            width={1400}
            size={165}
            color="white"
            progress={p(t, 1.9, 2.4)}
            style={{ visibility: cover > 0.15 ? "hidden" : "visible" }}
          />
          <div
            style={{
              position: "absolute",
              height: 10,
              bottom: 56,
              left: 110,
              width: 1280 * p(t, 2.45, 3),
              background: e.accent,
            }}
          />
        </Box>
      )}
    </>
  );
}
function BrandBranches(e: Env) {
  const { t, w } = e;
  const lift = p(t, 5.35, 5.85),
    exit = p(t, 10.45, 10.95);
  return (
    <>
      {t < 2.7 && (
        <Text
          text={w[0]}
          size={235}
          progress={1}
          style={{
            transform: `translate(-50%,-50%) scale(${mix(3.7, 1, p(t, 0, 0.23))}) translateY(${450 * p(t, 2.25, 2.7)}px)`,
            color: e.ink,
          }}
        />
      )}
      {t >= 2.5 && (
        <>
          <Box
            x={960}
            y={mix(510, 250, lift)}
            w={1360}
            h={300}
            style={{
              transform: `translate(-50%,-50%) scale(${mix(0.7, 1, p(t, 2.5, 3))})`,
            }}
          >
            <Box x={155} y={150} w={280} h={280}>
              <Asset
                name="squilla-logo"
                e={e}
                style={{ objectFit: "contain" }}
              />
            </Box>
            <Text
              text={w[1]}
              x={850}
              y={150}
              width={1050}
              size={184}
              color={e.ink}
              style={{ fontStyle: "italic", letterSpacing: -8 }}
            />
          </Box>
          {[0, 1, 2, 3].map((i) => {
            const a = p(t, 5.6 + i * 0.55, 6.1 + i * 0.55) * (1 - exit);
            return (
              <React.Fragment key={i}>
                <Line
                  x1={650 + i * 220}
                  y1={420}
                  x2={320 + i * 430}
                  y2={670}
                  v={a}
                  color={e.accent}
                  dash
                />
                <Box
                  x={320 + i * 430}
                  y={780 + 500 * exit}
                  w={i === 2 ? 360 : 210}
                  h={210}
                  style={{ transform: `translate(-50%,-50%) scale(${a})` }}
                >
                  {i === 2 ? (
                    <Text text={w[2]} x={180} y={105} width={400} size={82} />
                  ) : (
                    <Asset
                      name={
                        i === 0
                          ? "model-deepseek"
                          : i === 1
                            ? "model-kimi"
                            : "model-four"
                      }
                      e={e}
                      style={{ objectFit: "contain" }}
                    />
                  )}
                </Box>
              </React.Fragment>
            );
          })}
          {t > 8.4 && (
            <Box
              w={1780}
              h={835}
              style={{
                border: `8px solid ${e.accent}`,
                clipPath: `inset(0 ${100 * (1 - p(t, 8.4, 8.9))}% 0 0)`,
                visibility: exit > 0.1 ? "hidden" : "visible",
              }}
            />
          )}
        </>
      )}
    </>
  );
}
function WindowTitle(e: Env, mode: 4 | 16 | 17 | 22) {
  const { t, w } = e;
  const out =
    mode === 4
      ? linearProgress(t, 3, 3.25)
      : mode === 16
        ? Math.min(0.65, p(t, 4.05, 4.45))
        : mode === 17
          ? Math.min(0.65, p(t, 4.5, 5))
          : p(t, 3.1, 3.5);
  const wy = 540 - out * 1400;
  return (
    <>
      {mode === 4 && t > 3.3 && (
        <Box w={1920} h={1080}>
          <Asset name="page-four" e={e} />
        </Box>
      )}
      {mode === 17 && t < 0.5 && (
        <Box w={1920} h={1080}>
          <Asset name="document-seventeen" e={e} />
        </Box>
      )}
      <Window
        e={e}
        y={wy}
        w={mode === 17 ? 1760 : 1320}
        style={{
          transform: `translate(-50%,-50%) scale(${mode === 17 ? mix(0.95, 1, p(t, 0.1, 0.55)) : 1})`,
          visibility: mode === 17 && t < 0.12 ? "hidden" : "visible",
        }}
      >
        {mode === 4 ? (
          <Text
            text={w[0]}
            x={660}
            y={470}
            width={1200}
            size={164}
            color="white"
            progress={p(t, 0.02, 0.45)}
          />
        ) : mode === 16 ? (
          <>
            {w.map((x, i) => (
              <Text
                key={i}
                text={x}
                x={660}
                y={342 + i * 350}
                width={1230}
                size={145}
                color="white"
                progress={i ? p(t, 1.4, 1.95) : 1}
              />
            ))}
            <div
              style={{
                position: "absolute",
                bottom: 115,
                left: 100,
                width: 260,
                height: 9,
                background: e.accent,
              }}
            />
          </>
        ) : mode === 22 ? (
          <>
            {w.map((x, i) => (
              <Text
                key={i}
                text={x}
                x={660}
                y={290 + i * 230}
                width={1200}
                size={i === 1 ? 170 : 148}
                color={i === 1 ? e.accent : "white"}
                progress={p(t, i * 0.65, i * 0.65 + 0.35)}
              />
            ))}
          </>
        ) : (
          <>
            <Text text={w[0]} x={880} y={125} size={100} color="white" />
            {w.slice(1).map((x, i) => (
              <React.Fragment key={i}>
                <Text
                  text={x}
                  x={275 + i * 600}
                  y={530}
                  width={520}
                  size={94}
                  color="white"
                  progress={p(t, 0.8 + i * 0.4, 1.25 + i * 0.4)}
                />
                {i < 2 && (
                  <Text
                    text="⟶"
                    x={575 + i * 600}
                    y={530}
                    width={170}
                    size={135}
                    color={e.accent}
                    progress={p(t, 1.05 + i * 0.4, 1.4 + i * 0.4)}
                  />
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </Window>
    </>
  );
}
function DocumentFocus(e: Env) {
  const { t, w } = e;
  const blur = 14 * p(t, 0.25, 0.9),
    replace = p(t, 2.6, 3.15);
  return (
    <>
      <Box w={1920} h={1080} style={{ filter: `blur(${blur}px)` }}>
        <Asset name="document-five" e={e} />
      </Box>
      {t < 3.15 && (
        <div style={{ transform: `translateY(${-1200 * replace}px)` }}>
          <Text text={w[0]} y={310} size={230} progress={p(t, 0.3, 0.8)} />
          <Text text={w[1]} y={790} size={230} progress={p(t, 1.45, 1.95)} />
        </div>
      )}
      {t > 2.8 && (
        <>
          <Text text={w[2]} y={540} size={210} progress={p(t, 2.8, 3.2)} />
          <Box
            y={690}
            w={980 * p(t, 3.15, 3.65)}
            h={12}
            style={{ background: e.accent }}
          />
        </>
      )}
    </>
  );
}
function Shape({
  e,
  at,
  x,
  y,
  w,
  h,
  kind = 0,
}: {
  e: Env;
  at: number;
  x: number;
  y: number;
  w: number;
  h: number;
  kind?: number;
}) {
  const v = p(e.t, at, at + 0.45);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: kind === 1 ? 200 : 25,
        background: kind === 1 ? "#d2b8f2" : kind === 2 ? e.accent : "#fff",
        border: "3px solid #bdb6c8",
        transform: `scale(${v})`,
        boxShadow: "0 2px 5px #0001",
      }}
    />
  );
}
function DeviceWorkflow(e: Env, n: number) {
  const t = e.t + (n === 6 ? 57 : 70),
    z = { ...e, t };
  const turn = p(t, 56.35, 57.7),
    back = p(t, 62, 63),
    rot = -70 * turn * (1 - back),
    scale = mix(1, 1.75, turn) * (1 - 0.42857 * back);
  if (t < 64.5)
    return (
      <Phone e={e} rotation={rot} s={scale}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `rotate(${-rot}deg)`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            visibility: back > 0.8 ? "hidden" : "visible",
          }}
        >
          {e.w.slice(0, 3).map((text, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <span
                  style={{
                    fontSize: 30,
                    clipPath: `inset(0 ${100 * (1 - p(t, 58.9 + (i - 1) * 1.1, 59.3 + (i - 1) * 1.1))}% 0 0)`,
                  }}
                >
                  ➜
                </span>
              )}
              <div
                style={{
                  width: 210,
                  height: 76,
                  background: e.ink,
                  color: "white",
                  borderRadius: 7,
                  fontSize: 25,
                  whiteSpace: "nowrap",
                  display: "grid",
                  placeContent: "center",
                  boxShadow: soft,
                  transform: `scaleX(${p(t, 57.6 + i * 1.35, 58.1 + i * 1.35)})`,
                  flexShrink: 0,
                  borderBottom: `4px solid ${e.accent}`,
                }}
              >
                {text}
              </div>
            </React.Fragment>
          ))}
        </div>
      </Phone>
    );
  if (t < 70.8) {
    const slide = p(t, 64.5, 65.2),
      exit = p(t, 69.7, 70.8);
    return (
      <>
        <Phone e={e} x={mix(mix(960, 520, slide), 960, exit)}><Asset name="device-workflow" e={e} /></Phone>
        <Window
          e={e}
          x={mix(2600, 1340, slide) + exit * 1900}
          y={610}
          w={940}
          h={680}
        >
          <div
            style={{
              fontSize: 88,
              color: "white",
              fontWeight: 700,
              padding: "200px 55px 0",
              lineHeight: 1.05,
            }}
          >
            {(n === 6 ? e.w[3] : e.w[0]).slice(
              0,
              Math.ceil(p(t, 66.1, 68.5) * 18),
            )}
          </div>
        </Window>
      </>
    );
  }
  const second = p(t, 75.2, 76.6),
    third = p(t, 82, 83),
    end = p(t, 86.1, 87.1),
    leave = Math.min(0.22, p(t, 88.3, 89.2));
  return (
    <>
      <Phone
        e={e}
        x={mix(960, 310, second)}
        y={520 + leave * 1300}
        s={mix(1, 0.77, second) + end * 0.1}
        bg={t >= 71.15 ? "#f3eff8" : "white"}
      >
        <Shape e={z} at={72.4} x={102} y={170} w={190} h={190} kind={1} />
        <Shape e={z} at={73.8} x={36} y={450} w={324} h={55} kind={2} />
      </Phone>
      {second > 0 && (
        <Phone
          e={e}
          x={mix(2200, 960, second) + third * 650}
          y={520 + leave * 1100}
          s={mix(1, 0.75, third) + end * 0.12}
          bg="#efedf3"
        >
          {[
            [78.1, 90, 230],
            [79, 350, 125],
            [80.7, 680, 120],
          ].map(([a, y, h], i) => (
            <Shape
              key={i}
              e={z}
              at={a}
              x={28}
              y={y}
              w={340}
              h={h}
              kind={i === 1 ? 1 : 0}
            />
          ))}
          <Shape e={z} at={79.75} x={28} y={505} w={154} h={130} kind={2} />
          <Shape e={z} at={80.1} x={210} y={505} w={158} h={130} />
        </Phone>
      )}
      {third > 0 && (
        <Phone
          e={e}
          x={960}
          y={mix(-650, 520, third) - leave * 1300}
          s={1 - end * 0.13}
          bg="#e9dff3"
        >
          <Shape e={z} at={83.3} x={87} y={475} w={215} h={215} kind={1} />
          <Shape e={z} at={84.6} x={50} y={100} w={290} h={245} />
          <Shape e={z} at={85.5} x={122} y={775} w={160} h={80} kind={2} />
        </Phone>
      )}
    </>
  );
}
function AppDemo(e: Env) {
  const { t } = e;
  const i =
    t < 0.25
      ? 0
      : t < 1.5
        ? 1
        : t < 2.7
          ? 2
          : t < 3.5
            ? 3
            : t < 4.7
              ? 4
              : t < 5.8
                ? 5
                : 6;
  return (
    <>
      <Box w={1800} h={1020} style={{ filter: "blur(18px)", opacity: 0.25 }}>
        <Asset name="app-eight-6" e={e} />
      </Box>
      <Window e={e} w={1380} h={960} y={535}>
        <div
          style={{
            position: "absolute",
            left: 18,
            right: 18,
            top: 92,
            bottom: 18,
            overflow: "hidden",
            borderRadius: 22,
            background: "#fff",
          }}
        >
          {t < 7.6 ? (
            <Asset name={`app-eight-${i}`} e={e} />
          ) : (
            <>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 900,
                  height: 850,
                  transform: `translateY(${-50 * p(t, 7.6, 8.2)}px)`,
                }}
              >
                <Asset
                  name={t < 9.6 ? "app-eight-result" : "app-eight-citations"}
                  e={e}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <Text
                text={t < 9.6 ? "随时\n记录" : "随时\n找回"}
                x={1075}
                y={360}
                width={440}
                size={145}
                color={e.accent}
                progress={p(t, t < 9.6 ? 7.65 : 9.65, t < 9.6 ? 8 : 10)}
              />
            </>
          )}
        </div>
      </Window>
    </>
  );
}
function PromptBody({ e, focus = false }: { e: Env; focus?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 150,
        right: 75,
        fontSize: 58,
        lineHeight: 1.14,
        fontWeight: 700,
        color: "white",
        filter: focus ? "blur(14px)" : undefined,
      }}
    >
      {e.w.map((s, i) => (
        <div key={i}>{s}</div>
      ))}
    </div>
  );
}
function PromptFocus(e: Env) {
  const { t } = e;
  const focus = p(t, 3.4, 3.85) * (1 - p(t, 9.4, 9.85));
  const keys = [
    "【会议】",
    "【待办】",
    "【项目】",
    "【时间】",
    "【讨论主题】",
    "【参与成员】",
    "【确认事项】",
    "【后续待办】",
    "【清单格式】",
    "【知识库】",
  ];
  return (
    <>
      {t < 0.6 &&
        [0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            x={(i % 2 ? 1400 : 420) + (i % 2 ? 1 : -1) * 1600 * linearProgress(t, 0, 0.45)}
            y={i < 2 ? 240 : 760}
            w={820}
            h={450}
            style={{ borderRadius: 25, overflow: "hidden", boxShadow: soft }}
          >
            <Asset name={`prior-nine-${i}`} e={e} />
          </Box>
        ))}
      <Window e={e} y={mix(-800, 540, p(t, 0.22, 0.65))}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(0 ${100 * (1 - p(t, 0.7, 1.05))}% 0 0)`,
          }}
        >
          <PromptBody e={e} focus={focus > 0.1} />
        </div>
        {focus > 0 && (
          <div
            style={{
              position: "absolute",
              left: 410,
              top: 95,
              width: 500,
              fontSize: 59,
              color: DARK_PURPLE,
              lineHeight: 1.36,
              fontWeight: 700,
              textAlign: "center",
              transform: `translateX(${(1 - focus) * 230}px)`,
              opacity: focus,
            }}
          >
            {keys.map((x) => (
              <div key={x}>{x}</div>
            ))}
          </div>
        )}
      </Window>
    </>
  );
}
function WordRows(e: Env) {
  const { t, w } = e;
  return (
    <>
      {t < 0.35 && (
        <Box
          w={420}
          h={420}
          style={{
            transform: `translate(-50%,-50%) scale(${1 - p(t, 0, 0.35)})`,
          }}
        >
          <Asset name="octopus" e={e} />
        </Box>
      )}
      {w.map((s, i) => {
        const a = i < 4 ? 0.2 + i * 0.8 : 5.3 + (i - 4) * 0.55;
        const v = p(t, a, a + 0.5);
        return (
          <Text
            key={s}
            text={s}
            x={i < 4 ? 280 + i * 450 : 480 + (i - 4) * 480}
            y={(i < 4 ? 320 : 790) - 350 * (1 - v)}
            size={134}
            width={450}
            style={{
              transform: `translate(-50%,-50%) rotate(${mix(-12, 0, v)}deg)`,
              visibility: t < a ? "hidden" : "visible",
              opacity: 1 - Math.min(0.96, linearProgress(t, 7.8, 8.2)),
            }}
          />
        );
      })}
      {t > 8.1 && (
        <Box
          x={520}
          y={820}
          w={720}
          h={760}
          style={{
            transform: `translate(-50%,-50%) translateY(${700 * (1 - p(t, 8.1, 8.5))}px)`,
          }}
        >
          <Asset name="actor-ten" e={e} />
        </Box>
      )}
    </>
  );
}
function MediaGrid(e: Env, n: 11 | 12) {
  const { t } = e;
  const times = n === 11 ? [-1, 1.4, 3.5, 4.5] : [-1, 0.25, 0.85, 1.65],
    hide = n === 12 ? p(t, 4.4, 4.85) : 0,
    focus = n === 11 ? p(t, 6.5, 6.9) * (1 - p(t, 9.8, 10.35)) : 0;
  return (
    <>
      <div style={{ filter: `blur(${focus * 18}px)` }}>
        {times.map((a, i) => {
          const v = p(t, a, a + 0.5);
          return (
            <Box
              key={i}
              x={60 + 435 + (i % 2) * 950 + (i % 2 ? 1 : -1) * 1600 * hide}
              y={20 + 240 + Math.floor(i / 2) * 535}
              w={870}
              h={480}
              style={{
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: soft,
                transform: `translate(-50%,-50%) perspective(1400px) rotateY(${(1 - v) * 90}deg)`,
                visibility: t < a ? "hidden" : "visible",
              }}
            >
              <Asset
                name={`grid-${n}-${i}-${n === 11 ? (t < 10 ? 0 : t < 12 ? 1 : 2) : t < 2.6 ? 0 : 1}`}
                e={e}
              />
            </Box>
          );
        })}
      </div>
      {focus > 0 && (
        <Box w={1450} h={980} style={{ opacity: focus }}>
          <div
            style={{
              fontSize: 67,
              lineHeight: 1.13,
              fontWeight: 700,
              color: e.ink,
              background: "transparent",
              padding: 40,
            }}
          >
            {e.w.map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </div>
        </Box>
      )}
      {n === 12 && t > 4.5 && (
        <RoleGroup
          e={e}
          name="roles-twelve"
          start={4.6}
          exit={7.75}
          labels={e.w}
        />
      )}
    </>
  );
}
function CapabilityGrid(e: Env) {
  const { t, w } = e;
  return (
    <div style={{ filter: t > 7.2 ? `blur(${p(t, 7.2, 7.5) * 5}px)` : "none" }}>
      {w.map((s, i) => {
        const a = Math.floor(i / 3) * 0.22 + (i % 3) * 0.09;
        const appear = p(t + 0.08, a, a + 0.22),
          expand = p(t, a + 0.23, a + 0.7);
        return (
          <Box
            key={i}
            x={360 + (i % 3) * 600}
            y={90 + Math.floor(i / 3) * 175}
            w={mix(150, 500, expand)}
            h={145}
            style={{
              background: e.ink,
              borderRadius: 55,
              boxShadow: soft,
              transform: `translate(-50%,-50%) scale(${appear})`,
              overflow: "hidden",
              contain: "paint",
              isolation: "isolate",
            }}
          >
            <Text
              text={s}
              x={mix(150, 500, expand) / 2}
              y={72}
              width={480}
              size={109}
              color={i >= 8 && i <= 11 ? "#d2b8f2" : "white"}
              progress={p(t, 2.45 + i * 0.1, 2.75 + i * 0.1)}
            />
            {i >= 12 && (
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 50,
                  right: 50,
                  height: 4,
                  background: e.accent,
                  transform: `scaleX(${p(t, 3.8, 4.5)})`,
                }}
              />
            )}
          </Box>
        );
      })}
    </div>
  );
}
function ChatChapter(e: Env) {
  const { t, w } = e;
  const scroll =
    245 * p(t, 5.4, 6.3) + 255 * p(t, 6.4, 7) + 290 * p(t, 10.35, 10.9);
  return (
    <>
      {t < 16.7 && (
        <>
          <Box
            w={1840}
            h={1010}
            style={{
              filter: "blur(16px)",
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            <Asset name="workflow-fifteen" e={e} />
          </Box>
          <div style={{ transform: `translateY(${-scroll}px)` }}>
            {w.slice(0, 6).map((s, i) => {
              const a = [-1, -1, 1.1, 5.4, 6.4, 10.4][i],
                v = p(t, a, a + 0.4),
                right = i === 1 || i === 2;
              const bw = [590, 500, 1230, 350, 940, 950][i];
              return (
                <Box
                  key={i}
                  x={
                    (right ? 1840 - bw / 2 : 60 + bw / 2) +
                    (right ? 1 : -1) * 1300 * (1 - v)
                  }
                  y={140 + i * 235}
                  w={bw}
                  h={185}
                  style={{
                    borderRadius: 100,
                    background: right ? "white" : "#d2b8f2",
                    boxShadow: soft,
                  }}
                >
                  <Text text={s} x={bw / 2} y={93} width={bw - 55} size={104} />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      [right ? "right" : "left"]: -25,
                      width: 75,
                      height: 60,
                      background: right ? "white" : "#d2b8f2",
                      clipPath: right
                        ? "polygon(0 0,100% 100%,0 90%)"
                        : "polygon(100% 0,0 100%,100% 90%)",
                    }}
                  />
                </Box>
              );
            })}
          </div>
        </>
      )}
      {t > 16.1 && (
        <Box
          w={1920}
          h={1080}
          style={{
            background: e.bg,
            transform: `translate(-50%,-50%) translateX(${1920 * (1 - p(t, 16.1, 16.7))}px)`,
          }}
        >
          <Pill text={w[6]} e={e} w={1000} h={290} fontSize={220} />
        </Box>
      )}
    </>
  );
}
function Equation(e: Env) {
  const { t, w } = e;
  const s = p(t, 4.35, 4.9),
    out = p(t, 10.65, 11.15);
  return (
    <>
      <Box
        w={1840}
        h={1010}
        style={{
          borderRadius: 22,
          overflow: "hidden",
          filter: `blur(${12 * p(t, 0.1, 0.8) * (1 - out)}px)`,
        }}
      >
        <Asset name="workflow-fifteen" e={e} />
      </Box>
      {out < 1 && (
        <div style={{ transform: `translateY(${-1300 * out}px)` }}>
          <Text
            text={w[0]}
            x={mix(960, 460, s)}
            y={mix(530, 440, s)}
            size={mix(220, 143, s)}
            width={mix(1800, 1000, s)}
            color="white"
            progress={p(t, 0.8, 1.9)}
          />
          {s > 0 && (
            <>
              <Text
                text={w[1]}
                x={1175}
                y={440}
                size={143}
                width={500}
                color="white"
                progress={s}
              />
              <Text
                text={w[4]}
                x={1175}
                y={715}
                size={155}
                width={450}
                color="#d2b8f2"
                progress={s}
              />
            </>
          )}
          <Text
            text={w[3]}
            x={460}
            y={715}
            size={160}
            width={400}
            color="#d2b8f2"
            progress={p(t, 6.45, 6.9)}
          />
          <Text
            text={w[2]}
            x={1660}
            y={440}
            size={143}
            width={400}
            color="white"
            progress={p(t, 8.5, 9)}
          />
          <Text
            text={w[5]}
            x={1660}
            y={715}
            size={160}
            width={300}
            color="#d2b8f2"
            progress={p(t, 8.7, 9.2)}
          />
          <Text
            text={w[6]}
            x={800}
            y={715}
            size={160}
            width={200}
            color="#d2b8f2"
            progress={p(t, 9.5, 9.9)}
          />
          <Text
            text={w[7]}
            x={1430}
            y={715}
            size={145}
            width={160}
            color="#d2b8f2"
            progress={p(t, 9.6, 10)}
          />
        </div>
      )}
    </>
  );
}
function VerticalCaps(e: Env) {
  const { t } = e;
  const shifted = p(t, 3.4, 4) * (1 - p(t, 8, 8.6)),
    x = mix(960, 400, shifted);
  return (
    <>
      {t < 1.8 && (
        <Box
          w={2200}
          h={1500}
          style={{
            background: e.ink,
            transform: `translate(-50%,-50%) rotate(${mix(-15, 0, p(t, 0, 0.45))}deg) scale(${1 - p(t, 1.4, 1.8)})`,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <Box
              key={i}
              x={1100}
              y={310 + i * 265}
              w={640 * p(t, 0.4 + i * 0.15, 0.7 + i * 0.15)}
              h={20}
              style={{ background: "white", borderRadius: 100 }}
            />
          ))}
        </Box>
      )}
      {t > 1.4 &&
        [0, 1, 2, 3].map((i) => (
          <Pill
            key={i}
            e={e}
            x={x}
            y={135 + i * 260}
            w={640}
            h={190}
            fontSize={110}
            text={["随时记录", "内容整理", "按需检索", "再次使用"][i]}
            progress={p(t, 1.4 + i * 0.12, 2 + i * 0.12)}
            style={{
              transform: `translate(-50%,-50%) scale(${p(t, 1.4, 1.85)})`,
            }}
          />
        ))}
      {t >= 3.4 && t < 5.6 && (
        <Box
          x={mix(2500, 1310, p(t, 3.4, 4))}
          y={540}
          w={1100}
          h={610}
          style={{
            borderRadius: 42,
            overflow: "hidden",
            transform: `translate(-50%,-50%) translateX(${1600 * p(t, 5.15, 5.6)}px)`,
          }}
        >
          <Asset name="workflow-eighteen" e={e} />
        </Box>
      )}
      {t > 5.25 && t < 8.5 && (
        <Text
          text={e.w[1]}
          x={1290}
          y={520}
          size={230}
          width={1100}
          progress={p(t, 5.25, 5.65)}
          style={{
            transform: `translate(-50%,-50%) translateY(${-1500 * p(t, 8, 8.5)}px)`,
          }}
        />
      )}
      {t > 8.35 && (
        <Box
          x={330}
          y={620}
          w={560}
          h={510}
          style={{
            transform: `translate(-50%,-50%) scale(${p(t, 8.35, 8.8)})`,
          }}
        >
          <Asset name="gpu-left" e={e} style={{ objectFit: "contain" }} />
        </Box>
      )}
      {t > 9.35 && (
        <Box
          x={1590}
          y={620}
          w={560}
          h={510}
          style={{
            transform: `translate(-50%,-50%) scale(${p(t, 9.35, 9.85)})`,
          }}
        >
          <Asset name="gpu-right" e={e} style={{ objectFit: "contain" }} />
        </Box>
      )}
    </>
  );
}
function ImageCategories(e: Env) {
  const { t, w } = e;
  const up = p(t, 2.25, 2.85) * (1 - p(t, 7.5, 8)),
    replace = p(t, 8.5, 9.2),
    out = Math.min(0.55, p(t, 12.35, 13));
  return (
    <>
      {[0, 1, 2].map((i) => {
        const v = p(
            t,
            i === 1 ? -0.3 : i === 0 ? 0.4 : 1.35,
            i === 1 ? 0.1 : i === 0 ? 0.9 : 1.8,
          ),
          ri = p(t, 8.5 + i * 0.3, 9.15 + i * 0.3);
        return (
          <Box
            key={i}
            x={355 + i * 600}
            y={mix(540, 390, up) - out * 1400}
            w={470}
            h={720}
            style={{
              borderRadius: 70,
              overflow: "hidden",
              boxShadow: soft,
              background: e.ink,
              transform: `translate(-50%,-50%) scale(${mix(0.9, 1, v) * (1 - 0.14 * up)})`,
            }}
          >
            {ri < 1 && <Asset name={`category-${i}`} e={e} />}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: e.ink,
                opacity: ri,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 265,
                height: 205,
                background: e.ink,
              }}
            />
            <Text
              text={ri > 0.5 ? w[6 + i].replace(/(理解力|表现力|编辑力)$/, "\n$1") : w[i]}
              x={235}
              y={370}
              width={435}
              size={ri > 0.5 ? 125 : 155}
              color="white"
              progress={v}
            />
          </Box>
        );
      })}
      {up > 0 && (
        <>
          <Text
            text={w[3]}
            x={mix(960, 500, p(t, 4.65, 5.2))}
            y={920}
            width={920}
            size={145}
            progress={p(t, 2.3, 2.9)}
          />
          <Text
            text={w[4]}
            x={1490}
            y={920}
            width={810}
            size={133}
            color={e.ink}
            progress={p(t, 4.7, 5.3)}
          />
          <Text
            text={w[5]}
            x={990}
            y={920}
            width={150}
            size={145}
            progress={p(t, 5.3, 5.8)}
          />
        </>
      )}
    </>
  );
}
function ImageWall(e: Env) {
  const { t } = e;
  const grid = p(t, 13.35, 14),
    track =
      p(t, 1.5, 2.6) * 640 + Math.max(0, Math.min(8, (t - 5.5) * 1.13)) * 615;
  return (
    <>
      {Array.from({ length: 11 }, (_, i) => {
        let x = 960 + i * 615 - track,
          y = 540,
          w = 560,
          h = 1000;
        const final = [8, 9, 10, 0, 6, 3].indexOf(i);
        if (grid > 0) {
          if (final < 0) {
            y = mix(540, -1200, grid);
          } else {
            x = mix(x, 340 + (final % 3) * 620, grid);
            y = mix(540, 340 + Math.floor(final / 3) * 680, grid);
            h = mix(1000, 640, grid);
          }
        }
        return (
          <Box
            key={i}
            x={x}
            y={y}
            w={w}
            h={h}
            style={{
              borderRadius: 46,
              overflow: "hidden",
              boxShadow: soft,
              visibility:
                i === 0 || t > 1.5 + (i - 1) * 0.03 ? "visible" : "hidden",
            }}
          >
            <Asset name={`art-${i}`} e={e} />
          </Box>
        );
      })}
    </>
  );
}
function RoleGroup({
  e,
  name,
  start,
  exit,
  labels,
}: {
  e: Env;
  name: string;
  start: number;
  exit: number;
  labels: string[];
}) {
  const { t } = e;
  const v = p(t, start, start + 0.5),
    out = Math.min(
      name === "roles-twentyone" ? 0.7 : 0.85,
      p(t, exit, exit + 0.65),
    );
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateY(${name === "roles-twentyone" ? 0 : (1 - v) * 1200}px)`,
        opacity: (1 - out) * (name === "roles-twentyone" ? v : 1),
      }}
    >
      <Box x={960} y={770} w={1420} h={820} style={{ overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Asset name={name} e={e} style={{ objectFit: "contain" }} />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 440,
              height: 132,
              background: e.bg,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: 460,
              height: 132,
              background: e.bg,
            }}
          />
        </div>
      </Box>
      {labels.map((s, i) => (
        <Text
          key={i}
          text={s}
          x={i === 0 ? 960 : i === 1 ? 510 : 1390}
          y={i === 0 ? 220 : 360}
          width={450}
          size={115}
          color={i === 0 ? e.accent : e.ink}
          progress={p(
            t,
            start + (i === 0 ? 0 : 0.6 + (i - 1) * 0.35),
            start + (i === 0 ? 0.4 : 1 + (i - 1) * 0.35),
          )}
        />
      ))}
    </div>
  );
}
function ThreeRoles(e: Env) {
  return (
    <>
      {e.t < 1 && (
        <Box
          w={1920}
          h={1080}
          style={{
            opacity: 1 - linearProgress(e.t, 0.5, 0.95),
          }}
        >
          <Asset name="actor-scene" e={e} />
        </Box>
      )}
      <RoleGroup
        e={e}
        name="roles-twentyone"
        start={0.8}
        exit={3.55}
        labels={[e.w[1], e.w[0], e.w[2]]}
      />
    </>
  );
}
function PhoneMedia({
  e,
  name,
  x,
  y = 540,
  s = 1,
  blur = 0,
}: {
  e: Env;
  name: string;
  x: number;
  y?: number;
  s?: number;
  blur?: number;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)` }}>
      <Phone e={e} x={x} y={y} s={s}>
        <Asset name={name} e={e} style={{ objectFit: "fill" }} />
      </Phone>
    </div>
  );
}
function DeviceFocus(e: Env) {
  const { t, w } = e;
  const blur = 15 * p(t, 2.3, 2.9) * (1 - p(t, 4.9, 5.45)),
    exit = p(t, 5.35, 6.1);
  return (
    <>
      {[0, 1].map((i) => (
        <PhoneMedia
          key={i}
          e={e}
          name={`phone23-${i}`}
          x={600 + i * 730}
          y={520 - exit * (i ? 500 : 1500)}
          blur={blur}
        />
      ))}
      {t < 5.3 &&
        w.map((s, i) => (
          <Text
            key={i}
            text={s}
            x={535 + i * 850}
            y={530}
            width={900}
            size={172}
            color="#d2b8f2"
            progress={p(t, 2.5 + i * 0.8, 2.95 + i * 0.8)}
            style={{
              transform: `translate(-50%,-50%) translateY(${-1300 * p(t, 4.8, 5.3)}px)`,
            }}
          />
        ))}
    </>
  );
}
function ThreePhones(e: Env) {
  const { t } = e;
  const spread = p(t, 1.4, 3.1),
    leave = Math.min(0.48, p(t, e.t > 12 ? 17.5 : 6.2, e.t > 12 ? 18.3 : 7.0));
  return (
    <>
      {[0, 2, 1].map((i) => (
        <PhoneMedia
          key={i}
          e={e}
          name={i === 1 && t > 5.7 ? "phone24-food" : `phone24-${i}`}
          x={960 + (i - 1) * 580 * spread}
          y={520 - (i === 0 ? 1.5 : i === 1 ? 1 : 1.3) * 1200 * leave}
        />
      ))}
    </>
  );
}
function BranchLabels(e: Env) {
  const { t, w } = e;
  const rise = p(t, 0.65, 1.2),
    scale = mix(1, 0.3, p(t, 7.1, 8.15)),
    leave = p(t, 8.35, 8.75);
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${scale})`,
          opacity: 1 - leave,
        }}
      >
        <Pill
          e={e}
          text={w[0]}
          x={960}
          y={mix(540, 200, rise)}
          w={720}
          h={185}
          fontSize={132}
          progress={p(t, 0, 0.6)}
        />
        {w.slice(1).map((s, i) => {
          const a = 1.3 + i * 0.75,
            v = p(t, a, a + 0.5),
            x = 260 + i * 280,
            y = i < 2 ? 800 : 780,
            capsuleHeight = i < 2 ? 440 : 540;
          return (
            <React.Fragment key={i}>
              <Line x1={960} y1={300} x2={x} y2={y - capsuleHeight / 2} v={v} />
              <Box
                x={x}
                y={y + 500 * (1 - v)}
                w={140}
                h={capsuleHeight}
                style={{
                  background: e.ink,
                  borderRadius: 55,
                  boxShadow: soft,
                  visibility: t < a ? "hidden" : "visible",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "25px 15px",
                    writingMode: "vertical-rl",
                    textOrientation: "upright",
                    whiteSpace: "nowrap",
                    fontSize: Math.min(59, (capsuleHeight - 70) / (1.2 * Array.from(s).length)),
                    lineHeight: 1.2,
                    color: "white",
                    fontWeight: 700,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {s}
                </div>
              </Box>
            </React.Fragment>
          );
        })}
      </div>
      {t > 8.1 &&
        [0, 1].map((i) => (
          <Pill
            key={i}
            text=""
            e={e}
            x={mix(i === 0 ? -400 : 2320, 380 + i * 1160, p(t, 8.1, 8.65))}
            y={540}
            w={650}
            h={300}
            progress={1}
          />
        ))}
    </>
  );
}

export const batch1Numbers = Array.from({ length: 25 }, (_, i) => i + 1);
function canonicalTime(
  time: number,
  cues: ReadonlyArray<{ time: number; canonicalTime?: number }>,
): number {
  const anchors = [{ time: 0, canonicalTime: 0 }, ...cues].filter(
    (c, i, a) => i === 0 || c.time > a[i - 1].time,
  );
  for (let i = 1; i < anchors.length; i++) {
    const lo = anchors[i - 1],
      hi = anchors[i];
    if (time <= hi.time)
      return mix(
        lo.canonicalTime ?? lo.time,
        hi.canonicalTime ?? hi.time,
        Math.max(0, Math.min(1, (time - lo.time) / (hi.time - lo.time))),
      );
  }
  const last = anchors[anchors.length - 1];
  return (last.canonicalTime ?? last.time) + time - last.time;
}
export function Batch1({
  number,
  t,
  duration,
  overrides = {},
}: {
  number: number;
  t: number;
  duration: number;
  overrides?: Batch1Overrides | Record<string, unknown>;
}) {
  const page = manifest.pages.find((x) => x.number === number);
  if (!page) throw new Error(`Missing manifest page ${number}`);
  const o = overrides as Batch1Overrides;
  const e: Env = {
    t: canonicalTime(t * (o.timeScale ?? 1), page.cues),
    d: duration,
    w: o.words || o.texts || page.exactScreenWords,
    accent: o.accent || "#8960ca",
    ink: o.ink || "#121214",
    bg: o.background || "#fff",
    assets: o.assets || {},
  };
  const content =
    number === 1
      ? IconPair(e)
      : number === 2
        ? PillExpand(e)
        : number === 3
          ? BrandBranches(e)
          : [4, 16, 17, 22].includes(number)
            ? WindowTitle(e, number as 4 | 16 | 17 | 22)
            : number === 5
              ? DocumentFocus(e)
              : number === 6 || number === 7
                ? DeviceWorkflow(e, number)
                : number === 8
                  ? AppDemo(e)
                  : number === 9
                    ? PromptFocus(e)
                    : number === 10
                      ? WordRows(e)
                      : number === 11 || number === 12
                        ? MediaGrid(e, number)
                        : number === 13
                          ? CapabilityGrid(e)
                          : number === 14
                            ? ChatChapter(e)
                            : number === 15
                              ? Equation(e)
                              : number === 18
                                ? VerticalCaps(e)
                                : number === 19
                                  ? ImageCategories(e)
                                  : number === 20
                                    ? ImageWall(e)
                                    : number === 21
                                      ? ThreeRoles(e)
                                      : number === 23
                                        ? DeviceFocus(e)
                                        : number === 24
                                          ? ThreePhones(e)
                                          : BranchLabels(e);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: e.bg,
        color: e.ink,
        fontFamily: "MiSans",
        overflow: "hidden",
      }}
    >
      {content}
    </div>
  );
}
