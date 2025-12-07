import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw { status: 400, message: 'User already exists' };
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  if (!user.password) {
    throw { status: 401, message: 'Please sign in with Google or reset your password' };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };
};

export const getCurrentUser = async (token) => {
  if (!token) {
    throw { status: 401, message: 'No token provided' };
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select('-password');

  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  };
};

export const findOrCreateGoogleUser = async (profile) => {
  let user = await User.findOne({ googleId: profile.id });

  if (user) {
    return user;
  }

  user = await User.findOne({ email: profile.emails[0].value });

  if (user) {
    user.googleId = profile.id;
    user.avatar = profile.photos[0].value;
    await user.save();
    return user;
  }

  user = await User.create({
    name: profile.displayName,
    email: profile.emails[0].value,
    googleId: profile.id,
    avatar: profile.photos[0].value,
  });

  return user;
};

