import * as constant from "./Constant";

export const isUserAuthenticated = () => {
  const user = localStorage.getItem(constant.CURRENT_USER);
  if (user !== null) {
    return true;
  } else return false;
};

export const isExpired = () => {
  const user = getLoggedInUser();

  if (user === null) {
    return true;
  } else if (new Date(user.expires) > new Date()) {
    return false;
  } else {
    return true;
  }
};

export const clearLocalStorage = () => {
  localStorage.removeItem(constant.CURRENT_USER);
};

export const logOut = () => {
  clearLocalStorage();
  window.location.assign("/");
};

export const getLoggedInUser = () => {
  var user = {
    access_token: "",
    email: "",
    role: "",
    userName: "",
    expires: "",
    fullName: "",
    departmentId: ""
  };
  if (isUserAuthenticated()) {
    var userData = JSON.parse(localStorage.getItem(constant.CURRENT_USER));
    user = {
      access_token: userData.access_token,
      email: userData.email,
      role: userData.role,
      userName: userData.userName,
      expires: userData.expires,
      fullName: userData.fullName,
      departmentId: userData.departmentId
    };
  }
  return user;
};
