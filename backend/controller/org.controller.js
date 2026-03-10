const { readFile, writeFile, genId } = require("../utils/fileStore.js");

const CAMPAIGNS_FILE = "campaigns.json";
const CANDIDATES_FILE = "candidates.json";
const NOTIFICATIONS_FILE = "notifications.json";

// Helper function to create and broadcast a notification
function createNotification(io, message, link = "#", userId = null) {
  const notifications = readFile(NOTIFICATIONS_FILE) || [];
  const newNotification = {
    _id: genId(),
    message,
    link,
    createdAt: new Date(),
    read: false, // Mặc định là chưa đọc
    userId: userId, // ID của người dùng cụ thể, null nếu là thông báo chung
  };
  notifications.unshift(newNotification);
  writeFile(NOTIFICATIONS_FILE, notifications);

  if (userId) {
    // Gửi thông báo riêng cho người dùng cụ thể
    io.to(userId).emit("notification:receive", newNotification);
  } else {
    // Gửi thông báo đến tất cả client đang kết nối
    io.emit("notification:receive", newNotification);
  }
}


function ok(res, data) {
  return res.json({ success: true, data });
}

function bad(res, message, status = 400) {
  return res.status(status).json({ success: false, message });
}

function toStr(v, d = "") {
  return v != null ? String(v).trim() : d;
}

function toNum(v, d = 0) {
  const n = Number(v);
  return Number.isNaN(n) ? d : n;
}

function toBool(v, d = false) {
  if (v === true || v === false) return v;
  return d;
}

function toArr(v) {
  return Array.isArray(v) ? v : [];
}


function normalizeStatus(s) {
  const v = String(s || "").trim();
  if (v === "Approved" || v === "Rejected" || v === "Pending") return v;
  return "Pending";
}

/* ================================
CAMPAIGN SCHEMA BUILDER
================================ */

function buildCampaign(data = {}, current = {}) {

  const campaign = {

    id: current.id || genId(),

    title: toStr(data.title, current.title),
    des: toStr(data.des, current.des),
    description: toStr(data.description, current.description),

    category: toStr(data.category, current.category || "General"),

    image: toStr(data.image, current.image),

    skills: toStr(data.skills, current.skills),

    vacancies: toNum(data.vacancies, current.vacancies || 0),

    timeline: toStr(data.timeline, current.timeline),

    location: toStr(data.location, current.location),

    organization: toStr(data.organization, current.organization),

    organization_id: toStr(data.organization_id, current.organization_id),

    TNV_ids: toArr(data.TNV_ids ?? current.TNV_ids),

    is_active: toBool(data.is_active, current.is_active ?? true),

    apply_status: toStr(data.apply_status, current.apply_status || "Pending"),

    is_finish: toBool(data.is_finish, current.is_finish ?? false),
    startDate: toStr(data.startDate, current.startDate), // Thêm startDate
  };

  return campaign;
}


const listCampaigns = (req, res) => {
  const campaigns = readFile(CAMPAIGNS_FILE) || [];
  ok(res, campaigns);
};

const getCampaignById = (req, res) => {

  const id = String(req.params.id || "");

  const campaigns = readFile(CAMPAIGNS_FILE) || [];

  const item = campaigns.find(c => String(c.id) === id);

  if (!item) return bad(res, "Không tìm thấy campaign", 404);

  ok(res, item);
};


/* ================================
CREATE CAMPAIGN
================================ */

const createCampaign = (req, res) => {

  const campaigns = readFile(CAMPAIGNS_FILE) || [];

  if (!req.body?.title) {
    return bad(res, "Thiếu title");
  }

  const item = buildCampaign(req.body);

  campaigns.unshift(item);

  writeFile(CAMPAIGNS_FILE, campaigns);

  // Tạo thông báo cho tất cả user
  createNotification(
    req.io,
    `Chiến dịch mới đã được tạo: "${item.title}"`,
    `/activity-detail.html?id=${item.id}` // Link tới trang chi tiết campaign
  );

  ok(res, item);
};


/* ================================
UPDATE CAMPAIGN
================================ */

const updateCampaign = (req, res) => {

  const id = String(req.params.id || "");

  const campaigns = readFile(CAMPAIGNS_FILE) || [];

  const idx = campaigns.findIndex(c => String(c.id) === id);

  if (idx === -1) {
    return bad(res, "Không tìm thấy campaign", 404);
  }

  const current = campaigns[idx];

  const updated = buildCampaign(req.body, current);

  campaigns[idx] = updated;

  writeFile(CAMPAIGNS_FILE, campaigns);

  ok(res, updated);
};

/* ================================
DELETE CAMPAIGN
================================ */

const deleteCampaign = (req, res) => {

  const id = String(req.params.id || "");

  const campaigns = readFile(CAMPAIGNS_FILE) || [];

  const next = campaigns.filter(c => String(c.id) !== id);

  writeFile(CAMPAIGNS_FILE, next);

  ok(res, { id });
};


const USERS_FILE = "users.json";

function buildUser(data = {}, current = {}) {

  return {

    _id: current._id || current.id || genId(),

    fullName: toStr(data.fullname, current.fullname),

    email: toStr(data.email, current.email),

    password: toStr(data.password, current.password),

    phone: toStr(data.phone, current.phone),

    point: toNum(data.point, current.point || 0),

    role: toStr(data.role, current.role || "volunteer"),  

    skills: toArr(data.skills ?? current.skills),

    campaign_ids: toArr(data.campaign_ids ?? current.campaign_ids)

  };

}
const listUsers = (req, res) => {

  const users = readFile(USERS_FILE) || [];

  ok(res, users);

};

const updateUserProfile = (req, res) => {

  const id = String(req.params.id || "");
  const users = readFile("users.json") || [];

  const index = users.findIndex(u => String(u.id) === id || String(u._id) === id);

  if (index === -1) {
    return bad(res, "User not found", 404);
  }

  const user = users[index];

  const updated = {
    ...user,
    bio: req.body?.bio != null ? String(req.body.bio).trim() : user.bio,
    // Đồng nhất skills về dạng Array nếu là String hoặc ngược lại tùy theo hệ thống, 
    // ở đây ta giữ nguyên String nếu user gửi lên String để tránh lỗi .trim() ở frontend
    skills: req.body?.skills != null ? String(req.body.skills).trim() : user.skills
  };

  users[index] = updated;

  writeFile("users.json", users);

  ok(res, updated);
};

const createUser = (req, res) => {

  const users = readFile(USERS_FILE) || [];
  const campaigns = readFile(CAMPAIGNS_FILE) || [];
  const candidates = readFile(CANDIDATES_FILE) || [];

  const fullname = String(req.body?.fullname || "").trim();
  const email = String(req.body?.email || "").trim();
  const campaignId = String(req.body?.campaign_ids || "").trim();

  if (!fullname) return bad(res,"Thiếu fullname");
  if (!email) return bad(res,"Thiếu email");
  if (!campaignId) return bad(res,"Thiếu campaign_id");

  const campaign = campaigns.find(c => String(c.id) === campaignId);
  if (!campaign) return bad(res,"Campaign không tồn tại");

  let user = users.find(u => u.email === email);

  /* ==========================
     CASE 1: USER ĐÃ TỒN TẠI
  ========================== */

  if (user) {

    const existedCampaign = (user.campaign_ids || []).includes(campaignId);

    if (existedCampaign) {
      return bad(res,"User đã tồn tại và đã tham gia campaign này");
    }

    // thêm campaign vào user
    user.campaign_ids = user.campaign_ids || [];
    user.campaign_ids.push(campaignId);

    /* update campaign */
    campaign.TNV_ids = campaign.TNV_ids || [];
    if (!campaign.TNV_ids.includes(user.id || user._id)) {
      campaign.TNV_ids.push(user.id || user._id);
      campaign.vacancies--;
    }

    /* tạo candidate */
    const candidate = {
      id: genId(),
      name: user.fullName,
      skills: user.skills,
      campaign: campaign.title,
      status: "Approved",
      email: user.email,
      userId: user.id || user._id,
      campaignId
    };

    candidates.push(candidate);

    writeFile(USERS_FILE, users);
    writeFile(CAMPAIGNS_FILE, campaigns);
    writeFile(CANDIDATES_FILE, candidates);

    return ok(res, {
      message: "User đã tồn tại, đã thêm campaign mới",
      candidate
    });
  }

  /* ==========================
     CASE 2: USER MỚI
  ========================== */

  const newUser = buildUser({
    ...req.body,
    campaign_ids: [campaignId]
  });

  users.unshift(newUser);

  /* update campaign */
  campaign.TNV_ids = campaign.TNV_ids || [];
  campaign.TNV_ids.push(newUser._id);
  campaign.vacancies--;

  /* tạo candidate */
  const candidate = {
    id: genId(),
    name: newUser.fullName,
    skills: newUser.skills,
    campaign: campaign.title,
    status: "Approved",
    email: newUser.email,
    userId: newUser._id,
    campaignId
  };

  candidates.push(candidate);

  writeFile(USERS_FILE, users);
  writeFile(CAMPAIGNS_FILE, campaigns);
  writeFile(CANDIDATES_FILE, candidates);

  ok(res,{
    message:"Tạo user mới và gán campaign thành công",
    user:newUser,
    candidate
  });

};

async function assignUserCampaign(req, res) {

  const { campaign_id } = req.body;
  const {id} = req.params;
  const users = readFile("users.json");
  console.log("Body req:", req.body);
  console.log(id, campaign_id);
  const campaigns = readFile("campaigns.json");
  const candidates = readFile("candidates.json");
  const user = users.find(u => String(u._id) === id);
  if (!user) {
    return bad(res, "User not found");
  }

  const campaign = campaigns.find(c => String(c.id) === campaign_id);
  if (!campaign) {
    return bad(res, "Campaign not found");
  }

  // kiểm tra đã assign chưa
  const existed = candidates.find(
    c => String(c.userId) === id && String(c.campaignId) === campaign_id
  );

  if (existed) {
    return bad(res, "User already assigned");
  }

  const candidate = {
    id: genId(),
    name: user.fullName,
    skills: user.skills,
    campaign: campaign.title,
    status: "Approved",
    email: user.email,
    userId: user._id,
    campaignId: campaign_id
  };

  candidates.push(candidate);


  // update campain sau khi them candidate moi thanh cong
  campaign.vacancies--;

  campaigns[campaigns.findIndex(c => String(c.id) === campaign_id)] = campaign;
  writeFile("campaigns.json", campaigns);
  writeFile("candidates.json", candidates);

  ok(res, candidate);
}
// Candidates
const listCandidates = (req, res) => {
  const candidates = readFile(CANDIDATES_FILE) || [];

  const q = String(req.query.search || "").trim().toLowerCase();
  const status = String(req.query.status || "all");
  const campaign = String(req.query.campaign || "all");

  const filtered = candidates.filter((c) => {
    const byName = !q || String(c.name || "").toLowerCase().includes(q);
    const byStatus = status === "all" || c.status === status;
    const byCampaign = campaign === "all" || c.campaign === campaign;
    return byName && byStatus && byCampaign;
  });

  ok(res, filtered);
};

const createCandidate = (req, res) => {

  const candidates = readFile(CANDIDATES_FILE) || [];
  const campaigns = readFile(CAMPAIGNS_FILE) || [];
  console.log(req.body);
  const name = String(req.body?.name || "").trim();
  const userId = String(req.body?.userId || "").trim();
  const campaignTitle = String(req.body?.campaign || "").trim();

  if (!name) return bad(res, "Thiếu name");
  if (!userId) return bad(res, "Thiếu userId");
  if (!campaignTitle) return bad(res, "Thiếu campaign");

  const campaignIndex = campaigns.findIndex(c => c.title === campaignTitle);

  if (campaignIndex === -1) {
    return bad(res, "Campaign không tồn tại");
  }

  const campaign = campaigns[campaignIndex];

  // tránh apply trùng
  const existed = candidates.find(
    c => String(c.userId) === userId && c.campaign === campaignTitle
  );

  if (existed) {
    return bad(res, "Bạn đã ứng tuyển campaign này rồi");
  }

  const item = {
    id: genId(),
    name,
    skills: String(req.body?.skills || "").trim(),
    campaign: campaignTitle,
    status: normalizeStatus(req.body?.status),
    email: String(req.body?.email || "").trim() || undefined,
    userId
  };

  candidates.unshift(item);

  // thêm TNV vào campaign
  const tnvIds = campaign.TNV_ids || [];

  if (!tnvIds.includes(userId)) {
    tnvIds.push(userId);
  }

  campaigns[campaignIndex].TNV_ids = tnvIds;

  writeFile(CANDIDATES_FILE, candidates);
  writeFile(CAMPAIGNS_FILE, campaigns);

  ok(res, item);
};

const updateCandidate = (req, res) => {
  const id = String(req.params.id || "");
  const candidates = readFile(CANDIDATES_FILE) || [];
  const idx = candidates.findIndex((c) => String(c.id) === id);
  if (idx === -1) return bad(res, "Không tìm thấy candidate", 404);

  const current = candidates[idx];
  const nextName = req.body?.name != null ? String(req.body.name).trim() : current.name;
  if (!nextName) return bad(res, "Thiếu name");

  const nextStatus = req.body?.status != null ? normalizeStatus(req.body.status) : current.status;

  candidates[idx] = {
    ...current,
    name: nextName,
    skills: req.body?.skills != null ? String(req.body.skills).trim() : current.skills,
    campaign: req.body?.campaign != null ? String(req.body.campaign).trim() : current.campaign,
    status: nextStatus,
    email: req.body?.email != null ? String(req.body.email).trim() || undefined : current.email,
    userId: req.body?.userId != null ? String(req.body.userId) : current.userId,
  };

  // Gửi thông báo nếu trạng thái được duyệt
  if (nextStatus === "Approved" && current.status !== "Approved") {
    createNotification(
      req.io,
      `Chúc mừng! Bạn đã được duyệt tham gia chiến dịch "${candidates[idx].campaign}".`,
      `#`, // Có thể thêm link chi tiết sau
      candidates[idx].userId
    );
  }

  writeFile(CANDIDATES_FILE, candidates);
  ok(res, candidates[idx]);
};

const deleteCandidate = (req, res) => {
  const id = String(req.params.id || "");
  const candidates = readFile(CANDIDATES_FILE) || [];
  const next = candidates.filter((c) => String(c.id) !== id);
  writeFile(CANDIDATES_FILE, next);
  ok(res, { id });
};

// Dashboard
const dashboardStats = (req, res) => {
  const campaigns = readFile(CAMPAIGNS_FILE) || [];
  const candidates = readFile(CANDIDATES_FILE) || [];

  const approvedCount = candidates.filter((c) => c.status === "Approved").length;
  const pendingCount = candidates.filter((c) => c.status === "Pending").length;

  ok(res, {
    taskCount: campaigns.length,
    approvedCount,
    pendingCount,
  });
};

const dashboardSkills = (req, res) => {
  const candidates = readFile(CANDIDATES_FILE) || [];
  const skillCount = {};

  for (const c of candidates) {
    if (c.status !== "Approved") continue;
    const key = String(c.skills || "—").trim() || "—";
    skillCount[key] = (skillCount[key] || 0) + 1;
  }

  const labels = Object.keys(skillCount);
  const data = Object.values(skillCount);
  ok(res, { labels, data });
};

const listMyCandidates = (req, res) => {
  const userId = String(req.params.userId || "");
  if (!userId) return bad(res, "Thiếu userId");

  const candidates = readFile(CANDIDATES_FILE) || [];
  const campaigns = readFile(CAMPAIGNS_FILE) || [];

  const myCandidates = candidates.filter(c => String(c.userId) === userId);
  
  const result = myCandidates.map(c => {
    const campaign = campaigns.find(camp => camp.title === c.campaign || camp.id === c.campaignId);
    return {
      ...c,
      campaignDetail: campaign || null
    };
  });

  ok(res, result);
};

const markAttendance = (req, res) => {
  const { candidateId } = req.body;
  if (!candidateId) return bad(res, "Thiếu candidateId");

  const candidates = readFile(CANDIDATES_FILE) || [];
  const idx = candidates.findIndex(c => String(c.id) === String(candidateId));

  if (idx === -1) return bad(res, "Không tìm thấy thông tin ứng tuyển", 404);

  candidates[idx].attended = true;
  candidates[idx].attendanceTime = new Date();

  writeFile(CANDIDATES_FILE, candidates);

  ok(res, { message: "Điểm danh thành công", candidate: candidates[idx] });
};

module.exports = {
  listCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  listCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  dashboardStats,
  dashboardSkills,
  listUsers,
  createUser,
  updateUserProfile,
  assignUserCampaign,
  listMyCandidates,
  markAttendance
};
