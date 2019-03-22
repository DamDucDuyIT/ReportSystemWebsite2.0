import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../../store/Report";
import { Menu, Icon, Badge } from "antd";
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
      isFirstLoaded: false
    };
    this.renderReport = this.renderReport.bind(this);
  }

  componentDidMount() {
    const isLoaded = false;
    const departmentId = this.props.match.params.departmentId;
    var projectId = this.props.match.params.projectId.substring(1);

    this.props.requestReportsByProject(departmentId, projectId, isLoaded);
  }

  componentDidUpdate(prevProps) {
    var departmentId = this.props.match.params.departmentId;
    var prevDepartmentId = prevProps.match.params.departmentId;

    var projectId = this.props.match.params.projectId;
    var prevProjectId = prevProps.match.params.projectId;
    const { isFirstLoaded } = this.state;
    if (isReload === true) {
      isReload = false;
      this.props.reloadByProject(departmentId, "0");
    }

    if (projectId !== prevProjectId) {
      var id = projectId.substring(1);
      this.props.reloadByProject(departmentId, id);
    }

    if (projectId.substring(1) === this.props.projectId && running == true) {
      running = false;
      // this.renderReport(0);
    }

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

  render() {
    var { reports } = this.props;
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
              <Menu
                mode="inline"
                // openKeys={this.state.openKeys}
                selectedKeys={[this.state.reportId + ""]}
                onOpenChange={this.onOpenChange}
                className="menu-scroll report-list"
              >
                {reports.map(
                  item =>
                    item.projectId && (
                      <Menu.Item
                        key={item.reportId}
                        id={item.reportId}
                        className={`report-item ${
                          item.to.find(t => t.email === userEmail).isRead ===
                          true
                            ? "read"
                            : "unread"
                        }`}
                        onClick={() =>
                          this.renderReportAndRead(
                            item.reportId,
                            item.to.find(t => t.email === userEmail)
                          )
                        }
                      >
                        <p className="email">{item.fromEmail}</p>
                        {item.projectId && (
                          <Badge
                            style={{ backgroundColor: "#1890FF" }}
                            count={
                              item.departmentNameOfProject +
                              " - " +
                              item.projectName
                            }
                          />
                        )}
                        <p className="title">{item.title}</p>
                        <p className="shortContent">
                          {item.reply.length === 0
                            ? item.shortContent
                            : item.reply[0].shortContent}
                        </p>
                      </Menu.Item>
                    )
                )}
              </Menu>
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
