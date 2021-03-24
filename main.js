import { html, css, define, observe, raw } from "./BlissElement";

const Tabs = {
  styles: css`
    :host nav {
      display: inline-flex;
    }
  `,
  onMount() {
    observe(() => {
      this.state.activeTab = this.state.activeTab ?? 0;
    });
  },
  render() {
    return html`
      <nav><slot name="tabs"></slot></nav>
      <div><slot></slot></div>
    `;
  },
};
define("aha-tabs", Tabs);

const tabbable = {
  attrs: {
    active: { type: Boolean },
  },
  onMount() {
    this.tabs = this.getContext("aha-tabs");
    const nodes = Array.from(this.tabs.querySelectorAll(this.tagName));
    this.state.tabIndex = nodes.findIndex((node) => node === this);

    if (this.state.active) this.tabs.state.activeTab = this.state.tabIndex;

    observe(() => {
      this.state.active = this.tabs.state.activeTab === this.state.tabIndex;
    });
  },

  onUnmount() {
    if (this.tabs.state.activeTab === this.state.tabIndex)
      this.tabs.state.activeTab = undefined;
  },
};

const Tab = {
  attrs: {
    active: { type: Boolean },
    slot: { default: "tabs" },
  },
  styles: css`
    :host {
      border-bottom: 2px solid transparent;
      cursor: pointer;
    }
    :host([active]) {
      border-bottom-color: purple;
    }
    :host([disabled]) {
      opacity: 0.5;
      cursor: not-allowed;
    }
    :host(:not(:nth-of-type(1))) {
      margin-left: 1rem;
    }
  `,

  // connectedCallback() {
  //   this.setAttribute("slot", "tabs");
  // },

  // onMount() {
  //   this.tabs = this.getContext("aha-tabs");
  //   const tabNodes = Array.from(this.tabs.querySelectorAll(this.tagName));
  //   this.state.tabIndex = tabNodes.findIndex((node) => node === this);

  //   if (this.state.active) this.tabs.state.activeTab = this.state.tabIndex;

  //   observe(() => {
  //     this.state.active = this.tabs.state.activeTab === this.state.tabIndex;
  //   });
  // },

  // onUnmount() {
  //   debugger;
  //   if (this.tabs.state.activeTab === this.state.tabIndex)
  //     this.tabs.state.activeTab = undefined;
  // },

  render() {
    return html`<slot></slot> `;
  },
  onclick(e) {
    if (!e.currentTarget.state.disabled) {
      this.tabs.state.activeTab = e.currentTarget.state.tabIndex;
    }
  },
};
define("aha-tab", Tab, { mixins: tabbable });

const TabContent = {
  // attrs: {
  //   active: { type: Boolean },
  // },
  styles: css`
    :host(:not([active])) {
      display: none;
    }
  `,

  // connectedCallback() {
  //   this.tabs = this.getContext("aha-tabs");
  //   const tabNodes = Array.from(this.tabs.querySelectorAll(this.tagName));
  //   this.state.tabIndex = tabNodes.findIndex((node) => node === this);

  //   if (this.state.active) this.tabs.state.activeTab = this.state.tabIndex;

  //   observe(() => {
  //     this.state.active = this.tabs.state.activeTab === this.state.tabIndex;
  //   });
  // },

  // disconnectedCallback() {
  //   if (this.tabs.state.activeTab === this.state.tabIndex)
  //     this.tabs.state.activeTab = undefined;
  // },

  render() {
    return html`<slot></slot>`;
  },
};
define("aha-tab-content", TabContent, { mixins: tabbable });

//----------------------------------------------------------------
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
  // connectedCallback() {
  //   //   // super.connectedCallback();
  //   console.log("FOO connectedCallback", this);
  // },
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
  // connectedCallback() {
  //   //   // super.connectedCallback();
  //   // console.warn("BAR connectedCallback", this);
  // },
  // onMount() {
  //   console.warn("onMount in Bar", this);
  // },
  blah() {
    debugger;
  },
  testBlah() {
    console.log("BAR.testBlah", this);
    debugger;
  },
};
define("foo-tag", Foo, { mixins: [Bar] });

const Thing = {
  onMount() {},
  render() {
    return html`<slot></slot>`;
  },
  onclick(e) {
    // this.tabsCtx.activateTab(e.target);
  },
};
define("aha-thing", Thing);
