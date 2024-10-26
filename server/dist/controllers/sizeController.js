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
exports.addOrUpdateSizes = exports.getSizesByProjectId = void 0;
const validateProjectUser_1 = require("../helpers/validateProjectUser");
const models_1 = __importDefault(require("../models"));
// Get Sizes by ProjectId
const getSizesByProjectId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.body;
        const userId = req.user.id;
        // Validate project and user
        const isProjectValid = yield (0, validateProjectUser_1.validateProjectAndUser)(projectId, userId);
        if (!isProjectValid) {
            res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
            return;
        }
        // Fetch project-specific sizes
        const projectSizes = yield models_1.default.Size.findAll({
            where: { projectId },
        });
        // Fetch default sizes
        const defaultSizes = yield models_1.default.D_Size.findAll();
        // Merge default sizes with project-specific sizes
        const sizeMap = {};
        // Add default sizes to the map
        defaultSizes.forEach((defaultSize) => {
            sizeMap[defaultSize.code] = defaultSize;
        });
        // Override defaults with project-specific sizes
        projectSizes.forEach((size) => {
            sizeMap[size.code] = size;
        });
        // Convert the map back to an array
        const mergedSizes = Object.values(sizeMap);
        res.json({ success: true, sizes: mergedSizes });
    }
    catch (error) {
        console.error("Error fetching sizes:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
});
exports.getSizesByProjectId = getSizesByProjectId;
// Add or Update Sizes
const addOrUpdateSizes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, size1_size2, code, c_code, size_inch, size_mm, od } = req.body;
        const userId = req.user.id;
        // Validate project and user
        const isProjectValid = yield (0, validateProjectUser_1.validateProjectAndUser)(projectId, userId);
        if (!isProjectValid) {
            res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
            return;
        }
        const existingSize = yield models_1.default.Size.findOne({
            where: { size1_size2, projectId },
        });
        if (existingSize) {
            if (existingSize.c_code !== c_code ||
                existingSize.size_inch !== size_inch ||
                existingSize.size_mm !== size_mm ||
                existingSize.od !== od) {
                existingSize.c_code = c_code;
                existingSize.size_inch = size_inch;
                existingSize.size_mm = size_mm;
                existingSize.od = od;
                yield existingSize.save();
                res.json({ success: true, message: "Size updated successfully." });
            }
            else {
                res.json({ success: false, message: "No changes detected, no update needed." });
            }
        }
        else {
            // Create new size record
            yield models_1.default.Size.create({
                size1_size2,
                code,
                c_code,
                size_inch,
                size_mm,
                od,
                projectId,
            });
            res.json({ success: true, message: "Size added successfully." });
        }
    }
    catch (error) {
        console.error("Error adding or updating size:", error);
        res.json({ success: false, error: "Failed to add or update size. Internal server error.", status: 500 });
    }
});
exports.addOrUpdateSizes = addOrUpdateSizes;
