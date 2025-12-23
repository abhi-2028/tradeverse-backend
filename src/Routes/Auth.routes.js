const { Signup, Login, Logout, VerifyLogin } = require("../Controllers/Auth.controller");
const authMiddleware = require("../middlewares/Auth.middleware");
const router = require("express").Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.get("/logout", Logout);
router.get("/verify",authMiddleware, VerifyLogin)

// verify session
// router.get("/verify", requireAuth, (req, res) => {
//   res.json({
//     status: true,
//     user: {
//       id: req.user._id,
//       email: req.user.email,
//       username: req.user.username,
//     },
//   });
// });

module.exports = router;
