import * as dataService from "../services/DataService";
import * as authService from "../services/Authentication";
import * as constant from "../services/Constant";
import { push } from "react-router-redux";

const requestLogInType = "REQUEST_LOGIN";
const receiveLogInType = "RECEIVE_LOGIN";

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

  sendResetPasswordMail: email => async (dispatch, getState) => {
    var res = await dataService.post(
      "api/accounts/generateresetpasswordcode/" + email
    );

    return res;
  },

  logIn: (email, password) => async (dispatch, getState) => {
    const data = {
      email: email,
      password: password
    };

    var res = await dataService.login(data);

    if (res.status === 200 && res.data.access_token) {
      localStorage.removeItem(constant.CURRENT_USER);
      localStorage.setItem(constant.CURRENT_USER, JSON.stringify(res.data));
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

  return state;
};
