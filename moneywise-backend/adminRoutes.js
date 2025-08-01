const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const { getTop3UsersWithExpensesIncome } = require('../controllers/adminController');

const {
  getAllUsers,
  getAllExpenses,
  getTotalDeposits,
  deleteUser,
  getTopUsers,
  getUserDetails,
  getUserActivityChart,
  getTotalUsers,
  getTotalDepositsForAllUsers,
  getStats,
  getWeeklyDeposits,
  getGrowthRate,
  getRecentTransactions,
  getGrowthRateHistory,
} = require("../controllers/adminController");

router.get("/users", protect, checkRole("admin"), getAllUsers);
router.get("/expenses", protect, checkRole("admin"), getAllExpenses);
router.get("/deposits/total", protect, checkRole("admin"), getTotalDepositsForAllUsers);
router.delete("/users/:id", protect, checkRole("admin"), deleteUser);
router.get("/top-users", protect, checkRole("admin"), getTopUsers);
router.get("/users/:id/details", protect, checkRole("admin"), getUserDetails);
router.get('/user-activity-chart', protect, checkRole("admin"), getUserActivityChart);
router.get('/users/total', protect, checkRole("admin"), getTotalUsers);
router.get('/stats', protect, checkRole("admin"), getStats);
router.get('/deposits/weekly', protect, checkRole('admin'), getWeeklyDeposits);
router.get('/top3-users-stats', protect, checkRole('admin'), getTop3UsersWithExpensesIncome);
router.get('/growth-rate', protect, checkRole('admin'), getGrowthRate);
router.get('/recent-transactions', protect, checkRole('admin'), getRecentTransactions);
router.get('/growth-rate/history', protect, checkRole('admin'), getGrowthRateHistory);



module.exports = router;
