import React, { Component } from "react";
import { Icon } from "antd";
import "../../assets/css/alert.css";

export default class Alert extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    // image = require("../../upload/file/1.jpg");
    return (
      <div className="alert-zone">
        <div className="alert-icon-zone">
          <Icon type={this.props.type} />
        </div>
        <div className="alert-message-zone">
          <p>{this.props.message}</p>
        </div>
      </div>
    );
  }
}
