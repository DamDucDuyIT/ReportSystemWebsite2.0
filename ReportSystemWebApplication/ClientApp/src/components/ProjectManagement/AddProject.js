import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../store/ProjectManagement/Projects";
import { Form, Input, Button, Icon, Row, Col, DatePicker } from "antd";
import moment from "moment";

const { RangePicker } = DatePicker;
const dateFormat = "DD/MM/YYYY";
let id = 0;

// const AddProject = props => (
//   <div>
//     <h1>Friend List</h1>
//
//   </div>
// );
class AddProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: "",
      sortedInfo: null
    };
  }

  // componentDidMount() {
  //   const isLoaded = false;
  //   this.props.requestDepartments(isLoaded);
  // }

  removeMember = k => {
    const { form } = this.props;
    // can use data-binding to get
    const members = form.getFieldValue("members");
    // We need at least one passenger
    if (members.length === 1) {
      return;
    }

    // can use data-binding to set
    form.setFieldsValue({
      members: members.filter(key => key !== k)
    });
  };

  addMember = () => {
    const { form } = this.props;
    // can use data-binding to get
    const members = form.getFieldValue("members");

    const nextmembers = members.concat(id++);
    // can use data-binding to set
    // important! notify form to detect changes
    // console.log(nextmembers);
    form.setFieldsValue({
      members: nextmembers
    });
  };
  addProjectSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const rangeValue = values["projectDeadline"];
        const dates = [
          rangeValue[0].format("DD-MM-YYYY"),
          rangeValue[1].format("DD-MM-YYYY")
        ];
        values["projectDeadline"] = dates;
        console.log("Received values of form: ", values);
        this.props.addProject(values);
      }
    });
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;

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
    const addFormItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
        md: { span: 20 }
      }
    };
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 6, offset: 4 }
      }
    };
    getFieldDecorator("members", { initialValue: [] });
    const members = getFieldValue("members");
    const memberForm = members.map((k, index) => (
      <Row gutter={8}>
        <Col span={3} offset={4}>
          <Form.Item>
            {getFieldDecorator(`memberNames[${k}]`, {
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  message: "Xin nhập Tên thành viên!"
                }
              ]
            })(<Input placeholder="Tên" />)}
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item key={k}>
            {getFieldDecorator(`memberEmails[${k}]`, {
              rules: [
                {
                  required: true,
                  message: "Xin nhập Email!"
                }
              ]
            })(<Input placeholder="Email" />)}
          </Form.Item>
        </Col>

        <Col span={3}>
          <Form.Item>
            {getFieldDecorator(`memberPhoneNumbers[${k}]`, {})(
              <Input placeholder="Điện thoại" />
            )}
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item>
            {getFieldDecorator(`memberDepartments[${k}]`, {})(
              <Input placeholder="Phòng ban" />
            )}
          </Form.Item>
        </Col>

        <Col span={2}>
          <Form.Item required={false} key={k}>
            {members.length > 1 ? (
              <Icon
                className="dynamic-delete-button"
                type="minus-circle-o"
                disabled={members.length === 1}
                onClick={() => this.removeMember(k)}
              />
            ) : null}
          </Form.Item>
        </Col>
      </Row>
    ));
    return (
      <div>
        <Form onSubmit={this.addProjectSubmit} className="login-form">
          <Form.Item label="Mã" {...formItemLayout}>
            {getFieldDecorator("code", {
              rules: [
                {
                  required: true,
                  message: "Xin nhập Mã dự án!"
                }
              ]
            })(<Input />)}
          </Form.Item>
          <Form.Item label="Tên dự án" {...formItemLayout}>
            {getFieldDecorator("name", {
              rules: [
                {
                  required: true,
                  message: "Xin nhập Tên dự án!"
                }
              ]
            })(<Input />)}
          </Form.Item>
          <Form.Item label="Mô tả" {...formItemLayout}>
            {getFieldDecorator("description", {
              rules: [
                {
                  required: true,
                  message: "Xin nhập Mô tả!"
                }
              ]
            })(<Input />)}
          </Form.Item>
          <Form.Item label="Thời hạn" {...formItemLayout}>
            {getFieldDecorator("projectDeadline", {
              rules: [
                {
                  required: true,
                  message: "Xin nhập Ngày bắt đầu dự án!"
                }
              ]
            })(
              <RangePicker
                defaultValue={[
                  moment("01/01/2018", dateFormat),
                  moment("01/01/2018", dateFormat)
                ]}
                format={dateFormat}
                placeholder={["Bắt đầu", "Kết thúc"]}
              />
            )}
          </Form.Item>

          {memberForm}
          <Form.Item label="Thành viên" {...formItemLayout}>
            <Button
              type="dashed"
              onClick={this.addMember}
              style={{ width: "60%" }}
            >
              <Icon type="plus" /> Thêm thành viên
            </Button>
          </Form.Item>

          <Form.Item {...formItemLayoutWithOutLabel}>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              Tạo
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const MainComponent = Form.create()(AddProject);

export default connect(
  state => state.projectManagement_Projects,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(MainComponent);
