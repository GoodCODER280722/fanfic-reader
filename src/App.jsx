import mammoth from "mammoth";
import Reader from "./Reader";
import Library from "./Library";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function App() {
  // 🧱 STATE
  const [uiVisible, setUiVisible] = useState(true);
  const [library, setLibrary] = useState(() => {
    const saved = localStorage.getItem("readerLibrary");
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState("library");
  const [currentStory, setCurrentStory] = useState(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

const handleSignUp = async () => {
  console.log("SIGN UP CLICKED");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  console.log("SIGN UP RESULT:", data, error);

  if (error) {
    console.error(error.message);
    setAuthError(error.message);
    return;
  }

  setAuthError("");
};

const handleLogin = async () => {
  console.log("LOGIN CLICKED");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log("LOGIN RESULT:", data, error);
  console.log("CURRENT USER:", user);

  if (error) {
    console.error(error.message);
    setAuthError(error.message);
    return;
  }

  setAuthError("");
};

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    return;
  }

  setUser(null);
  setView("Library"); // Reset UI
  setCurrentStory(null);
};

useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getSession();
    setUser(data.session?.user || null);
};

getUser();

const { data: listener } = supabase.auth.onAuthStateChange(
  (_event, session) => {
    console.log("AUTH CHANGE:", session);
    setUser(session?.user || null);
  }
);

return () => {
  listener.subscription.unsubscribe();
};
}, []);

useEffect(() => {
  localStorage.setItem("readerLibrary", JSON.stringify(library));
}, [library]);

useEffect(() => {
  if (user) {
    loadLibraryFromCloud();
  }
}, [user]);


if (!user) {
  const buttonStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#3b82f6",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  };
  const buttonStyleSecondary = {
   ...buttonStyle,
    background: "#64748b"
  };
  return (
    <div style={{ padding: "20px" }}>
      <h2>Login / Signup</h2>

  {authError && (
    <div style={{ color: "red" }}>{authError}</div>
  )}  


      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "6px",
          border: "1px solid #334155",
          background: "#0f172a",
          color: "white"
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "6px",
          border: "1px solid #334155",
          background: "#0f172a",
          color: "white"
        }}
      />
      <h1 style={{ 
        textAlign: "center",
        marginBottom: "20px",
        fontSize: "24px"
      }}>
        📚 LexaRead
        </h1>
      <button onClick={handleSignUp} style={buttonStyle}>Sign Up</button>
      <button onClick={handleLogin} style={buttonStyle}>Login</button>
      <button onClick={handleLogout} style={buttonStyleSecondary}>
        Logout
      </button>
    </div>
  );
}

const loadLibraryFromCloud = async () => {
  const { data, error } = await supabase.storage
    .from("stories")
    .list(user.id);

  if (error) {
    console.error("Error loading files:", error);
    return;
  }
    console.log("Files from Supabase:", data);

    const storiesMap = {};

    for (const file of data) {
      const fileName = `${user.id}/${Date.now()}-${file.name}`;

      const { data: publicUrlData } = supabase.storage
        .from("stories")
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      try {
        const response = await fetch(publicUrl);
        const arrayBuffer = await response.arrayBuffer();
        let html;

        try {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          html = result.value;
        } catch (err) {
          console.error("Failed to process file:", fileName, err);
          continue; // skip broken file
        }
        html = html.replace(/text-align:\s*center;/gi, "");

        const storyName = fileName
          .replace(/chapter\s+\d+/i, "")
          .replace(".docx", "")
          .replace(/^\d+-/, "") // remove timestamp prefix
          .trim();

        if (!storiesMap[storyName]) {
          storiesMap[storyName] = {
            id: storyName,
            title: storyName,
            chapters: [],
            progress: 0,
        };
    }

    const getNum = (name) =>
      parseInt(name.match(/\d+/)?.[0] || 0);

    const newChapterNum = getNum(fileName);

    if (
      storiesMap[storyName].chapters.some(
        ch => getNum(ch.name) === newChapterNum
      )
    ) {
      continue;
    }

    storiesMap[storyName].chapters.push({
      name: fileName,
      content: html,
    });
  } catch (err) {
    console.error("Failed to process file:", fileName, err);
  }
}

// Sort chapters inside each story
Object.values(storiesMap).forEach((story) => {
  story.chapters.sort((a, b) => {
    const getNum = (name) =>
      parseInt(name.match(/\d+/)?.[0] || 0);

    return getNum(a.name) - getNum(b.name);
  });
});

setLibrary(Object.values(storiesMap));
};
  
  // 📂 FILE UPLOAD
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = `${Date.now()}-${file.name}`;

    console.log("Uploading file:", fileName);

    const { data, error } = await supabase.storage
      .from("stories")
      .upload(`${user.id}/${fileName}`, file);

    console.log("Upload result:", data, error);

    if (error) {
      console.error("Upload error:", error);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("stories")
      .getPublicUrl(`${user.id}/${fileName}`);

    const publicUrl = publicUrlData.publicUrl;

    console.log("Public URL data:", publicUrlData);
    console.log("Public URL:", publicUrl);

    const response = await fetch(publicUrl);
    const arrayBuffer = await response.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    let html = result.value;

    // Clean Word formatting
    html = html.replace(/text-align:\s*center;/gi, "");

    const storyName = file.name
      .replace(/chapter\s+\d+/i, "")
      .replace(".docx", "")
      .trim();

    setLibrary((prevLibrary) => {
      const existingIndex = prevLibrary.findIndex(
        (s) => s.title === storyName
      );

      // 🆕 NEW STORY
      if (existingIndex === -1) {
        const newStory = {
          id: Date.now().toString(),
          title: storyName,
          chapters: [
            {
              name: file.name,
              content: html,
            },
          ],
          progress: 0,
        };

        // Open immediately
        setCurrentStory(newStory);
        setChapterIndex(0);
        setView("reader");

        return [...prevLibrary, newStory];
      }

      // 🔁 EXISTING STORY (IMMUTABLE UPDATE)
      const existingStory = prevLibrary[existingIndex];

      // Prevent duplicate chapter upload
      if (
        existingStory.chapters.some((ch) => ch.name === file.name)
      ) {
        return prevLibrary;
      }

      const updatedChapters = [
        ...existingStory.chapters,
        {
          name: file.name,
          content: html,
        },
      ];

      // Sort chapters numerically
      updatedChapters.sort((a, b) => {
        const getNum = (name) =>
          parseInt(name.match(/\d+/)?.[0] || 0);
        return getNum(a.name) - getNum(b.name);
      });

      const updatedStory = {
        ...existingStory,
        chapters: updatedChapters,
      };

      const newLibrary = [...prevLibrary];
      newLibrary[existingIndex] = updatedStory;

      // Open updated story
      setCurrentStory(updatedStory);
      setChapterIndex(0);
      setView("reader");

      return newLibrary;
    });
  };

  // 📖 OPEN STORY FROM LIBRARY
  const openStory = (story) => {
  setCurrentStory(story);
  setChapterIndex(story.progress || 0);
  setView("reader");
};
  // 🎨 UI

return (
  <>
    {/* HEADER */}
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "e2e8f0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{ 
        width: "100px",
        maxWidth: "500px",
        padding: "2rem",
        background: "#1e293b",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}>
      </div>
    </div>

    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(10px)",
        background: "rgba(17, 17, 17, 0.8)",
        borderBottom: "1px solid #2a2a2a",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontWeight: "600", fontSize: "18px" }}>
          LexaRead
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ color: "#aaa" }}>
            {view === "library" ? "Library" : "Reading"}
          </div>

          {user && (
            <>
              <div style={{ color: "#888", fontSize: "13px" }}>
                {user.email}
              </div>

              <button onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>

    {/* MAIN CONTENT */}
    {view === "library" && (
      <Library
        library={library}
        openStory={openStory}
        handleFileUpload={handleFileUpload}
      />
    )}

    {view === "reader" && currentStory && (
      <Reader
        story={currentStory}
        chapterIndex={chapterIndex}
        setChapterIndex={setChapterIndex}
        setView={setView}
      />
    )}
  </>
);
}
