import User from "../model/user.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../model/notification.js";

export const userProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const followUnfollow = async (req, res) => {
  try {
    const loggedUser = await User.findById(req.user._id);
    const Usertomodify = await User.findById(req.params.id);

    if (!loggedUser || !Usertomodify)
      return res.status(404).json({ message: "User not found" });

    if (loggedUser._id.toString() === req.params.id)
      return res.status(404).json({ message: " cant follow yrself" });

    const isfollowing = loggedUser.following.includes(Usertomodify._id);

    if (isfollowing) {
      await User.findByIdAndUpdate(loggedUser._id, {
        $pull: { following: Usertomodify._id },
      });
      await User.findByIdAndUpdate(Usertomodify._id, {
        $pull: { followers: loggedUser._id },
      });

      res.status(200).json({ message: "user unfollowed" });
    } else {
      await User.findByIdAndUpdate(loggedUser._id, {
        $push: { following: Usertomodify._id },
      });
      await User.findByIdAndUpdate(Usertomodify._id, {
        $push: { followers: loggedUser._id },
      });

      const newNotification = new Notification( {
        to: Usertomodify._id,
        from: loggedUser._id,
        type: "FOLLOW",
      })

      newNotification.save( )

      res.status(200).json({ message: "user followed" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const usersFollowedMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: { _id: { $ne: userId } },
      },
      { $sample: { size: 8 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowedMe.following.includes(user._id)
    );

    const SuggestedUsers = filteredUsers.slice(0, 4);

    SuggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(SuggestedUsers);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  const {
    username,
    fullName,
    email,
    currentPassword,
    newPassword,
    links,
    bio,
  } = req.body;
  let { coverImg, profileImg } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      (!currentPassword && newPassword) ||
      (!newPassword && currentPassword)
    ) {
      return res.status(400).json({ message: "enter current & new password" });
    }

    if (currentPassword && newPassword) {
      const isCorrect = await bcrypt.compare(currentPassword, user?.password);

      if (!isCorrect)
        return res.status(401).json({ message: "incorrect current password" });

      if (newPassword.length < 6) {
        return res.status(401).json({ message: " password at least 6" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ message: "email format invalid" });
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader
          .destroy(user.profileImg.split("/"))
          .pop()
          .split(".")[0];
      }

      const reslt = await cloudinary.uploader.upload(profileImg);
      profileImg = reslt.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader
          .destroy(user.coverImg.split("/"))
          .pop()
          .split(".")[0];
      }

      const reslt = await cloudinary.uploader.upload(profileImg);
      coverImg = reslt.secure_url;
    }

    user.username = username || user.username;
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;
    user.links = links || user.links;
    user.bio = bio || user.bio;

    await user.save();

    user.password = null;

    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

