import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PaginationControls from "../../components/ui/PaginationControls";
import { usePagination } from "../../hooks/usePagination";
import { useDashboardSearch } from "../../context/DashboardSearchContext";
import { matchesSearchQuery } from "../../utils/search";

const BASE_URL = "http://localhost:8000";

type FacultyCourse = {
  _id: string;
  code: string;
  name: string;
  department: string;
  status: "Active" | "Inactive" | "Full";
  enrolled: number;
  total: number;
};

type FacultyDashboardSummary = {
  courses: FacultyCourse[];
};

function MyClasses() {
  const navigate = useNavigate();
  const { searchQuery } = useDashboardSearch();
  const [classes, setClasses] = useState<FacultyCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadClasses() {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${BASE_URL}/api/dashboard/faculty`, {
          withCredentials: true,
        });

        if (active) {
          const summary: FacultyDashboardSummary | null = response.data?.data || null;
          setClasses(summary?.courses || []);
        }
      } catch (requestError: any) {
        if (active) {
          setError(requestError.response?.data?.message || "Failed to fetch classes");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadClasses();

    return () => {
      active = false;
    };
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) =>
      matchesSearchQuery(
        [cls.code, cls.name, cls.department, cls.status, cls.enrolled, cls.total, `${cls.enrolled}/${cls.total}`],
        normalizedQuery
      )
    );
  }, [classes, normalizedQuery]);

  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    paginatedItems: paginatedClasses,
    canPreviousPage,
    canNextPage,
    setPage,
    nextPage,
    previousPage,
  } = usePagination(filteredClasses, 6);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-400 mt-1">Manage your teaching classes and course details</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          Loading classes...
        </div>
      )}

      {!loading && filteredClasses.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          {normalizedQuery ? "No classes match your search." : "No classes are assigned to you yet."}
        </div>
      )}

      {!loading && filteredClasses.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="min-h-0 flex-1 overflow-auto p-6">
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Class Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Students
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {paginatedClasses.map((cls) => (
                      <tr key={cls._id} className="transition hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-md bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                            {cls.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{cls.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{cls.department}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {cls.enrolled}/{cls.total}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                            {cls.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => navigate("/faculty/attendance")}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
            itemLabel="classes"
            onPageChange={setPage}
            onPrevious={previousPage}
            onNext={nextPage}
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage}
          />
        </div>
      )}
    </div>
  );
}

export default MyClasses;
