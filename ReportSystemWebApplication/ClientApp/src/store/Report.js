import { push } from "react-router-redux";
import * as authService from "../services/Authentication";
import * as dataService from "../services/DataService";
import * as signalR from "@aspnet/signalr";

const requestReportsType = "REQUEST_REPORTS";
const receiveReportsType = "RECEIVE_REPORTS";

const requestSentReportsType = "REQUEST_SENT_REPORTS";
const receiveSentReportsType = "RECEIVE_SENT_REPORTS";

const requestReportType = "REQUEST_REPORT";
const receiveReportType = "RECEIVE_REPORT";

const requestReportsByProjectType = "REQUEST_REPORTSBYPROJECT";
const receiveReportsByProjectType = "RECEIVE_REPORTSBYPROJECT";

const initialState = {
  reports: [],
  isLoading: false,
  hubConnectionDepartment: [],
  hubConnectionProject: [],
  start: 1,
  end: 1
};

export const actionCreators = {
  requestReports: (departmentId, isLoaded) => async (dispatch, getState) => {
    //check if user dont log in
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      if (isLoaded === getState().report.isLoaded) {
        // Don't issue a duplicate request (we already have or are loading the requested
        // data)
        return;
      }

      ///////////////////
      var hubConnectionDepartment = new signalR.HubConnectionBuilder()
        .withUrl("hub")
        .build();

      hubConnectionDepartment.on(authService.getLoggedInUser().email, () => {
        const departmentId = window.location.pathname.split("/")[4];
        if (window.location.pathname.split("/")[3] === "c") {
          loadData(dispatch, departmentId, getState().report.isLoaded);
        } else if (window.location.pathname.split("/")[2] === "sent") {
          loadSentReports(dispatch, getState().report.isLoaded);
        }
      });

      hubConnectionDepartment.on(
        authService.getLoggedInUser().email + "_NewReport",
        (report, title) => {
          const departmentId = window.location.pathname.split("/")[4];
          if (window.location.pathname.split("/")[3] === "c") {
            loadData(dispatch, departmentId, getState().report.isLoaded);
          } else if (window.location.pathname.split("/")[2] === "sent") {
            loadSentReports(dispatch, getState().report.isLoaded);
          }
        }
      );

      hubConnectionDepartment
        .start()
        .then(() => {
          console.log("Hub connection started");
        })
        .catch(err => {
          console.log("Error while establishing connection");
        });

      ///////////////////

      dispatch({
        type: requestReportsType,
        isLoaded,
        hubConnectionDepartment
      });
      loadData(dispatch, departmentId, isLoaded);
    }
  },

  requestSentReports: isLoaded => async (dispatch, getState) => {
    //check if user dont log in
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      dispatch({
        type: requestSentReportsType,
        isLoaded
      });
      loadSentReports(dispatch, isLoaded);
    }
  },
  requestReportsByProject: (
    departmentId,
    projectId,
    page,
    pageSize,
    isLoaded
  ) => async (dispatch, getState) => {
    //check if user dont log in
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      if (isLoaded === getState().report.isLoaded) {
        // Don't issue a duplicate request (we already have or are loading the requested
        // data)
        return;
      }

      ///////////////////
      var hubConnectionProject = new signalR.HubConnectionBuilder()
        .withUrl("hub")
        .build();

      const defaultId = window.location.pathname.split("/")[4];
      const splitId = defaultId.split("+");
      hubConnectionProject.on(authService.getLoggedInUser().email, () => {
        if (window.location.pathname.split("/")[3] === "p") {
          loadReportsByProject(
            dispatch,
            splitId[0],
            splitId[1],
            getState().report.isLoaded
          );
        }
      });

      hubConnectionProject.on(
        authService.getLoggedInUser().email + "_NewReport",
        (report, title) => {
          if (window.location.pathname.split("/")[3] === "p") {
            loadReportsByProject(
              dispatch,
              splitId[0],
              splitId[1],
              getState().report.isLoaded
            );
          }
        }
      );

      hubConnectionProject
        .start()
        .then(() => {
          console.log("Hub connection started");
        })
        .catch(err => {
          console.log("Error while establishing connection");
        });

      ///////////////////

      dispatch({
        type: requestReportsByProjectType,
        isLoaded,
        hubConnectionProject
      });
      loadReportsByProject(
        dispatch,
        departmentId,
        projectId,
        page,
        pageSize,
        isLoaded
      );
    }
  },

  reloadData: departmentId => async (dispatch, getState) => {
    const isLoaded = getState().report.isLoaded;
    await loadData(dispatch, departmentId, isLoaded);
  },

  reloadByProject: (departmentId, projectId, page, pageSize) => async (
    dispatch,
    getState
  ) => {
    const isLoaded = false;
    loadReportsByProject(
      dispatch,
      departmentId,
      projectId,
      page,
      pageSize,
      isLoaded
    );
  },

  loadReport: reportId => async dispatch => {
    const report = await dataService.get("api/reports/getreport/" + reportId);

    dispatch({
      type: receiveReportType,
      report
    });
  },

  readReport: item => async dispatch => {
    try {
      if (item) {
        await dataService.put(
          "api/applicationuserreports/update/" + item.applicationUserReportId,
          item
        );
      }
    } catch (e) {}
  },

  download: (fileId, fileName) => async (dispatch, getState) => {
    await dataService.download(`api/files/download/` + fileId, fileName);
  },

  loadNext: (departmentId, projectId, page, pageSize) => async (
    dispatch,
    getState
  ) => {
    loadReportsByProject(dispatch, departmentId, projectId, page, pageSize);
  }
};

export const loadData = async (dispatch, departmentId, isLoaded) => {
  const userEmail = authService.getLoggedInUser().email;

  var reports = [];
  if (departmentId === "0" || departmentId === undefined) {
    reports = await dataService.get(`api/reports/getall?toemail=${userEmail}`);
  } else {
    reports = await dataService.get(
      `api/reports/getreportsindepartmentofuser?toemail=${userEmail}&departmentId=${departmentId}`
    );
  }

  dispatch({
    type: receiveSentReportsType,
    isLoaded,
    reports: reports.items
  });
};

export const loadSentReports = async (dispatch, isLoaded) => {
  const userEmail = authService.getLoggedInUser().email;

  var reports = await dataService.get(
    `api/reports/getall?senderemail=${userEmail}`
  );

  dispatch({
    type: receiveReportsType,
    isLoaded,
    reports: reports.items
  });
};

export const loadReportsByProject = async (
  dispatch,
  departmentId,
  projectId,
  page,
  pageSize,
  isLoaded
) => {
  const userEmail = authService.getLoggedInUser().email;
  var reports = [];

  if (departmentId === "0" && projectId === "0") {
    // reports = await dataService.get(
    //   `api/reports/getall?isHaveproject=true&toemail=${userEmail}`
    // );
    reports = await dataService.get(
      `api/reports/getall?isHaveproject=true&toemail=${userEmail}&page=${page}&pagesize=${pageSize}`
    );
  } else {
    if (projectId === "0") {
      // reports = await dataService.get(
      //   `api/reports/getall?isHaveproject=true&toDepartmentId=${departmentId}&toemail=${userEmail}`
      // );
      reports = await dataService.get(
        `api/reports/getall?isHaveproject=true&toDepartmentId=${departmentId}&toemail=${userEmail}&page=${page}&pagesize=${pageSize}`
      );
    } else {
      // reports = await dataService.get(
      //   `api/reports/getall?projectId=${projectId}&isHaveproject=true&toemail=${userEmail}`
      // );
      reports = await dataService.get(
        `api/reports/getall?isHaveproject=true&projectId=${projectId}&toemail=${userEmail}&page=${page}&pagesize=${pageSize}`
      );
    }
  }

  const start = pageSize * (page - 1) + 1;
  const end = start + (reports.items.length - 1);

  isLoaded = true;
  dispatch({
    type: receiveReportsByProjectType,
    isLoaded,
    departmentId,
    projectId,
    reports: reports.items,
    totalItems: reports.totalItems,
    start,
    end
  });
};

export const reducer = (state, action) => {
  state = state || initialState;

  if (action.type === requestReportsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      hubConnectionDepartment: action.hubConnectionDepartment
    };
  }

  if (action.type === receiveReportsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      departmentId: action.departmentId,
      reports: action.reports
    };
  }

  if (action.type === requestSentReportsType) {
    return {
      ...state,
      isLoaded: action.isLoaded
    };
  }

  if (action.type === receiveSentReportsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      reports: action.reports
    };
  }

  if (action.type === requestReportType) {
    return {
      ...state,
      isLoaded: action.isLoaded
    };
  }

  if (action.type === receiveReportType) {
    return {
      ...state,
      report: action.report
    };
  }

  if (action.type === requestReportsByProjectType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      hubConnectionProject: action.hubConnectionProject
    };
  }

  if (action.type === receiveReportsByProjectType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      departmentId: action.departmentId,
      projectId: action.projectId,
      reports: action.reports,
      totalItems: action.totalItems,
      start: action.start,
      end: action.end
    };
  }

  return state;
};
