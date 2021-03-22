import { html, css, define, observe, raw } from "./BlissElement";

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
  oninput(e) {
    console.log(e.path[0].value);
    this.value = e.path[0].value;
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
      <input oninput />
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

const Tabs = {
  render() {
    return html`<ul>
      <slot></slot>
    </ul>`;
  },
};
define("aha-tabs", Tabs);

const Tab = {
  attrs: {
    active: { type: Boolean },
    foo: { type: Number, default: 4 },
    myKey: { attribute: "my-key" },
  },
  connectedCallback() {
    this.tabs = this.ctxParent("aha-tabs");
    if (!this.tabs.state.activeTab) this.setFirstTabActive();

    observe(() => {
      this.state.active = raw(this.tabs.state.activeTab) === this;
    });
  },

  setFirstTabActive() {
    this.tabs.state.activeTab = this.tabs.firstElementChild;
  },

  disconnectedCallback() {
    if (raw(this.tabs.state.activeTab) === this) this.setFirstTabActive();
  },

  render() {
    return html`<li>
      <slot></slot> : ${this.state.active} : ${this.state.uuid}
    </li>`;
  },
  onclick(e) {
    this.tabs.state.activeTab = e.currentTarget;
  },
};
define("aha-tab", Tab);

const Thing = {
  connectedCallback() {},
  render() {
    return html`<fieldset>
      <legend>${this.state.name}</legend>
      <slot></slot>
    </fieldset>`;
  },
  onclick(e) {
    // this.tabsCtx.activateTab(e.target);
  },
};
define("aha-thing", Thing);
