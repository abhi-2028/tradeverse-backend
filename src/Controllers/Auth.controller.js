const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../model/UserModel");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,         // REQUIRED on Vercel
  sameSite: "none",     // REQUIRED for cross-origin
  maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
};

if (!process.env.TOKEN_KEY) {
  throw new Error("TOKEN_KEY is not defined");
}

/* ================= SIGNUP ================= */
module.exports.Signup = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Ensure password is hashed (in case schema middleware is missing)
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.TOKEN_KEY,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(201).json({
      message: "User signed up successfully",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Signup failed" });
  }
};

/* ================= LOGIN ================= */
module.exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.TOKEN_KEY,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

/* ================= LOGOUT ================= */
module.exports.Logout = (req, res) => {
  try {
    res.clearCookie("token", COOKIE_OPTIONS);

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};

/* ================= VERIFY LOGIN ================= */
module.exports.VerifyLogin = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
