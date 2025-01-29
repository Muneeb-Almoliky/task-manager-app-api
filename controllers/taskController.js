const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

// Fetch tasks by user email
const getTasksByUserEmail = async (req, res) => {
    const { userEmail } = req.params;

    try {
        const tasks = await pool.query('SELECT * FROM tasks WHERE user_email = $1', [userEmail]);

        if (tasks.rows.length === 0) {
            return res.status(404).json({ error: 'No tasks found for this user' });
        }

        res.json(tasks.rows);  // Send the tasks as a response
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

// Create a new task
const createTask = async (req, res) => {
    const { user_email, title, completionStatus, starredStatus, date } = req.body;
    const id = uuidv4();

    // Validate input
    if (!user_email || typeof user_email !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing email' });
    }
    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Invalid or missing title' });
    }

    try {
        await pool.query(
            'INSERT INTO tasks(id, user_email, title, completion_status, starred_status,  date) VALUES($1, $2, $3, $4, $5, $6)',
            [id, user_email, title, completionStatus, starredStatus, date]
        );
        res.status(201).json({ message: 'Task created successfully', id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};

// Update a task
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { user_email, title } = req.body;

    try {
        const result = await pool.query(
            `UPDATE tasks SET user_email=$1, title=$2 WHERE id=$3 RETURNING *`,
            [user_email, title, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({
            message: 'Task updated successfully',
            updatedTask: result.rows[0],
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to update task' });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM tasks WHERE id=$1 RETURNING *`,
            [id]
        );

        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};

// Mark a task as completed
const completeTask = async (req, res) => {
    const { id } = req.params;
    const { isCompleted } = req.body;

    try {
        const result = await pool.query(
            `UPDATE tasks SET completion_status=$1 WHERE id=$2 RETURNING *`,
            [isCompleted, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({ message: 'Task marked as completed' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to mark task as completed' });
    }
};

// Star or unstar a task
const starTask = async (req, res) => {
    const { id } = req.params;
    const { isStarred } = req.body;

    try {
        const result = await pool.query(
            `UPDATE tasks SET starred_status=$1 WHERE id=$2 RETURNING *`,
            [isStarred, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({
            message: `Task marked as ${isStarred ? 'starred' : 'unstarred'}`,
            task: result.rows[0],
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to update task status' });
    }
};

// Archive or unarchive a task
const archiveTask = async (req, res) => {
    const { id } = req.params;
    const { isArchived } = req.body;

    try {
        const result = await pool.query(
            'UPDATE tasks SET archived_status = $1 WHERE id = $2 RETURNING *',
            [isArchived, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({
            message: `Task ${isArchived ? 'archived' : 'unarchived'} successfully`,
            task: result.rows[0],
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to update task status' });
    }
};

module.exports = {
    getTasksByUserEmail,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    starTask,
    archiveTask,
};
