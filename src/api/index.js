import axios from "axios";

const prod = true;

const BASE_URL = prod
  ? "https://masked-be.vercel.app/api/v1"
  : "http://localhost:4030/api/v1";

const getToken = () => {
  return localStorage.getItem("token");
};

// Add getMe function
const getMe = async () => {
  try {
    const response = await authSignal.get("/me");
    if (response.data.success) {
      return {
        success: true,
        user: response.data.user,
      };
    }
    throw new Error("Failed to get user data");
  } catch (error) {
    throw error;
  }
};

const noauthSignal = axios.create({
  baseURL: BASE_URL,
});

const authSignal = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export { noauthSignal, authSignal, getMe };
