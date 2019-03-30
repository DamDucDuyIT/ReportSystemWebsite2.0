import { push } from "react-router-redux";
import * as authService from "../services/Authentication";
import * as dataService from "../services/DataService";
import * as signalR from "@aspnet/signalr";

const requestReplyFormType = "REQUEST_REPLYFORM";
const receiveReplyFormType = "RECEIVE_REPLYFORM";

const initialState = {
  accounts: [],
  isLoading: false,
  toEmailsOfReport: [],
  currentEmail: [],
  report: [],
  accounts: [],
  projects: []
};

export const actionCreators = {
  requestReplyForm: (isLoaded, reportId) => async (dispatch, getState) => {
    //check if user dont log in
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      if (isLoaded === getState().replyForm.isLoaded) {
        // Don't issue a duplicate request (we already have or are loading the requested
        // data)
        return;
      }
      dispatch({
        type: requestReplyFormType,
        isLoaded: true
      });

      loadReplyForm(dispatch, isLoaded, reportId);
    }
  },

  replyReport: (
    // reportId,
    // title,
    // projectId,
    toEmails,
    content,
    shortContent,
    fileList
  ) => async (dispatch, getState) => {
    try {
      const fromEmail = authService.getLoggedInUser().email;

      const report = await dataService.get(
        "api/reports/getreport/" + getState().replyForm.report.reportId
      );

      var data = {};

      data["fromEmail"] = fromEmail;
      data["title"] = report.title;
      data["projectId"] = report.projectId;
      data["toEmails"] = toEmails;
      data["content"] = content;
      data["shortContent"] = shortContent;
      data["mainReportId"] = report.reportId;
      data["isReply"] = true;
      data["isReply"] = true;
      data["departmentId"] = report.departmentId;

      var response = await dataService.post("api/reports/add", data);

      if (response.status === 200) {
        var reportId = response.data.reportId;
        if (fileList) {
          for (var i = 0; i < fileList.length; i++) {
            var fileData = {
              fileName: fileList[i].name.split(".")[0],
              title: fileList[i].name,
              reportId: reportId
            };
            var file = await dataService.post("api/files/add", fileData);

            var fileId = file.data.fileId;
            await dataService.upload("api/files/upload/" + fileId, fileList[i]);
          }
        }

        return response;
      } else {
        throw "Error!";
      }
    } catch (e) {}
  }
};

//Load Reply Form
export const loadReplyForm = async (dispatch, isLoaded, reportId) => {
  const currentEmail = authService.getLoggedInUser().email;
  const report = await dataService.get("api/reports/getreport/" + reportId);
  // const accounts = await dataService.get("api/accounts/getall");
  // const projects = await dataService.get("api/projects/getall");
  // console.log(projects);
  var emails = report.toEmails;
  if (!emails.includes(report.fromEmail)) {
    emails.push(report.fromEmail);
  }

  const toEmailsOfReport = emails.filter(e => e !== currentEmail);
  dispatch({
    type: receiveReplyFormType,

    isLoaded,
    currentEmail,
    report,
    //accounts,
    //projects,
    toEmailsOfReport
  });
};

export const reducer = (state, action) => {
  state = state || initialState;

  if (action.type === requestReplyFormType) {
    return {
      ...state,
      isLoaded: action.isLoaded
    };
  }

  if (action.type === receiveReplyFormType) {
    return {
      ...state,

      isLoaded: action.isLoaded,
      currentEmail: action.currentEmail,
      report: action.report,
      //accounts: action.accounts,
      //projects: action.projects,
      toEmailsOfReport: action.toEmailsOfReport
    };
  }

  return state;
};
