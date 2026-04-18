import { useState, useEffect } from "react";

export default function Reader({
  story,
  chapterIndex,
  setChapterIndex,
  uiVisible,
  setUiVisible
}) {

if (
  !story ||
  !story.chapters ||
  story.chapters.length === 0 ||
  !story.chapters[chapterIndex]
) {
  return <div style={{ padding: "20px"}}>Chapter not available</div>;
}

const safeIndex = 
  chapterIndex < story.chapters.length ? chapterIndex : 0;

const chapter = story.chapters[safeIndex];

  const [direction, setDirection] = useState(null);

  useEffect(() => {
   if (!story) return;

    story.progress = chapterIndex;
 },  [chapterIndex]);

 <div>No story loaded</div>;

const next = () => {
  setDirection("next");

  setTimeout(() => {
    setChapterIndex((prev) => {
      if (prev < story.chapters.length - 1) {
        return prev + 1;
      }
      return prev;
    });

    setDirection(null);
  }, 150);
};

const prev = () => {
  setDirection("prev");

  setTimeout(() => {
    setChapterIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });

    setDirection(null);
  }, 150);
};

  const handleClick = (e) => {
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;

    if (clickX < screenWidth * 0.3) {
      prev();
    } else if (clickX > screenWidth * 0.7) {
      next();
    } else {
      setUiVisible((prev) => !prev);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        padding: "20px",
        minHeight: "100vh",
        cursor: "pointer",
        overflow: "hidden"
      }}
    >
      {/* Title */}
      <h2 style={{ textAlign: "center" }}>{story.title}</h2>

      {/* Chapter */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
          color: "#aaa"
        }}
      >
        Chapter {chapterIndex + 1} / {story.chapters.length}
      </div>

      {/* Animated Content */}
      <div
        key={chapterIndex}
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          lineHeight: "1.7",
          fontSize: "18px",
          textAlign: "justify",

          transform:
            direction === "next"
              ? "translateX(20px)"
              : direction === "prev"
              ? "translateX(-20px)"
              : "translateX(0)",

          opacity: direction ? 0 : 1,
          transition: "all 0.2s ease"
        }}
        dangerouslySetInnerHTML={{
          __html: story.chapters[chapterIndex].content
        }}
      />

      {/* Buttons */}
      <div
        style={{
          marginTop: "30px",
          display: "flex",
          justifyContent: "space-between",
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto"
        }}
      >
        <button onClick={prev}>← Prev</button>
        <button onClick={next}>Next →</button>
      </div>
    </div>
  );
}
