import express from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as authController from '../controllers/authController.js';
import * as authService from '../services/authService.js';

const router = express.Router();

let googleOAuthConfigured = false;

const configureGoogleOAuth = () => {
  if (googleOAuthConfigured) return true;
  
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${backendUrl}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await authService.findOrCreateGoogleUser(profile);
            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
    googleOAuthConfigured = true;
    return true;
  }
  return false;
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', authController.getMe);

router.get('/google', (req, res, next) => {
  if (configureGoogleOAuth()) {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  } else {
    res.status(503).json({ message: 'Google OAuth is not configured' });
  }
});

router.get('/google/callback', (req, res, next) => {
  if (configureGoogleOAuth()) {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err || !user) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/login?error=auth_failed`);
      }
      req.user = user;
      authController.googleCallback(req, res);
    })(req, res, next);
  } else {
    res.status(503).json({ message: 'Google OAuth is not configured' });
  }
});

export default router;
