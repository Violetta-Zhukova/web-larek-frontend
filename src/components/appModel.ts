import { FormErrors, ICustomer, IItem } from '../types';
import { IEvents } from './base/events';

export class CatalogModel {
	protected catalog: IItem[] = [];
	protected item: IItem;
	protected events: IEvents;

	constructor(events: IEvents) {
		this.events = events;
	}

	setCatalog(items: IItem[]) {
		this.catalog = items;
		this.events.emit('catalog:changed');
	}

	getCatalog(): IItem[] {
		return this.catalog;
	}

	setItem(item: IItem) {
		this.item = item;
	}

	getItem(): IItem {
		return this.item;
	}
}

export class BasketModel {
	protected items: IItem[] = [];
	protected events: IEvents;

	constructor(events: IEvents) {
		this.events = events;
	}

	addItem(item: IItem) {
		this.items = [...this.items, item];
		this.events.emit('basket:changed');
	}

	deleteItem(id: string) {
		this.items = this.items.filter((item) => item.id !== id);
		this.events.emit('basket:changed');
	}

	getTotalAmount(): number {
		return this.items.length;
	}

	getTotalCost(): number {
		return this.items.reduce((acc, item) => acc + item.price, 0);
	}

	getBasket(): IItem[] {
		return this.items;
	}

	clearBasket() {
		this.items = [];
		this.events.emit('basket:changed');
	}

	isInBasket(id: string): boolean {
		if (this.items.find((item) => item.id === id)) {
			return true;
		} else return false;
	}
}

export class CustomerModel {
	protected customer: ICustomer = {
		payment: '',
		address: '',
		email: '',
		phone: '',
	};
	protected formErrors: FormErrors = {};
	protected events: IEvents;

	constructor(events: IEvents) {
		this.events = events;
	}

	setOrderData(field: keyof ICustomer, value: string) {
		this.customer[field] = value;
		if (this.validateOrderData()) {
			this.events.emit('order:confirmed');
		}
	}

	setContactsData(field: keyof ICustomer, value: string) {
		this.customer[field] = value;
		if (this.validateContactsData()) {
			this.events.emit('contacts:confirmed');
		}
	}

	getCustomerData(): ICustomer {
		return this.customer;
	}

	clearCustomerData(): void {
		this.customer = {
			payment: '',
			address: '',
			email: '',
			phone: '',
		};
		this.formErrors = {};
	}

	validateOrderData() {
		const errors: typeof this.formErrors = {};

		if (!this.customer.payment) {
			errors.payment = 'Необходимо выбрать способ оплаты';
		}
		if (!this.customer.address) {
			errors.address = 'Необходимо указать адрес';
		}

		this.formErrors = errors;
		this.events.emit('formErrors.order:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateContactsData() {
		const errors: typeof this.formErrors = {};

		if (!this.customer.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.customer.phone) {
			errors.phone = 'Необходимо указать телефон';
		}

		this.formErrors = errors;
		this.events.emit('formErrors.contacts:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
