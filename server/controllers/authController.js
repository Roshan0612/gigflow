import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate token
    const token = generateToken(user._id);

    // Set cookie (use 'lax' in development and 'none' in production to support cross-origin dev setups)
    // Build cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    // If a specific cookie domain is provided (useful for subdomain deployments), add it
    if (process.env.COOKIE_DOMAIN) {
      cookieOptions.domain = process.env.COOKIE_DOMAIN;
    }

    // If request is over HTTPS (or behind a proxy using x-forwarded-proto), enforce SameSite=None and Secure
    const forwardedProto = req.headers['x-forwarded-proto'];
    const isSecureReq = req.secure || (forwardedProto && forwardedProto.split(',')[0] === 'https') || process.env.NODE_ENV === 'production';
    if (isSecureReq) {
      cookieOptions.sameSite = 'none';
      cookieOptions.secure = true;
    }

    res.cookie('token', token, cookieOptions);
    console.log(`Set token cookie for user ${user._id} - cookieOptions:`, cookieOptions);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie (use 'lax' in development and 'none' in production to support cross-origin dev setups)
    // Build cookie options
    const cookieOptions2 = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    if (process.env.COOKIE_DOMAIN) {
      cookieOptions2.domain = process.env.COOKIE_DOMAIN;
    }

    const forwardedProto2 = req.headers['x-forwarded-proto'];
    const isSecureReq2 = req.secure || (forwardedProto2 && forwardedProto2.split(',')[0] === 'https') || process.env.NODE_ENV === 'production';
    if (isSecureReq2) {
      cookieOptions2.sameSite = 'none';
      cookieOptions2.secure = true;
    }

    res.cookie('token', token, cookieOptions2);
    console.log(`Set token cookie for user ${user._id} - cookieOptions:`, cookieOptions2);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Logout successful.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout.'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error.'
    });
  }
};
