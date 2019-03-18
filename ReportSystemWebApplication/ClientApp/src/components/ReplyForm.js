import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, replyReport } from "../store/ComposeForm";
import { Form, Icon, Input, Button, Select } from "antd";
import * as authService from "../services/Authentication";
import { FilePond, registerPlugin } from "react-filepond";
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
      files: []
    };
    this.updateContent = this.updateContent.bind(this);
  }
  updateContent(content) {
    console.log("recieved HTML content", content);
    this.setState({ content });
  }
  handleSubmit = e => {
    e.preventDefault();
    if (this.state.content.length < 15) {
      alert("Xin điền nội dung! Nhập tối thiểu 15 ký tự.");
    }
    const { report } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
        var shortContent = document.createElement("html");
        shortContent.innerHTML = this.state.content;

        const isLoaded = false;
        replyReport(
          report.reportId,
          report.title,
          report.projectId,
          this.state.toEmails,
          this.state.content,
          shortContent.textContent,
          this.state.files
        ).then(response => {
          if (response === 200) {
            alert("Đã gửi thành công!");
            this.props.onClose();
          }
        });
        // console.log(response);
        // if (response.result === 200) {
        //   console.log("close close");
        //   this.props.onClose();
        // }
      }
    });
  };

  componentDidMount() {
    const isLoaded = false;
    this.props.requestReplyForm(isLoaded, this.props.reportId);
  }

  componentDidUpdate() {
    if (this.state.toEmails.length < 1) {
      const fromEmail = this.props.fromEmail;
      var toEmails = [];
      if (this.props.accounts && this.props.accounts.items) {
        if (fromEmail === userEmail) {
          toEmails = this.props.report.toEmails;
        } else {
          this.props.report.toEmails.map(item => {
            if (item !== userEmail) {
              toEmails.push(item);
            }
          });
          if (!toEmails.includes(fromEmail)) {
            toEmails.push(fromEmail);
          }
        }
        this.setState({
          toEmails
        });
      }
    }
  }
  // onFieldsChange(props, changedFields) {
  //   props.onChange(changedFields);
  // }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { report } = this.props;
    const { selectedItems } = this.state;

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
        {report ? (
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
                { initialValue: this.state.toEmails },
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
  state => state.composeForm,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Page);
