import { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen, Users, Clock, Calendar } from "lucide-react";

const BASE_URL = "http://localhost:8000";

type StudentCourse = {
  _id: string;
  code: string;
  name: string;
  department: string;
  schedule: string;
  credits: number;
  status: string;
  instructorName: string;
};

type StudentDashboardSummary = {
  counts: {
    enrolledCourses: number;
    totalCredits: number;
  };
  enrolledCourses: StudentCourse[];
};

function MyCourses() {
  const [summary, setSummary] = useState<StudentDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${BASE_URL}/api/dashboard/student`, {
          withCredentials: true,
        });

        if (active) {
          setSummary(response.data?.data || null);
        }
      } catch (requestError: any) {
        if (active) {
          setError(requestError.response?.data?.message || "Failed to fetch courses");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  const courses = summary?.enrolledCourses || [];
  const totalCourses = summary?.counts.enrolledCourses ?? 0;
  const totalCredits = summary?.counts.totalCredits ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="mt-0.5 text-sm text-gray-400">Your enrolled courses from backend data</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Courses</p>
            <p className="text-3xl font-bold text-gray-900">{loading ? "..." : totalCourses}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
            <BookOpen className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Credits</p>
            <p className="text-3xl font-bold text-gray-900">{loading ? "..." : totalCredits}</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-400">
          Loading courses...
        </div>
      )}

      {!loading && courses.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-400">
          You are not enrolled in any course yet.
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {courses.map((course) => (
            <div
              key={course._id}
              className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                    {course.code}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-400">{course.credits} Credits</span>
              </div>

              <h3 className="mb-3 text-base font-bold text-gray-900">{course.name}</h3>

              <div className="mb-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users size={12} className="text-gray-400" />
                  {course.instructorName}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} className="text-gray-400" />
                  {course.schedule}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <BookOpen size={12} className="text-gray-400" />
                  {course.department}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={12} className="text-gray-400" />
                  Status: {course.status}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50">
                  Course Materials
                </button>
                <button className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white transition hover:bg-blue-700">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCourses;
