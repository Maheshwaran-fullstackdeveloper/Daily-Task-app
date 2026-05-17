const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Setup initial user (run once)
// @route   POST /api/auth/setup
// @access  Public
const setupUser = async (req, res) => {
    try {
        const existingUser = await User.findOne({ username: 'admin' });
        if (existingUser) {
            return res.status(400).json({ message: 'User already set up' });
        }
        const { credentialId } = req.body;
        if (!credentialId) {
            return res.status(400).json({ message: 'Fingerprint credential ID is required' });
        }
        const user = await User.create({ username: 'admin', fingerprintCredentialId: credentialId });
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check if user is set up
// @route   GET /api/auth/status
// @access  Public
const getStatus = async (req, res) => {
    try {
        const user = await User.findOne({ username: 'admin' });
        res.json({ isSetup: !!user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// @desc    Login with fingerprint (WebAuthn simplified — using a stored credential ID)
// @route   POST /api/auth/fingerprint-login
// @access  Public
const fingerprintLogin = async (req, res) => {
    try {
        // We store a fingerprint credential ID on the user. 
        // This endpoint just validates that the credential ID matches and issues a token.
        const { credentialId } = req.body;
        const user = await User.findOne({ username: 'admin' });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.fingerprintCredentialId || user.fingerprintCredentialId !== credentialId) {
            return res.status(401).json({ message: 'Fingerprint not recognized' });
        }

        const token = generateToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.json({
            _id: user._id,
            username: user.username,
            streak: user.streak,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register fingerprint credential ID
// @route   POST /api/auth/register-fingerprint
// @access  Private
const registerFingerprint = async (req, res) => {
    try {
        const { credentialId } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.fingerprintCredentialId = credentialId;
        await user.save();
        res.json({ message: 'Fingerprint registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
    res.cookie('token', '', { maxAge: 0 });
    res.json({ message: 'Logged out' });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password -fingerprintCredentialId');
    res.json(user);
};

module.exports = { setupUser, getStatus, fingerprintLogin, registerFingerprint, logoutUser, getMe };
