import { ensureElement } from '../../utils/utils';
import { Component } from '../base/component';
import { IEvents } from '../base/events';

interface IModal {
	content: HTMLElement;
}

export class Modal extends Component<IModal> {
	protected _content: HTMLElement;
	protected _closeButton: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._content = ensureElement<HTMLElement>(
			'.modal__content',
			this.container
		);
		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			this.container
		);

		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('mousedown', (event) => {
			if (event.target === event.currentTarget) {
				this.close();
			}
		});
		this._content.addEventListener('click', (event) => event.stopPropagation());
		this.handleEscUp = this.handleEscUp.bind(this);
	}

	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	open() {
		this.container.classList.add('modal_active');
		this.events.emit('modal:open');
		document.addEventListener('keyup', this.handleEscUp);
	}

	close() {
		this.container.classList.remove('modal_active');
		this.content = null;
		this.events.emit('modal:close');
		document.removeEventListener('keyup', this.handleEscUp);
	}

	handleEscUp(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			this.close();
		}
	}

	render(data: IModal): HTMLElement {
		super.render(data);
		this.open();
		return this.container;
	}
}
