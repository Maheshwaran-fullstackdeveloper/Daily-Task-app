const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTodayTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getTasks);
router.get('/today', getTodayTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/toggle', toggleTask);

module.exports = router;
