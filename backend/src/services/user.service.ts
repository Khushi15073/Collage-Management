import type { IUser } from "../interfaces/user.interfaces";
import { UserFactory } from "../factory/user.factory";
import bcrypt from "bcrypt";
import ResponseHandler, { IResponse } from "../utility/responseHandler";
import { AppError } from "../utility/errorClass";
import { ResponseCodes } from "../enums/responseCodes";
import { CreateUserDTO, UpdateUserDTO } from "../interfaces/user.interfaces";
import { EmailService } from "./email.service";

export class UserService {
  private userFactory = new UserFactory();
  private emailService = new EmailService();

  public async createUser(userData: CreateUserDTO) {
    try {
      if (userData.email === "" || userData.password === "" || userData.name === "") {
        throw AppError.badRequest("Missing required fields");
      }

      const existingUser = await this.userFactory.findUserByEmail(userData.email);
      if (existingUser) {
        throw AppError.conflict("User with this email already exists");
      }

      if (userData.role == null || userData.role === "") {
        const defaultRole = await this.userFactory.getDefaultRole();
        userData.role = defaultRole._id;
      }

      const plainPassword = userData.password;
      const roleName = await this.userFactory.getRoleNameById(String(userData.role));
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
      const user = await this.userFactory.createUser(userData);

      let emailSent = false;
      let emailError: string | null = null;

      try {
        await this.emailService.sendWelcomeCredentialsEmail({
          userName: user.name,
          email: user.email,
          password: plainPassword,
          roleName,
          loginLink: `${process.env.FRONTEND_URL?.trim() || "http://localhost:5173"}/login/${roleName}`,
        });
        emailSent = true;
      } catch (error: any) {
        emailError = error?.message || "Failed to send credentials email";
      }

      return ResponseHandler.sendResponse(
        ResponseCodes.OK,
        emailSent
          ? "User created successfully and credentials emailed"
          : "User created successfully but credentials email could not be sent",
        {
          user,
          emailSent,
          emailError,
        },
      );
    } catch (error) {
      throw error;
    }
  }

  public async getAllUsers(roleName?: string): Promise<IUser[] | IResponse> {
    try {
      const users = await this.userFactory.findAllUsers(roleName);
      if (users == null || users.length === 0) {
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
    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "successfully fetched Users",
      user,
    );
  }

  public async updateUser(userId: string, updateData: UpdateUserDTO) {
    try {
      await this.userFactory.findUserById(userId);

      if (updateData.email != null && updateData.email !== "") {
        const existingUser = await this.userFactory.findUserByEmail(updateData.email);
        if (existingUser && existingUser._id.toString() !== userId) {
          throw AppError.conflict("User with this email already exists");
        }
      }

      if (updateData.password != null && updateData.password !== "") {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

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

      if (user == null) {
        throw AppError.notFound("User Not Found");
      }
      const result = await this.userFactory.deleteUser(userId);

      return ResponseHandler.sendResponse(
        ResponseCodes.OK,
        "Successfully deleted",
        result
      );
    } catch (error) {
      throw error;
    }
  }
}
