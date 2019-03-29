import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../src/store/Report";
import * as authService from "../services/Authentication";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {
  Form,
  Layout,
  Menu,
  Button,
  Input,
  Dropdown,
  Avatar,
  Drawer,
  Row,
  Col,
  Popover
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import mainLogo from "../assets/img/logo.png";
import avatar from "../assets/img/avatar.jpg";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import ComposeForm from "./ComposeForm";
import "antd/lib/icon/style";

const Search = Input.Search;

var mh = window.outerHeight;
export var maxHeight = mh - 114;
window.onresize = function(event) {
  mh = window.outerHeight;
  maxHeight = mh - 205;
};
const { Header, Content, Footer } = Layout;
const profileMenu = (
  <Menu>
    <Menu.Item key="0" onClick={() => redirect("profile")}>
      <FontAwesomeIcon
        icon="tshirt"
        className="anticon"
        style={{ color: "#437cff" }}
      />
      <span>Thông tin cá nhân</span>
    </Menu.Item>
    <Menu.Item key="1" onClick={() => redirect("a/account")}>
      <FontAwesomeIcon
        icon="cogs"
        className="anticon"
        style={{ color: "#ff463f" }}
      />
      <span>Quản trị</span>
    </Menu.Item>
    <Menu.Item key="3" onClick={logOut}>
      <FontAwesomeIcon
        icon="sign-out-alt"
        className="anticon"
        style={{ color: "rgb(84, 80, 31)" }}
      />
      <span>Đăng xuất</span>
    </Menu.Item>
  </Menu>
);
// export default class NavMenu extends React.Component {
function logOut() {
  authService.logOut();
}

function redirect(url) {
  window.location.assign(url);
}

class ReportSystem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      composeDrawerVisible: false,
      search: ""
    };
  }
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

  render() {
    return (
      <div>
        {authService.isUserAuthenticated() ? (
          <Layout>
            <Header className="layout-header">
              <Row>
                <Col span={4}>
                  <div className="left-top-navbar">
                    <div
                      className="logo-navbar"
                      onClick={() => redirect("/u/inbox/c/0")}
                    >
                      <img className="main-logo" src={mainLogo} alt="" />
                    </div>
                  </div>
                </Col>
                <Col span={14}>
                  <div className="search-global">
                    <Search
                      placeholder="Tìm kiếm trong thư"
                      onSearch={value => {
                        this.searchReport(value);
                      }}
                      enterButton
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div className="right-top-navbar">
                    <Popover
                      content={"Tạo báo cáo"}
                      trigger="hover"
                      style={{ paddingTop: 5 }}
                    >
                      <Button
                        className="btn-round"
                        type="primary"
                        size={"large"}
                        onClick={this.showComposeDrawer}
                        icon="plus"
                      >
                        Soạn
                      </Button>
                    </Popover>
                    <Popover
                      content={"Quản lý dự án"}
                      trigger="hover"
                      style={{ paddingTop: 5 }}
                    >
                      <Button
                        className="btn-round"
                        type="primary"
                        size={"large"}
                        icon="project"
                        onClick={() => redirect("p")}
                      >
                        Dự án
                      </Button>
                    </Popover>
                    <Dropdown overlay={profileMenu} trigger={["click"]}>
                      <Button
                        className="anticon profile-button avatar"
                        type="danger"
                        shape="circle"
                        ghost
                      >
                        <Avatar src={avatar} />
                      </Button>
                    </Dropdown>
                  </div>
                </Col>
              </Row>
            </Header>
            <Content className="layout-content">{this.props.children}</Content>
            <Drawer
              title="Báo cáo mới"
              placement="right"
              visible={this.state.composeDrawerVisible}
              onClose={this.closeComposeDrawer}
              placement={"left"}
              className="form-drawer compose"
            >
              <ComposeForm onClose={this.closeComposeDrawer} />
            </Drawer>
            {/* <Footer>Footer</Footer> */}
          </Layout>
        ) : window.location.pathname.includes("/resetpassword") ? (
          <ResetPassword />
        ) : (
          <Login />
        )}
      </div>
    );
  }

  searchReport(value) {
    this.props.updateParamSearch(value.trim());
  }
}

const WrappedComponent = Form.create()(ReportSystem);

// export default WrappedComponent;

export default connect(
  state => state.report,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(WrappedComponent);
