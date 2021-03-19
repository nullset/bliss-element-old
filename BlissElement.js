import { observable, observe } from "@nx-js/observer-util";
import { render, html, svg } from "uhtml";
import props from "element-props";
import "construct-style-sheets-polyfill";

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

const lifecycleMethods = {
  connectedCallback: true,
  disconnectedCallback: true,
  adoptedCallback: true,
  attributeChangedCallback: true,
};

const eventRegex = new RegExp("^on([a-z])");
function isAnEvent(name) {
  return eventRegex.test(name);
}

const ctxTree = new Map();
Object.defineProperties(ctxTree, {
  parent: {
    value: (node) => {
      const nodeInfo = ctxTree.get(node);
      return ctxTree.get(nodeInfo.path[nodeInfo.path.length - 2]);
    },
  },
  ancestors: {
    value: (node) => {
      return ctxTree.get(node).slice(0, -1).reverse();
    },
  },

  descendants: {
    value: (node) => {
      const path = ctxTree.get(node);
      const length = path.length;
      return Array.from(ctxTree.entries()).reduce(
        (acc, [key, value], i, arr) => {
          if (value.length <= length) return acc;
          const ctxPathSlice = value.slice(0, length);
          if (ctxPathSlice.every((ctx, idx, arr) => arr[idx] === path[idx])) {
            acc.push(key);
          }
          return acc;
        },
        []
      );
    },
  },

  relatives: {
    value: (node) => {
      return [ctxTree.ancestors(node), ctxTree.descendants(node)].flat(
        Infinity
      );
    },
  },
});

function define(tagName, componentObj, options = {}) {
  const { mixins = [], base = HTMLElement, extend = undefined } = options;
  const prototypeChain = Array.isArray(mixins) ? mixins : [mixins];
  prototypeChain.push(componentObj);
  const flattenedPrototype = Object.assign(
    Object.create(null),
    ...prototypeChain
  );
  const preBoundEvents = Object.keys(flattenedPrototype).reduce((acc, key) => {
    if (isAnEvent(key)) acc.push(key.replace(eventRegex, "$1"));
    return acc;
  }, []);

  const componentStylesheets = constructStylesheets(prototypeChain);

  class BlissElement extends base {
    static get observedAttributes() {
      return [
        /* array of attribute names to monitor for changes */
      ];
    }

    get isBlissElement() {
      return true;
    }

    handleEvent(e) {
      this["on" + e.type](e);
    }

    constructor() {
      super();

      preBoundEvents.forEach((event) => {
        this.addEventListener(event, this);
      });

      // this.state = this.props = observable(props(this));
      this.state = observable({});
      this.internalState = observable({});

      let rootNode;
      if (this.hasShadowRoot == null) {
        rootNode = this.attachShadow({ mode: "open" });
        rootNode.adoptedStyleSheets = componentStylesheets;
      } else {
        rootNode = this;
      }

      observe(() => {
        render(rootNode, this.render());
      });
    }

    watch(fn) {
      observe(fn);
    }

    ctxParent(matcher) {
      let node = this;
      let ctx;
      while (!ctx && node.parentElement) {
        node = node.parentElement;
        if (!node.isBlissElement) return;
        if (node.matches(matcher)) ctx = node;
      }
      return node;
    }

    get ctxAncestors() {
      return ctxTree.ancestors(this);
    }

    get ctxDescendants() {
      return ctxTree.descendants(this);
    }

    get ctxRelatives() {
      return ctxTree.relatives(this);
    }

    getCtx(node) {
      return ctxTree.get(node);
    }

    ctxRemove(node) {
      return ctxTree.remove(node);
    }

    get ctxTree() {
      return ctxTree;
    }

    buildCtxAncestors() {
      let node = this;
      let ctxArr = [node];
      console.log(node);
      while (node.parentElement) {
        node = node.parentElement;
        if (node.isBlissElement) ctxArr.push(node);
      }

      const c = ctxArr[0];
      const path = ctxArr.slice(0).reverse();
      ctxTree.set(c, path);
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      console.log("BLISS connectedCallback", this);

      // Must wait a ticx because child elements can be attached before their parents.
      requestAnimationFrame(() => this.buildCtxAncestors());
    }

    disconnectedCallback() {
      if (super.disconnectedCallback) super.disconnectedCallback();

      return ctxTree.delete(this);
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
  }

  prototypeChain.forEach((proto) => {
    Object.entries(proto).forEach(([key, value]) => {
      if (typeof value === typeof Function) {
        if (lifecycleMethods[value.name]) {
          // If property is a lifecycleMethod, then call the original function and our new function. Behaves like `super.myMethod()`.
          const originalFn = BlissElement.prototype[key];
          BlissElement.prototype[key] = function (args) {
            originalFn.call(this, args);
            value.call(this, args);
          };
        } else {
          if (isAnEvent(key)) {
            // Events are handled in a special way on HTMLElement. This is because HTMLElement is a function, not an object.
            Object.defineProperty(BlissElement.prototype, key, {
              value: value,
              enumerable: true,
              configurable: true,
            });
          } else {
            BlissElement.prototype[key] = value;
          }
        }
        return;
      }

      // If not a lifecycleMethod then overwrite existing property.

      BlissElement.prototype[key] = value;
    });
  });

  customElements.define(tagName, BlissElement, { extends: extend });
}

export { define, html, svg, css, observable, observe };