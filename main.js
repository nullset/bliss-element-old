import { html, css, define } from "./BlissElement";

const Foo = {
  observedAttributes: [],
  styles: [
    css`
      h1 {
        color: lime;
      }
    `,
    css`
      body {
        background: orange;
      }
    `,
  ],
  onclick(e) {
    debugger;
  },
  // hasShadowRoot: true,
  connectedCallback() {
    //   // super.connectedCallback();
    console.log("FOO connectedCallback", this);
  },
  blah() {
    debugger;
  },
  testBlah() {
    console.log("FOO.testBlah", this);
    debugger;
  },
  render() {
    return html`<h1>
      Hello 👋 <slot>µhtml</slot> : ${this.state.foo} : ${this.state.xxx}
    </h1>`;
  },
};

const Bar = {
  observedAttributes: [],
  connectedCallback() {
    //   // super.connectedCallback();
    console.log("BAR connectedCallback", this);
  },
  blah() {
    debugger;
  },
  testBlah() {
    console.log("BAR.testBlah", this);
    debugger;
  },
};
define("foo-tag", Foo, { mixins: [Bar] });
