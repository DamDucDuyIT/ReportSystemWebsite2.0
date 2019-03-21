import { push } from "react-router-redux";
import * as authService from "../services/Authentication";
import * as dataService from "../services/DataService";
import * as signalR from "@aspnet/signalr";

const requestDepartmentsType = "REQUEST_DEPARTMENTS";
const receiveDepartmentsType = "RECEIVE_DEPARTMENTS";

const requestUpdateCount = "REQUEST_HAU";
const receiveUpdateCount = "RECEIVE_HAU";
// const requestDepartmentsByProjectType = "REQUEST_DEPARTMENTSBYPROJECT";
// const receiveDepartmentsByProjectType = "RECEIVE_DEPARTMENTSBYPROJECT";

const initialState = {
  departments: [],
  isLoading: false,
  hubConnection: [],
  allUnread: 0
};

export const actionCreators = {
  requestDepartmentsByCompany: isLoaded => async (dispatch, getState) => {
    //check if user dont log in
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      if (isLoaded === getState().department.isLoaded) {
        // Don't issue a duplicate request (we already have or are loading the requested
        // data)
        return;
      }
      ///////////////////
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

      ///////////////////

      dispatch({
        type: requestDepartmentsType,
        isLoaded,
        hubConnection
      });
      loadData(dispatch, isLoaded);
    }
  }
  // requestDepartmentsByProject: (isLoaded, departmentId) => async (
  //   dispatch,
  //   getState
  // ) => {
  //   //check if user dont log in
  //   if (!authService.isUserAuthenticated() || authService.isExpired()) {
  //     authService.clearLocalStorage();
  //     dispatch(push("/"));
  //   } else {
  //     if (isLoaded === getState().department.isLoaded) {
  //       // Don't issue a duplicate request (we already have or are loading the requested
  //       // data)
  //       return;
  //     }

  //     dispatch({
  //       type: requestDepartmentsByProjectType,
  //       isLoaded
  //     });
  //     loadDataByProject(dispatch, isLoaded);
  //   }
  // }
};

export const updateCount = async dispatch => {
  var departmentList = {
    items: []
  };
  var totalUnread = 0;
  // departmentList.push("items");
  const email = authService.getLoggedInUser().email;
  const departments = await dataService.get(
    `api/departments/getchilddepartmentofuser?email=${email}`
  );
  departments.items.forEach(company => {
    var cont = false;
    company.grandChildDepartments.forEach(child => {
      if (cont === true) {
        return;
      }
      if (child.lastestReport !== null) {
        departmentList.items.push(company);
        cont = true;
      }
    });
  });
  if (departments && departments.items.length > 0) {
    totalUnread = departments.items[0].unread;
  }

  var allUnread = await dataService.get(
    "api/reports/getnumberofunreadreportdepartment/" + email
  );

  allUnread;
  dispatch({
    type: receiveUpdateCount,
    departments: departmentList,
    totalUnread,
    allUnread
  });
};

export const loadData = async (dispatch, isLoaded) => {
  // console.log("asdsad");
  var departmentList = {
    items: []
  };
  var totalUnread = 0;
  // departmentList.push("items");
  const email = authService.getLoggedInUser().email;
  const departments = await dataService.get(
    `api/departments/getchilddepartmentofuser?email=${email}`
  );
  departments.items.forEach(company => {
    var cont = false;
    company.grandChildDepartments.forEach(child => {
      if (cont === true) {
        return;
      }
      if (child.lastestReport !== null) {
        departmentList.items.push(company);
        cont = true;
      }
    });
  });
  if (departments && departments.items.length > 0) {
    totalUnread = departments.items[0].unread;
  }

  var allUnread = await dataService.get(
    "api/reports/getnumberofunreadreportdepartment/" + email
  );

  // console.log(totalUnread);
  // console.log(departmentList);
  dispatch({
    type: receiveDepartmentsType,
    isLoaded,
    departments: departmentList,
    totalUnread,
    allUnread
  });
};

export const reducer = (state, action) => {
  state = state || initialState;

  if (action.type === requestDepartmentsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      hubConnection: action.hubConnection
    };
  }

  if (action.type === receiveDepartmentsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      departments: action.departments,
      totalUnread: action.totalUnread,
      allUnread: action.allUnread
    };
  }

  if (action.type === receiveUpdateCount) {
    return {
      ...state,
      departments: action.departments,
      totalUnread: action.totalUnread,
      allUnread: action.allUnread
    };
  }

  return state;
};
