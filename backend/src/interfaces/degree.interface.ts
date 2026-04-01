import mongoose from "mongoose";

export type DegreeType = "semester" | "year";

export interface IDegreeCourse {
  name: string;
  code: string;
}

export interface IDegreeSection {
  key: string;
  label: string;
  courses: IDegreeCourse[];
}

export interface IDegree {
  _id: mongoose.Types.ObjectId;
  degreeName: string;
  department: string;
  type: DegreeType;
  count: number;
  sections: IDegreeSection[];
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateDegreeDTO {
  degreeName: string;
  department: string;
  type: DegreeType;
  count: number;
  sections: IDegreeSection[];
}

export interface UpdateDegreeDTO {
  degreeName?: string;
  department?: string;
  type?: DegreeType;
  count?: number;
  sections?: IDegreeSection[];
}
