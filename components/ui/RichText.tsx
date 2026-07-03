"use client";

import { Fragment, type ElementType, type ReactNode } from "react";

// Small markdown-lite renderer for quest/clue copy. The content in
// content/*.ts uses a handful of markdown patterns (**bold**, ~~strike~~,
// *italic*, and \n line breaks) that were never actually being parsed —
// every render site was just dumping the raw string into a <p>, so players
// saw literal asterisks and tildes on screen. This is the fix: a tiny
// parser for exactly the patterns this game's content actually uses.
// Not a general markdown engine — deliberately minimal.

const TOKEN_PATTERN = /(\*\*(.+?)\*\*)|(~~(.+?)~~)|(\*(.+?)\*)/;

function renderInline(line: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = line;
  let key = 0;

  while (remaining.length > 0) {
    const match = TOKEN_PATTERN.exec(remaining);
    if (!match || match.index === undefined) {
      nodes.push(remaining);
      break;
    }
    if (match.index > 0) nodes.push(remaining.slice(0, match.index));

    if (match[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-${key++}`}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      nodes.push(<s key={`${keyPrefix}-${key++}`}>{match[4]}</s>);
    } else if (match[5] !== undefined) {
      nodes.push(<em key={`${keyPrefix}-${key++}`}>{match[6]}</em>);
    }
    remaining = remaining.slice(match.index + match[0].length);
  }
  return nodes;
}

// Some content (currently just the Shed date list) needs "today's real date"
// baked in live, since the game is replayed on different dates. Content
// authors write the token {{TODAY}} and it's swapped for the actual date
// at render time, in the same MMDDYYYY numeric format as the rest of that
// list — no locale-specific month names needed.
function substituteTokens(text: string): string {
  if (!text.includes("{{TODAY}}")) return text;
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yyyy = String(now.getFullYear());
  return text.replaceAll("{{TODAY}}", `${mm}${dd}${yyyy}`);
}

export function RichText({
  text,
  as: As = "p",
  className,
  style,
}: {
  text: string | undefined | null;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!text) return null;
  const lines = substituteTokens(text).split("\n");
  return (
    <As className={className} style={style}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {renderInline(line, String(i))}
        </Fragment>
      ))}
    </As>
  );
}
