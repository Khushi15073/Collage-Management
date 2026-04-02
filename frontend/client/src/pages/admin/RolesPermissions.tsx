import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, Plus } from "lucide-react";
import { createRole, fetchRoles, updateRolePermissions } from "../../features/roleSlice";
import type { Role } from "../../features/roleSlice";
import { createPermission, syncDefaultPermissions } from "../../features/permissionSlice";
import type { Permission } from "../../features/permissionSlice";
import StatsStrip from "../../components/StatsStrip";
import { useDashboardSearch } from "../../context/DashboardSearchContext";
import { hasPermission } from "../../access/appAccess";

function formatRoleName(roleName: string) {
  return roleName.charAt(0).toUpperCase() + roleName.slice(1);
}

const HIDDEN_PERMISSION_SECTIONS = new Set(["Reports", "Custom"]);
const HIDDEN_PERMISSION_NAMES = new Set([
  "view_reports",
  "create_reports",
  "export_reports",
]);

function RolesPermissions() {
  const dispatch = useDispatch();
  const { searchQuery } = useDashboardSearch();

  const roles = useSelector((state: any) => state.roles.roles) as Role[];
  const rolesLoading = useSelector((state: any) => state.roles.loading) as boolean;
  const rolesError = useSelector((state: any) => state.roles.error) as string | null;

  const permissions = useSelector((state: any) => state.permissions.permissions) as Permission[];
  const permissionsLoading = useSelector((state: any) => state.permissions.loading) as boolean;
  const permissionsError = useSelector((state: any) => state.permissions.error) as string | null;
  const user = useSelector((state: any) => state.auth.user);

  const [activeRoleId, setActiveRoleId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [roleSaved, setRoleSaved] = useState(false);
  const [newPermissionName, setNewPermissionName] = useState("");
  const [newPermissionDescription, setNewPermissionDescription] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(fetchRoles() as any);
    dispatch(syncDefaultPermissions() as any);
  }, []);

  useEffect(() => {
    if (roles.length > 0 && activeRoleId === "") {
      setActiveRoleId(roles[0]._id);
    }
  }, [roles, activeRoleId]);

  const permissionIdByName = useMemo(() => {
    return permissions.reduce<Record<string, string>>((accumulator, permission) => {
      accumulator[permission.name] = permission._id;
      return accumulator;
    }, {});
  }, [permissions]);

  const activeRole = useMemo(() => {
    return roles.find((role) => role._id === activeRoleId) || null;
  }, [roles, activeRoleId]);

  const visiblePermissions = useMemo(() => {
    return permissions.filter((permission) => {
      if (HIDDEN_PERMISSION_SECTIONS.has(permission.section)) {
        return false;
      }

      if (HIDDEN_PERMISSION_NAMES.has(permission.name)) {
        return false;
      }

      return true;
    });
  }, [permissions]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredPermissionGroups = useMemo(() => {
    const groupedPermissions = visiblePermissions.reduce<Record<string, Permission[]>>((accumulator, permission) => {
      const sectionName = permission.section || "Custom";
      if (!accumulator[sectionName]) {
        accumulator[sectionName] = [];
      }
      accumulator[sectionName].push(permission);
      return accumulator;
    }, {});

    const groups = Object.entries(groupedPermissions).map(([section, items]) => ({
      section,
      permissions: items.sort((left, right) => left.label.localeCompare(right.label)),
    }));

    if (!normalizedQuery) {
      return groups;
    }

    return groups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter((permission) =>
          [
            group.section,
            permission.name,
            permission.label,
            permission.description,
            activeRole?.name || "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [activeRole?.name, normalizedQuery, visiblePermissions]);

  useEffect(() => {
    if (activeRole == null) {
      return;
    }

    const nextState = visiblePermissions
      .reduce<Record<string, boolean>>((accumulator, permission) => {
        const permissionId = permissionIdByName[permission.name];
        const hasPermission = activeRole.permissions?.some(
          (rolePermission) => rolePermission._id === permissionId
        );

        accumulator[permission.name] = Boolean(hasPermission);
        return accumulator;
      }, {});

    setSelectedPermissions(nextState);
  }, [activeRole, permissionIdByName, visiblePermissions]);

  function togglePermission(permissionKey: string) {
    setSelectedPermissions((current) => ({
      ...current,
      [permissionKey]: !current[permissionKey],
    }));
  }

  function toggleNewRolePermission(permissionKey: string) {
    setNewRolePermissions((current) => ({
      ...current,
      [permissionKey]: !current[permissionKey],
    }));
  }

  function countOn(role: Role) {
    const visiblePermissionNames = new Set(visiblePermissions.map((permission) => permission.name));
    return (role.permissions || []).filter((permission) => visiblePermissionNames.has(permission.name)).length;
  }

  async function handleSave() {
    if (activeRole == null) {
      return;
    }

    const permissionIds = Object.entries(selectedPermissions)
      .filter(([, enabled]) => enabled)
      .map(([permissionKey]) => permissionIdByName[permissionKey])
      .filter(Boolean);

    const result = await dispatch(
      updateRolePermissions({
        id: activeRole._id,
        permissions: permissionIds,
      }) as any
    );

    if (updateRolePermissions.fulfilled.match(result)) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  async function handleCreatePermission() {
    if (newPermissionName.trim() === "") {
      return;
    }

    const normalizedName = newPermissionName.trim().toLowerCase().replace(/\s+/g, "_");
    const result = await dispatch(
      createPermission({
        name: normalizedName,
        description: newPermissionDescription.trim() || undefined,
      }) as any
    );

    if (createPermission.fulfilled.match(result)) {
      setNewPermissionName("");
      setNewPermissionDescription("");
    }
  }

  async function handleCreateRole() {
    if (newRoleName.trim() === "") {
      return;
    }

    const permissionIds = Object.entries(newRolePermissions)
      .filter(([, enabled]) => enabled)
      .map(([permissionKey]) => permissionIdByName[permissionKey])
      .filter(Boolean);

    const result = await dispatch(
      createRole({
        name: newRoleName.trim(),
        description: newRoleDescription.trim() || undefined,
        permissions: permissionIds,
      }) as any
    );

    if (createRole.fulfilled.match(result)) {
      const createdRole = (result.payload as { createdRole: Role; roles: Role[] }).createdRole;
      setNewRoleName("");
      setNewRoleDescription("");
      setNewRolePermissions({});
      setActiveRoleId(createdRole._id);
      setRoleSaved(true);
      setTimeout(() => setRoleSaved(false), 2500);
    }
  }

  const pageError = rolesError || permissionsError;
  const loading = rolesLoading || permissionsLoading;
  const canCreateRole = hasPermission(user, "create_admins");
  const canUpdateRolePermissions = hasPermission(user, "update_admins");
  const canCreatePermission = hasPermission(user, "create_permissions");

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gray-50 p-8">
      <div className="mb-6 flex shrink-0 items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role & Permissions</h1>
          <p className="text-sm text-gray-400 mt-1">Manage access control for different user roles</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading || activeRole == null || !canUpdateRolePermissions}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
        >
          <Check size={15} /> Save Changes
        </button>
      </div>

      {saved && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold z-50 flex items-center gap-2">
          <Check size={15} /> Changes saved successfully!
        </div>
      )}

      {roleSaved && (
        <div className="fixed top-20 right-6 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold z-50 flex items-center gap-2">
          <Check size={15} /> Role created successfully!
        </div>
      )}

      {pageError && (
        <div className="mb-6 shrink-0 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      )}

      <StatsStrip
        outerClassName="-mx-8 mb-5 px-8"
        items={roles.map((role) => ({
          title: formatRoleName(role.name),
          value: String(countOn(role)),
          loading,
        }))}
      />

      <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Configure Permissions</h2>
        </div>

        <div className="shrink-0 border-b border-gray-100 px-6 py-5">
          <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-800">Create New Role</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add any custom role and choose the exact permissions it should have.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Role Name</label>
                <input
                  value={newRoleName}
                  onChange={(event) => setNewRoleName(event.target.value)}
                  placeholder="e.g. librarian"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <input
                  value={newRoleDescription}
                  onChange={(event) => setNewRoleDescription(event.target.value)}
                  placeholder="Describe this role"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Starting Permissions
                </label>
                <span className="text-xs text-gray-400">
                  {Object.values(newRolePermissions).filter(Boolean).length} selected
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {visiblePermissions.map((permission) => {
                  const isOn = newRolePermissions[permission.name] || false;

                  return (
                    <button
                      key={`new-role-${permission._id}`}
                      type="button"
                      onClick={() => toggleNewRolePermission(permission.name)}
                      className={`rounded-xl border px-4 py-3 text-left transition ${
                        isOn
                          ? "border-blue-600 bg-blue-50 text-blue-900"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-sm font-semibold">{permission.label}</div>
                      <div className="mt-1 text-xs text-gray-500">{permission.section}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleCreateRole}
                disabled={loading || newRoleName.trim() === "" || !canCreateRole}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <Plus size={15} /> Create Role
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_2fr_auto]">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Permission Key</label>
              <input
                value={newPermissionName}
                onChange={(event) => setNewPermissionName(event.target.value)}
                placeholder="e.g. approve_budget"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <input
                value={newPermissionDescription}
                onChange={(event) => setNewPermissionDescription(event.target.value)}
                placeholder="Describe what this permission allows"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleCreatePermission}
                disabled={loading || newPermissionName.trim() === "" || !canCreatePermission}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={15} /> Create Permission
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pt-5">
          <div className="flex min-w-max overflow-x-auto rounded-xl bg-gray-100 p-1">
            {roles.map((role) => (
              <button
                key={role._id}
                onClick={() => setActiveRoleId(role._id)}
                className={`min-w-[140px] flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                  activeRoleId === role._id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {formatRoleName(role.name)}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 space-y-7">
          {loading && (
            <p className="text-sm text-gray-400">Loading roles and permissions...</p>
          )}

          {!loading &&
            filteredPermissionGroups.map((group) => (
              <div key={group.section}>
                <h3 className="text-base font-bold text-gray-800 mb-3">{group.section}</h3>
                <div className="space-y-2">
                  {group.permissions.map((permission) => {
                    const isOn = selectedPermissions[permission.name] || false;

                    return (
                      <div
                        key={permission._id}
                        className="flex items-center justify-between border border-gray-100 rounded-xl px-5 py-4 hover:bg-gray-50 transition"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{permission.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{permission.description}</p>
                        </div>

                        <button
                          onClick={() => togglePermission(permission.name)}
                          disabled={!canUpdateRolePermissions}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                            isOn ? "bg-green-500" : "bg-gray-300"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                              isOn ? "translate-x-6" : ""
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          {!loading && filteredPermissionGroups.length === 0 && (
            <p className="text-sm text-gray-400">No permissions match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RolesPermissions;
