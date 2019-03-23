import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../../store/Project";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Layout, Menu, Badge, Icon, Spin } from "antd";
import ReportContent from "./Content";
import * as ContentService from "./Content";
import { maxHeight } from "../../Layout";
// const Option = Select.Option;
// const { TabPane } = Tabs;
const SubMenu = Menu.SubMenu;
// const MenuItemGroup = Menu.ItemGroup;
const { Header, Content, Footer, Sider } = Layout;
export var departmentId = window.location.pathname.split("/")[4];
const routes = [
  {
    path: "/u/inbox/p/:departmentId+:projectId",
    component: ReportContent,
    label: "ReportContent"
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

class Project extends Component {
  constructor() {
    super();
    this.state = {
      loading: true
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange(value) {}
  handleClick = e => {
    departmentId = e.key;
    ContentService.callback(e.key);
    this.setState({
      currentCompany: e.key
    });
  };

  componentDidMount() {
    const isLoaded = false;
    this.props.requestProjects(isLoaded);
  }

  componentDidUpdate() {
    const { loading } = this.state;
    const { projects } = this.props;
    if (projects && loading === true) {
      this.setState({
        loading: false
      });
    }
  }

  render() {
    const { projects } = this.props;
    const { loading } = this.state;
    const allUnread = this.props.allUnread;

    return (
      <div>
        {loading === true ? (
          <div
            className="loading-page"
            style={{ width: "100%", textAlign: "center", padding: "3em 0" }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <Layout>
            <Sider className="company-menu">
              <Menu
                onClick={this.handleClick}
                defaultSelectedKeys={["0"]}
                mode="inline"
                className="menu-scroll"
                style={{ height: maxHeight, overflowY: "scroll" }}
              >
                <Menu.Item key={0} className="first-item">
                  <Link to={`/u/inbox/p/0+0`} />
                  <Icon type="mail" />
                  <span>
                    Tất cả
                    <span style={{ float: "right" }}>
                      <Badge count={allUnread} />
                    </span>
                  </span>
                </Menu.Item>
                {projects.map(
                  company =>
                    company.projects.length > 0 && (
                      <SubMenu
                        key={company.department.departmentId}
                        title={
                          <div>
                            <Icon type="mail" />
                            <span>{company.department.name}</span>
                            <span style={{ float: "right" }}>
                              <Badge count={company.unread} />
                            </span>
                          </div>
                        }
                      >
                        {company.projects.map(
                          project =>
                            project.project && (
                              <Menu.Item
                                key={`pid=${project.project.projectId}`}
                              >
                                <Link
                                  to={`/u/inbox/p/${
                                    company.department.departmentId
                                  }+${project.project.projectId}`}
                                />
                                {project.project.name}
                                <span style={{ float: "right" }}>
                                  <Badge count={project.unread} />
                                </span>
                              </Menu.Item>
                            )
                        )}
                      </SubMenu>
                    )
                )}
              </Menu>
            </Sider>
            <Content className="no-padding">
              <div>
                {routes.map((route, i) => (
                  <RouteWithSubRoutes key={i} {...route} />
                ))}
              </div>
            </Content>
          </Layout>
        )}
      </div>
    );
  }
}

export default connect(
  state => state.project,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Project);
