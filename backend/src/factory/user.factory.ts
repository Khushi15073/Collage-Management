import { CreateUserDTO, UpdateUserDTO } from "../interfaces/user.interfaces";
import UserModel from "../schemas/user.schema";
import { AppError } from "../utility/errorClass";
import { RoleModel } from "../schemas/role.schema";

export class UserFactory {
  public async createUser(userData: CreateUserDTO) {
    try {
      const user = new UserModel(userData);
      await user.save();
      return await user.populate("role");
    } catch (error) {
      throw error;
    }
  }

  public async getDefaultRole() {
    try {
      const role = await RoleModel.findOne({ name: "student" });
      if (!role) {
        throw AppError.notFound("Default role not found — run roleSeeder first");
      }
      return role;
    } catch (error) {
      throw error;
    }
  }

  public async getRoleNameById(roleId: string) {
    const role = await RoleModel.findById(roleId).select("name");
    if (!role) {
      throw AppError.notFound("Role not found");
    }

    return role.name;
  }

  public async findAllUsers(roleName?: string) {
    try {
      let filter = {};

      if (roleName) {
        const role = await RoleModel.findOne({ name: roleName });
        if (!role) {
          throw AppError.notFound("Role not found");
        }

        filter = { role: role._id };
      }

      const users = await UserModel.find(filter).populate("role");
      if (users.length === 0) {
        throw AppError.notFound("No users found");
      }
      return users;
    } catch (error) {
      throw error;
    }
  }

  public async findUserByEmail(email: string) {
    try {
      const user = await UserModel.findOne({ email });
      return user;
    } catch (error) {
      throw error;
    }
  }

  public async findUserById(userId: string) {
    try {
      const user = await UserModel.findById(userId).populate("role");
      if (!user) {
        throw AppError.notFound("User not found");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  public async updateUser(userId: string, updateData: UpdateUserDTO) {
    try {
      const user = await UserModel.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).populate("role");

      if (!user) {
        throw AppError.notFound("User not found");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  public async deleteUser(userId: string) {
    try {
      const user = await UserModel.findByIdAndDelete(userId).populate("role");
      if (!user) {
        throw AppError.notFound("User not found");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}
