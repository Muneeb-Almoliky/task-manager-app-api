const path = require('path');
const pool = require('../db');

// Upload and update profile picture
const uploadProfilePicture = async (req, res) => {
    try {
        const { userEmail } = req.params;

        if (!req.files || !req.files.image) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const image = req.files.image;

        // Save the file
        const filepath = path.join(__dirname, '../static/images', image.name);
        image.mv(filepath, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error uploading image' });
            }
        });

        // Update the database with the profile picture path
        const profilePicturePath = `/static/images/${image.name}`;
        const result = await pool.query(
            'UPDATE users SET profile_picture = $1 WHERE email = $2 RETURNING email, profile_picture',
            [profilePicturePath, userEmail]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with the updated user data and full URL
        res.status(200).json({
            message: 'Profile picture updated successfully',
            user: {
                ...result.rows[0],
                profile_picture: profilePicturePath,
            },
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error updating profile picture' });
    }
};

// Get the profile picture of a user
const getProfilePicture = async (req, res) => {
    try {
        const { userEmail } = req.params;

        // Fetch the user's profile picture path from the database
        const result = await pool.query(
            'SELECT profile_picture FROM users WHERE email = $1',
            [userEmail]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profilePicturePath = result.rows[0].profile_picture;

        if (!profilePicturePath) {
            return res.status(404).json({ message: 'No profile picture found' });
        }

        res.status(200).json({ email: userEmail, profile_picture: profilePicturePath });
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        res.status(500).json({ message: 'Error fetching profile picture' });
    }
};

module.exports = {
    uploadProfilePicture,
    getProfilePicture,
};
