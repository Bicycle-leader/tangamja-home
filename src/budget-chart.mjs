const amountFormat = new Intl.NumberFormat('ko-KR');
const formatAmount = (amount) => `${amountFormat.format(amount)}만원`;
const isAmount = (amount) => Number.isFinite(amount) && amount >= 0;

function parseAmount(value) {
  const normalized = String(value ?? '').replaceAll(',', '').trim();
  return normalized ? Number(normalized) : NaN;
}

function chartScale(amounts) {
  const largest = Math.max(0, ...amounts);
  const approximateStep = Math.max(largest / 4, 1);
  const magnitude = 10 ** Math.floor(Math.log10(approximateStep));
  const step = [1, 2, 2.5, 5, 10].find((factor) => factor * magnitude >= approximateStep) * magnitude;
  const divisions = Math.max(1, Math.ceil(largest / step));

  return {
    maximum: divisions * step,
    ticks: Array.from({ length: divisions + 1 }, (_, index) => index * step),
  };
}

function renderAxis({ ticks }) {
  return `<div class="budget-chart__axis" aria-hidden="true">${ticks.map((tick) => `<span>${amountFormat.format(tick)}</span>`).join('')}</div>`;
}

function renderSwatch(kind) {
  return `<span class="budget-chart__swatch budget-chart__swatch--${kind}" aria-hidden="true"></span>`;
}

function renderTrack(segments, maximum) {
  return `<div class="budget-chart__track" aria-hidden="true">
    ${segments.map(({ kind, amount }) => `<span class="budget-chart__bar budget-chart__bar--${kind}" style="--budget-size: ${amount / maximum * 100}%"></span>`).join('')}
  </div>`;
}

function renderRevenueChart(rows, escape) {
  const types = new Map([['정회원 연회비', 'dues'], ['챌린지 참가비', 'entry'], ['후원', 'sponsor']]);
  const allFunding = rows.map(([label, , amount]) => ({ label, amount: parseAmount(amount), kind: types.get(label) }));
  const baseFunding = allFunding.filter(({ kind }) => kind && kind !== 'sponsor');
  const sponsorship = allFunding.find(({ kind }) => kind === 'sponsor');
  if (!baseFunding.length || !sponsorship || allFunding.some(({ kind, amount }) => !kind || !isAmount(amount))) return '';

  const scenarios = [
    { label: '기본안', segments: baseFunding },
    { label: '후원 확보 시', segments: [...baseFunding, sponsorship] },
  ].map((scenario) => ({ ...scenario, total: scenario.segments.reduce((sum, { amount }) => sum + amount, 0) }));
  const scale = chartScale(scenarios.map(({ total }) => total));

  return `<figure class="budget-chart budget-chart--revenue">
    <figcaption class="budget-chart__caption"><strong>수입 예산 비교</strong><span>단위 만원</span></figcaption>
    <ul class="budget-chart__legend" role="list">
      ${allFunding.map(({ kind, label, amount }) => `<li>${renderSwatch(kind)}<span>${escape(label)}${kind === 'sponsor' ? ' 가정' : ''}</span> <strong>${formatAmount(amount)}</strong></li>`).join('\n')}
    </ul>
    ${renderAxis(scale)}
    <ul class="budget-chart__rows" role="list">
      ${scenarios.map(({ label, segments, total }) => `<li class="budget-chart__row">
        <div class="budget-chart__row-heading"><span>${label}</span><strong>${formatAmount(total)}</strong></div>
        ${renderTrack(segments, scale.maximum)}
      </li>`).join('\n')}
    </ul>
    <p class="budget-chart__note">후원 ${formatAmount(sponsorship.amount)}은 미확보 재원이며, 확보 시 예산에 반영합니다.</p>
  </figure>`;
}

function renderExpenseChart(rows, escape) {
  const categories = rows.filter(([label]) => label !== '합계')
    .map(([label, base, funded]) => ({ label, base: parseAmount(base), funded: parseAmount(funded) }));
  const amounts = categories.flatMap(({ base, funded }) => [base, funded]);
  if (!amounts.length || !amounts.every(isAmount)) return '';

  const scale = chartScale(amounts);
  const series = [{ kind: 'base', label: '기본안' }, { kind: 'funded', label: '후원 확보안' }];

  return `<figure class="budget-chart budget-chart--expense">
    <figcaption class="budget-chart__caption"><strong>지출 항목별 예산 비교</strong><span>단위 만원</span></figcaption>
    <ul class="budget-chart__legend" role="list">
      ${series.map(({ kind, label }) => `<li>${renderSwatch(kind)}<span>${label}</span></li>`).join('\n')}
    </ul>
    ${renderAxis(scale)}
    <ul class="budget-chart__rows" role="list">
      ${categories.map((category) => `<li class="budget-chart__row">
        <h3 class="budget-chart__category">${escape(category.label)}</h3>
        <div class="budget-chart__series">
          ${series.map(({ kind, label }) => `<div class="budget-chart__pair">
            <span class="budget-chart__series-name">${label}</span>
            ${renderTrack([{ kind, amount: category[kind] }], scale.maximum)}
            <strong class="budget-chart__value">${formatAmount(category[kind])}</strong>
          </div>`).join('\n')}
        </div>
      </li>`).join('\n')}
    </ul>
  </figure>`;
}

export function renderBudgetChart(section, escape) {
  if (!section.rows?.length) return '';
  if (section.visual === 'revenue-bars') return renderRevenueChart(section.rows, escape);
  if (section.visual === 'expense-bars') return renderExpenseChart(section.rows, escape);
  return '';
}
