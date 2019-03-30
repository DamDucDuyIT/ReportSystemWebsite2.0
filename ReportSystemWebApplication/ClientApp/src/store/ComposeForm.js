import { push } from "react-router-redux";
import * as authService from "../services/Authentication";
import * as dataService from "../services/DataService";
import * as signalR from "@aspnet/signalr";
import { departmentId } from "./../components/Inbox/Company/Layout";

const requestComposeFormType = "REQUEST_COMPOSEFORM";
const receiveComposeFormType = "RECEIVE_COMPOSEFORM";

// const requestReplyFormType = "REQUEST_REPLYFORM";
// const receiveReplyFormType = "RECEIVE_REPLYFORM";

const receiveResponseType = "RECEIVE_RESPONSE";

const initialState = {
  accounts: [],
  isLoading: false,
  hubConnection: null,
  isSent: false,
  toEmailsOfReport: []
};

export var addSuccess = false;

export const actionCreators = {
  requestComposeForm: isLoaded => async (dispatch, getState) => {
    //check if user dont log in
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      if (isLoaded === getState().composeForm.isLoaded) {
        // Don't issue a duplicate request (we already have or are loading the requested
        // data)
        return;
      }

      dispatch({
        type: requestComposeFormType,
        isLoaded: true
      });
      loadComposeForm(dispatch, isLoaded);
    }
  }
  // requestReplyForm: (isLoaded, reportId) => async (dispatch, getState) => {
  //   //check if user dont log in
  //   if (!authService.isUserAuthenticated() || authService.isExpired()) {
  //     authService.clearLocalStorage();
  //     dispatch(push("/"));
  //   } else {
  //     console.log(isLoaded);
  //     console.log(getState().composeForm.isLoaded);
  //     if (isLoaded === getState().composeForm.isLoaded) {
  //       // Don't issue a duplicate request (we already have or are loading the requested
  //       // data)
  //       return;
  //     }
  //     dispatch({
  //       type: requestReplyFormType,
  //       isLoaded: true
  //     });
  //     loadReplyForm(dispatch, isLoaded, reportId);
  //   }
  // }

  // addReport: (data, content, shortContent) => async (dispatch, state) => {
  //   const fromEmail = authService.getLoggedInUser().email;
  //   data["fromEmail"] = fromEmail;
  //   data["projectId"] = null;
  //   data["content"] = content;
  //   data["shortContent"] = shortContent;

  //   const response = await dataService.post("api/reports/add", data);

  //   if (response.status === 200) {
  //     await dispatch({
  //       type: receiveResponseType,
  //       response: response.status,
  //       isSent: true
  //     });
  //     console.log("success:" + response.status);
  //   } else {
  //     console.log("failed:" + response.status);
  //   }
  // }
};

export const addReport = async (data, content, shortContent, fileList) => {
  try {
    const fromEmail = authService.getLoggedInUser().email;
    const departmentId = authService.getLoggedInUser().departmentId;
    data["fromEmail"] = fromEmail;
    data["content"] = content;
    data["shortContent"] = shortContent;
    data["departmentId"] = departmentId;
    const response = await dataService.post("api/reports/add", data);

    if (response.status === 200 && fileList) {
      var reportId = response.data.reportId;
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

    return response.status;
  } catch (e) {}
};

// export const replyReport = async (
//   reportId,
//   title,
//   projectId,
//   toEmails,
//   content,
//   shortContent,
//   fileList
// ) => {
//   try {
//     const fromEmail = authService.getLoggedInUser().email;

//     const report = await dataService.get("api/reports/getreport/" + reportId);
//     var data = {};

//     data["fromEmail"] = fromEmail;
//     data["title"] = title;
//     data["projectId"] = report.projectId;
//     data["toEmails"] = toEmails;
//     data["content"] = content;
//     data["shortContent"] = shortContent;
//     data["mainReportId"] = reportId;
//     data["isReply"] = true;
//     data["isReply"] = true;
//     data["departmentId"] = report.departmentId;
//     console.log(data);

//     const response = await dataService.post("api/reports/add", data);

//     if (response.status === 200) {
//       var reportId = response.data.reportId;
//       for (var i = 0; i < fileList.length; i++) {
//         var fileData = {
//           fileName: fileList[i].name.split(".")[0],
//           title: fileList[i].name,
//           reportId: reportId
//         };
//         var file = await dataService.post("api/files/add", fileData);

//         var fileId = file.data.fileId;
//         await dataService.upload("api/files/upload/" + fileId, fileList[i]);
//       }
//     }

//     // const response = {};
//     // response["status"] = 200
//     return response.status;
//   } catch (e) {}
// };

// Load Compose Form
export const loadComposeForm = async (dispatch, isLoaded) => {
  const currentEmail = authService.getLoggedInUser().email;
  const accounts = await dataService.get(
    "api/accounts/getallinbranch/" + authService.getLoggedInUser().departmentId
  );
  const projects = await dataService.get(
    "api/projects/getallprojectofuser?email=" + currentEmail
  );
  dispatch({
    type: receiveComposeFormType,
    isLoaded,
    currentEmail,
    accounts,
    projects
  });
};

//Load Reply Form
// export const loadReplyForm = async (dispatch, isLoaded, reportId) => {
//   const currentEmail = authService.getLoggedInUser().email;
//   const report = await dataService.get("api/reports/getreport/" + reportId);
//   const accounts = await dataService.get("api/accounts/getall");
//   const projects = await dataService.get(
//     "api/projects/getallprojectofuser?email=a@a.com"
//   );

//   var emails = report.toEmails;
//   if (!emails.includes(report.fromEmail)) {
//     emails.push(report.fromEmail);
//   }

//   const toEmailsOfReport = emails.filter(e => e !== currentEmail);
//   dispatch({
//     type: receiveReplyFormType,
//     isLoaded,
//     currentEmail,
//     report,
//     accounts,
//     projects,
//     toEmailsOfReport
//   });
// };

export const reducer = (state, action) => {
  state = state || initialState;

  if (action.type === requestComposeFormType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      hubConnection: action.hubConnection
    };
  }

  if (action.type === receiveComposeFormType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      currentEmail: action.currentEmail,
      accounts: action.accounts,
      projects: action.projects
    };
  }

  // if (action.type === requestReplyFormType) {
  //   return {
  //     ...state,
  //     isLoaded: action.isLoaded,
  //     hubConnection: action.hubConnection
  //   };
  // }

  // if (action.type === receiveReplyFormType) {
  //   return {
  //     ...state,
  //     isLoaded: action.isLoaded,
  //     currentEmail: action.currentEmail,
  //     report: action.report,
  //     accounts: action.accounts,
  //     projects: action.projects,
  //     toEmailsOfReport: action.toEmailsOfReport
  //   };
  // }

  if (action.type === receiveResponseType) {
    return {
      ...state,
      response: action.response,
      isSent: state.isSent
    };
  }

  return state;
};
