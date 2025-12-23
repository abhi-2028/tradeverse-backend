const jwt = require("jsonwebtoken");
const UserModel = require("../model/UserModel");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Please login first" });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    // Fetch user without password
    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach minimal user info to request
    req.user = {
      id: user._id,
      email: user.email,
      username: user.username,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
