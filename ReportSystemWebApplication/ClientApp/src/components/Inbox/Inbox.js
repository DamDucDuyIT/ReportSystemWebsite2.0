import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {
  Row,
  Col,
  List,
  Button,
  Layout,
  Breadcrumb,
  Menu,
  Select,
  Tabs,
  Badge,
  Icon
} from "antd";
import { actionCreators } from "../../store/LayoutDepartment";
import Company from "./Company/Layout";
import Project from "./Project/Layout";
import * as ProjectContentService from "./Project/Content";
import * as CompanyContentService from "./Company/Content";
import { CompanyTotalUnread } from "./Company/Layout";

const { Header, Content, Footer, Sider } = Layout;

const routes = [
  {
    path: "/u/inbox/c",
    component: Company,
    label: "Company"
  },
  {
    path: "/u/inbox/p",
    component: Project,
    label: "Project"
  }
];

function RouteWithSubRoutes(route) {
  return (
    <Route
      // exact={activeOnlyWhenExact}
      path={route.path}
      render={props => (
        // pass the sub-routes down to keep nesting
        <route.component {...props} routes={route.routes} />
      )}
    />
  );
}

class UserInterface extends Component {
  handleChange(value) {}
  handleClick(zone) {
    if (zone === "c") {
      CompanyContentService.reload();
    } else if (zone === "p") {
      ProjectContentService.reload();
    }
  }
  componentDidMount() {
    const isLoaded = false;
    this.props.requestDepartments(isLoaded);
  }

  render() {
    const { departmentUnread, projectUnread } = this.props;
    const link3 = window.location.pathname.split("/")[3];

    return (
      <Layout className="custom-layout">
        <Sider collapsed={true}>
          <Menu
            className="collapsed-menu left-menu"
            mode="inline"
            defaultSelectedKeys={[link3]}
            style={{ lineHeight: 64, height: "100%" }}
          >
            <Menu.Item key="c" onClick={() => this.handleClick("c")}>
              <Link to={`/u/inbox/c/0`}>
                <Icon type="appstore" theme="filled" />
                <span>Nhóm </span>
                <Badge count={departmentUnread} className="custom-badge" />
              </Link>
            </Menu.Item>

            <Menu.Item key="p" onClick={() => this.handleClick("p")}>
              <Link to={`/u/inbox/p/0+0`}>
                <Icon type="project" theme="filled" />
                <span>Dự án </span>
                <Badge count={projectUnread} className="custom-badge" />
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Content className="no-padding">
          <Layout>
            {routes.map((route, i) => (
              <RouteWithSubRoutes key={i} {...route} />
            ))}
          </Layout>
        </Content>
      </Layout>
    );
  }
}

export default connect(
  state => state.layoutDepartment,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(UserInterface);
