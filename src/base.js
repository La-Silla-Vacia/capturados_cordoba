import { h, render, Component } from 'preact';
import cx from 'classnames';

import s from './base.css';
import Tooltip from "./Components/Tooltip/Tooltip";
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
    }
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

  getSenders(group, alignment) {
    const { personSize, width } = this.state;
    const circleSize = personSize / 2;
    let y = -(personSize);
    let x = circleSize;

    if (alignment === 'right') {
      x = width - circleSize;
    } else if (alignment === 'center') {
      x = width / 2;
    }

    return group.map((sender, index) => {
      const { name, id } = sender;
      y += personSize * 1.5;
      return (
        <circle
          key={index}
          title={name}
          cx={x} cy={y}
          fill={`url(#photo-${id})`}
          r={circleSize - 1}
          className={cx(s.person, s[`person--${alignment}`])}
          onMouseEnter={this.showTooltip.bind(this, x, y)}
          onMouseLeave={this.hideTooltip.bind(this)}
        />
      )
    });
  }

  showTooltip(x, y) {
    const tooltip = { show: true, x, y };
    this.setState({ tooltip });
  }

  hideTooltip() {
    const tooltip = { show: false };
    this.setState({ tooltip });
  }

  getConnections() {
    const { sendsAConnection, receivesAConnection, sendsAndReceivesAConnection, personSize, width } = this.state;
    return sendsAConnection.map((sender, index) => {
      let x1 = personSize / 2;
      let y1 = (personSize / 2) + ((personSize * 1.5) * index);

      let x2 = width - personSize / 2;
      let y2;

      return sender.connections.map((con) => {
        let notInReceivers = true;
        receivesAConnection.map((recItem, index) => {
          if (recItem.id === con) {
            notInReceivers = false;
            y2 = (personSize / 2) + ((personSize * 1.5) * index);
          }
        });

        if (notInReceivers) {
          sendsAndReceivesAConnection.map((recItem, index) => {
            if (recItem.id === con) {
              x2 = width / 2;
              y2 = (personSize / 2) + ((personSize * 1.5) * index);
            }
          });
        }

        return (
          <line x1={x1} y1={y1} x2={x2} y2={y2} className={s.connection} />
        );
      });

    });
  }

  getSenderAndReceiverConnections(group) {
    const { width, receivesAConnection, personSize } = this.state;
    return group.map((sender, index) => {
      let x1 = width / 2 + personSize / 2;
      let y1 = (personSize / 2) + ((personSize * 1.5) * index);

      let x2 = width - personSize / 2;

      return sender.connections.map((con) => {
        return receivesAConnection.map((recItem, index) => {
          if (recItem.id === con) {
            let y2 = (personSize / 2) + ((personSize * 1.5) * index);
            return (
              <line x1={x1} y1={y1} x2={x2} y2={y2} className={s.connection} />
            );
          }
        });
      });
    })
  }

  getProfilePictures() {
    const { data, personSize } = this.state;
    return data.map((item) => {
      const { photoLink, id } = item;
      return (
        <pattern id={`photo-${id}`} height="100%" width="100%" patternContentUnits="objectBoundingBox" viewBox="0 0 1 1"
                 preserveAspectRatio="xMidYMid slice">
          <image height="1" width="1" preserveAspectRatio="xMidYMid slice" xmlnsXlink="http://www.w3.org/1999/xlink"
                 xlinkHref={photoLink} />
        </pattern>
      );
    });
  }

  render(props, state) {
    const { width, height, sendsAConnection, sendsAndReceivesAConnection, receivesAConnection, tooltip } = state;
    const profilePictures = this.getProfilePictures();
    const senders = this.getSenders(sendsAConnection, 'left');
    const sendAndReceivers = this.getSenders(sendsAndReceivesAConnection, 'center');
    const receivers = this.getSenders(receivesAConnection, 'right');
    const connections = this.getConnections();
    const senderAndReceiverConnections = this.getSenderAndReceiverConnections(sendsAndReceivesAConnection);

    return (
      <div className={s.container}>
        <div className={s.graphic}>
          <svg width={width} height={height}>
            <defs>
              {profilePictures}

            </defs>
            {connections}
            {senderAndReceiverConnections}
            {senders}
            {sendAndReceivers}
            {receivers}
          </svg>
        </div>
        <Tooltip {...tooltip} />
      </div>
    )
  }
}