import axios from "../api/axios";
import useAuth from "./useAuth";
import { jwtDecode } from "jwt-decode";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    const response = await axios.post("/api/v1/auth/refresh-token", null, {
      headers: {
        "Content-Type": "application/json",
      },

      withCredentials: true,
    });
    try {
      const access_token = response?.data?.access_token;
      const decoded = jwtDecode(access_token);
      setAuth((prev) => {
        return {
          ...prev,
          id: response?.data?.id,
          user: response?.data?.username,
          roles: decoded.roles || [],
          permissions: decoded.permissions || [],
          access_token: access_token,
          refresh_token: response?.data?.refresh_token,
          firstName: response?.data?.firstName || "N/A",
          lastName: response?.data?.lastName || "N/A",
          email: response?.data?.email || "N/A",
          phoneNumber: response?.data?.phoneNumber || "N/A",
          avatar: response?.data?.avatar,
        };
      });

      return access_token;
    } catch (error) {
      console.error("Eroare la decodificarea token-ului:", error);
    }
    return response.data.access_token;
  };
  return refresh;
};

export default useRefreshToken;
