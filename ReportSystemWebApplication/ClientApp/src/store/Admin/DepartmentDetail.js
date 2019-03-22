import { push } from "react-router-redux";
import * as authService from "../../services/Authentication";
import * as dataService from "../../services/DataService";
import { message } from "antd";

const requestDepartmentType = "REQUEST_DEPARTMENT";
const receiveDepartmentType = "RECEIVE_DEPARTMENT";

const initialState = {
  department: [],
  isLoading: false,
  hubConnection: null
};

export const actionCreators = {
  requestDepartment: (isLoaded, id) => async (dispatch, getState) => {
    //check if user dont log in
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      if (isLoaded === getState().admin_DepartmentDetail.isLoaded) {
        // Don't issue a duplicate request (we already have or are loading the requested
        // data)
        return;
      }

      dispatch({
        type: requestDepartmentType,
        isLoaded,
        id
      });
      loadDepartment(dispatch, isLoaded, id);
    }
  },

  updateDepartment: (departmentId, data) => async () => {
    const res = await UpdateDepartment(departmentId, data);

    return res;
  }
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
  return res;
};

export const reducer = (state, action) => {
  state = state || initialState;

  if (action.type === requestDepartmentType) {
    return {
      ...state,
      isLoaded: action.isLoaded
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
