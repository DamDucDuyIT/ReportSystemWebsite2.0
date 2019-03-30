import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../store/ProjectManagement/Projects";
import { Table, Button, Input, Icon, Modal, Progress } from "antd";
import Highlighter from "react-highlight-words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as FormatDate from "../../services/FormatDate";
import ProjectDetail from "./ProjectDetail";

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: "",
      sortedInfo: null,
      visible: false
    };
  }
  showProjectDetailModal = data => {
    data.from;
    this.setState({
      visible: true,
      data
    });
  };
  handleCancel = e => {
    this.setState({
      visible: false
    });
  };
  componentDidMount() {
    const isLoaded = false;
    this.props.requestProjects(isLoaded);
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

  // goToInfo(e) {
  //   Service.redirect("/a/accountdetail/" + e.target.value);
  // }

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

  render() {
    let { projects } = this.props;

    const columns = [
      {
        title: "",
        render: text => (
          <Button
            type="primary"
            shape="circle"
            size="small"
            value={text.id}
            icon="info"
            onClick={this.showProjectDetailModal.bind(this, text)}
          >
            {/* <FontAwesomeIcon icon="info" /> */}
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
      },
      {
        title: "Ngày tạo",
        key: "createOn",
        dataIndex: "createOn",
        render: val => FormatDate.formatDate(val)
      },
      {
        title: "Người tạo",
        dataIndex: "creatorEmail",
        key: "creatorEmail",
        ...this.getColumnSearchProps("creatorEmail")
      },
      {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
        ...this.getColumnSearchProps("description")
      },
      {
        title: "Tiến trình",
        key: "progress",
        dataIndex: "progress",
        render: val => <Progress status="active" percent={val} />
      },
      {
        title: "Tình trạng",
        key: "isDeleted",
        dataIndex: "isDeleted",
        render: val => (val ? "Tạm ngưng" : "Hoạt động")
      }
    ];
    const { data, visible } = this.state;
    return (
      <div className="project">
        <Table
          columns={columns}
          dataSource={projects}
          onChange={this.handleChange}
        />
        <Modal
          className="project-detail-modal no-footer-modal"
          title="Thông tin dự án"
          visible={visible}
          onCancel={this.handleCancel}
        >
          <ProjectDetail
            handleCancel={this.handleCancel}
            data={this.state.data}
          />
        </Modal>
      </div>
    );
  }
}

export default connect(
  state => state.projectManagement_Projects,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Account);
