import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import router from "next/router";
import { config as projectConfig } from "../config";

const AuthHeader = (): string => {
  return `Bearer ${localStorage.getItem("authToken") || ""}`;
};

interface HTTP {
  "Accept-Language"?: string;
}

export const axiosInstance = (props: HTTP = {}): AxiosInstance => {
  const Authorization = AuthHeader();
  const { locale } = router;
  const config: AxiosRequestConfig = {
    baseURL: `${projectConfig.validatorUrl}/api`,
    // baseURL:baseUrl,
    timeout: 7000,
    headers: {
      "Cache-Control": "no-cache",
      Authorization,
      "Accept-Language": locale || "EN",
      ...props,
    },
  };
  return axios.create(config);
};
