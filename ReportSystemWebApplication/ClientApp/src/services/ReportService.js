import * as authService from "./Authentication";

const userEmail = authService.getLoggedInUser().email;

export const isRead = report => {
  var toEmail = report.to.find(r => r.email === userEmail);
  if (!toEmail) {
    return true;
  } else if (toEmail.isRead) {
    return true;
  }
  return false;
};
