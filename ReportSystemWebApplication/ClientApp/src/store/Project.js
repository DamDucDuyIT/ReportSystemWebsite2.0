import { push } from "react-router-redux";
import * as authService from "../services/Authentication";
import * as dataService from "../services/DataService";
import * as signalR from "@aspnet/signalr";

const requestProjectsType = "REQUEST_PROJECTS";
const receiveProjectsType = "RECEIVE_PROJECTS";

const receiveUpdatePCount = "RECEIVE_UPDATE_P_COUNT";

const initialState = {
  projects: undefined,
  isLoading: false,
  allUnread: 0
};

export const actionCreators = {
  requestProjects: isLoaded => async (dispatch, getState) => {
    //check if user dont log in
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      if (isLoaded === getState().project.isLoaded) {
        // Don't issue a duplicate request (we already have or are loading the requested
        // data)
        return;
      }

      var hubConnection = new signalR.HubConnectionBuilder()
        .withUrl("hub")
        .build();

      hubConnection.on(authService.getLoggedInUser().email, () => {
        updateCount(dispatch);
      });

      hubConnection.on(
        authService.getLoggedInUser().email + "_NewReport",
        (report, title) => {
          updateCount(dispatch);
        }
      );

      hubConnection
        .start()
        .then(() => {
          console.log("Hub connection started");
        })
        .catch(err => {
          console.log("Error while establishing connection");
        });

      dispatch({
        type: requestProjectsType,
        isLoaded,
        hubConnection
      });
      loadData(dispatch, isLoaded);
    }
  }
};

export const updateCount = async dispatch => {
  const email = authService.getLoggedInUser().email;
  const projects = await dataService.get(
    `api/projects/getallprojectofuser?email=${email}`
  );

  var allUnread = await dataService.get(
    "api/reports/getnumberofunreadreportproject/" + email
  );
  dispatch({
    type: receiveProjectsType,
    projects: projects.items,
    allUnread
  });
};

export const loadData = async (dispatch, isLoaded) => {
  const email = authService.getLoggedInUser().email;
  const projects = await dataService.get(
    `api/projects/getallprojectofuser?email=${email}`
  );

  var allUnread = await dataService.get(
    "api/reports/getnumberofunreadreportproject/" + email
  );
  dispatch({
    type: receiveUpdatePCount,
    isLoaded,
    projects: projects.items,
    allUnread
  });
};

export const reducer = (state, action) => {
  state = state || initialState;

  if (action.type === requestProjectsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      hubConnection: action.hubConnection
    };
  }

  if (action.type === receiveProjectsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      projects: action.projects,
      allUnread: action.allUnread
    };
  }

  if (action.type === receiveUpdatePCount) {
    return {
      ...state,
      projects: action.projects,
      allUnread: action.allUnread
    };
  }

  return state;
};
