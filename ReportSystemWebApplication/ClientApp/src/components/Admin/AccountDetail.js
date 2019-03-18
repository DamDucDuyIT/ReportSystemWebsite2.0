import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, addReport } from "../../store/Admin/AccountDetail";
import { Form, Icon, message, Input, Button, Select, DatePicker } from "antd";
import moment from "moment";
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
      fields: newFields
    };
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
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    );
  }
}

const Page = Form.create()(ProjectDetail);

export default connect(
  state => state.admin_AccountDetail,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Page);
