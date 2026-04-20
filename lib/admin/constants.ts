export const ADMIN_ACCESS_COOKIE = "admin_access_token";
export const ADMIN_REFRESH_COOKIE = "admin_refresh_token";
export const SESSION_HEADER = "x-admin-session";
/**
 * Header usado só quando o middleware rotaciona o access token no mesmo request.
 * Server Components ainda leem o cookie antigo dentro do request atual, então
 * o `fetchAuthed` lê esse header primeiro.
 */
export const FRESH_TOKEN_HEADER = "x-admin-access-token";

export const ACCESS_COOKIE_MAX_AGE = 60 * 15; // 15m, casa com o JWT default
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7d
