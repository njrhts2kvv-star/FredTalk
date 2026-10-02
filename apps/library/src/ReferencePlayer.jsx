import React, { useEffect, useMemo, useRef, useState } from "react";

const EPSILON = 0.00001;
const assetUrl = (value) =>
  typeof value === "string" && value.startsWith("/api/design-assets/");
const clamp = (value, minimum, maximum) =>
  Math.max(minimum, Math.min(maximum, value));
const formatTime = (value) => {
  const milliseconds = Math.max(0, Math.round((Number(value) || 0) * 1000));
  const seconds = Math.floor(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}.${String(milliseconds % 1000).padStart(3, "0")}`;
};

function normalizePreview(preview, index) {
  const start = Number(preview?.start);
  const end = Number(preview?.end);
  const fps = Number(preview?.fps);
  const validRange =
    Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end > start;
  const validUrl = assetUrl(preview?.videoUrl);
  let unavailable = "";
  if (!preview?.available || !preview?.videoUrl)
    unavailable =
      preview.unavailableReason || "视频尚未在本地。当前可查看已有静帧；下载素材包后刷新页面。";
  else if (!validUrl)
    unavailable = "视频地址不属于当前资料接口，无法确认这段素材。";
  else if (!validRange)
    unavailable = "这段素材的起止区间缺失或无效，请先检查原始记录。";
  return {
    label: preview?.label || `片段 ${index + 1}`,
    videoUrl: preview?.videoUrl,
    posterUrl: preview?.posterUrl || undefined,
    start,
    end,
    fps: Number.isFinite(fps) && fps > 0 ? fps : null,
    unavailable,
  };
}

/** Plays declared source intervals; this component never changes library records. */
export default function ReferencePlayer({ previews = [], autoPlay = false, compact = false, onComplete }) {
  const playlistKey = JSON.stringify(previews);
  const segments = useMemo(() => previews.map(normalizePreview), [playlistKey]);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [range, setRange] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);

  const [error, setError] = useState("");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const video = useRef(null);
  const controls = useRef(null);
  const continuePlayback = useRef(false);
  const loopRef = useRef(loop);
  const speedRef = useRef(speed);
  const current = segments[segmentIndex];
  loopRef.current = loop;
  speedRef.current = speed;

  useEffect(() => {
    continuePlayback.current = autoPlay;
    setSegmentIndex(0);
  }, [playlistKey, autoPlay]);

  useEffect(() => {
    const element = video.current;
    const autoplayNext = continuePlayback.current;
    continuePlayback.current = false;
    setReady(false);
    setPlaying(false);
    setError("");
    setRange(null);
    setPosition(Number.isFinite(current?.start) ? current.start : 0);
    controls.current = null;
    if (!element || !current || current.unavailable) return undefined;

    let disposed = false;
    let bounds = null;
    let advancing = false;
    let pendingAutoplay = autoplayNext;
    let frameCallback = null;
    let animationFrame = null;

    const stopMonitor = () => {
      if (frameCallback !== null && element.cancelVideoFrameCallback)
        element.cancelVideoFrameCallback(frameCallback);
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      frameCallback = null;
      animationFrame = null;
    };
    const play = () => {
      if (disposed || !bounds) return;
      advancing = false;
      setError("");
      element.playbackRate = speedRef.current;
      element.play().catch((reason) => {
        if (!disposed && reason.name !== "AbortError")
          setError("播放未能开始，请再次点击播放。");
      });
    };
    const seek = (value) => {
      if (!bounds || !Number.isFinite(value)) return;
      element.pause();
      pendingAutoplay = false;
      advancing = false;
      const next = clamp(value, bounds.start, bounds.last);
      element.currentTime = next;
      setPosition(next);
    };
    const finish = () => {
      if (disposed || advancing || !bounds) return;
      advancing = true;
      element.pause();
      element.currentTime = bounds.last;
      setPosition(bounds.last);
      const next =
        segmentIndex + 1 < segments.length
          ? segmentIndex + 1
          : loopRef.current
            ? 0
            : null;
      if (next === segmentIndex) {
        element.currentTime = bounds.start;
        setPosition(bounds.start);
        play();
      } else if (next !== null) {
        continuePlayback.current = true;
        setSegmentIndex(next);
      } else if (compact) {
        onCompleteRef.current?.();
      }
    };
    const observeFrame = (_, metadata) => {
      frameCallback = null;
      if (disposed || element.paused || !bounds) return;
      setPosition(clamp(element.currentTime, bounds.start, bounds.last));
      // Stop on the final included frame, before the first excluded frame can
      // be presented. end is exclusive; the native whole-file scrubber is off.
      if (metadata.mediaTime >= bounds.last - EPSILON) finish();
      else frameCallback = element.requestVideoFrameCallback(observeFrame);
    };
    const observeTime = () => {
      animationFrame = null;
      if (disposed || element.paused || !bounds) return;
      setPosition(clamp(element.currentTime, bounds.start, bounds.last));
      if (element.currentTime >= bounds.last - EPSILON) finish();
      else animationFrame = requestAnimationFrame(observeTime);
    };
    const onPlay = () => {
      setPlaying(true);
      stopMonitor();
      if (element.requestVideoFrameCallback)
        frameCallback = element.requestVideoFrameCallback(observeFrame);
      else animationFrame = requestAnimationFrame(observeTime);
    };
    const onPause = () => {
      setPlaying(false);
      stopMonitor();
    };
    const onReadyToPlay = () => {
      if (
        pendingAutoplay &&
        bounds &&
        !element.seeking &&
        element.readyState >= 2
      ) {
        pendingAutoplay = false;
        play();
      }
    };
    const onMetadata = () => {
      if (!Number.isFinite(element.duration) || element.duration <= 0) {
        setError("无法读取这段素材的实际时长。");
        return;
      }
      const durationTolerance = current.fps ? 1 / current.fps : 0.02;
      if (
        current.start >= element.duration ||
        current.end > element.duration + durationTolerance
      ) {
        setError("记录中的准确区间超出了实际视频时长，请检查对应源文件。");
        return;
      }
      const end = Math.min(current.end, element.duration);
      const last = current.fps
        ? Math.max(
            current.start,
            Math.floor((end - EPSILON) * current.fps) / current.fps,
          )
        : Math.max(current.start, end - 0.001);
      bounds = { start: current.start, end, last };
      setRange(bounds);
      element.playbackRate = speedRef.current;
      element.currentTime = bounds.start;
      setPosition(bounds.start);
      setReady(true);
      controls.current = {
        toggle() {
          if (!element.paused) {
            element.pause();
            return;
          }
          if (element.currentTime >= bounds.last - EPSILON)
            element.currentTime = bounds.start;
          play();
        },
        seek,
        frame(direction) {
          if (!current.fps) return;
          seek(
            (Math.round(element.currentTime * current.fps) + direction) /
              current.fps,
          );
        },
      };
      onReadyToPlay();
    };
    const onTimeUpdate = () => {
      if (!bounds) return;
      setPosition(clamp(element.currentTime, bounds.start, bounds.last));
      if (!element.paused && element.currentTime >= bounds.end - EPSILON)
        finish();
    };
    const onSeeking = () => {
      if (!bounds) return;
      const bounded = clamp(element.currentTime, bounds.start, bounds.last);
      if (Math.abs(element.currentTime - bounded) > EPSILON)
        element.currentTime = bounded;
      setPosition(bounded);
    };
    const onError = () => {
      pendingAutoplay = false;
      element.pause();
      setReady(false);
      setError("这段源视频暂时无法播放，请检查本地文件是否完整。");
    };
    const listeners = {
      loadedmetadata: onMetadata,
      canplay: onReadyToPlay,
      seeked: onReadyToPlay,
      play: onPlay,
      pause: onPause,
      timeupdate: onTimeUpdate,
      seeking: onSeeking,
      ended: finish,
      error: onError,
    };
    Object.entries(listeners).forEach(([event, listener]) =>
      element.addEventListener(event, listener),
    );
    element.src = current.videoUrl;
    element.load();
    return () => {
      disposed = true;
      pendingAutoplay = false;
      stopMonitor();
      Object.entries(listeners).forEach(([event, listener]) =>
        element.removeEventListener(event, listener),
      );
      controls.current = null;
      element.pause();
      element.removeAttribute("src");
      element.load();
    };
  }, [playlistKey, segmentIndex]);

  const selectSegment = (index) => {
    video.current?.pause();
    continuePlayback.current = false;
    if (index === segmentIndex) controls.current?.seek(range?.start);
    else setSegmentIndex(index);
  };
  const unavailable =
    current?.unavailable || (!current ? "当前记录没有可播放的预览区间。" : "");
  const canStep = ready && Boolean(current?.fps);
  const displayedPosition = range
    ? clamp(position, range.start, range.last)
    : 0;

  return (
    <div data-reference-player data-segment-index={segmentIndex} className={compact ? "reference-inline-player" : undefined}>
      <div className="video-stage">
        {unavailable ? (
          <div className="media-unavailable">
            {current?.posterUrl && (
              <img src={current.posterUrl} alt="现有参考静帧" />
            )}
            <div>
              <strong>当前片段无法播放</strong>
              <p>{unavailable}</p>
            </div>
          </div>
        ) : (
          <video
            ref={video}
            onClick={compact ? () => controls.current?.toggle() : undefined}
            onPlay={compact ? (event) => {
              document.querySelectorAll(".reference-inline-player video").forEach((other) => {
                if (other !== event.currentTarget) other.pause();
              });
            } : undefined}
            poster={current.posterUrl}
            playsInline
            preload="metadata"
            muted
            aria-label={`${current.label}，只播放已记录区间`}
          />
        )}
      </div>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <div className="video-controls">
        <button
          type="button"
          onClick={() => controls.current?.toggle()}
          disabled={!ready}
        >
          {playing ? "暂停" : "播放"}
        </button>
        <button
          type="button"
          onClick={() => controls.current?.frame(-1)}
          disabled={!canStep}
          title={!current?.fps ? "没有准确帧率，无法逐帧查看" : undefined}
        >
          ← 上一帧
        </button>
        <button
          type="button"
          onClick={() => controls.current?.frame(1)}
          disabled={!canStep}
          title={!current?.fps ? "没有准确帧率，无法逐帧查看" : undefined}
        >
          下一帧 →
        </button>
        <select
          aria-label="播放速度"
          value={speed}
          onChange={(event) => {
            const value = Number(event.target.value);
            setSpeed(value);
            if (video.current) video.current.playbackRate = value;
          }}
        >
          <option value={1}>正常速度</option>
          <option value={0.5}>半速</option>
          <option value={0.25}>四分之一速</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={loop}
            onChange={(event) => setLoop(event.target.checked)}
          />
          整体循环
        </label>
        <span>{current?.fps ? `${current.fps} fps` : "帧率未记录"}</span>
      </div>
      <div className="video-controls" style={{ gap: 12 }}>
        <input
          type="range"
          aria-label="当前片段进度"
          min={range?.start ?? 0}
          max={range?.last ?? 1}
          step={current?.fps ? 1 / current.fps : 0.001}
          value={displayedPosition}
          disabled={!ready}
          onChange={(event) =>
            controls.current?.seek(Number(event.target.value))
          }
          style={{ flex: "1 1 180px", minWidth: 0 }}
        />
        <output aria-label="当前参考片段时间">
          {formatTime(displayedPosition)}
        </output>
        {range && (
          <span>
            区间 {formatTime(range.start)} – {formatTime(range.end)}
          </span>
        )}
      </div>
      {segments.length > 1 && (
        <div className="segmented" role="group" aria-label="预览片段">
          {segments.map((preview, index) => (
            <button
              key={index}
              type="button"
              aria-pressed={segmentIndex === index}
              className={segmentIndex === index ? "active" : ""}
              onClick={() => selectSegment(index)}
            >
              {preview.label}
              {preview.unavailable ? " · 未就绪" : ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
