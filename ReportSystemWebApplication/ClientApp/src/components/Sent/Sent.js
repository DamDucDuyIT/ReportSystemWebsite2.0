import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../store/Report";
import { maxHeight } from "../Layout";
import { Button, Menu, Badge, Icon } from "antd";
import { func } from "prop-types";
import Body from "../ShareComponent/ReportContent";
import * as ReportService from "../../services/ReportService";
import * as authService from "../../services/Authentication";
import AlertZone from "../ShareComponent/Alert";

const userEmail = authService.getLoggedInUser().email;

class Report extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reportId: 0,
      openKeys: [],
      reports: [],
      isFirstLoaded: false,
      page: 1,
      pageSize: 3
    };
    this.renderReport = this.renderReport.bind(this);
    this.onDownload = this.onDownload.bind(this);
  }

  componentDidMount() {
    const isLoaded = false;
    const { pageSize } = this.state;
    this.props.requestSentReports(1, pageSize, isLoaded);
  }

  componentDidUpdate(prevProps) {
    const { isFirstLoaded } = this.state;

    if (
      isFirstLoaded === false &&
      this.props.reports &&
      this.props.reports.length > 0
    ) {
      this.setState({
        //reports: this.props.reports.items,
        isFirstLoaded: true
      });
    }
  }

  renderReportAndRead = report => {
    var reports = this.props.reports;
    var reportTemp = report.to.find(t => t.email === userEmail);

    reportTemp &&
      reports.forEach(item => {
        item.to.forEach(index => {
          if (
            index.applicationUserReportId === reportTemp.applicationUserReportId
          ) {
            index.isRead = true;
            this.props.readReport(index);
          }
        });
      });

    //this.setState({ reports });
    this.renderReport(report.reportId);
  };

  renderReport = reportId => {
    const reports = this.props.reports;
    if (
      this.state.report === undefined ||
      reportId !== this.state.report.reportId
    ) {
      var report = {};
      if (reportId === 0) {
        report = this.props.reports[0];
      } else {
        report = this.props.reports.find(o => o.reportId === reportId);
      }

      this.setState({
        reportId: report.reportId
        // report,
        // reports
      });
    }
  };

  next() {
    var { page, pageSize } = this.state;
    const departmentId = this.props.match.params.departmentId;
    this.props.reloadData(departmentId, page + 1, pageSize);

    this.setState({
      page: page + 1
    });
  }

  previous() {
    var { page, pageSize } = this.state;

    const departmentId = this.props.match.params.departmentId;
    this.props.reloadData(departmentId, page - 1, pageSize);

    this.setState({
      page: page - 1
    });
  }

  render() {
    var { reports, totalItems, start, end } = this.props;
    var report;
    if (reports) {
      report = reports
        ? reports.find(o => o.reportId === this.state.reportId)
        : undefined;
    }

    return (
      <div>
        {reports ? (
          reports.length > 0 ? (
            <div>
              <div className="report-menu">
                <div className="toolbar">
                  <div className="pages">
                    <div className="numbers">
                      {start} - {end} trong số {totalItems}
                    </div>
                    <div className="n-p-btns">
                      <Button
                        onClick={() => this.previous()}
                        icon="left"
                        shape="circle"
                        disabled={start > 1 ? false : true}
                      />
                      <Button
                        onClick={() => this.next()}
                        icon="right"
                        shape="circle"
                        disabled={end < totalItems ? false : true}
                      />
                    </div>
                  </div>
                </div>

                <Menu
                  mode="inline"
                  selectedKeys={[this.state.reportId + ""]}
                  className="menu-scroll report-list"
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
                      <div>
                        <span className="email">{report.fromEmail}</span>
                        {report.reply.length > 0 && (
                          <span className="reply-count">
                            {report.reply.length}
                          </span>
                        )}
                      </div>

                      <div className="badge-zone">
                        <div className="badge-item department">
                          {report.departmentName}
                        </div>
                        {report.projectId && (
                          <div className="badge-item project">
                            <span className="department-code">
                              {report.departmentCodeOfProject}
                            </span>
                            <i>~</i>
                            <span>{report.projectName}</span>
                          </div>
                        )}
                      </div>

                      <p className="title">{report.title}</p>
                      <p className="shortContent">
                        {report.shortContent === null
                          ? "Null"
                          : report.shortContent}
                      </p>
                    </Menu.Item>
                  ))}
                </Menu>
              </div>
              <div>
                <Body data={report} onDownload={this.onDownload} />
              </div>
            </div>
          ) : (
            <AlertZone message="Không có dữ liệu!" type="file" />
          )
        ) : (
          <div className="loading-zone">
            <Icon type="loading" /> Đang tải dữ liệu!
          </div>
        )}
      </div>
    );
  }

  onDownload(fileId, fileName) {
    console.log(fileId + " " + fileName);
    this.props.download(fileId, fileName);
  }
}

export default connect(
  state => state.report,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Report);
