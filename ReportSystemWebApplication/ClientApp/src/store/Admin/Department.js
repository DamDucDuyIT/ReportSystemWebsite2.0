import { push } from "react-router-redux";
import * as authService from "../../services/Authentication";
import * as dataService from "../../services/DataService";
import * as signalR from "@aspnet/signalr";

const requestDepartmentsType = "REQUEST_DEPARTMENTS";
const receiveDepartmentsType = "RECEIVE_DEPARTMENTS";

const requestDepartmentType = "REQUEST_DEPARTMENT";
const receiveDepartmentType = "RECEIVE_DEPARTMENT";

const initialState = {
  departments: [],
  isLoading: false,
  hubConnection: null
};

export const actionCreators = {
  requestDepartments: isLoaded => async (dispatch, getState) => {
    //check if user dont log in
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      if (isLoaded === getState().admin_Department.isLoaded) {
        // Don't issue a duplicate request (we already have or are loading the requested
        // data)
        return;
      }

      var hubConnection = new signalR.HubConnectionBuilder()
        .withUrl("/hub?email=" + authService.getLoggedInUser().email)
        .build();

      hubConnection.on("LoadData", () => {
        loadData(dispatch, isLoaded);
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
        type: requestDepartmentsType,
        isLoaded,
        hubConnection
      });
      loadData(dispatch, isLoaded);
    }
  },

  requestDepartment: (isLoaded, id) => async dispatch => {
    dispatch({
      type: requestDepartmentType,
      isLoaded,
      id
    });
    loadDepartment(dispatch, isLoaded, id);
    // return res;
  },

  updateDepartment: (departmentId, data) => async dispatch => {
    const res = await UpdateDepartment(departmentId, data);
    if (res.status === 200) {
      loadData(dispatch);
    }
    return res;
  }
};

export const loadData = async (dispatch, isLoaded) => {
  const departments = await dataService.get("api/departments/getall");

  dispatch({
    type: receiveDepartmentsType,
    isLoaded,
    departments: departments.items
  });
};

export const loadDepartment = async (dispatch, isLoaded, id) => {
  const department = await dataService.get(
    `api/departments/getdepartment/${id}`
  );

  dispatch({
    type: receiveDepartmentType,
    isLoaded,
    department
  });
};

export const UpdateDepartment = async (departmentId, data) => {
  const department = await dataService.get(
    `api/departments/getdepartment/${departmentId}`
  );
  department.name = data.name;
  const res = await dataService.put(
    `api/departments/update/${departmentId}`,
    department
  );
  console.log(res);
  return res;
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
      departments: action.departments
    };
  }

  if (action.type === requestDepartmentType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      hubConnection: action.hubConnection
    };
  }

  if (action.type === receiveDepartmentType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      department: action.department
    };
  }

  return state;
};
