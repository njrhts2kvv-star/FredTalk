import React, { useEffect, useId, useState } from "react";
import ReferencePlayer from "./ReferencePlayer.jsx";
import { ReferenceDialog } from "./ReferenceLibrary.jsx";
import { pageCases } from "./case-curation.js";
import { CasePoster } from "./CasePoster.jsx";
import "./case-studies.css";

export function resolveCase(data, example) {
  if (!example) return null;
  return (
    data?.items?.find(
      (item) =>
        item.id === example.id &&
        !item.hiddenReason &&
        item.reviewStatus !== "remove",
    ) || null
  );
}

export function CaseExample({ example, data, curation, compact = false }) {
  const item = resolveCase(data, example);
  const instance = useId();
  const [playing, setPlaying] = useState(false);
  const [details, setDetails] = useState(false);
  useEffect(() => {
    const closeOther = (event) => {
      if (event.detail !== instance) setPlaying(false);
    };
    window.addEventListener("fred-case-open", closeOther);
    return () => window.removeEventListener("fred-case-open", closeOther);
  }, [instance]);
  if (!example) return null;
  if (!item)
    return (
      <div className="case-unavailable">
        {data
          ? "这个例子不在当前展示范围内，已保留原取舍。"
          : "正在读取真实案例…"}
      </div>
    );
  const preview = item.previews?.find((p) => p.available) || item.previews?.[0];
  const open = () => {
    window.dispatchEvent(
      new CustomEvent("fred-case-open", { detail: instance }),
    );
    setPlaying(true);
  };
  return (
    <article
      className={"case-example " + (compact ? "compact-case" : "")}
      data-case-id={item.id}
    >
      <div className="case-visual">
        {playing ? (
          <ReferencePlayer previews={item.previews} autoPlay />
        ) : (
          <CasePoster
            item={item}
            example={example}
            preview={preview}
            onOpen={open}
          />
        )}
        <div className="case-caption">
          <span>
            {item.label} · {item.title}
          </span>
          <button
            className="text-button"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent("fred-case-open", { detail: instance }),
              );
              setPlaying(false);
              setDetails(true);
            }}
          >
            源码与详细取舍
          </button>
        </div>
      </div>
      <div className="case-explanation">
        <h3>{example.title}</h3>
        <p>
          <strong>看哪里</strong>
          {example.observe}
        </p>
        <p>
          <strong>用到新内容</strong>
          {example.adapt}
        </p>
        {example.scope && <p className="case-scope">{example.scope}</p>}
      </div>
      {details && (
        <ReferenceDialog
          initialTab="source"
          item={item}
          curation={curation}
          onClose={() => setDetails(false)}
        />
      )}
    </article>
  );
}

export function CaseStudies({
  page,
  data,
  curation,
  title = "在真实画面里看这条规则",
  intro,
}) {
  const examples = pageCases[page] || [];
  if (!examples.length) return null;
  return (
    <section className="case-section" aria-label={title}>
      <div className="case-section-heading">
        <h2>{title}</h2>
        {intro && <p>{intro}</p>}
      </div>
      <div className={examples.length > 1 ? "case-pair" : "case-single"}>
        {examples.map((example) => (
          <CaseExample
            key={example.id}
            compact={examples.length > 1}
            example={example}
            data={data}
            curation={curation}
          />
        ))}
      </div>
    </section>
  );
}
