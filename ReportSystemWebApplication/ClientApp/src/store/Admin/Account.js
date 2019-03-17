import { push } from "react-router-redux";
import * as authService from "../../services/Authentication";
import * as dataService from "../../services/DataService";
import * as signalR from "@aspnet/signalr";

const requestAccountsType = "REQUEST_ACCOUNTS";
const receiveAccountsType = "RECEIVE_ACCOUNTS";

const initialState = {
  accounts: [],
  isLoading: false,
  hubConnection: null
};

export const actionCreators = {
  requestAccount: isLoaded => async (dispatch, getState) => {
    //check if user dont log in
    if (!authService.isUserAuthenticated() || authService.isExpired()) {
      authService.clearLocalStorage();
      dispatch(push("/"));
    } else {
      if (isLoaded === getState().admin_Account.isLoaded) {
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
        type: requestAccountsType,
        isLoaded,
        hubConnection
      });
      loadData(dispatch, isLoaded);
    }
  }
};

export const loadData = async (dispatch, isLoaded) => {
  const accounts = await dataService.get("api/accounts/getall");
  dispatch({
    type: receiveAccountsType,
    isLoaded,
    accounts
  });
};

export const reducer = (state, action) => {
  state = state || initialState;

  if (action.type === requestAccountsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      hubConnection: action.hubConnection
    };
  }

  if (action.type === receiveAccountsType) {
    return {
      ...state,
      isLoaded: action.isLoaded,
      accounts: action.accounts
    };
  }


  return state;
};
