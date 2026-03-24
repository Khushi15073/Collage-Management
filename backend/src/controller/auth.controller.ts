
import { Request, Response } from "express"
import { authService } from "../services/auth.service";
import ResponseHandler from "../utility/responseHandler"
import { LoginDTO } from "../interfaces/user.interfaces";

export class authController {

  private authService = new authService();

  async login(req: Request<{}, {}, LoginDTO>, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      res.cookie("accessToken", result.data.accessToken, {
        httpOnly: true,
        secure: false,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", result.data.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: 7 * 24 * 3600000,
      });


      ResponseHandler.handleResponse(res, result)

    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error('Unknown error occurred')
      )
      ResponseHandler.handleResponse(res, errorResponse)
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const oldToken = req.cookies.refreshToken;

      const result = await this.authService.refreshToken(oldToken);


      res.cookie("accessToken", result.data.accessToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshtoken", result.data.refreshtoken, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });



      ResponseHandler.handleResponse(res, result);

    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error('Unknown error occurred')
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const token = req.cookies.refreshToken;

      if (token) {
        await this.authService.logout(token);
      }

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.status(200).json({ message: "Logout successful" });

    } catch (error) {
      throw error;
    }
  }

}

