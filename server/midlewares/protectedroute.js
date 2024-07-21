import jwt from "jsonwebtoken";
import User from "../model/user.js";

export const protectedroute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    const decote = jwt.verify(token, process.env.JWT_SECRET);

    if (!decote) {
      return res.status(401).json({ message: "Token not valid" });
    }

    const user = await User.findById(decote.id).select("-password");

    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({ message: "internal server err" });
  }
};
