import { ensureElement } from '../../utils/utils';
import { Component } from '../base/component';
import { IEvents } from '../base/events';

interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

export class Page extends Component<IPage> {
	protected basketButton: HTMLButtonElement;
	protected counterElement: HTMLElement;
	protected catalogElement: HTMLElement;
	protected wrapper: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this.basketButton = ensureElement<HTMLButtonElement>(
			'.header__basket',
			this.container
		);
		this.counterElement = ensureElement<HTMLElement>(
			'.header__basket-counter',
			this.container
		);
		this.catalogElement = ensureElement<HTMLElement>(
			'.gallery',
			this.container
		);
		this.wrapper = ensureElement<HTMLElement>('.page__wrapper', this.container);

		this.basketButton.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}

	set counter(value: number) {
		this.setText(this.counterElement, value);
	}

	set catalog(items: HTMLElement[]) {
		this.catalogElement.replaceChildren(...items);
	}

	set locked(value: boolean) {
		if (value) {
			this.wrapper.classList.add('page__wrapper_locked');
		} else {
			this.wrapper.classList.remove('page__wrapper_locked');
		}
	}
}
