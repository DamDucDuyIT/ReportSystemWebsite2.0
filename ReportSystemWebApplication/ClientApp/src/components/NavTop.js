import React from "react";
import { Link } from "react-router-dom";
import { Menu, Button, Input, Badge, Dropdown } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./NavMenu.css";
import mainLogo from "../assets/img/logo.png";
import avatar from "../assets/img/avatar.jpg";

const Search = Input.Search;

const profileMenu = (
  <Menu>
    <Menu.Item key="0">
      <FontAwesomeIcon
        icon="tshirt"
        className="anticon"
        style={{ color: "#437cff" }}
      />
      <span>Trang cá nhân</span>
    </Menu.Item>
    <Menu.Item key="1">
      <FontAwesomeIcon
        icon="cogs"
        className="anticon"
        style={{ color: "#ff463f" }}
      />
      <span>Cài đặt</span>
    </Menu.Item>
    <Menu.Item key="3">
      <FontAwesomeIcon
        icon="key"
        className="anticon"
        style={{ color: "#ffce1a" }}
      />
      <span>Đổi mật khẩu</span>
    </Menu.Item>
  </Menu>
);

export default class NavTop extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: false
    };
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  render() {
    return (
      <div className="top-sidebar">
        <div className="left-top-navbar">
          <Button
            type="primary"
            onClick={this.toggleCollapsed}
            className="collapse-navbar-button"
          >
            <FontAwesomeIcon
              icon={this.state.collapsed ? "chevron-right" : "chevron-left"}
            />
          </Button>
          <div className="logo-navbar">
            <img className="main-logo" src={mainLogo} alt="" />
          </div>
        </div>

        <div className="search-global">
          <Search
            placeholder="Tìm kiếm trong thư"
            onSearch={value => console.log(value)}
            enterButton
          />
        </div>

        <div className="right-top-navbar">
          <Badge count={5} className="nofi-button">
            <Button shape="circle" ghost>
              <FontAwesomeIcon icon="bell" />
            </Button>
          </Badge>
          <Dropdown overlay={profileMenu} trigger={["click"]}>
            <Button
              className="anticon profile-button"
              type="danger"
              shape="circle"
              ghost
            >
              <img src={avatar} alt="" style={{ width: "100%" }} />
            </Button>
          </Dropdown>
        </div>
      </div>
    );
  }
}
