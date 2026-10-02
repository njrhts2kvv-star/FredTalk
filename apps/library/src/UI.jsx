import React, { useState, useEffect, useMemo, useRef } from "react";
import { pages } from "./content.js";
import { DemoStage, DEMO_NOTES } from "./demos/index.jsx";
export function download(name, value, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Copy({ value, label = "复制代码" }) {
  const [state, setState] = useState("");
  return (
    <button
      className="quiet-button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setState("已复制");
        } catch {
          setState("请选中下方代码复制");
        }
        setTimeout(() => setState(""), 2500);
      }}
    >
      {state || label}
    </button>
  );
}

export function Code({ value }) {
  return (
    <div className="code-wrap">
      <div className="code-head">
        <span>React / CSS</span>
        <Copy value={value} />
      </div>
      <pre tabIndex="0">
        <code>{value}</code>
      </pre>
    </div>
  );
}

export function Heading({ page, children }) {
  const [label, title, body] = pages[page];
  return (
    <div className="page-heading">
      <p className="eyebrow">{label}</p>
      <div className="heading-row">
        <h1>{title}</h1>
        {children}
      </div>
      <p className="lede">{body}</p>
    </div>
  );
}

export function Segmented({ items, value, onChange, label }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {items.map(([key, text]) => (
        <button
          key={key}
          aria-pressed={value === key}
          className={value === key ? "active" : ""}
          onClick={() => onChange(key)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function Note({ children }) {
  return <p className="note">{children}</p>;
}

export function Studio({
  kind,
  initialText = "理解内容\n建立关系\n清楚表达",
  countControl = false,
  compact = false,
}) {
  const [text, setText] = useState(initialText),
    [tone, setTone] = useState("light"),
    [count, setCount] = useState(3),
    [accent, setAccent] = useState(false),
    [subtitle, setSubtitle] = useState(false),
    [tab, setTab] = useState("preview");
  const effectiveCount = countControl ? count : Math.max(2, Math.min(5, text.split(/\r?\n/).filter(line=>line.trim()).length));
  const props = { kind, text, count: effectiveCount, tone, accent, showSubtitle: subtitle };
  const invocation = `<DemoStage\n  kind="${kind}"\n  text={${JSON.stringify(text)}}\n  count={${effectiveCount}}\n  tone="${tone}"\n  accent={${accent}}\n  showSubtitle={${subtitle}}\n/>`;
  return (
    <section className={"studio " + (compact ? "compact" : "")}>
      <div className="studio-top">
        <Segmented
          label="演示视图"
          items={[
            ["preview", "实时预览"],
            ["code", "调用代码"],
          ]}
          value={tab}
          onChange={setTab}
        />
        <span className="demo-label">规范站演示</span>
      </div>
      {tab === "preview" ? (
        <div className={"demo-canvas " + (tone === "dark" ? "dark" : "")}>
          <DemoStage {...props} />
        </div>
      ) : (
        <Code value={invocation} />
      )}
      <div className="studio-controls">
        <label className="control text-control">
          <span>换成你的内容</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            maxLength={180}
            aria-label="演示内容"
          />
        </label>
        <div className="control">
          <span>表面</span>
          <Segmented
            label="表面主题"
            items={[
              ["light", "白"],
              ["dark", "黑"],
            ]}
            value={tone}
            onChange={setTone}
          />
        </div>
        {countControl && (
          <label className="control">
            <span>项目数量 · {count}</span>
            <input
              type="range"
              min="2"
              max="5"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              aria-label="项目数量"
            />
          </label>
        )}
        <div className="check-controls">
          <label>
            <input
              type="checkbox"
              checked={accent}
              onChange={(e) => setAccent(e.target.checked)}
            />
            重点紫色
          </label>
          <label>
            <input
              type="checkbox"
              checked={subtitle}
              onChange={(e) => setSubtitle(e.target.checked)}
            />
            字幕参考
          </label>
        </div>
      </div>
      <Note>
        {typeof DEMO_NOTES?.[kind] === "string"
          ? DEMO_NOTES[kind]
          : "用真实内容检验构图、尺度和阅读顺序。新演示仍需在本期画面中检查。"}
      </Note>
    </section>
  );
}
