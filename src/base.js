import { h, render, Component } from 'preact';
import cx from 'classnames';
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();

import s from './base.css';
import Tooltip from "./Components/Tooltip";
import Graphic from "./Components/Graphic";
import Content from "./Components/Content";
// const data = require('../data/data.json');

export default class Base extends Component {

  constructor() {
    super();

    this.state = {
      instructions: '',
      data: [],
      sendsAConnection: [],
      receivesAConnection: [],
      sendsAndReceivesAConnection: [],
      personSize: 40,
      width: 300,
      height: 400,
      tooltip: {
        show: false,
        x: false,
        y: false
      },
      content: false
    };

    this.updateDimensions = this.updateDimensions.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
    this.toggleContent = this.toggleContent.bind(this);
  }

  componentWillMount() {
    this.setData();

    this.updateDimensions();
  }

  componentWillReceiveProps(newprops) {
    if (newprops.width) {
      this.setState({ width: newprops.width() })
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  updateDimensions() {
    if (this.props.width) {
      this.setState({ width: this.props.width() })
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
      console.log('could not get the data');
    } else {
      if (interactiveData.instrucciones) {
        const instructions = md.render(String(interactiveData.instrucciones));
        this.setState({ instructions });
      }
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
        description: dataItem.explicacion,
        special: dataItem.especial
      };

      data.push(item);
    });

    data.map((item) => {
      const { connections } = item;
      if (connections.length) {
        sendsAConnection.push(item);
        connections.map((con) => {
          data.map((dataItem) => {
            if (dataItem.id === con) {
              if (receivesAConnection.indexOf(dataItem) === -1)
                receivesAConnection.push(dataItem);
            }
          });
        });
      }
    });

    sendsAConnection.map((item) => {
      if (receivesAConnection.indexOf(item) !== -1) {
        sendsAndReceivesAConnection.push(item);
        const sendsIndex = sendsAConnection.indexOf(item);
        const receivesIndex = receivesAConnection.indexOf(item);
        sendsAConnection.splice(sendsIndex, 1);
        receivesAConnection.splice(receivesIndex, 1);
      }
    });

    let height = receivesAConnection.length * (personSize * 1.2);
    if (sendsAConnection.length > receivesAConnection.length) {
      height = sendsAConnection.length * (personSize * 1.2);
    }

    this.setState({
      sendsAConnection,
      receivesAConnection,
      sendsAndReceivesAConnection,
      data,
      height
    });
  }

  showTooltip(name, x) {
    const tooltip = { show: true, content: name, x: x.layerX, y: x.layerY };
    this.setState({ tooltip });
  }

  hideTooltip() {
    const tooltip = { show: false };
    this.setState({ tooltip });
  }

  toggleContent(item) {
    if (item && item.description) {
      this.setState({ content: item });
    } else {
      this.setState({ content: false });
    }
  }

  getContent() {
    const { content, height } = this.state;
    if (content) {
      return (
        <Content
          graphHeight={height}
          toggleContentCallback={this.toggleContent}
          {...content}
        />
      )
    }
  }

  render(props, state) {
    const { width, height, sendsAConnection, sendsAndReceivesAConnection, receivesAConnection, personSize, data, tooltip, instructions } = state;

    const graphicData = {
      width,
      height,
      sendsAConnection,
      sendsAndReceivesAConnection,
      receivesAConnection,
      personSize,
      data
    };

    const content = this.getContent();

    return (
      <div className={s.container}>
        <header className={s.header}>
          <div className={s.instructions} dangerouslySetInnerHTML={{__html: instructions}} />
          <ul className={s.legend}>
            <li>En líos <span className={cx(s.legend__circle, s.color__red)} /></li>
            <li>Conexión política <span className={cx(s.legend__circle, s.color__yellow)} /></li>
          </ul>
        </header>
        <div className={s.graphic}>
          <Graphic
            {...graphicData}
            tooltipCallback={this.showTooltip}
            hideTooltipCallback={this.hideTooltip}
            toggleContentCallback={this.toggleContent}
          />
          <Tooltip {...tooltip} canvasWidth={width} />
        </div>
        {content}
      </div>
    )
  }
}