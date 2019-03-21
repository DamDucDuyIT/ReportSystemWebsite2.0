import React, { Component, cloneElement } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actionCreators } from "../store/Register";
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

class Register extends Component {
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

    this.departmentChange = this.departmentChange.bind(this);
  }

  componentDidMount() {
    const isLoaded = false;
    this.props.requestRegisterForm(isLoaded);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  registerSuccessed() {
    message.success("Đã đăng ký thành công!", 3);
  }

  registerFailed() {
    message.error("Đã có lỗi trong quá trình tạo tài khoản!", 3);
  }

  handleRegisterAccount = e => {
    e.preventDefault();
    const { departments } = this.state;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (departments.length > 0) {
          const department = departments[departments.length - 1];
          values.departmentId = department.departmentId;

          this.props.register(values).then(response => {
            if (response == undefined || response.status === 200) {
              this.setState({
                registerModalVisible: false
              });
              this.resetForm;
              this.registerSuccessed;
              notification.open({
                message: "Thành công",
                duration: 3,
                description: "Đã tạo tài khoản thành công!",
                icon: <Icon type="warning" style={{ color: "#108ee9" }} />
              });
              window.location.assign("/");
            } else {
              notification.open({
                message: "Lỗi",
                duration: 3,
                description: "Đã có lỗi trong quá trình tạo tài khoản!",
                icon: <Icon type="warning" style={{ color: "#108ee9" }} />
              });
            }
          });
        } else {
          alert("Nothing to see!");
        }
      }
    });
  };

  resetForm = () => {
    this.props.form.resetFields();
    this.props.reloadDepartments(-1);
    this.setState({
      departments: []
    });
  };

  confirmEmail = () => {
    const isValid = this.props.form.getFieldError("email");

    if (isValid === undefined) {
      this.setState({
        confirmLoading: true
      });
      const value = this.props.form.getFieldValue("email");
      this.props.confirmEmail(value).then(response => {
        this.setState({
          confirmLoading: false
        });
        if (response && response.status === 200) {
          this.setState({
            confirmEmailOK: true
          });
        } else {
          message.error(response.data, 3);
        }
      });
    }
  };

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
    const isLoaded = false;
    this.props.requestRegisterForm(isLoaded);
    this.setState({ registerModalVisible });
  }

  setResetPasswordModalVisible(resetPasswordModalVisible) {
    this.setState({ resetPasswordModalVisible });
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue("password")) {
      callback("Mật khẩu chưa trùng khớp!");
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(["confirm"], { force: true });
    }
    callback();
  };

  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  departmentChange = e => {
    this.setState({ department: e.target.value });
  };

  reloadDepartments = department => {
    this.props.reloadDepartments(department.departmentId);
    const departments = this.state.departments;
    this.setState({
      departments: [...departments, department]
    });
  };

  removeAfter = departmentId => {
    const { departments } = this.state;
    var list = [];
    if (departmentId !== -1) {
      for (let department of departments) {
        list.push(department);
        if (department.departmentId === departmentId) {
          break;
        }
      }
    }

    this.props.reloadDepartments(departmentId);
    this.setState({
      departments: list
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { departments } = this.props;
    return (
      <Form onSubmit={this.handleRegisterAccount} className="login-form">
        <Form.Item label="Email">
          <Row gutter={8}>
            <Col span={18}>
              {getFieldDecorator("email", {
                rules: [
                  {
                    type: "email",
                    message: "Email chưa đúng!"
                  },
                  { required: true, message: "Xin nhập Email!" }
                ]
              })(<Input />)}
            </Col>
            <Col span={6}>
              <Button
                type="primary"
                icon="check-circle"
                loading={this.state.confirmLoading}
                onClick={this.confirmEmail}
              >
                Xác nhận
              </Button>
            </Col>
          </Row>
        </Form.Item>

        <div style={{ display: this.state.confirmEmailOK ? "block" : "none" }}>
          <Form.Item label="Mã xác nhận">
            {getFieldDecorator("confirmCode", {
              rules: [
                {
                  required: true,
                  message: "Xin nhập Mã xác nhận!"
                }
              ]
            })(<Input />)}
          </Form.Item>
          <Form.Item label="Họ và Tên">
            {getFieldDecorator("fullName", {
              rules: [
                {
                  required: true,
                  message: "Xin nhập Họ và Tên!"
                }
              ]
            })(<Input />)}
          </Form.Item>
          <Form.Item label="Điện thoại">
            {getFieldDecorator("phoneNumber", {})(<Input />)}
          </Form.Item>
          <Form.Item label="Mật khẩu">
            {getFieldDecorator("password", {
              rules: [
                {
                  required: true,
                  message: "Xin nhập Mật khẩu!"
                },
                {
                  validator: this.validateToNextPassword
                }
              ]
            })(<Input type="password" />)}
          </Form.Item>
          <Form.Item label="Nhập lại mật khẩu">
            {getFieldDecorator("confirm", {
              rules: [
                {
                  required: true,
                  message: "Xin nhập lại Mật khẩu!"
                },
                {
                  validator: this.compareToFirstPassword
                }
              ]
            })(<Input type="password" onBlur={this.handleConfirmBlur} />)}
          </Form.Item>
          <Form.Item label="Phòng ban">
            <Breadcrumb separator=">" className="department-list">
              <Breadcrumb.Item>
                <span
                  className="link-type"
                  onClick={() => this.removeAfter(-1)}
                >
                  X
                </span>
              </Breadcrumb.Item>
              {this.state.departments.map(department => (
                <Breadcrumb.Item>
                  <span
                    className="link-type"
                    onClick={() => this.removeAfter(department.departmentId)}
                  >
                    {department.name}
                  </span>
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
            {departments && (
              <div className="department-zone">
                {departments.map(department => (
                  <p
                    onClick={() => this.reloadDepartments(department)}
                    className="link"
                  >
                    {department.name}
                  </p>
                ))}
              </div>
            )}
          </Form.Item>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

const MainComponent = Form.create()(Register);

export default connect(
  state => state.register,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(MainComponent);
