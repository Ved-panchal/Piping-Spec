"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOrUpdateRatings = exports.getRatingsByProjectId = void 0;
const models_1 = __importDefault(require("../models"));
const validateProjectUser_1 = require("../helpers/validateProjectUser"); // Import the validation helper
const getRatingsByProjectId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.body;
        const userId = req.user.id;
        const isProjectValid = yield (0, validateProjectUser_1.validateProjectAndUser)(projectId, userId);
        if (!isProjectValid) {
            res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
            return;
        }
        const projectRatings = yield models_1.default.Rating.findAll({
            where: { projectId },
        });
        const defaultRatings = yield models_1.default.D_Rating.findAll();
        const ratingMap = {};
        defaultRatings.forEach((defaultRating) => {
            ratingMap[defaultRating.ratingCode] = defaultRating;
        });
        projectRatings.forEach((rating) => {
            ratingMap[rating.ratingCode] = rating;
        });
        const mergedRatings = Object.values(ratingMap);
        res.json({ success: true, ratings: mergedRatings });
    }
    catch (error) {
        console.error("Error fetching ratings:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
});
exports.getRatingsByProjectId = getRatingsByProjectId;
const addOrUpdateRatings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, ratings } = req.body;
        const userId = req.user.id;
        const isProjectValid = yield (0, validateProjectUser_1.validateProjectAndUser)(projectId, userId);
        if (!isProjectValid) {
            res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
            return;
        }
        for (const rating of ratings) {
            const { c_rating_code, ratingCode, ratingValue } = rating;
            const existingRating = yield models_1.default.Rating.findOne({
                where: { ratingValue, projectId }
            });
            if (existingRating) {
                existingRating.c_rating_code = c_rating_code;
                yield existingRating.save();
            }
            else {
                yield models_1.default.Rating.create({
                    ratingCode,
                    c_rating_code,
                    ratingValue,
                    projectId,
                });
            }
        }
        res.json({ success: true, message: "Ratings added or updated successfully." });
    }
    catch (error) {
        console.error("Error adding or updating ratings:", error);
        res.json({ success: false, error: "Failed to add or update ratings. Internal server error.", status: 500 });
    }
});
exports.addOrUpdateRatings = addOrUpdateRatings;
