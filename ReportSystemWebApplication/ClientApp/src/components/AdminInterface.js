import React from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Menu, Button, Layout } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Account from "./Admin/Account";
import AccountDetail from "./Admin/AccountDetail";
import Department from "./Admin/Department";
const SubMenu = Menu.SubMenu;
const { Sider, Content } = Layout;

const routes = [
  {
    path: "/a/account",
    component: Account,
    label: "Account"
  },
  {
    path: "/a/accountdetail/:id?",
    component: AccountDetail,
    label: "AccountDetail"
  },
  {
    path: "/a/department",
    component: Department,
    label: "Department"
  }

  // {
  //   path: "/admin",
  //   component: AdminInterface,
  //   label: "AdminInterface"
  // }
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

export default class AdminInterface extends React.Component {
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
            defaultSelectedKeys={["account"]}
            defaultOpenKeys={["sub1"]}
            mode="inline"
            className="navmenu"
          >
            <Menu.Item key="account">
              <Link to="/a/account">
                <FontAwesomeIcon icon="user" className="anticon" />
                <span>Tài Khoản</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="department">
              <Link to="/a/department">
                <FontAwesomeIcon icon="building" className="anticon" />
                <span>Phòng ban</span>
              </Link>
            </Menu.Item>
            {/* <Menu.Item key="department">
              <FontAwesomeIcon icon="users" className="anticon" />
              <span>Nhóm Tài Khoản</span>
            </Menu.Item> */}
            <Menu.Item key="subject">
              <FontAwesomeIcon icon="sun" className="anticon" />
              <span>Danh Mục Chủ Đề</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Content>
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

// export default connect()(AdminInterface);
