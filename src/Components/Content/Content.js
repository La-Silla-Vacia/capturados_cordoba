import { h, render, Component } from 'preact';
import cx from 'classnames';
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();
// Remember old renderer, if overriden, or proxy to default renderer
var defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  // If you are sure other plugins can't add `target` - drop check below
  var aIndex = tokens[idx].attrIndex('target');

  if (aIndex < 0) {
    tokens[idx].attrPush(['target', '_blank']); // add new attribute
  } else {
    tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
  }

  // pass token to default renderer.
  return defaultRender(tokens, idx, options, env, self);
};

import s from './Content.css';

export default class Content extends Component {

  constructor() {
    super();

    this.state = {
      height: 0,
      visible: false
    };

    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    const box = document.querySelector('#lsvi-content-box');

    setTimeout(() => {
      this.setState({ height: box.offsetHeight });
      this.setState({ visible: true });
    }, 100);
  }

  handleClose() {
    this.setState({visible: false});
    setTimeout(() => {
      this.props.toggleContentCallback(false);
    }, 400);
  }

  render(props, state) {
    const { graphHeight, name, description } = props;
    const { height, visible } = state;

    let style;
    if (height !== 0) {
      style = {
        position: 'absolute',
        height: '100%'
      };

      if (height > graphHeight) {
        style = {
          marginTop: -(graphHeight),
          height: '100%'
        };
      }
    }

    const content = md.render(String(description));

    return (
      <div id="lsvi-content-box" className={cx(s.container, { [s.container__visible]: visible })} style={style}>
        <div className={s.overlay} onClick={this.handleClose} />
        <div className={s.inner}>
          <div className={s.header}>
            <button className={s.button} onClick={this.handleClose}>
              <svg className={s.arrow} x="0px" y="0px"
                   viewBox="0 0 95.9 65.9" style="enable-background:new 0 0 95.9 65.9;" xmlSpace="preserve">
                <path className={s.arrowPath} d="M90.6,1.5C72.1,23,44.9,18.1,44.9,18.1V2.9c0-1.1-0.6-2.1-1.6-2.6c-1-0.5-2.2-0.4-3.1,0.3L1.9,29.4C0.7,30.2,0,31.6,0,33.1
	s0.7,2.9,1.9,3.7l38.3,28.8c0.9,0.7,2.1,0.8,3.1,0.3s1.6-1.5,1.6-2.7V48.1c41.8,0,49.7-29,51-44.5c0.1-1.3-0.7-2.6-1.9-3
	C92.8,0,91.4,0.4,90.6,1.5L90.6,1.5z" />
              </svg>
              Volver
            </button>
          </div>
          <h3 className={s.title}>{name}</h3>
          <div dangerouslySetInnerHTML={{ __html: content }} />

          <button className={cx(s.button, s.button__end)} onClick={this.handleClose}>
            <svg className={s.arrow} x="0px" y="0px"
                 viewBox="0 0 95.9 65.9" style="enable-background:new 0 0 95.9 65.9;" xmlSpace="preserve">
              <path className={s.arrowPath} d="M90.6,1.5C72.1,23,44.9,18.1,44.9,18.1V2.9c0-1.1-0.6-2.1-1.6-2.6c-1-0.5-2.2-0.4-3.1,0.3L1.9,29.4C0.7,30.2,0,31.6,0,33.1
	s0.7,2.9,1.9,3.7l38.3,28.8c0.9,0.7,2.1,0.8,3.1,0.3s1.6-1.5,1.6-2.7V48.1c41.8,0,49.7-29,51-44.5c0.1-1.3-0.7-2.6-1.9-3
	C92.8,0,91.4,0.4,90.6,1.5L90.6,1.5z" />
            </svg>
            Volver
          </button>
        </div>
      </div>
    )
  }
}