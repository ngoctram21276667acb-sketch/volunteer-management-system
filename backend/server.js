const express = require('express');
const cors = require('cors');
const http = require('http');

const { initSocket } = require('./socket');
const authRoutes = require('./routes/auth.routes');
const orgRoutes = require('./routes/org.routes');
const chatRoutes = require('./routes/chat.routes');

const { readFile, writeFile, genId } = require("./utils/fileStore");

const USERS_FILE = "users.json";
const NOTIFICATIONS_FILE = "notifications.json";
const CAMPAIGNS_FILE = "campaigns.json";

const PORT = process.env.PORT || 3000;

const app = express();

/* CORS CONFIG */
const corsOptions = {
  origin: "https://volunteer-management-system-gq3q589be.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

/* =========================
   ROUTES
========================= */

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/org", orgRoutes);
app.use("/api/v1/chat", chatRoutes);

/* =========================
   API TEST ROUTE
========================= */

app.get("/", (req, res) => {
  res.send("Volunteer Management System API running");
});

/* =========================
   NOTIFICATION ROUTES
========================= */

app.get("/api/v1/notifications", (req, res) => {
  const notifications = readFile(NOTIFICATIONS_FILE) || [];
  res.json({ success: true, data: notifications });
});

app.get("/api/v1/users", (req, res) => {
  const users = readFile(USERS_FILE) || [];
  res.json(users);
});

/* =========================
   CREATE HTTP SERVER
========================= */

const httpServer = http.createServer(app);

/* =========================
   SOCKET.IO
========================= */

const io = initSocket(httpServer);

/* middleware truyền io */
app.use((req, res, next) => {
  req.io = io;
  next();
});

/* =========================
   SCHEDULER NHẮC LỊCH
========================= */

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const REMINDER_INTERVAL = 60 * 60 * 1000;

function checkAndSendReminders() {

  console.log("Scheduler: Checking for campaign reminders...");

  const campaigns = readFile(CAMPAIGNS_FILE) || [];
  const notifications = readFile(NOTIFICATIONS_FILE) || [];
  const now = new Date();

  campaigns.forEach(campaign => {

    if (!campaign.startDate || !campaign.TNV_ids || campaign.TNV_ids.length === 0) {
      return;
    }

    const startDate = new Date(campaign.startDate);
    const timeDiff = startDate.getTime() - now.getTime();

    if (timeDiff > 0 && timeDiff < ONE_DAY_IN_MS) {

      campaign.TNV_ids.forEach(tnvId => {

        const reminderSent = notifications.some(
          n => n.userId === tnvId &&
          n.message.includes(`sắp diễn ra: "${campaign.title}"`)
        );

        if (!reminderSent) {

          console.log(`Sending reminder for "${campaign.title}"`);

          const newNotification = {
            _id: genId(),
            message: `Nhắc nhở: Chiến dịch bạn tham gia sắp diễn ra: "${campaign.title}" vào lúc ${startDate.toLocaleString('vi-VN')}.`,
            link: `/activity-detail.html?id=${campaign.id}`,
            createdAt: new Date(),
            read: false,
            userId: tnvId,
          };

          notifications.unshift(newNotification);

          io.to(tnvId).emit("notification:receive", newNotification);
        }

      });

    }

  });

  writeFile(NOTIFICATIONS_FILE, notifications);

}

/* =========================
   START SCHEDULER
========================= */

setInterval(checkAndSendReminders, REMINDER_INTERVAL);

checkAndSendReminders();

/* =========================
   START SERVER
========================= */

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});