import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../../store/Report";
import { Menu, Badge, Icon, Button } from "antd";
import Body from "../../ShareComponent/ReportContent";
import * as authService from "../../../services/Authentication";
import * as ReportService from "../../../services/ReportService";
import AlertZone from "../../ShareComponent/Alert";

var running = false;
const userEmail = authService.getLoggedInUser().email;

export const callback = async () => {
  running = true;
};

class Report extends React.Component {
  constructor(props) {
    super(props);
    const link4 = window.location.pathname.split("/")[4];
    this.state = {
      departmentId: link4,
      reportId: 0,
      openKeys: [],
      reports: [],
      isFirstLoaded: false,
      page: 1,
      pageSize: 40
    };
    this.renderReport = this.renderReport.bind(this);
    this.onDownload = this.onDownload.bind(this);
  }

  componentDidUpdate(prevProps) {
    const departmentId = this.props.match.params.departmentId;
    const prevDepartmentId = prevProps.match.params.departmentId;
    const { isFirstLoaded, pageSize } = this.state;

    if (departmentId !== prevDepartmentId) {
      this.props.reloadData(departmentId, 1, pageSize).then(() => {
        this.setState({
          report: undefined,
          reportId: 0
          // reports: this.props.reports.items
        });
      });
    }
    if (departmentId === this.props.departmentId && running == true) {
      running = false;
      this.setState({
        // reports: this.props.reports.items
      });
    }

    if (
      isFirstLoaded === false &&
      this.props.reports &&
      this.props.reports.items &&
      this.props.reports.items.length > 0
    ) {
      this.setState({
        // reports: this.props.reports.items,
        isFirstLoaded: true
      });
    }
  }

  componentDidMount() {
    const isLoaded = false;
    const departmentId = this.props.match.params.departmentId;
    const { pageSize } = this.state;
    this.props.requestReports(departmentId, 1, pageSize, isLoaded);
  }

  renderReportAndRead = report => {
    var { reports } = this.props;
    var reportTemp = report.to.find(t => t.email === userEmail);

    reportTemp &&
      reports.forEach(item => {
        item.to.forEach(index => {
          if (
            index.applicationUserReportId ===
              reportTemp.applicationUserReportId &&
            index.isRead === false
          ) {
            index.isRead = true;
            this.props.readReport(index);
          }
        });
      });

    this.renderReport(report.reportId);
  };

  renderReport = reportId => {
    const { reports } = this.props;
    if (
      this.state.report === undefined ||
      reportId !== this.state.report.reportId
    ) {
      var report = {};
      if (reportId === 0) {
        report = reports[0];
      } else {
        report = reports.find(o => o.reportId === reportId);
      }

      this.setState({
        reportId: report.reportId,
        report,
        departmentId: this.props.match.params.departmentId
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
                  // openKeys={this.state.openKeys}
                  selectedKeys={[this.state.reportId + ""]}
                  // onOpenChange={this.onOpenChange}
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
                        {report.reply.length === 0
                          ? report.shortContent
                          : report.reply[0].shortContent}
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
