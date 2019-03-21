import * as dataService from "../services/DataService";

const requestRegisterForm = "REQUEST_REGISTER_FOMR";
const receiveRegisterForm = "RECEIVE_REGISTER_FOMR";

const initialState = {
  isLoading: false,
  errorMessage: []
};

export const actionCreators = {
  requestRegisterForm: isLoaded => async (dispatch, getState) => {
    console.log(isLoaded, getState().register.isLoaded);
    if (isLoaded === getState().register.isLoaded) {
      return;
    } else {
      dispatch({
        type: requestRegisterForm,
        isLoaded
      });
      loadRegisterForm(dispatch, isLoaded);
    }
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

  sendResetPasswordMail: email => async (dispatch, getState) => {
    var res = await dataService.post(
      "api/accounts/generateresetpasswordcode/" + email
    );

    return res;
  },

  register: inputData => async () => {
    const data = {
      Email: inputData.email,
      Password: inputData.password,
      ConfirmationCode: inputData.confirmCode,
      DepartmentId: inputData.departmentId,
      FullName: inputData.fullName,
      PhoneNumber: inputData.phoneNumber
    };

    var res = await dataService.post(`api/accounts/register`, data);
    return res;
  }
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

  return department;
};

export const reducer = (state, action) => {
  state = state || initialState;
  if (action.type === requestRegisterForm) {
    return {
      ...state,
      isLoading: true,
      isLoaded: action.isLoaded
    };
  }

  if (action.type === receiveRegisterForm) {
    return {
      ...state,
      isLoading: false,
      isLoaded: action.isLoaded,
      departments: action.departments
    };
  }

  return state;
};
