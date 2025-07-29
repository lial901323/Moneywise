const express = require("express");
const router = express.Router();
const {protect}= require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");



const {
  getAllUsers,
  getAllExpenses,
  getTotalDeposits,
  deleteUser,
  getTopUsers,       
  getUserDetails,
  getUserActivityChart 
} = require("../controllers/adminController");

// 🛡 All routes below require: valid token + admin role
router.get("/users", protect, checkRole("admin"), getAllUsers);
router.get("/expenses", protect, checkRole("admin"), getAllExpenses);
router.get("/deposits/total", protect, checkRole("admin"), getTotalDeposits);
router.delete("/users/:id", protect, checkRole("admin"), deleteUser);
router.get("/top-users", protect, checkRole("admin"), getTopUsers);
router.get("/users/:id/details", protect, checkRole("admin"), getUserDetails);
router.get('/user-activity-chart', protect, checkRole("admin"), getUserActivityChart);



module.exports = router;
