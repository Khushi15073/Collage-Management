
import jwt from "jsonwebtoken";
import UserModel from "../schemas/user.schema";
import { config } from "../config/env.config";

import { TokenModel } from "../schemas/token.schema"
import { AppError } from "../utility/errorClass";

export class authFactory {

  generateTokens(userId: string) {
    const accessTokenExpiry = "15m"
    const refreshTokenExpiry = "7d";
    const    accessToken = jwt.sign(
      { userId },
      config.JWT_SECRET as string,
      { expiresIn: accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
      { userId },
      config.JWT_REFRESH_SECRET as string,
      { expiresIn: refreshTokenExpiry }
    );

    return {
         accessToken,
      accessTokenExpiresIn: accessTokenExpiry,
      refreshToken,
      refreshTokenExpiresIn: refreshTokenExpiry,
    };
  }
  generateAccessToken(userId: string) {
    return jwt.sign(
      { userId },
      config.JWT_SECRET as string,
      { expiresIn: "15m" }
    );
  }

  verifyRefreshToken(token: string) {
    try {
        return jwt.verify(token, config.JWT_REFRESH_SECRET as string);
    } catch (error) {
        throw AppError.unauthorized("Invalid or expired refresh token");
    }
}
  async saveRefreshToken(userId: string, token: string) {
    return TokenModel.create({
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600000),
    });
  }

  async findRefreshToken(token: string) {
    return TokenModel.findOne({ token });
  }

  async updateRefreshToken(oldToken: string, newToken: string) {
    return TokenModel.findOneAndUpdate(
      { token: oldToken },
      { token: newToken }
    );
  }

  async deleteRefreshToken(token: string) {
    return TokenModel.deleteOne({ token });
  }

  async findUserByEmail(email: string) {
    return UserModel
    .findOne({ email })
    .select("+password")   
    .populate("role"); 
  }
}