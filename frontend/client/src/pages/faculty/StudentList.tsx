import { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Phone } from "lucide-react";

const BASE_URL = "http://localhost:8000";

type FacultyStudentCourse = {
  _id: string;
  code: string;
  name: string;
};

type FacultyStudent = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: string;
  courses: FacultyStudentCourse[];
};

type FacultyStudentsResponse = {
  totalStudents: number;
  courses: FacultyStudentCourse[];
  students: FacultyStudent[];
};

function StudentList() {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [data, setData] = useState<FacultyStudentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadStudents() {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${BASE_URL}/api/dashboard/faculty/students`, {
          withCredentials: true,
        });

        if (active) {
          setData(response.data?.data || null);
        }
      } catch (requestError: any) {
        if (active) {
          setError(requestError.response?.data?.message || "Failed to fetch faculty students");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      active = false;
    };
  }, []);

  const courses = ["All Courses", ...(data?.courses.map((course) => course.code) || [])];
  const students = data?.students || [];

  const filteredStudents = students.filter((student) => {
    const normalizedSearch = search.toLowerCase();
    const matchesSearch =
      student.name.toLowerCase().includes(normalizedSearch) ||
      student.email.toLowerCase().includes(normalizedSearch) ||
      student.phoneNumber.includes(search);

    const matchesCourse =
      courseFilter === "All Courses" ||
      student.courses.some((course) => course.code === courseFilter);

    return matchesSearch && matchesCourse;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student List</h1>
        <p className="mt-1 text-gray-400">Students assigned to your courses</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-base font-semibold text-gray-800">All Students</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-56"
            />
            <select
              value={courseFilter}
              onChange={(event) => setCourseFilter(event.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {courses.map((course) => (
                <option key={course}>{course}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Assigned Courses</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">
                    Loading students...
                  </td>
                </tr>
              )}

              {!loading &&
                filteredStudents.map((student) => (
                  <tr key={student._id} className="border-b border-gray-50 transition hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-700">{student.name}</td>
                    <td className="px-6 py-4">
                      <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail size={11} className="text-gray-400" />
                        {student.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone size={11} className="text-gray-400" />
                        {student.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-600">{student.gender}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {student.courses.map((course) => (
                          <span
                            key={`${student._id}-${course._id}`}
                            className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white"
                          >
                            {course.code}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
          Showing {filteredStudents.length} of {data?.totalStudents ?? 0} students
        </div>
      </div>
    </div>
  );
}

export default StudentList;
