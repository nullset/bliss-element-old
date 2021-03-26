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
      <nav part="tabs">
        <slot name="tabs"></slot>
      </nav>
      <div part="content">
        <slot></slot>
      </div>
    `;
  },
};
define("bliss-tabs", Tabs);

const tabbable = {
  attrs: {
    active: { type: Boolean },
  },
  onMount() {
    this.tabs = this.getParentContext("bliss-tabs");
    const nodes = Array.from(this.tabs.querySelectorAll(this.tagName));
    this.state.index = nodes.findIndex((node) => node === this);

    // If this.active is true, then set tabs.state.activeTab to be this tab.
    observe(() => {
      if (this.state.active) this.tabs.state.activeTab = this.state.index;
    });

    // If tabs.state.activeTab is this tab, then set this tab's active prop to true.
    observe(() => {
      this.state.active = this.tabs.state.activeTab === this.state.index;
    });
  },

  onUnmount() {
    if (this.tabs.state.activeTab === this.state.index)
      this.tabs.state.activeTab = undefined;
  },
};

const keyboardNavigable = {
  attrs: { tabindex: { type: Number, default: 0 } },
  onMount() {
    this.addEventListener("keypress", (e) => {
      if (
        e.target === this &&
        !this.state.disabled &&
        ["Enter", " "].includes(e.key)
      ) {
        this.click(e);
      }
    });
  },
};

const Tab = {
  attrs: {
    slot: { default: "tabs" },
  },
  styles: css`
    :host {
      border-bottom: 2px solid transparent;
      cursor: pointer;
    }
    :host([active]) {
      border-bottom-color: blueviolet;
    }
    :host([disabled]) {
      opacity: 0.5;
      cursor: not-allowed;
    }
    :host(:not(:nth-of-type(1))) {
      margin-left: 1rem;
    }
  `,
  render() {
    return html`<slot></slot>`;
  },
  onclick(e) {
    if (!this.state.disabled) {
      this.tabs.state.activeTab = this.state.index;
    }
  },
};
define("bliss-tab", Tab, { mixins: [tabbable, keyboardNavigable] });

const TabContent = {
  onMount() {
    observe(() => {
      this.state.hidden = this.tabs.state.activeTab !== this.state.index;
    });
  },
  render() {
    return html`<slot></slot>`;
  },
};
define("bliss-tab-content", TabContent, { mixins: tabbable });

// ----------------------------------------------------------------

const ActiveTabBadge = {
  attrs: { ref: { type: Array } },

  onMount() {
    const tabs = this.getGlobalContext(this.ref);

    observe(() => {
      this.state.number = tabs.state.activeTab;
    });
  },
  styles: css`
    :host {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: lime;
    }
  `,
  render() {
    // We observe this.state rather than this.tabs.state because there is no guarantee what order web components will be loaded in
    // and so we have no idea at initial render if this.tabs is a valid reference or if it currently has a `state` set.
    // Observing a local variable that references a different element is much safer, as the property path will always resolve.
    return html`<div>${this.state.number}</div>`;
  },
};
define("active-tab-badge", ActiveTabBadge);
