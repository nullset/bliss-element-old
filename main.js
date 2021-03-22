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
  connectedCallback() {
    this.watch(() => {
      const activeTab = this.state.activeTab;
      this.querySelectorAll(":scope > aha-tab").forEach((tab) => {
        if (tab !== activeTab && tab.state) tab.state.active = false;
      });
    });
  },
  // activateTab(elem) {
  //   this.querySelectorAll("aha-tab").forEach((tab) => {
  //     tab.state.active = elem === tab ? true : false;
  //   });
  // },
};
define("aha-tabs", Tabs);

const Tab = {
  connectedCallback() {
    this.tabs = this.ctxParent("aha-tabs");
    this.setFirstTabActive();

    observe(() => {
      this.state.active = raw(this.tabs.state.activeTab) === this;
    });
  },

  setFirstTabActive() {
    this.tabs.state.activeTab = this.tabs.firstElementChild;
  },

  disconnectedCallback() {
    this.setFirstTabActive();
  },

  render() {
    return html`<li>
      <slot></slot> : ${this.state.active} : ${this.state.uuid}
    </li>`;
  },
  onclick(e) {
    this.tabs.state.activeTab = e.target;
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
