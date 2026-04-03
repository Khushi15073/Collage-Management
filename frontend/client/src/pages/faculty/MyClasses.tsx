import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BookOpen, Users, Building2 } from "lucide-react";
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedClasses.map((cls) => (
            <div
              key={cls._id}
              className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                  {cls.code}
                </span>
                <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                  {cls.status}
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-900">{cls.name}</h2>
                <p className="mt-1 text-xs leading-relaxed text-gray-400">
                  {cls.department} department course with {cls.total} total seats.
                </p>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users size={13} className="text-gray-400" />
                  {cls.enrolled} students enrolled
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Building2 size={13} className="text-gray-400" />
                  {cls.department}
                </div>
              </div>

              <div className="mt-auto flex">
                <button
                  onClick={() => navigate("/faculty/attendance")}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Manage
                </button>
              </div>
            </div>
              ))}
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
