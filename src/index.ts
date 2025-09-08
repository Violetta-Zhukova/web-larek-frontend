import { AppAPI } from './components/appAPI';
import {
	BasketModel,
	CatalogModel,
	CustomerModel,
} from './components/appModel';
import { EventEmitter } from './components/base/events';
import { Basket } from './components/view/basket';
import { CardBasket, CardCatalog, CardPreview } from './components/view/card';
import {
	FormContact,
	FormOrder,
	IFormContact,
	IFormOrder,
} from './components/view/form';
import { Modal } from './components/view/modal';
import { Page } from './components/view/page';
import { SuccessOrder } from './components/view/success';
import './scss/styles.scss';
import { ICustomer, IItem } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

const events = new EventEmitter();
const api = new AppAPI(CDN_URL, API_URL);

events.onAll((event) => {
	console.log(event.eventName, event.data);
});

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const catalogData = new CatalogModel(events);
const basketData = new BasketModel(events);
const customerData = new CustomerModel(events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new FormOrder(cloneTemplate(orderTemplate), events);
const contacts = new FormContact(cloneTemplate(contactsTemplate), events);

const cardPreview = new CardPreview(cloneTemplate(cardPreviewTemplate), {
	onButtonClick: () => {
		events.emit('card:buy');
	},
});

const success = new SuccessOrder(cloneTemplate(successTemplate), {
	onClick: () => {
		modal.close();
		events.emit('order.success');
	},
});

// Изменились элементы каталога
events.on('catalog:changed', () => {
	const itemsList = catalogData.getCatalog().map((item) => {
		const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
			onCardClick: () => events.emit('card:select', item),
		});
		return card.render(item);
	});
	page.render({ catalog: itemsList });
});

// Обновить корзину товаров
events.on('basket:changed', () => {
	page.counter = basketData.getTotalAmount();

	const basketItemsList = basketData.getBasket().map((item, indx) => {
		const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
			onDeleteClick: () => events.emit('basket:delete', item),
		});
		return card.render({ ...item, index: indx + 1 });
	});

	basket.render({
		items: basketItemsList,
		totalCost: basketData.getTotalCost(),
	});
});

events.on('basket:open', () => {
	modal.render({
		content: basket.render(),
	});
});

events.on('basket:delete', (item: IItem) => {
	basketData.deleteItem(item.id);
	cardPreview.buttonText = basketData.isInBasket(item.id);
});

// Открыть карточку товара
events.on('card:select', (item: IItem) => {
	modal.render({
		content: cardPreview.render({
			...item,
			buttonText: basketData.isInBasket(item.id),
		}),
	});
	catalogData.setItem(item);
});

// Добавление или удаление товара из корзины
events.on('card:buy', () => {
	if (basketData.isInBasket(cardPreview.id)) {
		basketData.deleteItem(cardPreview.id);
	} else {
		basketData.addItem(catalogData.getItem());
	}
	cardPreview.buttonText = basketData.isInBasket(cardPreview.id);
});

// Переход к странице оформления заказа
events.on('order:open', () => {
	modal.render({
		content: order.render({
			valid: false,
			errors: [],
			titles: ['Способ оплаты', 'Адрес доставки'],
			button: 'Далее',
			paymentButtons: ['Онлайн', 'При получении'],
			address: '',
		}),
	});
});

events.on('order.card:selected', () => {
	order.payment = 'card';
	customerData.setOrderData('payment', 'card');
});

events.on('order.cash:selected', () => {
	order.payment = 'cash';
	customerData.setOrderData('payment', 'cash');
});

events.on(
	'order.address:change',
	(data: { field: keyof IFormOrder; value: string }) => {
		customerData.setOrderData('address', data.value);
	}
);

events.on('formErrors.order:change', (errors: Partial<ICustomer>) => {
	const { payment, address } = errors;
	order.valid = !payment && !address;
	order.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
});

// Переход к странице с контактными данными
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			valid: false,
			errors: [],
			titles: ['Email', 'Телефон'],
			button: 'Оплатить',
			email: '',
			phone: '',
		}),
	});
});

events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IFormContact; value: string }) => {
		customerData.setContactsData(data.field, data.value);
	}
);

events.on('formErrors.contacts:change', (errors: Partial<ICustomer>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ email, phone })
		.filter((i) => !!i)
		.join('; ');
});

// Отправлена форма заказа
events.on('contacts:submit', () => {
	const itemsList = basketData.getBasket().map((item) => {
		return item.id;
	});
	api
		.placeOrder({
			...customerData.getCustomerData(),
			total: basketData.getTotalCost(),
			items: itemsList,
		})
		.then((result) => {
			modal.render({ content: success.render({ text: result.total }) });
			basketData.clearBasket();
			customerData.clearCustomerData();
			events.emit('order.success');
		})
		.catch((err) => {
			console.log(err);
		});
});

// Блокируем прокрутку страницы, если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// Разблокируем прокрутку страницы, если закрыта модалка
events.on('modal:close', () => {
	page.locked = false;
});

// Получить каталог товаров с сервера
api
	.getItemsList()
	.then((itemsList) => {
		catalogData.setCatalog(itemsList);
	})
	.catch((err) => {
		console.log(err);
	});
