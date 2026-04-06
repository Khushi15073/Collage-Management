"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_factory_1 = require("../factory/user.factory");
const bcrypt_1 = __importDefault(require("bcrypt"));
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
const errorClass_1 = require("../utility/errorClass");
const responseCodes_1 = require("../enums/responseCodes");
const email_service_1 = require("./email.service");
const degree_factory_1 = require("../factory/degree.factory");
const course_factory_1 = require("../factory/course.factory");
class UserService {
    constructor() {
        this.userFactory = new user_factory_1.UserFactory();
        this.emailService = new email_service_1.EmailService();
        this.degreeFactory = new degree_factory_1.DegreeFactory();
        this.courseFactory = new course_factory_1.CourseFactory();
    }
    getAllowedEnrollmentYears() {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 10 }, (_, index) => currentYear - index);
    }
    normalizeEnrollmentDate(enrollmentDate) {
        if (!enrollmentDate) {
            throw errorClass_1.AppError.badRequest("Enrollment date is required for students");
        }
        const normalizedDate = new Date(enrollmentDate);
        if (Number.isNaN(normalizedDate.getTime())) {
            throw errorClass_1.AppError.badRequest("Enrollment date is invalid");
        }
        return normalizedDate;
    }
    ensureValidEnrollmentYear(enrollmentYear) {
        if (enrollmentYear == null) {
            throw errorClass_1.AppError.badRequest("Enrollment year is required for students");
        }
        if (!this.getAllowedEnrollmentYears().includes(Number(enrollmentYear))) {
            throw errorClass_1.AppError.badRequest("Enrollment year must come from the backend-provided options");
        }
    }
    buildBatchName(degreeName, enrollmentYear) {
        return `${degreeName} ${enrollmentYear}`;
    }
    async createUser(userData) {
        var _a;
        try {
            if (userData.email === "" || userData.password === "" || userData.name === "") {
                throw errorClass_1.AppError.badRequest("Missing required fields");
            }
            const existingUser = await this.userFactory.findUserByEmail(userData.email);
            if (existingUser) {
                throw errorClass_1.AppError.conflict("User with this email already exists");
            }
            if (userData.role == null || userData.role === "") {
                const defaultRole = await this.userFactory.getDefaultRole();
                userData.role = defaultRole._id;
            }
            if (userData.degree === "") {
                userData.degree = undefined;
            }
            const plainPassword = userData.password;
            const roleName = await this.userFactory.getRoleNameById(String(userData.role));
            if (roleName === "student") {
                if (!userData.degree) {
                    throw errorClass_1.AppError.badRequest("Degree is required for students");
                }
                const degree = await this.degreeFactory.findDegreeById(String(userData.degree));
                if (!degree) {
                    throw errorClass_1.AppError.notFound("Degree not found");
                }
                const enrollmentDate = this.normalizeEnrollmentDate(userData.enrollmentDate);
                const enrollmentYear = enrollmentDate.getFullYear();
                this.ensureValidEnrollmentYear(enrollmentYear);
                userData.enrollmentDate = enrollmentDate.toISOString();
                userData.enrollmentYear = enrollmentYear;
                userData.batch = this.buildBatchName(degree.degreeName, enrollmentYear);
            }
            else {
                userData.degree = undefined;
                userData.batch = undefined;
                userData.enrollmentYear = undefined;
                userData.enrollmentDate = undefined;
            }
            const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
            userData.password = hashedPassword;
            const user = await this.userFactory.createUser(userData);
            if (roleName === "student" && user.degree) {
                await this.courseFactory.assignStudentToDegreeCourses(String(user.degree._id || user.degree), String(user._id));
            }
            let emailSent = false;
            let emailError = null;
            try {
                await this.emailService.sendWelcomeCredentialsEmail({
                    userName: user.name,
                    email: user.email,
                    password: plainPassword,
                    roleName,
                    loginLink: `${((_a = process.env.FRONTEND_URL) === null || _a === void 0 ? void 0 : _a.trim()) || "http://localhost:5173"}/login/${roleName}`,
                });
                emailSent = true;
            }
            catch (error) {
                emailError = (error === null || error === void 0 ? void 0 : error.message) || "Failed to send credentials email";
            }
            return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, emailSent
                ? "User created successfully and credentials emailed"
                : "User created successfully but credentials email could not be sent", {
                user,
                emailSent,
                emailError,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async getAllUsers(options) {
        var _a, _b, _c;
        try {
            let roleId;
            if (options === null || options === void 0 ? void 0 : options.roleName) {
                roleId = String(await this.userFactory.findRoleIdByName(options.roleName));
            }
            const page = (_a = options === null || options === void 0 ? void 0 : options.page) !== null && _a !== void 0 ? _a : 1;
            const limit = (_b = options === null || options === void 0 ? void 0 : options.limit) !== null && _b !== void 0 ? _b : 10;
            const skip = (_c = options === null || options === void 0 ? void 0 : options.skip) !== null && _c !== void 0 ? _c : 0;
            const { users, totalItems } = await this.userFactory.findAllUsers({
                roleId,
                search: options === null || options === void 0 ? void 0 : options.search,
                skip,
                limit,
            });
            const pagination = {
                page,
                limit,
                totalItems,
                totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / limit),
            };
            return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "User fetched successfully", {
                items: users,
                pagination,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async getUserById(userId) {
        const user = await this.userFactory.findUserById(userId);
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "successfully fetched Users", user);
    }
    async updateUser(userId, updateData) {
        var _a, _b;
        try {
            const existingUser = await this.userFactory.findUserById(userId);
            if (updateData.email != null && updateData.email !== "") {
                const userWithEmail = await this.userFactory.findUserByEmail(updateData.email);
                if (userWithEmail && userWithEmail._id.toString() !== userId) {
                    throw errorClass_1.AppError.conflict("User with this email already exists");
                }
            }
            if (updateData.password != null && updateData.password !== "") {
                updateData.password = await bcrypt_1.default.hash(updateData.password, 10);
            }
            if (updateData.degree === "") {
                updateData.degree = null;
            }
            const nextRoleId = (_a = updateData.role) !== null && _a !== void 0 ? _a : String(((_b = existingUser.role) === null || _b === void 0 ? void 0 : _b._id) || existingUser.role);
            const nextRoleName = await this.userFactory.getRoleNameById(String(nextRoleId));
            const previousDegreeId = existingUser.degree ? String(existingUser.degree._id || existingUser.degree) : null;
            const nextDegreeId = updateData.degree !== undefined
                ? (updateData.degree ? String(updateData.degree) : null)
                : previousDegreeId;
            if (nextRoleName === "student") {
                if (!nextDegreeId) {
                    throw errorClass_1.AppError.badRequest("Degree is required for students");
                }
                const degree = await this.degreeFactory.findDegreeById(nextDegreeId);
                if (!degree) {
                    throw errorClass_1.AppError.notFound("Degree not found");
                }
                const nextEnrollmentDateRaw = updateData.enrollmentDate !== undefined
                    ? updateData.enrollmentDate
                    : (existingUser.enrollmentDate
                        ? new Date(existingUser.enrollmentDate).toISOString()
                        : null);
                const nextEnrollmentDate = this.normalizeEnrollmentDate(nextEnrollmentDateRaw);
                const nextEnrollmentYear = nextEnrollmentDate.getFullYear();
                this.ensureValidEnrollmentYear(nextEnrollmentYear);
                updateData.enrollmentDate = nextEnrollmentDate.toISOString();
                updateData.enrollmentYear = nextEnrollmentYear;
                updateData.batch = this.buildBatchName(degree.degreeName, nextEnrollmentYear);
            }
            else {
                updateData.degree = null;
                updateData.batch = null;
                updateData.enrollmentYear = null;
                updateData.enrollmentDate = null;
            }
            const updatedUser = await this.userFactory.updateUser(userId, updateData);
            if (previousDegreeId && previousDegreeId !== nextDegreeId) {
                await this.courseFactory.removeStudentFromDegreeCourses(previousDegreeId, userId);
            }
            if (nextRoleName === "student" && nextDegreeId) {
                await this.courseFactory.assignStudentToDegreeCourses(nextDegreeId, userId);
            }
            return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "User updated successfully", updatedUser);
        }
        catch (error) {
            throw error;
        }
    }
    async deleteUser(userId) {
        try {
            const user = await this.userFactory.findUserById(userId);
            if (user == null) {
                throw errorClass_1.AppError.notFound("User Not Found");
            }
            await this.courseFactory.removeStudentFromAllCourses(userId);
            const result = await this.userFactory.deleteUser(userId);
            return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Successfully deleted", result);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.UserService = UserService;
