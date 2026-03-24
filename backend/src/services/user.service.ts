// import type { IUser } from "../schemas/user.schema";
import type { IUser } from "../interfaces/user.interfaces";
import { UserFactory } from "../factory/user.factory";
import bcrypt from "bcrypt";
import ResponseHandler, { IResponse } from "../utility/responseHandler";

import { AppError } from "../utility/errorClass";
import { ResponseCodes } from "../enums/responseCodes";
import { CreateUserDTO, UpdateUserDTO } from "../interfaces/user.interfaces";

export class UserService {
  private userFactory = new UserFactory();

  public async createUser(userData: CreateUserDTO) {
    try {
      if (!userData.email || !userData.password || !userData.name) {

        throw AppError.badRequest("Missing required fields");
      }

      await this.userFactory.findUserByEmail(userData.email);

        const defaultRole = await this.userFactory.getDefaultRole();
        userData.role = defaultRole._id;

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
      const user = await this.userFactory.createUser(userData);

      return ResponseHandler.sendResponse(
        ResponseCodes.OK,
        "User created successfully",
        user,
      );

    } catch (error) {
      throw error;
    }
  }

  public async getAllUsers(): Promise<IUser[] | IResponse> {
    try {
      const users = await this.userFactory.findAllUsers();
      if (!users || users.length === 0) {
        throw AppError.notFound("no users");
      }

      return ResponseHandler.sendResponse(
        ResponseCodes.OK,
        "User fetched successfully",
        users,
      );
    } catch (error) {
      throw error;
    }
  }

  public async getUserById(userId: string) {
    const user = await this.userFactory.findUserById(userId);
    // return user;
    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "successfully fetched Users",
      user,
    );
  }

  public async updateUser(userId: string, updateData: UpdateUserDTO) {
    try {
      await this.userFactory.findUserById(userId);

      const updatedUser = await this.userFactory.updateUser(userId, updateData);
      return ResponseHandler.sendResponse(
        ResponseCodes.OK,
        "User updated successfully",
        updatedUser,
      );
    } catch (error) {
      throw error;
    }
  }

  public async deleteUser(userId: string) {
    try {
      const user = await this.userFactory.findUserById(userId);

      if (!user) {
        throw AppError.notFound("User Not Found");
      }
      const result = await this.userFactory.deleteUser(userId);

      return ResponseHandler.sendResponse(
        ResponseCodes.OK,
        "Successfully deleted",
        result);

    } catch (error) {
      throw error
    }

  }
}
