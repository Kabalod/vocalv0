import {
  CarouselSlide,
  type CarouselSlideData,
  type CarouselTheme,
} from "@/components/carousel-slide"

const themes: CarouselTheme[] = [
  "editorial",
  "swiss",
  "film",
  "notebook",
  "contrast",
]

const themeNames: Record<CarouselTheme, string> = {
  editorial: "Редакция",
  swiss: "Швейцарский",
  film: "Плёнка",
  notebook: "Блокнот",
  contrast: "Контраст",
}

const slides: CarouselSlideData[] = [
  {
    id: 1,
    layout: "cover",
    kicker: "3 ошибки",
    title: "Почему вы *бросаете* спорт к середине февраля",
    photo: "/images/carousel-author.png",
    caption: "Почему привычка не переживает февраль",
  },
  {
    id: 2,
    layout: "photo-cover",
    kicker: "3 ошибки",
    title: "Почему вы *бросаете* спорт к середине февраля",
    photo: "/images/carousel-author.png",
  },
  {
    id: 3,
    layout: "photo-example",
    title: "Маленький ритуал важнее идеального плана",
    photo: "/images/carousel-coffee.png",
    caption: "Маленький ритуал важнее идеального плана",
  },
  {
    id: 4,
    layout: "statement",
    title: "Дело не в *силе воли*",
    body: "В январе мы берём план на человека, которым только хотим стать.",
  },
  {
    id: 5,
    layout: "split",
    title: "План должен работать в *плохой день*",
    body: "Не в тот, когда много сил и времени. А в тот, когда хочется всё отменить.",
    photo: "/images/carousel-road.png",
  },
  {
    id: 6,
    layout: "steps",
    title: "Три шага вместо нового старта",
    items: [
      "Сократите план вдвое",
      "Отмечайте факт, а не вес",
      "После пропуска — сразу следующая",
    ],
  },
  {
    id: 7,
    layout: "cta",
    title: "Сохраните, чтобы вернуться",
    body: "и напишите в директ слово «СТАРТ» — пришлю план на 15 минут",
    kicker: "Начните с малого",
  },
]

export default function CarouselGalleryPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 48,
        color: "#f4f2f7",
        background: "#0d0d0f",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 40,
        }}
      >
        <span
          style={{
            color: "#9b7cff",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          Vocal · Instagram
        </span>
        <h1 style={{ margin: 0, fontSize: 38, lineHeight: 1.1 }}>
          Компоненты карусели
        </h1>
        <p style={{ margin: 0, color: "#94919d", fontSize: 16 }}>
          7 слайдов × 5 стилей · артборд 1080 × 1350 px
        </p>
      </header>
      <section
        aria-label="Галерея слайдов"
        style={{ display: "flex", flexDirection: "column", gap: 46 }}
      >
        {themes.map((theme) => (
          <section
            key={theme}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <h2
              style={{
                margin: 0,
                color: "#d3d0da",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {themeNames[theme]}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
              {slides.map((slide, index) => (
                <figure
                  key={`${theme}-${slide.id}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: 216,
                    margin: 0,
                    gap: 9,
                  }}
                >
                  <div
                    style={{
                      width: 216,
                      height: 270,
                      overflow: "hidden",
                      borderRadius: 6,
                      boxShadow: "0 16px 50px rgba(0,0,0,.3)",
                    }}
                  >
                    <div
                      style={{
                        width: 1080,
                        height: 1350,
                        transform: "scale(0.2)",
                        transformOrigin: "top left",
                      }}
                    >
                      <CarouselSlide
                        slide={slide}
                        theme={theme}
                        index={index + 1}
                        total={slides.length}
                        handle="@anna.move"
                      />
                    </div>
                  </div>
                  <figcaption style={{ color: "#77737e", fontSize: 13 }}>
                    {index + 1}/7 · {slide.layout}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  )
}
