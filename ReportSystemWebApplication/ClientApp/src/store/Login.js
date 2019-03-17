import * as dataService from "../services/DataService";
import * as authService from "../services/Authentication";
import * as constant from "../services/Constant";
import { push } from "react-router-redux";

const requestLogInType = "REQUEST_LOGIN";
const receiveLogInType = "RECEIVE_LOGIN";

const requestRegisterForm = "REQUEST_REGISTER_FOMR";
const receiveRegisterForm = "RECEIVE_REGISTER_FOMR";

const initialState = {
  isLoading: false,
  errorMessage: []
};

export const actionCreators = {
  requestLogIn: isLoaded => async (dispatch, getState) => {
    //check if user logged in
    if (authService.isUserAuthenticated()) {
      //dispatch(push("/Dashboard"));
    } else {
      if (isLoaded === getState().login.isLoaded) {
        // Don't issue a duplicate request (we already have or are loading the requested
        // data)
        return;
      }
      dispatch({
        type: requestLogInType,
        isLoaded
      });
      loadData(dispatch, isLoaded, getState().login.errorMessage);
    }
  },

  requestRegisterForm: isLoaded => async dispatch => {
    dispatch({
      type: requestRegisterForm,
      isLoaded
    });
    loadRegisterForm(dispatch, isLoaded);
  },

  reloadDepartments: departmentId => async dispatch => {
    var departments = [];
    if (departmentId !== -1) {
      const department = await loadDeparment(departmentId);
      departments = department.children;
    } else {
      const depTemp = await dataService.get(`api/departments/getall?level=1`);
      departments = depTemp.items;
    }
    dispatch({
      type: receiveRegisterForm,
      departments: departments
    });
  },

  confirmEmail: email => async (dispatch, getState) => {
    const data = {
      Email: email
    };

    var res = await dataService.post(
      `api/accounts/generateconfirmationcode`,
      data
    );

    return res;
  },

  register: inputData => async () => {
    console.log(inputData);
    const data = {
      Email: inputData.email,
      Password: inputData.password,
      ConfirmationCode: inputData.confirmCode,
      DepartmentId: inputData.departmentId,
      FullName: inputData.fullName,
      PhoneNumber: inputData.phoneNumber
    };

    var res = await dataService.post(`api/accounts/register`, data);
    console.log(res);
    return res;
  },

  logIn: (email, password) => async (dispatch, getState) => {
    const data = {
      email: email,
      password: password
    };

    var res = await dataService.login(data);

    if (res && res.access_token) {
      localStorage.removeItem(constant.CURRENT_USER);
      localStorage.setItem(constant.CURRENT_USER, JSON.stringify(res));
      window.location.reload();
    } else {
      const isLoaded = getState().login.isLoaded;
      const errorMessage = "You have entered an invalid username or password";
      loadData(dispatch, isLoaded, errorMessage);
    }
    return res;
  }
};

export const loadData = async (dispatch, isLoaded, errorMessage) => {
  dispatch({
    type: receiveLogInType,
    isLoaded,
    errorMessage
  });
};

export const loadRegisterForm = async (dispatch, isLoaded) => {
  const departments = await dataService.get(`api/departments/getall?level=1`);
  dispatch({
    type: receiveRegisterForm,
    departments: departments.items,
    isLoaded
  });
};

export const loadDeparment = async departmentId => {
  const department = await dataService.get(
    `api/departments/getdepartment/${departmentId}`
  );
  console.log(department);
  return department;
};

export const reducer = (state, action) => {
  state = state || initialState;
  if (action.type === requestLogInType) {
    return {
      ...state,
      isLoading: true,
      isLoaded: action.isLoaded
    };
  }

  if (action.type === receiveLogInType) {
    return {
      ...state,
      isLoading: false,
      isLoaded: action.isLoaded,
      errorMessage: action.errorMessage
    };
  }
  if (action.type === requestRegisterForm) {
    return {
      ...state,
      isLoaded: action.isLoaded
    };
  }

  if (action.type === receiveRegisterForm) {
    return {
      ...state,
      isLoading: false,
      departments: action.departments,
      isLoaded: action.isLoaded
    };
  }

  return state;
};
