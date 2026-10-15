import type { CSSProperties } from "react";

export type CarouselTheme = "graphite" | "paper" | "contrast";
export type CarouselLayout = "cover" | "statement" | "list" | "steps" | "quote" | "number" | "cta";
export type CarouselSlideData = { id: number; layout: CarouselLayout; kicker?: string; title: string; body?: string; items?: string[]; value?: string };

export const carouselThemeStyles = {
  graphite: { background: "linear-gradient(145deg,#131315 0%,#1d1d20 100%)", text: "#f4f2f7", muted: "#94919d", accent: "#a28bfb" },
  paper: { background: "#f3eee4", text: "#1a1424", muted: "#6d6573", accent: "#7154d9" },
  contrast: { background: "#fff", text: "#0b0b0c", muted: "#66666b", accent: "#7a5af5" },
} satisfies Record<CarouselTheme, { background: string; text: string; muted: string; accent: string }>;

function titleSize(slide: CarouselSlideData) {
  const length = slide.title.length;
  if (slide.layout === "cover") return length <= 25 ? 124 : length <= 45 ? 104 : 86;
  if (slide.layout === "statement") return length <= 35 ? 96 : length <= 58 ? 80 : 68;
  if (slide.layout === "quote") return 64;
  if (slide.layout === "number") return 60;
  if (slide.layout === "cta") return 84;
  return 72;
}

export function CarouselSlide({ slide, theme, index, total, handle, selectedField, onSelectField, onSelectSlide }: { slide: CarouselSlideData; theme: CarouselTheme; index: number; total: number; handle: string; selectedField?: string | null; onSelectField?: (field: string) => void; onSelectSlide?: () => void }) {
  const c = carouselThemeStyles[theme];
  const field = (name: string, content: React.ReactNode, style: CSSProperties) => {
    const fieldStyle: CSSProperties = { display: "flex", padding: 12, margin: -12, border: selectedField === name ? `3px solid ${c.accent}` : "3px solid transparent", borderRadius: 18, background: selectedField === name ? `${c.accent}18` : "transparent", color: "inherit", textAlign: "left", ...style };
    if (!onSelectField) return <div style={fieldStyle}>{content}</div>;
    return <button type="button" onClick={(event) => { event.stopPropagation(); onSelectField(name); }} style={fieldStyle}>{content}</button>;
  };
  const footer = <div style={{ position: "absolute", left: 96, right: 96, bottom: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}><div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, color: c.muted }}><span style={{ display: "flex", width: 56, height: 56, alignItems: "center", justifyContent: "center", borderRadius: 28, background: `linear-gradient(135deg,${c.accent},#7154d9)`, color: "white", fontSize: 23, fontWeight: 700 }}>А</span>{handle}</div>{slide.layout === "cover" && <span style={{ display: "flex", fontSize: 28, color: c.muted }}>листай →</span>}</div>;
  return <div onClick={onSelectSlide} style={{ position: "relative", display: "flex", width: 1080, height: 1350, flexDirection: "column", justifyContent: "center", gap: 38, padding: 96, overflow: "hidden", background: c.background, color: c.text, fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif", boxSizing: "border-box" }}>
    <span style={{ position: "absolute", display: "flex", top: 70, right: 76, color: c.muted, fontSize: 28 }}>{index + 1}/{total}</span>
    {slide.kicker && field("kicker", slide.kicker, { color: c.accent, fontSize: 34, fontWeight: 700, lineHeight: 1.1, letterSpacing: 2, textTransform: "uppercase" })}
    {slide.layout === "number" && field("value", slide.value, { color: c.accent, fontFamily: "Literata,Georgia,serif", fontSize: 220, fontWeight: 700, lineHeight: .9 })}
    {slide.layout === "quote" && <span style={{ position: "absolute", display: "flex", top: 160, left: 80, color: c.accent, fontFamily: "Literata,Georgia,serif", fontSize: 220, lineHeight: 1 }}>“</span>}
    {field("title", slide.title, { maxWidth: 880, fontFamily: "Literata,Georgia,serif", fontSize: titleSize(slide), fontWeight: 700, lineHeight: slide.layout === "quote" ? 1.18 : 1.03, letterSpacing: -2 })}
    {slide.items && <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 18 }}>{slide.items.map((item, itemIndex) => field(`item-${itemIndex}`, <><span style={{ display: "flex", width: 48, flex: "0 0 48px", color: c.accent }}>{slide.layout === "steps" ? String(itemIndex + 1).padStart(2, "0") : "•"}</span><span>{item}</span></>, { alignItems: "flex-start", fontSize: 46, fontWeight: 560, lineHeight: 1.25 }))}</div>}
    {slide.body && field("body", slide.body, { maxWidth: 850, color: c.muted, fontSize: 44, fontWeight: 500, lineHeight: 1.35 })}
    {footer}
  </div>;
}
