import { html, css, define, observe } from "./BlissElement";

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
    // this.state.uuid = Math.random();
    // this.tabsCtx = this.parentCtx("aha-tabs");
    // this.thingCtx = this.parentCtx("aha-thing");
    // this.watch(() => {
    //   this.tabsCtx.state.activeTab = this;
    //   // console.log("watching", this.state.active);
    // });
  },
  render() {
    return html`<li>
      <slot></slot> : ${this.state.active} : ${this.state.uuid}
    </li>`;
  },
  onclick(e) {
    // this.tabsCtx.activateTab(e.target);
    // this.thingCtx.state.name = this.state.uuid;

    this.state.active = true;
  },
};
define("aha-tab", Tab);

const Thing = {
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
