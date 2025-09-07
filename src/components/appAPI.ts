import { IItem, IOrder, IOrderSuccess } from '../types';
import { Api, ApiListResponse } from './base/api';

interface IAppAPI {
	getItemsList: () => Promise<IItem[]>;
	getItem: (id: string) => Promise<IItem>;
	placeOrder(order: IOrder): Promise<IOrderSuccess>;
}

export class AppAPI extends Api implements IAppAPI {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getItemsList(): Promise<IItem[]> {
		return this.get('/product').then(
			(data: ApiListResponse<IItem>) => data.items
		);
	}

	getItem(id: string): Promise<IItem> {
		return this.get(`/product/${id}`).then((item: IItem) => item);
	}

	placeOrder(order: IOrder): Promise<IOrderSuccess> {
		return this.post('/order', order).then((res: IOrderSuccess) => res);
	}
}
