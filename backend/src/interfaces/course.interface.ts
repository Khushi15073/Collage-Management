// ✅ Used when creating a new course
export interface CreateCourseDTO {
  code:       string;
  name:       string;
  schedule:   string;
  department: string;
  instructor: string;  // faculty userId
  students?:  string[];
  credits:    number;
  enrolled?:  number;
  total:      number;
  status?:    string;
}

// ✅ Used when updating a course — all fields optional
export interface UpdateCourseDTO {
  code?:       string;
  name?:       string;
  schedule?:   string;
  department?: string;
  instructor?: string;
  students?:   string[];
  credits?:    number;
  total?:      number;
  enrolled?:   number;
  status?:     string;
}
