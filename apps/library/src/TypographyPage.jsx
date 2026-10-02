import React, {useEffect, useState} from "react";
import {Heading, Note, Segmented} from "./UI.jsx";
import {ReferenceCard} from "./ReferenceLibrary.jsx";

function FontCard({faces, text, onReference, items}) {
  const [faceId, setFaceId] = useState(faces.find((f) => f.id === 'misans-medium')?.id || faces[0].id);
  const face = faces.find((f) => f.id === faceId) || faces[0];
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let active = true;
    setStatus("loading");
    if (!face.available) {setStatus("failed"); return;}
    document.fonts.load(`${face.weight} 24px "${face.family}"`, face.sample)
      .then((loaded) => active && setStatus(loaded.length ? "ready" : "failed"))
      .catch(() => active && setStatus("failed"));
    return () => {active = false;};
  }, [face.id, face.available, face.family, face.weight]);
  const latin = ["latin", "code"].includes(face.role);
  const sample = latin ? face.sample : text || face.sample;
  return <article className="font-card" data-font-id={face.id} data-font-status={status}>
    <div className="font-card-heading"><h3>{face.familyLabel || face.label}</h3><span>{face.weight} · {face.usage}</span></div>
    {faces.length > 1 && <label className="inline-field"><span>同家族字重</span><select aria-label={`${face.familyLabel} 字重`} value={face.id} onChange={(e) => setFaceId(e.target.value)}>{faces.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)}</select></label>}
    <div className="font-card-sample" style={{fontFamily: `"${face.family}"`, fontWeight: face.weight, visibility: status === "ready" ? "visible" : "hidden"}}>{sample}</div>
    {status !== "ready" && <p role="status">{status === "loading" ? "字体加载中…" : "字体未加载，请检查对应本地资源。"}</p>}
    <p><strong>什么时候用</strong>{face.when}</p>
    <p className="font-card-boundary">{face.avoid}</p>
    {face.examples?.length > 0 && <div className="font-source-links" aria-label={`${face.label} 来源画面`}>
      {face.examples.map((example) => {
        const item = items.find((x) => x.referenceId === example.id);
        return <button className="text-button" key={example.id} disabled={!item} onClick={() => onReference?.(item.id)}>{example.label} · {example.title} ↗</button>;
      })}
    </div>}
    <details><summary>查看字重与准确文件</summary>
      <p>展示使用源代码的字重映射 {face.weight}；字体文件的 OS/2 值为 {face.fontMetadata?.weightClass}。两者数值并不总相同，按文件实际字形判断，不合成加粗。</p>
      <code>{face.sha256?.slice(0,16)}…</code>
    </details>
  </article>;
}

export function Typography({data, onReference}) {
  const [role, setRole] = useState("all");
  const [text, setText] = useState("把复杂，讲清楚。");
  const type = data?.typography;
  const items = data?.items || [];
  const faces = (type?.faces || []).filter((face) => role === "all" ||
    (role === "expression" ? ["expression", "handwriting"].includes(face.role) :
     role === "technical" ? ["code", "latin"].includes(face.role) : face.role === role));
  const families = Array.from(new Set(faces.map((face) => face.family))).map((family) => faces.filter((face) => face.family === family));
  const examples = ["SP019", "L81-C001", "L81-R026", "SP024", "SP018", "L81-C006"]
    .map((label) => items.find((item) => item.label === label && item.visibleByDefault)).filter(Boolean);
  return <>
    <Heading page="typography" />
    <Note>日常使用五个字体家族：MiSans、锐字真言体、得意黑、霞鹜文楷和 Source Code Pro。正文用 MiSans Medium，重点用 Heavy；同家族字重在一张卡里切换。</Note>
    <section className="type-rules section">
      {(type?.levels || []).map((level) => <article className="prose-card" key={level.role}><h3>{level.role}</h3><p>{level.rule}</p></article>)}
    </section>
    <div className="section-title section"><h2>当前可调用的字体</h2><p>点击来源画面，直接查看对应视频、关键帧和源码。</p></div>
    <div className="font-switch">
      <Segmented label="字体用途" value={role} onChange={setRole} items={[
        ["display", "大字与重点"], ["body", "常规正文"], ["expression", "表达与手写"], ["technical", "代码与数字"], ["all", "全部"]
      ]}/>
      <label className="inline-field"><span>中文测试文字</span><input value={text} onChange={(e) => setText(e.target.value)} maxLength={45} aria-label="字体测试文字"/></label>
    </div>
    {!type && <p role="status">正在连接字体目录…</p>}
    <section className="font-card-grid" aria-label="真实字体样张">{families.map((variants) => <FontCard key={variants[0].family + role} faces={variants} text={text} items={items} onReference={onReference}/>)}</section>
    <Note>五个字体家族，{type?.faces?.length || 0} 个字重与用途档。旧字体及冻结原版保存在历史依赖里；当前组件修订与制作默认值使用这五个家族。</Note>
    <div className="section-title section"><h2>字阶看真实画面</h2><p>先看有效字形面积、主辅关系与阅读窗口。源码字号只在对应逻辑画布成立，不固定全片通用 px。</p></div>
    <p className="note">使用上方字体卡的来源链接查看准确画面与源码。</p>
  </>;
}
