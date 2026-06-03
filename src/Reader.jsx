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

const key = `progress-${story.title}`;
localStorage.setItem(key, chapterIndex);
}, [chapterIndex, story]);

useEffect(() => {
  if (!story);

  const key = `progress-${story.title}`;
  const savedIndex = localStorage.getItem(key);

  if (savedIndex !== null) {
    setChapterIndex(Number(saved))
  }
} , [story]);

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

    const leftZone = screenWidth * 0.25;
    const rightZone = screenWidth * 0.75;

    if (clickX < leftZone) {
      prev();
    } else if (clickX > rightZone) {
      next();
    } else {
      setUiVisible((prev) => !prev);
    }
  };

return (
  <div
    onClick={handleClick}
    style={{
      minHeight: "100vh",
      background: "#0f172a",
      cursor: "pointer"
    }}
  >
    <div
      key={chapterIndex}
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "60px 20px",
        lineHeight: "1.8",
        fontSize: "18px",
        color: "#e5e7eb",

        transform:
          direction === "next"
            ? "translateX(40px)"
            : direction === "prev"
            ? "translateX(-40px)"
            : "translateX(0)",
        opacity: direction ? 0 : 1,
        filter : direction ? "blur(4px)" : "blur(0px)",

        transition: "all 0.3s ease",
      }}
    >
     {uiVisible && (
  <>
    <h1 style={{
      fontSize: "28px",
      marginBottom: "10px",
      fontWeight: "600"
    }}>
      {story.title}
    </h1>

    <div style={{
      fontSize: "14px",
      color: "#9ca3af",
      marginBottom: "30px"
    }}>
      Chapter {chapterIndex + 1}
    </div>
  </>
)}
      <div
        dangerouslySetInnerHTML={{
          __html: chapter.content || "<p>Loading...</p>"
        }}
      />  

{uiVisible && (
  <div style={{
    marginTop: "30px",
    display: "flex",
    justifyContent: "space-between",
  }}>
    <button onClick={prev}>← Prev</button>
    <button onClick={next}>Next →</button>
  </div>
)} 
    </div>
  </div>
);
}