import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import thunk from "redux-thunk";
import { routerReducer, routerMiddleware } from "react-router-redux";

import * as Login from "./Login";
import * as Register from "./Register";
import * as ResetPassword from "./ResetPassword";
import * as ForgetPassword from "./ForgetPassword";

import * as ComposeForm from "./ComposeForm";

import * as LayoutDepartment from "./LayoutDepartment";

import * as Department from "./Department";
import * as Project from "./Project";
import * as Profile from "./Profile";

import * as ProjectManagement_Projects from "./ProjectManagement/Projects";

import * as Report from "./Report";
import * as Admin_Account from "./Admin/Account";
import * as Admin_AccountDetail from "./Admin/AccountDetail";
import * as Admin_Department from "./Admin/Department";
import * as Admin_DepartmentDetail from "./Admin/DepartmentDetail";
import * as Admin_AddDepartment from "./Admin/AddDepartment";

export default function configureStore(history, initialState) {
  const reducers = {
    login: Login.reducer,
    register: Register.reducer,
    resetPassword: ResetPassword.reducer,
    forgetPassword: ForgetPassword.reducer,

    layoutDepartment: LayoutDepartment.reducer,

    composeForm: ComposeForm.reducer,
    report: Report.reducer,

    department: Department.reducer,
    project: Project.reducer,
    profile: Profile.reducer,

    admin_Account: Admin_Account.reducer,
    admin_AccountDetail: Admin_AccountDetail.reducer,
    admin_Department: Admin_Department.reducer,
    admin_DepartmentDetail: Admin_DepartmentDetail.reducer,
    admin_AddDepartment: Admin_AddDepartment.reducer,

    projectManagement_Projects: ProjectManagement_Projects.reducer
  };

  const middleware = [thunk, routerMiddleware(history)];

  // In development, use the browser's Redux dev tools extension if installed
  const enhancers = [];
  const isDevelopment = process.env.NODE_ENV === "development";
  if (
    isDevelopment &&
    typeof window !== "undefined" &&
    window.devToolsExtension
  ) {
    enhancers.push(window.devToolsExtension());
  }

  const rootReducer = combineReducers({
    ...reducers,
    routing: routerReducer
  });

  return createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(...middleware),
      ...enhancers
    )
  );
}
