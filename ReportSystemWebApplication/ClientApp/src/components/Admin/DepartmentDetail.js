import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, addReport } from "../../store/Admin/Department";
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
    return {
      code: Form.createFormField({
        ...props.code,
        value: props.code.value
      }),
      name: Form.createFormField({
        ...props.name,
        value: props.name.value
      })
    };
  },
  onValuesChange(_, values) {}
})(props => {
  const { getFieldDecorator } = props.form;
  return (
    <Form>
      <Form.Item label="Mã">
        {getFieldDecorator("code", {})(<Input disabled />)}
      </Form.Item>
      <Form.Item label="Tên">
        {getFieldDecorator("name", {})(<Input />)}
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
      departmentId: data.departmentId,
      code: {
        value: data.code
      },
      name: {
        value: data.name
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
    if (prevData.code !== newData.code) {
      this.updateFields(newData);
    }
  }

  onSubmit = () => {
    this.form.validateFields((err, values) => {
      if (!err) {
        const departmentId = this.state.fields.departmentId;
        this.props.updateDepartment(departmentId, values).then(res => {
          if (res.status === 200) {
            message.success("Đã lưu thông tin thành công!", 3);
            this.props.handleCancel();
          } else {
            message.error("Đã có lỗi trong quá trình lưu tài khoản!", 3);
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
  state => state.admin_Department,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Page);
