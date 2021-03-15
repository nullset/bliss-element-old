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
      console.log("StampElement connectedCallback", this);
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

  Object.entries(obj).forEach(([key, value]) => {
    // If property is a lifecycleMethod, then call the original function and our new function. Behaves like `super.myMethod()`.
    if (typeof value === typeof Function && lifecycleMethods[value.name]) {
      const originalFn = StampElement.prototype[key];
      StampElement.prototype[key] = function (args) {
        originalFn.call(this, args);
        value.call(this, args);
      };
      return;
    }

    // Overwrite existing property.
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
    console.log("FOO connectedCallback", this);
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
