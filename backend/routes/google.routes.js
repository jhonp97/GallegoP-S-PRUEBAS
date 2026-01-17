import express from "express";
import { getGoogleReviews } from "../controllers/googleReviews.controller.js";

const router = express.Router();

router.get("/reviews", getGoogleReviews);

export default router;
