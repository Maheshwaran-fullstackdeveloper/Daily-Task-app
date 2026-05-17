const Task = require('../models/Task');
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
const { format, subDays } = require('date-fns');

const todayStr = () => format(new Date(), 'yyyy-MM-dd');

// @desc    Get all active tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get today's tasks with completion status
// @route   GET /api/tasks/today
// @access  Private
const getTodayTasks = async (req, res) => {
    try {
        const today = todayStr();

        const tasks = await Task.find({
            user: req.user._id,
            isActive: true,
            $or: [
                { category: 'common' },
                { category: 'scheduled', scheduledDate: today }
            ]
        }).sort({ category: 1, createdAt: 1 });

        let log = await DailyLog.findOne({ user: req.user._id, date: today });
        const completedTaskIds = log ? log.completedTasks.map(id => id.toString()) : [];
        const totalTasksToday = tasks.length;

        if (log && log.totalTasksCount !== totalTasksToday) {
            log.totalTasksCount = totalTasksToday;
            await log.save();
        }

        const result = tasks.map(task => ({
            ...task.toObject(),
            completed: completedTaskIds.includes(task._id.toString())
        }));

        res.json({
            tasks: result,
            completedCount: completedTaskIds.length,
            totalCount: totalTasksToday,
            isPerfectDay: log ? log.isPerfectDay : false
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    try {
        const { title, category, scheduledDate } = req.body;

        if (!title || !category) {
            return res.status(400).json({ message: 'Title and category are required' });
        }
        if (category === 'scheduled' && !scheduledDate) {
            return res.status(400).json({ message: 'Scheduled date is required for scheduled tasks' });
        }

        const task = await Task.create({
            user: req.user._id,
            title,
            category,
            scheduledDate: category === 'scheduled' ? scheduledDate : undefined
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const { title, category, scheduledDate } = req.body;
        if (title) task.title = title;
        if (category) task.category = category;
        if (scheduledDate !== undefined) task.scheduledDate = scheduledDate;

        const updated = await task.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete (soft delete) a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.isActive = false;
        await task.save();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle task completion for today
// @route   POST /api/tasks/:id/toggle
// @access  Private
const toggleTask = async (req, res) => {
    try {
        const today = todayStr();
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Find or create today's daily log
        let log = await DailyLog.findOne({ user: req.user._id, date: today });
        if (!log) {
            const totalTasksToday = await Task.countDocuments({
                user: req.user._id,
                isActive: true,
                $or: [
                    { category: 'common' },
                    { category: 'scheduled', scheduledDate: today }
                ]
            });
            log = new DailyLog({
                user: req.user._id,
                date: today,
                completedTasks: [],
                totalTasksCount: totalTasksToday,
                isPerfectDay: false
            });
        }

        // Toggle the task in the log
        const taskId = task._id.toString();
        const isCompleted = log.completedTasks.map(id => id.toString()).includes(taskId);

        if (isCompleted) {
            log.completedTasks = log.completedTasks.filter(id => id.toString() !== taskId);
        } else {
            log.completedTasks.push(task._id);
        }

        // Recount total (in case tasks were added/removed)
        const totalTasksToday = await Task.countDocuments({
            user: req.user._id,
            isActive: true,
            $or: [
                { category: 'common' },
                { category: 'scheduled', scheduledDate: today }
            ]
        });

        log.totalTasksCount = totalTasksToday;
        const isPerfect = log.completedTasks.length >= totalTasksToday && totalTasksToday > 0;
        const wasPerfect = log.isPerfectDay;
        log.isPerfectDay = isPerfect;

        await log.save();

        // Robust Streak Update Logic
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        
        const userDoc = await User.findById(req.user._id);
        let newCurrent = userDoc.streak.current;
        let newLongest = userDoc.streak.longest;
        let newLastDate = userDoc.streak.lastCompletedDate;
        let shouldUpdate = false;

        if (isPerfect) {
            // If the day is now perfect but wasn't credited yet
            if (newLastDate !== today) {
                if (newLastDate === yesterday) {
                    newCurrent += 1;
                } else {
                    newCurrent = 1;
                }
                newLastDate = today;
                if (newCurrent > newLongest) newLongest = newCurrent;
                shouldUpdate = true;
            }
        } else {
            // If the day is NOT perfect but was credited today
            if (newLastDate === today) {
                newCurrent = Math.max(0, newCurrent - 1);
                
                // Find the actual most recent perfect day to restore the streak correctly
                const lastPerfectLog = await DailyLog.findOne({
                    user: req.user._id,
                    date: { $lt: today },
                    isPerfectDay: true
                }).sort({ date: -1 });

                newLastDate = lastPerfectLog ? lastPerfectLog.date : null;
                shouldUpdate = true;
            }
        }

        let finalUser = userDoc;
        if (shouldUpdate) {
            finalUser = await User.findByIdAndUpdate(
                req.user._id,
                {
                    $set: {
                        'streak.current': newCurrent,
                        'streak.longest': newLongest,
                        'streak.lastCompletedDate': newLastDate
                    }
                },
                { new: true }
            );
        }
        streakData = finalUser.streak;

        res.json({
            completed: !isCompleted,
            justCompleted: !isCompleted,
            isPerfectDay: isPerfect,
            completedCount: log.completedTasks.length,
            totalCount: totalTasksToday,
            streak: streakData
        });
    } catch (error) {
        console.error('Toggle error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTasks, getTodayTasks, createTask, updateTask, deleteTask, toggleTask };
