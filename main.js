// const lifecycleMethods = {
//   connectedCallback: true,
//   disconnectedCallback: true,
//   adoptedCallback: true,
//   attributeChangedCallback: true,
// };

// function define(tagName, obj, options = {}) {
//   const { type = HTMLElement, extend = undefined } = options;

//   class StampElement extends type {
//     constructor() {
//       super();

//       if (StampElement.prototype.shadowDOM) {
//         this.attachShadow({ mode: "open" });
//       }
//     }

//     connectedCallback() {
//       super.connectedCallback();
//       console.log("StampElement connectedCallback", this);
//       console.log("shadowRoot", this.shadowRoot);
//     }

//     testBlah() {
//       console.log("StampElement testBlah");
//     }
//   }
//   Object.defineProperty(StampElement.prototype, "shadowDOM", {
//     value: true,
//     writable: true,
//     enumerable: false,
//   });

//   Object.entries(obj).forEach(([key, value]) => {
//     // If property is a lifecycleMethod, then call the original function and our new function. Behaves like `super.myMethod()`.
//     if (typeof value === typeof Function && lifecycleMethods[value.name]) {
//       const originalFn = StampElement.prototype[key];
//       StampElement.prototype[key] = function (args) {
//         originalFn.call(this, args);
//         value.call(this, args);
//       };
//       return;
//     }

//     // Overwrite existing property.
//     StampElement.prototype[key] = value;
//   });

//   // const ElemClass = Object.assign(FooElement.prototype, obj);
//   // debugger;
//   customElements.define(tagName, StampElement, { extends: extend });
// }

// const Foo = {
//   // shadowDOM: false,
//   connectedCallback() {
//     //   // super.connectedCallback();
//     console.log("FOO connectedCallback", this);
//   },
//   blah() {
//     debugger;
//   },
//   testBlah() {
//     debugger;
//     console.log("testblah", this);
//   },
// };
// define("foo-tag", Foo);

import { define, render, html, svg, css } from "uce";
define("my-component", {
  // // if specified, it can extend built-ins too.
  // // by default it's 'element', as HTMLElement
  // extends: "li",

  // // if specified, it injects once per class definition
  // // a <style> element in the document <head>.
  // // In this case, selector will be the string:
  // // div[is="my-component"]
  // style: (selector) => css`
  //   ${selector} {
  //     font-weight: bold;
  //   }
  // `,

  // if specified, it's like the constructor but
  // it's granted to be invoked *only once* on bootstrap
  // and *always* before connected/attributeChanged/props
  init() {
    // µhtml is provided automatically via this.html
    // it will populate the shadow root, even if closed
    // or simply the node, if no attachShadow is defined
    this.html`<h1>Hello 👋 µce</h1><slot></slot>`;
    // a default props access example
    // <my-ce name="ag" />
    // console.log(this.props.name); // "ag"
  },

  // if there is a render method, and no `init`,
  // this method will be invoked automatically on bootstrap.
  // element.render(), if present, is also invoked automatically
  // when `props` are defined as accessors, and one of these is
  // set during some outer component render()
  // render() {
  //   this.html`<h1>Hello again!</h1>`;
  // },

  // by default, props resolves all attributes by name
  // const {prop} = this.props; will be an alias for
  // this.getAttribute('prop') operation,
  // but it can simulate what React props do,
  // meaning that if it's defined as object,
  // all properties will trigger automatically
  // a render() call, if there is a render,
  // and properties are set as accessor, so that
  // the syntax to trigger these is .prop=${value}
  // as opposite of the default prop=${value}
  // which is observable, but it can hold only strings.
  // props: {prop: value} will make this.prop work.
  // If you don't want any of this machinery around props
  // you can opt out by defining it as null.
  // Bear in mind, the way to pass props as accessors,
  // is by prefixing the attribute via `.`, that is:
  // this.html`<my-comp .prop=${value}/>`;
  props: null,

  // if present, all names will be automatically bound to the element
  // right before initialization (el.method = el.method.bind(el))
  // this allows usage of methods instead of `this` for inner components
  bound: ["method"],

  // if specified, it renders within its Shadow DOM
  // compatible with both open and closed modes
  attachShadow: { mode: "closed" },

  // if specified, observe the list of attributes
  observedAttributes: ["test"],

  // if specified, will be notified per each
  // observed attribute change
  attributeChanged(name, oldValue, newValue) {},

  // if specified, will be invoked when the node
  // is either appended live, or removed
  connected() {},
  disconnected() {},

  // events are automatically attached, as long
  // as they start with the `on` prefix
  // the context is *always* the component,
  // you'll never need to bind a method here
  onClick(event) {
    console.log(this); // always the current Custom Element
  },

  // if specified with `on` prefix and `Options` suffix,
  // allows adding the listener with a proper third argument
  onClickOptions: { once: true }, // or true, or default false

  // any other method, property, or getter/setter will be
  // properly configured in the defined class prototype
  get test() {
    return Math.random();
  },

  set test(value) {
    console.log(value);
  },

  sharedData: [1, 2, 3],

  method() {
    return this.test;
  },
});
