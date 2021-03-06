import React, { Component, cloneElement } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actionCreators } from "../store/ResetPassword";
import { Form, Input, Button, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import mainLogo from "../assets/img/logo.png";
import "../assets/css/login.css";

class ResetPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      confirmPassword: "",
      confirmLoading: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.backToLogin = this.backToLogin.bind(this);
  }

  componentWillMount() {
    // This method runs when the component is first added to the page
    const isLoaded = false;

    var code = window.location.pathname.split("/resetpassword/")[1];

    this.props.requestResetPassword(isLoaded, code);
  }

  componentWillReceiveProps(nextProps) {
    // This method runs when incoming props (e.g., route params) change
    const isLoaded = false;
    var code = window.location.pathname.split("/resetpassword/")[1];
    this.props.requestResetPassword(isLoaded, code);
  }

  render() {
    return (
      <div className="login-page">
        <div class="container">
          <div class="box">
            <Form className="login-form">
              <Form.Item className="text-center">
                <img src={mainLogo} style={{ width: "150px" }} alt="" />
              </Form.Item>
              <Form.Item>
                <Input
                  name="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                  prefix={
                    <FontAwesomeIcon
                      icon="user"
                      style={{ color: "rgba(0,0,0,.25)" }}
                    />
                  }
                  placeholder="Email"
                />
              </Form.Item>
              <Form.Item>
                <Input
                  name="password"
                  value={this.state.password}
                  onChange={this.handleChange}
                  prefix={
                    <FontAwesomeIcon
                      icon="lock"
                      style={{ color: "rgba(0,0,0,.25)" }}
                    />
                  }
                  type="password"
                  placeholder="Mật khẩu mới"
                />
              </Form.Item>
              <Form.Item>
                <Input
                  name="confirmPassword"
                  value={this.state.confirmPassword}
                  onChange={this.handleChange}
                  prefix={
                    <FontAwesomeIcon
                      icon="lock"
                      style={{ color: "rgba(0,0,0,.25)" }}
                    />
                  }
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  loading={this.state.confirmLoading}
                  onClick={this.resetPassword}
                >
                  Xác nhận đổi mật khẩu
                </Button>

                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  onClick={this.backToLogin}
                >
                  Quay lại trang đăng nhập
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    );
  }

  resetPassword() {
    const { email, password, confirmPassword } = this.state;
    if (password !== confirmPassword) {
      message.error(
        "Mật khẩu và Nhập lại mật khẩu không khớp. Vui lòng nhập lại",
        3
      );

      return;
    }
    this.setState({
      confirmLoading: true
    });
    this.props
      .resetPassword(email, password, confirmPassword)
      .then(response => {
        this.setState({
          confirmLoading: false
        });
        if (response && response.status === 200) {
          message.success(
            "Mật khẩu đã được thay đổi thành công",
            3,
            this.backToLogin()
          );
        } else {
          message.error(response.data, 3);
        }
      });
  }

  backToLogin() {
    window.location.assign("/");
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }
}

export default connect(
  state => state.resetPassword,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(ResetPassword);
