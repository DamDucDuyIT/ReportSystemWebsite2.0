import React, { Component } from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Menu, Button, Layout, Badge, Icon } from "antd";
import Inbox from "./Inbox/Inbox.js";
import Sent from "./Sent/Sent.js";
const { Content } = Layout;

const routes = [
  {
    path: "/u/inbox",
    component: Inbox,
    label: "Inbox"
  },
  {
    path: "/u/sent",
    component: Sent,
    label: "Sent"
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

export default class UserInterface extends Component {
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
  handleClick = e => {
    console.log("click ", e);
    this.setState({
      current: e.key
    });
  };

  render() {
    return (
      <Layout>
        <Menu
          onClick={this.handleClick}
          selectedKeys={[this.state.current]}
          mode="horizontal"
          className="fixed-nav"
        >
          <Menu.Item key="inbox">
            <Link to="/u/inbox/c/0">
              <Icon type="mail" />
              Đã nhận
            </Link>
          </Menu.Item>
          <Menu.Item key="sent">
            <Link to="/u/sent/">
              <Icon type="appstore" />
              Đã gửi
            </Link>
          </Menu.Item>
        </Menu>
        <Content className="no-padding layout-main-content">
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
