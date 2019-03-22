import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actionCreators } from "../store/Login";
import {
  Form,
  Modal,
  Input,
  Button,
  Breadcrumb,
  Row,
  Col,
  message,
  Icon,
  notification
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import mainLogo from "../assets/img/logo.png";
import "../assets/css/login.css";
import Register from "./Register";
import ForgetPassword from "./ForgetPassword";

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      registerModalVisible: false,
      resetPasswordModalVisible: false,
      confirmDirty: false,
      confirmEmailOK: false,
      confirmLoading: false,
      confirmResetLoading: false,
      loginLoading: false,
      department: "",
      departments: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    // This method runs when the component is first added to the page
    const isLoaded = false;
    this.props.requestLogIn(isLoaded);
  }

  componentWillReceiveProps(nextProps) {
    // This method runs when incoming props (e.g., route params) change
    const isLoaded = false;
    this.props.requestLogIn(isLoaded);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  confirmResetLoading = () => {
    const isValid = this.props.form.getFieldError("email");

    if (isValid === undefined) {
      this.setState({
        confirmResetLoading: true
      });
      const value = this.props.form.getFieldValue("email");

      this.props.sendResetPasswordMail(value).then(response => {
        this.setState({
          confirmResetLoading: false
        });
        if (response && response.status === 200) {
          message.success(
            "Đã gửi liên kết thay đổi mật khẩu đến mail của bạn.",
            3
          );
        } else {
          message.error(response.data, 3);
        }
      });
    }
  };

  setRegisterModalVisible(registerModalVisible) {
    this.setState({ registerModalVisible });
  }

  setResetPasswordModalVisible(resetPasswordModalVisible) {
    this.setState({ resetPasswordModalVisible });
  }

  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          loginLoading: true
        });
        const { email, password } = values;

        this.props.logIn(email, password).then(response => {
          if (response.status !== 200) {
            this.setState({
              loginLoading: false
            });
            message.error(response.data, 3);
          } else {
            message.success("Đăng nhập thành công!", 3);
            window.location.assign("/");
          }
        });
      } else {
      }
    });
    // const { email, password } = this.state;
    // if (email && password) {

    // }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="login-page">
        <div class="container">
          <div class="box">
            <Form onSubmit={this.handleSubmit} className="login-form">
              <Form.Item className="text-center">
                <img src={mainLogo} style={{ width: "150px" }} alt="" />
              </Form.Item>
              <Form.Item>
                {getFieldDecorator("email", {
                  rules: [
                    {
                      type: "email",
                      message: "Chưa đúng định dạng Email!"
                    },
                    { required: true, message: "Không để trống Email!" }
                  ]
                })(
                  <Input
                    prefix={
                      <FontAwesomeIcon
                        icon="user"
                        style={{ color: "rgba(0,0,0,.25)" }}
                      />
                    }
                    placeholder="Email"
                  />
                )}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator("password", {
                  rules: [
                    {
                      required: true,
                      message: "Please input your password!"
                    },
                    {
                      validator: this.validateToNextPassword
                    }
                  ]
                })(
                  <Input
                    prefix={
                      <FontAwesomeIcon
                        icon="lock"
                        style={{ color: "rgba(0,0,0,.25)" }}
                      />
                    }
                    type="password"
                    placeholder="Mật khẩu"
                  />
                )}
              </Form.Item>
              <div>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  loading={this.state.loginLoading}
                >
                  Đăng nhập
                </Button>
                <a
                  className="register-form"
                  onClick={() => this.setRegisterModalVisible(true)}
                >
                  Đăng ký
                </a>
                <a
                  className="login-form-forgot"
                  onClick={() => this.setResetPasswordModalVisible(true)}
                >
                  Quên mật khẩu
                </a>
              </div>
            </Form>
          </div>
        </div>
        <Modal
          title="Đăng ký"
          visible={this.state.registerModalVisible}
          style={{ top: 20 }}
          onOk={() => this.setRegisterModalVisible(false)}
          onCancel={() => this.setRegisterModalVisible(false)}
          className="no-footer-modal"
        >
          <Register />
        </Modal>

        <Modal
          title="Khôi phục mật khẩu"
          visible={this.state.resetPasswordModalVisible}
          style={{ top: 20 }}
          onOk={() => this.setResetPasswordModalVisible(false)}
          onCancel={() => this.setResetPasswordModalVisible(false)}
        >
          <ForgetPassword />
        </Modal>
      </div>
    );
  }
}

const MainComponent = Form.create()(Login);

export default connect(
  state => state.login,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(MainComponent);
