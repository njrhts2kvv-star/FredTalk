import React, { useState, useEffect, useMemo, useRef } from "react";
import { groups, pages } from "./content.js";
import { useCuration } from "./Curation.jsx";
import { Typography } from "./FoundationPages.jsx";
import { Library } from "./ReferenceLibrary.jsx";
import { Guidelines } from "./Guidelines.jsx";
const validPages = new Set(groups.flatMap(g => g.items.map(x => x[0])));
const initialPage = () => {
  const key = location.hash.slice(1);
  return key === "overview" ? "principles" : validPages.has(key) ? key : "library";
};

export default function App() {
  const [page, setPage] = useState(initialPage),
    [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [mobileNav, setMobileNav] = useState(false),
    [selectedId, setSelectedId] = useState(null);
  const main = useRef(null);
  const curation = useCuration();
  const reviewedData = data
    ? {
        ...data,
        items: data.items.map((item) => ({
          ...item,
          reviewStatus: curation.states[item.reviewKind || "skill"]
            ? curation.decisionFor(item)?.decision || "unreviewed"
            : item.reviewStatus,
        })),
      }
    : null;
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/design-system", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error("参考库未连接。基础规范仍可使用。");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const handler = () => {
      setPage(initialPage());
      setMobileNav(false);
      setSelectedId(null);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    document.title = pages[page][1] + " · FredTalk 设计规范";
    window.scrollTo({ top: 0 });
  }, [page]);
  const navigate = (target, id = null) => {
    if (target !== page) {
      history.pushState({}, "", `#${target}`);
      setPage(target);
    }
    setMobileNav(false);
    setSelectedId(id);
  };
  const fontCSS = (data?.typography?.faces || [])
    .filter((face) => face.available && face.url?.startsWith("/api/"))
    .map((face) => `@font-face{font-family:${JSON.stringify(face.family)};src:url(${JSON.stringify(face.url)});font-weight:${face.weight};font-style:${face.style || "normal"};font-display:swap;}`)
    .join("");
  return (
    <>
      <style>{fontCSS}</style>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        跳到主要内容
      </a>
      <aside className={"sidebar " + (mobileNav ? "open" : "")}>
        <a
          href="#library"
          className="site-brand"
          onClick={(e) => {
            e.preventDefault();
            navigate("library");
          }}
        >
          <span>
            <strong>FredTalk</strong>
            <small>视觉参考库</small>
          </span>
        </a>
        <nav aria-label="规范导航">
          {groups.map((group) => (
            <div className="nav-group" key={group.title}>
              <p>{group.title}</p>
              {group.items.map(([id, label]) => (
                <a
                  key={id}
                  href={"#" + id}
                  aria-current={page === id ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(id);
                  }}
                >
                  {label}
                  
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      {mobileNav && (
        <button
          className="nav-backdrop"
          aria-label="关闭导航"
          onClick={() => setMobileNav(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div>
            <button
              className="mobile-menu"
              aria-label="切换导航"
              aria-expanded={mobileNav}
              onClick={() => setMobileNav(!mobileNav)}
            >
              目录
            </button>
            <span>视觉库与制作参考</span>
            <span className="crumb-divider">/</span>
            <strong>
              {groups.flatMap((g) => g.items).find((x) => x[0] === page)?.[1]}
            </strong>
          </div>
        </header>
        <main id="main-content" ref={main} tabIndex={-1}>
          {error && page !== "library" && (
            <p className="connection-note" role="status">
              {error}
            </p>
          )}
          {page === "typography" && <Typography data={reviewedData} onReference={(id) => navigate("library", id)} />}
          {["principles", "surfaces", "layout"].includes(page) && <Guidelines page={page} />}
          {page === "library" && (
            <Library
              curation={curation}
              data={reviewedData}
              loading={loading}
              error={error}
              selectedId={selectedId}
              onSelectionChange={setSelectedId}
            />
          )}{" "}
        </main>
      </div>
    </>
  );
}
