import { observable, observe } from "@nx-js/observer-util";
import { render, html, svg } from "uhtml";
import props from "element-props";

const lifecycleMethods = {
  connectedCallback: true,
  disconnectedCallback: true,
  adoptedCallback: true,
  attributeChangedCallback: true,
};

function define(tagName, componentObj, options = {}) {
  const { mixins = [], base = HTMLElement, extend = undefined } = options;
  const prototypeChain = Array.isArray(mixins) ? mixins : [mixins];
  prototypeChain.push(componentObj);
  class StampElement extends base {
    static get observedAttributes() {
      return [
        /* array of attribute names to monitor for changes */
      ];
    }

    constructor() {
      super();

      const obsAttr = {
        foo: String,
        num: Number,
        bool: Boolean,
        arr: Array,
        obj: Object,
      };
      this.state = this.props = observable(props(this, obsAttr));

      observe(() => {
        console.log("THe state of foo:", this.state.foo);
        // debugger;
      });

      const rootNode = StampElement.prototype.shadowDOM
        ? this.attachShadow({ mode: "open" })
        : this.renderRoot || this;

      observe(() => {
        render(rootNode, this.render());
      });
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      console.log("StampElement connectedCallback", this);
      console.log("shadowRoot", this.shadowRoot);
    }

    disconnectedCallback() {
      if (super.disconnectedCallback) super.disconnectedCallback();
      console.log("StampElement disconnectedCallback", this);
    }

    adoptedCallback() {
      if (super.adoptedCallback) super.adoptedCallback();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (super.attributeChangedCallback) super.attributeChangedCallback();
    }

    render() {
      return html``;
    }

    testBlah() {
      console.log("StampElement testBlah");
    }
  }
  Object.defineProperty(StampElement.prototype, "shadowDOM", {
    value: true,
    writable: true,
    enumerable: false,
  });

  prototypeChain.forEach((p) => {
    Object.entries(p).forEach(([key, value]) => {
      // If property is a lifecycleMethod, then call the original function and our new function. Behaves like `super.myMethod()`.
      if (typeof value === typeof Function && lifecycleMethods[value.name]) {
        const originalFn = StampElement.prototype[key];
        StampElement.prototype[key] = function (args) {
          originalFn.call(this, args);
          value.call(this, args);
        };
        return;
      }

      // If not a lifecycleMethod then overwrite existing property.
      StampElement.prototype[key] = value;
    });
  });

  customElements.define(tagName, StampElement, { extends: extend });
}

const Foo = {
  observedAttributes: [],
  // shadowDOM: false,
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
      Hello 👋 µhtml : ${this.state.foo} : ${this.state.xxx}
    </h1>`;
  },
};

const Bar = {
  observedAttributes: [],
  // shadowDOM: false,
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
