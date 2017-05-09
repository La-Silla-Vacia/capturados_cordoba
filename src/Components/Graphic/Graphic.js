import { h, render, Component } from 'preact';
import cx from 'classnames';

import s from './Graphic.css';

export default class Graphic extends Component {

  shouldComponentUpdate(nextprops) {
    return nextprops.data !== this.props.data || nextprops.width !== this.props.width;
  }

  getSenders(group, alignment) {
    const { personSize, width } = this.props;
    const circleSize = personSize / 2;
    let y = circleSize;
    let x = circleSize;

    if (alignment === 'right') {
      x = width - circleSize;
    } else if (alignment === 'center') {
      x = width / 2;
    }

    return group.map((sender, index) => {
      const { name, id, description } = sender;
      if (index) {
        y += personSize * 1.2;
      }

      let hasContent = !!description;

      return (
        <circle
          key={id}
          title={name}
          cx={x} cy={y}
          fill={`url(#photo-${id})`}
          r={circleSize - 1}
          className={cx(s.person, s[`person--${alignment}`], { [s['person--has-content']]: hasContent })}
          onMouseMove={this.props.tooltipCallback.bind(this, name)}
          onMouseLeave={this.props.hideTooltipCallback}
          onClick={this.props.toggleContentCallback.bind(this, sender)}
        />
      )
    });
  }

  getConnections() {
    const { sendsAConnection, receivesAConnection, sendsAndReceivesAConnection, personSize, width } = this.props;
    return sendsAConnection.map((sender, index) => {
      let center = false;
      let x1 = personSize / 2;
      let y1 = (personSize / 2) + ((personSize * 1.2) * index);

      let x2 = width - personSize / 2;
      let y2;

      return sender.connections.map((con) => {
        let notInReceivers = true;
        receivesAConnection.map((recItem, index) => {
          if (recItem.id === con) {
            notInReceivers = false;
            y2 = (personSize / 2) + ((personSize * 1.2) * index);
          }
        });

        if (notInReceivers) {
          sendsAndReceivesAConnection.map((recItem, index) => {
            if (recItem.id === con) {
              x2 = width / 2;
              y2 = (personSize / 2) + ((personSize * 1.2) * index);
              center = true;
            }
          });
        }

        return (
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className={cx(s.connection, { [s.connection__center]: center })}
            onClick={this.props.toggleContentCallback.bind(this, sender)}
          />
        );
      });

    });
  }

  getSenderAndReceiverConnections(group) {
    const { width, receivesAConnection, personSize } = this.props;
    return group.map((sender, index) => {
      let x1 = width / 2 + personSize / 2;
      let y1 = (personSize / 2) + ((personSize * 1.2) * index);

      let x2 = width - personSize / 2;

      return sender.connections.map((con) => {
        return receivesAConnection.map((recItem, index) => {
          if (recItem.id === con) {
            let y2 = (personSize / 2) + ((personSize * 1.2) * index);
            return (
              <line x1={x1} y1={y1} x2={x2} y2={y2} className={cx(s.connection, s.connection__center)} />
            );
          }
        });
      });
    })
  }

  getProfilePictures() {
    const { data, personSize } = this.props;
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
    const { width, height, sendsAConnection, sendsAndReceivesAConnection, receivesAConnection } = props;
    const profilePictures = this.getProfilePictures();
    const senders = this.getSenders(sendsAConnection, 'left');
    const sendAndReceivers = this.getSenders(sendsAndReceivesAConnection, 'center');
    const receivers = this.getSenders(receivesAConnection, 'right');
    const connections = this.getConnections();
    const senderAndReceiverConnections = this.getSenderAndReceiverConnections(sendsAndReceivesAConnection);

    return (
      <svg width={width} height={height} className={s.canvas}>
        <defs>
          {profilePictures}
        </defs>

        {connections}
        {senderAndReceiverConnections}
        {senders}
        {sendAndReceivers}
        {receivers}
      </svg>
    )
  }
}