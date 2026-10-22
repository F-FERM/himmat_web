export const logout = () => {
  localStorage.removeItem("access_token");
  window.location.href = "/admin/login/";
};