import React from "react";
export function Inline({ text }) {
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) =>
    p.startsWith("**") ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : p.startsWith("`") ? (
      <code key={i}>{p.slice(1, -1)}</code>
    ) : p.startsWith("[") ? (
      <span key={i}>{p.slice(1, p.indexOf("]"))}</span>
    ) : (
      p
    ),
  );
}

export function Markdown({ text }) {
  const lines = text.split("\n");
  const nodes = [];
  let code = null,
    table = [];
  const flush = () => {
    if (table.length) {
      const rows = table
        .filter((x) => !/^\|[\s:|-]+\|$/.test(x))
        .map((x) => x.split("|").slice(1, -1));
      nodes.push(
        <div className="markdown-table" key={"t" + nodes.length}>
          <table>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) =>
                    i === 0 ? (
                      <th key={j}>
                        <Inline text={c.trim()} />
                      </th>
                    ) : (
                      <td key={j}>
                        <Inline text={c.trim()} />
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      table = [];
    }
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      flush();
      if (code !== null) {
        nodes.push(<pre key={i}>{code.join("\n")}</pre>);
        code = null;
      } else code = [];
      continue;
    }
    if (code !== null) {
      code.push(line);
      continue;
    }
    if (line.startsWith("|")) {
      table.push(line);
      continue;
    }
    flush();
    if (!line.trim()) continue;
    const heading = line.match(/^(#{1,6}) (.*)/);
    if (heading) {
      const Tag = "h" + Math.min(heading[1].length + 1, 6);
      nodes.push(
        <Tag key={i}>
          <Inline text={heading[2]} />
        </Tag>,
      );
    } else
      nodes.push(
        <p key={i} className={/^[-\d]/.test(line) ? "md-list" : ""}>
          <Inline text={line.replace(/^- /, "• ")} />
        </p>,
      );
  }
  flush();
  return <div className="markdown">{nodes}</div>;
}
