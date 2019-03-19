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
const userEmail = authService.getLoggedInUser().email;

export const reload = () => {
  isReload = true;
};

export const callback = async departmentId => {
  departmentId = departmentId;
  running = true;
};

class Report extends React.Component {
  constructor(props) {
    console.log(props);
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
    console.log(prevProps);
    console.log(this.props);
    const departmentId = this.props.match.params.departmentId;
    const prevDepartmentId = prevProps.match.params.departmentId;
    const { isFirstLoaded } = this.state;

    if (isReload === true) {
      isReload = false;
      this.props.reloadData(departmentId).then(() => {
        this.setState({
          reports: this.props.reports.items
        });
      });
    }
    if (departmentId !== prevDepartmentId) {
      this.props.reloadData(departmentId).then(() => {
        this.setState({
          report: undefined,
          reportId: 0,
          reports: this.props.reports.items
        });
      });
    }
    if (departmentId === this.props.departmentId && running == true) {
      running = false;
      this.setState({
        reports: this.props.reports.items
      });
    }

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

  componentDidMount() {
    const isLoaded = false;
    const departmentId = this.props.match.params.departmentId;
    this.props.requestReports(departmentId, isLoaded);
  }

  renderReportAndRead = report => {
    console.log(report);
    var reports = this.state.reports;
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

    this.setState({ reports });
    this.renderReport(report.reportId);
    // this.setState({ reports });
    // this.renderReport(report.reportId);
    // var reports = this.state.reports;

    // reports.forEach(report => {
    //   report.to.forEach(index => {
    //     if (index.applicationUserReportId === item.applicationUserReportId) {
    //       index.isRead = true;
    //     }
    //   });
    // });

    // this.setState({ reports: reports });
    // this.renderReport(reportId);
    // this.props.readReport(item);
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
        reports,
        departmentId: this.props.match.params.departmentId
      });
    }
  };

  render() {
    // var reports = this.props.reports;
    const { reports } = this.state;
    // console.log(reports);
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
                  <Body data={this.state.report} />
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
