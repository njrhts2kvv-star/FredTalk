import React, { useEffect, useRef, useState } from "react";

const endpoints = { skill: "/api/review", remake: "/api/remake-curation" };
async function request(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "取舍记录暂时不可读取。");
  return data;
}

// Use the existing stores. Reads never create or reset a decision; writes happen
// only after a user action and keep the store's revision/fingerprint protection.
export function useCuration() {
  const [states, setStates] = useState({});
  const [error, setError] = useState("");
  const latest = useRef({});
  const refresh = async () => {
    const results = await Promise.allSettled(
      Object.entries(endpoints).map(async ([kind, url]) => {
        const result = await request(url);
        return [
          kind,
          kind === "skill"
            ? { ...result.state, fingerprint: result.catalog.fingerprint }
            : result,
        ];
      }),
    );
    const next = {};
    for (const result of results) {
      if (result.status === "fulfilled")
        next[result.value[0]] = result.value[1];
    }
    latest.current = next;
    setStates(next);
    setError(
      results.some((result) => result.status === "rejected")
        ? "部分取舍记录未连接，仍可浏览参考。请重新读取后保存。"
        : "",
    );
  };
  useEffect(() => {
    refresh();
  }, []);
  const save = async (item, decision, notes) => {
    const kind = item.reviewKind || "skill";
    const state = latest.current[kind];
    if (!state) throw new Error("取舍记录尚未连接，请重新读取。");
    const result = await request(endpoints[kind], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        decision,
        notes,
        expectedRevision: state.revision,
        fingerprint: state.fingerprint,
      }),
    });
    latest.current = { ...latest.current, [kind]: result };
    setStates(latest.current);
    return result.decisions[item.id];
  };
  const decisionFor = (item) =>
    states[item.reviewKind || "skill"]?.decisions?.[item.id];
  return { states, error, refresh, save, decisionFor };
}

export function CurationPanel({ item, curation }) {
  const saved = curation.decisionFor(item);
  const [notes, setNotes] = useState(saved?.notes || "");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [failed, setFailed] = useState(false);
  const dirty = notes !== (saved?.notes || "");
  useEffect(() => {
    if (!touched) setNotes(saved?.notes || "");
  }, [item.id, saved?.notes]);
  const commit = async (value) => {
    setBusy(true);
    setStatus("正在保存…");
    setFailed(false);
    try {
      const entry = await curation.save(item, value, notes);
      setTouched(false);
      setNotes(entry?.notes || "");
      setStatus(value === "reset" ? "已撤销本轮标记。" : "已保存到本机。");
    } catch (error) {
      setStatus(error.message);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="curation-panel" aria-label="参考取舍">
      <h3>留下适合你的表达。</h3>
      <div className="curation-actions">
        {[
          ["keep", "保留"],
          ["remove", "不要"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={saved?.decision === value ? "primary" : "secondary"}
            aria-pressed={saved?.decision === value}
            disabled={busy}
            onClick={() => commit(value)}
          >
            {label}
          </button>
        ))}
        <button
          className="text-button"
          disabled={busy || !saved}
          onClick={() => commit("reset")}
        >
          撤销标记
        </button>
      </div>
      <label className="curation-notes">
        具体意见
        <textarea
          aria-label="参考修改意见"
          value={notes}
          maxLength={2000}
          rows={3}
          onChange={(e) => {
            setNotes(e.target.value);
            setTouched(true);
          }}
          placeholder="例如：保留这个动作，文字进入再慢一些。"
        />
      </label>
      <button
        className="secondary"
        disabled={busy || !dirty}
        onClick={() => commit(saved?.decision || "unreviewed")}
      >
        保存意见
      </button>
      <p
        className={failed ? "error-message" : "save-message"}
        role={failed ? "alert" : "status"}
      >
        {status || "取舍和意见沿用现有记录；选择时会一并保存当前意见。"}
      </p>
      {failed && (
        <button className="text-button" onClick={curation.refresh}>
          重新读取最新记录
        </button>
      )}
    </section>
  );
}
