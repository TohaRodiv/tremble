var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var Tremble = /** @class */ (function () {
    function Tremble(opts) {
        var _this = this;
        if (opts === void 0) { opts = {}; }
        this.isBusy = false;
        this.isLoading = false;
        this.elements = {
            preloader: document.querySelector(".tingle-preloader")
        };
        this._scrollPosition = 0;
        this.modalCloseBtn = null;
        this.modalCloseBtnIcon = null;
        this.modalCloseBtnLabel = null;
        this._events = {};
        this.init = function () {
            if (_this.modal) {
                return;
            }
            _this._build();
            _this._bindEvents();
            // insert modal in dom
            document.body.appendChild(_this.modal);
            if (_this.opts.footer) {
                _this.addFooter();
            }
            return _this;
        };
        this._loading = function (_isLoading) {
            _this.isLoading = _isLoading;
        };
        this._isLoading = function () {
            return _this.isLoading;
        };
        this._busy = function (state) {
            _this.isBusy = state;
        };
        this._isBusy = function () {
            return _this.isBusy;
        };
        this.destroy = function () {
            if (_this.modal === null) {
                return;
            }
            // restore scrolling
            if (_this.isOpen()) {
                _this.close(true);
            }
            // unbind all events
            _this._unbindEvents.call(_this);
            // remove modal from dom
            _this.modal.parentNode.removeChild(_this.modal);
            _this.modal = null;
        };
        this.isOpen = function () {
            return !!_this.modal.classList.contains("tingle-modal--visible");
        };
        this.open = function () {
            if (_this._isBusy())
                return;
            _this._busy(true);
            // Reset loading flag
            _this.hidePreloader();
            var self = _this;
            // before open callback
            if (typeof self.opts.beforeOpen === "function") {
                self.opts.beforeOpen();
            }
            if (_this.modal.style.removeProperty) {
                _this.modal.style.removeProperty("display");
            }
            else {
                _this.modal.style.removeAttribute("display");
            }
            // prevent text selection when opening multiple times
            document.getSelection().removeAllRanges();
            // prevent double scroll
            _this._scrollPosition = window.pageYOffset;
            document.body.classList.add("tingle-enabled");
            document.body.style.top = -_this._scrollPosition + "px";
            // sticky footer
            _this.setStickyFooter(_this.opts.stickyFooter);
            // show modal
            _this.modal.classList.add("tingle-modal--visible");
            // onOpen callback
            if (typeof self.opts.onOpen === "function") {
                self.opts.onOpen.call(self);
            }
            self._busy(false);
            // check if modal is bigger than screen height
            _this.checkOverflow();
            return _this;
        };
        this.close = function (force) {
            if (force === void 0) { force = false; }
            if (_this._isBusy())
                return;
            _this._busy(true);
            //  before close
            if (typeof _this.opts.beforeClose === "function") {
                var close_1 = _this.opts.beforeClose.call(_this);
                if (!close_1) {
                    _this._busy(false);
                    return;
                }
            }
            document.body.classList.remove("tingle-enabled");
            document.body.style.top = "";
            window.scrollTo({
                top: _this._scrollPosition,
                behavior: "auto"
            });
            _this.modal.classList.remove("tingle-modal--visible");
            // using similar setup as onOpen
            var self = _this;
            self.modal.style.display = "none";
            // onClose callback
            if (typeof self.opts.onClose === "function") {
                self.opts.onClose.call(_this);
            }
            // release modal
            self._busy(false);
        };
        this.setContent = function (content) {
            // check type of content : String or Node
            if (typeof content === "string") {
                _this.modalBoxContent.innerHTML = content;
            }
            else {
                _this.modalBoxContent.innerHTML = "";
                _this.modalBoxContent.appendChild(content);
            }
            if (_this.isOpen()) {
                // check if modal is bigger than screen height
                _this.checkOverflow();
            }
            return _this;
        };
        this.getContent = function () {
            return _this.modalBoxContent;
        };
        this.addFooter = function () {
            // add footer to modal
            _this._buildFooter.call(_this);
            return _this;
        };
        this.setFooterContent = function (content) {
            // set footer content
            _this.modalBoxFooter.innerHTML = content;
            return _this;
        };
        this.getFooterContent = function () {
            return _this.modalBoxFooter;
        };
        this.setStickyFooter = function (isSticky) {
            // if the modal is smaller than the viewport height, we don't need sticky
            if (!_this.isOverflow()) {
                isSticky = false;
            }
            if (isSticky) {
                if (_this.modalBox.contains(_this.modalBoxFooter)) {
                    _this.modalBox.removeChild(_this.modalBoxFooter);
                    _this.modal.appendChild(_this.modalBoxFooter);
                    _this.modalBoxFooter.classList.add("tingle-modal-box__footer--sticky");
                    _this._recalculateFooterPosition.call(_this);
                }
                _this.modalBoxContent.style["padding-bottom"] = _this.modalBoxFooter.clientHeight + 20 + "px";
            }
            else if (_this.modalBoxFooter) {
                if (!_this.modalBox.contains(_this.modalBoxFooter)) {
                    _this.modal.removeChild(_this.modalBoxFooter);
                    _this.modalBox.appendChild(_this.modalBoxFooter);
                    _this.modalBoxFooter.style.width = "auto";
                    _this.modalBoxFooter.style.left = "";
                    _this.modalBoxContent.style["padding-bottom"] = "";
                    _this.modalBoxFooter.classList.remove("tingle-modal-box__footer--sticky");
                }
            }
            return _this;
        };
        this.addFooterBtn = function (label, cssClass, callback) {
            var btn = document.createElement("button");
            // set label
            btn.innerHTML = label;
            // bind callback
            btn.addEventListener("click", callback);
            if (typeof cssClass === "string" && cssClass.length) {
                // add classes to btn
                cssClass.split(" ").forEach(function (item) {
                    btn.classList.add(item);
                });
            }
            _this.modalBoxFooter.appendChild(btn);
            return btn;
        };
        this.resize = function () {
            // eslint-disable-next-line no-console
            console.warn("Resize is deprecated and will be removed in version 1.0");
        };
        this.isOverflow = function () {
            var viewportHeight = window.innerHeight;
            var modalHeight = _this.modalBox.clientHeight;
            return modalHeight >= viewportHeight;
        };
        this.checkOverflow = function () {
            // only if the modal is currently shown
            if (_this.modal.classList.contains("tingle-modal--visible")) {
                if (_this.isOverflow()) {
                    _this.modal.classList.add("tingle-modal--overflow");
                }
                else {
                    _this.modal.classList.remove("tingle-modal--overflow");
                }
                if (!_this.isOverflow() && _this.opts.stickyFooter) {
                    _this.setStickyFooter(false);
                }
                else if (_this.isOverflow() && _this.opts.stickyFooter) {
                    _this._recalculateFooterPosition.call(_this);
                    _this.setStickyFooter(true);
                }
            }
        };
        this.showPreloader = function () {
            if (!_this._isLoading()) {
                _this._loading(true);
                if (_this.elements.preloader) {
                    _this.elements.preloader.classList.add("tingle-preloader--active");
                }
            }
        };
        this.hidePreloader = function () {
            _this._loading(false);
            if (_this.elements.preloader) {
                _this.elements.preloader.classList.remove("tingle-preloader--active");
            }
        };
        this.opts = __assign({ onClose: null, onOpen: null, beforeOpen: null, beforeClose: null, stickyFooter: false, footer: false, cssClass: [], closeLabel: "Close", closeMethods: ["overlay", "button", "escape"] }, opts);
        this.init();
    }
    /* ----------------------------------------------------------- */
    /* == private methods */
    /* ----------------------------------------------------------- */
    Tremble.prototype.closeIcon = function () {
        return "<svg viewBox=\"0 0 10 10\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M.3 9.7c.2.2.4.3.7.3.3 0 .5-.1.7-.3L5 6.4l3.3 3.3c.2.2.5.3.7.3.2 0 .5-.1.7-.3.4-.4.4-1 0-1.4L6.4 5l3.3-3.3c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L5 3.6 1.7.3C1.3-.1.7-.1.3.3c-.4.4-.4 1 0 1.4L3.6 5 .3 8.3c-.4.4-.4 1 0 1.4z\" fill=\"#000\" fill-rule=\"nonzero\"/></svg>";
    };
    Tremble.prototype._recalculateFooterPosition = function () {
        if (!this.modalBoxFooter) {
            return;
        }
        this.modalBoxFooter.style.width = this.modalBox.clientWidth + "px";
        this.modalBoxFooter.style.left = this.modalBox.offsetLeft + "px";
    };
    Tremble.prototype._build = function () {
        var _this = this;
        // wrapper
        this.modal = document.createElement("div");
        this.modal.classList.add("tingle-modal");
        // remove cursor if no overlay close method
        /**
         * todo
         */
        if (this.opts.closeMethods.length === 0 || this.opts.closeMethods.indexOf("overlay") === -1) {
            this.modal.classList.add("tingle-modal--noOverlayClose");
        }
        this.modal.style.display = "none";
        // custom class
        /**
         * todo
         */
        this.opts.cssClass.forEach(function (item) {
            if (typeof item === "string") {
                _this.modal.classList.add(item);
            }
        }, this);
        // close btn
        if (this.opts.closeMethods.indexOf("button") !== -1) {
            this.modalCloseBtn = document.createElement("button");
            this.modalCloseBtn.type = "button";
            this.modalCloseBtn.classList.add("tingle-modal__close");
            this.modalCloseBtnIcon = document.createElement("span");
            this.modalCloseBtnIcon.classList.add("tingle-modal__closeIcon");
            this.modalCloseBtnIcon.innerHTML = this.closeIcon();
            this.modalCloseBtnLabel = document.createElement("span");
            this.modalCloseBtnLabel.classList.add("tingle-modal__closeLabel");
            this.modalCloseBtnLabel.innerHTML = this.opts.closeLabel;
            this.modalCloseBtn.appendChild(this.modalCloseBtnIcon);
            this.modalCloseBtn.appendChild(this.modalCloseBtnLabel);
        }
        // modal
        this.modalBox = document.createElement("div");
        this.modalBox.classList.add("tingle-modal-box");
        // modal box content
        this.modalBoxContent = document.createElement("div");
        this.modalBoxContent.classList.add("tingle-modal-box__content");
        this.modalBox.appendChild(this.modalBoxContent);
        if (this.opts.closeMethods.indexOf("button") !== -1) {
            this.modal.appendChild(this.modalCloseBtn);
        }
        this.modal.appendChild(this.modalBox);
    };
    Tremble.prototype._buildFooter = function () {
        this.modalBoxFooter = document.createElement("div");
        this.modalBoxFooter.classList.add("tingle-modal-box__footer");
        this.modalBox.appendChild(this.modalBoxFooter);
    };
    Tremble.prototype._bindEvents = function () {
        this._events = {
            clickCloseBtn: this.close.bind(this),
            clickOverlay: this._handleClickOutside.bind(this),
            resize: this.checkOverflow.bind(this),
            keyboardNav: this._handleKeyboardNav.bind(this)
        };
        if (this.opts.closeMethods.indexOf("button") !== -1) {
            this.modalCloseBtn.addEventListener("click", this._events.clickCloseBtn); // todo!
        }
        this.modal.addEventListener("mousedown", this._events.clickOverlay);
        window.addEventListener("resize", this._events.resize);
        document.addEventListener("keydown", this._events.keyboardNav);
    };
    Tremble.prototype._handleKeyboardNav = function (event) {
        // escape key
        if (this.opts.closeMethods.indexOf("escape") !== -1 && event.which === 27 && this.isOpen()) {
            this.close();
        }
    };
    Tremble.prototype._handleClickOutside = function (event) {
        // on macOS, click on scrollbar (hidden mode) will trigger close event so we need to bypass this behavior by detecting scrollbar mode
        var scrollbarWidth = this.modal.offsetWidth - this.modal.clientWidth;
        var clickedOnScrollbar = event.clientX >= this.modal.offsetWidth - 15; // 15px is macOS scrollbar default width
        var isScrollable = this.modal.scrollHeight !== this.modal.offsetHeight;
        if (navigator.platform === "MacIntel" && scrollbarWidth === 0 && clickedOnScrollbar && isScrollable) {
            return;
        }
        // if click is outside the modal
        if (this.opts.closeMethods.indexOf("overlay") !== -1 && !this._findAncestor(event.target, "tingle-modal") &&
            event.clientX < this.modal.clientWidth) {
            this.close();
        }
    };
    Tremble.prototype._findAncestor = function (el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls))
            ;
        return el;
    };
    Tremble.prototype._unbindEvents = function () {
        if (this.opts.closeMethods.indexOf("button") !== -1) {
            this.modalCloseBtn.removeEventListener("click", this._events.clickCloseBtn); // todo!
        }
        this.modal.removeEventListener("mousedown", this._events.clickOverlay);
        window.removeEventListener("resize", this._events.resize);
        document.removeEventListener("keydown", this._events.keyboardNav);
    };
    return Tremble;
}());
