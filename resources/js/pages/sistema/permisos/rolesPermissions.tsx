import { useState, useEffect } from "react";
import axios from "axios";
import MultiSelect from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Roles y Permisos", href: "/sistemas/roles-permisos" },
];

export default function RolesPermissions({ roles, permissions }: any) {
  const safeRoles = Array.isArray(roles) ? roles : [];
  const safePermissions = Array.isArray(permissions) ? permissions : [];

  const [newRole, setNewRole] = useState("");
  const [newPermission, setNewPermission] = useState("");
  const [selectedRole, setSelectedRole] = useState<number | "">("");
  const [selectedPermission, setSelectedPermission] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Crear rol
  const createRole = async () => {
    if (!newRole.trim()) return;
    await axios.post("/sistemas/roles", { name: newRole });
    setNewRole("");
    window.location.reload();
  };

  // Crear permiso
  const createPermission = async () => {
    if (!newPermission.trim()) return;
    await axios.post("/sistemas/permissions", { name: newPermission });
    setNewPermission("");
    window.location.reload();
  };

  // Asignar permiso a rol
  const assignPermissionToRole = async () => {
    // Deprecated single-assignment; keep for backward compatibility
    if (!selectedRole || !selectedPermission) return;
    await axios.post(`/sistemas/roles/${selectedRole}/permissions`, {
      permission: selectedPermission,
    });
    window.location.reload();
  };

  // Sincronizar múltiples permisos al rol (usa el endpoint existente)
  const savePermissions = async () => {
    if (!selectedRole) return;
    // Convert string IDs to numbers for the backend
    const permissionsIds = selectedPermissions.map((s) => Number(s));
    await axios.post(`/sistemas/roles/${selectedRole}/sync-permissions`, {
      permissions: permissionsIds,
    });
    window.location.reload();
  };

  // Cuando seleccionas un rol, precargar sus permisos para editarlos
  useEffect(() => {
    if (!selectedRole) {
      setSelectedPermissions([]);
      return;
    }
    const role = safeRoles.find((r: any) => r.id === selectedRole);
    if (role) {
      setSelectedPermissions((role.permissions || []).map((p: any) => String(p.id)));
    } else {
      setSelectedPermissions([]);
    }
  }, [selectedRole, safeRoles]);

  // Quitar permiso de rol
  const removePermissionFromRole = async (roleId: number, permissionId: number) => {
    await axios.delete(`/sistemas/roles/${roleId}/permissions/${permissionId}`);
    window.location.reload();
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administración de Roles y Permisos</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los roles y permisos del sistema
          </p>
        </div>

        <Separator />

        {/* ASIGNAR PERMISO A ROL */}
        <Card>
          <CardHeader>
            <CardTitle>Asignar permisos a rol</CardTitle>
            <CardDescription>
              Selecciona un rol y un permiso para asignarlo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Rol</label>
                <Select
                  value={selectedRole.toString()}
                  onValueChange={(value) => setSelectedRole(value ? Number(value) : "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {safeRoles.map((r: any) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Permisos</label>
                {selectedRole ? (
                  <MultiSelect
                    label={"Permisos"}
                    value={selectedPermissions}
                    onChange={(vals) => setSelectedPermissions(vals)}
                    options={safePermissions.map((p: any) => ({ value: String(p.id), label: p.name }))}
                    placeholder="Seleccione permisos"
                    clearable
                  />
                ) : (
                  <div className="text-muted-foreground">Seleccione un rol para editar permisos</div>
                )}
              </div>

              <div className="flex items-end">
                <Button onClick={savePermissions} disabled={!selectedRole}>
                  Asignar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* ROLES */}
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                Crea y gestiona los roles del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nuevo rol"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createRole()}
                />
                <Button onClick={createRole} disabled={!newRole.trim()}>
                  Crear
                </Button>
              </div>

              <div className="space-y-4">
                {safeRoles.map((role: any) => (
                  <div key={role.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{role.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {(role.permissions || []).length} permisos
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(role.permissions || []).length === 0 ? (
                        <Badge variant="outline" className="text-muted-foreground">
                          Sin permisos
                        </Badge>
                      ) : (
                        (role.permissions || []).map((perm: any) => (
                          <Badge
                            key={perm.id}
                            variant="secondary"
                            className="gap-1 pl-3 pr-2 py-1"
                          >
                            {perm.name}
                            <button
                              onClick={() => removePermissionFromRole(role.id, perm.id)}
                              className="ml-1 hover:bg-muted rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PERMISOS */}
          <Card>
            <CardHeader>
              <CardTitle>Permisos</CardTitle>
              <CardDescription>
                Crea y visualiza los permisos disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nuevo permiso"
                  value={newPermission}
                  onChange={(e) => setNewPermission(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createPermission()}
                />
                <Button onClick={createPermission} disabled={!newPermission.trim()}>
                  Crear
                </Button>
              </div>

              <div className="rounded-lg border">
                {safePermissions.map((p: any, index: number) => (
                  <div
                    key={p.id}
                    className={`flex items-center px-4 py-3 ${
                      index !== safePermissions.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div className="h-2 w-2 rounded-full bg-primary mr-3" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                ))}
                {safePermissions.length === 0 && (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    No hay permisos creados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}


//     import { useState, useEffect } from "react";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// export default function RolesPermissions({ roles, permissions }: any) {
//   const safeRoles = Array.isArray(roles) ? roles : [];
//   const safePermissions = Array.isArray(permissions) ? permissions : [];

//   const [newRole, setNewRole] = useState("");
//   const [newPermission, setNewPermission] = useState("");

//   const [selectedRole, setSelectedRole] = useState<number | "">("");
//   const [rolePermissions, setRolePermissions] = useState<number[]>([]);

//   // Crear rol
//   const createRole = async () => {
//     if (!newRole.trim()) return;
//     await axios.post("/sistemas/roles", { name: newRole });
//     setNewRole("");
//     window.location.reload();
//   };

//   // Crear permiso
//   const createPermission = async () => {
//     if (!newPermission.trim()) return;
//     await axios.post("/sistemas/permissions", { name: newPermission });
//     setNewPermission("");
//     window.location.reload();
//   };

//   // Cuando seleccionas un rol, carga sus permisos
//   useEffect(() => {
//     if (!selectedRole) return;
//     const role = safeRoles.find((r: any) => r.id === selectedRole);
//     if (role) {
//       setRolePermissions(role.permissions.map((p: any) => p.id));
//     }
//   }, [selectedRole]);

//   // Marcar o desmarcar permisos
//   const togglePermission = (permissionId: number) => {
//     if (rolePermissions.includes(permissionId)) {
//       setRolePermissions(rolePermissions.filter((id) => id !== permissionId));
//     } else {
//       setRolePermissions([...rolePermissions, permissionId]);
//     }
//   };

//   // Guardar cambios de permisos del rol
//   const savePermissions = async () => {
//     if (!selectedRole) return;
//     await axios.post(`/sistemas/roles/${selectedRole}/sync-permissions`, {
//       permissions: rolePermissions,
//     });
//     window.location.reload();
//   };

//   return (
//     <div className="p-6 space-y-10 max-w-3xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6">Administración de Roles y Permisos</h1>

//       {/* ---------------------- CREAR ROLES ---------------------- */}
//       <section className="border rounded p-4 shadow-sm">
//         <h2 className="text-xl font-semibold mb-3">Roles</h2>
//         <div className="flex gap-2 mb-4">
//           <Input
//             placeholder="Nuevo rol"
//             value={newRole}
//             onChange={(e) => setNewRole(e.target.value)}
//           />
//           <Button onClick={createRole}>Crear</Button>
//         </div>
//       </section>

//       {/* ---------------------- CREAR PERMISOS ---------------------- */}
//       <section className="border rounded p-4 shadow-sm">
//         <h2 className="text-xl font-semibold mb-3">Permisos</h2>
//         <div className="flex gap-2 mb-4">
//           <Input
//             placeholder="Nuevo permiso"
//             value={newPermission}
//             onChange={(e) => setNewPermission(e.target.value)}
//           />
//           <Button onClick={createPermission}>Crear</Button>
//         </div>
//       </section>

//       {/* ---------------------- ASIGNAR PERMISOS CON CHECKBOX ---------------------- */}
//       <section className="border rounded p-4 shadow-sm">
//         <h2 className="text-xl font-semibold mb-3">Asignar permisos a rol</h2>

//         <div className="flex gap-2 mb-4">
//           <select
//             className="border p-2 rounded flex-1"
//             value={selectedRole}
//             onChange={(e) => setSelectedRole(Number(e.target.value))}
//           >
//             <option value="">Seleccione rol</option>
//             {safeRoles.map((r: any) => (
//               <option key={r.id} value={r.id}>
//                 {r.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {selectedRole && (
//           <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border p-2 rounded">
//             {safePermissions.map((perm: any) => (
//               <label key={perm.id} className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   checked={rolePermissions.includes(perm.id)}
//                   onChange={() => togglePermission(perm.id)}
//                 />
//                 {perm.name}
//               </label>
//             ))}
//           </div>
//         )}

//         {selectedRole && (
//           <Button className="mt-4" onClick={savePermissions}>
//             Guardar cambios
//           </Button>
//         )}
//       </section>
//     </div>
//   );
// }
