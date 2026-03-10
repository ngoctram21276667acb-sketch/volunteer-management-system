const express = require("express");
const router = express.Router();
const {
  listCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  listCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  listUsers,
  createUser,
  assignUserCampaign,
  dashboardStats,
  updateUserProfile,
  dashboardSkills,
  listMyCandidates,
  markAttendance,
} = require("../controller/org.controller");

// Campaigns
router.get("/campaigns/:id", getCampaignById);  
router.get("/campaigns", listCampaigns);
router.post("/campaigns", createCampaign);
router.put("/campaigns/:id", updateCampaign);
router.delete("/campaigns/:id", deleteCampaign);

// Candidates
router.get("/candidates/me/:userId", listMyCandidates);
router.post("/candidates/attendance", markAttendance);
router.get("/candidates", listCandidates);
router.post("/candidates", createCandidate);
router.put("/candidates/:id", updateCandidate);
router.patch("/candidates/:id", updateCandidate);
router.delete("/candidates/:id", deleteCandidate);
router.get("/users", listUsers);   
router.post("/users", createUser);
router.patch("/users/:id", updateUserProfile);
router.patch("/users/:id/campaign", assignUserCampaign);

// Dashboard
router.get("/dashboard/stats", dashboardStats);
router.get("/dashboard/skills", dashboardSkills);

module.exports = router;

