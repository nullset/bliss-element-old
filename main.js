import { html, css, define, observe, raw } from "./BlissElement";

const Tabs = {
  attrs: {
    activeTab: { type: Number, attribute: "active-tab" },
  },
  styles: css`
    :host ul {
      display: inline-flex;
    }
  `,
  connectedCallback() {
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

const Tab = {
  attrs: {
    active: { type: Boolean },
  },
  styles: css`
    :host {
      border-bottom: 2px solid transparent;
    }
    :host([active]) {
      border-bottom-color: purple;
    }
    :host([disabled]) {
      opacity: 0.5;
    }
    :host(:not([disabled])) {
      cursor: pointer;
    }
  `,

  connectedCallback() {
    this.tabs = this.ctxParent("aha-tabs");
    const tabNodes = Array.from(this.tabs.querySelectorAll(this.tagName));
    this.state.tabIndex = tabNodes.findIndex((node) => node === this);

    if (this.state.active) this.tabs.state.activeTab = this.state.tabIndex;

    observe(() => {
      this.state.active = this.tabs.state.activeTab === this.state.tabIndex;
    });
  },

  disconnectedCallback() {
    if (this.tabs.state.activeTab === this.state.tabIndex)
      this.tabs.state.activeTab = undefined;
  },

  render() {
    return html`<slot></slot> `;
  },
  onclick(e) {
    if (!e.currentTarget.state.disabled) {
      this.tabs.state.activeTab = e.currentTarget.state.tabIndex;
    }
  },
};
define("aha-tab", Tab);

const TabContent = {
  attrs: {
    active: { type: Boolean },
  },
  styles: css`
    :host(:not([active])) {
      display: none;
    }
  `,

  connectedCallback() {
    this.tabs = this.ctxParent("aha-tabs");
    const tabNodes = Array.from(this.tabs.querySelectorAll(this.tagName));
    this.state.tabIndex = tabNodes.findIndex((node) => node === this);

    if (this.state.active) this.tabs.state.activeTab = this.state.tabIndex;

    observe(() => {
      this.state.active = this.tabs.state.activeTab === this.state.tabIndex;
    });
  },

  disconnectedCallback() {
    if (this.tabs.state.activeTab === this.state.tabIndex)
      this.tabs.state.activeTab = undefined;
  },

  render() {
    return html`<slot></slot>`;
  },
};
define("aha-tab-content", TabContent);
