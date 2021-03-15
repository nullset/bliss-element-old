const lifecycleMethods = {
  connectedCallback: true,
  disconnectedCallback: true,
  adoptedCallback: true,
  attributeChangedCallback: true,
};

function define(tagName, obj, options = {}) {
  const { type = HTMLElement, extend = undefined } = options;

  class StampElement extends type {
    constructor() {
      super();

      if (StampElement.prototype.shadowDOM) {
        this.attachShadow({ mode: "open" });
      }
    }

    connectedCallback() {
      // FOO
      debugger;
    }

    testBlah() {
      debugger;
    }
  }
  Object.defineProperty(StampElement.prototype, "shadowDOM", {
    value: true,
    writable: true,
    enumerable: false,
    // configurable: true,
  });

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === typeof Function && lifecycleMethods[value.name]) {
      const originalFn = StampElement.prototype[key];
      StampElement.prototype[key] = function (args) {
        debugger;
        originalFn(args);
        value(args);
      };
      return;
    }

    // if (key === "shadowDOM") {
    //   debugger;
    //   if (value) StampElement.prototype[key] = value;
    //   return;
    // }

    StampElement.prototype[key] = value;
  });

  // const ElemClass = Object.assign(FooElement.prototype, obj);
  // debugger;
  customElements.define(tagName, StampElement, { extends: extend });
}

const Foo = {
  // shadowDOM: false,
  connectedCallback() {
    //   // super.connectedCallback();
    debugger;
  },
  blah() {
    debugger;
  },
  testBlah() {
    debugger;
    console.log("succcess");
  },
};
define("foo-tag", Foo);
