import { push } from "react-router-redux";
import * as authService from "../services/Authentication";
import * as dataService from "../services/DataService";
import * as signalR from "@aspnet/signalr";

const requestLayoutDepartmentsType = "REQUEST_LAYOUT_DEPARTMENTS";
const receiveLayoutDepartmentsType = "RECEIVE_LAYOUT_DEPARTMENTS";

const receiveUpdateLDCount = "RECEIVE_UPDATE_LD_COUNT";

const initialState = {
  departments: [],
  isLoading: false
};

export const actionCreators = {
  requestDepartments: isLoaded => async (dispatch, getState) => {
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      if (isLoaded === getState().layoutDepartment.isLoaded) {
        return;
      }
      var hubConnection = new signalR.HubConnectionBuilder()
        .withUrl("hub")
        .build();

      hubConnection.on(authService.getLoggedInUser().email, () => {
        updateCount(dispatch);
      });

      hubConnection
        .start()
        .then(() => {
          console.log("Hub connection started");
        })
        .catch(err => {
          console.log("Error while establishing connection");
        });

      dispatch({
        type: requestLayoutDepartmentsType,
        isLoaded,
        hubConnection
      });
      loadData(dispatch, isLoaded);
    }
  }
};

export const updateCount = async dispatch => {
  var departmentUnread = 0;
  var projectUnread = 0;
  const email = authService.getLoggedInUser().email;
  const departments = await dataService.get(
    `api/departments/getchilddepartmentofuser?email=${email}`
  );
  if (departments) {
    departmentUnread = departments.items[0].unread;
  }
  const projects = await dataService.get(
    `api/projects/getallprojectofuser?email=${email}`
  );
  if (projects) {
    projectUnread = projects.items[0].unread;
  }
  dispatch({
    type: receiveUpdateLDCount,
    departmentUnread,
    projectUnread
  });
};

export const loadData = async (dispatch, isLoaded) => {
  var departmentUnread = 0;
  var projectUnread = 0;
  const email = authService.getLoggedInUser().email;
  const departments = await dataService.get(
    `api/departments/getchilddepartmentofuser?email=${email}`
  );
  if (departments) {
    departmentUnread = departments.items[0].unread;
  }
  const projects = await dataService.get(
    `api/projects/getallprojectofuser?email=${email}`
  );
  if (projects) {
    projectUnread = projects.items[0].unread;
  }
  dispatch({
    type: receiveLayoutDepartmentsType,
    isLoaded,
    departmentUnread,
    projectUnread
  });
};

export const reducer = (state, action) => {
  state = state || initialState;

  if (action.type === requestLayoutDepartmentsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      hubConnection: action.hubConnection
    };
  }

  if (action.type === receiveLayoutDepartmentsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      departmentUnread: action.departmentUnread,
      projectUnread: action.projectUnread
    };
  }

  if (action.type === receiveUpdateLDCount) {
    return {
      ...state,
      departmentUnread: action.departmentUnread,
      projectUnread: action.projectUnread
    };
  }

  return state;
};
