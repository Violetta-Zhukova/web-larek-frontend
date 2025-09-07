import { ensureAllElements, ensureElement } from '../../utils/utils';
import { Component } from '../base/component';
import { IEvents } from '../base/events';

interface IForm {
	valid: boolean;
	errors: string[];
	titles: string[];
	button: string;
}

export class Form<T> extends Component<IForm> {
	protected _titles: HTMLElement[];
	protected _submitButton: HTMLButtonElement;
	protected _errors: HTMLElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._titles = ensureAllElements<HTMLElement>(
			'.modal__title',
			this.container
		);

		this._submitButton = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
		});

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});
	}

	set titles(value: string[]) {
		this._titles.forEach((title, index) => {
			this.setText(title, value[index]);
		});
	}

	set button(value: string) {
		this.setText(this._submitButton, value);
	}

	set valid(value: boolean) {
		this._submitButton.disabled = !value;
	}

	set errors(value: string) {
		this.setText(this._errors, value);
	}

	protected onInputChange(field: keyof T, value: string) {
		this.events.emit(`${this.container.name}.${String(field)}:change`, {
			field,
			value,
		});
	}

	render(data: Partial<T> & IForm) {
		const { titles, button, valid, errors, ...inputs } = data;
		super.render({ titles, button, valid, errors });
		Object.assign(this, inputs);
		return this.container;
	}
}

export interface IFormOrder {
	paymentButtons: string[];
	address: string;
	payment: 'card' | 'cash';
}

export class FormOrder extends Form<IFormOrder> {
	protected _paymentButtons: HTMLButtonElement[];
	protected _selectedPayment: string | null = null;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._paymentButtons = ensureAllElements<HTMLButtonElement>(
			'button[type=button]',
			this.container
		);

		this._paymentButtons.forEach((btn) => {
			btn.addEventListener('click', () => {
				this.events.emit(`${this.container.name}.${btn.name}:selected`);
			});
		});
	}

	set paymentButtons(value: string[]) {
		this._paymentButtons.forEach((title, index) => {
			this.setText(title, value[index]);
		});
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	set payment(value: 'card' | 'cash') {
		this._selectedPayment = value;

		this._paymentButtons.forEach((btn) => {
			this.toggleClass(btn, 'button_alt-active', btn.name === value);
		});
	}
}

export interface IFormContact {
	email: string;
	phone: string;
}

export class FormContact extends Form<IFormContact> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}
}
