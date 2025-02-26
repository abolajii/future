import { authSignal, noauthSignal } from ".";

export const logIn = async (data) => {
  const response = await noauthSignal.post("/login", data);
  return response.data;
};

export const getMe = async () => {
  const response = await authSignal.get("/me");
  return response.data;
};

export const updateRecentCapital = () => {
  return authSignal.get("/update-capital");
};

export const creatExpense = async (data) => {
  try {
    const response = await authSignal.post("/withdraw", data);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const addDeposit = async (data) => {
  try {
    const response = await authSignal.post("/add/deposit", data);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllDeposits = async () => {
  try {
    const response = await authSignal.get("/deposits");
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteDeposit = async (id) => {
  try {
    const response = await authSignal.delete(`/delete/deposit/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteWithdrawal = async (id) => {
  try {
    const response = await authSignal.delete(`/delete/withdrawal/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getSignalForTheDay = async () => {
  try {
    const response = await authSignal.get("/signal");
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getStats = async () => {
  try {
    const response = await authSignal.get("/signal/stats");
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getRevenue = async () => {
  try {
    const response = await authSignal.get("/revenue");
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getExpenses = async () => {
  try {
    const response = await authSignal.get("/withdraw");
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
