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
exports.addOrUpdateSchedules = exports.getSchedulesByProjectId = void 0;
const models_1 = __importDefault(require("../models"));
const validateProjectUser_1 = require("../helpers/validateProjectUser");
const getSchedulesByProjectId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.body;
        const userId = req.user.id;
        const isProjectValid = yield (0, validateProjectUser_1.validateProjectAndUser)(projectId, userId);
        if (!isProjectValid) {
            res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
            return;
        }
        const projectSchedules = yield models_1.default.Schedule.findAll({
            where: { projectId },
        });
        const defaultSchedules = yield models_1.default.D_Schedule.findAll();
        const scheduleMap = {};
        defaultSchedules.forEach((defaultSchedule) => {
            scheduleMap[defaultSchedule.code] = defaultSchedule;
        });
        projectSchedules.forEach((schedule) => {
            scheduleMap[schedule.code] = schedule;
        });
        const mergedSchedules = Object.values(scheduleMap);
        res.json({ success: true, schedules: mergedSchedules });
    }
    catch (error) {
        console.error("Error fetching schedules:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
});
exports.getSchedulesByProjectId = getSchedulesByProjectId;
// Add or Update schedules with user validation
const addOrUpdateSchedules = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId, schedules } = req.body;
        const userId = req.user.id;
        const isProjectValid = yield (0, validateProjectUser_1.validateProjectAndUser)(projectId, userId);
        if (!isProjectValid) {
            res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
            return;
        }
        for (const schedule of schedules) {
            const { sch1_sch2, code, c_code, schDesc } = schedule;
            const existingSchedule = yield models_1.default.Schedule.findOne({
                where: { sch1_sch2, projectId }
            });
            if (existingSchedule) {
                if (existingSchedule.c_code !== c_code || existingSchedule.schDesc !== schDesc) {
                    existingSchedule.c_code = c_code;
                    existingSchedule.schDesc = schDesc;
                    yield existingSchedule.save();
                    res.json({ success: true, message: `Schedule ${sch1_sch2} updated successfully.` });
                }
                else {
                    res.json({ success: false, message: `No changes detected for schedule ${sch1_sch2}.` });
                }
            }
            else {
                yield models_1.default.Schedule.create({
                    sch1_sch2,
                    code,
                    c_code,
                    schDesc,
                    projectId,
                });
                res.json({ success: true, message: `Schedule ${sch1_sch2} added successfully.` });
            }
        }
    }
    catch (error) {
        console.error("Error adding or updating schedules:", error);
        res.json({ success: false, error: "Failed to add or update schedules. Internal server error.", status: 500 });
    }
});
exports.addOrUpdateSchedules = addOrUpdateSchedules;
