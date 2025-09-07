import { IItem } from '../../types';
import { CDN_URL } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/component';

export const categoryColor: Record<string, string> = {
	'софт-скил': 'card__category_soft',
	другое: 'card__category_other',
	дополнительное: 'card__category_additional',
	кнопка: 'card__category_button',
	'хард-скил': 'card__category_hard',
};

type categoryKey = keyof typeof categoryColor;

export class Card<T> extends Component<IItem> {
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _category?: HTMLElement;
	protected _description?: HTMLElement;
	protected _id: string;

	constructor(container: HTMLElement) {
		super(container);

		this._title = ensureElement<HTMLElement>('.card__title', this.container);
		this._price = ensureElement<HTMLElement>('.card__price', this.container);
		this._image = container.querySelector('.card__image');
		this._category = container.querySelector('.card__category');
		this._description = container.querySelector('.card__text');
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set price(value: number | null) {
		if (value === null) {
			this.setText(this._price, 'Бесценно');
		} else {
			this.setText(this._price, `${value} синапсов`);
		}
	}

	get price(): number | null {
		const text = this._price.textContent;
		return text === 'Бесценно' ? null : parseInt(text);
	}

	set image(value: string) {
		this.setImage(this._image, CDN_URL + value, this.title);
	}

	set category(value: string) {
		this.setText(this._category, value);

		if (this._category) {
			for (const key in categoryColor) {
				this._category.classList.toggle(
					categoryColor[key as categoryKey],
					key === value
				);
			}
		}
	}

	set description(value: string) {
		this.setText(this._description, value);
	}

	set id(value: string) {
		this._id = value;
	}

	get id(): string {
		return this._id;
	}

	render(data: Partial<T> & Partial<IItem>) {
		const { title, price, ...other } = data;
		super.render({ title, price });
		Object.assign(this, other);
		return this.container;
	}
}

interface ICardActions {
	onCardClick?: (event: MouseEvent) => void;
	onButtonClick?: (event: MouseEvent) => void;
	onDeleteClick?: (event: MouseEvent) => void;
}

type ICardCatalog = Pick<IItem, 'title' | 'price' | 'image' | 'category'>;

export class CardCatalog extends Card<ICardCatalog> {
	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		if (actions?.onCardClick) {
			this.container.addEventListener('click', actions.onCardClick);
		}
	}
}

type ICardPreview = IItem & { buttonText: boolean };

export class CardPreview extends Card<ICardPreview> {
	protected _purchaseButton: HTMLButtonElement;
	protected _isInBasket: boolean = false;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._purchaseButton = ensureElement<HTMLButtonElement>(
			'.card__button',
			this.container
		);

		if (actions?.onButtonClick) {
			this._purchaseButton.addEventListener('click', actions.onButtonClick);
		}
	}

	set buttonText(value: boolean) {
		if (this.price === null) {
			this.setText(this._purchaseButton, 'Недоступно');
			this.setDisabled(this._purchaseButton, true);
		} else {
			this.setDisabled(this._purchaseButton, false);
			this.setText(
				this._purchaseButton,
				value ? 'Удалить из корзины' : 'Купить'
			);
		}
	}
}

type ICardBasket = Pick<IItem, 'title' | 'price'> & { index: number };

export class CardBasket extends Card<ICardBasket> {
	protected _index: HTMLElement;
	protected _deleteButton: HTMLButtonElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._index = ensureElement<HTMLElement>(
			'.basket__item-index',
			this.container
		);
		this._deleteButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			this.container
		);

		if (actions?.onDeleteClick) {
			this._deleteButton.addEventListener('click', actions.onDeleteClick);
		}
	}

	set index(value: number) {
		this.setText(this._index, value);
	}
}
