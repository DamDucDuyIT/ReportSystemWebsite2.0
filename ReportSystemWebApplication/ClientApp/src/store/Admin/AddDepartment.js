import { push } from "react-router-redux";
import * as authService from "../../services/Authentication";
import * as dataService from "../../services/DataService";
import * as signalR from "@aspnet/signalr";

const requestAddDepartmentFormType = "REQUEST_ADD_DEPARTMENT_FORM";
const receiveAddDepartmentFormType = "RECEIVE_ADD_DEPARTMENT_FORM";

const initialState = {
  departments: [],
  isLoading: false,
  hubConnection: null
};

export const actionCreators = {
  requestAddDepartmentForm: isLoaded => async (dispatch, getState) => {
    //check if user dont log in
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      if (isLoaded === getState().admin_AddDepartment.isLoaded) {
        // Don't issue a duplicate request (we already have or are loading the requested
        // data)
        return;
      }

      dispatch({
        type: requestAddDepartmentFormType,
        isLoaded
      });
      loadAddDepartmentForm(dispatch, isLoaded);
    }
  },

  reloadDepartments: departmentId => async dispatch => {
    reloadDepartments(dispatch, departmentId);
  },

  addDepartment: data => async () => {
    const res = await addDepartment(data);
    return res;
  }
};

export const loadAddDepartmentForm = async (dispatch, isLoaded) => {
  const departments = await dataService.get(`api/departments/getall?level=1`);
  dispatch({
    type: receiveAddDepartmentFormType,
    departments: departments.items,
    isLoaded
  });
};

export const loadDepartment = async departmentId => {
  const department = await dataService.get(
    `api/departments/getdepartment/${departmentId}`
  );

  return department;
};

export const addDepartment = async data => {
  const res = await dataService.post("api/departments/add", data);
  return res;
};

export const reloadDepartments = async (dispatch, departmentId) => {
  var departments = [];
  if (departmentId !== -1) {
    const department = await loadDepartment(departmentId);
    departments = department.children;
  } else {
    const depTemp = await dataService.get(`api/departments/getall?level=1`);
    departments = depTemp.items;
  }
  dispatch({
    type: receiveAddDepartmentFormType,
    departments: departments
  });
};

export const reducer = (state, action) => {
  state = state || initialState;

  if (action.type === requestAddDepartmentFormType) {
    return {
      ...state,
      isLoaded: action.isLoaded
    };
  }

  if (action.type === receiveAddDepartmentFormType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      departments: action.departments
    };
  }

  return state;
};
