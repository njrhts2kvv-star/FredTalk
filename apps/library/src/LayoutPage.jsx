import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BrandPreview } from "./FoundationPages.jsx";
import { Heading, Segmented } from "./UI.jsx";
import "./layout-page.css";

const SHORT_SUBTITLE = "先把内容讲清楚，再进入下一句。";
const LONG_SUBTITLE =
  "同一句话变长后，字幕黑框会随真实文字换行，正文只需要避开当前出现的这一块。";
const MODES = [
  ["body", "正文排布"],
  ["compare", "两项对比"],
  ["cards", "密集卡片"],
  ["media", "全屏媒体"],
];
const MEDIA_REFERENCES = [
  "remake:9f907122-a240-4e79-8682-9404df4200bb",
  "remake:41038f87-c9f4-442b-ad5f-70c691f21475",
  "remake:library-round2-04",
  "clip:ep99-selected-s05",
];

function SampleContent({ mode }) {
  if (mode === "compare")
    return (
      <div className="layout-lab-comparison">
        <article className="layout-lab-block layout-lab-block-dark">
          <h2>只看结果</h2>
          <p>
            知道发生了什么
            <br />
            却不知道为什么
          </p>
          <strong className="layout-lab-outcome">一个结论</strong>
        </article>
        <article className="layout-lab-block">
          <h2>看见过程</h2>
          <p>
            对象怎样变化
            <br />
            结果就怎样成立
          </p>
          <strong className="layout-lab-outcome">
            理解<span>关系</span>
          </strong>
        </article>
      </div>
    );
  if (mode === "cards")
    return (
      <div className="layout-lab-card-grid">
        {[
          "建立对象",
          "发生变化",
          "重点聚焦",
          "稳定阅读",
          "承接上句",
          "接入下句",
        ].map((text, index) => (
          <article
            key={text}
            className={
              "layout-lab-block " + (index === 1 ? "layout-lab-block-dark" : "")
            }
          >
            <strong>{text}</strong>
            <p>
              {
                [
                  "先认出在讲什么",
                  "演出真正的变化",
                  "让当前重点清楚",
                  "给足读完的时间",
                  "保留必要上下文",
                  "把重点自然交接",
                ][index]
              }
            </p>
          </article>
        ))}
      </div>
    );
  return (
    <div className="layout-lab-reading">
      <article className="layout-lab-block layout-lab-block-dark layout-lab-main-thought">
        <h2>
          先理解<span>内容</span>
          <br />
          再决定画面
        </h2>
        <p>
          对象、关系、变化
          <br />
          都来自这一句话
        </p>
      </article>
      <div className="layout-lab-support">
        <article className="layout-lab-block">
          <h3>
            把对象
            <br />
            放到足够大
          </h3>
        </article>
        <article className="layout-lab-block">
          <h3>
            让观众
            <br />
            看清楚变化
          </h3>
        </article>
      </div>
    </div>
  );
}

function useSubtitleBounds(stageRef, subtitleRef, shown, text) {
  const [bounds, setBounds] = useState(null);
  useLayoutEffect(() => {
    let active = true;
    const measure = () => {
      if (!active) return;
      const stage = stageRef.current?.getBoundingClientRect();
      const box =
        shown && text.trim()
          ? subtitleRef.current?.getBoundingClientRect()
          : null;
      if (!stage || !box || !stage.width || !stage.height) {
        setBounds(null);
        return;
      }
      const next = {
        x: ((box.left - stage.left) / stage.width) * 100,
        y: ((box.top - stage.top) / stage.height) * 100,
        width: (box.width / stage.width) * 100,
        height: (box.height / stage.height) * 100,
      };
      const dimensions = ["x", "y", "width", "height"];
      setBounds((previous) =>
        previous &&
        dimensions.every(
          (field) => Math.abs(next[field] - previous[field]) < 0.01,
        )
          ? previous
          : next,
      );
    };
    const observer = new ResizeObserver(measure);
    if (stageRef.current) observer.observe(stageRef.current);
    if (subtitleRef.current) observer.observe(subtitleRef.current);
    document.fonts?.ready.then(measure);
    measure();
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [stageRef, subtitleRef, shown, text]);
  return bounds;
}

export function LayoutPage({ data, children }) {
  const instance = useId();
  const [mode, setMode] = useState("body"),
    [tone, setTone] = useState("light");
  const [subtitleOn, setSubtitleOn] = useState(true),
    [guides, setGuides] = useState(true);
  const [subtitleText, setSubtitleText] = useState(SHORT_SUBTITLE),
    [playing, setPlaying] = useState(false);
  const stageRef = useRef(null),
    subtitleRef = useRef(null),
    videoRef = useRef(null),
    requestedMedia = useRef(null);
  const subtitleBounds = useSubtitleBounds(
    stageRef,
    subtitleRef,
    subtitleOn,
    subtitleText,
  );
  const bottom = subtitleBounds ? Math.max(14, 100 - subtitleBounds.y + 2) : 5;
  const bodyHeight = 100 - 12 - bottom;
  const variant =
    data?.branding?.variants?.[
      tone === "dark" ? "darkBackground" : "lightBackground"
    ];
  const brand = variant?.destination,
    base = data?.branding?.baseCanvas;
  const mediaItem = useMemo(() => {
    const available =
      data?.items?.filter(
        (item) =>
          !item.hiddenReason &&
          item.reviewStatus !== "remove" &&
          item.previews?.some((preview) => preview.available),
      ) || [];
    return MEDIA_REFERENCES.map((id) =>
      available.find((item) => item.id === id),
    ).find(Boolean);
  }, [data]);
  const media = mediaItem?.previews?.find((preview) => preview.available);
  const mediaIdentity = `${mediaItem?.id || ""}|${media?.videoUrl || ""}|${mediaItem?.reviewStatus || ""}`;
  useEffect(() => {
    const closeOther = (event) => {
      if (event.detail !== instance) {
        videoRef.current?.pause();
        setPlaying(false);
      }
    };
    window.addEventListener("fred-case-open", closeOther);
    return () => window.removeEventListener("fred-case-open", closeOther);
  }, [instance]);
  useEffect(() => {
    videoRef.current?.pause();
    setPlaying(false);
  }, [mediaIdentity]);
  useEffect(() => {
    if (mode !== "media") {
      setPlaying(false);
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    if (requestedMedia.current !== mediaIdentity) {
      video.pause();
      setPlaying(false);
      return;
    }
    if (playing) video.play().catch(() => setPlaying(false));
    else video.pause();
  }, [mode, playing, mediaIdentity]);
  const togglePlayback = () => {
    if (playing) {
      videoRef.current?.pause();
      setPlaying(false);
      return;
    }
    requestedMedia.current = mediaIdentity;
    window.dispatchEvent(
      new CustomEvent("fred-case-open", { detail: instance }),
    );
    setPlaying(true);
  };
  const subtitleLabel = subtitleBounds
    ? `${Math.round(subtitleBounds.width)}% 宽 × ${Math.round(subtitleBounds.height)}% 高`
    : "当前没有字幕占用";

  return (
    <div className="layout-lab">
      <Heading page="layout" />
      <div className="layout-lab-intro">
        <p>先把内容放大，再看哪里真正需要避让。</p>
        <span>切换示例，看同一块画布如何重新分配。</span>
      </div>
      <div className="layout-lab-mode">
        <Segmented
          label="布局示例"
          value={mode}
          onChange={setMode}
          items={MODES}
        />
      </div>
      <section className="layout-lab-workbench" aria-label="可交互布局示范">
        <div
          className={
            "layout-lab-stage " +
            (tone === "dark" ? "is-dark" : "") +
            (mode === "media" ? " is-media" : "")
          }
          ref={stageRef}
          data-layout-stage
          style={{ "--body-bottom": `${bottom}%` }}
        >
          {mode === "media" ? (
            media ? (
              <video
                className="layout-lab-media"
                ref={videoRef}
                src={media.videoUrl}
                poster={media.posterUrl || undefined}
                muted
                playsInline
                preload="metadata"
                aria-label="铺满画布的真实视觉库素材"
                onLoadedMetadata={(event) => {
                  event.currentTarget.currentTime = media.start || 0;
                }}
                onTimeUpdate={(event) => {
                  if (media.end && event.currentTarget.currentTime >= media.end)
                    event.currentTarget.currentTime = media.start || 0;
                }}
                onEnded={() => setPlaying(false)}
              />
            ) : (
              <div className="layout-lab-media-empty">
                <strong>媒体可以铺满全画布</strong>
                <p>连接视觉库后，在这里播放真实素材。</p>
              </div>
            )
          ) : (
            <div
              className={"layout-lab-composition is-" + mode}
              data-layout-body
            >
              <SampleContent mode={mode} />
            </div>
          )}
          {mode !== "media" && subtitleBounds && subtitleBounds.width < 48 && (
            <div
              className="layout-lab-side-content"
              aria-label="字幕两侧仍可放置内容"
            >
              <span>保留上下文</span>
              <span>承接下一句</span>
            </div>
          )}
          <BrandPreview branding={data?.branding} tone={tone} />
          {subtitleOn && subtitleText.trim() && (
            <div className="layout-lab-subtitle">
              <span ref={subtitleRef} data-subtitle-box>
                {subtitleText}
              </span>
            </div>
          )}
          {guides && (
            <div className="layout-lab-guides" aria-hidden="true">
              <div className="layout-lab-body-guide" />
              {variant?.available && brand && base && (
                <div
                  className="layout-lab-occupied layout-lab-brand-guide"
                  style={{
                    left: `${(brand.x / base.width) * 100}%`,
                    top: `${(brand.y / base.height) * 100}%`,
                    width: `${(brand.width / base.width) * 100}%`,
                    height: `${(brand.height / base.height) * 100}%`,
                  }}
                />
              )}
              {subtitleBounds && (
                <div
                  className="layout-lab-occupied layout-lab-subtitle-guide"
                  data-subtitle-boundary
                  style={{
                    left: `${subtitleBounds.x}%`,
                    top: `${subtitleBounds.y}%`,
                    width: `${subtitleBounds.width}%`,
                    height: `${subtitleBounds.height}%`,
                  }}
                />
              )}
            </div>
          )}
        </div>
        <div className="layout-lab-caption" aria-live="polite">
          <strong>
            {mode === "media"
              ? "媒体始终可以铺满 100% 画布"
              : subtitleBounds
                ? "正文放大，字幕两侧仍可利用"
                : "字幕关闭，正文向下展开"}
          </strong>
          <span>
            {mode === "media" && mediaItem
              ? `真实素材：${mediaItem.label} · ${mediaItem.title}`
              : `当前正文示意高度约 ${Math.round(bodyHeight)}%`}
          </span>
        </div>
      </section>

      <div className="layout-lab-controls">
        <div className="layout-lab-switches">
          <Segmented
            label="画布底色"
            value={tone}
            onChange={setTone}
            items={[
              ["light", "浅色背景"],
              ["dark", "深色背景"],
            ]}
          />
          <label>
            <input
              type="checkbox"
              checked={subtitleOn}
              onChange={(event) => setSubtitleOn(event.target.checked)}
            />
            显示字幕
          </label>
          <label>
            <input
              type="checkbox"
              checked={guides}
              onChange={(event) => setGuides(event.target.checked)}
            />
            显示局部占用
          </label>
          {mode === "media" && media && (
            <button className="layout-lab-play" onClick={togglePlayback}>
              {playing ? "暂停媒体示例" : "播放媒体示例"}
            </button>
          )}
        </div>
        <div className="layout-lab-subtitle-edit">
          <label htmlFor="layout-subtitle-text">
            试试不同长度的字幕<span>黑框随实际文字改变</span>
          </label>
          <textarea
            id="layout-subtitle-text"
            aria-label="布局示例字幕"
            value={subtitleText}
            maxLength={90}
            rows={2}
            onChange={(event) => setSubtitleText(event.target.value)}
          />
          <div className="layout-lab-subtitle-actions">
            <div>
              <button onClick={() => setSubtitleText(SHORT_SUBTITLE)}>
                短句
              </button>
              <button onClick={() => setSubtitleText(LONG_SUBTITLE)}>
                长句
              </button>
            </div>
            <output aria-label="实际字幕占用">{subtitleLabel}</output>
          </div>
        </div>
      </div>

      <div className="layout-lab-explanation">
        <article>
          <span className="layout-lab-swatch layout-lab-swatch-canvas" />
          <h2>整块画布都能用</h2>
          <p>
            视频、图片和全屏遮罩可铺到四边。角标上方、字幕两侧，也不自动成为禁区。
          </p>
        </article>
        <article>
          <span className="layout-lab-swatch layout-lab-swatch-body" />
          <h2>正文从宽松范围开始</h2>
          <p>
            本页从左右约 6%、上方约 12%、下方约 14%
            起排。内容尽量用足空间，再按文字、对象与运动调整。
          </p>
        </article>
        <article>
          <span className="layout-lab-swatch layout-lab-swatch-occupied" />
          <h2>只避开实际占用</h2>
          <p>
            右上角按真实角标边界检查；字幕按当前黑框宽高检查。没有字幕时，下方可重新参与排布。
          </p>
        </article>
      </div>
      <p className="layout-lab-boundary-note">
        虚线是本页的排布起点，不是每个镜头的固定坐标。正式画面仍按真实内容、字幕出现时段，以及对象的完整运动路径检查；本页没有更改品牌或字幕基线。
      </p>
      {children}
    </div>
  );
}

export default LayoutPage;
