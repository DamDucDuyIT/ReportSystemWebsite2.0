import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../../store/Department";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {
  Row,
  Col,
  List,
  Layout,
  Menu,
  Select,
  Tabs,
  Badge,
  Icon,
  Button
} from "antd";
import ReportContent from "./Content";
import * as ContentService from "./Content";
import { maxHeight } from "../../Layout";
// const Option = Select.Option;
// const { TabPane } = Tabs;
const SubMenu = Menu.SubMenu;
// const MenuItemGroup = Menu.ItemGroup;
const { Header, Content, Footer, Sider } = Layout;
export var departmentId = window.location.pathname.split("/")[4];
const routes = [
  {
    path: "/u/inbox/c/:departmentId",
    component: ReportContent,
    label: "ReportContent"
  }
];
export var CompanyTotalUnread = 0;
function RouteWithSubRoutes(route) {
  return (
    <Route
      // exact={activeOnlyWhenExact}
      path={route.path}
      render={props => (
        // pass the sub-routes down to keep nesting
        <route.component {...props} routes={route.routes} />
      )}
    />
  );
}

class Company extends Component {
  constructor() {
    super();
    this.state = {
      totalUnread: 0
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleChange(value) {
    console.log(`selected ${value}`);
  }
  handleClick = e => {
    departmentId = e.key;
    ContentService.callback(e.key);
    this.setState({
      currentCompany: e.key
    });
  };

  componentDidMount() {
    const isLoaded = false;
    this.props.requestDepartmentsByCompany(isLoaded);
  }
  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }
  componentDidUpdate() {
    const { isLoading } = this.state;

    console.log(this.props);
    if (this.props.isLoaded === false && isLoading === true) {
      this.setState({
        totalUnread: this.state.totalUnread + 1,
        isLoading: false
      });
    }
  }

  render() {
    const departmentList = this.props.departments.items;

    // console.log(departmentList);
    return (
      <Layout>
        {/* <button
          onClick={() =>
            this.setState({
              totalUnread: this.state.totalUnread + 1
            })
          }
        >
          Minus
        </button> */}
        <Sider className="company-menu">
          <Menu
            onClick={this.handleClick}
            defaultSelectedKeys={["0"]}
            mode="inline"
            className="menu-scroll"
            // style={{ height: maxHeight, overflowY: "scroll" }}
          >
            {/* {console.log(departmentList)} */}
            <Menu.Item key={0} className="first-item">
              <Link to={`/u/inbox/c/0`} />
              <Icon type="mail" />
              <span>Tất cả</span>
            </Menu.Item>
            {departmentList &&
              departmentList.length > 0 &&
              departmentList.map(company =>
                company.grandChildDepartments.length > 0 ? (
                  <SubMenu
                    id={company.childDepartment.departmentId}
                    key={company.childDepartment.departmentId}
                    title={
                      <div>
                        <Icon type="mail" />
                        <span>
                          {company.childDepartment.name}
                          <span style={{ float: "right" }}>
                            <Badge count={company.unread} />
                          </span>
                        </span>
                      </div>
                    }
                  >
                    <Menu.Item key={company.childDepartment.departmentId}>
                      <Link
                        to={`/u/inbox/c/${
                          company.childDepartment.departmentId
                        }`}
                      />
                      Tất cả
                    </Menu.Item>
                    {company.grandChildDepartments.map(department => (
                      <Menu.Item key={department.department.departmentId}>
                        <Link
                          to={`/u/inbox/c/${
                            department.department.departmentId
                          }`}
                        />
                        {department.department.name}
                        <span style={{ float: "right" }}>
                          <Badge count={department.unread} />
                        </span>
                      </Menu.Item>
                    ))}
                  </SubMenu>
                ) : (
                  company.childDepartment && (
                    <Menu.Item
                      id={company.childDepartment.departmentId}
                      key={company.childDepartment.departmentId}
                    >
                      <Link
                        to={`/u/inbox/c/${
                          company.childDepartment.departmentId
                        }`}
                      />
                      {company.childDepartment.name}
                    </Menu.Item>
                  )
                )
              )}
          </Menu>
        </Sider>
        <Content className="no-padding">
          <div>
            {routes.map((route, i) => (
              <RouteWithSubRoutes key={i} {...route} />
            ))}
          </div>
        </Content>
      </Layout>
    );
  }
}

export default connect(
  state => state.department,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Company);
