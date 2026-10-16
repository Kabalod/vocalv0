"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  GripVertical,
  Image as ImageIcon,
  ImagePlus,
  AlertTriangle,
  Pipette,
  LayoutGrid,
  MoreHorizontal,
  Palette,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  Type,
  X,
} from "lucide-react";
import {
  CarouselSlide,
  carouselThemeStyles,
  type CarouselLayout,
  type CarouselSlideData,
  type CarouselTheme,
  type MarkStyle,
} from "./carousel-slide";
import "./carousel-studio.css";
import "./carousel-studio-refinements.css";

type Mode = "slide" | "overview";
type DemoState =
  "no-script" | "empty" | "building" | "error" | "ready" | "updated";
type Inspector = "carousel" | "slide" | "text";
type Sheet = "text" | "theme" | "caption" | "layout" | "share" | "photo" | null;
type PhotoView = "suggested" | "stash" | "takes" | "device";

const initialSlides: CarouselSlideData[] = [
  {
    id: 1,
    layout: "photo-cover",
    kicker: "3 ошибки",
    title: "Почему вы *бросаете* спорт к середине февраля",
    photo: "/images/carousel-author.png",
    photoSource: "Дубль 2 · 0:41",
    caption: "Почему привычка не переживает февраль",
  },
  {
    id: 2,
    layout: "statement",
    title: "Дело не в *силе воли*",
    body: "В январе мы берём план на человека, которым только хотим стать",
  },
  {
    id: 3,
    layout: "list",
    title: "Что ломает привычку",
    items: [
      "Слишком длинные тренировки",
      "Цель на результат, а не на действие",
      "Пропуск = провал",
    ],
  },
  {
    id: 4,
    layout: "split",
    kicker: "Дорога в зал",
    title: "Начните с маршрута, который уже знаком",
    photo: "/images/carousel-road.png",
    photoSource: "Копилка · 14 окт",
  },
  {
    id: 5,
    layout: "photo-example",
    title: "Маленький ритуал важнее идеального плана",
    photo: "/images/carousel-coffee.png",
    photoSource: "Копилка · 14 окт",
    caption: "Маленький ритуал важнее идеального плана",
  },
  {
    id: 6,
    layout: "number",
    value: "15 минут",
    title: "Хватит, чтобы не выпасть из ритма в плохой день",
  },
  {
    id: 7,
    layout: "steps",
    title: "Как перезапуститься",
    items: [
      "Сократите план вдвое",
      "Отмечайте факт, а не вес",
      "После пропуска — сразу следующая",
    ],
  },
  {
    id: 8,
    layout: "cta",
    title: "Сохраните, чтобы вернуться в марте",
    body: "Напишите СТАРТ в директ — пришлю план на 15 минут",
  },
];
const layouts: { name: string; value: CarouselLayout }[] = [
  { name: "Обложка", value: "cover" },
  { name: "Обложка с фото", value: "photo-cover" },
  { name: "Мысль", value: "statement" },
  { name: "Список", value: "list" },
  { name: "Шаги", value: "steps" },
  { name: "Число", value: "number" },
  { name: "Пол-на-пол", value: "split" },
  { name: "Фото-пример", value: "photo-example" },
  { name: "Призыв", value: "cta" },
];
const themeNames: Record<CarouselTheme, string> = {
  editorial: "Редакция",
  swiss: "Швейцарский",
  film: "Плёнка",
  notebook: "Блокнот",
  contrast: "Контраст",
};
const themes = Object.keys(themeNames) as CarouselTheme[];

function highlightTitle(value: string) {
  const clean = value.replaceAll("*", "");
  const keys = ["бросаете", "силе воли", "результат", "15 минут", "сразу", "понедельника", "Сохраните"];
  const key = keys.find((word) => clean.toLowerCase().includes(word.toLowerCase()));
  return key ? clean.replace(new RegExp(key, "i"), (match) => `*${match}*`) : value;
}

function missingField(slide: CarouselSlideData) {
  if (slide.layout === "statement" && !slide.body) return "body" as const;
  if ((slide.layout === "list" || slide.layout === "steps") && !slide.items?.length)
    return "items" as const;
  if (slide.layout === "number" && !slide.value) return "value" as const;
  return null;
}

function missingLabel(layout: CarouselLayout, slide: CarouselSlideData) {
  if (layout === "statement" && !slide.body) return "+ текст";
  if ((layout === "list" || layout === "steps") && !slide.items?.length)
    return "+ пункты";
  if (layout === "number" && !slide.value) return "+ число";
  return null;
}

function LayoutGlyph({ layout }: { layout: CarouselLayout }) {
  return (
    <span className={`cs-layout-glyph is-${layout}`} aria-hidden="true">
      {layout === "cover" && <i className="thick bottom" />}
      {layout === "photo-cover" && (
        <>
          <i className="photo" />
          <i className="thick bottom" />
        </>
      )}
      {layout === "statement" && (
        <>
          <i className="thin top-one" />
          <i className="thin top-two" />
          <i className="thick middle" />
        </>
      )}
      {layout === "list" && (
        <>
          <i className="title" />
          {[0, 1, 2].map((i) => (
            <i className="bullet-row" key={i} />
          ))}
        </>
      )}
      {layout === "steps" && (
        <>
          <i className="title" />
          {[1, 2, 3].map((i) => (
            <i className="step-row" data-step={i} key={i} />
          ))}
        </>
      )}
      {layout === "number" && <i className="number-block">15</i>}
      {layout === "split" && (
        <>
          <i className="split-photo" />
          <i className="split-lines" />
        </>
      )}
      {layout === "photo-example" && <i className="polaroid" />}
      {layout === "cta" && (
        <>
          <Bookmark className="bookmark" />
          <i className="cta-line" />
        </>
      )}
    </span>
  );
}

function ScaledSlide({
  slide,
  scale,
  ...props
}: {
  slide: CarouselSlideData;
  scale: number;
  theme: CarouselTheme;
  index: number;
  total: number;
  handle: string;
  safeZone?: boolean;
  selectedField?: string | null;
  onSelectField?: (field: string) => void;
  onSelectSlide?: () => void;
  onFillField?: (field: "body" | "items" | "value") => void;
  showPlaceholders?: boolean;
  accent?: string;
  markStyle?: MarkStyle;
  onChoosePhoto?: () => void;
}) {
  return (
    <div
      className="cs-scaled"
      style={{ width: 1080 * scale, height: 1350 * scale }}
    >
      <div
        style={{
          width: 1080,
          height: 1350,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <CarouselSlide slide={slide} {...props} />
      </div>
    </div>
  );
}

export default function CarouselStudio() {
  const [slides, setSlides] = useState(initialSlides);
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<Mode>("slide");
  const [theme, setTheme] = useState<CarouselTheme>("editorial");
  const [safeZone, setSafeZone] = useState(false);
  const [inspector, setInspector] = useState<Inspector>("carousel");
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [preview, setPreview] = useState(false);
  const [download, setDownload] = useState(false);
  const [downloadWarning, setDownloadWarning] = useState<number | null>(null);
  const [demo, setDemo] = useState<DemoState>("ready");
  const [handle, setHandle] = useState("@anna.move");
  const [caption, setCaption] = useState(
    "Три ошибки, из-за которых привычка не переживает февраль — и простой способ вернуться без чувства вины.",
  );
  const [dragged, setDragged] = useState<number | null>(null);
  const [accent, setAccent] = useState("#a28bfb");
  const [markStyle, setMarkStyle] = useState<MarkStyle>("fill");
  const [accentMode, setAccentMode] = useState<"auto" | "third" | "manual">("auto");
  const [photoDialog, setPhotoDialog] = useState(false);
  const [cropDialog, setCropDialog] = useState(false);
  const [toast, setToast] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const current = slides[active];
  const firstIncomplete = slides.findIndex((slide) => missingField(slide));
  const selectField = (field: string) => {
    setSelectedField(field);
    setInspector("text");
    if (window.innerWidth <= 640) setSheet("text");
  };
  const selectSlide = () => {
    setSelectedField(null);
    setInspector("slide");
  };
  const fillField = (field: "body" | "items" | "value", slideIndex = active) => {
    setTimeout(() => {
      setSlides((items) =>
        items.map((slide, index) => {
          if (index !== slideIndex) return slide;
          if (field === "body")
            return {
              ...slide,
              body: "В январе мы берём план на человека, которым только хотим стать",
            };
          if (field === "value") return { ...slide, value: "3 из 4" };
          return {
            ...slide,
            items:
              slide.layout === "steps"
                ? [
                    "Сократите план вдвое",
                    "Отмечайте факт, а не вес",
                    "После пропуска — сразу следующая",
                  ]
                : [
                    "Слишком длинные тренировки",
                    "Цель на результат, а не на действие",
                    "Пропуск = провал",
                  ],
          };
        }),
      );
    }, 800);
  };
  const resetSelection = () => {
    setSelectedField(null);
    setInspector("carousel");
  };
  const moveInspectorUp = () => {
    if (inspector === "text") {
      setSelectedField(null);
      setInspector("slide");
    } else if (inspector === "slide") setInspector("carousel");
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") moveInspectorUp();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
  const move = (to: number) => {
    if (dragged === null || dragged === to) return;
    setSlides((items) => {
      const copy = [...items];
      const [item] = copy.splice(dragged, 1);
      copy.splice(to, 0, item);
      return copy;
    });
    setActive(to);
    setDragged(null);
  };
  const duplicate = () =>
    setSlides((items) => [
      ...items.slice(0, active + 1),
      { ...current, id: Date.now() },
      ...items.slice(active + 1),
    ]);
  const remove = () => {
    if (slides.length < 2) return;
    setSlides((items) => items.filter((_, i) => i !== active));
    setActive(Math.max(0, active - 1));
  };
  const scrollTo = (index: number) => {
    setActive(index);
    trackRef.current?.children[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };
  if (demo !== "ready" && demo !== "updated")
    return <EmptyState state={demo} setState={setDemo} />;

  return (
    <section
      className={`cs${sheet ? " sheet-open" : ""}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) resetSelection();
      }}
    >
      <button
        className="cs-demo"
        aria-label="Состояния демо"
        onClick={() => setDemo(demo === "updated" ? "ready" : "updated")}
      >
        <Sparkles />
      </button>
      <header className="cs-toolbar">
        <div className="cs-segment">
          <button
            className={mode === "slide" ? "active" : ""}
            onClick={() => setMode("slide")}
          >
            Слайд
          </button>
          <button
            className={mode === "overview" ? "active" : ""}
            onClick={() => setMode("overview")}
          >
            Обзор
          </button>
        </div>
        <div className="cs-pager">
          <button disabled={active === 0} onClick={() => setActive(active - 1)}>
            <ChevronLeft />
          </button>
          <span>
            {active + 1} / {slides.length}
          </span>
          <button
            disabled={active === slides.length - 1}
            onClick={() => setActive(active + 1)}
          >
            <ChevronRight />
          </button>
        </div>
        <div className="cs-toolbar-actions">
          <button onClick={() => setPreview(true)}>
            <Eye />
            Как в Instagram
          </button>
          <button className="primary" onClick={() => setDownload((v) => !v)}>
            <Download />
            Скачать
          </button>
        </div>
        {download && (
          <div className="cs-download-pop">
            <b>{slides.length} слайдов</b>
            <button>Лента 4:5</button>
            <button>Сторис 9:16</button>
            <button>
              Видео для Reels <small>3 с на слайд · плавный сдвиг</small>
            </button>
            <button>
              <Copy />
              Скопировать подпись
            </button>
            <button
              className="primary"
              onClick={() => {
                if (firstIncomplete >= 0) {
                  setDownloadWarning(firstIncomplete);
                  setDownload(false);
                } else setDownload(false);
              }}
            >
              <Download />
              Скачать
            </button>
          </div>
        )}
      </header>
      {demo === "updated" && (
        <div className="cs-updated">
          Сценарий обновился — собрать заново?
          <button onClick={() => setDemo("ready")}>Собрать</button>
        </div>
      )}

      {mode === "slide" ? (
        <div className="cs-workspace">
          <aside className="cs-rail">
            <div>
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  className={index === active ? "active" : ""}
                  draggable
                  onDragStart={() => setDragged(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => move(index)}
                  onClick={() => scrollTo(index)}
                >
                  <span>{index + 1}</span>
                  <GripVertical />
                  <ScaledSlide
                    slide={slide}
                    scale={0.088}
                    theme={theme}
                    index={index}
                    total={slides.length}
                handle={handle}
                accent={accent}
                markStyle={markStyle}
              />
                </button>
              ))}
            </div>
            <button className="cs-add">
              <Plus />
            </button>
          </aside>
          <main
            className="cs-stage"
            onClick={(event) => {
              if (event.target === event.currentTarget) resetSelection();
            }}
          >
            <div className="cs-desktop-art">
              <ScaledSlide
                slide={current}
                scale={0.42}
                theme={theme}
                index={active}
                total={slides.length}
                handle={handle}
                safeZone={safeZone}
                selectedField={selectedField}
                onSelectField={selectField}
                onSelectSlide={selectSlide}
                onFillField={fillField}
                showPlaceholders
                accent={accent}
                markStyle={markStyle}
                onChoosePhoto={() => setPhotoDialog(true)}
              />
            </div>
            <div
              className="cs-mobile-track"
              ref={trackRef}
              onScroll={(e) => {
                const w =
                  (e.currentTarget.firstElementChild as HTMLElement)
                    ?.offsetWidth || 1;
                setActive(Math.round(e.currentTarget.scrollLeft / (w + 12)));
              }}
            >
              {slides.map((slide, index) => (
                <div className="cs-mobile-art" key={slide.id}>
                  <ScaledSlide
                    slide={slide}
                    scale={0.32}
                    theme={theme}
                    index={index}
                    total={slides.length}
                    handle={handle}
                    selectedField={index === active ? selectedField : null}
                    onSelectField={selectField}
                    onSelectSlide={selectSlide}
                    onFillField={(field) => fillField(field, index)}
                    showPlaceholders
                  />
                </div>
              ))}
            </div>
            <MobileThumbs
              slides={slides}
              active={active}
              theme={theme}
              handle={handle}
              onSelect={scrollTo}
            />
          </main>
          <InspectorPanel
            inspector={inspector}
            setInspector={setInspector}
            current={current}
            theme={theme}
            setTheme={setTheme}
            handle={handle}
            setHandle={setHandle}
            caption={caption}
            setCaption={setCaption}
            selectedField={selectedField}
            setSlides={setSlides}
            active={active}
            duplicate={duplicate}
            remove={remove}
            safeZone={safeZone}
            setSafeZone={setSafeZone}
            fillField={fillField}
            accent={accent}
            setAccent={setAccent}
            markStyle={markStyle}
            setMarkStyle={setMarkStyle}
            accentMode={accentMode}
            setAccentMode={setAccentMode}
            onHighlight={() => {
              setSlides((items) => items.map((slide) => ({ ...slide, title: highlightTitle(slide.title), body: slide.body ? highlightTitle(slide.body) : slide.body, value: slide.value ? highlightTitle(slide.value) : slide.value, items: slide.items?.map(highlightTitle) })));
              setToast(true);
            }}
            onChoosePhoto={() => setPhotoDialog(true)}
            onCropPhoto={() => setCropDialog(true)}
          />
          <nav className="cs-mobile-actions">
            {inspector === "slide" ? (
              <>
                <button onClick={() => setSheet("layout")}>
                  <LayoutGrid />
                  Макет
                </button>
                <button onClick={duplicate}>
                  <Copy />
                  Дублировать
                </button>
                <button onClick={remove}>
                  <Trash2 />
                  Удалить
                </button>
                <button onClick={resetSelection}>
                  <Check />
                  Готово
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setSheet("theme")}>
                  <Palette />
                  Тема
                </button>
                <button onClick={() => setSheet("caption")}>
                  <Type />
                  Подпись
                </button>
                <button onClick={() => setPreview(true)}>
                  <Eye />
                  Instagram
                </button>
                <button onClick={() => setSheet("share")}>
                  <Share2 />
                  Скачать
                </button>
              </>
            )}
          </nav>
        </div>
      ) : (
        <Overview
          slides={slides}
          theme={theme}
          handle={handle}
          active={active}
          setActive={setActive}
          setMode={setMode}
          dragged={dragged}
          setDragged={setDragged}
          move={move}
          accent={accent}
          markStyle={markStyle}
        />
      )}
      {photoDialog && (
        <PhotoPicker
          onClose={() => setPhotoDialog(false)}
          onPick={(photo, source) => {
            setSlides((items) => items.map((slide, index) => index === active ? { ...slide, photo, photoSource: source } : slide));
            setPhotoDialog(false);
            setCropDialog(true);
          }}
        />
      )}
      {cropDialog && (
        <CropDialog
          photo={current.photo || "/images/anna-portrait.png"}
          onClose={() => setCropDialog(false)}
        />
      )}
      {toast && <div className="cs-toast">Выделено на 7 слайдах <button onClick={() => setToast(false)}>Отменить</button></div>}
      {downloadWarning !== null && (
        <div className="cs-modal" onMouseDown={(event) => event.target === event.currentTarget && setDownloadWarning(null)}>
          <section className="cs-warning" role="dialog" aria-modal="true" aria-labelledby="download-warning-title">
            <h2 id="download-warning-title">На слайде {downloadWarning + 1} есть пустые поля</h2>
            <p>Можно быстро заполнить их из сценария или скачать карусель как есть.</p>
            <div>
              <button className="primary" onClick={() => { const field = missingField(slides[downloadWarning]); if (field) fillField(field, downloadWarning); setActive(downloadWarning); setMode("slide"); setDownloadWarning(null); }}>Заполнить</button>
              <button onClick={() => setDownloadWarning(null)}>Скачать как есть</button>
            </div>
          </section>
        </div>
      )}
      {preview && (
        <InstagramPreview
          slides={slides}
          theme={theme}
          handle={handle}
          caption={caption}
          onClose={() => setPreview(false)}
        />
      )}
      {sheet && (
        <MobileSheet
          sheet={sheet}
          onClose={() => setSheet(null)}
          current={current}
          theme={theme}
          setTheme={setTheme}
          caption={caption}
          setCaption={setCaption}
          setSlides={setSlides}
          active={active}
          handle={handle}
          safeZone={safeZone}
          setSafeZone={setSafeZone}
        />
      )}
    </section>
  );
}

function MobileThumbs({
  slides,
  active,
  theme,
  handle,
  onSelect,
}: {
  slides: CarouselSlideData[];
  active: number;
  theme: CarouselTheme;
  handle: string;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="cs-mobile-thumbs">
      {slides.map((slide, i) => (
        <button
          className={i === active ? "active" : ""}
          onClick={() => onSelect(i)}
          key={slide.id}
        >
          <ScaledSlide
            slide={slide}
            scale={0.0326}
            theme={theme}
            index={i}
            total={slides.length}
            handle={handle}
          />
        </button>
      ))}
    </div>
  );
}
function InspectorPanel({ inspector, setInspector, current, theme, setTheme, handle, setHandle, caption, setCaption, selectedField, setSlides, active, duplicate, remove, safeZone, setSafeZone, accent, setAccent, markStyle, setMarkStyle, accentMode, setAccentMode, onHighlight, onChoosePhoto, onCropPhoto }: any) {
  const update = (patch: Partial<CarouselSlideData>) => setSlides((items: CarouselSlideData[]) => items.map((s, i) => i === active ? { ...s, ...patch } : s));
  const fieldLabel = selectedField?.startsWith("item-") ? `Пункт ${Number(selectedField.split("-")[1]) + 1}` : selectedField === "title" ? "Заголовок" : selectedField === "body" ? "Подзаголовок" : selectedField === "items" ? "Пункты" : selectedField === "value" ? "Число" : "Текст";
  const textValue = selectedField === "body" ? current.body || "" : selectedField === "value" ? current.value || "" : selectedField === "items" ? (current.items || []).join("\n") : selectedField?.startsWith("item-") ? current.items?.[Number(selectedField.split("-")[1])] || "" : current.title;
  const accentPresets = theme === "contrast" ? ["#ffe14d", "#ff4d2e", "#3dff9a", "#4da3ff", "#ff7ad9", "#ffffff"] : ["#a28bfb", "#8fd4a8", "#f0c987", "#ff8e9b", "#7ab8ff", "#ffffff"];
  const changeText = (value: string) => {
    if (selectedField === "body") update({ body: value });
    else if (selectedField === "value") update({ value });
    else if (selectedField === "items") update({ items: value.split("\n").filter(Boolean) });
    else if (selectedField?.startsWith("item-")) { const index = Number(selectedField.split("-")[1]); const items = [...(current.items || [])]; items[index] = value; update({ items }); }
    else update({ title: value });
  };
  return <aside className="cs-inspector">
    <nav className="cs-inspector-crumbs" aria-label="Путь настройки"><button onClick={() => setInspector("carousel")}>Карусель</button>{inspector !== "carousel" && <><ChevronRight/><button onClick={() => setInspector("slide")}>Слайд {active + 1}</button></>}{inspector === "text" && <><ChevronRight/><span>{fieldLabel}</span></>}</nav>
    {inspector === "carousel" ? <>
      <section><h3>Тема</h3><div className="cs-themes">{themes.map((t) => <button className={theme === t ? "active" : ""} onClick={() => setTheme(t)} key={t}><div className="cs-theme-cover"><ScaledSlide slide={current} scale={96 / 1080} theme={t} index={0} total={8} handle={handle}/></div><span>{themeNames[t]}</span></button>)}</div></section>
      <section className="cs-accent-panel"><h3>Акцент</h3><div className="cs-swatch-row">{accentPresets.map((color: string) => <button key={color} aria-label={`Акцент ${color}`} className={accent === color ? "active" : ""} style={{ background: color }} onClick={() => setAccent(color)}/>) }<label className="cs-eyedropper" aria-label="Свой цвет"><span>+</span><Pipette/><input type="color" value={accent} onChange={(event) => setAccent(event.target.value)}/></label></div><label className="cs-hex">HEX <input value={accent} onChange={(event) => /^#[0-9a-f]{0,6}$/i.test(event.target.value) && setAccent(event.target.value)}/></label><div className="cs-contrast-warning"><AlertTriangle/><span>Плохо читается на слайдах 2, 6</span><button onClick={() => setAccent(theme === "contrast" ? "#ffe14d" : "#a28bfb")}>Исправить</button></div><div className="cs-mark-styles">{([['fill','Заливка'],['underline','Подчёркивание'],['color','Цвет']] as const).map(([value,label]) => <button key={value} className={markStyle === value ? "active" : ""} onClick={() => setMarkStyle(value)}>{label}</button>)}</div><button className="cs-highlight-button" onClick={onHighlight}><Sparkles/>Выделить главное</button><div className="cs-highlight-demo"><span>Привычка без силы воли</span><i style={{ background: accent }}>15 минут</i></div><h4>Акцентные слайды</h4><div className="cs-segment wide">{([['auto','Авто'],['third','Каждый 3-й'],['manual','Вручную']] as const).map(([value,label]) => <button key={value} className={accentMode === value ? "active" : ""} onClick={() => setAccentMode(value)}>{label}</button>)}</div></section>
      <section><h3>Просмотр</h3><label className="cs-check"><input type="checkbox" checked={safeZone} onChange={(e) => setSafeZone(e.target.checked)}/>Безопасная зона</label></section>
      <section><h3>Автор</h3><label className="cs-author"><span>А</span><input value={handle} onChange={(e) => setHandle(e.target.value)}/></label><label className="cs-check"><input type="checkbox"/>Сделать по умолчанию</label></section>
      <section><h3>Подпись к посту</h3><textarea value={caption} maxLength={2200} onChange={(e) => setCaption(e.target.value)}/><small>{caption.length}/2200</small><div className="cs-chips"><button><Copy/>Копировать</button><button><Sparkles/>Переписать</button></div></section>
    </> : inspector === "slide" ? <>
      <section><h3>Макет</h3><div className="cs-layouts">{layouts.map((l) => <button className={current.layout === l.value ? "active" : ""} onClick={() => update({ layout: l.value })} key={l.value}><LayoutGlyph layout={l.value}/><span className="cs-layout-copy"><small>{l.name}</small>{missingLabel(l.value, current) && <em>{missingLabel(l.value, current)}</em>}</span></button>)}</div></section>
      <section><h3>Фон</h3><div className="cs-segment wide"><button className={!current.background || current.background === "theme" ? "active" : ""} onClick={() => update({ background: "theme" })}>Как тема</button><button className={current.background === "accent" ? "active" : ""} onClick={() => update({ background: "accent" })}>Акцент</button><button className={current.background === "photo" ? "active" : ""} onClick={() => update({ background: "photo" })}>Фото</button></div></section>
      <section className="cs-photo-panel"><h3>Фото</h3>{current.photo ? <div className="cs-photo-current"><img src={current.photo} alt="Текущее фото"/><span>{current.photoSource || "Загружено"}</span></div> : <span className="cs-photo-source">Фото не выбрано</span>}<div><button onClick={onChoosePhoto}><ImagePlus/>Заменить</button><button onClick={onCropPhoto}>Кадрировать</button><button className="danger" onClick={() => update({ photo: undefined, photoSource: undefined })}>Убрать</button></div></section>
      <div className="cs-inspector-buttons"><button onClick={duplicate}><Copy/>Дублировать</button><button className="danger" onClick={remove}><Trash2/>Удалить</button></div>
    </> : <TextControls value={textValue} onChange={changeText}/>} </aside>;
}
function TextControls({ value, onChange, label = "Текст" }: { value: string; onChange: (v: string) => void; label?: string }) {
  const long = value.length > 60;
  return <section className="cs-text-controls"><h3>{label}</h3><textarea className={long ? "long" : ""} value={value} onChange={(e) => onChange(e.target.value)}/><small>{value.length}/60</small>{long && <p>Длинно — сократить?</p>}<div className="cs-chips"><button><Sparkles/>Короче</button><button><Sparkles/>Другой вариант</button><button><Sparkles/>Проще</button></div></section>;
}
function Overview({ slides, theme, handle, active, setActive, setMode, dragged, setDragged, move, accent, markStyle }: any) {
  return (
    <main className="cs-overview">
      <header>{slides.length} слайдов · ~35 секунд чтения</header>
      <div>
        {slides.map((slide: CarouselSlideData, index: number) => (
          <article
            key={slide.id}
            draggable
            onDragStart={() => setDragged(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => move(index)}
            onDoubleClick={() => {
              setActive(index);
              setMode("slide");
            }}
          >
            <span>{index + 1}</span>
            <button
              className={index === active ? "active" : ""}
              onClick={() => setActive(index)}
            >
              {missingField(slide) && (
                <span className="cs-empty-note">Не заполнено</span>
              )}
              <ScaledSlide
                slide={slide}
                scale={0.19}
                theme={theme}
                index={index}
                total={slides.length}
                handle={handle}
                accent={accent}
                markStyle={markStyle}
              />
            </button>
            {index < slides.length - 1 && (
              <ChevronRight className="cs-connector" />
            )}
          </article>
        ))}
        <button className="cs-overview-add">
          <Plus />
          Слайд
        </button>
      </div>
    </main>
  );
}
function PhotoPicker({ onClose, onPick }: { onClose: () => void; onPick: (photo: string, source: string) => void }) {
  const [view, setView] = useState<PhotoView>("suggested");
  const [selected, setSelected] = useState({ photo: "/images/anna-portrait.png", source: "Дубль 2 · 0:41" });
  const [video, setVideo] = useState(false);
  const tabs: { value: PhotoView; label: string }[] = [{ value: "suggested", label: "✦ Подходит" }, { value: "stash", label: "Копилка" }, { value: "takes", label: "Дубли" }, { value: "device", label: "С устройства" }];
  const cards = view === "suggested" ? [
    ["/images/anna-portrait.png", "вы смотрите в камеру · дубль 2", "Дубль 2 · 0:41"],
    ["/images/habit-gym.png", "по подписи «Дорога в зал»", "Копилка · 14 окт"],
    ["/images/habit-coffee.png", "спокойный утренний свет", "Копилка · 14 окт"],
    ["/images/anna-portrait.png", "лицо в верхней трети", "Дубль 1 · 0:38"],
    ["/images/habit-gym.png", "подходит к теме привычек", "Копилка · 9 окт"],
    ["/images/habit-coffee.png", "место для заголовка", "Копилка · 6 окт"],
  ] : view === "stash" ? [
    ["/images/habit-coffee.png", "Кофе на подоконнике · Фото", "Копилка · 14 окт"],
    ["/images/habit-gym.png", "Дорога в зал · Видео 0:24", "Копилка · 14 окт"],
    ["/images/anna-portrait.png", "После тренировки · Видео 0:18", "Копилка · 14 окт"],
    ["/images/habit-gym.png", "Видео · 9 окт", "Копилка · 9 окт"],
    ["/images/habit-coffee.png", "Фото · 6 окт", "Копилка · 6 окт"],
  ] : [
    ["/images/anna-portrait.png", "Дубль 1 · 0:38 · в камеру", "Дубль 1 · 0:38"],
    ["/images/anna-portrait.png", "Дубль 2 · 0:41 · в камеру", "Дубль 2 · 0:41"],
    ["/images/habit-gym.png", "Кадр 0:12", "Дубль 2 · 0:12"],
  ];
  return <div className="cs-modal" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="cs-photo-picker" role="dialog" aria-modal="true" aria-labelledby="photo-picker-title"><header><div><h2 id="photo-picker-title">Выбрать фото</h2><p>Подходящие кадры из вашей копилки и дублей</p></div><button onClick={onClose} aria-label="Закрыть"><X/></button></header><div className="cs-photo-tabs">{tabs.map((tab) => <button key={tab.value} className={view === tab.value ? "active" : ""} onClick={() => { setView(tab.value); setVideo(false); }}>{tab.label}</button>)}</div>{view === "device" ? <div className="cs-device-drop"><ImagePlus/><b>Перетащите или выберите файл</b><span>JPG, PNG, HEIC, до 20 МБ</span><div><button>Фотоплёнка</button><button>Камера</button></div></div> : <><div className="cs-library-heading"><b>{view === "stash" ? "Сегодня · 14 окт" : view === "takes" ? "Дубли мысли" : "Рекомендуем для обложки"}</b>{view === "stash" && <span><button className="active">Фото</button><button>Видео</button></span>}</div><div className="cs-photo-grid">{cards.map(([photo, reason, source], index) => <button key={`${reason}-${index}`} className={selected.photo === photo && selected.source === source ? "active" : ""} onClick={() => { setSelected({ photo, source }); setVideo(reason.includes("Видео")); }}><img src={photo} alt=""/><span>{reason}</span>{source === "Копилка · 14 окт" && index === 0 && <i>в карусели · Привычка и мотивация</i>}</button>)}</div>{video && <div className="cs-frame-picker"><b>Выберите кадр</b><div>{[0,1,2,3,4].map((item) => <img src="/images/habit-gym.png" alt="" key={item}/>) }<input type="range" min="0" max="24" defaultValue="12"/></div><button>Взять этот кадр</button></div>}</>}<footer><button onClick={onClose}>Отмена</button><button className="primary" onClick={() => onPick(selected.photo, selected.source)}>Поставить</button></footer></section></div>;
}

function CropDialog({ photo, onClose }: { photo: string; onClose: () => void }) {
  const [zoom, setZoom] = useState(138);
  const [shade, setShade] = useState(42);
  const [filter, setFilter] = useState("Как есть");
  return <div className="cs-modal"><section className="cs-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="crop-title"><header><div><h2 id="crop-title">Кадрирование обложки</h2><p>Лицо и заголовок останутся в безопасной зоне</p></div><button onClick={onClose} aria-label="Закрыть"><X/></button></header><div className="cs-crop-work"><div className={`cs-crop-frame filter-${filter}`}><img src={photo} alt="Кадрируемое фото" style={{ transform: `scale(${zoom / 100})` }}/><div className="cs-crop-safe"/><div className="cs-crop-third"/><span>3:4</span></div><div className="cs-crop-controls"><button className="cs-auto-crop"><Sparkles/>Авто · лицо в верхней трети</button><label>Масштаб <b>{zoom}%</b><input type="range" min="100" max="300" value={zoom} onChange={(event) => setZoom(Number(event.target.value))}/></label><label>Затемнение под текст <b>{shade}%</b><input type="range" min="0" max="80" value={shade} onChange={(event) => setShade(Number(event.target.value))}/></label><div className="cs-filter-row">{["Как есть", "Ч/Б", "Тёплый", "Плёнка"].map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div></div></div><footer><button onClick={onClose}>Отмена</button><button className="primary" onClick={onClose}>Готово</button></footer></section></div>;
}

function InstagramPreview({
  slides,
  theme,
  handle,
  caption,
  onClose,
}: {
  slides: CarouselSlideData[];
  theme: CarouselTheme;
  handle: string;
  caption: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [view, setView] = useState<"feed" | "profile">("feed");
  return (
    <div
      className="cs-modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="instagram-title"
        className="cs-instagram"
      >
        <header>
          <h2 id="instagram-title">Как в Instagram</h2>
          <button onClick={onClose} aria-label="Закрыть">
            <X />
          </button>
        </header>
        <div className="cs-instagram-view-switch">
          <button
            className={view === "feed" ? "active" : ""}
            onClick={() => setView("feed")}
          >
            Лента
          </button>
          <button
            className={view === "profile" ? "active" : ""}
            onClick={() => setView("profile")}
          >
            Профиль
          </button>
        </div>
        <div className={`cs-phone ${view === "profile" ? "is-hidden" : ""}`}>
          <div className="ig-user">
            <span>А</span>
            <b>{handle}</b>
            <MoreHorizontal />
          </div>
          <button
            className="ig-slide"
            onClick={() => setIndex((index + 1) % slides.length)}
          >
            <ScaledSlide
              slide={slides[index]}
              scale={0.274}
              theme={theme}
              index={index}
              total={slides.length}
              handle={handle}
            />
          </button>
          <div className="ig-dots">
            {slides.map((_, i) => (
              <i className={i === index ? "active" : ""} key={i} />
            ))}
          </div>
          <p>
            <b>{handle}</b> {caption.slice(0, 62)}… <span>ещё</span>
          </p>
        </div>
        <div className={`cs-profile ${view === "feed" ? "is-hidden" : ""}`}>
          <div className="cs-profile-head">
            <span className="cs-profile-avatar">А</span>
            <div>
              <b>{handle}</b>
              <span>164 публикации</span>
            </div>
          </div>
          <div className="profile-grid">
            <div className="profile-cell profile-cover">
              <ScaledSlide
                slide={slides[0]}
                scale={0.18}
                theme={theme}
                index={0}
                total={slides.length}
                handle={handle}
              />
            </div>
            {Array.from({ length: 8 }, (_, i) => (
              <div className="profile-cell" key={i} />
            ))}
          </div>
          <p>Так обложка выглядит в профиле</p>
        </div>
      </section>
    </div>
  );
}
function MobileSheet({
  sheet,
  onClose,
  current,
  theme,
  setTheme,
  caption,
  setCaption,
  setSlides,
  active,
  handle,
  safeZone,
  setSafeZone,
}: any) {
  const update = (patch: Partial<CarouselSlideData>) =>
    setSlides((items: CarouselSlideData[]) =>
      items.map((s, i) => (i === active ? { ...s, ...patch } : s)),
    );
  return (
    <div
      className="cs-sheet-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="cs-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <button className="cs-grabber" onClick={onClose} aria-label="Закрыть" />
        <h2 id="sheet-title">
          {sheet === "text"
            ? "Текст"
            : sheet === "share"
              ? "Поделиться"
              : sheet === "caption"
                ? "Подпись"
                : sheet === "layout"
                  ? "Макет"
                  : "Тема"}
        </h2>
        {sheet === "text" && (
          <TextControls
            value={current.title}
            onChange={(title) => update({ title })}
          />
        )}{" "}
        {sheet === "theme" && (
          <>
            <div className="cs-theme-strip">
              {themes.map((t) => (
                <button
                  className={`cs-theme-option ${theme === t ? "active" : ""}`}
                  onClick={() => setTheme(t)}
                  key={t}
                >
                  <span>
                    <ScaledSlide
                      slide={current}
                      scale={96 / 1080}
                      theme={t}
                      index={active}
                      total={8}
                      handle={handle}
                    />
                  </span>
                  {themeNames[t]}
                </button>
              ))}
            </div>
            <label className="cs-sheet-safe">
              <span>Безопасная зона</span>
              <input
                type="checkbox"
                checked={safeZone}
                onChange={(e) => setSafeZone(e.target.checked)}
              />
            </label>
          </>
        )}{" "}
        {sheet === "caption" && (
          <div className="cs-caption-sheet">
            <textarea
              value={caption}
              maxLength={2200}
              onChange={(e) => setCaption(e.target.value)}
            />
            <div className="cs-caption-meta">
              <span>{caption.length}/2200</span>
            </div>
            <div className="cs-caption-actions">
              <button>
                <Copy />
                Копировать
              </button>
              <button>
                <Sparkles />
                Переписать
              </button>
            </div>
          </div>
        )}{" "}
        {sheet === "layout" && (
          <div className="cs-sheet-layouts">
            {layouts.map((l) => (
              <button
                onClick={() => {
                  update({ layout: l.value });
                  onClose();
                }}
                key={l.value}
              >
                <LayoutGlyph layout={l.value} />
                {l.name}
              </button>
            ))}
          </div>
        )}{" "}
        {sheet === "share" && (
          <div className="cs-share">
            <button>
              <ImageIcon />
              Сохранить 7 изображений
            </button>
            <button>
              <Share2 />
              Instagram
            </button>
            <button>
              <MoreHorizontal />
              Ещё
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
function EmptyState({
  state,
  setState,
}: {
  state: DemoState;
  setState: (s: DemoState) => void;
}) {
  if (state === "building")
    return (
      <section className="cs cs-empty">
        <div className="cs-skeletons">
          {[1, 2, 3].map((i) => (
            <i key={i} />
          ))}
        </div>
        <h2>Раскладываю мысль по слайдам…</h2>
      </section>
    );
  const copy =
    state === "no-script"
      ? ["Карусель собирается из сценария", "К сценарию"]
      : state === "empty"
        ? ["Соберу 6–9 слайдов из сценария", "Собрать карусель"]
        : ["Не удалось собрать карусель", "Повторить"];
  return (
    <section className="cs cs-empty">
      <Sparkles />
      <h2>{copy[0]}</h2>
      <button
        className="primary"
        onClick={() =>
          setState(
            state === "no-script"
              ? "empty"
              : state === "error"
                ? "building"
                : "ready",
          )
        }
      >
        {copy[1]}
      </button>
    </section>
  );
}
