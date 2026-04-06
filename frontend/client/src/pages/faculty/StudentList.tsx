import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Mail, Phone } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import PaginationControls from "../../components/ui/PaginationControls";
import { usePagination } from "../../hooks/usePagination";
import { matchesSearchQuery } from "../../utils/search";
import SearchField from "../../components/ui/SearchField";

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
  students: FacultyStudent[];
};

function StudentList() {
  const [searchQuery, setSearchQuery] = useState("");
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

  const students = data?.students || [];

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const values = [
        student.name,
        student.email,
        student.phoneNumber,
        student.gender,
        ...student.courses.flatMap((course) => [course.code, course.name]),
      ];

      return matchesSearchQuery(values, searchQuery);
    });
  }, [searchQuery, students]);
  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    paginatedItems: paginatedStudents,
    canPreviousPage,
    canNextPage,
    setPage,
    nextPage,
    previousPage,
  } = usePagination(filteredStudents, 8);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student List</h1>
        <p className="mt-1 text-gray-400">Students assigned to your courses</p>
      </div>

      <div className="mb-5 max-w-md">
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search students..."
        />
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">All Students</h2>
        </div>

        <TableContainer className="min-h-0 flex-1 overflow-auto">
          <Table>
            <TableHead>
              <TableRow className="border-b border-gray-100">
                <TableHeader>Name</TableHeader>
                <TableHeader>Contact</TableHeader>
                <TableHeader>Gender</TableHeader>
                <TableHeader>Assigned Courses</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-sm text-gray-400">
                    Loading students...
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                paginatedStudents.map((student) => (
                  <TableRow key={student._id} className="border-b border-gray-50 transition hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-700">{student.name}</TableCell>
                    <TableCell>
                      <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail size={11} className="text-gray-400" />
                        {student.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone size={11} className="text-gray-400" />
                        {student.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-gray-600">{student.gender}</TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && paginatedStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-sm text-gray-400">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
          itemLabel="students"
          onPageChange={setPage}
          onPrevious={previousPage}
          onNext={nextPage}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
        />
      </div>
    </div>
  );
}

export default StudentList;
