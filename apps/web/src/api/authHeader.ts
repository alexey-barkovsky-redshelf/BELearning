let getToken: () => string | null = () => null;

export function setAuthTokenGetter(getter: () => string | null): void {
  getToken = getter;
}

export function getAuthToken(): string | null {
  return getToken();
}
