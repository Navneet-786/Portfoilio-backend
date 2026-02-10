import express from "express";
import {
  getUser,
  login,
  logout,
  register,
  updatePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
  getUserForPortfolio,
} from "../controller/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register); //DONE
router.post("/login", login); //DONE
router.get("/me", isAuthenticated, getUser); //DONE
router.get("/logout", isAuthenticated, logout); //DONE
router.get("/portfolio/me", getUserForPortfolio); //DONE
router.put("/password/update", isAuthenticated, updatePassword); //DONE
router.put("/me/profile/update", isAuthenticated, updateProfile);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

export default router;
