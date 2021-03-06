import React from "react";
import { Button, Drawer, Icon, Row, Col, Avatar, Modal, Badge } from "antd";
import ReplyForm from "../ReplyForm";
import "../../assets/css/report.css";
import imageExtentions from "image-extensions";
import * as GlobalService from "../../services/GlobalService";
import * as CompanyContent from "../Inbox/Company/Content";
import * as ProjectContent from "../Inbox/Project/Content";

var mh = window.outerHeight;

export default class Body extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      replyDrawerVisible: false,
      reportId: -1,
      toEmails: [],
      title: "",
      projectId: -1,
      currents: [],
      images: [],
      fileId: 0
    };
  }
  toggle(index) {
    var listIndex = this.state.currents;
    if (this.state.currents.includes(index)) {
      listIndex.splice(listIndex.indexOf(index), 1);
    } else {
      listIndex.push(index);
    }
    this.setState({
      currents: listIndex
    });
  }

  showReplyDrawer(reportId, toEmails, projectId, title) {
    this.setState({
      replyDrawerVisible: true,
      reportId,
      toEmails,
      projectId,
      title
    });
  }
  closeReplyDrawer = () => {
    this.setState({
      replyDrawerVisible: false
    });
  };
  zoomImage = fileId => {
    this.setState({
      fileId,
      visible: true
    });
  };
  handleCancel = e => {
    this.setState({
      visible: false
    });
  };
  render() {
    const { data } = this.props;
    return (
      <div className="report-group">
        {data ? (
          <div>
            <Drawer
              title={
                <span>
                  Phản hồi từ <strong>{this.state.title}</strong>
                </span>
              }
              width={640}
              placement="right"
              visible={this.state.replyDrawerVisible}
              onClose={this.closeReplyDrawer}
              placement={"left"}
              className="form-drawer reply"
            >
              <ReplyForm
                onClose={this.closeReplyDrawer}
                reportId={this.state.reportId}
                projectId={this.state.projectId}
                fromEmail={data.fromEmail}
                toEmails={this.state.toEmails}
                title={this.state.title}
              />
            </Drawer>
            <div className="report-header">
              <p className="title">{data.title}</p>
              <Button
                className="reply-button"
                shape="circle"
                icon="form"
                onClick={this.showReplyDrawer.bind(
                  this,
                  data.reportId,
                  data.toEmails,
                  data.projectId,
                  data.title
                )}
              />
            </div>

            <ul className="report">
              {data.reply.map((report, i) => (
                <li>
                  <div className="group-item">
                    <div
                      className="item-header"
                      onClick={this.toggle.bind(this, report.reportId)}
                    >
                      <Row>
                        <Col span={2} className="avatar">
                          <Avatar icon="user" />
                        </Col>
                        <Col span={14}>
                          <p className="name">{report.fromEmail}</p>
                          <p
                            className={`short-content collapsible ${
                              !this.state.currents.includes(report.reportId) &&
                              i !== 0
                                ? "open "
                                : ""
                            }`}
                          >
                            {report.shortContent}
                          </p>
                          <p
                            className={`collapsible ${
                              this.state.currents.includes(report.reportId) ||
                              i === 0
                                ? "open "
                                : ""
                            }`}
                          >
                            <span style={{ display: "inline-block" }}>
                              Tới:
                            </span>
                            <div style={{ display: "inline-block" }}>
                              <ToEmails toEmails={report.toEmails} />
                            </div>
                          </p>
                        </Col>
                        <Col span={8}>
                          <p className="item-header-info">
                            <span>
                              <span className="time">{report.createdOn}</span>
                            </span>
                          </p>
                        </Col>
                      </Row>
                    </div>

                    <div
                      className={`collapsible ${
                        this.state.currents.includes(report.reportId) || i === 0
                          ? "open "
                          : ""
                      }`}
                    >
                      <Row>
                        <Col span={22} offset={2}>
                          <div className="item-content">
                            <div
                              className="report-content"
                              dangerouslySetInnerHTML={{
                                __html: report.content
                              }}
                            />
                            {report.files.length > 0 && (
                              <div className="report-files">
                                {report.files.map(item => (
                                  <div className="file-item">
                                    {item.icon === "picture" ? (
                                      <div className="image-file">
                                        <div className="figure">
                                          <img
                                            src={GlobalService.imageUrl(
                                              item.fileId
                                            )}
                                            alt="image"
                                          />
                                          <div className="figcaption">
                                            <div>
                                              <h5>{item.title}</h5>
                                            </div>
                                            <div>
                                              <p>
                                                <Icon
                                                  type="eye"
                                                  onClick={() =>
                                                    this.zoomImage(item.fileId)
                                                  }
                                                />
                                                <Icon
                                                  type="download"
                                                  onClick={() =>
                                                    this.props.onDownload(
                                                      item.fileId,
                                                      item.title
                                                    )
                                                  }
                                                />
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        <Modal
                                          title="Basic Modal"
                                          visible={this.state.visible}
                                          className="image-modal"
                                          onCancel={this.handleCancel}
                                          style={{ height: mh - 200 }}
                                        >
                                          <img
                                            src={GlobalService.imageUrl(
                                              this.state.fileId
                                            )}
                                          />
                                        </Modal>
                                      </div>
                                    ) : (
                                      <div
                                        className="other-file"
                                        onClick={() =>
                                          this.props.onDownload(
                                            item.fileId,
                                            item.title
                                          )
                                        }
                                      >
                                        {item.title}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </li>
              ))}
              <li>
                <div className="group-item">
                  <div
                    className="item-header"
                    onClick={this.toggle.bind(this, data.reportId)}
                  >
                    <Row>
                      <Col span={2} className="avatar">
                        <Avatar icon="user" />
                      </Col>
                      <Col span={14}>
                        <p className="name">{data.fromEmail}</p>
                        <p
                          className={`short-content collapsible 
                          ${
                            !this.state.currents.includes(data.reportId) &&
                            data.reply.length > 0
                              ? "open "
                              : ""
                          }`}
                        >
                          {data.reply.length}
                          {data.shortContent}
                        </p>
                        <p
                          className={`collapsible ${
                            !this.state.currents.includes(data.reportId) &&
                            data.reply.length > 0
                              ? ""
                              : "open"
                          }`}
                        >
                          <span style={{ display: "inline-block" }}>Tới:</span>
                          <div style={{ display: "inline-block" }}>
                            <ToEmails toEmails={data.toEmails} />
                          </div>
                        </p>
                      </Col>
                      <Col span={8}>
                        <p className="item-header-info">
                          <span>
                            <span className="time">{data.createOn}</span>
                          </span>
                        </p>
                      </Col>
                    </Row>
                  </div>

                  <div
                    className={`collapsible ${
                      !this.state.currents.includes(data.reportId) &&
                      data.reply.length > 0
                        ? ""
                        : "open"
                    }`}
                  >
                    <Row>
                      <Col span={22} offset={2}>
                        <div className="item-content">
                          <div
                            className="report-content"
                            dangerouslySetInnerHTML={{ __html: data.content }}
                          />
                          {data.files.length > 0 && (
                            <div className="report-files">
                              {data.files.map(item => (
                                <div className="file-item">
                                  {item.icon === "picture" ? (
                                    <div className="image-file">
                                      <div className="figure">
                                        <img
                                          src={GlobalService.imageUrl(
                                            item.fileId
                                          )}
                                          alt="image"
                                        />
                                        <div className="figcaption">
                                          <div>
                                            <h5>{item.title}</h5>
                                          </div>
                                          <div>
                                            <p>
                                              <Icon
                                                type="eye"
                                                onClick={() =>
                                                  this.zoomImage(item.fileId)
                                                }
                                              />
                                              <Icon
                                                type="download"
                                                onClick={() =>
                                                  this.props.onDownload(
                                                    item.fileId,
                                                    item.title
                                                  )
                                                }
                                              />
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <Modal
                                        title="Basic Modal"
                                        visible={this.state.visible}
                                        className="image-modal"
                                        onCancel={this.handleCancel}
                                        style={{ height: mh - 200 }}
                                      >
                                        <img
                                          src={GlobalService.imageUrl(
                                            this.state.fileId
                                          )}
                                        />
                                      </Modal>
                                    </div>
                                  ) : (
                                    <div
                                      className="other-file"
                                      onClick={() =>
                                        this.props.onDownload(
                                          item.fileId,
                                          item.title
                                        )
                                      }
                                    >
                                      {item.title}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        ) : (
          <div className="report-empty">
            <Icon type="mail" />
            <p>Chọn báo cáo để xem</p>
          </div>
        )}
      </div>
    );
  }
}

class ToEmails extends React.Component {
  render() {
    const emails = this.props.toEmails;

    return (
      <div className="toEmails">
        {emails.map((email, i) => {
          return i === 0 ? <span>{email}</span> : <span>, {email}</span>;
        })}
      </div>
    );
  }
}
