import React, { useEffect, useRef, useState } from "react";

// Decode a selected source frame only when this example approaches the viewport.
// The source is never played, modified, or saved back into the reference library.
export function CasePoster({ item, example, preview, onOpen }) {
  const button = useRef(null);
  const [captured, setCaptured] = useState(null);
  const selection = example.posterFrame;
  const source = selection && item.previews?.[selection.previewIndex || 0];
  const time = selection?.time;
  const identity = source?.videoUrl + ":" + time;
  useEffect(() => {
    if (
      !source?.available ||
      !Number.isFinite(time) ||
      time < source.start ||
      time >= source.end
    )
      return;
    let disposed = false;
    let video = null;
    const release = () => {
      if (!video) return;
      video.pause();
      video.onloadedmetadata =
        video.onloadeddata =
        video.onseeked =
        video.onerror =
          null;
      video.removeAttribute("src");
      video.load();
      video = null;
    };
    const capture = () => {
      if (
        disposed ||
        !video ||
        video.seeking ||
        video.readyState < 2 ||
        Math.abs(video.currentTime - time) > 0.04
      )
        return;
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(1280, video.videoWidth);
      canvas.height = Math.round(
        (canvas.width * video.videoHeight) / video.videoWidth,
      );
      const context = canvas.getContext("2d");
      if (context && canvas.height > 0) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCaptured({ identity, url: canvas.toDataURL("image/jpeg", 0.9) });
      }
      release();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (disposed || !entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        video = document.createElement("video");
        video.muted = true;
        video.playsInline = true;
        video.preload = "auto";
        video.onloadedmetadata = () => {
          if (video) video.currentTime = time;
        };
        video.onloadeddata = capture;
        video.onseeked = capture;
        video.onerror = release;
        video.src = source.videoUrl;
        video.load();
      },
      { rootMargin: "200px" },
    );
    if (button.current) observer.observe(button.current);
    return () => {
      disposed = true;
      observer.disconnect();
      release();
    };
  }, [
    source?.videoUrl,
    source?.available,
    source?.start,
    source?.end,
    time,
    identity,
  ]);
  const posterUrl =
    captured?.identity === identity ? captured.url : preview?.posterUrl;
  return (
    <button
      ref={button}
      className="case-poster"
      aria-label={"播放案例 " + item.label}
      onClick={onOpen}
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={example.title}
          loading="lazy"
          data-captured-frame={
            captured?.identity === identity ? time : undefined
          }
        />
      ) : (
        <span className="case-poster-fallback">
          {item.label} · {example.title}
        </span>
      )}
      <span className="case-play">
        {preview?.available ? "播放真实案例" : "查看素材状态"}
      </span>
    </button>
  );
}
