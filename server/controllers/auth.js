import { generateToken } from "../features/generateToken.js";
import User from "../model/user.js";

import bcrypt from "bcryptjs";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    const iscorrect = await bcrypt.compare(password, user?.password || "");

    if (!iscorrect || !user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "internal server err" });
  }
};

export const signup = async (req, res) => {
  try {
    const { username, fullName, password, email } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "email format invalid" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "username already exists" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const newuser = new User({
      username,
      fullName,
      likedPost:[],
      password: hashed,
      email,
    });

    if (newuser) {
      generateToken(newuser._id, res);
      await newuser.save();

      res.status(201).json({
        _id: newuser._id,
        username: newuser.username,
        fullName: newuser.fullName,
        email: newuser.email,
        followers: newuser.followers,
        following: newuser.following,
        profileImg: newuser.profileImg,
        coverImg: newuser.coverImg,
      });
    } else {
      res.status(400).json({ message: "invalid user data" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "internal server err" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });

    res.status(201).json({
      message: "Logged out successfully",
    });
} catch (error) {
    res.status(500).json({ message: "internal server err" });
}

};

export const getMe = async (req, res) => {
    res.status(200).json({
      message: req.user,
    });
  
};
