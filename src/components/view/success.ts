import { ensureElement } from '../../utils/utils';
import { Component } from '../base/component';
import { IEvents } from '../base/events';

interface ISuccessOrder {
	title: string;
	text: number;
	button: string;
}

interface ISuccessActions {
	onClick: () => void;
}

export class SuccessOrder extends Component<ISuccessOrder> {
	protected _title: HTMLElement;
	protected _text: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(container: HTMLElement, actions: ISuccessActions) {
		super(container);

		this._title = ensureElement<HTMLElement>(
			'.order-success__title',
			this.container
		);
		this._text = ensureElement<HTMLElement>(
			'.order-success__description',
			this.container
		);
		this._button = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			this.container
		);

		if (actions?.onClick) {
			this._button.addEventListener('click', actions.onClick);
		}
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set text(value: number) {
		this.setText(this._text, `Списано ${value} синапсов`);
	}

	set button(value: string) {
		this.setText(this._button, value);
	}
}
