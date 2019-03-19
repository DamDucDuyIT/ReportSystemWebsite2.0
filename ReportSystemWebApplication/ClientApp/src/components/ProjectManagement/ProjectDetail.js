import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../store/ProjectManagement/Projects";
import {
  Form,
  Icon,
  message,
  Tooltip,
  Input,
  Button,
  Select,
  DatePicker,
  Progress
} from "antd";
import moment from "moment";
import * as FormatDate from "../../services/FormatDate";
import * as GlobalService from "../../services/GlobalService";
import { Formik, Field, FieldArray } from "formik";

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
    // console.log(values);
  }
})(props => {
  const { getFieldDecorator, getFieldValue } = props.form;
  const dateRanges = getFieldValue("projectDeadline");
  const dates = [
    dateRanges[0].format("YYYY-MM-DD"),
    dateRanges[1].format("YYYY-MM-DD")
  ];
  const progress = GlobalService.getProgress(dates[0] + "", dates[1] + "");

  return (
    <Form>
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
            // defaultValue={[
            //   moment("01/01/2018", dateFormat),
            //   moment("01/01/2018", dateFormat)
            // ]}
            format={dateFormat}
            placeholder={["Bắt đầu", "Kết thúc"]}
          />
        )}
      </Form.Item>
      <Progress className="lg-progress" percent={progress} status="active" />
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
    // console.log(data);
    this.updateFields(data);
    this.state = {
      fields: newFields
    };
  }

  updateFields = data => {
    // console.log(data);
    var members = [];
    data.projectMembers.map(member => {
      var temp = {
        name: member.name,
        email: member.email,
        phoneNumber: member.phoneNumber,
        department: member.department
      };
      members.push(temp);
    });
    newFields = {
      projectId: {
        value: data.projectId
      },
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
      },
      members: {
        value: members
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

  // onSubmit = () => {
  //   console.log();
  //   // this.form.validateFields((err, values) => {
  //   //   if (err) return;
  //   //   console.log(values);
  //   // });
  // };

  onSubmit = (data, members) => {
    data.projectMembers = members;

    this.props.updateProject(data).then(res => {
      if (res.status === 200) {
        this.props.handleCancel();
        message.success("Đã cập nhật thông tin thành công!", 5);
      } else {
        message.error("Đã có lỗi trong quá trình cập nhật thông tin!", 5);
      }
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
            <div className="ant-form-item-label">
              <label>Danh sách thành viên</label>
            </div>
            <div className="membersForm">
              <Formik
                initialValues={{
                  members: fields.members.value
                }}
                // onSubmit={values => console.log(values)}
                render={({ values }) => (
                  <FieldArray
                    name="members"
                    render={arrayHelpers => (
                      <div className="member">
                        {values.members.map((member, index) => (
                          <div key={index}>
                            <Field
                              name={`members[${index}].name`}
                              placeholder="Tên"
                            />
                            <Field
                              name={`members[${index}].email`}
                              placeholder="Email"
                            />
                            <Field
                              name={`members[${index}].phoneNumber`}
                              placeholder="Điện thoại"
                            />
                            <Field
                              name={`members[${index}].department`}
                              placeholder="Phòng ban"
                            />
                            <Button
                              type="danger"
                              shape="circle"
                              className="minus-button"
                              onClick={() => {
                                arrayHelpers.remove(index);
                              }}
                              icon="minus"
                            />
                          </div>
                        ))}
                        <div style={{ width: "100%", textAlign: "center" }}>
                          <Tooltip placement="topLeft" title="Thêm thành viên">
                            <Button
                              type="primary"
                              shape="circle"
                              icon="plus"
                              onClick={() =>
                                arrayHelpers.push({
                                  name: "",
                                  email: "",
                                  phoneNumber: "",
                                  department: ""
                                })
                              }
                            />
                          </Tooltip>
                        </div>

                        <div className="modal-action">
                          <Button
                            className="btn btn-success btn-circle"
                            size="large"
                            onClick={() =>
                              this.onSubmit(fields, values.members)
                            }
                            // onClick={() => this.hau(values)}
                          >
                            Lưu
                          </Button>
                        </div>
                      </div>
                    )}
                  />
                )}
              />
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
  state => state.projectManagement_Projects,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Page);
