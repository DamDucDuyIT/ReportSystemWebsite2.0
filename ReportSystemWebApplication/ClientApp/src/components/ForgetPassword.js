import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { actionCreators } from "../store/ForgetPassword";
import { Form, Input, Button, Row, Col, message } from "antd";

class ForgetPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      confirmResetLoading: false
    };
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

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form className="">
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
                  // { validator: this.checkNull }
                ]
              })(<Input />)}
            </Col>
            <Col span={6}>
              <Button
                type="primary"
                icon="check-circle"
                loading={this.state.confirmResetLoading}
                onClick={this.confirmResetLoading}
              >
                Xác nhận
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    );
  }
}

const MainComponent = Form.create()(ForgetPassword);

export default connect(
  state => state.forgetPassword,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(MainComponent);
