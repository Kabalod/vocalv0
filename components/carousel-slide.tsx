import type { CSSProperties, ReactNode } from "react";

export type CarouselTheme = "editorial" | "swiss" | "film" | "notebook" | "contrast";
export type CarouselLayout = "cover" | "photo-cover" | "statement" | "list" | "steps" | "quote" | "number" | "split" | "photo-example" | "cta";
export type CarouselSlideData = { id: number; layout: CarouselLayout; kicker?: string; title: string; body?: string; items?: string[]; value?: string; image?: string };

type ThemeStyle = { background: string; text: string; muted: string; accent: string; heading: string; weight: number; mono?: boolean; lined?: boolean };
export const carouselThemeStyles: Record<CarouselTheme, ThemeStyle> = {
  editorial: { background: "#131315", text: "#f4f2f7", muted: "#aaa6b1", accent: "#a28bfb", heading: "Literata,Georgia,serif", weight: 700 },
  swiss: { background: "#f2f2f0", text: "#111111", muted: "#5a5a58", accent: "#ff4d2e", heading: "Inter,-apple-system,sans-serif", weight: 800 },
  film: { background: "#1a1712", text: "#efe6d6", muted: "#a99c88", accent: "#e8b04b", heading: "Literata,Georgia,serif", weight: 700, mono: true },
  notebook: { background: "#f3eee4", text: "#1a1424", muted: "#6d6573", accent: "#7154d9", heading: "Literata,Georgia,serif", weight: 700, lined: true },
  contrast: { background: "#0b0b0c", text: "#ffffff", muted: "#a8a8ad", accent: "#ffe14d", heading: "Inter,-apple-system,sans-serif", weight: 900 },
};

const photoByLayout: Partial<Record<CarouselLayout, string>> = { "photo-cover": "/images/carousel-author.png", split: "/images/carousel-road.png", "photo-example": "/images/carousel-coffee.png" };
const wordFlow: CSSProperties = { display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: ".28em", rowGap: 0 };

function words(text: string, accent: string, notebook = false): ReactNode[] {
  let highlighted = false;
  let key = 0;
  return text.split("*").flatMap((part, section) => {
    const active = highlighted;
    highlighted = !highlighted;
    return part.trim().split(/\s+/).filter(Boolean).map((word) => (
      <span key={`${section}-${key++}`} style={active ? { backgroundColor: `${accent}59`, borderRadius: 8, padding: "0 10px", marginLeft: -4, marginRight: -4, fontFamily: notebook ? "Caveat,cursive" : "inherit" } : undefined}>{word}</span>
    ));
  });
}

function titleSize(slide: CarouselSlideData, theme: CarouselTheme) {
  const length = slide.title.replaceAll("*", "").length;
  if (slide.layout === "cover" || slide.layout === "photo-cover") {
    if (theme === "swiss") return length > 48 ? 92 : length > 38 ? 108 : 124;
    return length > 55 ? 76 : length > 42 ? 86 : 104;
  }
  if (slide.layout === "statement") return length > 52 ? 68 : length > 35 ? 78 : 96;
  if (slide.layout === "cta") return 76;
  return length > 70 ? 60 : 72;
}

export function CarouselSlide({ slide, theme, index, total, handle, selectedField, onSelectField, onSelectSlide, safeZone = false }: { slide: CarouselSlideData; theme: CarouselTheme; index: number; total: number; handle: string; selectedField?: string | null; onSelectField?: (field: string) => void; onSelectSlide?: () => void; safeZone?: boolean }) {
  const c = carouselThemeStyles[theme];
  const accentSlide = slide.layout === "number" || slide.layout === "cta";
  const text = accentSlide ? (theme === "contrast" ? "#0b0b0c" : "#ffffff") : c.text;
  const muted = accentSlide ? (theme === "contrast" ? "rgba(0,0,0,.62)" : "rgba(255,255,255,.72)") : c.muted;
  const image = slide.image || photoByLayout[slide.layout];
  const isPhotoCover = slide.layout === "photo-cover";
  const isList = slide.layout === "list" || slide.layout === "steps";
  const isCover = slide.layout === "cover" || isPhotoCover;
  const field = (name: string, content: ReactNode, style: CSSProperties) => {
    const fieldStyle: CSSProperties = { display: "flex", padding: 12, margin: -12, border: selectedField === name ? `3px solid ${c.accent}` : "3px solid transparent", borderRadius: 18, background: selectedField === name ? `${c.accent}18` : "transparent", color: "inherit", textAlign: "left", ...style };
    if (!onSelectField) return <div key={name} style={fieldStyle}>{content}</div>;
    return <button key={name} type="button" onClick={(event) => { event.stopPropagation(); onSelectField(name); }} style={fieldStyle}>{content}</button>;
  };
  const textField = (name: string, value: string, style: CSSProperties) => field(name, words(value, c.accent, theme === "notebook"), { ...wordFlow, ...style });
  const progress = <div style={{ position: "absolute", top: 42, left: 88, right: 88, display: "flex", gap: 8 }}>{Array.from({ length: total }, (_, i) => <i key={i} style={{ display: "flex", height: 6, flex: 1, borderRadius: 3, background: i < index ? `${text}e6` : i === index ? c.accent : `${text}40` }}/>)}</div>;
  const baseBackground = accentSlide ? c.accent : c.lined ? "repeating-linear-gradient(to bottom,#f3eee4 0,#f3eee4 63px,rgba(0,0,0,.06) 64px)" : c.background;
  const title = textField("title", slide.title, { maxWidth: isCover ? 792 : 904, fontFamily: c.heading, fontSize: titleSize(slide, theme), fontWeight: c.weight, lineHeight: 1.03, letterSpacing: -2 });

  return <div onClick={onSelectSlide} style={{ position: "relative", display: "flex", width: 1080, height: 1350, flexDirection: "column", padding: 88, overflow: "hidden", background: baseBackground, color: text, fontFamily: "Inter,-apple-system,BlinkMacSystemFont,sans-serif", boxSizing: "border-box" }}>
    {isPhotoCover && image && <img src={image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>} 
    {isPhotoCover && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.4) 34%,rgba(0,0,0,0) 60%)" }}/>} 
    {theme === "film" && <div style={{ position: "absolute", inset: 0, opacity: .08, pointerEvents: "none", background: "repeating-radial-gradient(circle at 20% 30%,#fff 0 1px,transparent 1px 4px)" }}/>} 
    {progress}
    {theme === "swiss" && <span style={{ position: "absolute", right: 22, top: 72, color: `${c.accent}30`, fontSize: 200, fontWeight: 900, lineHeight: 1 }}>{String(index + 1).padStart(2, "0")}</span>}
    {slide.layout === "split" && image && <img src={image} alt="Дорога в зал" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "55%", objectFit: "cover" }}/>} 
    <div style={{ position: "relative", display: "flex", flex: 1, flexDirection: "column", justifyContent: isCover || slide.layout === "split" ? "flex-end" : "flex-start", paddingTop: isCover ? 600 : slide.layout === "split" ? 760 : 92, paddingBottom: 76 }}>
      {(slide.kicker || isPhotoCover) && textField("kicker", slide.kicker || "ПРИВЫЧКА И МОТИВАЦИЯ", { color: isPhotoCover ? "#fff" : accentSlide ? text : c.accent, fontFamily: theme === "film" ? "ui-monospace,monospace" : "inherit", fontSize: theme === "film" ? 28 : 32, fontWeight: 750, lineHeight: 1.1, letterSpacing: 2, textTransform: "uppercase", marginBottom: 38 })}
      {slide.layout === "number" && textField("value", slide.value || "", { color: text, fontFamily: c.heading, fontSize: 210, fontWeight: c.weight, lineHeight: .9, marginBottom: 54 })}
      {slide.layout === "photo-example" && image && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: "rotate(-2deg)", padding: 24, paddingBottom: 40, background: "#faf7f0", boxShadow: "0 24px 60px rgba(0,0,0,.3)" }}><img src={image} alt="Кофе на подоконнике" style={{ width: 720, height: 690, objectFit: "cover"}}/><div style={{ ...wordFlow, marginTop: 26, color: "#251f1c", fontFamily: "Literata,Georgia,serif", fontSize: 34 }}>{words("Маленький ритуал важнее идеального плана", c.accent)}</div></div>}
      {slide.layout !== "photo-example" && slide.layout !== "cta" && title}
      {slide.items && <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 48 }}>{slide.items.map((item, itemIndex) => field(`item-${itemIndex}`, <><span style={{ display: "flex", width: 58, flex: "0 0 58px", color: accentSlide ? text : c.accent }}>{slide.layout === "steps" ? String(itemIndex + 1).padStart(2, "0") : "•"}</span><span style={wordFlow}>{words(item, c.accent, theme === "notebook")}</span></>, { alignItems: "flex-start", maxWidth: 904, fontSize: 46, fontWeight: 560, lineHeight: 1.22 }))}</div>}
      {slide.body && slide.layout !== "cta" && textField("body", slide.body, { maxWidth: 904, color: muted, fontSize: 42, fontWeight: 500, lineHeight: 1.32, marginTop: isList ? 48 : "auto" })}
      {slide.layout === "cta" && <div style={{ display: "flex", flexDirection: "column", gap: 34 }}><span style={{ display: "flex", width: 160, height: 180, alignItems: "center", justifyContent: "center", fontSize: 160, fontWeight: 200, lineHeight: 1 }}>♡</span>{title}<div style={{ display: "flex", alignItems: "center", gap: 28 }}><img src="/images/carousel-author.png" alt="Анна" style={{ width: 120, height: 120, borderRadius: 60, objectFit: "cover" }}/><b style={{ fontSize: 44 }}>{handle}</b></div><span style={{ color: muted, fontSize: 38 }}>Напишите СТАРТ в директ</span></div>}
    </div>
    {isCover && <><div style={{ position: "absolute", right: 0, top: 170, width: 140, height: 720, overflow: "hidden", borderRadius: "24px 0 0 24px", boxShadow: "-18px 18px 44px rgba(0,0,0,.42)" }}><img src="/images/carousel-road.png" alt="Следующий слайд" style={{ width: "100%", height: "100%", objectFit: "cover" }}/></div><div style={{ position: "absolute", right: 88, bottom: 74, display: "flex", alignItems: "flex-end", gap: 20, color: c.accent }}><span style={{ fontSize: 32 }}>листай</span><span style={{ fontSize: 96, lineHeight: .75 }}>→</span></div></>}
    {!isPhotoCover && slide.layout !== "cta" && <div style={{ position: "absolute", left: 88, bottom: 62, display: "flex", alignItems: "center", gap: 16, color: muted, fontSize: 26 }}><img src="/images/carousel-author.png" alt="" style={{ width: 52, height: 52, borderRadius: 26, objectFit: "cover" }}/>{handle}</div>}
    {safeZone && isCover && <><div style={{ position: "absolute", left: 60, top: 75, width: 960, height: 1200, border: "4px dashed rgba(255,255,255,.9)", boxSizing: "border-box", pointerEvents: "none" }}/><div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 75, background: "rgba(0,0,0,.38)", pointerEvents: "none" }}/><div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 75, background: "rgba(0,0,0,.38)", pointerEvents: "none" }}/></>}
  </div>;
}
