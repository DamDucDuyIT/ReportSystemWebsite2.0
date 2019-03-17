import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../store/Report";
import { maxHeight } from "../Layout";
import { Row, Col, Menu, Badge, Icon } from "antd";
import { func } from "prop-types";
import Body from "../ShareComponent/ReportContent";
import * as ReportService from "../../services/ReportService";
import * as authService from "../../services/Authentication";

const userEmail = authService.getLoggedInUser().email;

class Report extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reportId: 0,
      openKeys: [],
      reports: [],
      isFirstLoaded: false
    };
    this.renderReport = this.renderReport.bind(this);
  }

  componentDidMount() {
    const isLoaded = false;
    this.props.requestSentReports(isLoaded);
  }

  componentDidUpdate(prevProps) {
    const { isFirstLoaded } = this.state;

    if (
      isFirstLoaded === false &&
      this.props.reports &&
      this.props.reports.items &&
      this.props.reports.items.length > 0
    ) {
      this.setState({
        reports: this.props.reports.items,
        isFirstLoaded: true
      });
    }
  }

  renderReportAndRead = report => {
    var reports = this.state.reports;
    var reportTemp = report.to.find(t => t.email === userEmail);
    console.log(report);
    reportTemp &&
      reports.forEach(item => {
        item.to.forEach(index => {
          console.log(index);
          if (
            index.applicationUserReportId === reportTemp.applicationUserReportId
          ) {
            index.isRead = true;
            this.props.readReport(index);
          }
        });
      });

    this.setState({ reports });
    this.renderReport(report.reportId);
  };

  renderReport = reportId => {
    const reports = this.props.reports.items;
    if (
      this.state.report === undefined ||
      reportId !== this.state.report.reportId
    ) {
      var report = {};
      if (reportId === 0) {
        report = this.props.reports.items[0];
      } else {
        report = this.props.reports.items.find(o => o.reportId === reportId);
      }

      this.setState({
        reportId: report.reportId,
        report,
        reports
      });
    }
  };

  render() {
    const { reports } = this.state;
    console.log(this.state.reports);
    return (
      <div>
        <Row>
          <Col span={6}>
            {reports.length > 0 ? (
              <Menu
                mode="inline"
                selectedKeys={[this.state.reportId + ""]}
                className="menu-scroll report-list"
                style={{ height: maxHeight, overflow: "scroll" }}
              >
                {reports.map(report => (
                  <Menu.Item
                    key={report.reportId}
                    id={report.reportId}
                    className={`report-item ${
                      ReportService.isRead(report) ? "read" : "unread"
                    }`}
                    onClick={() => this.renderReportAndRead(report)}
                  >
                    <p className="email">{report.fromEmail}</p>
                    <p className="title">{report.title}</p>
                    <p className="shortContent">
                      {report.shortContent === null
                        ? "Null"
                        : report.shortContent}
                    </p>
                  </Menu.Item>
                ))}
              </Menu>
            ) : (
              <div>
                <Icon type="loading" /> Đang tải dữ liệu!
              </div>
            )}
          </Col>
          <Col span={18}>
            <div style={{ height: maxHeight, overflow: "scroll" }}>
              <Body data={this.state.report} />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default connect(
  state => state.report,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Report);
