import React, { useEffect, useRef, useState } from "react";
import { Player } from "@remotion/player";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { tokens } from "../tokens.js";
import { FrostedFocus, ObjectHandoff } from "./vendor/ContentMotion.tsx";
import { phase } from "./vendor/motion-state.mjs";
import {
  Canvas,
  colors,
  FPS,
  HEIGHT,
  LabelSurface,
  Subtitle,
  TextFit,
  WIDTH,
} from "./shared.jsx";

function Relay({ time, items, tone, accent }) {
  const theme = colors(tone);
  const stride = 2.5;
  return (
    <>
      {items.map((item, index) => {
        const enterAt = index * stride;
        const enter = index === 0 ? 1 : phase(time, enterAt, enterAt + 0.65);
        const yieldAt = (index + 1) * stride;
        const yields =
          index === items.length - 1 ? 0 : phase(time, yieldAt, yieldAt + 0.65);
        const retire = phase(time, yieldAt + stride, yieldAt + stride + 0.45);
        if (time < enterAt || retire === 1) return null;
        const scale = 1 - 0.48 * yields;
        const x = 140 + (1 - enter) * 850 - 70 * yields;
        const y = 173 - 104 * yields;
        const opacity = (1 - yields * 0.53) * (1 - retire);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 680,
              height: 164,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              opacity,
              zIndex: index,
            }}
          >
            <LabelSurface
              box={[0, 0, 680, 164]}
              text={item}
              fill={theme.surface}
              color={theme.ink}
              accent={accent && index === items.length - 1}
              fontSize={55}
              minSize={36}
              radius={32}
            />
          </div>
        );
      })}
    </>
  );
}

function Focus({ time, items, tone, accent }) {
  const theme = colors(tone);
  const progress = phase(time, 2.5, 3.3) * (1 - phase(time, 6.5, 7.3));
  const rowHeight = Math.min(110, 360 / items.length);
  const rowTop = 60 + (360 - items.length * rowHeight) / 2;
  const background = (
    <div style={{ position: "absolute", inset: 0 }}>
      {items.map((item, index) => (
        <LabelSurface
          key={index}
          box={[
            110 + (index % 2) * 50,
            rowTop + index * rowHeight,
            690,
            rowHeight - 12,
          ]}
          text={item}
          fill={theme.surface}
          color={index === items.length - 1 ? theme.ink : theme.muted}
          fontSize={31}
          minSize={27}
          radius={18}
          padding="6px 28px"
        />
      ))}
    </div>
  );
  const foreground = (
    <div
      style={{
        position: "absolute",
        left: 180,
        top: 170 + 24 * (1 - progress),
        width: 600,
        height: 160,
        opacity: progress,
      }}
    >
      <LabelSurface
        box={[0, 0, 600, 160]}
        text={items.at(-1)}
        fill={tone === "dark" ? "#fff" : "#171719"}
        color={tone === "dark" ? "#171719" : "#fff"}
        accent={accent}
        fontSize={54}
        minSize={36}
        radius={32}
        shadow={tokens.shadow.floating}
      />
    </div>
  );
  return (
    <FrostedFocus
      background={background}
      foreground={foreground}
      progress={progress}
      tone={tone}
      blur={16}
      tintOpacity={tone === "dark" ? 0.42 : 0.48}
    />
  );
}

function Handoff({ time, items, tone, accent }) {
  const stride = 2.8;
  const segment = Math.min(
    items.length - 2,
    Math.floor(Math.max(0, time - 0.5) / stride),
  );
  const localTime = time - 0.5 - segment * stride;
  const left = [80, 158, 380, 180];
  const right = [500, 158, 380, 180];
  const from = segment % 2 === 0 ? left : right;
  const to = segment % 2 === 0 ? right : left;
  const content = (text, isResult) => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#fff",
        borderRadius: 28,
        color: "#171719",
      }}
    >
      <div style={{ position: "absolute", inset: "24px 30px" }}>
        <TextFit
          maxSize={45}
          minSize={32}
          color={accent && isResult ? tokens.color.accent : "#171719"}
        >
          {text}
        </TextFit>
      </div>
    </div>
  );
  return (
    <ObjectHandoff
      time={localTime}
      from={from}
      to={to}
      travel={[0.6, 1.7]}
      swap={[0.9, 1.45]}
      before={content(items[segment], false)}
      after={content(items[segment + 1], segment + 1 === items.length - 1)}
    />
  );
}

export function DemoSceneAtTime({
  time,
  kind,
  items,
  tone = "light",
  accent = false,
  showSubtitle = false,
}) {
  const Scene = kind === "focus" ? Focus : kind === "handoff" ? Handoff : Relay;
  return (
    <Canvas tone={tone}>
      <Scene time={time} items={items} tone={tone} accent={accent} />
      <Subtitle visible={showSubtitle} />
    </Canvas>
  );
}

export function DemoComposition(props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <DemoSceneAtTime {...props} time={frame / fps} />;
}

export function demoDurationFrames(kind, count) {
  const seconds =
    kind === "focus"
      ? 8.4
      : kind === "handoff"
        ? 0.5 + (count - 1) * 2.8 + 1
        : count * 2.5 + 0.8;
  return Math.ceil(seconds * FPS);
}

export default function AnimatedStage(props) {
  const seconds =
    props.kind === "focus"
      ? 8.4
      : props.kind === "handoff"
        ? 0.5 + (props.items.length - 1) * 2.8 + 1
        : props.items.length * 2.5 + 0.8;
  const duration = Math.ceil(seconds * FPS);
  const player = useRef(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const current = player.current;
    const update = (event) => setFrame(event.detail.frame);
    const play = () => setPlaying(true),
      pause = () => setPlaying(false);
    current?.addEventListener("frameupdate", update);
    current?.addEventListener("play", play);
    current?.addEventListener("pause", pause);
    setFrame(0);
    setPlaying(false);
    return () => {
      current?.removeEventListener("frameupdate", update);
      current?.removeEventListener("play", play);
      current?.removeEventListener("pause", pause);
    };
  }, [props.kind, props.items.length]);
  return (
    <div className="motion-player">
      <Player
        key={`${props.kind}-${props.items.length}`}
        ref={player}
        component={DemoComposition}
        inputProps={props}
        compositionWidth={WIDTH}
        compositionHeight={HEIGHT}
        fps={FPS}
        durationInFrames={duration}
        controls={false}
        loop
        autoPlay={false}
        clickToPlay
        doubleClickToFullscreen
        showVolumeControls={false}
        spaceKeyToPlayOrPause={false}
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          background: colors(props.tone).canvas,
        }}
      />
      <div className="demo-transport">
        <button
          onClick={() => player.current?.toggle()}
          aria-label={playing ? "暂停动画" : "播放动画"}
        >
          {playing ? "暂停" : "播放"}
        </button>
        <input
          type="range"
          aria-label="动画时间轴"
          min={0}
          max={duration - 1}
          value={Math.min(frame, duration - 1)}
          onChange={(e) => {
            player.current?.pause();
            player.current?.seekTo(Number(e.target.value));
          }}
        />
        <span>
          {(frame / FPS).toFixed(1)} / {seconds.toFixed(1)} s
        </span>
        <button
          onClick={() => player.current?.requestFullscreen()}
          aria-label="全屏动画"
        >
          全屏
        </button>
      </div>
    </div>
  );
}
