import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, addReport } from "../../store/Admin/AccountDetail";
import {
  Form,
  Icon,
  Input,
  Button,
  Select,
  DatePicker,
  Modal,
  Col,
  message,
  Row
} from "antd";
import moment from "moment";
import mainLogo from "../../assets/img/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../assets/css/login.css";
import * as FormatDate from "../../services/FormatDate";

const { Option, OptGroup } = Select;
const { RangePicker } = DatePicker;
const dateFormat = "DD-MM-YYYY";
var newFields = {};

const ProjectDetailForm = Form.create({
  name: "global_state",

  onFieldsChange(props, changedFields) {
    props.onChange(changedFields);
  },
  mapPropsToFields(props) {
    // console.log(props);
    return {
      fullName: Form.createFormField({
        ...props.fullName,
        value: props.fullName.value
      }),
      email: Form.createFormField({
        ...props.email,
        value: props.email.value
      }),

      phoneNumber: Form.createFormField({
        ...props.phoneNumber,
        value: props.phoneNumber.value
      }),
      departmentName: Form.createFormField({
        ...props.departmentName,
        value: props.departmentName.value
      }),
      isDeleted: Form.createFormField({
        ...props.isDeleted,
        value: props.isDeleted.value ? "Tạm ngưng" : "Hoạt động"
      })
    };
  },
  onValuesChange(_, values) {
    // console.log(values);
  }
})(props => {
  const { getFieldDecorator } = props.form;
  return (
    <Form>
      <Form.Item label="Tên">
        {getFieldDecorator("fullName", {})(<Input />)}
      </Form.Item>
      <Form.Item label="Email">
        {getFieldDecorator("email", {})(<Input />)}
      </Form.Item>
      <Form.Item label="Điện thoại">
        {getFieldDecorator("phoneNumber", {})(<Input disabled />)}
      </Form.Item>
      <Form.Item label="Nhóm">
        {getFieldDecorator("departmentName", {})(<Input disabled />)}
      </Form.Item>
      <Form.Item label="Tình trạng">
        {getFieldDecorator("isDeleted", {})(<Input disabled />)}
      </Form.Item>
    </Form>
  );
});

class ProjectDetail extends React.Component {
  constructor(props) {
    super(props);
    const { data } = props;
    this.updateFields(data);
    this.state = {
      fields: newFields,
      modalVisible: false,
      passwword: "",
      confirmPassword: ""
    };

    this.handleChange = this.handleChange.bind(this);
  }

  updateFields = data => {
    newFields = {
      fullName: {
        value: data.fullName
      },
      email: {
        value: data.email
      },
      phoneNumber: {
        value: data.phoneNumber
      },
      departmentName: {
        value: data.departmentName
      },
      isDeleted: {
        value: data.isDeleted
      }
    };
    this.setState(({ fields }) => ({
      fields: { ...fields, ...newFields }
    }));
  };

  handleFormChange = changedFields => {
    this.setState(({ fields }) => ({
      fields: { ...fields, ...changedFields }
    }));
  };

  componentDidUpdate(prevProps) {
    const prevData = prevProps.data;
    const newData = this.props.data;
    if (prevData.email !== newData.email) {
      this.updateFields(newData);
    }
  }

  onSubmit = () => {
    this.form.validateFields((err, values) => {
      if (!err) {
        values.isDeleted = this.state.fields.isDeleted.value;
        this.props.updateAccount(values).then(res => {
          if (res.status === 200) {
            message.success("Đã lưu thông tin thành công!", 5);
            this.props.handleCancel();
          } else {
            message.error("Đã có lỗi trong quá trình lưu tài khoản!", 5);
          }
        });
      }
    });
  };

  render() {
    const { data } = this.props;
    const fields = this.state.fields;
    return (
      <div>
        {data ? (
          <div>
            <ProjectDetailForm
              {...fields}
              onChange={this.handleFormChange}
              ref={form => (this.form = form)}
            />
            <div className="modal-action">
              <Button
                size="large"
                className="btn btn-success btn-circle"
                onClick={this.onSubmit}
              >
                Lưu
              </Button>

              <Button
                size="large"
                className="btn btn-info btn-circle"
                onClick={() => this.modalVisible(true)}
              >
                Thay đổi mật khẩu
              </Button>
            </div>

            <Modal
              title="Thay đổi mật khẩu"
              visible={this.state.modalVisible}
              onCancel={() => this.modalVisible(false)}
              onOk={() => this.changePassword()}
              style={{ top: 20 }}
            >
              <Form className="login-form">
                <Form.Item>
                  <Row gutter={8}>
                    <Col span={18}>
                      <Input
                        name="password"
                        value={this.state.password}
                        onChange={this.handleChange}
                        type="password"
                        prefix={
                          <FontAwesomeIcon
                            icon="user"
                            style={{ color: "rgba(0,0,0,.25)" }}
                          />
                        }
                        placeholder="Mật khẩu mới"
                      />

                      <Input
                        name="confirmPassword"
                        value={this.state.confirmPassword}
                        onChange={this.handleChange}
                        type="password"
                        prefix={
                          <FontAwesomeIcon
                            icon="user"
                            style={{ color: "rgba(0,0,0,.25)" }}
                          />
                        }
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </Col>
                  </Row>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    );
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  modalVisible(modalVisible) {
    this.setState({
      modalVisible: modalVisible,
      password: "",
      confirmPassword: ""
    });
  }

  changePassword() {
    var email = this.state.fields.email.value;
    const { password, confirmPassword } = this.state;

    if (password != confirmPassword) {
      message.error("Hai mật khẩu không khớp với nhau", 5);
      return;
    }

    this.props
      .changePassword(email, password, confirmPassword)
      .then(response => {
        if (response && response.status === 200) {
          this.setState({
            modalVisible: false,
            password: "",
            confirmPassword: ""
          });
          message.success("Mật khẩu đã được thay đổi thành công.", 5);
        } else {
          message.error(response.data, 5);
        }
      });
  }
}

const Page = Form.create()(ProjectDetail);

export default connect(
  state => state.admin_AccountDetail,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Page);
