import { parseStoredUserSessionJson } from '@belearning/shared';
import { SESSION_STORAGE_KEY } from '../constants/sessionStorage';

export function getAuthToken(): string | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const json = localStorage.getItem(SESSION_STORAGE_KEY);
  if (json === null || json.length === 0) {
    return null;
  }
  return parseStoredUserSessionJson(json)?.token ?? null;
}
