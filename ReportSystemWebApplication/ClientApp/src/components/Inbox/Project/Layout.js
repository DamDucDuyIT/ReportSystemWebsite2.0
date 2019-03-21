import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../../store/Project";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Row, Col, List, Layout, Menu, Select, Tabs, Badge, Icon } from "antd";
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
    this.state = {};
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
    var departments = this.props.projects.items;
    var companies2 = [];
    if (departments !== undefined) {
      departments.forEach(function(department) {
        if (department.level === 1) {
          companies2.push(department);
        }
      });
    }
  }

  render() {
    const { projects } = this.props;
    console.log(projects);
    return (
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
              <span>Tất cả</span>
            </Menu.Item>
            {projects &&
              projects.map(
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
                            <Menu.Item key={`pid=${project.project.projectId}`}>
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
    );
  }
}

export default connect(
  state => state.project,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Project);
