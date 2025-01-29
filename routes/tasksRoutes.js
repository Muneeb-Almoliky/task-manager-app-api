const express = require('express');
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

const {
    getTasksByUserEmail,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    starTask,
    archiveTask,
} = require('../controllers/taskController');

const router = express.Router();

// GET route to fetch tasks
router.get('/:userEmail', getTasksByUserEmail);

// POST route to create a new task
router.post('/', createTask);

// PUT route to update a task
router.put('/:id', updateTask);

// DELETE route to delete a task
router.delete('/:id', deleteTask);

// PUT route to complete/uncomplete a task
router.put('/:id/complete', completeTask);

// PUT route to star/unstar a task
router.put('/:id/star', starTask);

// PUT route to archive/unarchive a task
router.put('/:id/archive', archiveTask);


module.exports = router;
