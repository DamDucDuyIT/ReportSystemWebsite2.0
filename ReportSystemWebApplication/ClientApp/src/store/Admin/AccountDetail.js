import { push } from "react-router-redux";
import * as authService from "../../services/Authentication";
import * as dataService from "../../services/DataService";
import { message } from "antd";

const requestAccountType = "REQUEST_ACCOUNT";
const receiveAccountType = "RECEIVE_ACCOUNT";

const initialState = {
  account: [],
  isLoading: false,
  hubConnection: null
};

export const actionCreators = {
  requestAccount: (isLoaded, id) => async (dispatch, getState) => {
    //check if user dont log in
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      if (isLoaded === getState().admin_AccountDetail.isLoaded) {
        // Don't issue a duplicate request (we already have or are loading the requested
        // data)
        return;
      }

      dispatch({
        type: requestAccountType,
        isLoaded,
        id
      });
      loadData(dispatch, isLoaded, id);
    }
  },
  updateAccount: data => async () => {
    const res = await dataService.put(
      "api/accounts/updatebyemail/" + data.email,
      data
    );
    console.log(res);
    return res;
  },

  changePassword: (email, password, confirmPassword) => async () => {
    const data = {
      email: email,
      password: password,
      confirmPassword: confirmPassword
    };

    const res = await dataService.put(
      "api/accounts/resetpasswordforadmin",
      data
    );

    return res;
  }
};

export const loadData = async (dispatch, isLoaded, id) => {
  const account = await dataService.get("api/accounts/getaccount/" + id);

  dispatch({
    type: receiveAccountType,
    isLoaded,
    account
  });
};

export const reducer = (state, action) => {
  state = state || initialState;

  if (action.type === requestAccountType) {
    return {
      ...state,
      isLoaded: action.isLoaded
    };
  }

  if (action.type === receiveAccountType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      account: action.account
    };
  }

  return state;
};
