var ThemeSwitcher = function(exports, require$$0, require$$0$1) {
  "use strict";
  var __vite_style__ = document.createElement("style");
  __vite_style__.textContent = '.themeSwitcher {\n	cursor: pointer;\n	position: relative;\n}\n\n.themeSwitcher > svg:hover,\n.themeSwitcher li:hover {\n	filter: brightness(1.5);\n}\n\n.themeSwitcher svg {\n	width: 2em;\n	height: 2em;\n	stroke: currentColor;\n	display: block;\n}\n\n.themeSwitcher ul {\n	list-style-type: none;\n	position: absolute;\n	left: 0;\n	margin: 0.5em 0;\n	padding: 0;\n	gap: 0;\n	overflow-y: visible;\n	z-index: 1;\n}\n\n.themeSwitcher li {\n	padding: 0.5em 1em;\n}\n\n.themeSwitcher[data-float="right"] ul {\n	left: auto;\n	right: 0;\n}\n\n.themeSwitcher li {\n	display: flex;\n	align-items: center;\n	gap: 0.5em;\n}\n\n.themeSwitcher li svg {\n	width: 1.5em;\n	height: 1.5em;\n}\n\n.themeSwitcher svg.checked {\n	width: 16px;\n	height: 13.5px;\n}\n/*$vite$:1*/';
  document.head.appendChild(__vite_style__);
  var jsxRuntime = { exports: {} };
  var reactJsxRuntime_production_min = {};
  /**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var hasRequiredReactJsxRuntime_production_min;
  function requireReactJsxRuntime_production_min() {
    if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
    hasRequiredReactJsxRuntime_production_min = 1;
    var f = require$$0, k = Symbol.for("react.element"), l = Symbol.for("react.fragment"), m = Object.prototype.hasOwnProperty, n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p = { key: true, ref: true, __self: true, __source: true };
    function q(c, a, g) {
      var b, d = {}, e = null, h = null;
      void 0 !== g && (e = "" + g);
      void 0 !== a.key && (e = "" + a.key);
      void 0 !== a.ref && (h = a.ref);
      for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
      if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
      return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
    }
    reactJsxRuntime_production_min.Fragment = l;
    reactJsxRuntime_production_min.jsx = q;
    reactJsxRuntime_production_min.jsxs = q;
    return reactJsxRuntime_production_min;
  }
  var hasRequiredJsxRuntime;
  function requireJsxRuntime() {
    if (hasRequiredJsxRuntime) return jsxRuntime.exports;
    hasRequiredJsxRuntime = 1;
    {
      jsxRuntime.exports = requireReactJsxRuntime_production_min();
    }
    return jsxRuntime.exports;
  }
  var jsxRuntimeExports = requireJsxRuntime();
  var client = {};
  var hasRequiredClient;
  function requireClient() {
    if (hasRequiredClient) return client;
    hasRequiredClient = 1;
    var m = require$$0$1;
    {
      client.createRoot = m.createRoot;
      client.hydrateRoot = m.hydrateRoot;
    }
    return client;
  }
  var clientExports = requireClient();
  class EventEmitter {
    constructor() {
      this.listeners = {};
    }
    on(event, listener) {
      var _a;
      const listeners = (_a = this.listeners)[event] ?? (_a[event] = []);
      listeners.push(listener);
    }
    off(event, listener) {
      var _a;
      const listeners = (_a = this.listeners)[event] ?? (_a[event] = []);
      listeners.splice(listeners.indexOf(listener), 1);
    }
    emit(event, ...data) {
      var _a;
      (_a = this.listeners[event]) == null ? void 0 : _a.forEach((listener) => {
        listener(...data);
      });
    }
  }
  const themes = ["light", "dark"];
  const defaultTheme = "light";
  function isTheme(arg) {
    return typeof arg === "string" && themes.map(String).includes(arg);
  }
  function getThemeName(theme) {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case void 0:
      default:
        return "System";
    }
  }
  class SystemProvider extends EventEmitter {
    get() {
      if (!("matchMedia" in window)) {
        return defaultTheme;
      }
      for (const theme of themes) {
        const mediaQueryList = window.matchMedia(`(prefers-color-scheme: ${theme})`);
        if (mediaQueryList.matches) {
          return theme;
        }
      }
      return defaultTheme;
    }
    watch() {
      if (!("matchMedia" in window)) {
        return;
      }
      for (const theme of themes) {
        const mediaQueryList = window.matchMedia(`(prefers-color-scheme: ${theme})`);
        mediaQueryList.addEventListener("change", (ev) => {
          if (ev.matches) {
            this.emit("change", theme);
          }
        });
      }
    }
  }
  class UserProvider extends EventEmitter {
    constructor() {
      super(...arguments);
      this.storageKey = "theme";
    }
    get() {
      const theme = localStorage.getItem(this.storageKey);
      return isTheme(theme) ? theme : void 0;
    }
    set(theme) {
      if (theme) {
        localStorage.setItem(this.storageKey, theme);
      } else {
        localStorage.removeItem(this.storageKey);
      }
      this.emit("change", theme);
    }
  }
  function Dark() {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "svg",
      {
        viewBox: "0 0 100 100",
        xmlns: "http://www.w3.org/2000/svg",
        className: "dark",
        strokeWidth: "8",
        strokeLinecap: "round",
        fill: "none",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "50", cy: "50", r: "46", strokeDasharray: "180", transform: "rotate(22.5 50 50)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "75", cy: "25", r: "46", strokeDasharray: "108 200", transform: "rotate(67.5 75 25)" })
        ]
      }
    );
  }
  function Light() {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "svg",
      {
        viewBox: "0 0 100 100",
        xmlns: "http://www.w3.org/2000/svg",
        className: "light",
        strokeWidth: "8",
        strokeLinecap: "round",
        fill: "none",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "50", cy: "50", r: "20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 50 86 v 10", transform: "rotate(0 50 50)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 50 86 v 10", transform: "rotate(90 50 50)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 50 86 v 10", transform: "rotate(180 50 50)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 50 86 v 10", transform: "rotate(270 50 50)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 50 86 v 15", transform: "rotate(45 50 50)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 50 86 v 15", transform: "rotate(135 50 50)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 50 86 v 15", transform: "rotate(225 50 50)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 50 86 v 15", transform: "rotate(315 50 50)" })
        ]
      }
    );
  }
  function System() {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "svg",
      {
        viewBox: "0 0 100 100",
        xmlns: "http://www.w3.org/2000/svg",
        className: "system",
        strokeWidth: "8",
        strokeLinecap: "round",
        fill: "none",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "50", cy: "50", r: "46" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "path",
            {
              strokeWidth: "0",
              fill: "currentColor",
              d: "\n					M 50,0\n						a 50,50,0,1,1,0,100\n					Z"
            }
          )
        ]
      }
    );
  }
  function Icon({ theme }) {
    switch (theme) {
      case "light":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Light, {});
      case "dark":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Dark, {});
      case void 0:
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(System, {});
    }
  }
  function Checked() {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "svg",
      {
        viewBox: "0 0 640 540",
        xmlns: "http://www.w3.org/2000/svg",
        className: "checked",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            fill: "currentColor",
            d: "\n					M 12,370\n						a 40,40,0,0,1,56.56,-56.56\n						l 130,130\n						l 370,-430\n						a 40,40,0,0,1,56.56,56.56\n						l -398.28,458.28\n						a 40,40,0,0,1,-56.56,0\n						l -140,-140\n					Z"
          }
        )
      }
    );
  }
  function ThemeSelector({ currentUserTheme, onListItemClick }) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { "data-testid": "theme-selector", children: [...themes, void 0].map((theme) => {
      const themeName = getThemeName(theme);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          "data-testid": `theme-item-${themeName.toLowerCase()}`,
          onClick: () => {
            onListItemClick(theme);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { theme }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: themeName }),
            currentUserTheme === theme && /* @__PURE__ */ jsxRuntimeExports.jsx(Checked, {})
          ]
        },
        themeName
      );
    }) });
  }
  function App({ float }) {
    const userProvider = require$$0.useMemo(() => new UserProvider(), []);
    const systemProvider = require$$0.useMemo(() => new SystemProvider(), []);
    const [userTheme, setUserTheme] = require$$0.useState(userProvider.get());
    const [systemTheme, setSystemTheme] = require$$0.useState(systemProvider.get());
    const [showList, setShowList] = require$$0.useState(false);
    const theme = userTheme ?? systemTheme;
    require$$0.useEffect(() => {
      document.body.setAttribute("data-theme", theme);
      userProvider.on("change", setUserTheme);
      systemProvider.on("change", setSystemTheme);
      systemProvider.watch();
    }, [theme, userProvider, systemProvider]);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "themeSwitcher",
        "data-testid": "theme-switcher",
        "data-float": float,
        onClick: () => {
          setShowList(!showList);
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { theme }),
          !showList ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(
            ThemeSelector,
            {
              currentUserTheme: userTheme,
              onListItemClick: (theme2) => {
                userProvider.set(theme2);
                setShowList(false);
              }
            }
          )
        ]
      }
    );
  }
  class Element {
    constructor(props) {
      this.props = props;
    }
    render(parentNode) {
      const root = clientExports.createRoot(parentNode);
      root.render(
        /* @__PURE__ */ jsxRuntimeExports.jsx(require$$0.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, { ...this.props }) })
      );
    }
  }
  exports.Element = Element;
  exports.ThemeSwitcher = App;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
}({}, React, ReactDOM);
