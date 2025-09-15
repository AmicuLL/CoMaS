import axios from "axios";
import { APP_CONFIG } from "../config/config";

export default axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
});

export const axiosPrivate = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  params: {},
  withCredentials: true,
});

axios.defaults.withCredentials = true;
