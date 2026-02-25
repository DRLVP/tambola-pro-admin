// Clerk RBAC Role Types — includes all roles the backend can return
export type Roles = 'admin' | 'super_admin' | 'moderator' | 'user';

// Extend Clerk's session claims to include our custom metadata
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}

export { };
