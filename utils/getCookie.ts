import Cookies from "universal-cookie";
import { ICookies } from "cookies";

const initialCookies = new Cookies();
export const getCookie = (
  key: string,
  defaultValue = "",
  cookies: Cookies | ICookies = initialCookies
) => {
  try {
    if (key === "network") return cookies.get(key) || defaultValue;
    return JSON.parse(cookies.get(key) || defaultValue);
  } catch {
    return defaultValue;
  }
};
