import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
  delayRender,
  continueRender,
} from "remotion";
import { useBranding } from "../branding";

// --- Asciinema .cast parser ---

interface CastHeader {
  width: number;
  height: number;
}

type CastEvent = [number, "o" | "i", string];

interface ParsedCast {
  header: CastHeader;
  events: CastEvent[];
}

function parseCast(raw: string): ParsedCast {
  const lines = raw.trim().split("\n");
  const header = JSON.parse(lines[0]) as CastHeader;
  const events: CastEvent[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const ev = JSON.parse(line) as CastEvent;
    if (ev[1] === "o") events.push(ev);
  }
  return { header, events };
}

// --- Simple ANSI interpreter ---
// Handles basic SGR codes (colors, bold, reset) and produces styled spans.

interface StyledChar {
  char: string;
  fg: string | null;
  bg: string | null;
  bold: boolean;
}

const ANSI_COLORS: Record<number, string> = {
  30: "#1e1e1e", 31: "#e06c75", 32: "#98c379", 33: "#e5c07b",
  34: "#61afef", 35: "#c678dd", 36: "#56b6c2", 37: "#abb2bf",
  90: "#5c6370", 91: "#e06c75", 92: "#98c379", 93: "#e5c07b",
  94: "#61afef", 95: "#c678dd", 96: "#56b6c2", 97: "#ffffff",
};

const ANSI_BG_COLORS: Record<number, string> = {
  40: "#1e1e1e", 41: "#e06c75", 42: "#98c379", 43: "#e5c07b",
  44: "#61afef", 45: "#c678dd", 46: "#56b6c2", 47: "#abb2bf",
  100: "#5c6370", 101: "#e06c75", 102: "#98c379", 103: "#e5c07b",
  104: "#61afef", 105: "#c678dd", 106: "#56b6c2", 107: "#ffffff",
};

function interpretAnsi(text: string): StyledChar[] {
  const chars: StyledChar[] = [];
  let fg: string | null = null;
  let bg: string | null = null;
  let bold = false;
  let i = 0;

  while (i < text.length) {
    // ESC sequence
    if (text[i] === "\x1b" && text[i + 1] === "[") {
      const end = text.indexOf("m", i + 2);
      if (end !== -1) {
        const codes = text.slice(i + 2, end).split(";").map(Number);
        for (const code of codes) {
          if (code === 0) { fg = null; bg = null; bold = false; }
          else if (code === 1) bold = true;
          else if (code === 22) bold = false;
          else if (code >= 30 && code <= 37) fg = ANSI_COLORS[code] ?? null;
          else if (code >= 90 && code <= 97) fg = ANSI_COLORS[code] ?? null;
          else if (code === 39) fg = null;
          else if (code >= 40 && code <= 47) bg = ANSI_BG_COLORS[code] ?? null;
          else if (code >= 100 && code <= 107) bg = ANSI_BG_COLORS[code] ?? null;
          else if (code === 49) bg = null;
        }
        i = end + 1;
        continue;
      }
    }

    // Skip other ESC sequences (cursor movement, etc.)
    if (text[i] === "\x1b") {
      i++;
      if (i < text.length && text[i] === "[") {
        i++;
        while (i < text.length && text[i] >= "\x20" && text[i] <= "\x3f") i++;
        if (i < text.length) i++; // skip final byte
      }
      continue;
    }

    // Carriage return
    if (text[i] === "\r") { i++; continue; }

    chars.push({ char: text[i], fg, bg, bold });
    i++;
  }

  return chars;
}

// Build a buffer of lines from sequential output events
function buildScreenBuffer(events: CastEvent[], upToTime: number): string[] {
  let output = "";
  for (const ev of events) {
    if (ev[0] > upToTime) break;
    output += ev[2];
  }

  // Process into lines, handling \r\n and standalone \r
  const lines: string[] = [];
  let currentLine = "";
  for (let i = 0; i < output.length; i++) {
    if (output[i] === "\r" && output[i + 1] === "\n") {
      // \r\n — treat as single newline
      lines.push(currentLine);
      currentLine = "";
      i++; // skip the \n
    } else if (output[i] === "\n") {
      lines.push(currentLine);
      currentLine = "";
    } else if (output[i] === "\r") {
      // Standalone \r — reset cursor to start of line (overwrite)
      currentLine = "";
    } else {
      currentLine += output[i];
    }
  }
  lines.push(currentLine);
  return lines;
}

// --- Component ---

export const terminalReplayDataSchema = z.object({
  castFile: z.string().default("").describe("Path to .cast file in public/ (used via staticFile)"),
  castContent: z.string().default("").describe("Raw content of an asciinema .cast file (alternative to castFile)"),
  speed: z.number().default(1).describe("Playback speed multiplier"),
  fontSize: z.number().default(16).describe("Terminal font size in px"),
  lineHeight: z.number().default(1.4).describe("Line height multiplier"),
  showHeader: z.boolean().default(true).describe("Show terminal window header bar"),
  title: z.string().default("Terminal").describe("Terminal window title"),
  maxLines: z.number().default(30).describe("Max visible lines (scroll if exceeded)"),
  bgColor: zColor().optional().describe("Override terminal background"),
  textColor: zColor().optional().describe("Override default text color"),
  animationDelay: z.number().default(0).describe("Delay before replay starts (frames)"),
});

export type TerminalReplayData = z.infer<typeof terminalReplayDataSchema>;

export const TerminalReplay: React.FC<TerminalReplayData> = ({
  castFile = "",
  castContent = "",
  speed = 1,
  fontSize = 16,
  lineHeight = 1.4,
  showHeader = true,
  title = "Terminal",
  maxLines = 30,
  bgColor,
  textColor,
  animationDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();

  const bg = bgColor ?? "#1e1e1e";
  const fg = textColor ?? "#abb2bf";

  // Load cast file if specified
  const [loadedContent, setLoadedContent] = useState(castContent);
  const [handle] = useState(() => (castFile ? delayRender() : null));

  useEffect(() => {
    if (!castFile) return;
    fetch(staticFile(castFile))
      .then((res) => res.text())
      .then((text) => {
        setLoadedContent(text);
        if (handle !== null) continueRender(handle);
      })
      .catch((err) => {
        console.error("Failed to load cast file:", err);
        if (handle !== null) continueRender(handle);
      });
  }, [castFile, handle]);

  const parsed = useMemo(
    () => (loadedContent ? parseCast(loadedContent) : { header: { width: 80, height: 24 }, events: [] }),
    [loadedContent],
  );

  // Current time in the recording
  const elapsedFrames = Math.max(0, frame - animationDelay);
  const currentTime = (elapsedFrames / fps) * speed;

  // Build screen content up to current time
  const lines = useMemo(
    () => buildScreenBuffer(parsed.events, currentTime),
    [parsed.events, currentTime],
  );

  // Show last N lines if overflow
  const visibleLines = lines.slice(-maxLines);

  // Cursor blink (every 30 frames)
  const cursorVisible = Math.floor(elapsedFrames / 15) % 2 === 0;

  const headerHeight = showHeader ? 36 : 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      {/* Window header */}
      {showHeader && (
        <div
          style={{
            height: headerHeight,
            backgroundColor: "#333",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#28c840" }} />
          <span
            style={{
              color: "#999",
              fontSize: 13,
              fontFamily: "monospace",
              marginLeft: 12,
            }}
          >
            {title}
          </span>
        </div>
      )}

      {/* Terminal body */}
      <div
        style={{
          flex: 1,
          backgroundColor: bg,
          padding: 16,
          overflow: "hidden",
          fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
          fontSize,
          lineHeight,
          color: fg,
        }}
      >
        {visibleLines.map((line, i) => {
          const isLastLine = i === visibleLines.length - 1;
          const styledChars = interpretAnsi(line);

          return (
            <div key={i} style={{ whiteSpace: "pre", minHeight: fontSize * lineHeight }}>
              {styledChars.map((sc, j) => (
                <span
                  key={j}
                  style={{
                    color: sc.fg ?? fg,
                    backgroundColor: sc.bg ?? undefined,
                    fontWeight: sc.bold ? 700 : 400,
                  }}
                >
                  {sc.char}
                </span>
              ))}
              {isLastLine && cursorVisible && (
                <span
                  style={{
                    display: "inline-block",
                    width: fontSize * 0.6,
                    height: fontSize,
                    backgroundColor: fg,
                    opacity: 0.7,
                    verticalAlign: "bottom",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
