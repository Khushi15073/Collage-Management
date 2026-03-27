import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Shield, Check } from "lucide-react";
import { fetchRoles, updateRolePermissions } from "../../features/roleSlice";
import type { Role } from "../../features/roleSlice";
import { syncDefaultPermissions } from "../../features/permissionSlice";
import type { Permission } from "../../features/permissionSlice";
import { permissionGroups } from "./permissionCatalog";

function formatRoleName(roleName: string) {
  return roleName.charAt(0).toUpperCase() + roleName.slice(1);
}

function RolesPermissions() {
  const dispatch = useDispatch();

  const roles = useSelector((state: any) => state.roles.roles) as Role[];
  const rolesLoading = useSelector((state: any) => state.roles.loading) as boolean;
  const rolesError = useSelector((state: any) => state.roles.error) as string | null;

  const permissions = useSelector((state: any) => state.permissions.permissions) as Permission[];
  const permissionsLoading = useSelector((state: any) => state.permissions.loading) as boolean;
  const permissionsError = useSelector((state: any) => state.permissions.error) as string | null;

  const [activeRoleId, setActiveRoleId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

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

  useEffect(() => {
    if (activeRole == null) {
      return;
    }

    const nextState = permissionGroups
      .flatMap((group) => group.permissions)
      .reduce<Record<string, boolean>>((accumulator, permission) => {
        const permissionId = permissionIdByName[permission.key];
        const hasPermission = activeRole.permissions?.some(
          (rolePermission) => rolePermission._id === permissionId
        );

        accumulator[permission.key] = Boolean(hasPermission);
        return accumulator;
      }, {});

    setSelectedPermissions(nextState);
  }, [activeRole, permissionIdByName]);

  function togglePermission(permissionKey: string) {
    setSelectedPermissions((current) => ({
      ...current,
      [permissionKey]: !current[permissionKey],
    }));
  }

  function countOn(role: Role) {
    return role.permissions?.length || 0;
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

  const pageError = rolesError || permissionsError;
  const loading = rolesLoading || permissionsLoading;

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role & Permissions</h1>
          <p className="text-sm text-gray-400 mt-1">Manage access control for different user roles</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading || activeRole == null}
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

      {pageError && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {roles.map((role, index) => {
          const cardStyles = [
            "bg-red-100 text-red-500",
            "bg-blue-100 text-blue-500",
            "bg-green-100 text-green-500",
          ];

          return (
            <div key={role._id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${cardStyles[index] || "bg-gray-100 text-gray-500"}`}>
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm text-gray-400">{formatRoleName(role.name)}</p>
                <p className="text-3xl font-bold text-gray-900">{countOn(role)}</p>
                <p className="text-xs text-gray-400">permissions</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Configure Permissions</h2>
          <p className="text-sm text-gray-400 mt-0.5">Enable or disable permissions for each role</p>
        </div>

        <div className="px-6 pt-5">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {roles.map((role) => (
              <button
                key={role._id}
                onClick={() => setActiveRoleId(role._id)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
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
            permissionGroups.map((group) => (
              <div key={group.section}>
                <h3 className="text-base font-bold text-gray-800 mb-3">{group.section}</h3>
                <div className="space-y-2">
                  {group.permissions.map((permission) => {
                    const isOn = selectedPermissions[permission.key] || false;

                    return (
                      <div
                        key={permission.key}
                        className="flex items-center justify-between border border-gray-100 rounded-xl px-5 py-4 hover:bg-gray-50 transition"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{permission.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{permission.description}</p>
                        </div>

                        <button
                          onClick={() => togglePermission(permission.key)}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                            isOn ? "bg-green-500" : "bg-gray-300"
                          }`}
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
        </div>
      </div>
    </div>
  );
}

export default RolesPermissions;
