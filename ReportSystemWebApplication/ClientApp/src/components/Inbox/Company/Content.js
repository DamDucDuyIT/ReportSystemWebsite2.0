import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../../store/Report";
import { Row, Col, Menu, Badge, Icon, Alert } from "antd";
import Body from "../../ShareComponent/ReportContent";
import * as authService from "../../../services/Authentication";
import * as ReportService from "../../../services/ReportService";
import AlertZone from "../../ShareComponent/Alert";

const SubMenu = Menu.SubMenu;

var running = false;
var isReload = false;
var callbackFromReply = false;
const userEmail = authService.getLoggedInUser().email;

export const reload = () => {
  isReload = true;
};

export const callback = async () => {
  running = true;
};

class Report extends React.Component {
  constructor(props) {
    super(props);
    const link3 = window.location.pathname.split("/")[3];
    const link4 = window.location.pathname.split("/")[4];
    this.state = {
      departmentId: link4,
      reportId: 0,
      openKeys: [],
      reports: [],
      isFirstLoaded: false
    };
    this.renderReport = this.renderReport.bind(this);
  }

  componentDidUpdate(prevProps) {
    console.log("componentDidUpdate");
    const departmentId = this.props.match.params.departmentId;
    const prevDepartmentId = prevProps.match.params.departmentId;
    const { isFirstLoaded } = this.state;

    if (departmentId !== prevDepartmentId) {
      this.props.reloadData(departmentId).then(() => {
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
    console.log("componentDidMount");
    const isLoaded = false;
    const departmentId = this.props.match.params.departmentId;
    this.props.requestReports(departmentId, isLoaded);
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

  render() {
    // var reports = this.props.reports;
    var { reports } = this.props;
    console.log(reports);
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
                        <p className="email">{report.fromEmail}</p>
                        {report.projectId && (
                          <Badge
                            style={{ backgroundColor: "#1890FF" }}
                            count={
                              report.departmentNameOfProject +
                              " - " +
                              report.projectName
                            }
                          />
                        )}
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
                  <Body data={report} />
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
}

export default connect(
  state => state.report,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Report);
