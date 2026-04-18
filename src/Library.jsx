export default function Library({ library, openStory }) {
  if (library.length === 0) {
    return <div style={{ padding: "20px" }}>No stories yet</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Library</h2>

      {library.map((story) => (
        <div
          key={story.id}
          style={{
            background: "#222",
            padding: "12px",
            marginBottom: "10px",
            cursor: "pointer"
          }}
          onClick={() => openStory(story)}
        >
          <strong>{story.title}</strong>
          <div style={{ color: "#aaa", fontSize: "14px" }}>
  Last read: Chapter {(story.progress ?? 0) + 1}
</div>
        </div>
      ))}
    </div>
  );
}
