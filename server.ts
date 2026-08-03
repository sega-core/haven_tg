import express from "express";
import cors from "cors";
import { launchBot } from "./tgBot";

const app = express();
const PORT = process.env.PORT || 3001;
const PROXY_SECRET = process.env.PROXY_SECRET;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// ============ Health Check ============
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "haven-telegram-bot",
    timestamp: new Date().toISOString(),
  });
});

// ============ Проверка авторизации ============
const checkAuth = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  if (authHeader !== `Bearer ${PROXY_SECRET}`) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }
  next();
};

// ============ Telegram API ============

// Отправка одного сообщения
app.post("/api/send-message", checkAuth, async (req, res) => {
  try {
    const { chatId, text, parse_mode = "HTML" } = req.body;

    if (!chatId || !text) {
      return res.status(400).json({
        success: false,
        error: "chatId и text обязательны",
      });
    }

    console.log(`📤 Отправка сообщения пользователю ${chatId}`);

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parse_mode,
      }),
    });

    const data = await response.json();

    if (data.ok) {
      console.log(`✅ Сообщение отправлено ${chatId}`);
      res.json({ success: true });
    } else {
      console.error(`❌ Telegram API error: ${data.description}`);
      res.status(500).json({
        success: false,
        error: data.description || "Unknown error",
      });
    }
  } catch (error: any) {
    console.error("❌ Ошибка:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

(async () => {
  try {
    // Запускаем Telegram бота
    await launchBot();
    console.log("🤖 Telegram бот запущен");

    // Запускаем HTTP сервер
  } catch (error) {
    console.error("❌ Ошибка при запуске:", error);
    process.exit(1);
  }
})();

app.listen(PORT, () => {
  console.log(`🚀 HTTP сервер запущен на порту ${PORT}`);
  console.log(`📌 Health: http://localhost:${PORT}/health`);
  console.log(`📌 Send: POST http://localhost:${PORT}/api/send-message`);
  console.log(`📌 Bulk: POST http://localhost:${PORT}/api/send-bulk`);
  console.log(`📌 Bot Info: GET http://localhost:${PORT}/api/bot-info`);
});
