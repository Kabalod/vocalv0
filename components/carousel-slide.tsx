import type { CSSProperties, ReactNode } from "react";
import { Bookmark } from "lucide-react";

export type CarouselTheme =
  "editorial" | "swiss" | "film" | "notebook" | "contrast";
export type CarouselLayout =
  | "cover"
  | "photo-cover"
  | "statement"
  | "list"
  | "steps"
  | "quote"
  | "number"
  | "split"
  | "photo-example"
  | "cta";
export type CarouselSlideData = {
  id: number;
  layout: CarouselLayout;
  kicker?: string;
  title: string;
  body?: string;
  items?: string[];
  value?: string;
  photo?: string;
  caption?: string;
};

type ThemeStyle = {
  background: string;
  text: string;
  muted: string;
  accent: string;
  heading: string;
  weight: number;
  mono?: boolean;
  lined?: boolean;
};
type MarkTheme = { markerBg: string; markerText?: string };

export const carouselThemeStyles: Record<CarouselTheme, ThemeStyle> = {
  editorial: {
    background: "#131315",
    text: "#f4f2f7",
    muted: "#aaa6b1",
    accent: "#a28bfb",
    heading: "Literata,Georgia,serif",
    weight: 700,
  },
  swiss: {
    background: "#f2f2f0",
    text: "#111111",
    muted: "#5a5a58",
    accent: "#ff4d2e",
    heading: "Inter,-apple-system,sans-serif",
    weight: 800,
  },
  film: {
    background: "#1a1712",
    text: "#efe6d6",
    muted: "#a99c88",
    accent: "#e8b04b",
    heading: "Literata,Georgia,serif",
    weight: 700,
    mono: true,
  },
  notebook: {
    background: "#f3eee4",
    text: "#1a1424",
    muted: "#6d6573",
    accent: "#7154d9",
    heading: "Literata,Georgia,serif",
    weight: 700,
    lined: true,
  },
  contrast: {
    background: "#0b0b0c",
    text: "#ffffff",
    muted: "#a8a8ad",
    accent: "#ffe14d",
    heading: "Inter,-apple-system,sans-serif",
    weight: 900,
  },
};

const NBSP = "\u00A0";
const SHORT =
  /(^|[ \n])(в|и|к|с|о|у|а|я|на|не|по|за|из|от|до|без|для|что|как)[ \n]+/gi;

export function RichText(props: {
  text: string;
  size: number;
  color: string;
  family: string;
  weight?: number;
  lineHeight?: number;
  maxWidth?: number;
  theme: MarkTheme;
}) {
  const {
    text,
    size,
    color,
    family,
    weight = 700,
    lineHeight = 1.08,
    maxWidth,
    theme,
  } = props;
  const prepared = text.replace(SHORT, (_m, a, w) => `${a}${w}${NBSP}`);
  const tokens: { w: string; mark: boolean }[] = [];
  prepared.split(/(\*[^*]+\*)/g).forEach((part) => {
    if (!part) return;
    const mark = part.startsWith("*") && part.endsWith("*");
    const clean = mark ? part.slice(1, -1) : part;
    clean
      .split(/[ \t\n]+/)
      .filter(Boolean)
      .forEach((w) => tokens.push({ w, mark }));
  });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "baseline",
        maxWidth,
        fontFamily: family,
        fontSize: size,
        fontWeight: weight,
        lineHeight,
        color,
      }}
    >
      {tokens.map((t, i) => (
        <span
          key={i}
          style={{
            display: "flex",
            marginRight: size * 0.26,
            paddingLeft: t.mark ? size * 0.1 : 0,
            paddingRight: t.mark ? size * 0.1 : 0,
            marginLeft: t.mark ? -size * 0.05 : 0,
            backgroundColor: t.mark ? theme.markerBg : "transparent",
            color: t.mark && theme.markerText ? theme.markerText : color,
            borderRadius: t.mark ? size * 0.08 : 0,
          }}
        >
          {t.w}
        </span>
      ))}
    </div>
  );
}

const photoByLayout: Partial<Record<CarouselLayout, string>> = {
  "photo-cover": "/images/carousel-author.png",
  split: "/images/carousel-road.png",
  "photo-example": "/images/carousel-coffee.png",
};

function titleSize(slide: CarouselSlideData, theme: CarouselTheme) {
  const length = slide.title.replaceAll("*", "").length;
  if (slide.layout === "cover" || slide.layout === "photo-cover") {
    if (theme === "swiss")
      return length > 58 ? 84 : length > 48 ? 92 : length > 38 ? 108 : 124;
    return length > 65 ? 68 : length > 55 ? 76 : length > 42 ? 86 : 104;
  }
  if (slide.layout === "statement")
    return length > 62 ? 60 : length > 52 ? 68 : length > 35 ? 78 : 96;
  if (slide.layout === "cta") return length > 58 ? 68 : length > 44 ? 76 : 84;
  return length > 80 ? 54 : length > 70 ? 60 : 72;
}

export function CarouselSlide({
  slide,
  theme,
  index,
  total,
  handle,
  selectedField,
  onSelectField,
  onSelectSlide,
  onFillField,
  showPlaceholders = false,
  safeZone = false,
}: {
  slide: CarouselSlideData;
  theme: CarouselTheme;
  index: number;
  total: number;
  handle: string;
  selectedField?: string | null;
  onSelectField?: (field: string) => void;
  onSelectSlide?: () => void;
  onFillField?: (field: "body" | "items" | "value") => void;
  showPlaceholders?: boolean;
  safeZone?: boolean;
}) {
  const c = carouselThemeStyles[theme];
  const accentSlide = slide.layout === "number" || slide.layout === "cta";
  const photo = slide.photo || photoByLayout[slide.layout];
  const isPhotoCover = slide.layout === "photo-cover";
  const text = isPhotoCover
    ? "#ffffff"
    : accentSlide
      ? theme === "contrast"
        ? "#0b0b0c"
        : "#ffffff"
      : c.text;
  const muted = isPhotoCover
    ? "rgba(255,255,255,.8)"
    : accentSlide
      ? theme === "contrast"
        ? "rgba(0,0,0,.8)"
        : "rgba(255,255,255,.8)"
      : c.muted;
  const isList = slide.layout === "list" || slide.layout === "steps";
  const isCover = slide.layout === "cover" || isPhotoCover;
  const markTheme = accentSlide
    ? { markerBg: text, markerText: c.accent }
    : {
        markerBg: theme === "contrast" ? "#ffe14d" : `${c.accent}59`,
        markerText: theme === "contrast" ? "#0b0b0c" : text,
      };
  const rich = (
    value: string,
    size: number,
    color = text,
    family = c.heading,
    weight = c.weight,
    lineHeight = 1.08,
    maxWidth = 904,
  ) => (
    <RichText
      text={value}
      size={size}
      color={color}
      family={family}
      weight={weight}
      lineHeight={lineHeight}
      maxWidth={maxWidth}
      theme={markTheme}
    />
  );
  const field = (
    name: string,
    content: ReactNode,
    style: CSSProperties = {},
  ) => {
    const fieldStyle: CSSProperties = {
      display: "flex",
      padding: 12,
      margin: -12,
      border:
        selectedField === name
          ? `3px solid ${c.accent}`
          : "3px solid transparent",
      borderRadius: 18,
      background: selectedField === name ? `${c.accent}18` : "transparent",
      color: "inherit",
      textAlign: "left",
      ...style,
    };
    if (!onSelectField)
      return (
        <div key={name} style={fieldStyle}>
          {content}
        </div>
      );
    return (
      <button
        key={name}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSelectField(name);
        }}
        style={fieldStyle}
      >
        {content}
      </button>
    );
  };
  const placeholder = (
    name: "body" | "items" | "value",
    hint: string,
  ) => {
    if (!showPlaceholders) return null;
    return field(
      name,
      <div
        style={{
          display: "flex",
          minHeight: name === "items" ? 310 : 210,
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          border: `3px dashed ${text}4d`,
          borderRadius: 16,
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            maxWidth: 760,
            color: `${text}80`,
            fontSize: 36,
            fontWeight: 650,
            lineHeight: 1.18,
            textAlign: "center",
          }}
        >
          {hint}
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onFillField?.(name);
          }}
          style={{
            padding: "18px 30px",
            border: 0,
            borderRadius: 999,
            background: text,
            color: baseBackground,
            fontSize: 28,
            fontWeight: 750,
          }}
        >
          ✦ Заполнить из сценария
        </button>
      </div>,
      { width: "100%", marginTop: 48 },
    );
  };
  const grain =
    theme === "film" ? (
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/images/film-noise.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
          opacity: 0.06,
          pointerEvents: "none",
        }}
      />
    ) : null;
  const progress = (
    <div
      style={{
        position: "absolute",
        top: 42,
        left: 88,
        right: 88,
        display: "flex",
        gap: 8,
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <i
          key={i}
          style={{
            display: "flex",
            height: 6,
            flex: 1,
            borderRadius: 3,
            background: accentSlide
              ? i <= index
                ? `${text}e6`
                : `${text}40`
              : i < index
                ? `${text}e6`
                : i === index
                  ? c.accent
                  : `${text}40`,
          }}
        />
      ))}
    </div>
  );
  const baseBackground = accentSlide
    ? c.accent
    : c.lined
      ? "repeating-linear-gradient(to bottom,#f3eee4 0,#f3eee4 63px,rgba(0,0,0,.06) 64px)"
      : c.background;
  const title = field(
    "title",
    rich(
      slide.title,
      titleSize(slide, theme),
      text,
      c.heading,
      c.weight,
      1.03,
      isCover ? 792 : 904,
    ),
  );

  return (
    <div
      onClick={onSelectSlide}
      style={{
        position: "relative",
        display: "flex",
        width: 1080,
        height: 1350,
        flexDirection: "column",
        padding: 88,
        overflow: "hidden",
        background: baseBackground,
        color: text,
        fontFamily: "Inter,-apple-system,BlinkMacSystemFont,sans-serif",
        boxSizing: "border-box",
      }}
    >
      {isPhotoCover && photo && (
        <div style={{ position: "absolute", inset: 0 }}>
          <img
            src={photo}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {grain}
        </div>
      )}
      {isPhotoCover && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.75) 28%,rgba(0,0,0,0) 60%)",
          }}
        />
      )}
      {progress}
      {theme === "swiss" && !isPhotoCover && slide.layout !== "split" && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 22,
            top: 72,
            color: `${c.accent}30`,
            fontSize: 200,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      {slide.layout === "split" && photo && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "55%",
          }}
        >
          <img
            src={photo}
            alt="Дорога в зал"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {grain}
        </div>
      )}
      <div
        style={{
          position: "relative",
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent:
            slide.layout === "cta"
              ? "center"
              : isCover || slide.layout === "split"
                ? "flex-end"
                : "flex-start",
          paddingTop:
            slide.layout === "cta"
              ? 0
              : isCover
                ? 600
                : slide.layout === "split"
                  ? 760
                  : 92,
          paddingBottom: slide.layout === "cta" ? 0 : 76,
        }}
      >
        {slide.kicker &&
          field(
            "kicker",
            rich(
              slide.kicker,
              theme === "film" ? 28 : 32,
              isPhotoCover ? "#fff" : accentSlide ? text : c.accent,
              theme === "film"
                ? "ui-monospace,monospace"
                : "Inter,-apple-system,sans-serif",
              750,
              1.1,
            ),
            { marginBottom: 38, textTransform: "uppercase" },
          )}
        {slide.layout === "number" &&
          slide.value &&
          field(
            "value",
            rich(slide.value, 210, text, c.heading, c.weight, 0.9),
            { marginBottom: 54 },
          )}
        {slide.layout === "photo-example" && photo && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: "rotate(-2deg)",
              padding: 24,
              paddingBottom: 40,
              background: "#faf7f0",
              boxShadow: "0 24px 60px rgba(0,0,0,.3)",
            }}
          >
            <div style={{ position: "relative", width: 720, height: 690 }}>
              <img
                src={photo}
                alt="Кофе на подоконнике"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {grain}
            </div>
            {field(
              "caption",
              rich(
                slide.caption || slide.title,
                34,
                "#251f1c",
                "Literata,Georgia,serif",
                700,
                1.12,
                720,
              ),
              { marginTop: 26 },
            )}
          </div>
        )}
        {slide.layout !== "photo-example" && slide.layout !== "cta" && title}
        {slide.layout === "number" && !slide.value &&
          placeholder("value", "Добавьте число или короткую фразу")}
        {slide.items && isList && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 30,
              marginTop: 48,
            }}
          >
            {slide.items.map((item, itemIndex) =>
              field(
                `item-${itemIndex}`,
                <>
                  <div style={{ flex: "0 0 58px" }}>
                    {rich(
                      slide.layout === "steps" ? String(itemIndex + 1) : "•",
                      46,
                      accentSlide ? text : c.accent,
                      c.heading,
                      700,
                      1.22,
                      58,
                    )}
                  </div>
                  {rich(item, 46, text, c.heading, 560, 1.22, 820)}
                </>,
                { alignItems: "flex-start", maxWidth: 904 },
              ),
            )}
          </div>
        )}
        {isList && !slide.items?.length &&
          placeholder("items", "Добавьте 3 пункта")}
        {slide.layout === "statement" && !slide.body &&
          placeholder("body", "Добавьте поясняющий текст")}
        {slide.body &&
          slide.layout !== "cta" &&
          field(
            "body",
            rich(
              slide.body,
              slide.layout === "statement" ? 44 : 42,
              muted,
              "Inter,-apple-system,sans-serif",
              500,
              1.32,
            ),
            {
              marginTop:
                slide.layout === "statement" ? 40 : isList ? 48 : "auto",
            },
          )}
        {slide.layout === "cta" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
            <Bookmark
              aria-hidden="true"
              style={{ width: 160, height: 160, strokeWidth: 1.5 }}
            />
            {title}
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <img
                src="/images/carousel-author.png"
                alt="Анна"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  objectFit: "cover",
                }}
              />
              {rich(
                handle,
                44,
                text,
                "Inter,-apple-system,sans-serif",
                700,
                1.1,
              )}
            </div>
            {slide.body &&
              field(
                "body",
                rich(
                  slide.body,
                  40,
                  muted,
                  "Inter,-apple-system,sans-serif",
                  700,
                  1.15,
                ),
              )}
          </div>
        )}
      </div>
      {isCover && (
        <>
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 170,
              width: 140,
              height: 720,
              overflow: "hidden",
              borderRadius: "24px 0 0 24px",
              boxShadow: "-18px 18px 44px rgba(0,0,0,.42)",
            }}
          >
            <img
              src="/images/carousel-road.png"
              alt="Следующий слайд"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {theme === "film" && grain}
          </div>
          <div
            style={{
              position: "absolute",
              right: 88,
              bottom: 74,
              display: "flex",
              alignItems: "flex-end",
              gap: 20,
              color: c.accent,
            }}
          >
            {rich(
              "листай",
              32,
              c.accent,
              "Inter,-apple-system,sans-serif",
              700,
              1,
            )}
            <span aria-hidden="true" style={{ fontSize: 96, lineHeight: 0.75 }}>
              →
            </span>
          </div>
        </>
      )}
      {!isPhotoCover && slide.layout !== "cta" && (
        <div
          style={{
            position: "absolute",
            left: 88,
            bottom: 62,
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: muted,
          }}
        >
          <img
            src="/images/carousel-author.png"
            alt=""
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              objectFit: "cover",
            }}
          />
          {rich(handle, 26, muted, "Inter,-apple-system,sans-serif", 700, 1)}
        </div>
      )}
      {safeZone && isCover && (
        <>
          <div
            style={{
              position: "absolute",
              left: 60,
              top: 75,
              width: 960,
              height: 1200,
              border: "4px dashed rgba(255,255,255,.9)",
              boxSizing: "border-box",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 75,
              background: "rgba(0,0,0,.38)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 75,
              background: "rgba(0,0,0,.38)",
              pointerEvents: "none",
            }}
          />
        </>
      )}
    </div>
  );
}
