import ReferencePlayer from "./ReferencePlayer.jsx";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { CurationPanel } from "./Curation.jsx";
import { Heading, Segmented, Code, Note } from "./UI.jsx";
export const kindNames = {
  remakes: "场景实现素材",
  components: "完整模块",
  clips: "整期选段",
  transitions: "对象过渡",
  "text-effects": "文字呈现",
};

const addedDateFormat = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
});
const addedTimeFormat = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});

function ReferenceAddedMetadata({ item, detailed = false }) {
  const added = typeof item.addedAt === "string" && item.addedAt.trim()
    ? new Date(item.addedAt) : null;
  const validDate = added && Number.isFinite(added.getTime());
  const date = validDate ? addedDateFormat.format(added) : "";
  const timestamp = validDate ? addedTimeFormat.format(added) : "";
  if ((!detailed || item.isNew !== true) && !date) return null;
  return (
    <div className="reference-added-meta">
      {detailed && item.isNew === true && <span className="reference-new-badge">NEW</span>}
      {date && (
        <time dateTime={item.addedAt} title={`新增于 ${timestamp}（北京时间）`}>
          {detailed ? `新增 ${timestamp} · 北京时间` : `新增 ${date}`}
        </time>
      )}
    </div>
  );
}

export function ReferenceCard({ item, onSelect, variants = [], playing, onPlaybackChange }) {
  const preview = item.previews?.find((p) => p.posterUrl) || item.previews?.[0];
  const [imageError, setImageError] = useState(false);
  const [localPlayback, setLocalPlayback] = useState(false);
  const inlinePlayback = playing ?? localPlayback;
  const setInlinePlayback = onPlaybackChange ?? setLocalPlayback;
  const playable = item.previews?.some((p) => p.available && p.videoUrl);
  return (
    <article className="reference-card" data-reference-id={item.id}>
      {item.isNew === true && <span className="reference-new-badge">NEW</span>}
      {inlinePlayback ? (
        <div><ReferencePlayer previews={item.previews} autoPlay compact onComplete={() => setInlinePlayback(false)} /><button className="return-poster" onClick={() => setInlinePlayback(false)}>返回封面</button></div>
      ) : (
      <button type="button" className="reference-image reference-play-button"
        aria-label={`${playable ? "播放" : "查看"} ${item.label} ${item.title}`}
        onClick={() => playable ? setInlinePlayback(true) : onSelect(item)}>

        {preview?.posterUrl && !imageError ? (
          <img
            src={preview.posterUrl}
            alt=""
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="poster-fallback">
            <strong>{item.label}</strong>
            <span>{kindNames[item.kind] || "视觉参考"}</span>
          </div>
        )}
        <span className="play-affordance">{playable ? "播放 ▶" : "查看 ↗"}</span>
        {!item.previews?.some((p) => p.available) && (
          <span className="availability-label">{item.previews?.some(p => p.privacyExcluded) ? "预览已隔离" : "素材待下载"}</span>
        )}
      </button>
      )}
      <div className="reference-copy">
        <p>
          <span>{item.label}</span>
          <span>{item.origin}</span>
        </p>
        <ReferenceAddedMetadata item={item} />
        <h3>{item.title}</h3>
        <span className="reference-use">{item.matching?.scenarioTitle || item.category}{item.matching?.nativeDurationSeconds ? ` · 参考片段 ${item.matching.nativeDurationSeconds}s` : ""}</span>
        <span className="reference-type">
          {item.reusability?.label || "场景参考"}
        </span>
        <button type="button" className="reference-details-button"
          aria-label={`查看 ${item.label} 详情与源码`} onClick={() => onSelect(item)}>
          详情与源码 ↗
        </button>
        {variants.length > 0 && <details className="reference-variants">
          <summary>其他版本（{variants.length}）</summary>
          {variants.map((v) => <button key={v.id} className="text-button" onClick={() => onSelect(v)}>{v.label} · {v.origin}</button>)}
        </details>}
      </div>
    </article>
  );
}

export function SourceCode({ source }) {
  const [value, setValue] = useState("正在读取准确源码…");
  useEffect(() => {
    if (!source.available) {
      setValue("源码尚未在本地，下载原文件后可查看。");
      return;
    }
    let active = true;
    fetch(source.url)
      .then((r) => {
        if (!r.ok) throw Error("源码暂不可读，请检查本地文件。");
        return r.text();
      })
      .then((v) => active && setValue(v))
      .catch((e) => active && setValue(e.message));
    return () => {
      active = false;
    };
  }, [source.url, source.available]);
  return (
    <>
      <p className="source-label">
        {source.label}
        {source.symbol ? " · " + source.symbol : ""}
      </p>
      <Code value={value} />
    </>
  );
}

export function ReferenceDialog({
  item,
  onClose,
  curation,
  initialTab = "preview",
}) {
  const dialog = useRef(null);
  const [tab, setTab] = useState(initialTab);
  const [sourceIndex, setSourceIndex] = useState(
    Math.max(0, item.sources?.findIndex((source) => source.available) || 0),
  );
  useEffect(() => {
    dialog.current?.showModal();
    const current = dialog.current;
    return () => current?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="reference-dialog"
      aria-labelledby="reference-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) onClose();
      }}
    >
      <div className="dialog-top">
        <div>
          <span>
            {item.label} / {kindNames[item.kind]}
          </span>
          <h2 id="reference-title">{item.title}</h2>
          <ReferenceAddedMetadata item={item} detailed />
        </div>
        <button
          className="close-button"
          onClick={onClose}
          aria-label="关闭参考详情"
        >
          关闭 ×
        </button>
      </div>
      <div className="dialog-body">
        <div className="dialog-preview">
          <Segmented
            label="参考详情视图"
            value={tab}
            onChange={setTab}
            items={[
              ["preview", "实际预览"],
              ["source", "准确源码"],
            ]}
          />
          {tab === "preview" ? (
            <ReferencePlayer previews={item.previews} />
          ) : (
            <div className="source-panel">
              {item.sources?.length ? (
                <>
                  <select
                    aria-label="源码文件"
                    value={sourceIndex}
                    onChange={(e) => setSourceIndex(Number(e.target.value))}
                  >
                    {item.sources.map((s, i) => (
                      <option key={s.url + String(i)} value={i}>
                        {s.label}
                        {s.available ? "" : " · 未在本地"}
                      </option>
                    ))}
                  </select>
                  <SourceCode
                    key={item.sources[sourceIndex]?.url}
                    source={item.sources[sourceIndex] || item.sources[0]}
                  />
                </>
              ) : (
                <div className="empty-inline">
                  此条为效果参考，当前索引没有直接源码入口。
                </div>
              )}
            </div>
          )}
        </div>
        <aside className="reference-detail">
          <span className="status-pill">
            {item.reusability?.label || "场景参考"}
          </span>
          <h3>怎样用于新内容</h3>
          <p>{item.description}</p>
          <dl>
            <dt>用途标签</dt>
            <dd>{item.matching?.tags?.filter((tag) => !/^\d+$/.test(tag)).join("、") || item.category}</dd>
            {item.matching?.segmentRole && <>
              <dt>段落职责</dt><dd>{item.matching.segmentRole}</dd>
              <dt>带入的内容</dt><dd>{item.matching.inputObjects?.join("、")}</dd>
              <dt>时长与适配</dt><dd>参考片段 {item.matching.nativeDurationSeconds}s。{item.matching.adaptation}</dd>
            </>}
            {item.hiddenReason && (
              <>
                <dt>收起原因</dt>
                <dd>
                  {item.hiddenReason === "merged"
                    ? "已合并的重复项"
                    : "之前已排除"}
                  {item.mergedInto?.length
                    ? " · 合并至 " + item.mergedInto.join("、")
                    : ""}
                </dd>
              </>
            )}
            <dt>选择状态</dt>
            <dd>
              {item.reviewStatus === "remove"
                ? "本轮标记不要"
                : item.reviewStatus === "stale-review"
                  ? "原库选择，复看记录需核对"
                  : item.reviewStatus === "unreviewed"
                    ? "本轮尚未复看"
                    : item.reviewStatus === "keep"
                      ? "本轮保留"
                      : "原库已选参考"}
            </dd>
            <dt>可调内容</dt>
            <dd>
              {item.reusability?.parameters?.length
                ? item.reusability.parameters.join("、")
                : "按准确源码检查，不能只传文案就视为完成适配。"}
            </dd>
            <dt>适配边界</dt>
            <dd>
              {Array.isArray(item.reusability?.limitations)
                ? item.reusability.limitations.join(" ")
                : item.reusability?.limitations ||
                  "新内容、字号、时序与接缝需在本期检查。"}
            </dd>
          </dl>
          {item.projectDownload?.available && (
            <a className="secondary" href={item.projectDownload.url} download={item.projectDownload.filename}>
              下载当前源码工程 ZIP
            </a>
          )}
          <Note>
            原参考的认可范围保持不变。新适配先看真实关键帧，再内部检查动态。
          </Note>
          {["combined", "registered"].includes(item.reviewKind) ? (
            item.comparisonUrl && <a className="secondary" href={item.comparisonUrl} target="_blank" rel="noreferrer">
              打开参考片段对照与返修备注 ↗
            </a>
          ) : (
            <CurationPanel item={item} curation={curation} />
          )}
        </aside>
      </div>
    </dialog>
  );
}

export function Library({
  data,
  loading,
  error,
  selectedId,
  onSelectionChange,
  curation,
}) {
  const [category, setCategory] = useState("all");
  const [scenario, setScenario] = useState("all");
  const [limit, setLimit] = useState(24);
  const [activePlaybackId, setActivePlaybackId] = useState(null);
  const scenarios = data?.scenarios || [];
  const visible = (data?.items || []).filter(x => x.visibleByDefault && x.reviewStatus !== "remove" && !x.archivedFromSkill);
  const scenarioList = scenarios.filter(s => (category === "all" || s.groupId === category) && visible.some(x => x.matching?.scenarioId === s.id));
  const chooseGroup = (id) => { setActivePlaybackId(null); setCategory(id); setScenario("all"); setLimit(24); };
  const chooseScenario = (id) => { setActivePlaybackId(null); setScenario(id); setLimit(24); };
  const all = data?.items || [];
  const archived = all.filter(x => x.archivedFromSkill);
  const filtered = useMemo(
    () => all.filter((x) => x.visibleByDefault && x.reviewStatus !== "remove" && !x.archivedFromSkill &&
      (category === "all" || scenarioList.some(s => s.id === x.matching?.scenarioId)) &&
      (scenario === "all" || x.matching?.scenarioId === scenario)),
    [all, category, scenario, data],
  );
  const cards = filtered.slice(0, limit);
  const selected = all.find((x) => x.id === selectedId);
  return (
    <>
      <Heading page="library" />
      <section className="release-notice" aria-label="FredTalk 1.5 更新">
        <strong>FredTalk 1.5 · 新增 29 个组件</strong>
        <p>5 个 3D 录屏运镜组件，结合成组刷色、蒙版、外框和输入反馈；另新增 24 个交互与精选动画组件。</p>
        <p>按真实内容和口播编排镜头：重点停稳再突出，经过位置连续移动。</p>
        <a href="https://github.com/njrhts2kvv-star/FredTalk/releases/tag/v1.5.0">下载 1.5 源码与素材 ↗</a>
      </section>
      <section className="scenario-picker" aria-label="按使用场景筛选">
        <div className="scenario-groups" role="group" aria-label="内容类型">
          {[{id: "all", title: "全部"}, ...(data?.scenarioGroups || [])].map(g => <button key={g.id} aria-pressed={category === g.id} onClick={() => chooseGroup(g.id)}>{g.title}</button>)}
        </div>
        <div className="scenario-options" role="group" aria-label="具体使用场景">
          {scenarioList.map(s => <button key={s.id} aria-pressed={scenario === s.id} onClick={() => chooseScenario(scenario === s.id ? "all" : s.id)}>{s.title}<span>{visible.filter(x => x.matching?.scenarioId === s.id).length}</span></button>)}
        </div>
      </section>
      <div className="filter-row" aria-live="polite"><span>{scenario === "all" ? (category === "all" ? "全部参考" : data?.scenarioGroups?.find(g => g.id === category)?.title) : scenarios.find(s => s.id === scenario)?.description} · {filtered.length} 条</span>{(category !== "all" || scenario !== "all") && <button className="text-button" onClick={() => chooseGroup("all")}>重置</button>}</div>
      {loading ? (
        <div className="empty-inline">正在读取现有精选库…</div>
      ) : error ? (
        <div className="empty-inline" role="alert">
          {error}
        </div>
      ) : filtered.length ? (
        <>
          <div className="reference-grid">
            {cards.map((x) => (
              <ReferenceCard
                item={x}
                
                key={x.id}
                playing={activePlaybackId === x.id}
                onPlaybackChange={(playing) => setActivePlaybackId(playing ? x.id : null)}
                onSelect={(selected) => {
                  setActivePlaybackId(null);
                  onSelectionChange(selected.id);
                }}
              />
            ))}
          </div>
          {cards.length < filtered.length && <button className="load-more secondary" onClick={() => setLimit(limit + 24)}>继续浏览 · 还有 {filtered.length - cards.length} 条</button>}
        </>
      ) : (
        <div className="empty-inline">
          <h2>没有匹配的参考</h2>
          <p>这个用途中暂时没有可选参考。</p>
          <button
            className="secondary"
            onClick={() => chooseGroup("all")}
          >
            清除筛选
          </button>
        </div>
      )}
      {!!archived.length && <details className="archive-section"><summary>已归档（不建议使用） · {archived.length} 条</summary><div className="reference-grid">{archived.map(x => <ReferenceCard item={x} key={x.id} playing={activePlaybackId === x.id} onPlaybackChange={playing => setActivePlaybackId(playing ? x.id : null)} onSelect={selected => { setActivePlaybackId(null); onSelectionChange(selected.id); }} />)}</div></details>}
      {selected && (
        <ReferenceDialog
          curation={curation}
          key={selected.id}
          item={selected}
          onClose={() => onSelectionChange(null)}
        />
      )}
    </>
  );
}
