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

  public async findRoleIdByName(roleName: string) {
    const role = await RoleModel.findOne({ name: roleName });
    if (!role) {
      throw AppError.notFound("Role not found");
    }

    return role._id;
  }

  public async findAllUsers(options?: {
    roleId?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }) {
    try {
      const filter: Record<string, any> = {};

      if (options?.roleId) {
        filter.role = options.roleId;
      }

      const normalizedSearch = options?.search?.trim();
      if (normalizedSearch) {
        filter.$or = [
          { name: { $regex: normalizedSearch, $options: "i" } },
          { email: { $regex: normalizedSearch, $options: "i" } },
          { phoneNumber: { $regex: normalizedSearch, $options: "i" } },
          { gender: { $regex: normalizedSearch, $options: "i" } },
        ];
      }

      const skip = options?.skip ?? 0;
      const limit = options?.limit ?? 10;

      const [users, totalItems] = await Promise.all([
        UserModel.find(filter)
          .sort({ createdAt: -1, _id: -1 })
          .skip(skip)
          .limit(limit)
          .populate("role"),
        UserModel.countDocuments(filter),
      ]);

      return { users, totalItems };
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
