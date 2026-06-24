export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  CONTENT_MANAGER = 'content_manager',
}

export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.ADMIN]: 'Admin',
  [Role.EDITOR]: 'Editor',
  [Role.CONTENT_MANAGER]: 'Content Manager',
};

export const SYSTEM_ROLES = [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR, Role.CONTENT_MANAGER];
