import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Layout, Menu, Badge, Icon, Spin } from "antd";
import { actionCreators } from "../../store/LayoutDepartment";
import Company from "./Company/Layout";
import Project from "./Project/Layout";

const { Content, Sider } = Layout;

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
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }
  handleChange(value) {}
  handleClick(zone) {
    this.setState({
      loading: true
    });
    if (zone === "c") {
      window.location.assign("/u/inbox/c/0");
    } else if (zone === "p") {
      window.location.assign("/u/inbox/p/0+0");
    }
  }
  componentDidMount() {
    const isLoaded = false;
    this.props.requestDepartments(isLoaded);
  }

  componentDidUpdate() {}

  render() {
    const { departmentUnread, projectUnread } = this.props;
    const { loading } = this.state;
    const link3 = window.location.pathname.split("/")[3];

    return (
      <div>
        {loading ? (
          <div
            className="loading-page"
            style={{ width: "100%", textAlign: "center", padding: "3em 0" }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <Layout className="custom-layout">
            <Sider collapsed={true}>
              <Menu
                className="collapsed-menu left-menu"
                mode="inline"
                defaultSelectedKeys={[link3]}
                style={{ lineHeight: 64, height: "100%" }}
              >
                <Menu.Item key="c" onClick={() => this.handleClick("c")}>
                  <Icon type="appstore" theme="filled" />
                  <span>Nhóm </span>
                  <Badge count={departmentUnread} className="custom-badge" />
                </Menu.Item>

                <Menu.Item key="p" onClick={() => this.handleClick("p")}>
                  <Icon type="project" theme="filled" />
                  <span>Dự án </span>
                  <Badge count={projectUnread} className="custom-badge" />
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
        )}
      </div>
    );
  }
}

export default connect(
  state => state.layoutDepartment,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(UserInterface);
