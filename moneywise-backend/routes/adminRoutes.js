const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
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
router.get("/users", auth, checkRole("admin"), getAllUsers);
router.get("/expenses", auth, checkRole("admin"), getAllExpenses);
router.get("/deposits/total", auth, checkRole("admin"), getTotalDeposits);
router.delete("/users/:id", auth, checkRole("admin"), deleteUser);
router.get("/top-users", auth, checkRole("admin"), getTopUsers);
router.get("/users/:id/details", auth, checkRole("admin"), getUserDetails);
router.get('/user-activity-chart', auth, checkRole("admin"), getUserActivityChart);


module.exports = router;
