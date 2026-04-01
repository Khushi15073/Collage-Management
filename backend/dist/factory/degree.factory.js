"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DegreeFactory = void 0;
const degree_schema_1 = require("../schemas/degree.schema");
class DegreeFactory {
    async createDegree(data) {
        return degree_schema_1.DegreeModel.create(data);
    }
    async findAllDegrees() {
        return degree_schema_1.DegreeModel.find()
            .sort({ createdAt: -1, _id: -1 })
            .populate("createdBy", "name email");
    }
    async findDegreeById(id) {
        return degree_schema_1.DegreeModel.findById(id).populate("createdBy", "name email");
    }
    async updateDegreeById(id, data) {
        return degree_schema_1.DegreeModel.findByIdAndUpdate(id, data, { new: true }).populate("createdBy", "name email");
    }
    async deleteDegreeById(id) {
        return degree_schema_1.DegreeModel.findByIdAndDelete(id);
    }
}
exports.DegreeFactory = DegreeFactory;
