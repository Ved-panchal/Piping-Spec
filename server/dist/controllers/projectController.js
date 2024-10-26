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
exports.deleteProject = exports.getAllProjectsByUserId = exports.getProjectByCode = exports.updateProject = exports.createProject = void 0;
const models_1 = __importDefault(require("../models"));
// Create Project
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectCode, projectDescription, companyName } = req.body;
        const userId = req.user.id;
        const subscription = yield models_1.default.Subscription.findOne({ where: { userId, status: 'active' } });
        // Check if NoofProjects is null (unlimited) or if NoofProjects is greater than 0
        if (subscription && subscription.NoofProjects !== null && subscription.NoofProjects <= 0) {
            res.json({ success: false, error: "Project limit reached. Cannot create more projects.", status: 400 });
            return;
        }
        const project = yield models_1.default.Project.findOne({ where: { projectCode, userId } });
        if (project) {
            if (project.isDeleted) {
                yield project.update({
                    projectDescription,
                    companyName,
                    isDeleted: false,
                });
                res.json({ success: true, message: "Project Created Successfully.", status: 200, project });
                return;
            }
            else {
                res.json({ success: false, error: "Project with the same code already exists.", status: 400 });
                return;
            }
        }
        const newProject = yield models_1.default.Project.create({
            projectCode,
            projectDescription,
            companyName,
            userId,
        });
        // Decrease NoofProjects if it is not null
        if (subscription && subscription.NoofProjects !== null) {
            yield subscription.update({ NoofProjects: subscription.NoofProjects - 1 });
        }
        res.json({ success: true, message: "Project Created Successfully.", status: 201, newProject });
    }
    catch (error) {
        console.error("Error creating project:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
});
exports.createProject = createProject;
// Update Project
const updateProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectCode, projectDescription, companyName } = req.body;
        const userId = req.user.id;
        const project = yield models_1.default.Project.findOne({ where: { projectCode, userId, isDeleted: false } });
        if (!project) {
            res.json({ success: false, error: "Project not found or access denied.", status: 404 });
            return;
        }
        yield project.update({ projectDescription, companyName });
        res.json({ success: true, message: "Project Updated Successfully.", status: 200, project });
    }
    catch (error) {
        console.error("Error updating project:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
});
exports.updateProject = updateProject;
// Get Project by Code
const getProjectByCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectCode } = req.params;
        const userId = req.user.id;
        const project = yield models_1.default.Project.findOne({ where: { projectCode, userId, isDeleted: false } });
        if (!project) {
            res.json({ success: false, error: "Project not found or access denied.", status: 404 });
            return;
        }
        res.json({ success: true, message: "Project fetched successfully.", status: 200, project });
    }
    catch (error) {
        console.error("Error fetching project:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
});
exports.getProjectByCode = getProjectByCode;
// Get All Projects by User ID
const getAllProjectsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Fetch all projects associated with the user ID that are not marked as deleted
        const projects = yield models_1.default.Project.findAll({ where: { userId, isDeleted: false } });
        res.json({ success: true, message: "Projects fetched successfully.", status: 200, projects });
    }
    catch (error) {
        console.error("Error fetching projects:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
});
exports.getAllProjectsByUserId = getAllProjectsByUserId;
// Delete Project (Soft Delete)
const deleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectCode } = req.body;
        const userId = req.user.id;
        const project = yield models_1.default.Project.findOne({ where: { projectCode, userId, isDeleted: false } });
        if (!project) {
            res.json({ success: false, error: "Project not found or access denied.", status: 404 });
            return;
        }
        const subscription = yield models_1.default.Subscription.findOne({ where: { userId, status: 'active' } });
        // Increase NoofProjects if it is not null
        if (subscription && subscription.NoofProjects !== null) {
            yield subscription.update({ NoofProjects: subscription.NoofProjects + 1 });
        }
        yield project.update({ isDeleted: true });
        res.json({ success: true, message: "Project deleted successfully.", status: 200 });
    }
    catch (error) {
        console.error("Error deleting project:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
});
exports.deleteProject = deleteProject;
