import React, { useEffect, useState } from "react";
import "./principle-compare.css";

const EXAMPLES = [
  {
    title: "内容主次",
    good: "删掉重复标签，观众直接读到这句话的重点。",
    problem: "标签、页眉与正文都抢位置，真正要读的内容反而变小。",
  },
  {
    title: "黑白实体",
    good: "黑色填充建立分量，白色承载面用柔和阴影形成层次。",
    problem: "两层信息都画成细线框，主次和材质变得接近。",
  },
  {
    title: "重点色",
    good: "紫色只落在正在强调的关键词上。",
    problem: "整块内容都被染色，颜色无法指出具体重点。",
  },
  {
    title: "动作关系",
    good: "切换阶段：同一份内容移动、变化，再交出重点。",
    problem: "三个节点一次摊开，箭头代替了本该让观众看见的变化。",
  },
  {
    title: "稳定阅读",
    good: "保留前后文，让当前判断拥有稳定的阅读位置。",
    problem: "多个对象同时放大、倾斜，观众要不断寻找主句。",
  },
  {
    title: "结论与材料",
    good: "材料退到白色蒙版后，结论从原来的上下文中浮现。",
    problem: "材料突然消失，结论看起来像另换了一页。",
  },
];
const PHASES = ["认清内容", "建立关系", "交出重点"];
const OBJECT_COPY = ["一份需求", "两层关系", "清楚表达"];

function ContentExample({ problem }) {
  if (problem)
    return (
      <div className="pc-clutter" data-pc-main>
        <div className="pc-clutter-top">
          <span>内容解析 / 01</span>
          <span>表达规划</span>
        </div>
        <strong className="pc-clutter-heading">本段核心内容</strong>
        <div className="pc-clutter-tags">
          {["主题标签", "关键观点", "理解输入", "技术路径"].map((text) => (
            <span key={text}>{text}</span>
          ))}
        </div>
        <p>先理解内容，再讲清关系。</p>
        <div className="pc-clutter-bottom">
          <span>补充说明</span>
          <span>下一步骤</span>
        </div>
      </div>
    );
  return (
    <div className="pc-content-direct" data-pc-main>
      <p className="pc-main-copy">
        <span>先理解内容，</span>
        <span>再讲清关系。</span>
      </p>
      <p className="pc-support-copy">观众先认清，再跟上。</p>
    </div>
  );
}

function SurfaceExample({ problem }) {
  return (
    <div
      className={`pc-surface-pair ${problem ? "pc-outline-pair" : ""}`}
      data-pc-main
    >
      <div className="pc-surface-primary">一个重点</div>
      <div className="pc-surface-secondary">一层补充</div>
    </div>
  );
}

function AccentExample({ problem }) {
  return (
    <div
      className={`pc-accent-card ${problem ? "pc-accent-flood" : ""}`}
      data-pc-main
    >
      <p>
        <span>让观众</span>
        <span>
          看清<span className="pc-keyword">重点</span>
        </span>
      </p>
    </div>
  );
}

function MotionExample({ problem, phase }) {
  if (problem)
    return (
      <div className="pc-node-flow" data-pc-main>
        {["需求", "关系", "表达"].map((text, index) => (
          <React.Fragment key={text}>
            {index > 0 && (
              <span className="pc-problem-arrow" aria-hidden="true">
                →
              </span>
            )}
            <div
              className={`pc-problem-node ${phase === index ? "pc-problem-node-current" : ""}`}
            >
              {text}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  return (
    <div
      className="pc-relay-object"
      style={{ "--pc-phase": phase }}
      data-pc-main
      data-pc-continuous-object
    >
      <span>{OBJECT_COPY[phase]}</span>
    </div>
  );
}

function ReadingExample({ problem }) {
  return (
    <div className={`pc-reading ${problem ? "pc-reading-busy" : ""}`}>
      <div className="pc-reading-before">建立条件</div>
      <div className="pc-reading-current" data-pc-main>
        看清当前判断
      </div>
      <div className="pc-reading-after">再看下一步</div>
    </div>
  );
}

function ConclusionExample({ problem }) {
  return (
    <div className={`pc-conclusion ${problem ? "pc-conclusion-cut" : ""}`}>
      {!problem && (
        <>
          <div className="pc-materials" aria-hidden="true">
            <div>条件一致</div>
            <div>结果可读</div>
            <div>过程可回看</div>
          </div>
          <div className="pc-focus-mask" aria-hidden="true" />
        </>
      )}
      <div className="pc-conclusion-foreground" data-pc-main>
        <span>先讲清楚，</span>
        <span>再加变化。</span>
      </div>
    </div>
  );
}

export function PrincipleCompare({ index = 0 }) {
  const resolvedIndex = Math.max(
    0,
    Math.min(5, Math.floor(Number(index) || 0)),
  );
  const [problem, setProblem] = useState(false);
  const [phase, setPhase] = useState(0);
  const example = EXAMPLES[resolvedIndex];
  useEffect(() => {
    setProblem(false);
    setPhase(0);
  }, [resolvedIndex]);
  const content =
    resolvedIndex === 0 ? (
      <ContentExample problem={problem} />
    ) : resolvedIndex === 1 ? (
      <SurfaceExample problem={problem} />
    ) : resolvedIndex === 2 ? (
      <AccentExample problem={problem} />
    ) : resolvedIndex === 3 ? (
      <MotionExample problem={problem} phase={phase} />
    ) : resolvedIndex === 4 ? (
      <ReadingExample problem={problem} />
    ) : (
      <ConclusionExample problem={problem} />
    );

  return (
    <section
      className="principle-compare"
      aria-label={`${example.title}的教学对照`}
    >
      <div className="pc-mode-switch" role="group" aria-label="视觉对照模式">
        <button
          type="button"
          aria-pressed={!problem}
          onClick={() => setProblem(false)}
        >
          推荐做法
        </button>
        <button
          type="button"
          aria-pressed={problem}
          onClick={() => setProblem(true)}
        >
          常见问题
        </button>
      </div>
      <div
        className="pc-canvas"
        data-pc-index={resolvedIndex}
        data-pc-mode={problem ? "problem" : "recommended"}
        role="img"
        aria-label={`${example.title}：${problem ? example.problem : example.good}`}
      >
        {content}
      </div>
      {resolvedIndex === 3 && (
        <div
          className="pc-phase-switch"
          role="group"
          aria-label="手动切换动作阶段"
        >
          {PHASES.map((label, phaseIndex) => (
            <button
              type="button"
              key={label}
              aria-pressed={phase === phaseIndex}
              onClick={() => setPhase(phaseIndex)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <p className="pc-caption" aria-live="polite">
        {problem ? example.problem : example.good}
      </p>
      <p className="pc-teaching-note">假设性教学示意，不评价任何历史成片。</p>
    </section>
  );
}

export default PrincipleCompare;
