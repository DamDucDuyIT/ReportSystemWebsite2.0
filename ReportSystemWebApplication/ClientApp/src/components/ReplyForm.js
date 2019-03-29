import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../store/ReplyForm";
import { Form, Icon, Input, Button, Select, message } from "antd";
import * as authService from "../services/Authentication";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";

// import { Editor } from "@tinymce/tinymce-react";
import "jodit";
import "jodit/build/jodit.min.css";
import JoditEditor from "jodit-react";

const userEmail = authService.getLoggedInUser().email;
class ComposeForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: "",
      shortContent: "",
      responseList: [],
      selectedItems: [],
      toEmails: [],
      fileList: [],
      loading: false
    };
    this.updateContent = this.updateContent.bind(this);
  }
  componentDidMount() {
    const isLoaded = false;
    const { report } = this.props;

    if (report) {
      if (report.reportId !== this.props.reportId) {
        this.props.requestReplyForm(!this.props.isLoaded, this.props.reportId);
      } else {
        this.props.requestReplyForm(isLoaded, this.props.reportId);
      }
    } else {
      this.props.requestReplyForm(isLoaded, this.props.reportId);
    }
  }

  componentDidUpdate() {
    const { report } = this.props;
    const reportId = this.props.reportId;

    if (report) {
      if (report.reportId !== reportId) {
        this.props.requestReplyForm(!this.props.isLoaded, reportId);
      }
    }
  }

  updateContent(content) {
    this.setState({ content });
  }
  handleSubmit = e => {
    e.preventDefault();
    if (this.state.content.length < 15) {
      alert("Xin điền nội dung! Nhập tối thiểu 15 ký tự.");
    }

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          loading: true
        });
        var shortContent = document.createElement("html");
        shortContent.innerHTML = this.state.content;

        const { files, content } = this.state;

        this.props
          .replyReport(
            values.toEmails,
            content,
            shortContent.textContent,
            files
          )
          .then(res => {
            console.log(res);
            if (res.status === 200) {
              message.success("Đã gửi thành công!");
              this.props.form.resetFields();
              this.setState({
                content: "",
                files: []
              });
              this.props.onClose();
            } else {
              message.error("Gửi báo cáo không thành công!");
            }

            this.setState({
              loading: false
            });
          });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { report, toEmailsOfReport } = this.props;

    var projects = [];
    if (this.props.accounts && this.props.accounts.items) {
      this.props.projects &&
        this.props.projects.items.map(item => {
          item.projects.map(subItem => {
            subItem.project && projects.push(subItem.project);
          });
        });
    }
    return (
      <div>
        {report && toEmailsOfReport ? (
          <Form className="compose-form">
            <Form.Item>
              {getFieldDecorator(
                "title",
                { initialValue: report.title },
                {
                  rules: [{ required: true, message: "Xin nhập tiêu đề!" }]
                }
              )(
                <Input
                  prefix={
                    <Icon type="book" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  placeholder="Tiêu đề"
                  disabled
                />
              )}
            </Form.Item>
            <Form.Item className="email-input">
              {getFieldDecorator(
                "toEmails",
                { initialValue: toEmailsOfReport },
                {
                  rules: [
                    { required: true, message: "Xin nhập địa chỉ gửi đến!" }
                  ]
                }
              )(
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Gửi đến"
                  disabled
                />
              )}
            </Form.Item>
            {this.props.projectId && (
              <Form.Item>
                {getFieldDecorator(
                  "projectId",
                  {
                    initialValue: this.props.projectId
                  },
                  {
                    rules: [{ required: true, message: "Xin nhập chủ đề!" }]
                  }
                )(
                  <Select placeholder="Chủ đề" disabled>
                    {projects.map(project => (
                      <Select.Option
                        key={project.projectId}
                        value={project.projectId}
                      >
                        {project.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            )}

            <JoditEditor
              editorRef={this.setRef}
              value={this.state.content}
              config={this.config}
              onChange={this.updateContent}
            />
            <br />
            <FilePond
              ref={ref => (this.pond = ref)}
              files={this.state.files}
              allowMultiple={true}
              onupdatefiles={fileItems => {
                this.setState({
                  files: fileItems.map(fileItem => fileItem.file)
                });
              }}
              labelIdle='Kéo thả hoặc <span class="filepond--label-action">Chọn</span> các tập tin để upload!'
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                borderTop: "1px solid #e8e8e8",
                padding: "10px 16px",
                textAlign: "right",
                left: 0,
                background: "#fff",
                borderRadius: "0 0 4px 4px"
              }}
            >
              <Button
                loading={this.state.loading}
                type="primary"
                onClick={this.handleSubmit}
                className="round-button"
              >
                Gửi
              </Button>
            </div>
          </Form>
        ) : (
          <div>
            <Icon type="loading" /> Đang lấy thông tin!
          </div>
        )}
      </div>
    );
  }
}

const Page = Form.create()(ComposeForm);

export default connect(
  state => state.replyForm,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Page);
