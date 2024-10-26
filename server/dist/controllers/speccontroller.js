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
exports.deleteSpec = exports.getSpecById = exports.getAllSpecsByProjectId = exports.updateSpec = exports.createSpec = void 0;
const models_1 = __importDefault(require("../models"));
// Create Spec
const createSpec = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { specName, rating, baseMaterial, projectId } = req.body;
        const userId = req.user.id;
        // Check for active subscription
        const subscription = yield models_1.default.Subscription.findOne({ where: { userId, status: 'active' } });
        if (subscription && subscription.NoofSpecs !== null && subscription.NoofSpecs <= 0) {
            res.json({ success: false, error: "Spec limit reached. Cannot create more specs.", status: 400 });
            return;
        }
        // Find the project the spec should belong to
        const project = yield models_1.default.Project.findOne({ where: { id: projectId, userId, isDeleted: false } });
        if (!project) {
            res.json({ success: false, error: "Project not found or access denied.", status: 404 });
            return;
        }
        // Check if a spec with the same details already exists
        const existingSpec = yield models_1.default.Spec.findOne({
            where: { specName, rating, baseMaterial, isDeleted: false } // Check only non-deleted specs
        });
        if (existingSpec) {
            // If the spec exists and is not deleted, throw an error
            res.json({ success: false, error: "Spec already exists", status: 400 });
            return;
        }
        // Check for a soft-deleted spec
        const softDeletedSpec = yield models_1.default.Spec.findOne({
            where: { specName, rating, baseMaterial, isDeleted: true }
        });
        if (softDeletedSpec) {
            // If a soft-deleted spec is found, update it to restore
            yield softDeletedSpec.update({ isDeleted: false });
            res.json({ success: true, message: "Spec Created successfully.", status: 200, softDeletedSpec });
            return;
        }
        // Create the new spec if no existing spec was found
        const newSpec = yield models_1.default.Spec.create({
            specName,
            rating,
            baseMaterial,
            projectId,
        });
        // Decrease NoofSpecs if it's not null
        if (subscription && subscription.NoofSpecs !== null) {
            yield subscription.update({ NoofSpecs: subscription.NoofSpecs - 1 });
        }
        res.json({ success: true, message: "Spec created successfully.", status: 201, newSpec });
    }
    catch (error) {
        console.error("Error creating spec:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
});
exports.createSpec = createSpec;
// Update Spec
const updateSpec = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { specId, specName, rating, baseMaterial } = req.body;
        const userId = req.user.id;
        // Find the spec, ensuring it belongs to a project owned by the user and is not deleted
        const spec = yield models_1.default.Spec.findOne({
            where: {
                id: specId,
                isDeleted: false,
            },
            include: {
                model: models_1.default.Project,
                as: 'project',
                where: { userId }
            }
        });
        if (!spec) {
            res.json({ success: false, error: "Spec not found or access denied.", status: 404 });
            return;
        }
        // Update spec details
        yield spec.update({ specName, rating, baseMaterial });
        res.json({ success: true, message: "Spec updated successfully.", status: 200, spec });
    }
    catch (error) {
        console.error("Error updating spec:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
});
exports.updateSpec = updateSpec;
// Get All Specs by Project ID
const getAllSpecsByProjectId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;
        // Fetch all specs associated with the project that belongs to the user
        const project = yield models_1.default.Project.findOne({ where: { id: projectId, userId, isDeleted: false } });
        if (!project) {
            res.json({ success: false, error: "Project not found or access denied.", status: 404 });
            return;
        }
        const specs = yield models_1.default.Spec.findAll({ where: { projectId, isDeleted: false } });
        res.json({ success: true, message: "Specs fetched successfully.", status: 200, specs });
    }
    catch (error) {
        console.error("Error fetching specs:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
});
exports.getAllSpecsByProjectId = getAllSpecsByProjectId;
// Get Spec by ID
const getSpecById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { specId } = req.params;
        const userId = req.user.id;
        const spec = yield models_1.default.Spec.findOne({
            where: { id: specId, isDeleted: false },
            include: {
                model: models_1.default.Project,
                as: 'project',
                where: { userId }
            }
        });
        if (!spec) {
            res.json({ success: false, error: "Spec not found or access denied.", status: 404 });
            return;
        }
        res.json({ success: true, message: "Spec fetched successfully.", status: 200, spec });
    }
    catch (error) {
        console.error("Error fetching spec:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
});
exports.getSpecById = getSpecById;
// Delete Spec (Soft Delete)
const deleteSpec = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { specId } = req.body;
        const userId = req.user.id;
        // Find the spec, ensuring it belongs to a project owned by the user and is not deleted
        const spec = yield models_1.default.Spec.findOne({
            where: { id: specId, isDeleted: false },
            include: {
                model: models_1.default.Project,
                as: 'project',
                where: { userId }
            }
        });
        if (!spec) {
            res.json({ success: false, error: "Spec not found or access denied.", status: 404 });
            return;
        }
        const subscription = yield models_1.default.Subscription.findOne({ where: { userId, status: 'active' } });
        // Increase NoofSpecs if it's not null
        if (subscription && subscription.NoofSpecs !== null) {
            yield subscription.update({ NoofSpecs: subscription.NoofSpecs + 1 });
        }
        // Soft delete the spec
        yield spec.update({ isDeleted: true });
        res.json({ success: true, message: "Spec deleted successfully.", status: 200 });
    }
    catch (error) {
        console.error("Error deleting spec:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
});
exports.deleteSpec = deleteSpec;
