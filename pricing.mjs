export function discountedKopecks(baseRubles, discountPercent) {
  if (baseRubles === null) return null;
  return Math.round(baseRubles * 100 * (100 - discountPercent) / 100);
}

export function money(kopecks) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: kopecks % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(kopecks / 100) + ' ₽';
}

export function tariffPrice(row, discountPercent) {
  if (!row || row.baseRubles === null) return 'Стоимость уточняется';
  const values = (Array.isArray(row.baseRubles) ? row.baseRubles : [row.baseRubles]);
  return (row.from ? 'от ' : '') + values.map(value => money(discountedKopecks(value, discountPercent))).join(' / ');
}

export function tripCost(distance, rules) {
  return Math.round(Math.max(0, distance - rules.freeKm) * rules.rublesPerKm * 100);
}

export function calculateItem(item, data, discountPercent) {
  if (item.invalid) return { known: 0, uncertain: true, notes: ['Проверьте заполненные параметры.'] };
  const rows = data.groups.flatMap(group => group.rows);
  let known = 0;
  let uncertain = false;
  const notes = [];
  const add = (row, count = 1, priceIndex = null) => {
    if (!row || row.baseRubles === null) { uncertain = true; return; }
    const base = Array.isArray(row.baseRubles) ? row.baseRubles[priceIndex] : row.baseRubles;
    if (!Number.isFinite(base)) { uncertain = true; return; }
    known += discountedKopecks(base, discountPercent) * count;
    if (row.from) uncertain = true;
  };
  const matches = rows.filter(row => row.service === item.service && row.material === item.material && !row.referenceOnly);
  if (item.service === 'sofa') {
    add(matches.find(row => row.variant === item.shape && item.width >= row.min && item.width <= row.max));
    if (item.sleeping !== 'none') {
      const mechanism = data.mechanisms.find(group => group.id === item.sleeping);
      add(matches.find(row => row.variant === 'sleeping'), 1, mechanism?.priceIndex ?? null);
      if (!mechanism) uncertain = true;
    }
  } else if (item.service === 'mattress') {
    const row = matches.find(row => item.width >= row.min && item.width <= row.max);
    add(row, item.sides);
    if (item.sides === 2 && !item.sameSides) {
      uncertain = true;
      // The second side has no confirmed matching tariff yet.
      known = row ? discountedKopecks(row.baseRubles, discountPercent) : 0;
      notes.push('Материал второй стороны нужно уточнить; учтена только первая сторона.');
    }
  } else if (item.service === 'chair' || item.service === 'stool') {
    const row = matches.find(row => row.variant === item.variant && (row.min == null || (item.width >= row.min && item.width <= row.max)));
    add(row);
  } else {
    uncertain = true;
  }
  if (['sofa', 'chair'].includes(item.service) && item.pillows > 0) {
    add(rows.find(row => row.variant === 'pillow' && row.material === item.material && item.pillowWidth >= row.min && item.pillowWidth <= row.max), item.pillows);
  }
  if (item.odor !== 'none') {
    const extra = data.extras.find(row => row.id === item.odor);
    if (extra && extra.services.includes(item.service)) add(extra, item.service === 'mattress' ? item.sides : 1);
    else uncertain = true;
  }
  const quantity = Math.max(1, Math.min(99, Math.trunc(Number(item.quantity) || 1)));
  return { known: known * quantity, uncertain, notes };
}

export function calculateOrder(items, distance, data, discountPercent) {
  const lines = items.map(item => calculateItem(item, data, discountPercent));
  const subtotal = lines.reduce((sum, line) => sum + line.known, 0);
  const distanceKnown = Number.isFinite(distance) && distance >= 0;
  const minimum = items.length ? discountedKopecks(data.minimum.baseRubles, discountPercent) : 0;
  const trip = distanceKnown && items.length ? tripCost(distance, data.travel) : 0;
  return {
    lines, subtotal, minimum, trip,
    minimumTopUp: items.length ? Math.max(0, minimum - subtotal) : 0,
    total: items.length ? Math.max(subtotal, minimum) + trip : 0,
    uncertain: lines.some(line => line.uncertain) || !distanceKnown,
    distanceKnown,
  };
}
