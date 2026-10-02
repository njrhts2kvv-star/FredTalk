import {ProductSafeImage as Img} from "./ProductSafeImage";
import {cleanStaticFile as staticFile} from "./clean-assets";
import React, { CSSProperties } from "react";
import { AbsoluteFill } from "remotion";
import manifest from "../manifest.json";
const facts = manifest.pages.filter((f) => f.number >= 51 && f.number <= 76);

/** Each record keeps its original shortlist identity. Override text/assets/accent to reuse. */
export const batch3Defaults = Object.fromEntries(
  facts.map((f) => [f.number, f]),
);
type Overrides = {
  words?: string[];
  texts?: string[];
  background?: string;
  ink?: string;
  assets?: Record<string, string>;
  accent?: string;
  timeScale?: number;
  [key: string]: unknown;
};
type Props = {
  number: number;
  t: number;
  duration: number;
  overrides?: Overrides;
};
const ink = "var(--b3-ink)",
  purple = "var(--b3-accent)",
  pale = "#d2b8f2";
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const p = (t: number, start: number, d = 0.6) => {
  const v = clamp((t - start) / d);
  return 1 - Math.pow(1 - v, 3);
};
const mix = (a: number, b: number, v: number) => a + (b - a) * v;
const at = (
  x: number,
  y: number,
  w: number,
  h: number,
  extra: CSSProperties = {},
): CSSProperties => ({
  position: "absolute",
  left: x,
  top: y,
  width: w,
  height: h,
  ...extra,
});
const boxShadow = "0 12px 30px #00000020";
const Text = ({
  children,
  x = 0,
  y = 0,
  w = 1920,
  size = 76,
  color = ink,
  style = {},
}: {
  children: React.ReactNode;
  x?: number;
  y?: number;
  w?: number;
  size?: number;
  color?: string;
  style?: CSSProperties;
}) => (
  <div
    style={at(x, y, w, size * 1.5, {
      fontSize: size,
      fontWeight: 600,
      lineHeight: 1.35,
      textAlign: "center",
      color,
      ...style,
    })}
  >
    {children}
  </div>
);
const Surface = ({
  x,
  y,
  w,
  h,
  children,
  dark = false,
  style = {},
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  children?: React.ReactNode;
  dark?: boolean;
  style?: CSSProperties;
}) => (
  <div
    style={at(x, y, w, h, {
      background: dark ? ink : "#fff",
      borderRadius: 30,
      boxShadow,
      overflow: "hidden",
      ...style,
    })}
  >
    {children}
  </div>
);
const Photo = ({
  name,
  x,
  y,
  w,
  h,
  style = {},
  assets = {},
}: {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  style?: CSSProperties;
  assets?: Record<string, string>;
}) => (
  <Img
    src={staticFile(assets[name] || `batch3/${name}.jpg`)}
    style={at(x, y, w, h, { objectFit: "cover", borderRadius: 24, ...style })}
  />
);
const Browser = ({
  children,
  x = 230,
  y = 80,
  w = 1460,
  h = 900,
  dark = true,
  style = {},
}: {
  children?: React.ReactNode;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  dark?: boolean;
  style?: CSSProperties;
}) => (
  <Surface x={x} y={y} w={w} h={h} dark={dark} style={style}>
    <div style={at(0, 0, w, 60, { background: dark ? "#0a0a0c" : "#f5f5f6" })}>
      {[purple, "#bdbdc3", "#eee"].map((c, i) => (
        <div
          key={i}
          style={at(25 + i * 29, 22, 13, 13, {
            borderRadius: 20,
            background: c,
          })}
        />
      ))}
    </div>
    {children}
  </Surface>
);
const Pill = ({
  text,
  x,
  y,
  w = 940,
  h = 230,
  style = {},
}: {
  text?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  style?: CSSProperties;
}) => (
  <Surface
    x={x}
    y={y}
    w={w}
    h={h}
    dark
    style={{ borderRadius: h / 2, ...style }}
  >
    <Text x={20} y={(h - 170) / 2} w={w - 40} size={126} color="white">
      {text}
    </Text>
  </Surface>
);
function Phone({
  x,
  y,
  w = 420,
  h = 900,
  name,
  rotate = 0,
  scale = 1,
  assets = {},
  children,
}: {
  children?: React.ReactNode;
  x: number;
  y: number;
  w?: number;
  h?: number;
  name?: string;
  rotate?: number;
  scale?: number;
  assets?: Record<string, string>;
}) {
  return (
    <Surface
      x={x}
      y={y}
      w={w}
      h={h}
      dark
      style={{
        borderRadius: w * 0.12,
        padding: 12,
        transform: `rotate(${rotate}deg) scale(${scale})`,
        boxShadow: "15px 15px 28px #0003",
      }}
    >
      <div
        style={at(12, 12, w - 24, h - 24, {
          background: "#f5f5f6",
          borderRadius: w * 0.09,
          overflow: "hidden",
        })}
      >
        {name ? (
          <Photo
            name={name}
            x={0}
            y={0}
            w={w - 24}
            h={h - 24}
            assets={assets}
          />
        ) : null}
        {children}
      </div>
      <div
        style={at(w * 0.34, 22, w * 0.32, 30, {
          background: "#000",
          borderRadius: 30,
        })}
      />
    </Surface>
  );
}
const Line = ({
  x1,
  y1,
  x2,
  y2,
  progress = 1,
  color = "#727277",
  width = 3,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress?: number;
  color?: string;
  width?: number;
}) => (
  <line
    x1={x1}
    y1={y1}
    x2={mix(x1, x2, progress)}
    y2={mix(y1, y2, progress)}
    stroke={color}
    strokeWidth={width}
  />
);

function DeviceDepth({
  t,
  texts,
  a,
}: {
  t: number;
  texts: string[];
  a: Record<string, string>;
}) {
  return (
    <>
      <div
        style={{
          filter: `blur(${12 * p(t, 0.25)}px)`,
          transform: `scale(${1 - 0.1 * p(t, 0.25)})`,
        }}
      >
        <Phone x={680} y={-30} w={570} h={1160} name="051-phone" assets={a} />
      </div>
      {texts.map((s, i) => (
        <Text
          key={i}
          x={180}
          y={mix(-320, 280 + i * 340, p(t, i ? 2.2 : 0.35))}
          w={1560}
          size={158}
          color={purple}
          style={{ letterSpacing: 15 }}
        >
          {s}
        </Text>
      ))}
    </>
  );
}
function NodeFlow({
  t,
  a,
  texts,
}: {
  t: number;
  a: Record<string, string>;
  texts: string[];
}) {
  const q = p(t, 4.65, 0.8);
  const starts = [
    [150, 220, 410, 640],
    [650, 220, 410, 640],
    [1160, 220, 290, 290],
    [1500, 220, 290, 290],
    [1160, 550, 630, 310],
  ];
  const ends = [
    [100, 125, 250, 390],
    [100, 565, 250, 390],
    [480, 730, 180, 180],
    [480, 310, 180, 180],
    [860, 455, 430, 230],
  ];
  const names = ["person", "room", "clock", "note", "scene"];
  return (
    <>
      <AbsoluteFill style={{ background: ink }} />
      <div
        style={at(20, 450, 42, 42, {
          background: "white",
          color: ink,
          borderRadius: 30,
          fontSize: 32,
          lineHeight: "39px",
          textAlign: "center",
        })}
      >
        +
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {[
          [350, 320, 860, 565],
          [350, 760, 860, 565],
          [660, 400, 860, 565],
          [660, 820, 860, 565],
          [1290, 565, 1450, 565],
        ].map((v, i) => (
          <Line
            key={i}
            x1={v[0]}
            y1={v[1]}
            x2={v[2]}
            y2={v[3]}
            progress={p(t, 5.3 + i * 0.12, 0.7)}
            color={i === 4 ? purple : "#9b9ba2"}
          />
        ))}
      </svg>
      {starts.map((s, i) => {
        const e = ends[i];
        return (
          <Photo
            key={i}
            name={`052-${names[i]}`}
            x={mix(s[0], e[0], q)}
            y={mix(1250, s[1], p(t, 1.1 + i * 0.24)) + (e[1] - s[1]) * q}
            w={mix(s[2], e[2], q)}
            h={mix(s[3], e[3], q)}
            assets={a}
            style={{ border: "3px solid #b9b9bf", boxShadow: "0 0 20px #fff2" }}
          />
        );
      })}
      <Photo
        name="052-scene"
        x={1450}
        y={mix(1200, 460, p(t, 6.5))}
        w={380}
        h={215}
        assets={a}
      />
      <Text
        x={740}
        y={mix(1150, 830, p(t, 9.8))}
        w={1120}
        size={110}
        color="white"
        style={{ fontStyle: "italic" }}
      >
        {texts[1]}
      </Text>
    </>
  );
}
function Matrix({
  t,
  a,
  texts,
}: {
  t: number;
  a: Record<string, string>;
  texts: string[];
}) {
  const flat = p(t, 6.5, 1.5);
  return (
    <>
      <AbsoluteFill
        style={{ background: mix(18, 255, flat) > 130 ? "#fff" : ink }}
      />
      <Browser x={40} y={40} w={1840} h={1000}>
        <Text
          x={130}
          y={15}
          w={1100}
          size={25}
          color="white"
          style={{ textAlign: "left" }}
        >
          {texts.slice(0, 4).join("　　")}
        </Text>
        <div
          style={at(100, 90, 1600, 870, {
            transform: `perspective(1600px) rotateY(${mix(-26, 0, flat)}deg) rotateZ(${mix(-13, 0, flat)}deg) scale(${mix(1.8, 0.9, flat)}) translate(${mix(160, 0, p(t, 0, 6))}px,${mix(160, -60, p(t, 0, 6))}px)`,
            transformOrigin: "50% 45%",
          })}
        >
          <svg width={1600} height={1000} style={{ position: "absolute" }}>
            {Array.from({ length: 42 }, (_, i) => (
              <Line
                key={i}
                x1={155}
                y1={80 + (i % 10) * 80}
                x2={430 + (i % 6) * 170}
                y2={180 + Math.floor(i / 6) * 100}
                color="#515157"
                width={1}
              />
            ))}
          </svg>
          {Array.from({ length: 10 }, (_, i) => (
            <Photo
              key={i}
              name={`052-${i % 2 ? "room" : "person"}`}
              x={60}
              y={i * 85}
              w={95}
              h={75}
              assets={a}
            />
          ))}
          {Array.from({ length: 42 }, (_, i) => (
            <Photo
              key={i}
              name={`053-${"abcd"[i % 4]}`}
              x={430 + (i % 6) * 170}
              y={180 + Math.floor(i / 6) * 100}
              w={145}
              h={78}
              assets={a}
            />
          ))}
          {t > 10 && (
            <Photo
              name="053-menu"
              x={620}
              y={400}
              w={600}
              h={300}
              assets={a}
              style={{ transform: `scale(${p(t, 10, 0.3)})` }}
            />
          )}
        </div>
      </Browser>
    </>
  );
}
function LabelCounter({
  t,
  texts,
  a,
}: {
  t: number;
  texts: string[];
  a: Record<string, string>;
}) {
  const slots = [
    [150, 235],
    [770, 235],
    [1390, 235],
    [460, 635],
    [1080, 635],
  ];
  if (t < 4.8)
    return (
      <>
        {slots.map(([x, y], i) => (
          <Pill
            key={i}
            x={x}
            y={mix(1200, y, p(t, i * 0.45 - 0.3))}
            w={420}
            h={220}
            text={texts[i]}
            style={{ transform: `scale(${mix(0.2, 1, p(t, i * 0.45 - 0.3))})` }}
          />
        ))}
      </>
    );
  if (t < 8.2)
    return t > 6.5 ? (
      <Photo name="054-sheet" x={110} y={100} w={1700} h={880} assets={a} />
    ) : (
      <Photo name="054-person" x={520} y={50} w={880} h={1050} assets={a} />
    );
  return (
    <>
      <Photo
        name="054-person"
        x={520}
        y={50}
        w={880}
        h={1050}
        assets={a}
        style={{ filter: t < 10.8 ? "blur(16px)" : "none" }}
      />
      {t < 10.8 ? (
        <Pill
          x={390}
          y={440}
          w={1140}
          h={300}
          text={Math.round(
            mix(
              742800,
              Number((texts[5] ?? "108420").replace(/,/g, "")),
              p(t, 8.25, 1.8),
            ),
          ).toLocaleString("en-US")}
          style={{ transform: `scale(${mix(0.1, 1, p(t, 8.2, 0.4))})` }}
        />
      ) : (
        Array.from({ length: 5 }, (_, i) => (
          <Surface
            key={i}
            x={210 + i * 325}
            y={mix(-250, 100 + Math.abs(i - 2) * 110, p(t, 10.8 + i * 0.12))}
            w={150}
            h={180}
            style={{ transform: `rotate(${(i - 2) * 12}deg)` }}
          >
            <Text y={20} w={150} size={90} color={purple}>
              ▦
            </Text>
          </Surface>
        ))
      )}
    </>
  );
}
function Tables({
  t,
  number,
  a,
}: {
  t: number;
  number: number;
  a: Record<string, string>;
}) {
  if (number === 55) {
    const side = p(t, 2.7, 0.8) * (1 - p(t, 5.1, 0.8)),
      shrink = p(t, 11.6, 0.9);
    return (
      <>
        <Photo
          name="055-table"
          x={mix(80, -780, side)}
          y={140 + shrink * 130}
          w={1760 * (1 - 0.58 * shrink)}
          h={760 * (1 - 0.58 * shrink)}
          assets={a}
          style={{ boxShadow, filter: "grayscale(1)" }}
        />
        {side > 0 && (
          <Photo
            name="055-table"
            x={mix(1950, 1050, side)}
            y={170}
            w={1760}
            h={760}
            assets={a}
            style={{ boxShadow, filter: "grayscale(1)" }}
          />
        )}
        {t > 8 && t < 10.8 && (
          <div style={at(85, 320, 1750, 92, { background: "#8960ca33" })} />
        )}{" "}
        {shrink > 0 &&
          Array.from({ length: 9 }, (_, i) => (
            <Surface
              key={i}
              x={850 + (i % 5) * 195}
              y={mix(1200, 170 + Math.floor(i / 5) * 390, shrink)}
              w={165}
              h={180}
            >
              <Photo
                name="055-table"
                x={0}
                y={0}
                w={165}
                h={180}
                assets={a}
                style={{ objectFit: "cover", filter: "grayscale(1)" }}
              />
            </Surface>
          ))}
      </>
    );
  }
  const zoom = p(t, 0.3, 0.6) * (1 - p(t, 7.5, 1));
  return (
    <Browser x={40} y={45} w={1840} h={990}>
      <div
        style={{
          transform: `scale(${mix(1, 1.55, zoom)}) translateX(${-180 * p(t, 2.8, 2) * zoom}px)`,
          transformOrigin: "40% 20%",
        }}
      >
        <Photo
          name="056-table"
          x={20}
          y={110}
          w={1800}
          h={730}
          assets={a}
          style={{ filter: "grayscale(1)" }}
        />
      </div>
    </Browser>
  );
}
function Quadrants({
  t,
  texts,
  a,
}: {
  t: number;
  texts: string[];
  a: Record<string, string>;
}) {
  if (t < 1.4)
    return (
      <>
        <Text y={100 - 500 * p(t, 0, 0.7)} size={115} color={purple}>
          {texts[0]}
        </Text>
        <Text y={430 - 650 * p(t, 0.15, 0.7)} size={110}>
          {texts[1]}
        </Text>
        <div
          style={at(805, 370, 310, 310, {
            borderRadius: 80,
            background: purple,
            transform: `scale(${p(t, 0.4, 0.5)}) rotate(${120 * (1 - p(t, 0.4, 0.6))}deg)`,
          })}
        >
          <Text y={70} w={310} size={120} color="white">
            ✦
          </Text>
        </div>
      </>
    );
  const open = p(t, 3.7, 0.7);
  if (t > 5.8)
    return (
      <Browser dark={false} x={90} y={30} w={1740} h={1020}>
        <Photo
          name="057-document"
          x={40}
          y={80}
          w={1660}
          h={910}
          assets={a}
          style={{ objectFit: "contain" }}
        />
      </Browser>
    );
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <Surface
          key={i}
          x={80 + (i % 2) * 970}
          y={mix(
            1200,
            70 +
              Math.floor(i / 2) * 510 +
              (Math.floor(i / 2) ? 120 : -100) * open,
            p(t, 1.3 + i * 0.12),
          )}
          w={850}
          h={440}
          dark
        >
          <Photo
            name={`057-${"abcd"[i]}`}
            x={0}
            y={0}
            w={850}
            h={440}
            assets={a}
            style={{ filter: "brightness(.32) grayscale(1)" }}
          />
          <Text y={155} w={850} size={85} color="white">
            {texts[3 + i]}
          </Text>
        </Surface>
      ))}
      <Text y={410} size={240} style={{ transform: `scale(${open})` }}>
        {texts[7]}
      </Text>
    </>
  );
}
function PhoneCapabilities({
  t,
  texts,
  a,
}: {
  t: number;
  texts: string[];
  a: Record<string, string>;
}) {
  const left = p(t, 1.6, 0.6) * (1 - p(t, 4, 0.5));
  return (
    <>
      <Phone
        x={mix(735, 260, left)}
        y={10}
        w={460}
        h={1010}
        name={t < 4 ? "058-home" : "058-chat"}
        assets={a}
      />
      {texts.map((s, i) => (
        <Text
          key={i}
          x={1030}
          y={mix(1200, 215 + i * 260, p(t, 2.15 + i * 0.15))}
          w={700}
          size={102}
          color={ink}
          style={{ transform: `translateX(${1000 * p(t, 4, 0.4)}px)` }}
        >
          {s}
        </Text>
      ))}
    </>
  );
}
function PhoneHandoff({ t, a }: { t: number; a: Record<string, string> }) {
  const zoom = p(t, 1.2, 0.8) * (1 - p(t, 8.1, 0.5)),
    out = p(t, 8.2, 0.7),
    full = p(t, 10.7, 0.8);
  return (
    <>
      <Phone
        x={mix(735, 35, out) - 600 * full}
        y={mix(30, -220, zoom)}
        w={460}
        h={990}
        rotate={mix(22, 0, p(t, 0, 0.8))}
        scale={mix(1, 1.5, zoom)}
      >
        <div
          style={at(8, 360, 420, 250, { overflow: "hidden", borderRadius: 24 })}
        >
          <Photo
            name="059-room"
            x={-40 * p(t, 5.7, 0.8)}
            y={0}
            w={460}
            h={250}
            assets={a}
          />
        </div>
      </Phone>
      <Photo
        name="059-room"
        x={mix(747, 600, out) * (1 - full) + 80 * full}
        y={mix(402, 220, out) - 80 * full}
        w={mix(420, 1230, out) + 510 * full}
        h={mix(250, 680, out) + 120 * full}
        assets={a}
        style={{ transform: `scale(${t < 8.2 ? 0 : 1})`, boxShadow }}
      />
    </>
  );
}
function PlatformFlow({ t, texts }: { t: number; texts: string[] }) {
  const zoom = 1 + 0.8 * p(t, 2, 1) * (1 - p(t, 6.3, 0.7)),
    move = (-320 * p(t, 2, 1) + 500 * p(t, 4.2, 1)) * (1 - p(t, 6.3, 0.7));
  return (
    <div
      style={at(0, 0, 1920, 1080, {
        transform: `translateX(${move}px) scale(${zoom})`,
        transformOrigin: "50% 50%",
      })}
    >
      {texts.slice(8, 13).map((s, i) => (
        <Surface
          key={i}
          x={90 + (i % 2) * 155}
          y={240 + i * 110}
          w={110}
          h={110}
          dark
          style={{
            borderRadius: 80,
            transform: `scale(${p(t, i * 0.1 - 0.2)})`,
          }}
        >
          <Text y={30} w={110} size={24} color="white">
            {s}
          </Text>
        </Surface>
      ))}
      {texts.slice(0, 3).map((s, i) => (
        <Surface
          key={i}
          x={510}
          y={290 + i * 180}
          w={200}
          h={110}
          dark
          style={{ transform: `scale(${p(t, 0.5 + i * 0.1)})` }}
        >
          <Text y={24} w={200} size={42} color="white">
            {s}
          </Text>
        </Surface>
      ))}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Line
          x1={720}
          y1={525}
          x2={960}
          y2={525}
          progress={p(t, 1.2)}
          color={purple}
          width={8}
        />
        <Line
          x1={1320}
          y1={525}
          x2={1480}
          y2={525}
          progress={p(t, 4.4)}
          color={purple}
          width={8}
        />
      </svg>
      <Surface
        x={870}
        y={320}
        w={420}
        h={420}
        dark
        style={{ borderRadius: 240, transform: `scale(${p(t, 2.2)})` }}
      >
        <Text x={30} y={125} w={360} size={60} color="white">
          {texts[4]?.slice(0, 3)}
          <br />
          {texts[4]?.slice(3)}
        </Text>
      </Surface>
      {texts.slice(5, 8).map((s, i) => (
        <Surface
          key={i}
          x={1440}
          y={290 + i * 180}
          w={350}
          h={110}
          style={{
            background: i === 2 ? purple : ink,
            transform: `scale(${p(t, 4.4 + i * 0.25)})`,
          }}
        >
          <Text y={24} w={350} size={42} color="white">
            {s}
          </Text>
        </Surface>
      ))}
    </div>
  );
}
function Bars({
  t,
  texts,
  number,
}: {
  t: number;
  texts: string[];
  number: number;
}) {
  const second = number === 62;
  const one = second
      ? mix(7.4, parseFloat(texts[1]), p(t, 1, 1.9))
      : parseFloat(texts[1]) * p(t, 0.7, 0.7),
    two = parseFloat(texts[2]) * p(t, second ? 4 : 3.8, 2);
  const end = p(t, 7, 0.6);
  return (
    <>
      <Text x={100} y={75} w={1720} size={68}>
        {second && t > 7 ? texts[3] : texts[0]}
      </Text>
      <div
        style={at(0, 0, 1920, 1080, {
          transform: `scale(${mix(1, 0.82, second ? end : 0)})`,
          transformOrigin: "50% 65%",
        })}
      >
        {[one, two].map((v, i) => (
          <React.Fragment key={i}>
            <div
              style={at(550 + i * 660, 880 - v * 12, 210, v * 12, {
                background: i ? purple : ink,
                borderRadius: "8px 8px 0 0",
              })}
            />
            <Text x={480 + i * 660} y={790 - v * 12} w={350} size={65}>
              {second ? v.toFixed(1) : Math.round(v)}%
            </Text>
            <Text x={470 + i * 660} y={925} w={370} size={32}>
              {second ? (i ? "示例 B" : "示例 A") : texts[3 + i]}
            </Text>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
function PageArray({
  t,
  texts,
  a,
}: {
  t: number;
  texts: string[];
  a: Record<string, string>;
}) {
  const focus = p(t, 2, 0.25) * (1 - p(t, 4, 0.4));
  return (
    <>
      <div style={{ filter: `blur(${14 * focus}px)` }}>
        {[0, 1, 2, 3].map((i) => (
          <Photo
            key={i}
            name={`063-${"abcd"[i]}`}
            x={120 + i * 450}
            y={
              mix(1250, 80, p(t, i * 0.24 - 0.2)) -
              1250 * p(t, 5.6 + i * 0.2, 0.5)
            }
            w={370}
            h={900}
            assets={a}
            style={{ boxShadow, objectFit: "cover", borderRadius: 16 }}
          />
        ))}
      </div>
      {texts.map((s, i) => (
        <Text
          key={i}
          y={215 + i * 250 + 120 * (1 - p(t, 2.1 + i * 0.28, 0.5))}
          color="white"
          size={120}
          style={{
            opacity: 1 - p(t, 3.9, 0.3),
            textShadow: "0 3px 10px #000c",
            WebkitTextStroke: "1px #0008",
            clipPath: `inset(0 0 ${100 * (1 - p(t, 2.1 + i * 0.28, 0.5))}% 0)`,
          }}
        >
          {s}
        </Text>
      ))}
      {t > 6.25 && <Browser y={mix(1200, 80, p(t, 6.25, 0.45))} />}
    </>
  );
}
function Triangle({ t, texts }: { t: number; texts: string[] }) {
  const blur = p(t, 4.25, 0.3) * (1 - p(t, 6.9, 0.3));
  return (
    <Browser y={mix(-780, 70, p(t, 0, 0.55)) - 150 * p(t, 8.6, 0.4)}>
      <div style={{ filter: `blur(${16 * blur}px)` }}>
        <Text x={500} y={155} w={460} size={105} color="white">
          {texts[0]}
        </Text>
        <Text x={100} y={620} w={430} size={105} color="white">
          {texts[1]}
        </Text>
        <Text x={890} y={620} w={490} size={105} color="white">
          {texts[2]}
        </Text>
        <svg width={1460} height={900} style={{ position: "absolute" }}>
          {[
            [620, 330, 410, 595],
            [850, 330, 1100, 595],
            [570, 710, 920, 710],
          ].map((v, i) => (
            <React.Fragment key={i}>
              <Line
                x1={v[0]}
                y1={v[1]}
                x2={v[2]}
                y2={v[3]}
                progress={p(t, 0.65 + i * 0.15)}
                color="white"
                width={7}
              />
              <Line
                x1={v[0] + 20}
                y1={v[1] + 20}
                x2={v[2] + 20}
                y2={v[3] + 20}
                progress={p(t, 0.65 + i * 0.15)}
                color="white"
                width={7}
              />
            </React.Fragment>
          ))}
        </svg>
      </div>
      {blur > 0 && (
        <Text
          y={400}
          w={1460}
          size={130}
          color={purple}
          style={{ transform: `scale(${mix(0.8, 1, blur)})`, opacity: blur }}
        >
          {texts[3]}
        </Text>
      )}
      {t > 7.3 && (
        <Surface
          x={520}
          y={760}
          w={420}
          h={110}
          style={{ background: purple, transform: `scale(${p(t, 7.3, 0.3)})` }}
        >
          <Text y={20} w={420} size={54} color="white">
            {texts[4]}
          </Text>
        </Surface>
      )}
    </Browser>
  );
}
function Inequality({ t, texts }: { t: number; texts: string[] }) {
  return (
    <Browser>
      {t < 3.5 ? (
        <>
          <Text x={100} y={350} w={460} size={150} color="white">
            {texts[0]}
          </Text>
          <Text
            x={900}
            y={350}
            w={450}
            size={150}
            color="white"
            style={{ clipPath: `inset(0 ${100 * (1 - p(t, 0.6, 0.45))}% 0 0)` }}
          >
            {texts[1]}
          </Text>
          <Surface
            x={630}
            y={360}
            w={200}
            h={200}
            style={{
              background: purple,
              borderRadius: 130,
              transform: `scale(${p(t, 1.2, 0.3)})`,
            }}
          >
            <Text y={15} w={200} size={135} color="white">
              {texts[2]}
            </Text>
          </Surface>
        </>
      ) : (
        <>
          <Text
            x={70}
            y={370}
            w={670}
            size={92}
            color="white"
            style={{
              clipPath: `inset(0 ${100 * (1 - p(t, 3.55, 0.35))}% 0 0)`,
            }}
          >
            {texts[3]}
          </Text>
          <Text
            x={770}
            y={370}
            w={640}
            size={92}
            color="white"
            style={{ clipPath: `inset(0 ${100 * (1 - p(t, 4.25, 0.4))}% 0 0)` }}
          >
            {texts[4]}
          </Text>
        </>
      )}
    </Browser>
  );
}
function HighlightTrack({
  t,
  a,
  texts,
}: {
  t: number;
  a: Record<string, string>;
  texts: string[];
}) {
  const track = p(t, 4.7, 0.8) + p(t, 11.1, 0.8) + p(t, 16, 0.6);
  return (
    <>
      {["floss", "mop", "apple", "pen"].map((n, i) => {
        const distance = Math.abs(i - track);
        return (
          <Photo
            key={n}
            name={`066-${n}`}
            x={700 + i * 640 - track * 640}
            y={55}
            w={550}
            h={950}
            assets={a}
            style={{
              filter: `brightness(${mix(1, 0.27, clamp(distance))})`,
              transform: `scale(${mix(1, 0.97, clamp(distance))})`,
              boxShadow,
            }}
          />
        );
      })}
      <Text y={1020} size={34}>
        {t > 11.1 && t < 12.4 ? texts[0] : ""}
      </Text>
    </>
  );
}
function FourTerms({
  t,
  texts,
  a,
}: {
  t: number;
  texts: string[];
  a: Record<string, string>;
}) {
  const grid = p(t, 9.8, 0.6),
    exit = p(t, 12.1, 0.6);
  return (
    <>
      <Photo
        name={`067-${t < 6 ? "person" : "woman"}`}
        x={690}
        y={40 + 1200 * p(t, 9.6, 0.18)}
        w={540}
        h={990}
        assets={a}
      />
      {texts.map((s, i) => {
        const j = [0, 2, 1, 3][i],
          x = i < 2 ? 60 : 1260,
          y = i % 2 === 0 ? 300 : 700;
        return (
          <Text
            key={i}
            x={mix(x, 200 + (j % 2) * 800, grid)}
            y={
              mix(
                1200,
                mix(y, 300 + Math.floor(j / 2) * 440, grid),
                p(t, [0, 1.2, 4, 8][i] - 0.2),
              ) -
              1000 * exit
            }
            w={600}
            size={92}
            color={purple}
          >
            {s}
          </Text>
        );
      })}
      {exit > 0 && (
        <Browser dark={false} y={mix(1200, 90, exit)}>
          <div
            style={at(70, 130, 1300, 660, {
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 28,
            })}
          >
            {["a", "b", "c", "d", "e", "f", "a", "b"].map((s, i) => (
              <Img
                key={i}
                src={staticFile(a[`072-${s}`] || `batch3/072-${s}.jpg`)}
                style={{
                  width: "100%",
                  height: 300,
                  objectFit: "cover",
                  borderRadius: 20,
                }}
              />
            ))}
          </div>
        </Browser>
      )}
    </>
  );
}
function Phases({
  t,
  number,
  texts,
  a,
}: {
  t: number;
  number: number;
  texts: string[];
  a: Record<string, string>;
}) {
  const second = number === 70;
  return (
    <>
      {second && t < 5.8 && (
        <div style={{ filter: `blur(${10 * p(t, 1.1)}px)` }}>
          <Phone x={745} y={30} w={440} h={970} name="070-phone" assets={a} />
        </div>
      )}
      {[0, 1, 2].map((i) => {
        const enter = second ? p(t, 1.1 + i * 0.16) : p(t, -0.25 + i * 0.22),
          stretch = p(t, second ? 1.2 : 0.5 + i * 0.15, 0.45),
          out = p(t, second ? 5.5 : 3.5 + i * 0.12, 0.45);
        return (
          <Pill
            key={i}
            x={mix(820, 480, stretch) + (i % 2 ? 2200 : -2200) * out}
            y={90 + i * 350}
            style={{ transform: `scale(${enter})` }}
            w={mix(280, 960, stretch)}
            h={260}
            text={
              second
                ? t > [1.35, 1.8, 4.6][i]
                  ? texts[i]
                  : ""
                : i === 0 && t > 2
                  ? texts[0]
                  : ""
            }
          />
        );
      })}
      {!second && t > 3.75 && (
        <Photo
          name="068-person"
          x={570}
          y={mix(1200, 90, p(t, 3.75, 0.35))}
          w={780}
          h={990}
          assets={a}
        />
      )}{" "}
      {second && t > 5.55 && (
        <Browser y={mix(1200, 0, p(t, 5.55, 0.4))}>
          <Photo
            name="070-development"
            x={80}
            y={100}
            w={1300}
            h={370}
            assets={a}
            style={{ objectFit: "contain" }}
          />
        </Browser>
      )}
    </>
  );
}
function Donut({
  t,
  texts,
  a,
}: {
  t: number;
  texts: string[];
  a: Record<string, string>;
}) {
  const shrink = 1 - 0.48 * p(t, 6, 0.6) - 0.52 * p(t, 7.8, 0.5);
  const sector = (start: number, end: number, r: number) => {
    const xy = (a: number, R: number) => [
      960 + Math.sin((a * Math.PI) / 180) * R,
      520 - Math.cos((a * Math.PI) / 180) * R,
    ];
    const A = xy(start, r),
      B = xy(end, r),
      C = xy(end, 135),
      D = xy(start, 135);
    return `M${A} A${r},${r} 0 ${end - start > 180 ? 1 : 0} 1 ${B} L${C} A135,135 0 ${end - start > 180 ? 1 : 0} 0 ${D} Z`;
  };
  return (
    <>
      {t < 0.6 && (
        <Photo
          name="069-document"
          x={430 - 1900 * p(t, 0.2, 0.6)}
          y={130}
          w={1060}
          h={800}
          assets={a}
          style={{
            transform: `perspective(1200px) rotateY(${-70 * p(t, 0.2, 0.6)}deg)`,
            transformOrigin: "left center",
          }}
        />
      )}
      <div
        style={at(0, 0, 1920, 1080, {
          transform: `scale(${Math.max(0, shrink)})`,
          visibility: shrink <= 0 ? "hidden" : "visible",
        })}
      >
        <svg
          width={1920}
          height={1080}
          style={{
            position: "absolute",
            filter: "drop-shadow(12px 15px 7px #0003)",
          }}
        >
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={sector(
                i * 120,
                i * 120 + 119.5,
                135 + (i === 0 ? 315 : 240) * p(t, [0.3, 2.1, 4.1][i], 0.6),
              )}
              fill={[purple, "#bfbfc5", ink][i]}
            />
          ))}
        </svg>
        {texts.slice(0, 3).map((s, i) => (
          <Text
            key={i}
            x={[1300, 1050, 190][i]}
            y={[230, 900, 240][i]}
            w={450}
            size={48}
            color={ink}
            style={{ transform: `scale(${p(t, [0.6, 2.5, 4.5][i])})` }}
          >
            {s}
          </Text>
        ))}
      </div>
      {t > 8 && (
        <Pill x={mix(2000, 480, p(t, 8, 0.4))} y={80} text={texts[3]} />
      )}
    </>
  );
}
function Chat({ t, texts }: { t: number; texts: string[] }) {
  const focus = p(t, 1.35, 0.25) * (1 - p(t, 2.2, 0.3));
  return (
    <>
      <div style={{ filter: `blur(${14 * focus}px)` }}>
        {[0, 1, 2].map((i) => (
          <Surface
            key={i}
            x={70 + i * 260}
            y={mix(1200, 100 + i * 345, p(t, i === 2 ? 0.4 : -1, 0.4))}
            w={1270}
            h={180}
            style={{ borderRadius: 15, boxShadow: "8px 10px 8px #0003" }}
          >
            <Text x={25} y={55} w={1220} size={44}>
              {i === 0 && t > 4.3 ? texts[4] : texts[i]}
            </Text>
          </Surface>
        ))}
      </div>
      {focus > 0 && (
        <Text
          y={380}
          size={270}
          color={purple}
          style={{
            letterSpacing: 55,
            transform: `scale(${mix(0.6, 1, focus)})`,
            opacity: focus,
          }}
        >
          {texts[3]}
        </Text>
      )}
    </>
  );
}
function ImageResults({
  t,
  texts,
  a,
}: {
  t: number;
  texts: string[];
  a: Record<string, string>;
}) {
  const big = p(t, 6.1, 0.7) * (1 - p(t, 14.7, 0.6)),
    exit = p(t, 16.2, 0.5);
  const second = t > 11;
  return (
    <>
      <Browser x={180} y={50 + 1200 * exit} w={1560} h={970}>
        <Photo name="072-input" x={120} y={140} w={440} h={770} assets={a} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Photo
            key={i}
            name={`072-${"abcdef"[i]}`}
            x={710 + (i % 3) * 255}
            y={mix(1200, 150 + Math.floor(i / 3) * 380, p(t, 1.4 + i * 0.2))}
            w={220}
            h={335}
            assets={a}
          />
        ))}
        <Surface
          x={660}
          y={850}
          w={460}
          h={90}
          style={{ background: purple, transform: `scale(${p(t, 3.7, 0.3)})` }}
        >
          <Text y={13} w={460} size={44} color="white">
            {texts[0]}
          </Text>
        </Surface>
        {big > 0 && (
          <div
            style={at(-80, 50, 1720, 920, {
              background: "#121214bb",
              backdropFilter: "blur(12px)",
            })}
          >
            {[0, 1, 2].map((i) => (
              <Photo
                key={i}
                name={`072-${(second ? "def" : "abc")[i]}`}
                x={mix(780 + i * 255, 40 + i * 570, big)}
                y={mix(150, 30, big)}
                w={mix(220, 500, big)}
                h={mix(335, 850, big)}
                assets={a}
              />
            ))}
          </div>
        )}
      </Browser>
      {t > 16.3 && (
        <Browser x={180} y={mix(-900, 50, p(t, 16.3, 0.6))} w={1560} h={970}>
          <Photo
            name="072-avatar"
            x={570}
            y={130}
            w={420}
            h={740}
            assets={a}
            style={{ objectFit: "contain" }}
          />
        </Browser>
      )}
    </>
  );
}
function RoleCards({
  t,
  texts,
  a,
}: {
  t: number;
  texts: string[];
  a: Record<string, string>;
}) {
  return (
    <>
      <div style={{ filter: "blur(10px)" }}>
        <Browser dark={false} x={80} y={60} w={1760} h={970}>
          {["a", "b", "c"].map((s, i) => (
            <Photo
              key={i}
              name={`072-${s}`}
              x={250 + i * 420}
              y={180}
              w={340}
              h={700}
              assets={a}
            />
          ))}
        </Browser>
      </div>
      {[0, 1, 2].map((i) => (
        <Surface
          key={i}
          x={120 + i * 600}
          y={200 - 1300 * p(t, 6.15 + i * 0.1, 0.45)}
          w={450}
          h={660}
          dark={i !== 1}
          style={{
            background: i === 1 ? purple : i === 2 ? "#eee" : ink,
            transform: `perspective(1500px) rotateY(${90 * (1 - p(t, [0.5, 1.9, 4][i], 0.45))}deg)`,
            transformOrigin: "left center",
          }}
        >
          <Text y={60} w={450} size={85} color={i === 2 ? ink : "#fff"}>
            {texts[i * 2]}
          </Text>
          <Text y={300} w={450} size={65} color={i === 2 ? ink : "#fff"}>
            {texts[i * 2 + 1]}
          </Text>
        </Surface>
      ))}
    </>
  );
}
function Failures({
  t,
  texts,
  a,
}: {
  t: number;
  texts: string[];
  a: Record<string, string>;
}) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={at(
            95 + i * 610,
            mix(1200, 140, p(t, -0.2 + i * 0.22)) -
              1250 * p(t, 5.8 + i * 0.14, 0.6),
            520,
            850,
            {
              transform: `perspective(1200px) rotateY(${70 * (1 - p(t, 0.3 + i * 0.22, 0.5))}deg)`,
              transformOrigin: "left center",
            },
          )}
        >
          <Surface x={0} y={0} w={500} h={720} dark>
            {i === 0 && t > 2.2 ? (
              <svg width="500" height="720">
                {Array.from({ length: 1400 }, (_, k) => (
                  <rect
                    key={k}
                    x={(k * 137) % 500}
                    y={(k * 179) % 720}
                    width={10}
                    height={10}
                    fill={[ink, "#fff", purple, "#bdbdc2"][k % 4]}
                  />
                ))}
              </svg>
            ) : i === 1 && t > 2.8 ? (
              <Photo
                name="074-blur"
                x={0}
                y={0}
                w={500}
                h={720}
                assets={a}
                style={{ filter: "blur(9px) grayscale(1)" }}
              />
            ) : i === 2 && t > 3.4 ? (
              <>
                <Text y={90} w={500} size={160} color="white">
                  {texts[2]}
                </Text>
                <Text y={300} w={500} size={54} color="white">
                  {texts[3]}
                </Text>
              </>
            ) : null}
          </Surface>
          <Text
            y={755}
            w={500}
            size={72}
            color={ink}
            style={{ transform: `scale(${p(t, [2.2, 2.8, 3.4][i])})` }}
          >
            {texts[i]}
          </Text>
        </div>
      ))}
      {t > 5.7 && (
        <Browser dark={false} y={mix(1200, 80, p(t, 5.7, 0.5))}>
          <Photo
            name="074-site"
            x={30}
            y={70}
            w={1400}
            h={800}
            assets={a}
            style={{ objectFit: "contain" }}
          />
        </Browser>
      )}
    </>
  );
}
function DashedCases({
  t,
  texts,
  a,
}: {
  t: number;
  texts: string[];
  a: Record<string, string>;
}) {
  const heading = p(t, 2, 0.6);
  const focus =
    t >= 13.2 ? "dolls" : t >= 11 ? "box" : t >= 6 && t < 8.4 ? "figure" : null;
  return (
    <>
      <AbsoluteFill style={{ background: "#000" }} />
      <div
        style={at(35, 85, 1850, 940, {
          border: "5px dashed #fff",
          borderRadius: 85,
          filter: focus ? "blur(8px)" : "none",
        })}
      />
      <Text
        x={mix(320, 30, heading)}
        y={mix(350, 8, heading)}
        w={mix(1280, 720, heading)}
        size={mix(125, 48, heading)}
        color="white"
        style={{
          textAlign: heading > 0.5 ? "left" : "center",
          lineHeight: 1.15,
        }}
      >
        {heading < 0.5 ? (
          <>
            {texts[0]}
            <br />
            {texts[1]}
          </>
        ) : (
          texts[2]
        )}
      </Text>
      {t > 2.8 && (
        <div style={{ filter: focus ? "blur(12px)" : "none" }}>
          <Photo
            name={`075-${t < 8.4 ? "drawing" : "figure"}`}
            x={180}
            y={mix(1200, 180, p(t, 2.8, 0.5))}
            w={440}
            h={760}
            assets={a}
            style={{ objectFit: "contain" }}
          />
          <Photo
            name={`075-${t < 8.4 ? "figure" : "hand"}`}
            x={1290}
            y={mix(1200, 180, p(t, 4.8, 0.5))}
            w={440}
            h={760}
            assets={a}
            style={{ objectFit: "contain" }}
          />
        </div>
      )}
      {focus && (
        <Photo
          name={`075-${focus}`}
          x={660}
          y={115}
          w={610}
          h={860}
          assets={a}
          style={{
            boxShadow: "0 20px 70px #0009",
            transform: `scale(${mix(0.75, 1, p(t, focus === "dolls" ? 13.2 : focus === "box" ? 11 : 6, 0.4))})`,
          }}
        />
      )}
    </>
  );
}
function Storyboard({
  t,
  texts,
  a,
}: {
  t: number;
  texts: string[];
  a: Record<string, string>;
}) {
  const big = p(t, 6.9, 0.6);
  return (
    <>
      <Text
        x={30}
        y={10}
        w={950}
        size={48}
        color={purple}
        style={{ textAlign: "left" }}
      >
        {texts[0]}
      </Text>
      {[0, 1, 2, 3].map((i) => (
        <Photo
          key={i}
          name={`076-${t > 4.4 + i * 0.25 ? "film" : "sketch"}${i + 1}`}
          x={220 + (i % 2) * 900}
          y={mix(1200, 170 + Math.floor(i / 2) * 460, p(t, i * 0.1 - 0.3))}
          w={580}
          h={340}
          assets={a}
          style={{ objectFit: "contain", borderRadius: 0 }}
        />
      ))}
      {big > 0 && (
        <Photo
          name={`076-film${t > 8 ? 2 : 1}`}
          x={mix(220, 480, big)}
          y={mix(170, 270, big)}
          w={mix(580, 960, big)}
          h={mix(340, 540, big)}
          assets={a}
          style={{ borderRadius: 0, boxShadow }}
        />
      )}
    </>
  );
}

/** Remap project cue positions without duplicating a mutable timeline in components. */
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
        clamp((time - lo.time) / (hi.time - lo.time)),
      );
  }
  const last = anchors[anchors.length - 1];
  return (last.canonicalTime ?? last.time) + time - last.time;
}

/** Local time in seconds. All rendering derives deterministically from this value. */
export function Batch3({ number, t: time, duration, overrides = {} }: Props) {
  const config = batch3Defaults[number];
  if (!config) throw new Error(`Unknown Batch3 clip ${number}`);
  const t = canonicalTime(time * (overrides.timeScale ?? 1), config.cues),
    texts = overrides.words ?? overrides.texts ?? config.exactScreenWords,
    a = overrides.assets ?? {};
  let body: React.ReactNode;
  switch (number) {
    case 51:
      body = <DeviceDepth t={t} texts={texts} a={a} />;
      break;
    case 52:
      body = <NodeFlow t={t} texts={texts} a={a} />;
      break;
    case 53:
      body = <Matrix t={t} a={a} texts={texts} />;
      break;
    case 54:
      body = <><LabelCounter t={t} texts={texts} a={a} />{t >= 8.2 && t < 10.8 && <div style={{position:"absolute",right:70,top:60,padding:"10px 26px",borderRadius:16,background:"#fff",color:"#655a71",fontSize:40}}>示例</div>}</>;
      break;
    case 55:
    case 56:
      body = <><Tables t={t} number={number} a={a} />{number === 56 && <div style={{position:"absolute",right:70,top:60,padding:"10px 26px",borderRadius:16,background:"#fff",color:"#655a71",fontSize:40}}>示例</div>}</>;
      break;
    case 57:
      body = <Quadrants t={t} texts={texts} a={a} />;
      break;
    case 58:
      body = <PhoneCapabilities t={t} texts={texts} a={a} />;
      break;
    case 59:
      body = (
        <>
          <PhoneHandoff t={t} a={a} />
          <Text y={1015} size={30}>
            {t >= 1.8 && t < 3.6 ? texts[0] : ""}
          </Text>
        </>
      );
      break;
    case 60:
      body = <PlatformFlow t={t} texts={texts} />;
      break;
    case 61:
    case 62:
      body = <Bars t={t} texts={texts} number={number} />;
      break;
    case 63:
      body = <PageArray t={t} texts={texts} a={a} />;
      break;
    case 64:
      body = <Triangle t={t} texts={texts} />;
      break;
    case 65:
      body = <Inequality t={t} texts={texts} />;
      break;
    case 66:
      body = <HighlightTrack t={t} a={a} texts={texts} />;
      break;
    case 67:
      body = <FourTerms t={t} texts={texts} a={a} />;
      break;
    case 68:
    case 70:
      body = <Phases t={t} number={number} texts={texts} a={a} />;
      break;
    case 69:
      body = <Donut t={t} texts={texts} a={a} />;
      break;
    case 71:
      body = <Chat t={t} texts={texts} />;
      break;
    case 72:
      body = <ImageResults t={t} texts={texts} a={a} />;
      break;
    case 73:
      body = <RoleCards t={t} texts={texts} a={a} />;
      break;
    case 74:
      body = <Failures t={t} texts={texts} a={a} />;
      break;
    case 75:
      body = <DashedCases t={t} texts={texts} a={a} />;
      break;
    case 76:
      body = <Storyboard t={t} texts={texts} a={a} />;
      break;
    default:
      throw new Error("Unsupported clip");
  }
  return (
    <AbsoluteFill
      style={
        {
          background: overrides.background ?? "#fff",
          color: ink,
          fontFamily: "MiSans, sans-serif",
          overflow: "hidden",
          "--b3-ink": overrides.ink ?? "#121214",
          "--b3-accent": overrides.accent ?? "#8960ca",
        } as CSSProperties
      }
    >
      {body}
    </AbsoluteFill>
  );
}
