import * as dataService from "../services/DataService";
import * as authService from "../services/Authentication";
import * as signalR from "@aspnet/signalr";

const requestProfileType = "REQUEST_PROFILE";
const receiveProfileType = "RECEIVE_PROFILE";

const initialState = {
  isLoading: false,
  errorMessage: []
};

export const actionCreators = {
  requestProfile: isLoaded => async (dispatch, getState) => {
    //check if user logged in
    if (!authService.isUserAuthenticated()) {
    } else {
      if (isLoaded === getState().profile.isLoaded) {
        return;
      }

      dispatch({
        type: requestProfileType,
        isLoaded
      });
      loadProfile(dispatch, isLoaded);
    }
  },

  updateProfile: data => async dispatch => {
    const res = await UpdateProfile(data);
    loadProfile(dispatch);
    return res;
  }
};

export const loadProfile = async (dispatch, isLoaded) => {
  const currentUser = await authService.getLoggedInUser();

  const user = await dataService.get(
    `api/accounts/getaccountbyemail/${currentUser.email}`
  );
  const res = {
    name: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    departmentName: user.departmentName,
    isDeleted: user.isDeleted
  };
  dispatch({
    type: receiveProfileType,
    isLoaded,
    user: res
  });
};

export const UpdateProfile = async data => {
  const user = {
    fullName: data.name.value,
    email: data.email.value,
    departmentName: data.departmentName.value,
    phoneNumber: data.phoneNumber.value
  };
  const res = await dataService.put(
    "api/accounts/updatebyemail/" + user.email,
    user
  );

  return res;
};

export const reducer = (state, action) => {
  state = state || initialState;
  if (action.type === requestProfileType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      hubConnection: action.hubConnection
    };
  }

  if (action.type === receiveProfileType) {
    return {
      ...state,
      isLoading: false,
      isLoaded: action.isLoaded,
      user: action.user
    };
  }

  return state;
};
