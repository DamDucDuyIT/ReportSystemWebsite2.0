import * as dataService from "../services/DataService";

const initialState = {
  isLoading: false,
  errorMessage: []
};

export const actionCreators = {
  sendResetPasswordMail: email => async () => {
    var res = await dataService.post(
      "api/accounts/generateresetpasswordcode/" + email
    );

    return res;
  }
};

export const reducer = (state, action) => {
  state = state || initialState;

  return state;
};
