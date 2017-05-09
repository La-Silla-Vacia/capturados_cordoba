import { h, render, Component } from 'preact';
import cx from 'classnames';

import s from './base.css';
import Tooltip from "./Components/Tooltip";
import Graphic from "./Components/Graphic";
const data = require('../data/data.json');

export default class Base extends Component {

  constructor() {
    super();

    this.state = {
      data: [],
      sendsAConnection: [],
      receivesAConnection: [],
      sendsAndReceivesAConnection: [],
      personSize: 75,
      width: 300,
      height: 400,
      tooltip: {
        show: false,
        x: false,
        y: false
      }
    };

    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
  }

  componentWillMount() {
    this.setData();

    if (this.props.width) {
      this.setState({ width: this.props.width() })
    }
  }

  componentWillReceiveProps(newprops) {
    if (newprops.width) {
      this.setState({ width: newprops.width() })
    }
  }

  setData() {
    let dataExists = true;
    let interactiveData;
    let dataUri;
    try {
      if (capturados_cordoba_data) {
        dataExists = true;
        interactiveData = capturados_cordoba_data;
      }
    } catch (e) {
      dataExists = false;
    }

    if (!dataExists) {
      this.setState({ data: data });
    } else {
      if (interactiveData.dataUri) {
        dataUri = interactiveData.dataUri;
        this.fetchData(dataUri);
      }
    }
  }

  fetchData(uri) {
    fetch(uri)
      .then((response) => {
        return response.json()
      }).then((json) => {
      this.formatData(json);
      console.log('data fetched');
    }).catch((ex) => {
      console.log('parsing failed', ex)
    })
  }

  formatData(dataSet) {
    const { personSize } = this.state;
    const data = [];
    const sendsAConnection = [];
    const receivesAConnection = [];
    const sendsAndReceivesAConnection = [];

    dataSet.map((dataItem) => {
      // First reasign the names to a new object
      let connections = [];
      if (dataItem.conexion) {
        connections = dataItem.conexion.split(',');
      }
      const item = {
        id: dataItem.id,
        connections: connections,
        name: dataItem.nombre,
        photoLink: dataItem.fotoLink,
        description: dataItem.explicacion
      };

      data.push(item);
    });

    data.map((item) => {
      const { connections } = item;
      if (connections.length) {
        sendsAConnection.push(item);
        connections.map((con) => {
          if (receivesAConnection.indexOf(data[con]) === -1)
            receivesAConnection.push(data[con]);
        });
      }
    });

    sendsAConnection.map((item) => {
      if (receivesAConnection.indexOf(item) !== -1) {
        sendsAndReceivesAConnection.push(item);
        const sendsIndex = sendsAConnection.indexOf(item);
        const receivesIndex = receivesAConnection.indexOf(item);
        sendsAConnection.splice(sendsIndex, sendsIndex + 1);
        receivesAConnection.splice(receivesIndex, receivesIndex + 1);
      }
    });

    let height = receivesAConnection.length * (personSize * 1.5);
    if (sendsAConnection.length > receivesAConnection.length) {
      height = sendsAConnection.length * (personSize * 1.5);
    }

    this.setState({
      sendsAConnection,
      receivesAConnection,
      sendsAndReceivesAConnection,
      data,
      height
    })
  }

  showTooltip(name, x) {
    const tooltip = { show: true, content: name, x: x.layerX, y: x.layerY };
    this.setState({ tooltip });
  }

  hideTooltip() {
    const tooltip = { show: false };
    this.setState({ tooltip });
  }

  render(props, state) {
    const { width, height, sendsAConnection, sendsAndReceivesAConnection, receivesAConnection, personSize, data, tooltip } = state;

    const graphicData = {
      width,
      height,
      sendsAConnection,
      sendsAndReceivesAConnection,
      receivesAConnection,
      personSize,
      data
    };

    return (
      <div className={s.container}>
        <div className={s.graphic}>
          <Graphic
            {...graphicData}
            tooltipCallback={this.showTooltip}
            hideTooltipCallback={this.hideTooltip}
          />
          <Tooltip {...tooltip} canvasWidth={width} />
        </div>
      </div>
    )
  }
}