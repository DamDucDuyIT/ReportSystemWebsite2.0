import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../store/Profile";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {
  Menu,
  Button,
  Dropdown,
  Modal,
  Row,
  message,
  Col,
  Form,
  Icon,
  Input
} from "antd";
import avatar from "../assets/img/avatar.jpg";

var newFields = {};

class Profile extends React.Component {
  constructor(props) {
    super(props);
    // console.log(data);

    this.state = { visible: false, fields: newFields };
  }
  componentDidMount() {
    this.props.requestProfile(false);
  }
  menu = (
    <Menu>
      <Menu.Item key="0">
        <span
          onClick={() => {
            const user = this.props.user;
            this.updateFields(user);
            this.setState({
              visible: true
            });
          }}
        >
          Chỉnh sửa thông tin
        </span>
      </Menu.Item>
      <Menu.Item key="1">
        <a href="#">Thay ảnh đại diện</a>
      </Menu.Item>
      <Menu.Item key="2">
        <a href="#">Đổi mật khẩu</a>
      </Menu.Item>
    </Menu>
  );
  showModal() {
    const user = this.props.user;
    this.updateFields(user);
    this.setState({
      visible: true
    });
  }

  handleOk = e => {
    console.log(e);
    this.setState({
      visible: false
    });
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false
    });
  };

  updateFields = data => {
    // console.log(data);
    console.log(data);
    newFields = {
      name: {
        value: data.name
      },
      email: {
        value: data.email
      },
      phoneNumber: {
        value: data.phoneNumber
      },
      departmentName: {
        value: data.departmentName
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

  onSubmit = data => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const isDeleted = this.props.user.isDeleted;
        data.isDeleted = isDeleted;
        this.props.updateProfile(data).then(res => {
          if (res.status === 200) {
            message.success("Đã cập nhật thông tin thành công!", 5);
            this.handleCancel();
          } else {
            message.error("Đã có lỗi trong quá trình cập nhật thông tin!", 5);
          }
        });
      }
    });

    // this.props.updateProject(data).then(res => {
    //   if (res.status === 200) {
    //     this.props.handleCancel();
    //     message.success("Đã cập nhật thông tin thành công!", 5);
    //   } else {
    //     message.error("Đã có lỗi trong quá trình cập nhật thông tin!", 5);
    //   }
    // });
  };

  render() {
    const { user } = this.props;
    const fields = this.state.fields;

    return (
      <div className="admin-body">
        <div className="profile">
          <div className="profile-card">
            <Row>
              <Col span={14} offset={5}>
                <Row>
                  <Col span={14}>
                    <div className="card-header">
                      <div className="avatar">
                        <img src={avatar} />
                      </div>
                    </div>
                  </Col>
                  {user && (
                    <Col span={10} className="right-card">
                      <div className="card-body">
                        <p className="name">{user.name}</p>
                        <p className="mail">{user.email}</p>
                        <p className="phone">{user.phoneNumber}</p>
                        <p className="department">{user.departmentName}</p>
                      </div>
                      <div className="card-footer">
                        <Dropdown
                          overlay={this.menu}
                          placement="bottomCenter"
                          trigger={["click"]}
                        >
                          <Button shape="circle" icon="setting" />
                        </Dropdown>
                      </div>
                    </Col>
                  )}
                </Row>
              </Col>
            </Row>
          </div>
        </div>
        <Modal
          className="no-footer-modal"
          title="Thông tin tài khoản"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <ProfileForm
            {...fields}
            onChange={this.handleFormChange}
            ref={form => (this.form = form)}
          />
          <div className="modal-action">
            <Button
              className="btn btn-success btn-circle"
              size="large"
              onClick={() => this.onSubmit(fields)}
              // onClick={() => this.hau(values)}
            >
              Lưu
            </Button>
          </div>
        </Modal>
      </div>
    );
  }
}

const ProfileForm = Form.create({
  name: "global_state",

  onFieldsChange(props, changedFields) {
    props.onChange(changedFields);
  },
  mapPropsToFields(props) {
    // console.log(props);
    return {
      name: Form.createFormField({
        ...props.name,
        value: props.name.value
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
      })
    };
  },
  onValuesChange(_, values) {
    // console.log(values);
  }
})(props => {
  const { getFieldDecorator, getFieldValue } = props.form;

  return (
    <Form>
      <Form.Item label="Tên">
        {getFieldDecorator("name", {
          rules: [{ required: true, message: "Không bỏ trống Tên!" }]
        })(<Input />)}
      </Form.Item>

      <Form.Item label="Email">
        {getFieldDecorator("email", {})(<Input disabled />)}
      </Form.Item>
      <Form.Item label="Điện thoại">
        {getFieldDecorator("phoneNumber", {})(<Input />)}
      </Form.Item>
      <Form.Item label="Phòng ban">
        {getFieldDecorator("departmentName", {})(<Input disabled />)}
      </Form.Item>
    </Form>
  );
});

const Page = Form.create()(Profile);

export default connect(
  state => state.profile,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Page);
