import React from "react";
import { connect } from "react-redux";
// import { bindActionCreators } from "redux";
// import { actionCreators, addReport } from "../store/ComposeForm";
import { Form, Icon, Switch, Input, Button, Select, DatePicker } from "antd";
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
      name: Form.createFormField({
        ...props.name,
        value: props.name.value
      }),
      code: Form.createFormField({
        ...props.code,
        value: props.code.value
      }),
      createOn: Form.createFormField({
        ...props.createOn,
        value: props.createOn.value
      }),
      description: Form.createFormField({
        ...props.description,
        value: props.description.value
      }),
      projectDeadline: Form.createFormField({
        ...props.projectDeadline,
        value: props.projectDeadline.value
      }),
      isDeleted: Form.createFormField({
        ...props.isDeleted,
        value: props.isDeleted.value ? "Tạm ngưng" : "Hoạt động"
      }),
      reportNumbers: Form.createFormField({
        ...props.reportNumbers,
        value: props.reportNumbers.value
      })
    };
  },
  onValuesChange(_, values) {
    console.log(values);
  }
})(props => {
  const { getFieldDecorator } = props.form;
  return (
    <Form layout="inline">
      <Form.Item label="Mã">
        {getFieldDecorator("code", {})(<Input disabled />)}
      </Form.Item>
      <Form.Item label="Tên">
        {getFieldDecorator("name", {
          rules: [{ required: true, message: "Không bỏ trống Tên!" }]
        })(<Input />)}
      </Form.Item>
      <Form.Item label="Ngày tạo">
        {getFieldDecorator("createOn", {})(<Input disabled />)}
      </Form.Item>
      <Form.Item label="Mô tả">
        {getFieldDecorator("description", {})(<Input />)}
      </Form.Item>
      <Form.Item label="Thời hạn">
        {getFieldDecorator("projectDeadline", {})(
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
      <Form.Item label="Tình trạng">
        {getFieldDecorator("isDeleted", {})(<Input disabled />)}
      </Form.Item>
      <Form.Item label="Số lượng báo cáo">
        {getFieldDecorator("reportNumbers", {})(<Input disabled />)}
      </Form.Item>
    </Form>
  );
});

class ProjectDetail extends React.Component {
  constructor(props) {
    super(props);
    const { data } = props;
    console.log(data);
    this.updateFields(data);
    this.state = {
      fields: newFields
    };
  }

  updateFields = data => {
    newFields = {
      name: {
        value: data.name
      },
      code: {
        value: data.code
      },
      createOn: {
        value: FormatDate.formatDate(data.createOn)
      },
      description: {
        value: data.description
      },
      projectDeadline: {
        value: [
          moment(FormatDate.formatDate(data.from), dateFormat),
          moment(FormatDate.formatDate(data.to), dateFormat)
        ]
      },
      isDeleted: {
        value: data.isDeleted
      },
      reportNumbers: {
        value: data.reports.length
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
    if (prevData.projectId !== newData.projectId) {
      this.updateFields(newData);
    }
  }

  onSubmit = () => {
    this.form.validateFields((err, values) => {
      if (err) return;
      console.log(values);
    });
  };

  render() {
    const { data } = this.props;
    const fields = this.state.fields;
    // console.log(data);
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
                className="btn btn-success btn-circle"
                size="large"
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

export default connect()(Page);
//   state => state.project,
//   dispatch => bindActionCreators(actionCreators, dispatch)
