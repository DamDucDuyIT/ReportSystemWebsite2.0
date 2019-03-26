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

    this.state = {
      departmentId: splitId[0],
      projectId: splitId[1],
      reportId: 0,
      openKeys: [],
      loading: false,
      page: 1,
      pageSize: 40
    };
    this.renderReport = this.renderReport.bind(this);
    this.onDownload = this.onDownload.bind(this);
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
    const { pageSize } = this.state;
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
    var { page, pageSize } = this.state;
    const departmentId = this.props.match.params.departmentId;
    const projectId = this.props.match.params.projectId.substring(1);
    this.props.reloadByProject(departmentId, projectId, page + 1, pageSize);

    this.setState({
      page: page + 1
    });
  }

  previous() {
    var { page, pageSize } = this.state;

    const departmentId = this.props.match.params.departmentId;
    const projectId = this.props.match.params.projectId.substring(1);
    this.props.loadNext(departmentId, projectId, page - 1, pageSize);

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
                        )
                    )}
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
