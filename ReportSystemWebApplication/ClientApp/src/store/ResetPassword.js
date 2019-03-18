import * as dataService from "../services/DataService";
import * as constant from "../services/Constant";

const requestResetPasswordType = "REQUEST_RESETPASSWORD";
const receiveResetPasswordType = "RECEIVE_RESETPASSWORD";

const initialState = {
  isLoading: false,
  errorMessage: []
};

export const actionCreators = {
  requestResetPassword: (isLoaded, code) => async (dispatch, getState) => {
    if (isLoaded === getState().resetPassword.isLoaded) {
      // Don't issue a duplicate request (we already have or are loading the requested
      // data)
      return;
    }

    localStorage.removeItem(constant.CURRENT_USER);

    dispatch({
      type: requestResetPasswordType,
      isLoaded,
      code
    });
  },

  resetPassword: (email, password, confirmPassword) => async (
    dispatch,
    getState
  ) => {
    var data = {
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      code: getState().resetPassword.code
    };

    console.log(data);

    var res = await dataService.post(`api/accounts/resetpassword`, data);

    return res;
  }
};

export const reducer = (state, action) => {
  state = state || initialState;
  if (action.type === requestResetPasswordType) {
    return {
      ...state,
      isLoading: true,
      isLoaded: action.isLoaded,
      code: action.code
    };
  }

  if (action.type === receiveResetPasswordType) {
    return {
      ...state,
      isLoading: false
    };
  }

  return state;
};
