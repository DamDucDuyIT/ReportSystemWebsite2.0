import React from "react";
import { Button, Drawer } from "antd";
import { maxHeight } from "../../Layout";
import ReplyForm from "../../ReplyForm";

export default class Body extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      replyDrawerVisible: false,
      reportId: -1,
      toEmails: [],
      title: "",
      subjectId: -1
    };
  }
  showReplyDrawer(reportId, toEmails, subjectId, title) {
    this.setState({
      replyDrawerVisible: true,
      reportId,
      toEmails,
      subjectId,
      title
    });

    // console.log(reportId);
  }
  closeReplyDrawer = () => {
    this.setState({
      replyDrawerVisible: false
    });
  };

  render() {
    const { data } = this.props;
    var content = "";
    if (data !== undefined) {
      content = data.content;
    }

    // document.getElementById("content").innerHTML = ll;
    return (
      <div style={{ height: maxHeight, overflowY: "scroll" }}>
        {data && (
          <div>
            <div className="body-content-header">
              {data.title}
              <span style={{ float: "right" }}>
                <Button
                  onClick={this.showReplyDrawer.bind(
                    this,
                    data.reportId,
                    data.toEmails,
                    data.subjectId,
                    data.title
                  )}
                  type="primary"
                >
                  Phản hồi
                </Button>
              </span>
            </div>
            <div className="report-info">
              <p>Từ: {data.fromEmail}</p>
              <p>Vào lúc: {data.createdOn}</p>
            </div>
            <div className="body report-content">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
            <div className="footer">
              {/* <div dangerouslySetInnerHTML={{ __html: content }} /> */}
            </div>
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
                subjectId={this.state.subjectId}
                toEmails={this.state.toEmails}
                title={this.state.title}
                // onClose={this.closeComposeDrawer}
                // showDrawer={this.showReplyDrawer}
              />
            </Drawer>
          </div>
        )}
      </div>
    );
  }
}
