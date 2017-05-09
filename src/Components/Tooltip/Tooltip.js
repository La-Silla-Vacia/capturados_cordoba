import { h, render, Component } from 'preact';
import cx from 'classnames';

import s from './Tooltip.css';

export default class Tooltip extends Component {
  render(props, state) {
    console.log(props);
    const {x, y} = props;
    const style = {
      left: x,
      top: y
    };
    return (
      <div className={s.container} style={style}>
       hoi
      </div>
    )
  }
}