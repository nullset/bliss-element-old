import { observable, observe, raw } from "@nx-js/observer-util";
import { render, html, svg } from "uhtml";
import props from "element-props";

import "construct-style-sheets-polyfill";

const lifecycleMethods = {
  connectedCallback: true,
  disconnectedCallback: true,
  adoptedCallback: true,
  attributeChangedCallback: true,
};

function css(string) {
  return string;
}

function constructStylesheets(prototypes) {
  return prototypes
    .slice(0)
    .reduce((acc, { styles }) => {
      if (!styles) return acc;
      const rules = (Array.isArray(styles) ? styles : [styles])
        .map((s) => {
          return s.toString();
        })
        .join("");

      const sheet = new CSSStyleSheet();
      sheet.replaceSync(rules);

      acc.push(sheet);
      return acc;
    }, [])
    .flat(Infinity);
}

function define(tagName, componentObj, options = {}) {
  const { mixins = [], base = HTMLElement, extend = undefined } = options;
  const prototypeChain = Array.isArray(mixins) ? mixins : [mixins];
  prototypeChain.push(componentObj);

  const componentStylesheets = constructStylesheets(prototypeChain);

  class DMMTElement extends base {
    static get attrs() {
      return {
        disabled: Boolean,
        hidden: Boolean,
      };
    }
    static get observedAttributes() {
      return [
        /* array of attribute names to monitor for changes */
      ];
    }

    shadowDOM = true;

    constructor() {
      super();

      const obsAttr = {
        foo: String,
        num: Number,
        bool: Boolean,
        arr: Array,
        obj: Object,
        fooBar: String,
      };
      // this.state = this.props = observable(props(this, obsAttr));
      this.state = observable({ foo: 123 });

      this.internalState = observable({ shadowDOM: this.shadowDOM });
      delete this.shadowDOM;
      // this.props = props(this, obsAttr);
      // this.props = props(this, {
      //   n: Number,
      //   b: Boolean,
      //   o: Object,
      //   a: Array,
      //   s: String,
      //   d: Date,
      // });

      this.props = new Proxy(this.attributes, {
        get(target, name) {
          debugger;
          const attr = target[name];
          return attr && attr.value;
        },
      });

      observe(() => {
        console.log("THe state of foo:", this.state.foo);
        // debugger;
      });

      // this.rootNode = this.shadowDOM
      //   ? this.attachShadow({ mode: "open" })
      //   : this.renderRoot || this;

      observe(() => {
        if (this.internalState.shadowDOM === true) {
          this.rootNode = this.shadowRoot
            ? this.shadowRoot
            : this.attachShadow({ mode: "open" });

          this.rootNode.adoptedStyleSheets = componentStylesheets;

          render(this.rootNode, this.render());
        } else if (this.internalState.shadowDOM === false) {
          this.rootNode = this.renderRoot || this;
          render(this.rootNode, this.render());
        } else {
          const slots = this.shadowRoot.querySelectorAll("slot");
          const slotTempMap = new Map();
          slots.forEach((slot) => {
            slotTempMap.set(slot.name, slot.assignedNodes());
          });
          this.rootNode = this.renderRoot || this;
          render(this.rootNode, this.render());

          const rootSlots = this.rootNode.querySelectorAll("slot");
          rootSlots.forEach((slot) => {
            const contents = slotTempMap.get(slot.name);
            if (contents) {
              const frag = new DocumentFragment();
              contents.forEach((content) => {
                frag.appendChild(content);
              });
              // slot.insertAdjacentElement("afterend", frag);
              slot.appendChild(frag);
            }
          });

          // --- GET STYLES --- //

          this.rootNode = this.shadowRoot
            ? this.shadowRoot
            : this.attachShadow({ mode: "open" });
          render(this.rootNode, this.render());
          this.childNodes.forEach((node) => {
            this.removeChild(node);
          });
          rootSlots.forEach((slot) => {
            const contents = slotTempMap.get(slot.name);
            if (contents) {
              const frag = new DocumentFragment();
              contents.forEach((content) => {
                frag.appendChild(content);
              });
              this.appendChild(frag);
            }
          });
          this.internalState.shadowDOM = 1;
        }

        // render(this.rootNode, this.render());
      });
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      console.log("DMMTElement connectedCallback", this);
      console.log("shadowRoot", this.shadowRoot);
    }

    disconnectedCallback() {
      if (super.disconnectedCallback) super.disconnectedCallback();
      console.log("DMMTElement disconnectedCallback", this);
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
      console.log("DMMTElement testBlah");
    }
  }
  // Object.defineProperties(DMMTElement.prototype, {
  //   shadowDOM: {
  //     value: true,
  //     writable: true,
  //     enumerable: false,
  //   },
  // });

  prototypeChain.forEach((p) => {
    Object.entries(p).forEach(([key, value]) => {
      // If property is a lifecycleMethod, then call the original function and our new function. Behaves like `super.myMethod()`.
      if (typeof value === typeof Function && lifecycleMethods[value.name]) {
        const originalFn = DMMTElement.prototype[key];
        DMMTElement.prototype[key] = function (args) {
          originalFn.call(this, args);
          value.call(this, args);
        };
        return;
      }

      // If not a lifecycleMethod then overwrite existing property.
      DMMTElement.prototype[key] = value;
    });
  });

  customElements.define(tagName, DMMTElement, { extends: extend });
}

const Foo = {
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
      <slot></slot>
      <slot name="baz"></slot>
    </h1> `;
  },
};

const Bar = {
  observedAttributes: [],
  styles: css`
    h1 {
      font-weight: 100;
      color: red;
    }
  `,
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

// TODO: Observable root node (switch between light and shadow dom rendering to capture styles!)
// TODO: Wire up observed attributes
// TODO: Styles
// TODO: Limit reflection to defined attributes
// TODO: Make attributes have "-" instead of no-dash
// TODO: ABility to turn off shadow dom
// TODO: Add global styles
// TODO: attribute accessors for array/objects
// TODO: Rename library to ZenElement? BalancedElement
