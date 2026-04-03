import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BookPlus,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Save,
  Trash2,
  Edit,
  Plus,
} from "lucide-react";
import { fetchCourses } from "../../features/courseSlice";
import { clearDegreeError, createDegree, fetchDegrees, updateDegree, deleteDegree } from "../../features/degreeSlice";
import { hasPermission } from "../../access/appAccess";
import type {
  DegreeCourse as AddedCourse,
  DegreeMode,
  DegreeRecord as SavedDegree,
} from "../../features/degreeSlice";

type DraftCourse = {
  name: string;
  code: string;
};

type DegreeSection = {
  key: string;
  label: string;
  courses: AddedCourse[];
  draft: DraftCourse;
};

const YEAR_OPTIONS = [1, 2, 3, 4, 5];
const SEMESTER_OPTIONS = [2, 4, 6, 8];
const FALLBACK_STREAMS = [
  "Computer Science",
  "Information Technology",
  "Business Administration",
  "Commerce",
  "Mathematics",
];

function createSections(type: DegreeMode, count: number): DegreeSection[] {
  const unitLabel = type === "semester" ? "Semester" : "Year";

  return Array.from({ length: count }, (_, index) => ({
    key: `${type}-${index + 1}`,
    label: `${unitLabel} ${index + 1}`,
    courses: [],
    draft: {
      name: "",
      code: "",
    },
  }));
}

function ManageDegrees() {
  const dispatch = useDispatch();
  const courses = useSelector((state: any) => state.courses.courses) as Array<{ department?: string }>;
  const degrees = useSelector((state: any) => state.degrees.degrees) as SavedDegree[];
  const degreeLoading = useSelector((state: any) => state.degrees.loading) as boolean;
  const degreeError = useSelector((state: any) => state.degrees.error) as string | null;
  const user = useSelector((state: any) => state.auth.user);

  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [degreeName, setDegreeName] = useState("");
  const [department, setDepartment] = useState("");
  const [modeType, setModeType] = useState<DegreeMode>("semester");
  const [count, setCount] = useState(4);
  const [sections, setSections] = useState<DegreeSection[]>(() => createSections("semester", 4));
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [savedToast, setSavedToast] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingCourseData, setEditingCourseData] = useState<{ name: string; code: string }>({ name: "", code: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingDegreeId, setEditingDegreeId] = useState<string | null>(null);

  useEffect(() => {
    if (courses.length === 0) {
      dispatch(fetchCourses() as any);
    }
    dispatch(fetchDegrees() as any);
  }, []);

  useEffect(() => {
    setSections((currentSections) => {
      const nextSections = createSections(modeType, count);

      return nextSections.map((section, index) => {
        const existing = currentSections[index];
        return existing
          ? {
              ...section,
              courses: existing.courses,
              draft: existing.draft,
            }
          : section;
      });
    });
  }, [count, modeType]);

  const streamOptions = useMemo(() => {
    const dynamicStreams = courses
      .map((course) => (course.department || "").trim())
      .filter(Boolean);

    return Array.from(new Set([...dynamicStreams, ...FALLBACK_STREAMS])).sort((left, right) =>
      left.localeCompare(right)
    );
  }, [courses]);

  const createdDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    []
  );

  const latestSavedDegree = degrees[0] || null;
  const canCreate = hasPermission(user, "create_degrees");
  const canUpdate = hasPermission(user, "update_degrees");
  const canDelete = hasPermission(user, "delete_degrees");

  function handleModeTypeChange(nextMode: DegreeMode) {
    setModeType(nextMode);
    setCount(nextMode === "semester" ? 4 : 3);
  }

  function updateDraft(sectionKey: string, field: keyof DraftCourse, value: string) {
    setSections((current) =>
      current.map((section) =>
        section.key === sectionKey
          ? {
              ...section,
              draft: {
                ...section.draft,
                [field]: value,
              },
            }
          : section
      )
    );
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  }

  function addCourse(sectionKey: string) {
    setSections((current) =>
      current.map((section) => {
        if (section.key !== sectionKey) {
          return section;
        }

        const nextName = section.draft.name.trim();
        const nextCode = section.draft.code.trim().toUpperCase();

        if (!nextName || !nextCode) {
          return section;
        }

        // Check for duplicate name across all sections (case-insensitive)
        const allCourses = current.flatMap(s => s.courses);
        const nameExists = allCourses.some(course => course.name.toLowerCase() === nextName.toLowerCase());
        if (nameExists) {
          setErrors(["Course already exists"]);
          return section;
        }

        // Check for duplicate code across all sections
        const codeExists = allCourses.some(course => course.code === nextCode);
        if (codeExists) {
          setErrors(["Course code must be unique"]);
          return section;
        }

        setErrors([]); // Clear errors if validation passes

        return {
          ...section,
          courses: [
            ...section.courses,
            {
              id: `${section.key}-${Date.now()}-${section.courses.length}`,
              name: nextName,
              code: nextCode,
            },
          ],
          draft: {
            name: "",
            code: "",
          },
        };
      })
    );
  }

  function removeCourse(sectionKey: string, courseId: string) {
    setSections((current) =>
      current.map((section) =>
        section.key === sectionKey
          ? {
              ...section,
              courses: section.courses.filter((course) => course.id !== courseId),
            }
          : section
      )
    );
  }

  function startEditCourse(course: AddedCourse) {
    setEditingCourseId(course.id);
    setEditingCourseData({ name: course.name, code: course.code });
  }

  function saveEditCourse(sectionKey: string) {
    if (!editingCourseId) return;

    const newName = editingCourseData.name.trim();
    const newCode = editingCourseData.code.trim().toUpperCase();

    if (!newName || !newCode) {
      setErrors(["Course name and code are required"]);
      return;
    }

    // Check for duplicate name across all sections (case-insensitive)
    const allCourses = sections.flatMap(s => s.courses.filter(c => c.id !== editingCourseId));
    const nameExists = allCourses.some(course => course.name.toLowerCase() === newName.toLowerCase());
    if (nameExists) {
      setErrors(["Course already exists"]);
      return;
    }

    // Check for duplicate code across all sections
    const codeExists = allCourses.some(course => course.code === newCode);
    if (codeExists) {
      setErrors(["Course code must be unique"]);
      return;
    }

    setSections((current) =>
      current.map((section) =>
        section.key === sectionKey
          ? {
              ...section,
              courses: section.courses.map((course) =>
                course.id === editingCourseId
                  ? { ...course, name: newName, code: newCode }
                  : course
              ),
            }
          : section
      )
    );

    // TODO: If editing an existing degree, call API to update the degree
    // dispatch(updateDegree({ id: degreeId, data: updatedDegreeData }));

    setEditingCourseId(null);
    setEditingCourseData({ name: "", code: "" });
    setErrors([]);
  }

  function cancelEditCourse() {
    setEditingCourseId(null);
    setEditingCourseData({ name: "", code: "" });
    setErrors([]);
  }

  async function handleDeleteDegree(id: string) {
    const result = await dispatch(deleteDegree(id) as any);
    if (deleteDegree.fulfilled.match(result)) {
      setDeleteConfirmId(null);
    }
  }

  function toggleSection(sectionKey: string) {
    setCollapsedSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  }

  function handleCancel() {
    setDegreeName("");
    setDepartment("");
    setModeType("semester");
    setCount(4);
    setSections(createSections("semester", 4));
    setCollapsedSections({});
    setErrors([]);
    setEditingDegreeId(null);
    setMode('list');
  }

  function handleEdit(degree: SavedDegree) {
    setDegreeName(degree.degreeName);
    setDepartment(degree.department);
    setModeType(degree.type as DegreeMode);
    setCount(degree.count);
    setSections(
      degree.sections.map((section) => ({
        key: section.key,
        label: section.label,
        courses: section.courses.map((course) => ({
          id: course.id,
          name: course.name,
          code: course.code,
        })),
        draft: { name: "", code: "" },
      }))
    );
    setCollapsedSections({});
    setErrors([]);
    setEditingDegreeId(degree.id);
    setMode('create');
  }

  async function handleSave() {
    const nextErrors: string[] = [];

    if (degreeName.trim() === "") {
      nextErrors.push("Degree name is required.");
    }

    if (department.trim() === "") {
      nextErrors.push("Department / Stream is required.");
    }

    if (modeType === "semester" && !SEMESTER_OPTIONS.includes(count)) {
      nextErrors.push("Semester wise degrees must use an even semester count up to 8.");
    }

    if (modeType === "year" && !YEAR_OPTIONS.includes(count)) {
      nextErrors.push("Year wise degrees must use a year count between 1 and 5.");
    }

    sections.forEach((section) => {
      if (section.courses.length === 0) {
        nextErrors.push(`${section.label} requires at least one course.`);
      }
    });

    setErrors(nextErrors);

    if (nextErrors.length > 0) {
      return;
    }

    const payload = {
      degreeName: degreeName.trim(),
      department: department.trim(),
      type: modeType,
      count,
      sections: sections.map((section) => ({
        key: section.key,
        label: section.label,
        courses: section.courses,
      })),
    };

    if (editingDegreeId) {
      const result = await dispatch(updateDegree({ id: editingDegreeId, data: payload }) as any);

      if (updateDegree.fulfilled.match(result)) {
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
        setErrors([]);
        dispatch(clearDegreeError());
        setDegreeName("");
        setDepartment("");
        setModeType("semester");
        setCount(4);
        setSections(createSections("semester", 4));
        setCollapsedSections({});
        setEditingDegreeId(null);
        setMode('list');
      }
    } else {
      const result = await dispatch(createDegree(payload) as any);

      if (createDegree.fulfilled.match(result)) {
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
        setErrors([]);
        dispatch(clearDegreeError());
        setDegreeName("");
        setDepartment("");
        setModeType("semester");
        setCount(4);
        setSections(createSections("semester", 4));
        setCollapsedSections({});
        setMode('list');
      }
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gray-50 p-8">
      {mode === 'list' ? (
        <>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Degrees</h1>
              <p className="mt-1 text-sm text-gray-400">
                View and manage all available degrees.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMode('create')}
              className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
            >
              <Plus size={15} /> Create Degree
            </button>
          </div>

          {degreeError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {degreeError}
            </div>
          )}

          <div className="space-y-4">
            {degreeLoading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <div className="text-sm text-gray-500">Loading degrees...</div>
              </div>
            ) : degrees.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <GraduationCap size={48} className="mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No degrees found</h3>
                <p className="mt-2 text-sm text-gray-500">Get started by creating your first degree.</p>
	                <button
	                  type="button"
	                  onClick={() => setMode('create')}
	                  disabled={!canCreate}
	                  className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
	                >
	                  <Plus size={15} /> Create Degree
	                </button>
              </div>
            ) : (
              degrees.map((degree) => (
                <div key={degree.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{degree.degreeName}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {degree.department} • {degree.type === "semester" ? "Semester Wise" : "Year Wise"} • {degree.count} {degree.type === "semester" ? "Semesters" : "Years"}
                      </p>
                      <p className="mt-2 text-sm text-gray-400">
                        Created on {new Date(degree.createdDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
	                      <button
	                        type="button"
	                        onClick={() => handleEdit(degree)}
	                        disabled={!canUpdate}
	                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
	                      >
	                        <Edit size={15} /> Edit
	                      </button>
	                      <button
	                        type="button"
	                        onClick={() => setDeleteConfirmId(degree.id)}
	                        disabled={!canDelete}
	                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
	                      >
	                        <Trash2 size={15} /> Delete
	                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {degree.sections.map((section) => (
                      <div key={section.key} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="font-semibold text-gray-800">{section.label}</div>
                        <div className="mt-2 space-y-1 text-xs text-gray-500">
                          {section.courses.length > 0 ? (
                            section.courses.map((course) => (
                              <div key={course.id}>
                                {course.code} • {course.name}
                              </div>
                            ))
                          ) : (
                            <div>No courses</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {deleteConfirmId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900">Delete Degree</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Are you sure you want to delete this degree? This action cannot be undone.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
	                  <button
	                    type="button"
	                    onClick={() => handleDeleteDegree(deleteConfirmId)}
	                    disabled={degreeLoading || !canDelete}
	                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
	                  >
                    {degreeLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{editingDegreeId ? "Edit Degree" : "Create Degree"}</h1>
              <p className="mt-1 text-sm text-gray-400">
                {editingDegreeId ? "Update the degree structure and courses." : "Build semester-wise or year-wise degree structures with mapped courses."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
	              <button
	                type="button"
	                onClick={handleSave}
	                disabled={degreeLoading || (editingDegreeId ? !canUpdate : !canCreate)}
	                className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
	              >
                <Save size={15} /> {degreeLoading ? (editingDegreeId ? "Updating..." : "Saving...") : (editingDegreeId ? "Update Degree" : "Save Degree")}
              </button>
            </div>
          </div>

      {savedToast && (
        <div className="fixed right-6 top-6 z-50 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          Degree {editingDegreeId ? "updated" : "saved"} successfully
        </div>
      )}

      {degreeError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {degreeError}
        </div>
      )}

      {errors.length > 0 && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <div className="font-semibold">Please fix the following before saving:</div>
          <ul className="mt-2 list-disc pl-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-base font-semibold text-gray-800">Degree Creation Form</h2>
            </div>

            <div className="grid gap-5 px-6 py-5 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Degree Name</label>
                <input
                  value={degreeName}
                  onChange={(event) => setDegreeName(event.target.value)}
                  placeholder="e.g. Bachelor of Computer Applications"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Department / Stream</label>
                <select
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select department / stream</option>
                  {streamOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Structure Type</label>
                <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-gray-50 p-2">
                  <label className="flex flex-1 min-w-[150px] cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">
                    <input
                      type="radio"
                      name="degree-type"
                      checked={modeType === "semester"}
                      onChange={() => handleModeTypeChange("semester")}
                      className="h-4 w-4 accent-blue-600"
                    />
                    Semester Wise
                  </label>
                  <label className="flex flex-1 min-w-[150px] cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">
                    <input
                      type="radio"
                      name="degree-type"
                      checked={modeType === "year"}
                      onChange={() => handleModeTypeChange("year")}
                      className="h-4 w-4 accent-blue-600"
                    />
                    Year Wise
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {modeType === "semester" ? "Number of Semesters" : "Number of Years"}
                </label>
                <select
                  value={count}
                  onChange={(event) => setCount(Number(event.target.value))}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(modeType === "semester" ? SEMESTER_OPTIONS : YEAR_OPTIONS).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  {modeType === "semester"
                    ? "Only even values are allowed, up to 8 semesters."
                    : "Configurable year count from 1 to 5."}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-base font-semibold text-gray-800">Dynamic Course Creation</h2>
              <p className="mt-1 text-sm text-gray-400">
                Add at least one course to each {modeType === "semester" ? "semester" : "year"}.
              </p>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
              {sections.map((section) => {
                const isCollapsed = Boolean(collapsedSections[section.key]);

                return (
                  <div key={section.key} className="rounded-2xl border border-gray-200 bg-gray-50/60">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.key)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{section.label}</div>
                        <div className="mt-1 text-xs text-gray-400">
                          {section.courses.length} course{section.courses.length === 1 ? "" : "s"} added
                        </div>
                      </div>
                      {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>

                    {!isCollapsed && (
                      <div className="border-t border-gray-200 px-5 py-5">
                        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr_auto]">
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Course Name</label>
                            <input
                              value={section.draft.name}
                              onChange={(event) => updateDraft(section.key, "name", event.target.value)}
                              placeholder="e.g. Data Structures"
                              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Course Code</label>
                            <input
                              value={section.draft.code}
                              onChange={(event) => updateDraft(section.key, "code", event.target.value)}
                              placeholder="e.g. CS201"
                              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => addCourse(section.key)}
                              disabled={!canCreate || !section.draft.name.trim() || !section.draft.code.trim() || errors.length > 0}
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <BookPlus size={15} /> Add Course
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
                          {section.courses.length > 0 ? (
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                                <tr>
                                  <th className="px-4 py-3">Course Name</th>
                                  <th className="px-4 py-3">Course Code</th>
                                  <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {section.courses.map((course) => (
                                  <tr key={course.id} className="border-t border-gray-100">
                                    {editingCourseId === course.id ? (
                                      <>
                                        <td className="px-4 py-3">
                                          <input
                                            value={editingCourseData.name}
                                            onChange={(e) => setEditingCourseData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                                          />
                                        </td>
                                        <td className="px-4 py-3">
                                          <input
                                            value={editingCourseData.code}
                                            onChange={(e) => setEditingCourseData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm uppercase"
                                          />
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                          <button
                                            type="button"
                                            onClick={() => saveEditCourse(section.key)}
                                            disabled={!canUpdate}
                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
                                          >
                                            Save
                                          </button>
                                          <button
                                            type="button"
                                            onClick={cancelEditCourse}
                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                                          >
                                            Cancel
                                          </button>
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td className="px-4 py-3 font-medium text-gray-800">{course.name}</td>
                                        <td className="px-4 py-3 text-gray-500">{course.code}</td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                          <button
                                            type="button"
                                            onClick={() => startEditCourse(course)}
                                            disabled={!canUpdate}
                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => removeCourse(section.key, course.id)}
                                            disabled={!(editingDegreeId ? canUpdate : canCreate)}
                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                          >
                                            <Trash2 size={13} /> Remove
                                          </button>
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="px-4 py-8 text-center text-sm text-gray-400">
                              No courses added yet for {section.label}.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-base font-semibold text-gray-800">Metadata</h2>
            </div>

            <div className="space-y-4 px-6 py-5 text-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">Created By</div>
                  <div className="font-semibold text-gray-900">{latestSavedDegree?.createdBy || "Degree"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400">Created Date</div>
                  <div className="font-semibold text-gray-900">
                    {latestSavedDegree
                      ? new Date(latestSavedDegree.createdDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : createdDate}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
                <div className="text-xs uppercase tracking-wide text-gray-400">Structure Summary</div>
                <div className="mt-2 text-sm text-gray-700">
                  {modeType === "semester" ? "Semester Wise" : "Year Wise"} • {count}{" "}
                  {modeType === "semester" ? "units" : "years"}
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  Total Courses: {sections.reduce((sum, section) => sum + section.courses.length, 0)}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-base font-semibold text-gray-800">Latest Saved Structure</h2>
            </div>

            <div className="px-6 py-5">
              {latestSavedDegree ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-900">{latestSavedDegree.degreeName}</div>
                    <div className="mt-1 text-gray-500">
                      {latestSavedDegree.department} •{" "}
                      {latestSavedDegree.type === "semester" ? "Semester Wise" : "Year Wise"}
                    </div>
                  </div>

                  <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                    {latestSavedDegree.sections.map((section) => (
                      <div key={section.key} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <div className="font-semibold text-gray-800">{section.label}</div>
                        <div className="mt-2 space-y-1 text-xs text-gray-500">
                          {section.courses.map((course) => (
                            <div key={course.id}>
                              {course.code} • {course.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">No degree saved yet.</div>
              )}
            </div>
          </section>
        </aside>
      </div>
        </>
      )}
    </div>
  );
}

export default ManageDegrees;
