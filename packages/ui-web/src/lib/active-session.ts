import { localStorageUtils } from "@/lib-client/localstorage";
import { appmintConfig } from "./appmint-config";

export namespace activeSession {
  let token: string;
  let user: any;
  let refreshToken: string;

  const setCookie = (name: string, value: any, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  };

  const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
  };

  const clearCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  };

  export const setActiveSession = (_token: string, _user: any, _refreshToken: string) => {
    token = _token;
    user = _user;
    refreshToken = _refreshToken;

    // Save to cookies
    setCookie('token', _token);
    setCookie('user', JSON.stringify(_user));
    setCookie('refreshToken', _refreshToken);
  };

  export const clearSession = () => {
    token;
    user;
    refreshToken;

    // Clear cookies
    clearCookie('token');
    clearCookie('user');
    clearCookie('refreshToken');
  };

  export const getUser = () => {
    if (!user) {
      const userCookie = getCookie('user');
      try {
        user = JSON.parse(userCookie);
      } catch (e) {
        clearCookie('user');
      }
    }
    return user;
  };

  export const getToken = (): string => {
    if (!token) {
      token = getCookie('token');
    }
    return 'Bearer ' + token;
  };

  export const getRefreshToken = (): string => {
    if (!refreshToken) {
      refreshToken = getCookie('refreshToken');
    }
    return 'Bearer ' + refreshToken;
  };

  export const getOrgId = () => {
    if (appmintConfig.orgId) {
      return appmintConfig.orgId;
    }
    const session = localStorageUtils.get('session');
    if (session.orgId) {
      appmintConfig.orgId = session.orgId;
    }
    return appmintConfig.orgId;
  };
}
