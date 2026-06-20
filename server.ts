import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

const DATA_FILE = path.join(process.cwd(), "data.json");
const BACKUPS_DIR = path.join(process.cwd(), "backups");

// Ensure backups directory exists
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// Migrate legacy file structure backups at the root of project (if any)
try {
  const rootFiles = fs.readdirSync(process.cwd());
  rootFiles.forEach((file) => {
    if (file.startsWith("timeline_backup_") && file.endsWith(".json")) {
      const oldPath = path.join(process.cwd(), file);
      const newPath = path.join(BACKUPS_DIR, file);
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`Migrated legacy backup "${file}" to backups/`);
      }
    }
  });
} catch (err) {
  console.error("Migration of backups failed", err);
}

// Default initial data
const defaultData = {
  "titlePageSubtitle": "",
  "titlePageImage": "https://live.staticflickr.com/65535/55311195868_33774af8db_b.jpg",
  "axisLabels": [
    {
      "positionX": 9.71006950939704,
      "text": "10000年前",
      "id": "6ca7f7f3-0557-40b7-bc98-8f7296e4b9e7"
    }
  ],
  "titlePageTitle": "",
  "titlePageEnabled": true,
  "timelineBackground": "#1e1e2f",
  "drawings": [],
  "events": [
    {
      "characterTags": [
        "漂泊者"
      ],
      "referenceImages": [
        "https://live.staticflickr.com/65535/55159692505_5a21266daa_c.jpg"
      ],
      "category": "角色",
      "customDateText": "萬年前(待定)",
      "backgroundColor": "https://live.staticflickr.com/65535/55162509401_e7aff3c59d_b.jpg",
      "regionTags": [],
      "categoryColor": "#ffffff",
      "date": "1000-01-01",
      "positionX": 4.962256997705575,
      "mainStoryTags": [],
      "id": "1",
      "referenceText": "主線1.4",
      "title": "漂泊者抵達索拉里",
      "titleSize": 24,
      "mediaUrl": "https://live.staticflickr.com/65535/55162688198_7bc5711ddc_b.jpg",
      "mediaType": "image",
      "content": "<p style=\"font-family: monospace; font-size: 20px; font-weight: bold;\"><span style=\"font-family: monospace; font-size: 20px;\"><strong>漂泊者首次抵達索拉里斯</strong></span><span style=\"font-size: 20px;\"><strong>。</strong></span></p>"
    },
    {
      "regionTags": [
        "黑海岸"
      ],
      "customDateText": "萬年前(待定)",
      "backgroundColor": "https://live.staticflickr.com/65535/55162759889_3550457c08_b.jpg",
      "category": "黑海岸",
      "referenceImages": [
        "https://live.staticflickr.com/65535/55169141145_87b44384e5_b.jpg",
        "https://live.staticflickr.com/65535/55158422977_756959c04a_z.jpg"
      ],
      "characterTags": [
        "漂泊者"
      ],
      "mainStoryTags": [
        "主線1.4"
      ],
      "positionX": 5.695658930405883,
      "date": "1994-01-01",
      "categoryColor": "#000000",
      "title": "黑海岸成立",
      "titleSize": 24,
      "referenceText": "主線1.4",
      "id": "3",
      "content": "<p><span style=\"font-family: monospace; font-size: 20px;\"><strong>漂泊者首個建立的組織，致力於觀察與預測悲鳴災害，與各國皆有合作。隱藏在暴風海，唯有黑海岸認可或引導者能抵達。一般依照泰提斯指示行動。其人員包含:</strong></span></p><p><span style=\"font-family: monospace; font-size: 20px;\"><strong>執花：需通過考核的高階執行者/客卿：一般人員執行專才或業務。</strong></span></p><p><span style=\"font-family: monospace; font-size: 20px;\"><strong>此時守岸人為助手，泰提斯已存在， 阿布已經存在。</strong></span></p><p><span style=\"font-family: monospace; font-size: 20px;\"><strong>漂泊者則隱藏首領身分行動，甚至連內部人員也鮮少人知首領是誰。</strong></span></p>",
      "mediaType": "image",
      "mediaUrl": "https://live.staticflickr.com/65535/55188687413_9325317579_b.jpg"
    },
    {
      "title": "第一實例接觸漂泊者",
      "titleSize": 24,
      "referenceText": "主線 1.0、主線 2.7、官方 YT",
      "id": "2",
      "mediaType": "youtube",
      "content": "<p><span style=\"color: rgb(255, 255, 255); font-family: monospace; font-size: 20px;\"><strong>  目前尚未知道何時發生。從主線 1.0 與 2.7 可知其為第一實例，掌控時間，第二實例為守岸人，掌控空間。</strong></span></p><p></p>",
      "mediaUrl": "https://www.youtube.com/watch?v=Dg6CYxCDFHE",
      "backgroundColor": "https://live.staticflickr.com/65535/55162509401_e7aff3c59d_b.jpg",
      "customDateText": "確切時間不明",
      "regionTags": [],
      "referenceImages": [
        "https://live.staticflickr.com/65535/55169265963_9d0ea9a81e_b.jpg"
      ],
      "category": "瑝瓏",
      "characterTags": [
        "漂泊者",
        "第一實例"
      ],
      "mainStoryTags": [
        "主線1.0"
      ],
      "positionX": 6.351860659664053,
      "date": "1500-05-12",
      "categoryColor": "#865935"
    },
    {
      "id": "1781498197038",
      "referenceText": "主線2.0、黎那汐塔探索",
      "title": "黎那汐塔尚未存在",
      "titleSize": 24,
      "mediaUrl": "https://live.staticflickr.com/65535/55169431343_6a56d80258_b.jpg",
      "mediaType": "image",
      "content": "<p style=\"font-family: monospace; font-size: 20px; font-weight: bold;\">黎是由多數悲鳴毀滅的文明所聚集海上難民組成。此時黎的組成國家尚健在。</p>",
      "referenceImages": [
        "https://live.staticflickr.com/65535/55169657470_dc0524ffb1_b.jpg"
      ],
      "category": "黎那汐塔",
      "backgroundColor": "https://live.staticflickr.com/65535/55162301197_5454aa97b7_b.jpg",
      "customDateText": "確切時間不明",
      "regionTags": [
        "黎那汐塔"
      ],
      "categoryColor": "#5cc33b",
      "date": "2026-06-15",
      "positionX": 7.548463813017187,
      "mainStoryTags": [
        "主線2.0"
      ]
    },
    {
      "title": "羅伊冰原上古時期",
      "titleSize": 24,
      "referenceText": "拉海洛探索",
      "id": "1781499265808",
      "mediaType": "image",
      "content": "<p style=\"font-family: monospace; font-size: 20px; font-weight: bold;\"><strong>羅伊上古時期，此時羅伊族人生活於地上游牧而生，此時地下綠洲拉海洛尚不存在。</strong></p>",
      "mediaUrl": "https://live.staticflickr.com/65535/55169357818_b5d8437fc3_b.jpg",
      "backgroundColor": "https://live.staticflickr.com/65535/55169152545_7c044f4fd5_b.jpg",
      "customDateText": "上萬年前",
      "regionTags": [
        "拉海洛"
      ],
      "referenceImages": [],
      "category": "拉海洛",
      "mainStoryTags": [
        "主線3.0"
      ],
      "positionX": 8,
      "date": "2026-06-15",
      "categoryColor": "#3376d0"
    },
    {
      "mediaUrl": "https://live.staticflickr.com/65535/55188660003_322a6b27f5_b.jpg",
      "mediaType": "image",
      "content": "<p style=\"font-family: monospace; font-size: 20px; font-weight: bold;\"><strong>目前尚未知道何時發生。做為科技前研擁有全世界最先進悲鳴預警科技的黑海岸内部，一份科研檔案，目前尚未知決議時間點。牽引整個索拉里斯命運的決議。</strong></p>",
      "referenceText": "主線1.4、黑海岸探索",
      "id": "1781499586599",
      "title": "K626協議",
      "titleSize": 24,
      "date": "2026-06-15",
      "categoryColor": "#000000",
      "mainStoryTags": [
        "主線1.4"
      ],
      "positionX": 15.384284462394163,
      "referenceImages": [
        "https://live.staticflickr.com/65535/55188919310_9e7da86ab9_b.jpg"
      ],
      "category": "黑海岸",
      "customDateText": "確切時間不明",
      "backgroundColor": "https://live.staticflickr.com/65535/55162509376_08a2c8999a_b.jpg",
      "regionTags": [
        "黑海岸"
      ]
    },
    {
      "backgroundColor": "https://live.staticflickr.com/65535/55171252343_c021bf8d21_b.jpg",
      "customDateText": "確切時間不明",
      "characterTags": [],
      "referenceImages": [
        "https://live.staticflickr.com/65535/55171378860_257e0d05bf_b.jpg"
      ],
      "category": " ",
      "positionX": 16.46508731058409,
      "mainStoryTags": [
        "主線 1.0",
        "主線2.5"
      ],
      "categoryColor": "#4d0000",
      "date": "2026-06-15",
      "titleSize": 24,
      "title": "殘星會成立",
      "id": "1781500292944",
      "referenceText": "主線 1.0、主線 2.7",
      "mediaType": "image",
      "content": "<p style=\"font-family: monospace; font-size: 20px; font-weight: bold;\">追求力量不擇手段的神秘的組織，存在時間久遠，從3.1劇情推測至少跨越一次大滅絕。</p><p style=\"font-family: monospace; font-size: 20px; font-weight: bold;\">從與漂泊者對話來看，與漂泊者關係匪淺。</p>",
      "mediaUrl": "https://live.staticflickr.com/65535/55169696565_a4fc955c18_b.jpg"
    },
    {
      "regionTags": [
        "瑝瓏"
      ],
      "customDateText": "確切時間不明",
      "backgroundColor": "https://live.staticflickr.com/65535/55162826059_f3510f4fa3_b.jpg",
      "category": "瑝瓏",
      "referenceImages": [
        "https://live.staticflickr.com/65535/55187758767_b853bb99ac_b.jpg"
      ],
      "mainStoryTags": [
        "主線1.0",
        "主線3.0"
      ],
      "positionX": 21.13569961883342,
      "date": "2026-06-15",
      "categoryColor": "#865935",
      "titleSize": 24,
      "title": "稷廷研究機構成立",
      "referenceText": "主線1.0、今州探索",
      "id": "1781507987430",
      "content": "<p style=\"font-family: monospace; font-size: 20px; font-weight: bold;\"><strong>為一神秘且科技先進的研究機構，擅長機關術。在各地有各種不同遺址遺物。華胥研究院曾與其合作過。其人員分不同部門與分支，其中更有受到殘星會會監贊助的分支。在拉海洛第一次悲鳴前就存在。</strong></p>",
      "mediaUrl": "https://live.staticflickr.com/65535/55162954485_e4a922ac32_b.jpg",
      "mediaType": "image"
    }
  ]
};

// Initialize file if not exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf8");
}

function getLatestBackupFilename(): string | null {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) return null;
    const files = fs.readdirSync(BACKUPS_DIR);
    const backupFiles = files.filter(f => f.startsWith("timeline_backup_") && f.endsWith(".json"));
    if (backupFiles.length === 0) return null;
    backupFiles.sort((a, b) => b.localeCompare(a));
    return path.join(BACKUPS_DIR, backupFiles[0]);
  } catch (e) {
    console.error("Error finding latest backup file", e);
    return null;
  }
}

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const rawData = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(rawData);
    }
  } catch (err) {
    console.error("Failed to read DATA_FILE", err);
  }
  return defaultData;
}

function writeData(data: any, req?: express.Request) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");

  let dateStr = "";
  if (req && req.headers && req.headers["x-client-date"]) {
    dateStr = req.headers["x-client-date"] as string;
  }

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dateStr = `${year}-${month}-${day}`;
  }

  const backupFile = path.join(BACKUPS_DIR, `timeline_backup_${dateStr}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), "utf8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" })); // Increase limit in case of large timelines with content/images

  // API routes
  app.get("/api/timeline", (req, res) => {
    res.json(readData());
  });

  app.post("/api/timeline", (req, res) => {
    const data = req.body;
    writeData(data, req);
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
