import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../store/Admin/AddDepartment";
import { Form, Input, Button, Breadcrumb, message } from "antd";

class AddDepartment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      departments: []
    };
  }

  componentDidMount() {
    this.props.requestAddDepartmentForm(false);
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { departments } = this.state;
        if (departments.length > 0) {
          const department = departments[departments.length - 1];
          values.parentId = department.departmentId;
        } else {
          values.parentId = null;
        }
        values.isDeleted = false;
        this.props.addDepartment(values).then(res => {
          if (res.status === 200) {
            message.success("Tạo phòng bàn thành công!", 3);
            // this.props.form.resetFields();
            // this.reloadDepartments(-1);
            // this.setState({
            //   departments: []
            // });
            window.location.reload();
          } else {
            message.error("Tạo phòng ban không thành công!", 3);
          }
        });
      }
    });
  };

  reloadDepartments = department => {
    const { reloadDepartments } = this.props;

    if (department !== -1) {
      reloadDepartments(department.departmentId);
    } else {
      reloadDepartments(-1);
    }
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
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
        md: { span: 6 }
      }
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 6, offset: 4 }
      }
    };

    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <Form.Item label="Mã" {...formItemLayout}>
          {getFieldDecorator("code", {
            rules: [
              {
                required: true,
                message: "Xin nhập Mã phòng ban!"
              }
            ]
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Tên phòng ban" {...formItemLayout}>
          {getFieldDecorator("name", {
            rules: [
              {
                required: true,
                message: "Xin nhập Tên phòng ban!"
              }
            ]
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Thuộc phòng ban" {...formItemLayout}>
          <Breadcrumb separator=">" className="department-list">
            <Breadcrumb.Item>
              <span className="link-type" onClick={() => this.removeAfter(-1)}>
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
        <Form.Item {...formItemLayoutWithOutLabel}>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            loading={this.state.addLoading}
          >
            Tạo
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

const MainComponent = Form.create()(AddDepartment);

export default connect(
  state => state.admin_AddDepartment,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(MainComponent);
