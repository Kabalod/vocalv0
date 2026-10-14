import type { CSSProperties } from "react";

export type CarouselTheme = "graphite" | "paper" | "contrast";
export type CarouselSlideData = { id: number; kicker: string; title: string; body: string; layout: number };

const themeStyles: Record<CarouselTheme, { background: string; text: string; muted: string; accent: string }> = {
  graphite: { background: "#131315", text: "#f4f2f7", muted: "#94919d", accent: "#a28bfb" },
  paper: { background: "#f3eee4", text: "#1a1424", muted: "#6b6474", accent: "#7154d9" },
  contrast: { background: "#ffffff", text: "#0b0b0c", muted: "#6b6b70", accent: "#7a5af5" },
};

export function CarouselSlide({ slide, theme, index, total, handle, onEdit }: { slide: CarouselSlideData; theme: CarouselTheme; index: number; total: number; handle: string; onEdit?: (field: "kicker" | "title" | "body") => void }) {
  const colors = themeStyles[theme];
  const textStyle = (style: CSSProperties): CSSProperties => ({ display: "flex", width: "100%", minWidth: 0, padding: 0, border: 0, background: "transparent", color: "inherit", textAlign: "left", cursor: onEdit ? "pointer" : "default", ...style });
  const textElement = (field: "kicker" | "title" | "body", value: string, style: CSSProperties) => onEdit
    ? <button type="button" onClick={() => onEdit(field)} style={textStyle(style)}>{value}</button>
    : <span style={textStyle(style)}>{value}</span>;
  return <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", containerType: "inline-size", flexDirection: "column", justifyContent: slide.layout === 6 ? "flex-end" : "center", gap: "2.2cqw", padding: "7.4cqw", overflow: "hidden", background: colors.background, color: colors.text, fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" }}>
    <span style={{ position: "absolute", display: "flex", top: "4.4cqw", right: "5.2cqw", color: colors.muted, fontSize: "2.2cqw", lineHeight: 1 }}>{index + 1}/{total}</span>
    {textElement("kicker", slide.kicker, { color: colors.accent, fontSize: "2.963cqw", fontWeight: 700, lineHeight: 1.15, letterSpacing: ".08em", textTransform: "uppercase" })}
    {textElement("title", slide.title, { fontFamily: theme === "graphite" ? "Literata, Georgia, serif" : "Inter, -apple-system, BlinkMacSystemFont, sans-serif", fontSize: slide.title.length > 48 ? "5.2cqw" : "6.3cqw", fontWeight: 700, lineHeight: 1.07, letterSpacing: "-.03em" })}
    {textElement("body", slide.body, { maxWidth: "82%", color: colors.muted, fontSize: "3.05cqw", fontWeight: 500, lineHeight: 1.4 })}
    <small style={{ position: "absolute", display: "flex", left: "7.4cqw", bottom: "5.2cqw", color: colors.muted, fontSize: "2.25cqw", lineHeight: 1 }}>{handle}</small>
  </div>;
}

export const carouselThemeStyles = themeStyles;
