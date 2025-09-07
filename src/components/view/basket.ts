import { createElement, ensureElement } from '../../utils/utils';
import { Component } from '../base/component';
import { IEvents } from '../base/events';

interface IBasket {
	basketTitle: string;
	orderButton: string;
	items: HTMLElement[];
	totalCost: number;
}

export class Basket extends Component<IBasket> {
	protected _basketTitle: HTMLElement;
	protected _itemsList: HTMLElement;
	protected _orderButton: HTMLButtonElement;
	protected _totalCost: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._basketTitle = ensureElement<HTMLElement>(
			'.modal__title',
			this.container
		);
		this._itemsList = ensureElement<HTMLElement>(
			'.basket__list',
			this.container
		);
		this._orderButton = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.container
		);
		this._totalCost = ensureElement<HTMLElement>(
			'.basket__price',
			this.container
		);

		this._orderButton.addEventListener('click', () => {
			this.events.emit('order:open');
		});

		this.items = [];
	}

	set basketTitle(value: string) {
		this.setText(this._basketTitle, value);
	}

	set orderButton(value: string) {
		this.setText(this._orderButton, value);
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this._itemsList.replaceChildren(...items);
			this.setDisabled(this._orderButton, false);
		} else {
			this._itemsList.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
					style: 'opacity: 0.3;',
				})
			);
			this.setDisabled(this._orderButton, true);
		}
	}

	set totalCost(value: number) {
		this.setText(this._totalCost, `${value} синапсов`);
	}
}
