function renderNode(item, escape, variant = '') {
  return `<dl class="diagram-node${variant ? ` ${variant}` : ''}">
    <dt>${escape(item.title)}</dt>
    <dd>${escape(item.text)}</dd>
  </dl>`;
}

function renderBranches(items, escape) {
  return `<ul class="diagram-branches diagram-branches--four" role="list">
    ${items.map((item) => `<li>${renderNode(item, escape)}</li>`).join('\n')}
  </ul>`;
}

function renderSequenceDetails(item, escape) {
  return `<h3>${escape(item.title)}</h3>
    ${item.text ? `<p>${escape(item.text)}</p>` : ''}
    ${item.bullets?.length ? `<ul>${item.bullets.map((bullet) => `<li>${escape(bullet)}</li>`).join('')}</ul>` : ''}`;
}

function renderSchedule(items, escape) {
  return `<div class="report-diagram report-diagram--schedule">
    <ol class="schedule-track" role="list">
      ${items.map((item) => `<li class="schedule-track__item">
        <div class="schedule-track__date">${item.label ? escape(item.label) : ''}</div>
        <div class="diagram-sequence-details">${renderSequenceDetails(item, escape)}</div>
      </li>`).join('\n')}
    </ol>
  </div>`;
}

function renderProcessFlow(items, escape) {
  return `<div class="report-diagram report-diagram--flow">
    <ol class="process-flow" role="list">
      ${items.map((item, index) => `<li class="process-flow__item">
        <div class="diagram-node process-flow__stage">
          <div class="process-flow__step">
            <span class="process-flow__number" aria-hidden="true">${index + 1}</span>
            ${item.label ? `<span>${escape(item.label)}</span>` : ''}
          </div>
          <div class="diagram-sequence-details">${renderSequenceDetails(item, escape)}</div>
        </div>
        ${item.branch ? `<div class="process-flow__branch">
          <strong>${escape(item.branch.title)}</strong>
          <p>${escape(item.branch.text)}</p>
        </div>` : ''}
      </li>`).join('\n')}
    </ol>
  </div>`;
}

export function renderDiagram(section, escape) {
  if (section.layout === 'strategy-framework') {
    return `<div class="report-diagram strategy-framework">
      <ol class="strategy-framework__sequence" role="list">
        <li>${renderNode(section.mission, escape, 'diagram-node--mission')}</li>
        <li>${renderNode(section.vision, escape, 'diagram-node--primary')}</li>
      </ol>
      <h3 id="section-3" class="strategy-framework__directions">네 가지 전략</h3>
      ${renderBranches(section.strategies, escape)}
      <div class="strategy-framework__values">
        <h3>핵심가치</h3>
        <ul role="list">${section.values.map((value) => `<li>${escape(value)}</li>`).join('')}</ul>
      </div>
    </div>`;
  }

  if (section.layout === 'organization-chart') {
    return `<div class="report-diagram organization-chart">
      <ul class="organization-chart__root" role="list">
        <li>
          ${renderNode(section.assembly, escape, 'diagram-node--primary organization-chart__assembly')}
          <ul class="diagram-branches diagram-branches--split" role="list">
            <li class="organization-chart__operations">
              <div class="organization-chart__committee">
                <h3>${escape(section.committee)}</h3>
                ${renderNode(section.chair, escape, 'organization-chart__chair')}
                ${renderBranches(section.leads, escape)}
              </div>
            </li>
            <li>${renderNode(section.auditor, escape, 'organization-chart__audit')}</li>
          </ul>
        </li>
      </ul>
    </div>`;
  }

  if (section.layout === 'schedule') return renderSchedule(section.items, escape);
  if (section.layout === 'process-flow') return renderProcessFlow(section.items, escape);

  return '';
}
