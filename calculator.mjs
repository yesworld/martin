import { calculateOrder, money } from './pricing.mjs?v=b47e57fc8597';

const host = document.getElementById('calculator');
if (host) initialize().catch(() => {
  host.hidden = false;
  host.innerHTML = '<div class="notice">Не удалось загрузить данные калькулятора. Откройте прайс через меню или позвоните Мартину, чтобы рассчитать заказ.</div>';
});

async function initialize() {
  const response = await fetch(new URL('./calculator-data.json?v=b47e57fc8597', import.meta.url));
  if (!response.ok) throw new Error('Calculator data unavailable');
  const { prices, discount, services, contacts } = await response.json();
  const items = [];
  let nextId = 0;
  const materialLabels = { synthetic: 'Синтетическая ткань', natural: 'Натуральная / смесовая ткань', leather: 'Кожа', coconut: 'С кокосовой койрой', premium: 'Премиальный — стоимость уточняется', unknown: 'Состав неизвестен' };
  const variantLabels = { standard: 'Обычное кресло', bed: 'Кресло-кровать', office: 'Офисное', executive: 'Кресло руководителя', seat: 'Без мягкой спинки', back1: 'Мягкая спинка — одна сторона', back2: 'Мягкая спинка — две стороны' };
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const itemHost = document.getElementById('order-items');
  const choice = document.getElementById('service-choice');
  const orderText = document.getElementById('order-text');
  const feedback = document.getElementById('copy-feedback');
  const field = (item, key, label, content) => `<div class="form-field"><label for="item-${item.id}-${key}">${label}</label>${content}</div>`;
  const select = (item, key, label, options) => field(item, key, label, `<select id="item-${item.id}-${key}" data-field="${key}">${options.map(([value, text]) => `<option value="${value}"${String(item[key]) === value ? ' selected' : ''}>${escape(text)}</option>`).join('')}</select>`);
  const number = (item, key, label, { min = 1, max = 10000, step = 1 } = {}) => field(item, key, label, `<input id="item-${item.id}-${key}" data-field="${key}" type="number" min="${min}" max="${max}" step="${step}" value="${item[key]}" inputmode="${step === 1 ? 'numeric' : 'decimal'}" required>`);
  const check = (item, key, label) => `<label class="checkbox-field"><input type="checkbox" data-field="${key}"${item[key] ? ' checked' : ''}>${label}</label>`;

  function renderCard(item) {
    const isFurniture = ['sofa', 'chair', 'stool'].includes(item.service);
    const isMattress = item.service === 'mattress';
    const materialKeys = isMattress ? ['synthetic', 'coconut', 'natural', 'premium', 'unknown'] : ['synthetic', 'natural', 'leather', 'unknown'];
    let fields = '';
    if (isFurniture || isMattress) fields += select(item, 'material', isMattress ? 'Чехол / особенность матраса' : 'Материал обивки', materialKeys.map(key => [key, materialLabels[key]]));
    if (item.service === 'sofa') {
      fields += select(item, 'shape', 'Конфигурация', [['straight', 'Прямой'], ['corner', 'Угловой']]);
      fields += number(item, 'width', 'Ширина с подлокотниками, см');
      fields += select(item, 'sleeping', 'Чистка спального места', [['none', 'Не требуется'], ...prices.mechanisms.map(mechanism => [mechanism.id, mechanism.label]), ['unknown', 'Другой / неизвестный механизм — уточнить']]);
    }
    if (item.service === 'chair') {
      fields += select(item, 'variant', 'Тип кресла', ['standard', 'bed', 'office', 'executive'].map(key => [key, variantLabels[key]]));
      fields += `<div data-standard-width>${number(item, 'width', 'Ширина кресла, см')}</div>`;
    }
    if (item.service === 'stool') fields += select(item, 'variant', 'Тип стула', ['seat', 'back1', 'back2', 'office'].map(key => [key, variantLabels[key]]));
    if (isMattress) {
      fields += number(item, 'width', 'Точная ширина матраса, см');
      fields += select(item, 'sides', 'Количество сторон', [['1', 'Одна сторона'], ['2', 'Две стороны']]);
      fields += `<div class="full-width" data-sides-confirmation>${check(item, 'sameSides', 'Для обеих сторон применим один тариф: одинаковый материал и особенности')}</div>`;
    }
    if (['sofa', 'chair'].includes(item.service)) {
      fields += number(item, 'pillows', 'Съёмные подушки, шт. на изделие', { min: 0, max: 99 });
      fields += `<div data-pillow-width>${number(item, 'pillowWidth', 'Ширина подушки, см')}</div>`;
    }
    if (isFurniture || isMattress) fields += select(item, 'odor', 'Дополнительная обработка от запаха', [['none', 'Не требуется'], ...prices.extras.filter(extra => extra.services.includes(item.service)).map(extra => [extra.id, extra.label])]);
    if (['rug', 'carpet'].includes(item.service)) {
      fields += number(item, 'length', 'Длина, м', { min: 0.1, max: 1000, step: 0.1 });
      fields += number(item, 'widthMetres', 'Ширина, м', { min: 0.1, max: 1000, step: 0.1 });
      fields += `<p class="form-hint full-width" data-area></p>`;
    }
    const card = document.createElement('article');
    card.className = 'order-item';
    card.dataset.id = item.id;
    card.innerHTML = `<div class="order-item-heading"><h2>${services.find(service => service.id === item.service).short}</h2><button class="remove-item" type="button" data-remove aria-label="Удалить позицию: ${services.find(service => service.id === item.service).short}">Удалить ×</button></div><div class="item-fields">${fields}</div><p class="form-error" data-error hidden>Проверьте параметры: нужны значения в указанных пределах.</p><div class="order-item-bottom"><div class="quantity-control"><button type="button" data-quantity="-1" aria-label="Уменьшить количество">−</button><label class="visually-hidden" for="item-${item.id}-quantity">Количество изделий</label><input id="item-${item.id}-quantity" type="number" data-field="quantity" min="1" max="99" step="1" value="1" inputmode="numeric" required><button type="button" data-quantity="1" aria-label="Увеличить количество">+</button><span>шт.</span></div><div class="item-result"><strong data-item-total></strong><span data-item-notes></span></div></div>`;
    return card;
  }

  function syncFields(item) {
    const card = itemHost.querySelector(`[data-id="${item.id}"]`);
    const show = (selector, visible) => {
      const group = card.querySelector(selector);
      if (!group) return;
      group.hidden = !visible;
      group.querySelectorAll('input,select,textarea').forEach(input => input.disabled = !visible);
    };
    show('[data-standard-width]', item.variant === 'standard');
    show('[data-pillow-width]', item.pillows > 0);
    show('[data-sides-confirmation]', item.sides === 2);
    const area = card.querySelector('[data-area]');
    if (area) area.textContent = `Площадь: ${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(item.length * item.widthMetres)} м². Стоимость уточняется; опубликованного тарифа для расчёта пока нет.`;
    item.invalid = [...card.querySelectorAll('input,select,textarea')].some(input => !input.disabled && !input.checkValidity());
    card.querySelector('[data-error]').hidden = !item.invalid;
    card.querySelector('[data-quantity="-1"]').disabled = item.quantity <= 1;
    card.querySelector('[data-quantity="1"]').disabled = item.quantity >= 99;
  }

  function addItem(service) {
    itemHost.querySelector('.empty-order')?.remove();
    const item = { id: String(++nextId), service, material: 'synthetic', shape: 'straight', width: service === 'mattress' ? 140 : service === 'chair' ? 75 : 140, quantity: 1, sleeping: 'none', pillows: 0, pillowWidth: 50, sides: 1, sameSides: false, variant: service === 'stool' ? 'seat' : 'standard', odor: 'none', length: 2, widthMetres: 3 };
    items.push(item);
    itemHost.append(renderCard(item));
    update();
    return item;
  }
  document.getElementById('add-item').addEventListener('click', () => {
    const item = addItem(choice.value);
    const card = itemHost.querySelector(`[data-id="${item.id}"]`);
    const first = card.querySelector('select,input');
    first?.focus({ preventScroll: true });
    card.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  itemHost.addEventListener('click', event => {
    const card = event.target.closest('[data-id]');
    if (!card) return;
    const item = items.find(item => item.id === card.dataset.id);
    if (event.target.closest('[data-remove]')) {
      const position = items.indexOf(item);
      items.splice(position, 1);
      card.remove();
      update();
      (itemHost.querySelector('input,select') || choice).focus({ preventScroll: true });
    }
    const quantityButton = event.target.closest('[data-quantity]');
    if (quantityButton) {
      item.quantity = Math.max(1, Math.min(99, (Number(item.quantity) || 1) + Number(quantityButton.dataset.quantity)));
      card.querySelector('[data-field="quantity"]').value = item.quantity;
      update();
    }
  });
  itemHost.addEventListener('input', event => {
    const input = event.target.closest('[data-field]');
    if (!input) return;
    const item = items.find(item => item.id === input.closest('[data-id]').dataset.id);
    item[input.dataset.field] = input.type === 'checkbox' ? input.checked : (input.type === 'number' || input.dataset.field === 'sides') ? (input.value === '' ? NaN : Number(input.value)) : input.value;
    update();
  });
  document.getElementById('distance').addEventListener('input', update);

  function description(item) {
    const details = [];
    if (['sofa', 'chair', 'stool', 'mattress'].includes(item.service)) details.push(materialLabels[item.material]);
    if (item.service === 'sofa') {
      details.push(item.shape === 'straight' ? 'прямой' : 'угловой', `ширина ${item.width} см с подлокотниками`);
      if (item.sleeping !== 'none') details.push('спальное место: ' + (prices.mechanisms.find(group => group.id === item.sleeping)?.label || 'механизм уточняется'));
    }
    if (item.service === 'chair') details.push(variantLabels[item.variant], ...(item.variant === 'standard' ? [`ширина ${item.width} см`] : []));
    if (item.service === 'stool') details.push(variantLabels[item.variant]);
    if (item.service === 'mattress') details.push(`ширина ${item.width} см`, `${item.sides} сторон(а)`, ...(item.sides === 2 ? [item.sameSides ? 'один тариф применим к обеим сторонам' : 'вторая сторона требует уточнения'] : []));
    if (item.pillows > 0 && ['sofa', 'chair'].includes(item.service)) details.push(`подушки: ${item.pillows} шт. по ${item.pillowWidth} см на изделие`);
    if (item.odor !== 'none') details.push(prices.extras.find(extra => extra.id === item.odor)?.label || 'обработка от запаха');
    if (['rug', 'carpet'].includes(item.service)) details.push(`${item.length} × ${item.widthMetres} м`, `площадь ${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(item.length * item.widthMetres)} м²`);
    if (item.invalid) details.push('параметры требуют проверки');
    return details.join('; ');
  }

  function update() {
    feedback.textContent = '';
    for (const item of items) syncFields(item);
    if (!items.length && !itemHost.querySelector('.empty-order')) itemHost.innerHTML = '<p class="empty-order">В заказе пока нет изделий. Выберите услугу и нажмите «Добавить».</p>';
    const distanceInput = document.getElementById('distance');
    const distance = distanceInput.value !== '' && distanceInput.checkValidity() ? Number(distanceInput.value) : NaN;
    const order = calculateOrder(items, distance, prices, discount);
    const text = ['Здравствуйте, Мартин! Хочу обсудить химчистку.'];
    items.forEach((item, index) => {
      const line = order.lines[index];
      const price = line.uncertain ? (line.known ? 'от ' + money(line.known) + '; часть стоимости уточняется' : 'Стоимость уточняется') : money(line.known);
      const card = itemHost.querySelector(`[data-id="${item.id}"]`);
      card.querySelector('[data-item-total]').textContent = price;
      card.querySelector('[data-item-notes]').textContent = line.notes.join(' ');
      text.push(`${index + 1}. ${services.find(service => service.id === item.service).short} — ${item.quantity} шт.; ${description(item)}. ${price}.`);
    });
    document.getElementById('summary-lines').innerHTML = `<div><dt>${order.uncertain ? 'Известная стоимость работ' : 'Стоимость работ'}</dt><dd>${money(order.subtotal)}</dd></div><div><dt>Минимальная сумма работ</dt><dd>${money(order.minimum)}</dd></div>${order.minimumTopUp ? `<div><dt>До минимального заказа</dt><dd>+ ${money(order.minimumTopUp)}</dd></div>` : ''}<div><dt>Выезд</dt><dd>${order.distanceKnown ? money(order.trip) : 'Уточняется'}</dd></div>`;
    document.getElementById('summary-total').textContent = !items.length ? 'Добавьте изделие' : (order.uncertain ? 'от ' : '') + money(order.total);
    document.getElementById('summary-status').textContent = !items.length ? '' : order.uncertain ? 'Нижняя граница. Часть стоимости требует уточнения.' : 'Предварительный расчёт по выбранным параметрам';
    if (items.length) {
      text.push(`Расстояние от МКАД в одну сторону: ${order.distanceKnown ? distance + ' км' : 'уточняется'}.`, `Известная стоимость работ: ${money(order.subtotal)}.`, `Минимальная сумма работ: ${money(order.minimum)}.`, `Выезд: ${order.distanceKnown ? money(order.trip) : 'уточняется'}.`, `Предварительная стоимость: ${order.uncertain ? 'от ' : ''}${money(order.total)}.${order.uncertain ? ' Часть стоимости не определена и требует уточнения.' : ''}`, 'Окончательная стоимость согласуется до начала работ.');
    } else text.push('Состав заказа пока не выбран.');
    orderText.value = text.join('\n');
    document.getElementById('copy-order').disabled = !items.length;
    const messengerHost = document.getElementById('messenger-actions');
    messengerHost.innerHTML = '';
    contacts.messengers.forEach(messenger => {
      const anchor = document.createElement('a');
      const target = new URL(messenger.url);
      if (messenger.textParameter) target.searchParams.set(messenger.textParameter, orderText.value);
      anchor.href = target.href;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.className = 'button button-secondary';
      anchor.textContent = 'Написать в ' + messenger.name;
      messengerHost.append(anchor);
    });
  }
  document.getElementById('copy-order').addEventListener('click', async () => {
    let timeout;
    try {
      await Promise.race([
        navigator.clipboard.writeText(orderText.value),
        new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Clipboard unavailable')), 2000); }),
      ]);
      feedback.textContent = 'Расчёт скопирован. Теперь его можно самостоятельно отправить.';
    } catch {
      orderText.focus();
      orderText.select();
      feedback.textContent = 'Текст выделен. Скопируйте его сочетанием Ctrl+C или ⌘C.';
    } finally {
      clearTimeout(timeout);
    }
  });
  const requestedService = new URLSearchParams(location.search).get('service');
  choice.value = services.some(service => service.id === requestedService) ? requestedService : 'sofa';
  addItem(choice.value);
  host.hidden = false;
}
