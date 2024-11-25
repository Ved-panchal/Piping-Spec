import { Router } from "express";

import { generateReviewOutput } from "../controllers/generateReviewOutputController";

const router = Router();

router.post('/generateReviewOutput', generateReviewOutput);

export default router;