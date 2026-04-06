import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, Plus } from "lucide-react";
import { createRole, fetchRoles, updateRolePermissions } from "../../features/roleSlice";
import type { Role } from "../../features/roleSlice";
import { createPermission, fetchPermissions, syncDefaultPermissions } from "../../features/permissionSlice";
import type { Permission } from "../../features/permissionSlice";
import StatsStrip from "../../components/StatsStrip";
import { hasPermission } from "../../access/appAccess";
import SearchField from "../../components/ui/SearchField";
import { useToastMessage } from "../../hooks/useToastMessage";

function formatRoleName(roleName: string) {
  return roleName.charAt(0).toUpperCase() + roleName.slice(1);
}

function permissionGridClass(count: number) {
  if (count === 3) {
    return "grid gap-1.5 md:grid-cols-2";
  }

  return "grid gap-1.5 md:grid-cols-2 xl:grid-cols-3";
}

const HIDDEN_PERMISSION_SECTIONS = new Set(["Reports", "Custom"]);
const HIDDEN_PERMISSION_NAMES = new Set([
  "view_reports",
  "create_reports",
  "export_reports",
]);

function RolesPermissions() {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");

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
  const [showCreateRolePanel, setShowCreateRolePanel] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRolePermissionData() {
      await dispatch(fetchRoles() as any);
      await dispatch(syncDefaultPermissions() as any);

      if (isMounted) {
        dispatch(fetchPermissions() as any);
      }
    }

    loadRolePermissionData();

    return () => {
      isMounted = false;
    };
  }, []);

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
      setNewPermissionName("");
      setNewPermissionDescription("");
      setActiveRoleId(createdRole._id);
      setShowCreateRolePanel(false);
      setRoleSaved(true);
      setTimeout(() => setRoleSaved(false), 2500);
    }
  }

  function closeCreateRolePanel() {
    setShowCreateRolePanel(false);
    setNewRoleName("");
    setNewRoleDescription("");
    setNewRolePermissions({});
    setNewPermissionName("");
    setNewPermissionDescription("");
  }

  const pageError = rolesError || permissionsError;
  const loading = rolesLoading || permissionsLoading;
  const canCreateRole = hasPermission(user, "create_admins");
  const canUpdateRolePermissions = hasPermission(user, "update_admins");
  const canCreatePermission = hasPermission(user, "create_permissions");
  useToastMessage(pageError, "error");
  useToastMessage(saved ? "Changes saved successfully!" : null, "success");
  useToastMessage(roleSaved ? "Role created successfully!" : null, "success");

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gray-50 p-8">
      <div className="mb-6 flex shrink-0 items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role & Permissions</h1>
          <p className="text-sm text-gray-400 mt-1">Manage access control for different user roles</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCreateRolePanel(true)}
            disabled={!canCreateRole}
            className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={15} /> Add New Role
          </button>
          <button
            onClick={handleSave}
            disabled={loading || activeRole == null || !canUpdateRolePermissions}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
          >
            <Check size={15} /> Save Changes
          </button>
        </div>
      </div>

      <div className="mb-5 max-w-md shrink-0">
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search permissions..."
        />
      </div>

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

        <div className="px-6 pt-5">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-gray-400">Select Role</div>
              <select
                value={activeRoleId}
                onChange={(event) => setActiveRoleId(event.target.value)}
                disabled={loading || roles.length === 0}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {loading ? "Loading roles..." : "Please select a role"}
                </option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {formatRoleName(role.name)}
                  </option>
                ))}
              </select>
              <div className="mt-3 text-xs text-gray-500">
                {activeRole
                  ? `${countOn(activeRole)} visible permissions assigned`
                  : "Choose a role to configure its permissions."}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {loading && (
            <p className="text-sm text-gray-400">Loading roles and permissions...</p>
          )}

          {!loading && activeRole == null && (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center text-sm text-gray-500">
              Please select a role to display permissions for that role.
            </div>
          )}

          {!loading && activeRole != null &&
            filteredPermissionGroups.map((group) => (
              <div key={group.section}>
                <h3 className="mb-2 text-sm font-bold text-gray-800">{group.section}</h3>
                <div className="grid gap-1.5 lg:grid-cols-4">
                  {group.permissions.map((permission) => {
                    const isOn = selectedPermissions[permission.name] || false;

                    return (
                      <button
                        key={permission._id}
                        type="button"
                        onClick={() => togglePermission(permission.name)}
                        disabled={!canUpdateRolePermissions}
                        className={`flex w-full items-start rounded-lg border px-3 py-2.5 text-left transition ${
                          isOn
                            ? "border-blue-200 bg-blue-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-5 text-gray-800">{permission.label}</p>
                          {permission.description && (
                            <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-gray-400">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          {!loading && activeRole != null && filteredPermissionGroups.length === 0 && (
            <p className="text-sm text-gray-400">No permissions match your search.</p>
          )}
        </div>
      </div>

      {showCreateRolePanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Role And Permissions</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add a new role, create any missing permissions, and choose what this role can access.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateRolePanel}
                className="rounded-lg px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-gray-800">Role Details</h3>
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
              </div>

              <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-gray-800">Create Permission</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add a new permission first if the role needs access that is not listed yet.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_2fr_auto]">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Permission Key</label>
                    <input
                      value={newPermissionName}
                      onChange={(event) => setNewPermissionName(event.target.value)}
                      placeholder="e.g. approve_budget"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                    <input
                      value={newPermissionDescription}
                      onChange={(event) => setNewPermissionDescription(event.target.value)}
                      placeholder="Describe what this permission allows"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Starting Permissions
                  </label>
                  <span className="text-xs text-gray-400">
                    {Object.values(newRolePermissions).filter(Boolean).length} selected
                  </span>
                </div>
                <div className={permissionGridClass(visiblePermissions.length)}>
                  {visiblePermissions.map((permission) => {
                    const isOn = newRolePermissions[permission.name] || false;

                    return (
                      <button
                        key={`new-role-${permission._id}`}
                        type="button"
                        onClick={() => toggleNewRolePermission(permission.name)}
                        className={`flex items-start rounded-lg border px-3 py-2.5 text-left transition ${
                          isOn
                            ? "border-blue-600 bg-blue-50 text-blue-900"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold leading-5">{permission.label}</div>
                          <div className="mt-0.5 text-xs text-gray-500">{permission.section}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={closeCreateRolePanel}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
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
        </div>
      )}
    </div>
  );
}

export default RolesPermissions;
