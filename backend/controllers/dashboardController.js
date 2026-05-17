const DailyLog = require('../models/DailyLog');
const Task = require('../models/Task');
const User = require('../models/User');
const { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } = require('date-fns');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = format(new Date(), 'yyyy-MM-dd');

        // User streak info
        const user = await User.findById(userId).select('streak');

        // Last 30 days logs
        const thirtyDaysAgo = format(subDays(new Date(), 29), 'yyyy-MM-dd');
        const logs = await DailyLog.find({
            user: userId,
            date: { $gte: thirtyDaysAgo, $lte: today }
        }).sort({ date: 1 });

        // Build heatmap data for last 30 days
        const logMap = {};
        logs.forEach(log => {
            logMap[log.date] = {
                completedCount: log.completedTasks.length,
                totalCount: log.totalTasksCount,
                isPerfectDay: log.isPerfectDay
            };
        });

        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
            last30Days.push({
                date: d,
                ...(logMap[d] || { completedCount: 0, totalCount: 0, isPerfectDay: false })
            });
        }

        // Weekly completion rate (last 7 days)
        const weeklyData = last30Days.slice(-7).map(day => ({
            day: format(parseISO(day.date), 'EEE'),
            completed: day.completedCount,
            total: day.totalCount,
            rate: day.totalCount > 0 ? Math.round((day.completedCount / day.totalCount) * 100) : 0
        }));

        // Total stats
        const totalPerfectDays = logs.filter(l => l.isPerfectDay).length;
        const totalTasksCompleted = logs.reduce((sum, l) => sum + l.completedTasks.length, 0);
        const totalTasksCount = await Task.countDocuments({ user: userId, isActive: true });

        // Today's log
        const todayLog = await DailyLog.findOne({ user: userId, date: today });
        const todayCompleted = todayLog ? todayLog.completedTasks.length : 0;
        const todayTotal = todayLog ? todayLog.totalTasksCount : 0;
        const completionRate = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

        res.json({
            streak: user.streak,
            completionRate,
            todayCompleted,
            todayTotal,
            totalTasksCount,
            totalPerfectDays,
            totalTasksCompleted,
            heatmap: last30Days,
            weeklyData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboard };
