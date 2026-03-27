"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
const responseCodes_1 = require("../enums/responseCodes");
class UserController {
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    /* createUser
     Creates a new user account.
     Accepts user data from request body.
     Saves user information in the database.
     Returns created user details.
     Sends 500 error if user creation fails.*/
    async createUser(req, res) {
        try {
            const userData = req.body;
            const newUser = await this.userService.createUser(userData);
            responseHandler_1.default.handleResponse(res, newUser);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    // getAllUsers
    // Retrieves all users from the database.
    // Returns a list of all registered users.
    // Sends 500 error if fetching users fails.
    async getAllUsers(req, res) {
        try {
            const roleName = typeof req.query.role === "string" ? req.query.role : undefined;
            const users = await this.userService.getAllUsers(roleName);
            responseHandler_1.default.handleResponse(res, users);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    // getUser
    // Retrieves a single user by ID.
    // Accepts user ID from request parameters.
    // Returns user details if found.
    // Sends 404 if user does not exist.
    async getUser(req, res) {
        try {
            const userId = req.params.id;
            const user = await this.userService.getUserById(userId);
            if (user) {
                return responseHandler_1.default.handleResponse(res, user);
            }
            responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.NOT_FOUND, "user not found");
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    // updateUser
    // Updates an existing user's information.
    // Accepts user ID from request parameters.
    // Accepts updated user data from request body.
    // Returns updated user details.
    // Sends 404 if user is not found.
    async updateUser(req, res) {
        try {
            const userId = req.params.id;
            const updateData = req.body;
            const updatedUser = await this.userService.updateUser(userId, updateData);
            if (updatedUser) {
                return responseHandler_1.default.handleResponse(res, updatedUser);
            }
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    // deleteUser
    // Deletes a user from the database.
    // Accepts user ID from request parameters.
    // Removes the user record permanently.
    // Returns success message after deletion.
    // Sends 404 if user does not exist.
    async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            const deleted = await this.userService.deleteUser(userId);
            return responseHandler_1.default.handleResponse(res, deleted);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
}
exports.UserController = UserController;
