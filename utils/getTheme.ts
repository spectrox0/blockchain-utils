import Cookies from "universal-cookie";
import { ICookies } from "cookies";
import { getCookie } from "./getCookie";

const initialCookies = new Cookies();

export const getInitialTheme = (
  cookies: Cookies | ICookies = initialCookies
): boolean => {
  return !!getCookie("vendTheme", "true", cookies);
};
