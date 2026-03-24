const base64UrlEncode = (value: string): string =>
  window.btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

export const createAccessTokenForTest = (expiresAtUnixSeconds: number): string => {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(JSON.stringify({ exp: expiresAtUnixSeconds }));
  return `${header}.${payload}.signature`;
};
