import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../../store/Report";
import { Menu, Icon, Button } from "antd";
import Body from "../../ShareComponent/ReportContent";
import * as authService from "../../../services/Authentication";
import AlertZone from "../../ShareComponent/Alert";

var running = false;
var isReload = false;
const userEmail = authService.getLoggedInUser().email;

export const callback = () => {
  running = true;
};

export const reload = () => {
  isReload = true;
};

class Report extends React.Component {
  constructor(props) {
    super(props);
    const defaultId = window.location.pathname.split("/")[4];
    const splitId = defaultId.split("+");
    const pageSize = 3;
    this.state = {
      departmentId: splitId[0],
      projectId: splitId[1],
      reportId: 0,
      openKeys: [],
      loading: false,
      isFirstLoaded: false,
      page: 1,
      pageSize: pageSize,
      start: 1,
      end: pageSize
    };
    this.renderReport = this.renderReport.bind(this);
  }

  componentDidMount() {
    const isLoaded = false;
    const departmentId = this.props.match.params.departmentId;
    var projectId = this.props.match.params.projectId.substring(1);
    const { pageSize } = this.state;

    this.props.requestReportsByProject(
      departmentId,
      projectId,
      1,
      pageSize,
      isLoaded
    );
  }

  componentDidUpdate(prevProps) {
    var departmentId = this.props.match.params.departmentId;

    var projectId = this.props.match.params.projectId;
    var prevProjectId = prevProps.match.params.projectId;
    const { isFirstLoaded, pageSize } = this.state;
    if (isReload === true) {
      isReload = false;
      this.props.reloadByProject(departmentId, "0", 1, pageSize);
      this.setState({
        page: 1
      });
    }

    if (projectId !== prevProjectId) {
      var id = projectId.substring(1);
      this.props.reloadByProject(departmentId, id, 1, pageSize);
      this.setState({
        page: 1
      });
    }

    if (projectId.substring(1) === this.props.projectId && running == true) {
      running = false;
      // this.renderReport(0);
    }
  }

  renderReportAndRead = (reportId, item) => {
    var { reports } = this.props;

    reports.forEach(report => {
      report.to.forEach(index => {
        if (index.applicationUserReportId === item.applicationUserReportId) {
          if (index.isRead == false) {
            index.isRead = true;
            this.props.readReport(index);
          }
        }
      });
    });

    // this.setState({ reports: reports });
    this.renderReport(reportId);
  };

  renderReport = reportId => {
    this.setState({
      reportId: reportId,
      departmentId: this.props.match.params.departmentId
    });
  };
  renderFirst = reportId => {
    this.renderReport(reportId);
  };

  renderSubReport = (mainReportId, reportId) => {
    if (
      this.state.report === undefined ||
      reportId !== this.state.report.reportId
    ) {
      var mainReport = this.props.reports.find(
        o => o.reportId === mainReportId
      );
      var report = mainReport.reply.find(o => o.reportId === reportId);
      this.setState({
        reportId,
        report,
        departmentId: this.props.match.params.departmentId
      });
    }
  };
  next() {
    const { page, pageSize, start, end } = this.state;
    const { totalItems } = this.props;
    const departmentId = this.props.match.params.departmentId;
    const projectId = this.props.match.params.projectId.substring(1);
    this.props.loadNext(departmentId, projectId, page + 1, pageSize);
    this.setState({
      page: page + 1,
      start: start + pageSize,
      end: end + pageSize > totalItems ? totalItems : end + pageSize
    });
  }

  previous() {
    const { page, pageSize, start, end } = this.state;
    const { totalItems } = this.props;
    const departmentId = this.props.match.params.departmentId;
    const projectId = this.props.match.params.projectId.substring(1);
    this.props.loadNext(departmentId, projectId, page - 1, pageSize);
    this.setState({
      page: page - 1,
      start: start - pageSize < 0 ? 0 : start - pageSize,
      end: end - pageSize
    });
  }

  render() {
    var { reports, totalItems } = this.props;
    const { start, end } = this.state;
    var report;
    if (reports) {
      report = reports
        ? reports.find(o => o.reportId === this.state.reportId)
        : undefined;
    }
    return (
      <div>
        <div className="report-menu">
          {reports ? (
            reports.length > 0 ? (
              <div>
                <div className="toolbar">
                  {start} - {end} - {totalItems}
                  {start > 1 && (
                    <Button onClick={() => this.previous()}>Previous</Button>
                  )}
                  {end < totalItems && (
                    <Button onClick={() => this.next()}>Next</Button>
                  )}
                </div>
                <Menu
                  mode="inline"
                  // openKeys={this.state.openKeys}
                  selectedKeys={[this.state.reportId + ""]}
                  onOpenChange={this.onOpenChange}
                  className="menu-scroll report-list"
                >
                  {reports.map(
                    report =>
                      report.projectId && (
                        <Menu.Item
                          key={report.reportId}
                          id={report.reportId}
                          className={`report-item ${
                            report.to.find(t => t.email === userEmail)
                              .isRead === true
                              ? "read"
                              : "unread"
                          }`}
                          onClick={() =>
                            this.renderReportAndRead(
                              report.reportId,
                              report.to.find(t => t.email === userEmail)
                            )
                          }
                        >
                          <p className="email">{report.fromEmail}</p>

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
                            {report.reply.length > 0 && (
                              <div className="badge-item count">
                                {report.reply.length}
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
                      )
                  )}
                </Menu>
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
        <div>
          <Body data={report} />
        </div>
      </div>
    );
  }
}

export default connect(
  state => state.report,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Report);
