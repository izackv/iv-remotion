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

const terminalLineSchema = z.object({
  text: z.string().describe("Text to display (supports \\n for multi-line output)"),
  startTime: z.number().describe("When this line starts appearing (seconds)"),
  typed: z.boolean().default(false).describe("Type out character by character"),
  typingSpeed: z
    .number()
    .default(30)
    .describe("Characters per second when typed=true"),
  prompt: z.string().default("").describe("Prompt prefix (e.g. '$ '). Empty = output line"),
  color: zColor().optional().describe("Override text color"),
  bold: z.boolean().default(false),
  pauseAfter: z
    .number()
    .default(0)
    .describe("Extra pause after this line finishes (seconds)"),
});

export const terminalScriptedDataSchema = z.object({
  linesFile: z.string().default("").describe("Path to JSON file in public/ containing lines array"),
  lines: z.array(terminalLineSchema).default([]).describe("Scripted terminal lines in order (alternative to linesFile)"),
  fontSize: z.number().default(18).describe("Terminal font size in px"),
  lineHeight: z.number().default(1.5).describe("Line height multiplier"),
  showHeader: z.boolean().default(true).describe("Show terminal window header bar"),
  title: z.string().default("Terminal").describe("Terminal window title"),
  maxLines: z.number().default(28).describe("Max visible lines (scroll if exceeded)"),
  bgColor: zColor().optional().describe("Override terminal background"),
  textColor: zColor().optional().describe("Override default text color"),
  promptColor: zColor().optional().describe("Override prompt color"),
  animationDelay: z.number().default(0).describe("Delay before replay starts (frames)"),
});

export type TerminalScriptedData = z.infer<typeof terminalScriptedDataSchema>;

export const TerminalScripted: React.FC<TerminalScriptedData> = ({
  linesFile = "",
  lines = [],
  fontSize = 18,
  lineHeight = 1.5,
  showHeader = true,
  title = "Terminal",
  maxLines = 28,
  bgColor,
  textColor,
  promptColor,
  animationDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Load lines from file if specified
  const [loadedLines, setLoadedLines] = useState(lines);
  const [handle] = useState(() => (linesFile ? delayRender() : null));

  useEffect(() => {
    if (!linesFile) return;
    fetch(staticFile(linesFile))
      .then((res) => res.json())
      .then((data) => {
        setLoadedLines(data);
        if (handle !== null) continueRender(handle);
      })
      .catch((err) => {
        console.error("Failed to load lines file:", err);
        if (handle !== null) continueRender(handle);
      });
  }, [linesFile, handle]);
  const branding = useBranding();

  const bg = bgColor ?? "#1e1e1e";
  const fg = textColor ?? "#abb2bf";
  const promptFg = promptColor ?? "#98c379";

  const elapsedFrames = Math.max(0, frame - animationDelay);
  const currentTime = elapsedFrames / fps;

  // Build visible output
  const rendered = useMemo(() => {
    const result: {
      prompt: string;
      text: string;
      color: string | null;
      bold: boolean;
      showCursor: boolean;
    }[] = [];

    for (let i = 0; i < loadedLines.length; i++) {
      const line = loadedLines[i];
      if (currentTime < line.startTime) break;

      const elapsed = currentTime - line.startTime;

      if (line.typed) {
        const totalChars = line.text.length;
        const typingDuration = totalChars / (line.typingSpeed ?? 30);
        const charsToShow = Math.min(
          totalChars,
          Math.floor(elapsed * (line.typingSpeed ?? 30)),
        );
        const visibleText = line.text.slice(0, charsToShow);
        const isTyping = charsToShow < totalChars;

        // Split by newlines for multi-line typed content
        const textLines = visibleText.split("\n");
        textLines.forEach((tl, j) => {
          result.push({
            prompt: j === 0 ? (line.prompt ?? "") : "",
            text: tl,
            color: line.color ?? null,
            bold: line.bold ?? false,
            showCursor: isTyping && j === textLines.length - 1,
          });
        });

        // If still typing, don't show subsequent lines
        if (isTyping) break;
      } else {
        // Instant output — split by newlines
        const textLines = line.text.split("\n");
        textLines.forEach((tl, j) => {
          result.push({
            prompt: j === 0 ? (line.prompt ?? "") : "",
            text: tl,
            color: line.color ?? null,
            bold: line.bold ?? false,
            showCursor: false,
          });
        });
      }
    }

    return result;
  }, [loadedLines, currentTime]);

  // Show cursor on the last line if we're between lines (waiting)
  const visibleLines = rendered.slice(-maxLines);
  const isIdle =
    rendered.length > 0 && !rendered[rendered.length - 1].showCursor;
  const cursorBlink = Math.floor(elapsedFrames / 15) % 2 === 0;

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
            height: 36,
            backgroundColor: "#333",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#ff5f57",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#febc2e",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#28c840",
            }}
          />
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
          fontFamily:
            "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
          fontSize,
          lineHeight,
          color: fg,
        }}
      >
        {visibleLines.map((line, i) => {
          const isLast = i === visibleLines.length - 1;

          return (
            <div
              key={i}
              style={{ whiteSpace: "pre", minHeight: fontSize * lineHeight }}
            >
              {line.prompt && (
                <span style={{ color: promptFg, fontWeight: 700 }}>
                  {line.prompt}
                </span>
              )}
              <span
                style={{
                  color: line.color ?? fg,
                  fontWeight: line.bold ? 700 : 400,
                }}
              >
                {line.text}
              </span>
              {/* Typing cursor */}
              {line.showCursor && cursorBlink && (
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
              {/* Idle cursor on last line with a prompt */}
              {isLast && !line.showCursor && isIdle && line.prompt && cursorBlink && (
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
