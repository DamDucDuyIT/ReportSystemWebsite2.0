import React from "react";
import { Route } from "react-router";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Counter from "./components/Counter";
import FetchData from "./components/FetchData";
import { library } from "@fortawesome/fontawesome-svg-core";
import UserInterface from "./components/UserInterface";
import AdminInterface from "./components/AdminInterface";
import ResetPassword from "./components/ResetPassword";
import ProjectManagement from "./components/ProjectManagementInterface";
import {
  faInbox,
  faPaperPlane,
  faPlus,
  faChevronLeft,
  faChevronRight,
  faBell,
  faTshirt,
  faCogs,
  faKey,
  faTrash,
  faSignOutAlt,
  faUser,
  faUsers,
  faLock,
  faSun,
  faInfo
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faInbox,
  faPaperPlane,
  faPlus,
  faChevronLeft,
  faChevronRight,
  faBell,
  faTshirt,
  faCogs,
  faKey,
  faTrash,
  faSignOutAlt,
  faUser,
  faUsers,
  faLock,
  faSun,
  faInfo
);

var currentUrl = window.location.pathname;
if (currentUrl === "/" || currentUrl === "/u" || currentUrl === "/u/inbox/") {
  window.location.assign("/u/inbox/c/3");
} else if (currentUrl === "/p") {
  window.location.assign("/p/projects");
}

export default () => (
  <Layout>
    <Route path="/u" component={UserInterface} />
    <Route path="/a" component={AdminInterface} />
    <Route path="/p" component={ProjectManagement} />
    {/* <Route exact path="/admin/home" component={Home} /> */}
    <Route path="/login" component={Login} />
    <Route path="/resetpassword" component={ResetPassword} />
    <Route path="/counter" component={Counter} />
    <Route path="/fetch-data/:startDateIndex?" component={FetchData} />
  </Layout>
);
