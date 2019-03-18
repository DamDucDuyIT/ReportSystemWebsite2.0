import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../store/Admin/Account";
import { Table, Button, Input, Icon, Modal } from "antd";
import Highlighter from "react-highlight-words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AccountDetail from "./AccountDetail";
import * as Service from "../../services/GlobalService";

class Account extends Component {
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
    this.props.requestAccount(isLoaded);
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

  showAccountDetailModal = data => {
    console.log(data);
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
    console.log("Various parameters", pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter
    });
  };
  handleCancel = e => {
    // console.log(e);
    this.setState({
      visible: false
    });
  };

  render() {
    let accounts = this.props.accounts.items;
    const { visible } = this.state;
    // let { sortedInfo } = this.state;
    // sortedInfo = sortedInfo || {};
    const columns = [
      {
        title: "",
        render: text => (
          <Button
            type="primary"
            shape="circle"
            size="small"
            value={text.id}
            onClick={this.showAccountDetailModal.bind(this, text)}
          >
            <FontAwesomeIcon icon="info" />
          </Button>
        ),
        width: 56
      },
      {
        title: "Tên",
        dataIndex: "fullName",
        key: "fullName",
        ...this.getColumnSearchProps("fullName")
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        ...this.getColumnSearchProps("email")
      },
      {
        title: "Điện thoại",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
        ...this.getColumnSearchProps("phoneNumber")
      },
      {
        title: "Nhóm",
        dataIndex: "departmentName",
        key: "departmentName",
        ...this.getColumnSearchProps("departmentName")
      },
      {
        title: "Tình trạng",
        key: "isActived",
        render: text =>
          text.isActived ? <span>Hoạt động</span> : <span>Tạm ngừng</span>
      }
    ];
    return (
      <div>
        {/* <div className="table-operations">
          <Button onClick={this.clearFilters}>Thanh tẩy</Button>
        </div> */}
        <Table
          columns={columns}
          dataSource={accounts}
          onChange={this.handleChange}
        />
        <Modal
          className="project-detail-modal no-footer-modal"
          title="Thông tin tài khoản"
          visible={visible}
          onCancel={this.handleCancel}
        >
          <AccountDetail
            data={this.state.data}
            handleCancel={this.handleCancel}
          />
        </Modal>
      </div>
    );
  }
}

export default connect(
  state => state.admin_Account,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Account);
