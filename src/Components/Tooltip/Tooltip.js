import { h, render, Component } from 'preact';
import cx from 'classnames';

import s from './Tooltip.css';

export default class Tooltip extends Component {
  render(props, state) {
    const {x, y, show, content, canvasWidth} = props;
    let left = x;
    if (left < 160) {
      left = 80;
    }

    if (left > (canvasWidth - 50)) {
      left = canvasWidth - 50;
    }

    const style = {
      left,
      top: y
    };

    if (!show) return;

    return (
      <div className={s.container} style={style}>
        {content}
      </div>
    )
  }
}