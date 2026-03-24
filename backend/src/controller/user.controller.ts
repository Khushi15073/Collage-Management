import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import ResponseHandler from "../utility/responseHandler";
import { ResponseCodes } from "../enums/responseCodes";
import { CreateUserDTO, UpdateUserDTO } from "../interfaces/user.interfaces";
import { IdParam } from "../interfaces/common.interface";

export class UserController {
  private userService = new UserService();

  /* createUser
   Creates a new user account.
   Accepts user data from request body.
   Saves user information in the database.
   Returns created user details.
   Sends 500 error if user creation fails.*/

  async createUser(req: Request<{}, {}, CreateUserDTO>, res: Response) {
    try {
      const userData = req.body;
      const newUser = await this.userService.createUser(userData);
      ResponseHandler.handleResponse(res, newUser);
    } catch (error: any) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred"),
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  // getAllUsers
  // Retrieves all users from the database.
  // Returns a list of all registered users.
  // Sends 500 error if fetching users fails.

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers();
      ResponseHandler.handleResponse(res, users);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred"),
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  // getUser
  // Retrieves a single user by ID.
  // Accepts user ID from request parameters.
  // Returns user details if found.
  // Sends 404 if user does not exist.

  async getUser(req: Request<IdParam>, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);
      if (user) {
       return  ResponseHandler.handleResponse(res, user);
      }
      ResponseHandler.sendResponse(ResponseCodes.NOT_FOUND, "user not found");
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred"),
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  // updateUser
  // Updates an existing user's information.
  // Accepts user ID from request parameters.
  // Accepts updated user data from request body.
  // Returns updated user details.
  // Sends 404 if user is not found.

  async updateUser(
    req: Request<IdParam, {}, UpdateUserDTO>,
    res: Response,

  ) {
    try {
      const userId = req.params.id;
      const updateData = req.body;
      const updatedUser = await this.userService.updateUser(userId, updateData);
      if (updatedUser) {
       return ResponseHandler.handleResponse(res, updatedUser)
      }
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error")
      );
      ResponseHandler.handleResponse(res, errorResponse);

    }
  }
  // deleteUser
  // Deletes a user from the database.
  // Accepts user ID from request parameters.
  // Removes the user record permanently.
  // Returns success message after deletion.
  // Sends 404 if user does not exist.
  async deleteUser(req: Request<IdParam>, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const deleted = await this.userService.deleteUser(userId);
      return ResponseHandler.handleResponse(res, deleted)
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }
}
