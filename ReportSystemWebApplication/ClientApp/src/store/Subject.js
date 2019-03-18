import { push } from "react-router-redux";
import * as authService from "../services/Authentication";
import * as dataService from "../services/DataService";
// import * as signalR from "@aspnet/signalr";

const requestSubjectsType = "REQUEST_SUBJECTS";
const receiveSubjectsType = "RECEIVE_SUBJECTS";

const initialState = {
  companies: [],
  subjects: [],
  isLoading: false
};

export const actionCreators = {
  requestSubjects: (isLoaded, departmentId) => async (dispatch, getState) => {
    //check if user dont log in
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      if (isLoaded === getState().subject.isLoaded) {
        // Don't issue a duplicate request (we already have or are loading the requested
        // data)
        return;
      }

      dispatch({
        type: requestSubjectsType,
        isLoaded
      });
      loadData(dispatch, isLoaded, departmentId);
    }
  }
};

export const loadData = async (dispatch, isLoaded, departmentId) => {
  // console.log("asdsad");
  const subjects = await dataService.get(
    `api/subjects/getall?departmentId=${departmentId}`
  );

  dispatch({
    type: receiveSubjectsType,
    isLoaded,
    subjects
  });
};

export const reducer = (state, action) => {
  state = state || initialState;

  if (action.type === requestSubjectsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      hubConnection: action.hubConnection
    };
  }

  if (action.type === receiveSubjectsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      subjects: action.subjects,
      companies: action.companies
    };
  }

  return state;
};
