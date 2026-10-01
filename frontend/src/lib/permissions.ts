import type { UserPublic } from "@/client"

/** Name of the permission that grants access to the admin area. */
export const ADMIN_PERMISSION = "admin"

/** Every permission the UI can assign, mirroring the seeded permission rows. */
export const ASSIGNABLE_PERMISSIONS = ["admin", "customer_service"] as const

export const hasPermission = (
  user: Pick<UserPublic, "permissions"> | null | undefined,
  permission: string,
) => user?.permissions?.includes(permission) ?? false

export const isAdmin = (
  user: Pick<UserPublic, "permissions"> | null | undefined,
) => hasPermission(user, ADMIN_PERMISSION)

export type AssignablePermission = (typeof ASSIGNABLE_PERMISSIONS)[number]

/** Narrows API-supplied permission names to the ones the UI can assign. */
export const toAssignablePermissions = (
  permissions?: Array<string> | null,
): AssignablePermission[] =>
  ASSIGNABLE_PERMISSIONS.filter((permission) =>
    permissions?.includes(permission),
  )
