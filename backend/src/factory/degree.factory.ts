import { DegreeModel } from "../schemas/degree.schema";
import type { CreateDegreeDTO, UpdateDegreeDTO } from "../interfaces/degree.interface";

export class DegreeFactory {
  async createDegree(data: CreateDegreeDTO & { createdBy: string }) {
    return DegreeModel.create(data);
  }

  async findAllDegrees() {
    return DegreeModel.find()
      .sort({ createdAt: -1, _id: -1 })
      .populate("createdBy", "name email");
  }

  async findDegreeById(id: string) {
    return DegreeModel.findById(id).populate("createdBy", "name email");
  }

  async updateDegreeById(id: string, data: UpdateDegreeDTO) {
    return DegreeModel.findByIdAndUpdate(id, data, { new: true }).populate(
      "createdBy",
      "name email"
    );
  }

  async deleteDegreeById(id: string) {
    return DegreeModel.findByIdAndDelete(id);
  }
}
