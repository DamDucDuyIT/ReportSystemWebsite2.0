import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Menu, Layout } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Account from "./Admin/Account";
import AccountDetail from "./Admin/AccountDetail";
import Department from "./Admin/Department";
import AddDepartment from "./Admin/AddDepartment";

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
  },
  {
    path: "/a/adddepartment",
    component: AddDepartment,
    label: "AddDepartment"
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

export default class AdminInterface extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: false,
      composeDrawerVisible: false,
      activeItem: window.location.pathname.split("/")[2]
    };
  }

  componentWillReceiveProps(nextProps) {
    const currentLocation = this.props.location.pathname;
    const nextLocation = nextProps.location.pathname;

    const current = currentLocation.split("/")[2];
    const next = nextLocation.split("/")[2];
    if (current !== next) {
      this.setState({
        activeItem: next
      });
    }
  }
  compo;
  showComposeDrawer = () => {
    this.setState({
      composeDrawerVisible: true
    });
  };
  closeComposeDrawer = () => {
    this.setState({
      composeDrawerVisible: false
    });
  };
  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };
  setActive = item => {
    this.setState({
      activeItem: item
    });
  };

  render() {
    const { activeItem } = this.state;
    return (
      <Layout className="admin-body">
        <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
          <Menu
            defaultSelectedKeys={[activeItem]}
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
              <Link
                to="/a/department"
                onClick={() => this.setActive("department")}
              >
                <FontAwesomeIcon icon="building" className="anticon" />
                <span>Phòng ban</span>
              </Link>
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
