const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path'); // thêm dòng này

const { initSocket } = require('./socket');
const authRoutes = require('./routes/auth.routes');
const orgRoutes = require('./routes/org.routes');
const chatRoutes = require('./routes/chat.routes');

const { readFile, writeFile, genId } = require("./utils/fileStore");

/* FIX PATH */
const USERS_FILE = path.join(__dirname, "users.json");
const NOTIFICATIONS_FILE = path.join(__dirname, "notifications.json");
const CAMPAIGNS_FILE = path.join(__dirname, "campaigns.json");

const PORT = process.env.PORT || 3000;

const app = express();

const corsOptions = {
  origin: "https://volunteer-management-system-gq3q589be.vercel.app",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const httpServer = http.createServer(app);

const io = initSocket(httpServer);

/* middleware IO đặt trước routes */
app.use((req, res, next) => {
  req.io = io;
  next();
});

/* ROUTES */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/org", orgRoutes);
app.use("/api/v1/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("Volunteer Management System API running");
});