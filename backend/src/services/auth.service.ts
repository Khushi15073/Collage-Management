
import bcrypt from "bcrypt";
import { AppError } from "../utility/errorClass";
import { authFactory } from "../factory/auth.factory";
import ResponseHandler from "../utility/responseHandler";
import { ResponseCodes } from "../enums/responseCodes";

export class authService {
  private authFactory = new authFactory();

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      throw AppError.badRequest("Please enter a valid email address");
    }

    const user = await this.authFactory.findUserByEmail(normalizedEmail);

    if (!user) {
      throw AppError.unauthorized("Email address is not registered");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw AppError.unauthorized("Incorrect password");
    }

    const tokens = this.authFactory.generateTokens(user._id.toString());


    await this.authFactory.saveRefreshToken(
      user._id.toString(),
      tokens.refreshToken
    );
    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Login successful",
      {
        user,
        ...tokens
      }
    )
  }

  async refreshToken(oldToken: string) {
    if (!oldToken) {
      throw AppError.unauthorized("Refresh token missing");
    }

    const decoded: any =
      this.authFactory.verifyRefreshToken(oldToken);

    const tokenInDb = await this.authFactory.findRefreshToken(oldToken);

    if (!tokenInDb) {
      throw AppError.forbidden("Invalid refresh token");
    }


    const accessToken = this.authFactory.generateAccessToken(decoded.userId);

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "success",
      {
        accessToken,
        refreshToken: oldToken
      }
    );
  }

  async getCurrentUser(userId: string) {
    if (!userId) {
      throw AppError.unauthorized("Unauthorized");
    }

    const user = await this.authFactory.findUserById(userId);
    if (!user) {
      throw AppError.unauthorized("Unauthorized");
    }

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Current user fetched successfully",
      { user }
    );
  }

  async logout(refreshToken: string) {
    await this.authFactory.deleteRefreshToken(refreshToken);
  }
}
