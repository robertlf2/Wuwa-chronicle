import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

const DATA_FILE = path.join(process.cwd(), "data.json");

// Default initial data
const defaultData = {
  timelineBackground: "#1e1e2f",
  events: [
    {
      id: "1",
      title: "創世之初",
      date: "1000-01-01",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop",
      content: "<p>宇宙誕生之初，星辰指引著最初的生命。</p><p>在虛無之中，巨大的古神降臨，創造了這片大陸。</p>",
      referenceImages: [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1484504110495-939e9baca603?w=800&auto=format&fit=crop"
      ],
      backgroundColor: "#2a2a40",
      category: "神話時代"
    },
    {
      id: "2",
      title: "第一帝國的崛起",
      date: "1500-05-12",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop",
      content: "<p>人類開始聚集，由偉大的王帶領，建立了輝煌的第一帝國。</p>",
      referenceImages: [],
      backgroundColor: "#ffffff",
      category: "人類歷史"
    },
    {
      id: "3",
      title: "英雄的誕生與墮落",
      date: "1994-01-01",
      mediaType: "youtube",
      mediaUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      content: "<p>傳說中的勇者誕生，但最終卻被黑暗力量侵蝕...</p>",
      referenceImages: ["https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&auto=format&fit=crop"],
      backgroundColor: "#fef3c7",
      category: "主線任務"
    }
  ]
};

// Initialize file if not exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf8");
}

function readData() {
  try {
    const rawData = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(rawData);
  } catch (err) {
    return defaultData;
  }
}

function writeData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/timeline", (req, res) => {
    res.json(readData());
  });

  app.post("/api/timeline", (req, res) => {
    const data = req.body;
    writeData(data);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
