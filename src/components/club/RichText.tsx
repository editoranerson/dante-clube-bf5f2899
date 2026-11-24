import { Fragment } from "react";

/** Renders the simple formatting used by the institutional page editor: "## " titles, "- " lists and paragraphs. */
export function RichText({ content }: { content: string }) {
  const blocks = content.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-foreground/85">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter((l) => l.trim().length > 0);
        return (
          <Fragment key={i}>
            {lines.map((line, j) => {
              if (line.startsWith("## "))
                return (
                  <h2 key={j} className="pt-2 font-display text-xl font-semibold text-foreground">
                    {line.slice(3)}
                  </h2>
                );
              return null;
            })}
            {(() => {
              const rest = lines.filter((l) => !l.startsWith("## "));
              if (!rest.length) return null;
              if (rest.every((l) => l.startsWith("- ")))
                return (
                  <ul className="list-disc space-y-1 pl-5 marker:text-primary-glow">
                    {rest.map((l, k) => (
                      <li key={k}>{l.slice(2)}</li>
                    ))}
                  </ul>
                );
              return <p>{rest.join(" ")}</p>;
            })()}
          </Fragment>
        );
      })}
    </div>
  );
}
