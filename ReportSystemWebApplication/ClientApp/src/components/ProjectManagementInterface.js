import React from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Menu, Button, Layout, Icon } from "antd";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Projects from "./ProjectManagement/Projects";
import AddProject from "./ProjectManagement/AddProject";
const SubMenu = Menu.SubMenu;
const { Sider, Content } = Layout;

const routes = [
  {
    path: "/p/projects",
    component: Projects,
    label: "Projects"
  },
  {
    path: "/p/addProject",
    component: AddProject,
    label: "AddProject"
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

export default class ProjectManagementInterface extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: false,
      composeDrawerVisible: false
    };
  }
  showComposeDrawer = () => {
    this.setState({
      composeDrawerVisible: true
    });
    console.log(this.state.composeDrawerVisible);
  };
  closeComposeDrawer = () => {
    this.setState({
      composeDrawerVisible: false
    });
    console.log(this.state.composeDrawerVisible);
  };
  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  render() {
    return (
      <Layout className="admin-body">
        <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
          <Menu
            // defaultSelectedKeys={["1"]}
            // defaultOpenKeys={["sub1"]}
            mode="inline"
            className="navmenu"
          >
            <Menu.Item key="projects">
              <Link to="/p/projects">
                <Icon type="table" />
                <span>Danh sách dự án</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="addProject">
              <Link to="/p/addProject">
                <Icon type="plus" />
                <span>Tạo dự án</span>
              </Link>
            </Menu.Item>
            {/* <Menu.Item key="department">
              <FontAwesomeIcon icon="users" className="anticon" />
              <span>Tạo dự án</span>
            </Menu.Item> */}
          </Menu>
        </Sider>
        <Content className="layout-content-body">
          <div className="">
            {routes.map((route, i) => (
              <RouteWithSubRoutes key={i} {...route} />
            ))}
          </div>
        </Content>
      </Layout>
    );
  }
}
