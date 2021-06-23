// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type TOptions = {
	onClose?: null | CallableFunction
	onOpen?: null | CallableFunction
	beforeOpen?: null | CallableFunction
	beforeClose?: null | CallableFunction
	stickyFooter?: boolean
	footer?: boolean
	cssClass?: Array<string>
	closeLabel?: string
	closeMethods?: Array<"overlay" | "button" | "escape">
}

type TElements = {
	[elements: string]: HTMLElement | null
}

type TEvents = {
	clickCloseBtn: CallableFunction;
	clickOverlay: CallableFunction;
	resize: CallableFunction;
	keyboardNav: CallableFunction;
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Tremble {

	private isBusy = false;
	private isLoading = false;

	private elements: TElements = {
		preloader: document.querySelector(".tingle-preloader")
	};

	private opts: TOptions;
	private modal: any;
	private _scrollPosition = 0;
	private modalBoxContent: any;
	private modalBoxFooter: any;
	private modalBox: any;
	private modalCloseBtn: HTMLButtonElement | null = null;
	private modalCloseBtnIcon: HTMLSpanElement | null = null;
	private modalCloseBtnLabel: HTMLSpanElement | null = null;
	private _events: Partial<TEvents> = {};

	constructor(opts: TOptions = {}) {
		this.opts = {
			onClose: null,
			onOpen: null,
			beforeOpen: null,
			beforeClose: null,
			stickyFooter: false,
			footer: false,
			cssClass: [],
			closeLabel: "Close",
			closeMethods: ["overlay", "button", "escape"],
			...opts,
		};

		this.init();
	}

	private init = () => {
		if (this.modal) {
			return;
		}

		this._build ();
		this._bindEvents ();

		// insert modal in dom
		document.body.appendChild(this.modal);

		if (this.opts.footer) {
			this.addFooter();
		}

		return this;
	}

	private _loading = (_isLoading: boolean) => {
		this.isLoading = _isLoading;
	}

	private _isLoading = () => {
		return this.isLoading;
	}

	private _busy = (state: any) => {
		this.isBusy = state;
	}

	private _isBusy = () => {
		return this.isBusy;
	}

	public destroy = () => {
		if (this.modal === null) {
			return;
		}

		// restore scrolling
		if (this.isOpen()) {
			this.close(true);
		}

		// unbind all events
		this._unbindEvents.call(this);

		// remove modal from dom
		this.modal.parentNode.removeChild(this.modal);

		this.modal = null;
	}

	public isOpen = () => {
		return !!this.modal.classList.contains("tingle-modal--visible");
	}

	public open = () => {
		if (this._isBusy()) return;
		this._busy(true);

		// Reset loading flag
		this.hidePreloader();

		const self = this;

		// before open callback
		if (typeof self.opts.beforeOpen === "function") {
			self.opts.beforeOpen();
		}

		if (this.modal.style.removeProperty) {
			this.modal.style.removeProperty("display");
		} else {
			this.modal.style.removeAttribute("display");
		}

		// prevent text selection when opening multiple times
		document.getSelection()!.removeAllRanges();

		// prevent double scroll
		this._scrollPosition = window.pageYOffset;
		document.body.classList.add("tingle-enabled");
		document.body.style.top = -this._scrollPosition + "px";

		// sticky footer
		this.setStickyFooter(this.opts.stickyFooter);

		// show modal
		this.modal.classList.add("tingle-modal--visible");

		// onOpen callback
		if (typeof self.opts.onOpen === "function") {
			self.opts.onOpen.call(self);
		}

		self._busy(false);

		// check if modal is bigger than screen height
		this.checkOverflow();

		return this;
	}

	public close = (force = false) => {
		if (this._isBusy()) return;
		this._busy(true);

		//  before close
		if (typeof this.opts.beforeClose === "function") {
			const close = this.opts.beforeClose.call(this);
			if (!close) {
				this._busy(false);
				return;
			}
		}

		document.body.classList.remove("tingle-enabled");
		document.body.style.top = "";
		window.scrollTo({
			top: this._scrollPosition,
			behavior: "auto",
		});

		this.modal.classList.remove("tingle-modal--visible");

		// using similar setup as onOpen
		const self = this;

		self.modal.style.display = "none";

		// onClose callback
		if (typeof self.opts.onClose === "function") {
			self.opts.onClose.call(this);
		}

		// release modal
		self._busy(false);
	}

	public setContent = (content: string | Node) => {
		// check type of content : String or Node
		if (typeof content === "string") {
			this.modalBoxContent.innerHTML = content;
		} else {
			this.modalBoxContent.innerHTML = "";
			this.modalBoxContent.appendChild(content);
		}

		if (this.isOpen()) {
			// check if modal is bigger than screen height
			this.checkOverflow();
		}

		return this;
	}

	public getContent = () => {
		return this.modalBoxContent;
	}

	private addFooter = () => {
		// add footer to modal
		this._buildFooter.call(this);

		return this;
	}

	private setFooterContent = (content: any) => {
		// set footer content
		this.modalBoxFooter.innerHTML = content;

		return this;
	}

	private getFooterContent = () => {
		return this.modalBoxFooter;
	}

	public setStickyFooter = (isSticky: boolean) => {
		// if the modal is smaller than the viewport height, we don't need sticky
		if (!this.isOverflow()) {
			isSticky = false;
		}

		if (isSticky) {
			if (this.modalBox.contains(this.modalBoxFooter)) {
				this.modalBox.removeChild(this.modalBoxFooter);
				this.modal.appendChild(this.modalBoxFooter);
				this.modalBoxFooter.classList.add("tingle-modal-box__footer--sticky");
				this._recalculateFooterPosition.call(this);
			}
			this.modalBoxContent.style["padding-bottom"] = this.modalBoxFooter.clientHeight + 20 + "px";
		} else if (this.modalBoxFooter) {
			if (!this.modalBox.contains(this.modalBoxFooter)) {
				this.modal.removeChild(this.modalBoxFooter);
				this.modalBox.appendChild(this.modalBoxFooter);
				this.modalBoxFooter.style.width = "auto";
				this.modalBoxFooter.style.left = "";
				this.modalBoxContent.style["padding-bottom"] = "";
				this.modalBoxFooter.classList.remove("tingle-modal-box__footer--sticky");
			}
		}

		return this;
	}

	public addFooterBtn = (label: string, cssClass: string, callback: (this: HTMLButtonElement, ev: MouseEvent) => any) => {
		const btn = document.createElement("button");

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

		this.modalBoxFooter.appendChild(btn);

		return btn;
	}

	public resize = function () {
		// eslint-disable-next-line no-console
		console.warn("Resize is deprecated and will be removed in version 1.0");
	}

	private isOverflow = () => {
		const viewportHeight = window.innerHeight;
		const modalHeight = this.modalBox.clientHeight;

		return modalHeight >= viewportHeight;
	}

	private checkOverflow = () => {
		// only if the modal is currently shown
		if (this.modal.classList.contains("tingle-modal--visible")) {
			if (this.isOverflow()) {
				this.modal.classList.add("tingle-modal--overflow");
			} else {
				this.modal.classList.remove("tingle-modal--overflow");
			}

			if (!this.isOverflow() && this.opts.stickyFooter) {
				this.setStickyFooter(false);
			} else if (this.isOverflow() && this.opts.stickyFooter) {
				this._recalculateFooterPosition.call(this);
				this.setStickyFooter(true);
			}
		}
	}

	public showPreloader = () => {
		if (!this._isLoading()) {
			this._loading(true);
			if (this.elements.preloader) {
				this.elements.preloader.classList.add("tingle-preloader--active");
			}
		}
	}

	public hidePreloader = () => {
		this._loading(false);
		if (this.elements.preloader) {
			this.elements.preloader.classList.remove("tingle-preloader--active");
		}
	}

	/* ----------------------------------------------------------- */
	/* == private methods */
	/* ----------------------------------------------------------- */

	private closeIcon() {
		return "<svg viewBox=\"0 0 10 10\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M.3 9.7c.2.2.4.3.7.3.3 0 .5-.1.7-.3L5 6.4l3.3 3.3c.2.2.5.3.7.3.2 0 .5-.1.7-.3.4-.4.4-1 0-1.4L6.4 5l3.3-3.3c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L5 3.6 1.7.3C1.3-.1.7-.1.3.3c-.4.4-.4 1 0 1.4L3.6 5 .3 8.3c-.4.4-.4 1 0 1.4z\" fill=\"#000\" fill-rule=\"nonzero\"/></svg>";
	}

	private _recalculateFooterPosition() {
		if (!this.modalBoxFooter) {
			return;
		}
		this.modalBoxFooter.style.width = this.modalBox.clientWidth + "px";
		this.modalBoxFooter.style.left = this.modalBox.offsetLeft + "px";
	}

	private _build() {
		// wrapper
		this.modal = document.createElement("div");
		this.modal.classList.add("tingle-modal");

		// remove cursor if no overlay close method
		/**
		 * todo
		 */
		if (this.opts.closeMethods!.length === 0 || this.opts.closeMethods!.indexOf("overlay") === -1) {
			this.modal.classList.add("tingle-modal--noOverlayClose");
		}

		this.modal.style.display = "none";

		// custom class
		/**
		 * todo
		 */
		this.opts.cssClass!.forEach((item: any) => {
			if (typeof item === "string") {
				this.modal.classList.add(item);
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
	}

	private _buildFooter() {
		this.modalBoxFooter = document.createElement("div");
		this.modalBoxFooter.classList.add("tingle-modal-box__footer");
		this.modalBox.appendChild(this.modalBoxFooter);
	}

	private _bindEvents() {
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
	}

	private _handleKeyboardNav(event: any) {
		// escape key
		if (this.opts.closeMethods.indexOf("escape") !== -1 && event.which === 27 && this.isOpen()) {
			this.close();
		}
	}

	private _handleClickOutside(event: any) {
		// on macOS, click on scrollbar (hidden mode) will trigger close event so we need to bypass this behavior by detecting scrollbar mode
		const scrollbarWidth = this.modal.offsetWidth - this.modal.clientWidth;
		const clickedOnScrollbar = event.clientX >= this.modal.offsetWidth - 15; // 15px is macOS scrollbar default width
		const isScrollable = this.modal.scrollHeight !== this.modal.offsetHeight;
		if (navigator.platform === "MacIntel" && scrollbarWidth === 0 && clickedOnScrollbar && isScrollable) {
			return;
		}

		// if click is outside the modal
		if (this.opts.closeMethods.indexOf("overlay") !== -1 && !this._findAncestor(event.target, "tingle-modal") &&
			event.clientX < this.modal.clientWidth) {
			this.close();
		}
	}

	private _findAncestor(el: { parentElement: any; classList: { contains: (arg0: any) => any; }; }, cls: string) {
		while ((el = el.parentElement) && !el.classList.contains(cls));
		return el;
	}

	private _unbindEvents() {
		if (this.opts.closeMethods.indexOf("button") !== -1) {
			this.modalCloseBtn.removeEventListener("click", this._events.clickCloseBtn); // todo!
		}
		this.modal.removeEventListener("mousedown", this._events.clickOverlay);
		window.removeEventListener("resize", this._events.resize);
		document.removeEventListener("keydown", this._events.keyboardNav);
	}

	/* ----------------------------------------------------------- */
	/* == return */
	/* ----------------------------------------------------------- */
}
