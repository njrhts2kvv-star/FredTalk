import { CaseStudies } from "./CaseStudies.jsx";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { tokens, tokensCSS, tokenScope } from "./tokens.js";
import { Heading, Segmented, Note, Studio, Code } from "./UI.jsx";
export {Typography} from "./TypographyPage.jsx";

export function Surfaces({ data, curation }) {
  const [copied, setCopied] = useState("");
  return (
    <>
      <Heading page="surfaces" />
      <div className="swatches">
        {[
          ["Ink", tokens.color.ink, "主要文字 / 黑色实体"],
          ["Paper", tokens.color.surface, "白色承载面"],
          ["Accent on light", tokens.color.accent, "白底与浅色承载面上的重点"],
          ["Accent on dark", tokens.color.accentDark, "黑胶囊与深色窗口上的重点"],
        ].map(([name, color, role]) => (
          <button
            className="swatch"
            key={name}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(color);
                setCopied(name + " 色值已复制");
              } catch {
                setCopied("请手动复制色值：" + color);
              }
              setTimeout(() => setCopied(""), 2500);
            }}
            aria-label={`复制${name}色值${color}`}
          >
            <div style={{ background: color }} />
            <strong>
              {name}
              <span>{color}</span>
            </strong>
            <p>{role}</p>
          </button>
        ))}
      </div>
      <Note>{tokenScope} 紫色按文字所在的实际承载面选择：深底用 #D6BEFF，浅底保留准确源的紫色。黑胶囊即使放在白色画布上，也按深底处理。点击色块复制色值。</Note>
      <p className="copy-status" role="status">
        {copied}
      </p>
      <Studio
        kind="surface"
        initialText={"一个清楚的重点\n一个自然的承接"}
        countControl
      />
      <CaseStudies
        page="surfaces"
        data={data}
        curation={curation}
        title="黑白材质怎样形成层次"
        intro="从实际胶囊与毛玻璃画面中，看填充、阴影和前后关系。"
      />
      <div className="three-columns section">
        <article className="prose-card">
          <h3>实体</h3>
          <p>
            填充决定重量，留白决定呼吸。白色卡片离开纯白背景时，仍然有自己的承载面。
          </p>
        </article>
        <article className="prose-card">
          <h3>阴影</h3>
          <p>
            柔和阴影提示前后层次。外层投影与内容裁切分开，不靠细线描边撑起胶囊。
          </p>
        </article>
        <article className="prose-card">
          <h3>毛玻璃</h3>
          <p>已有材料保留在背景，黑白蒙版和失焦降低干扰；重要文字始终清晰。</p>
        </article>
      </div>
      <Code value={tokensCSS} />
    </>
  );
}

export function BrandPreview({ branding, tone }) {
  const variant =
    branding?.variants?.[
      tone === "dark" ? "darkBackground" : "lightBackground"
    ];
  if (!variant?.available)
    return <span className="brand-placeholder">角标素材未连接</span>;
  const base = branding.baseCanvas,
    box = variant.destination;
  const crop = variant.sourceCrop || { x: 0, y: 0, ...variant.sourceSize };
  return (
    <svg
      aria-label={tone === "dark" ? "深色背景角标" : "浅色背景角标"}
      className="brand-preview"
      viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`}
      preserveAspectRatio="none"
      style={{
        left: `${(box.x / base.width) * 100}%`,
        top: `${(box.y / base.height) * 100}%`,
        width: `${(box.width / base.width) * 100}%`,
        height: `${(box.height / base.height) * 100}%`,
      }}
    >
      <image
        href={variant.url}
        width={variant.sourceSize.width}
        height={variant.sourceSize.height}
      />
    </svg>
  );
}

export function Components({ data, curation }) {
  return (
    <>
      <Heading page="components" />
      <Studio
        kind="surface"
        countControl
        initialText={"理解内容\n建立关系\n清楚表达"}
      />
      <CaseStudies
        page="components"
        data={data}
        curation={curation}
        title="同一套质感，容纳不同关系"
        intro="大模块可以复用；内容数量和交接任务仍决定本期构图。"
      />
      <div className="section-title section">
        <h2>一个模块，三种责任。</h2>
      </div>
      <div className="three-columns">
        <article className="prose-card">
          <span className="section-number">01</span>
          <h3>内容</h3>
          <p>文字、媒体、项目数量与真实关系，由本期提供。</p>
        </article>
        <article className="prose-card">
          <span className="section-number">02</span>
          <h3>承载</h3>
          <p>表面、字阶、间距和阅读区域，由共享外观与布局决定。</p>
        </article>
        <article className="prose-card">
          <span className="section-number">03</span>
          <h3>变化</h3>
          <p>进入、强调、停稳、退出，绑定当前口播和上下游状态。</p>
        </article>
      </div>
      <div className="section prose-card">
        <h2>实际已有的基础接口</h2>
        <p>
          以下调用来自现有
          ContentMotion。它提供可组合能力，本期构图和长文仍需实际检查。
        </p>
        <Code
          value={
            '<SoftSurface\n  box={[120, 180, 720, 160]}\n  fill="#fff"\n  shadow="0 12px 32px rgba(0,0,0,.10)"\n>\n  {children}\n</SoftSurface>'
          }
        />
      </div>
    </>
  );
}

export function DataPage({ data, curation }) {
  const [view, setView] = useState("table");
  return (
    <>
      <Heading page="data" />
      <Segmented
        label="数据表达"
        value={view}
        onChange={setView}
        items={[
          ["table", "表格 · 看清比较"],
          ["chart", "图表 · 看出变化"],
        ]}
      />
      <Studio
        key={view}
        kind={view}
        initialText={
          view === "table" ? "内容理解\n表达清晰\n交接连续" : "理解\n表达\n交接"
        }
        countControl
      />
      <CaseStudies
        page="data"
        data={data}
        curation={curation}
        title="比较时，先让观众看见什么"
        intro="观察主次变化与阅读顺序；示例中的数值不自动成为本期数据。"
      />
      <div className="two-columns section">
        <article className="prose-card">
          <h2>
            {view === "table" ? "让比较条件保持一致。" : "突出数据真正的变化。"}
          </h2>
          <p>
            {view === "table"
              ? "减少装饰线，用间距和表面分组。需要比较的行列保留共同基线，当前重点可以通过黑白反转建立。"
              : "让比例、单位和标签来自同一份数据。颜色留给当前需要解释的系列，不给每个值配一套装饰。"}
          </p>
        </article>
        <article className="prose-card">
          <h2>示例与真实证据分开。</h2>
          <p>
            这里的数值和状态是规范站演示数据，不是产品实测。正式制作使用本期数据，录屏中的结果保留真实来源。
          </p>
        </article>
      </div>
    </>
  );
}
