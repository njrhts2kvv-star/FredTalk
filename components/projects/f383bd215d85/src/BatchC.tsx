import {N030SearchRepair} from "./calibration-c/N030SearchRepair";
import {X050TypographyRepair} from "./X050TypographyRepair";
import {SkillsResume} from "./calibration-c/SkillsResume";
import {ChatFileExchange} from "./calibration-c/ChatFileExchange";
import {PhoneUnlock} from "./calibration-c/PhoneUnlock";
import {UsageEvidence} from "./calibration-c/UsageEvidence";
import {AskAiHomepage} from "./calibration-c/AskAiHomepage";
import React, { CSSProperties } from "react";
import {IllustrationGrid} from "./calibration-c/IllustrationGrid";
import {MediaWorkflow} from "./calibration-c/MediaWorkflow";
import {UploadToPhone} from "./calibration-c/UploadToPhone";
import {ComparisonWindows} from "./calibration-c/ComparisonWindows";
import {ChalkBoard} from "./calibration-c/ChalkBoard";
import {HandwritingGrid} from "./calibration-c/HandwritingGrid";
import {PhoneAndTypes} from "./calibration-c/PhoneAndTypes";
import wordAlpha from "./calibration-c/N052-word-alpha.json";
import { AbsoluteFill, Img, OffthreadVideo, staticFile } from "remotion";

type Props = {
  id: string;
  t: number;
  duration: number;
  overrides?: {
    words?: string[];
    assets?: Record<string, string>;
    accent?: string;
  };
};
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
const q = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const pos = (x: number, y: number, w?: number, h?: number): CSSProperties => ({
  position: "absolute",
  left: x,
  top: y,
  width: w,
  height: h,
});
const shadow = "0 14px 36px #17171916";
const media = (name: string) => staticFile("group-c/" + name);
const Pane: React.FC<
  React.PropsWithChildren<{ style?: CSSProperties; dark?: boolean }>
> = ({ children, style, dark = false }) => (
  <div
    style={{
      position: "absolute",
      background: dark ? "#171719" : "#fff",
      color: dark ? "white" : "#171719",
      borderRadius: 26,
      boxShadow: shadow,
      overflow: "hidden",
      border: "2px solid " + (dark ? "#343438" : "#e9e9ec"),
      ...style,
    }}
  >
    {children}
  </div>
);
const Bar = ({
  dark = false,
  title = "Fred Studio",
}: {
  dark?: boolean;
  title?: string;
}) => (
  <div
    style={{
      position: "relative",
      zIndex: 2,
      background: dark ? "#171719" : "#fff",
      height: 60,
      borderBottom: "1px solid " + (dark ? "#343438" : "#eee"),
      display: "flex",
      alignItems: "center",
      padding: "0 28px",
      gap: 12,
      fontSize: 20,
      color: dark ? "#aaa" : "#777",
    }}
  >
    <i
      style={{ width: 12, height: 12, borderRadius: 50, background: "#8554E8" }}
    />
    <i
      style={{ width: 12, height: 12, borderRadius: 50, background: "#ccc" }}
    />
    <i
      style={{ width: 12, height: 12, borderRadius: 50, background: "#ddd" }}
    />
    <span style={{ marginLeft: 24 }}>{title}</span>
  </div>
);
const Phone: React.FC<
  React.PropsWithChildren<{ style?: CSSProperties; title?: string }>
> = ({ style, children, title = "Fred AI" }) => (
  <div
    style={{
      position: "absolute",
      width: 410,
      height: 850,
      padding: 12,
      background: "#171719",
      borderRadius: 62,
      boxShadow: shadow,
      ...style,
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#fafafa",
        borderRadius: 49,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          height: 64,
          textAlign: "center",
          paddingTop: 19,
          fontSize: 19,
          fontWeight: 600,
        }}
      >
        9:41{" "}
        <div
          style={{
            position: "absolute",
            left: 132,
            top: 14,
            width: 120,
            height: 30,
            background: "#171719",
            borderRadius: 25,
          }}
        />
      </div>
      <div
        style={{
          height: 62,
          borderBottom: "1px solid #e7e7ec",
          textAlign: "center",
          fontSize: 25,
          fontWeight: 600,
          paddingTop: 12,
        }}
      >
        {title}
      </div>
      {children}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 140,
          width: 110,
          height: 5,
          borderRadius: 10,
          background: "#171719",
        }}
      />
    </div>
  </div>
);
const Text = ({
  children,
  x,
  y,
  size = 80,
  style = {},
}: React.PropsWithChildren<{
  x: number;
  y: number;
  size?: number;
  style?: CSSProperties;
}>) => (
  <div
    style={{
      ...pos(x, y),
      fontSize: size,
      fontWeight: 600,
      lineHeight: 1.25,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);
const Picture = ({ src, style }: { src: string; style?: CSSProperties }) => (
  <Img
    src={src}
    style={{ width: "100%", height: "100%", objectFit: "cover", ...style }}
  />
);
const Avatar = ({ src, style }: { src: string; style?: CSSProperties }) => (
  <OffthreadVideo
    src={src}
    muted
    transparent
    playbackRate={0.85}
    style={{ width: 960, height: 960, objectFit: "contain", ...style }}
  />
);
const Document = ({
  t = 0,
  accent = "#8554E8",
  title = "创作工作台",
}: {
  t?: number;
  accent?: string;
  title?: string;
}) => (
  <>
    <Bar title={title} />
    <div
      style={{
        padding: "50px 68px",
        transform: `translateY(${-Math.min(250, t * 25)}px)`,
      }}
    >
      <div style={{ fontSize: 40, fontWeight: 600, marginBottom: 35 }}>
        把想法变成作品
      </div>
      {[
        "输入你的创作目标",
        "整理资料与参考",
        "建立可以复用的工作流",
        "生成第一版作品",
        "验证结果并继续修改",
        "保存代码和输出",
      ].map((s, i) => (
        <div
          key={s}
          style={{
            marginBottom: 25,
            padding: "22px 28px",
            borderRadius: 18,
            background: i % 2 ? "#f7f7fa" : "#fff",
            border: "1px solid #eee",
          }}
        >
          <div
            style={{
              fontSize: 27,
              color: i === 2 ? accent : "#171719",
              marginBottom: 12,
            }}
          >
            {s}
          </div>
          <div style={{ fontSize: 20, color: "#777", lineHeight: 1.8 }}>
            内容可以替换，动作保持清晰。让每一步都有准确的结果。
          </div>
        </div>
      ))}
    </div>
  </>
);
function Chat({
  t,
  accent,
  compact = false,
  words,
}: {
  t: number;
  accent: string;
  compact?: boolean;
  words?: string[];
}) {
  const data = words || [
    "把这份表格整理一下",
    "希望输出哪些结果？",
    "统计每月的数据",
    "好的，正在建立分析步骤",
    "再生成一张图表",
    "已完成，结果可以继续编辑",
  ];
  return (
    <div style={{ padding: compact ? 22 : 48, position: "relative" }}>
      {data.map((s, i) => {
        const p = q(t, i * 1.35, i * 1.35 + 0.28);
        const right = i % 3 === 2;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: right ? "flex-end" : "flex-start",
              marginBottom: compact ? 22 : 28,
              opacity: p,
              transform: `translateY(${(1 - p) * 25}px)`,
            }}
          >
            <div
              style={{
                background: right ? accent : "#fff",
                color: right ? "white" : "#171719",
                border: "1px solid " + (right ? accent : "#e5e5e9"),
                borderRadius: right
                  ? "22px 8px 22px 22px"
                  : "8px 22px 22px 22px",
                padding: compact ? "16px 18px" : "20px 26px",
                fontSize: compact ? 22 : 30,
                maxWidth: "80%",
                lineHeight: 1.55,
              }}
            >
              {s}
            </div>
          </div>
        );
      })}
    </div>
  );
}
export const BatchC: React.FC<Props> = ({ id, t, duration, overrides }) => {
  const accent = overrides?.accent || "#8554E8";
  const w = (i: number, s: string) => overrides?.words?.[i] ?? s;
  const resolveAsset = (value: string) => /^(https?:|data:|blob:|\/)/.test(value) ? value : staticFile(value);
  const asset = (name: string) => overrides?.assets?.[name] ? resolveAsset(overrides.assets[name]) : media(name);
  let content: React.ReactNode = null;
  if (id === "N023") {
    content = <ComparisonWindows t={t} words={overrides?.words} accent={accent}
      films={[1,2].map(i=>overrides?.assets?.[`film${i}`]?resolveAsset(overrides.assets[`film${i}`]):asset(`clean-film${i}.mp4`))}
      closeups={[1,2].map(i=>overrides?.assets?.[`closeup${i}`]?resolveAsset(overrides.assets[`closeup${i}`]):'')}
      actor={overrides?.assets?.actor?resolveAsset(overrides.assets.actor):undefined}/>;
  }
  if (id === "N025") {
    const p = q(t, 1.8, 2.7),
      exit = q(t, 4.15, 4.8);
    content = (
      <>
        <div
          style={{
            ...pos(mix(480, 200, p), 100),
            transform: `scale(${mix(1, 0.94, exit)})`,
          }}
        >
          <Avatar src={asset("think.webm")} />
        </div>
        <div
          style={{
            ...pos(110 - mix(0, 650, p), -230 - t * 72, 440),
            opacity: 1 - p,
          }}
        >
          {[0, 1, 2, 3, 0, 1].map((n, i) => (
            <Pane
              key={i}
              style={{
                position: "relative",
                width: 420,
                height: 238,
                marginBottom: 30,
              }}
            >
              <Picture src={asset("image" + (n + 1) + ".jpg")} />
            </Pane>
          ))}
        </div>
        <Pane
          dark
          style={{ ...pos(mix(2050, 1190, p) + exit * 750, 60, 510, 960) }}
        >
          <Bar dark title="剪辑时间线" />
          <div style={{ padding: 30 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                style={{
                  height: 46,
                  marginBottom: 16,
                  display: "flex",
                  gap: 9,
                }}
              >
                {[0, 1, 2].map((_, j) => (
                  <div
                    key={j}
                    style={{
                      width: 80 + ((i + j) % 3) * 34,
                      background: j === 1 ? accent : "#4b4b50",
                      borderRadius: 6,
                      fontSize: 13,
                      padding: 12,
                      color: "white",
                    }}
                  >
                    片段 {i + 1}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ ...pos(240, 100, 3, 850), background: "white" }} />
        </Pane>
      </>
    );
  }
  if (id === "N026") {
    content = <UploadToPhone t={t} words={overrides?.words} accent={accent} assets={Object.fromEntries(Object.entries(overrides?.assets??{}).map(([key,value])=>[key,resolveAsset(value)]))}/>;
  }
  if (id === "N027") {
    content = <ChalkBoard frame={Math.round(t * 60)} words={overrides?.words} accent={accent} />;
  }
  if (id === "N030") {
    content = (
      <>
        <N030SearchRepair t={t} query={w(0,"AI编程")}/>
        {[0, 1].map((i) => (
          <Phone
            key={i}
            style={{
              left: 380 + i * 720,
              top: mix(1200, 200, q(t, 2.65 + i * 0.25, 3.2 + i * 0.25)),
              transform: "scale(.9)",
              transformOrigin: "top left",
            }}
            title={i ? "精选作品" : "搜索结果"}
          >
            <div
              style={{
                padding: 22,
                transform: `translateY(${-q(t, 3.8, 5.5) * 90}px)`,
              }}
            >
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    gap: 15,
                    marginBottom: 22,
                    alignItems: "center",
                  }}
                >
                  <Picture
                    src={asset("image" + n + ".jpg")}
                    style={{
                      width: i ? 165 : 120,
                      height: 120,
                      borderRadius: 12,
                    }}
                  />
                  <div style={{ fontSize: 23, lineHeight: 1.5 }}>
                    从想法到作品
                    <br />
                    <span style={{ fontSize: 17, color: "#888" }}>
                      Fred 创作实践
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Phone>
        ))}
      </>
    );
  }
  if (id === "N031") { content = <SkillsResume t={t} accent={accent}/>; }
  if (id === "N047") { content = <PhoneUnlock t={t} accent={accent} assets={overrides?.assets}/>; }
  if (id === "N049") { content = <AskAiHomepage t={t} words={[w(0,"有问题"),w(1,"找AI")]} accent={accent}/>; }
  if (id === "N052") {
    // Actor is retained temporarily until the composition-matched H3 replacement arrives.
    // Typography stays at reference anchors; it must never be shifted to hide a palm mismatch.
    content = (
      <>
        <Img
          src={asset(`palms/${String(Math.min(108, Math.floor(t * 24) + 1)).padStart(4, "0")}.png`)}
          style={{ ...pos(19, -5, 1882, 1075), objectFit: "contain" }}
        />
        {[w(0, "找到工作"), w(1, "简化工作")].map((s, i) => {
          const enter = wordAlpha[i ? "left" : "right"][Math.min(269, Math.max(0, Math.round(t * 60)))];
          return <div key={i} style={{
            ...pos(i ? 113 : 1319, i ? 524 : 548),
            fontFamily: "NanoTik", fontWeight: 700, fontSize: 166,
            lineHeight: 1, letterSpacing: -5.5, whiteSpace: "nowrap",
            color: "#000", opacity: enter,
            textShadow: "5px 8px 10px #0006",
          }}>{s}</div>;
        })}
      </>
    );
  }
  if (id === "N054") { content = <UsageEvidence t={t} words={overrides?.words} accent={accent}/>; }
  if (id === "X032") {
    content = <PhoneAndTypes t={t} words={overrides?.words} accent={accent} wallpaper={overrides?.assets?.wallpaper ? resolveAsset(overrides.assets.wallpaper) : undefined}/>;
  }
  if (id === "X037") {
    content = <IllustrationGrid t={t} assets={Object.fromEntries(Object.entries(overrides?.assets??{}).map(([key,value])=>[key,resolveAsset(value)]))}/>;
  }
  if (id === "X039") {
    content = <HandwritingGrid t={t} words={overrides?.words} accent={accent}/>;
  }
  if (id === "X040") {
    content = <MediaWorkflow t={t} accent={accent}/>;
  }
  if (id === "X043") { content = <ChatFileExchange t={t} accent={accent} words={overrides?.words} assets={overrides?.assets}/>; }
  if (id === "X050") {
    const blur = q(t, 1.35, 1.6) * (1 - q(t, 3.2, 3.7)) + q(t, 7.9, 8.3);
    content = <>
      <Pane style={{ ...pos(160, 80, 1600, 920), filter: `blur(${blur * 9}px)` }}>
        <Document t={t} accent={accent} />
      </Pane>
      <X050TypographyRepair t={t} accent={accent} words={overrides?.words}/>
    </>;
  }
  return (
    <AbsoluteFill
      style={{ background: "white", color: "#171719", overflow: "hidden" }}
    >
      {content}
    </AbsoluteFill>
  );
};
