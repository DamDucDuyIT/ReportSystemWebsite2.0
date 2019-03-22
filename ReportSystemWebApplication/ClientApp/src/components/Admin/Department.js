import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../store/Admin/Department";
import { Table, Button, Input, Icon, Modal } from "antd";
import Highlighter from "react-highlight-words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DepartmentDetail from "./DepartmentDetail";

class Department extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: "",
      sortedInfo: null,
      visible: false,
      data: {}
    };
  }

  componentDidMount() {
    const isLoaded = false;
    this.props.requestDepartments(isLoaded);
  }

  setAgeSort = () => {
    this.setState({
      sortedInfo: {
        order: "descend",
        columnKey: "age"
      }
    });
  };

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div className="custom-filter-dropdown">
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => (
      <Highlighter
        highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text}
      />
    )
  });

  clearFilters = () => {
    this.setState({ sortedInfo: null });
  };

  showDepartmentDetailModal = data => {
    this.setState({
      visible: true,
      data
    });
  };

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: "" });
  };

  handleChange = (pagination, filters, sorter) => {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter
    });
  };
  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  render() {
    let { departments } = this.props;
    const { visible } = this.state;

    const columns = [
      {
        title: "",
        render: text => (
          <Button
            type="primary"
            shape="circle"
            size="small"
            value={text.id}
            onClick={this.showDepartmentDetailModal.bind(this, text)}
          >
            <FontAwesomeIcon icon="info" />
          </Button>
        ),
        width: 56
      },
      {
        title: "Mã",
        dataIndex: "code",
        key: "code",
        ...this.getColumnSearchProps("code")
      },
      {
        title: "Tên",
        dataIndex: "name",
        key: "name",
        ...this.getColumnSearchProps("name")
      }
    ];
    return (
      <div>
        {/* <div className="table-operations">
          <Button onClick={this.clearFilters}>Thanh tẩy</Button>
        </div> */}
        <div className="header">
          <h2>Danh sách phòng ban</h2>
          <Link to="/a/adddepartment">
            <Button shape="circle" icon="plus" type="primary" />
          </Link>
        </div>
        <Table
          className="no-expand"
          columns={columns}
          dataSource={departments}
          expandedRowRender=""
          //   onChange={this.handleChange}
        />
        <Modal
          className="project-detail-modal no-footer-modal"
          title="Thông tin dự án"
          visible={visible}
          onCancel={this.handleCancel}
        >
          <DepartmentDetail
            data={this.state.data}
            handleCancel={this.handleCancel}
          />
        </Modal>
      </div>
    );
  }
}

export default connect(
  state => state.admin_Department,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Department);
