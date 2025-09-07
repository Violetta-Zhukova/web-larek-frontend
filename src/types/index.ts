export interface IItem {
	id: string;
	title: string;
	image: string;
	category: string;
	price: number | null;
	description: string;
}

export interface ICustomer {
	payment: string;
	address: string;
	email: string;
	phone: string;
}

export type FormErrors = Partial<Record<keyof ICustomer, string>>;

export type IOrder = ICustomer & { total: number; items: string[] };

export type IOrderSuccess = { id: string; total: number };
