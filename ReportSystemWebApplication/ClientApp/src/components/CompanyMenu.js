import React from "react";
import { Link } from "react-router-dom";
import { Menu, Button, Input, Badge, Dropdown } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./NavMenu.css";
import mainLogo from "../assets/img/logo.png";
import avatar from "../assets/img/avatar.jpg";

const SubMenu = Menu.SubMenu;
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

export default class NavMenu extends React.Component {
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
      <div style={{ width: 256, display: "inline-block" }}>
        <Menu
          defaultSelectedKeys={["1"]}
          defaultOpenKeys={["sub1"]}
          mode="inline"
          inlineCollapsed={this.state.collapsed}
        >
          <div className="compose-menu-item">
            <Button type="primary" size="large">
              <FontAwesomeIcon icon="plus" className="anticon" />
              <span>Soạn thư</span>
            </Button>
          </div>
          <Menu.Item key="1">
            <FontAwesomeIcon icon="inbox" className="anticon" />
            <span>Hộp thư</span>
          </Menu.Item>
          <Menu.Item key="2">
            <FontAwesomeIcon icon="paper-plane" className="anticon" />
            <span>Đã gửi</span>
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}
