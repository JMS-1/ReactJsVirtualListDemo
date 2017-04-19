var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define("list/component", ["require", "exports", "react"], function (require, exports, React) {
    "use strict";
    class List extends React.PureComponent {
        render() {
            const children = React.Children.toArray(this.props.children) || [];
            const start = this.props.relStart * children.length;
            const count = this.state ? this.state.count : 0;
            return React.createElement("div", { ref: e => this._outer = e }, children.slice(start, start + count));
        }
        componentDidMount() {
            const size = this._outer.clientHeight;
            const count = Math.ceil(size / (this.props.itemHeight + 40));
            const stateCount = this.state ? this.state.count : 0;
            if (count !== stateCount)
                this.setState({ count });
        }
    }
    class Scroll extends React.PureComponent {
        constructor() {
            super(...arguments);
            this.onClick = (ev) => {
                ev.preventDefault();
                const y = ev.pageY - ev.currentTarget.offsetTop;
                if (y < 0)
                    return;
                const h = ev.currentTarget.clientHeight;
                if (y > h)
                    return;
                this.props.moveTo(y / h);
            };
        }
        render() {
            return React.createElement("div", { onClick: this.onClick }, "\u00A0");
        }
    }
    class default_1 extends React.PureComponent {
        constructor() {
            super(...arguments);
            this.moveTo = (relStart) => {
                if (!this.state || (relStart != this.state.relStart))
                    this.setState({ relStart });
            };
        }
        render() {
            return React.createElement("div", { className: 'list' },
                React.createElement(List, __assign({}, this.props, { relStart: this.state ? this.state.relStart : 0 })),
                React.createElement(Scroll, { moveTo: this.moveTo }));
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
});
define("list/index", ["require", "exports", "list/component"], function (require, exports, component_1) {
    "use strict";
    exports.List = component_1.default;
});
define("app", ["require", "exports", "react", "react-dom", "list/index"], function (require, exports, React, react_dom_1, list_1) {
    "use strict";
    const names = [];
    for (let i = 0; i++ < 10000;)
        names.push(`Item ${i}`);
    const height = 50;
    class Root extends React.PureComponent {
        render() {
            return React.createElement(list_1.List, { itemHeight: height }, names.map(name => React.createElement("div", { key: name, style: { height: `${height}px` } },
                name,
                React.createElement("img", { src: "http://jochen.jochen-manns.de/wp-content/uploads/2016/08/Dashboard.png", height: 30 }))));
        }
    }
    react_dom_1.render(React.createElement(Root, null), document.querySelector('em-root'));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = undefined;
});
//# sourceMappingURL=index.js.map