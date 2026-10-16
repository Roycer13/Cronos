import { usePage } from '@inertiajs/react'

export function useAuth() {
  const { user } = usePage().props as any

  const isAdmin = user?.roles?.includes('admin')

  const hasPermission = (perm: string) => {
    if (isAdmin) return true
    return user?.permissions?.includes(perm)
  }

  const belongsToUbicacion = (ubicacionName: string) => {
    if (isAdmin) return true
    console.log('user ubicacion:', user)
    return user?.ubicacion?.nombre === ubicacionName
  }

  /**
   * Evalúa si puede realizar una acción sobre un registro.
   * @param registro Registro sobre el que se aplica la acción (debe tener user_id, created_by y created_at)
   * @param perm Permiso requerido para la acción
   * @param limiteHoras Tiempo máximo desde la creación (opcional)
   * @param checkUserId Requiere que el user_id coincida (opcional)
   * @param checkCreatedBy Requiere que el created_by coincida (opcional)
   * @param allowEitherOwnership Si true, basta con que coincida user_id o created_by
   */
  const canDo = (
    registro: any,
    perm: string,
    limiteHoras?: number,
    checkUserId = false,
    checkCreatedBy = false,
    allowEitherOwnership = false
  ) => {
    if (isAdmin) return true

    // ⚙️ Comprobación de ownership
    if (checkUserId || checkCreatedBy) {
      const userId = Number(user?.id)
      const registroUserId = Number(registro.user_id)
      const registroCreatedBy = Number(
  registro?.created_by?.id ?? registro?.created_by ?? null
)

      const isUserOwner = checkUserId ? userId === registroUserId : false
      const isCreator = checkCreatedBy ? userId === registroCreatedBy : false

      if (allowEitherOwnership) {
        if (!isUserOwner && !isCreator) return false
      } else {
        if (checkUserId && !isUserOwner) return false
        if (checkCreatedBy && !isCreator) return false
      }
    }

    // ⏱️ Revisión de tiempo límite
    if (limiteHoras !== undefined && registro.created_at) {
      const createdAt = new Date(registro.created_at)
      const diffHoras = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
      console.log('created_at:', registro.created_at, 'diffHoras:', diffHoras)
      if (diffHoras > limiteHoras) return false
    }

    // 🔐 Permiso
    return hasPermission(perm)
  }

  return { user, isAdmin, hasPermission, belongsToUbicacion, canDo }
}
