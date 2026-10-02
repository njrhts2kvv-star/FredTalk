import { CaseExample, CaseStudies } from "./CaseStudies.jsx";
import { pageCases } from "./case-curation.js";
import { PrincipleCompare } from "./PrincipleCompare.jsx";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { principles } from "./content.js";
import { tokens, tokensCSS, tokenScope } from "./tokens.js";
import { DemoStage, DEMO_CODE } from "./demos/index.jsx";
import { Heading, Note, Studio, Segmented, Code, download } from "./UI.jsx";
import { ReferenceCard } from "./ReferenceLibrary.jsx";
import { Markdown } from "./Markdown.jsx";
const actionKinds = [
  ["relay", "让位接力"],
  ["focus", "毛玻璃提炼"],
  ["handoff", "对象交接"],
];

export function Overview({ data, onNavigate }) {
  const featured = (data?.items || [])
    .filter(
      (x) =>
        !x.hiddenReason &&
        x.reviewStatus !== "remove" &&
        x.previews?.some((p) => p.available),
    )
    .filter((x) => x.kind === "transitions" || x.kind === "text-effects")
    .slice(0, 4);
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">FREDTALK / DESIGN SYSTEM</p>
          <h1>
            让内容，
            <br />
            成为画面的<span className="accent-word">主角。</span>
          </h1>
          <p>
            黑白之间，建立层次。
            <br />
            动静之间，讲清关系。
          </p>
          <div className="hero-actions">
            <button
              className="primary"
              onClick={() => onNavigate("principles")}
            >
              从设计原则开始 <span>↗</span>
            </button>
            <button
              className="text-button"
              onClick={() => onNavigate("library")}
            >
              浏览视觉库 →
            </button>
          </div>
        </div>
        <div className="hero-stage">
          <div className="stage-caption">
            <span>一个重点，接住下一个重点</span>
            <span className="live-mark">实时演示</span>
          </div>
          <DemoStage
            kind="relay"
            text={"理解内容\n建立关系\n清楚表达"}
            count={3}
            tone="light"
          />
          <p className="hero-stage-note">相同的质感，不同的表达。</p>
        </div>
      </section>
      <div className="entry-grid">
        {[
          ["01", "基础视觉", "字体、字阶与表面。", "typography"],
          ["02", "静态与模块", "从一个元素，到完整关系。", "components"],
          ["03", "动态设计", "让位、聚焦与连续交接。", "motion"],
        ].map(([num, title, body, page]) => (
          <button
            className="entry-card"
            key={num}
            onClick={() => onNavigate(page)}
          >
            <span className="entry-number">{num}</span>
            <h2>
              {title}
              <span>↗</span>
            </h2>
            <p>{body}</p>
          </button>
        ))}
      </div>
      <section className="section">
        <div className="section-title">
          <div>
            <p className="eyebrow">ONE LANGUAGE, MANY EXPRESSIONS</p>
            <h2>规范决定质感，内容决定形式。</h2>
          </div>
          <button
            className="text-button"
            onClick={() => onNavigate("surfaces")}
          >
            查看视觉基础 →
          </button>
        </div>
        <div className="principle-band">
          <div className="type-poster">
            <span>把复杂，</span>
            <strong>讲清楚。</strong>
            <p>MiSans / 文字成为主体</p>
          </div>
          <div className="material-poster">
            <span className="sample-pill black">一个清楚的重点</span>
            <span className="sample-pill white">一个自然的承接</span>
          </div>
          <div className="focus-poster">
            <div className="focus-back">
              <span>材料</span>
              <span>过程</span>
              <span>结果</span>
            </div>
            <strong>
              从材料中
              <br />
              得出判断。
            </strong>
            <p>背景后退 · 结论向前</p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-title">
          <div>
            <p className="eyebrow">CURATED REFERENCES</p>
            <h2>从已选参考，继续往前。</h2>
          </div>
          <button className="text-button" onClick={() => onNavigate("library")}>
            全部参考 · {data?.counts?.total ?? "读取中"} →
          </button>
        </div>
        {featured.length ? (
          <div className="reference-grid mini-grid">
            {featured.map((item) => (
              <ReferenceCard
                item={item}
                key={item.id}
                onSelect={() => onNavigate("library", item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-inline">
            {data
              ? "当前可播放参考为空。可到视觉参考库查看资源状态。"
              : "正在读取现有视觉库…"}
          </div>
        )}
      </section>
    </>
  );
}

function PrincipleChapter({ row, index, data, curation }) {
  const [view, setView] = useState("case");
  const [num, title, body, yes, no] = row;
  return (
    <article className="principle-chapter" id={"principle-" + num}>
      <div className="chapter-title">
        <span>{num}</span>
        <h2>{title}</h2>
      </div>
      <p className="chapter-intent">{body}</p>
      <div className="chapter-example">
        <Segmented
          label={title + "的示例"}
          value={view}
          onChange={(next) => {
            window.dispatchEvent(
              new CustomEvent("fred-case-open", { detail: null }),
            );
            setView(next);
          }}
          items={[
            ["case", "真实案例"],
            ["compare", "做法对照"],
          ]}
        />
        {view === "case" ? (
          <CaseExample
            example={pageCases.principles[index]}
            data={data}
            curation={curation}
          />
        ) : (
          <PrincipleCompare index={index} />
        )}
      </div>
      <div className="chapter-takeaway">
        <p>
          <strong>采用</strong>
          {yes}
        </p>
        <p>
          <strong>避免</strong>
          {no}
        </p>
      </div>
    </article>
  );
}

export function Principles({ data, curation }) {
  return (
    <>
      <Heading page="principles" />
      <div className="principle-intro">
        <p>
          每条规则都放进一段真实画面里看。播放案例，观察主次和交接；切到「做法对照」，看同一内容怎样因设计选择而不同。
        </p>
        <div className="principle-jump" aria-label="跳到设计原则">
          {principles.map(([num, title]) => (
            <button
              key={num}
              onClick={() =>
                document
                  .getElementById("principle-" + num)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              {num} · {title}
            </button>
          ))}
        </div>
      </div>
      <div className="principle-chapters">
        {principles.map((row, index) => (
          <PrincipleChapter
            row={row}
            index={index}
            key={row[0]}
            data={data}
            curation={curation}
          />
        ))}
      </div>
      <section className="section source-spec">
        <div className="section-title">
          <div>
            <h2>一份持续使用的设计依据</h2>
            <p>案例解释规则，制作时仍按本期内容选择与适配。</p>
          </div>
          <button
            className="secondary"
            disabled={!data?.design?.markdown}
            onClick={() => download("FredTalk-DESIGN.md", data.design.markdown)}
          >
            下载 DESIGN.md
          </button>
        </div>
        <details>
          <summary>展开完整设计规范</summary>
          <Markdown text={data?.design?.markdown || "正在加载规范…"} />
        </details>
      </section>
    </>
  );
}

export function Motion({ data, curation }) {
  const [kind, setKind] = useState("relay");
  return (
    <>
      <Heading page="motion" />
      <Segmented
        label="动作逻辑"
        value={kind}
        onChange={setKind}
        items={actionKinds}
      />
      <Studio
        key={kind}
        kind={kind}
        countControl={kind === "relay"}
        initialText={
          kind === "focus"
            ? "从材料中\n得出判断"
            : kind === "handoff"
              ? "一份需求\n一个清楚的结果"
              : "认清对象\n让位接力\n读清结果"
        }
      />
      <CaseStudies
        page="motion"
        data={data}
        curation={curation}
        title="看看动作怎样接住内容"
        intro="同一类动作可以承担不同的表达。观察对象怎样让位、何时停稳、下一个重点从哪里进入。"
      />
      <div className="motion-steps">
        {[
          ["建立", "先认清正在讲什么"],
          ["变化", "看见关系怎样改变"],
          ["阅读", "在落点上读清信息"],
          ["交接", "接住下一段的重点"],
        ].map(([a, b], i) => (
          <div key={a}>
            <span>0{i + 1}</span>
            <strong>{a}</strong>
            <p>{b}</p>
          </div>
        ))}
      </div>
      <Note>
        这是设计问题的顺序，不是每镜必须演一遍的固定模板。上游已经建立，就直接承接。
      </Note>
      <div className="section prose-card">
        <h2>文字、载体与镜头分别选择。</h2>
        <p>
          输入过程可以逐字；完整判断可以刷出；持续对话可以上卷。载体负责让位，镜头负责看清，阅读时允许停稳。
        </p>
        <Code
          value={
            typeof DEMO_CODE?.[kind] === "string"
              ? DEMO_CODE[kind]
              : "// Current demo source is included in src/demos."
          }
        />
      </div>
    </>
  );
}

export function Development({ data }) {
  return (
    <>
      <Heading page="development" />
      <div className="reuse-table">
        <div className="reuse-head">
          <span>复用层级</span>
          <span>已有能力</span>
          <span>使用边界</span>
        </div>
        {[
          [
            "基础组件",
            "SoftSurface / FrostedFocus / ObjectHandoff",
            "可组合的材质、聚焦与交接能力；本期构图仍需设计。",
          ],
          [
            "参数组件",
            "PromptSend",
            "文字、尺寸、主题和多个秒数 cue；长文仍需检查。",
          ],
          [
            "部分可调",
            "Clip038 / 媒体接力场景",
            "媒体可替换；轨迹、时钟和入口有固定条件。",
          ],
          [
            "场景参考",
            "第 99 期 Decisions / Routing",
            "保存准确效果；内容、数量和时序通常要改源码。",
          ],
        ].map((row) => (
          <div className="reuse-row" key={row[0]}>
            {row.map((v, i) => (
              <span key={i}>{v}</span>
            ))}
          </div>
        ))}
      </div>
      <div className="two-columns section">
        <article className="prose-card">
          <h2>先用共有外观，再编排关系。</h2>
          <p>
            本规范站演示从统一 tokens
            读取黑白表面与强调色，结合现有基础组件。新演示和已认可视频分开标识。
          </p>
          <div className="button-row">
            <button
              className="secondary"
              onClick={() =>
                download(
                  "fredtalk.tokens.json",
                  JSON.stringify({ scope: tokenScope, tokens }, null, 2),
                  "application/json",
                )
              }
            >
              下载 tokens
            </button>
            <button
              className="secondary"
              onClick={() => download("fredtalk.tokens.css", tokensCSS)}
            >
              下载 CSS 变量
            </button>
          </div>
        </article>
        <article className="prose-card">
          <h2>站点与素材分开。</h2>
          <p>
            React
            源码可独立构建。参考视频、字体和准确源码通过资料接口接入；取舍与制作意见在本站保存到原有记录中。本轮没有发布到公网。
          </p>
          <p>
            无本地资料接口时，基础规范与演示仍可使用，参考库会明确提示连接状态。
          </p>
        </article>
      </div>
      <Code
        value={
          "npm install\nnpm run build:standalone\n# Serve dist/ using a static web server\n# Optional: provide /api/design-system for your local collection"
        }
      />
      <section className="section source-spec">
        <div className="section-title">
          <h2>查看真实接口与限制</h2>
          <button
            className="secondary"
            disabled={!data?.design?.reuseMarkdown}
            onClick={() =>
              download("component-reuse-map.md", data.design.reuseMarkdown)
            }
          >
            下载复用图谱
          </button>
        </div>
        <details>
          <summary>展开完整组件复用说明</summary>
          <Markdown
            text={
              data?.design?.reuseMarkdown || "本地接口连接后显示当前复用图谱。"
            }
          />
        </details>
      </section>
    </>
  );
}
