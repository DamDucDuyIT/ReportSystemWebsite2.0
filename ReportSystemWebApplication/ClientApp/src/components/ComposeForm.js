import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, addReport } from "../store/ComposeForm";
import { Form, Icon, Input, Button, Select, Upload, message } from "antd";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";

// import { Editor } from "@tinymce/tinymce-react";
import "jodit";
import "jodit/build/jodit.min.css";
import JoditEditor from "jodit-react";
// const { Dragger } = Upload;
const { Option, OptGroup } = Select;

class ComposeForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: "",
            shortContent: "",
            responseList: [],
            selectedItems: [],
            fileList: [],
            uploading: false,
            loading: false
        };
        this.updateContent = this.updateContent.bind(this);
    }
    updateContent(content) {
        this.setState({ content });
    }

    handleSubmit = e => {
        e.preventDefault();
        if (this.state.content.length < 15) {
            message.error("Nhập nội dung tối thiểu 15 ký tự!");
        } else {
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    this.setState({
                        loading: true
                    });
                    var shortContent = document.createElement("html");
                    shortContent.innerHTML = this.state.content;

                    addReport(
                        values,
                        this.state.content,
                        shortContent.textContent,
                        this.state.files
                    ).then(response => {
                        if (response === 200) {
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
        }
    };

    componentDidMount() {
        const isLoaded = false;
        this.props.requestComposeForm(isLoaded);
    }

    render() {
        // const { uploading, fileList } = this.state;
        const { getFieldDecorator } = this.props.form;
        const { selectedItems } = this.state;
        var filteredOptions = [];
        var projects = [];
        if (this.props.accounts && this.props.accounts.items) {
            filteredOptions = this.props.accounts.items.filter(
                o => !selectedItems.includes(o.email)
            );
        }
        if (this.props.projects && this.props.projects.items) {
            projects = this.props.projects.items;
        }

        return (
            <div>
                <Form className="compose-form">
                    <Form.Item>
                        {getFieldDecorator("title", {
                            rules: [{ required: true, message: "Xin nhập tiêu đề!" }]
                        })(
                            <Input
                                prefix={
                                    <Icon type="book" style={{ color: "rgba(0,0,0,.25)" }} />
                                }
                                placeholder="Tiêu đề"
                            />
                        )}
                    </Form.Item>
                    <Form.Item className="email-input">
                        {getFieldDecorator("toEmails", {
                            rules: [{ required: true, message: "Xin nhập địa chỉ gửi đến!" }]
                        })(
                            <Select
                                prefix={
                                    <Icon type="book" style={{ color: "rgba(0,0,0,.25)" }} />
                                }
                                mode="multiple"
                                placeholder="Gửi đến"
                                onChange={this.handleChange}
                                style={{ width: "100%" }}
                            >
                                {filteredOptions.map(item => (
                                    <Select.Option key={item.id} value={item.email}>
                                        {item.email}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator("projectId", {})(
                            <Select placeholder="Dự án">
                                <Option value={null}>Chọn dự án</Option>
                                {projects.map(
                                    project =>
                                        project.department && (
                                            <OptGroup label={project.department.name}>
                                                {project.projects.map(
                                                    item =>
                                                        item.project && (
                                                            <Option value={item.project.projectId}>
                                                                {item.project.name}
                                                            </Option>
                                                        )
                                                )}
                                            </OptGroup>
                                        )
                                )}
                            </Select>
                        )}
                    </Form.Item>

                    <JoditEditor
                        editorRef={this.setRef}
                        value={this.state.content}
                        config={this.config}
                        onChange={this.updateContent}
                    />
                    <br />
                    <FilePond
                        allowMultiple={true}
                        onupdatefiles={fileItems => {
                            this.setState({
                                files: fileItems.map(fileItem => fileItem.file)
                            });
                        }}
                        labelIdle='Kéo thả hoặc <span class="filepond--label-action">Chọn</span> các tập tin để upload!'
                    />

                    {/* <Form.Item label="Upload">
            <Upload {...fileProps}>
              <Button>
                <Icon type="upload" /> Click to Upload
              </Button>
            </Upload>
          </Form.Item> */}
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
            </div>
        );
    }
}

const Page = Form.create()(ComposeForm);

export default connect(
    state => state.composeForm,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(Page);
