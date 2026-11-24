import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chapters, report } from '../src/content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const [buildDate, review] = report.period.split(' · ');

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

const sectionId = (index) => `section-${index + 1}`;
const chapterUrl = (prefix, chapter) => `${prefix}${chapter.slug}/index.html`;

function navigation(prefix, activeSlug) {
  return chapters.map((chapter) => `<a href="${chapterUrl(prefix, chapter)}"${chapter.slug === activeSlug ? ' aria-current="page"' : ''}>${escape(chapter.nav)}</a>`).join('\n');
}

function bike() {
  return `<svg viewBox="0 0 64 40" fill="none" aria-hidden="true" focusable="false">
    <circle cx="14" cy="27" r="10"/><circle cx="50" cy="27" r="10"/>
    <path d="M14 27 25 10l11 17H14m11-17h19l-8 17m14 0L43 5h7M20 10h10"/>
  </svg>`;
}

function coverBike(moving = false) {
  const wheels = [14, 50].map((x) => `<g transform="translate(${x} 27)">
    <circle r="10"/>
    <g class="cover-wheel-spokes">
      <path d="M-10 0h20M0-10v20M-7-7 7 7M-7 7 7-7"/>
      ${moving ? '<animateTransform attributeName="transform" type="rotate" from="0" to="360" begin="-2.35s" dur="1.05s" repeatCount="indefinite"/>' : ''}
    </g>
  </g>`).join('');

  return `${wheels}<path d="M14 27 25 10l11 17H14m11-17h19l-8 17m14 0L43 5h7M20 10h10"/>`;
}

function header(prefix, activeSlug) {
  return `<a class="skip-link" href="#main">본문으로 건너뛰기</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="${prefix}index.html"${activeSlug ? '' : ' aria-current="page"'}>
        <span class="brand-mark">${bike()}</span>
        <span class="brand-type"><strong>탄감자</strong><small>2027 운영계획</small></span>
      </a>
      <nav class="desktop-nav" aria-label="운영계획 페이지">${navigation(prefix, activeSlug)}</nav>
      <span class="review-tag">검토용</span>
      <details class="mobile-nav">
        <summary>메뉴</summary>
        <nav class="mobile-links" aria-label="운영계획 페이지">${navigation(prefix, activeSlug)}</nav>
      </details>
    </div>
  </header>`;
}

function footer(prefix) {
  return `<footer class="site-footer">
    <div class="container footer-inner">
      <div><a href="${prefix}index.html"><strong>탄감자</strong></a><p>${escape(report.organization)}</p></div>
      <p class="footer-note">2027 운영계획(안)<br>${escape(buildDate)} · ${escape(review)}</p>
    </div>
  </footer>`;
}

function documentPage({ title, description, prefix, slug, body }) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(description)}">
  <meta name="theme-color" content="#143B32">
  <title>${escape(title)}</title>
  <link rel="stylesheet" href="${prefix}styles.css">
  <link rel="icon" href="${prefix}favicon.svg" type="image/svg+xml">
</head>
<body class="${slug ? 'chapter-page' : 'home-page'}">
${header(prefix, slug)}
${body}
${footer(prefix)}
</body>
</html>`;
}

function metrics(items) {
  return `<dl class="metrics ${items.length === 3 ? 'metrics-three' : ''}">
    ${items.map(({ label, value, detail }) => `<div class="metric">
      <dt class="metric-label">${escape(label)}</dt>
      <dd class="metric-value">${escape(value)}</dd>
      ${detail ? `<dd class="metric-detail">${escape(detail)}</dd>` : ''}
    </div>`).join('\n')}
  </dl>`;
}

function home() {
  const [taglineStart, taglineEnd] = report.tagline.split(/(?<=,)\s+/u, 2);

  return documentPage({
    title: `${report.title}(안)`,
    description: report.overview,
    prefix: './',
    body: `<main id="main" class="container">
      <section class="hero" aria-labelledby="home-title">
        <div class="hero-copy">
          <p class="eyebrow"><span aria-hidden="true"></span> 2027 운영계획(안)</p>
          <h1 id="home-title">${escape(taglineStart)}${taglineEnd ? `<br><span>${escape(taglineEnd)}</span>` : ''}</h1>
          <p class="hero-description">${escape(report.overview)}</p>
          <div class="hero-actions">
            <a class="button primary" href="${chapterUrl('./', chapters[0])}">운영 방향 읽기</a>
            <a class="text-link" href="#contents">전체 목차</a>
          </div>
        </div>
        <div class="cover">
          <div class="cover-top"><span>TANGAMJA</span><span>ANNUAL PLAN</span></div>
          <p class="cover-year">2027</p>
          <div class="cover-art" aria-hidden="true">
            <svg id="cover-bike-art" viewBox="0 0 560 260" fill="none" preserveAspectRatio="xMidYMid slice" focusable="false">
              <path class="cover-track" d="M-22 244C70 160 111 224 185 196S272 105 336 111s116 69 247-48"/>
              <path class="cover-track" d="M-22 260C70 176 111 240 185 212S272 121 336 127s116 69 247-48"/>
              <path class="cover-track" d="M-22 276C70 192 111 256 185 228S272 137 336 143s116 69 247-48"/>
              <path id="cover-route" class="cover-route" d="M-64 266l42-38C70 144 111 208 185 180S272 89 336 95s116 69 247-48l40-39"/>
              <circle class="cover-route-point" cx="336" cy="95" r="5"/>
              <g class="cover-bike cover-bike-still" transform="translate(427 78) scale(1.3) translate(-32 -37)">
                ${coverBike()}
              </g>
              <g class="cover-bike cover-bike-ride">
                <animateMotion begin="-2.35s" dur="8.4s" rotate="auto" repeatCount="indefinite">
                  <mpath href="#cover-route"/>
                </animateMotion>
                <g transform="scale(1.3) translate(-32 -37)">${coverBike(true)}</g>
              </g>
            </svg>
          </div>
          <button type="button" class="cover-motion-toggle" hidden>모션 일시정지</button>
          <div class="cover-foot"><span>${escape(report.subtitle)}</span><span>${escape(buildDate)}</span></div>
        </div>
      </section>
      <section class="home-metrics" aria-labelledby="metrics-title">
        <div class="section-heading"><h2 id="metrics-title">2027년 핵심 목표</h2><p>${escape(report.homeNote ?? '2027년 운영계획 기준 목표(안)')}</p></div>
        ${metrics(report.metrics)}
      </section>
      <section class="contents" id="contents" aria-labelledby="contents-title">
        <div class="section-heading"><h2 id="contents-title">운영계획 목차</h2></div>
        <div class="contents-grid">
          ${chapters.map((chapter) => `<a class="chapter-card" href="${chapterUrl('./', chapter)}">
            <span class="card-category" lang="en">${escape(chapter.category)}</span>
            <h3 class="card-title">${escape(chapter.title)}</h3>
            <p class="card-description">${escape(chapter.description)}</p>
            <span class="card-link">자세히 보기</span>
          </a>`).join('\n')}
        </div>
      </section>
    </main>
    <script src="./cover-motion.js" defer></script>`,
  });
}

function itemContent(item) {
  return `${item.label ? `<p class="item-label">${escape(item.label)}</p>` : ''}
    <h3>${escape(item.title)}</h3>
    ${item.text ? `<p>${escape(item.text)}</p>` : ''}
    ${item.bullets?.length ? `<ul>${item.bullets.map((line) => `<li>${escape(line)}</li>`).join('')}</ul>` : ''}`;
}

function sectionBody(section, index) {
  if (section.layout === 'table') {
    return `<div class="table-scroll" tabindex="0" role="region" aria-labelledby="${sectionId(index)}-title">
      <table class="data-table">
        <thead><tr>${section.columns.map((column) => `<th scope="col">${escape(column)}</th>`).join('')}</tr></thead>
        <tbody>${section.rows.map(([label, ...cells]) => `<tr><th scope="row">${escape(label)}</th>${cells.map((value) => `<td>${escape(value)}</td>`).join('')}</tr>`).join('\n')}</tbody>
      </table>
    </div>`;
  }

  if (!section.items?.length) return '';

  if (section.layout === 'timeline') {
    return `<ol class="timeline">${section.items.map((item) => `<li class="timeline-item">${itemContent(item)}</li>`).join('\n')}</ol>`;
  }

  if (section.layout === 'list') {
    return `<ul class="article-list">${section.items.map((item) => `<li>${itemContent(item)}</li>`).join('\n')}</ul>`;
  }

  return `<div class="content-grid">${section.items.map((item) => `<article class="content-card">${itemContent(item)}</article>`).join('\n')}</div>`;
}

function chapterPage(chapter, index) {
  const [previous, next] = [chapters[index - 1], chapters[index + 1]];
  return documentPage({
    title: `${chapter.title} · ${report.title}(안)`,
    description: chapter.description,
    prefix: '../',
    slug: chapter.slug,
    body: `<main id="main" class="container">
      <nav class="breadcrumbs" aria-label="현재 위치"><a href="../index.html#contents">운영계획 목차</a><span aria-hidden="true">/</span><span aria-current="page">${escape(chapter.nav)}</span></nav>
      <header class="chapter-header">
        <p class="chapter-meta" lang="en">${escape(chapter.category)}</p>
        <h1>${escape(chapter.title)}</h1>
        <p class="chapter-summary">${escape(chapter.description)}</p>
      </header>
      <div class="chapter-layout">
        <aside class="chapter-side">
          <nav aria-label="이 페이지의 목차">
            <p class="side-label">이 페이지</p>
            <ul class="section-links">${chapter.sections.map((section, sectionIndex) => `<li><a href="#${sectionId(sectionIndex)}">${escape(section.title)}</a></li>`).join('\n')}</ul>
          </nav>
        </aside>
        <div class="chapter-content">
          ${chapter.highlights?.length ? metrics(chapter.highlights) : ''}
          ${chapter.sections.map((section, sectionIndex) => `<section id="${sectionId(sectionIndex)}" class="article-section" aria-labelledby="${sectionId(sectionIndex)}-title">
            <h2 id="${sectionId(sectionIndex)}-title">${escape(section.title)}</h2>
            ${section.intro ? `<p class="section-intro">${escape(section.intro)}</p>` : ''}
            ${sectionBody(section, sectionIndex)}
            ${section.note ? `<p class="section-note">${escape(section.note)}</p>` : ''}
          </section>`).join('\n')}
          <p class="source-note">${escape(chapter.source)}</p>
          <nav class="page-turn" aria-label="이전 및 다음 페이지">
            <a class="page-turn-link" href="${previous ? chapterUrl('../', previous) : '../index.html#contents'}"><span class="page-turn-label">${previous ? '이전 페이지' : '목차'}</span><strong>${escape(previous?.title ?? '운영계획 목차')}</strong></a>
            <a class="page-turn-link" href="${next ? chapterUrl('../', next) : '../index.html#contents'}"><span class="page-turn-label">${next ? '다음 페이지' : '목차'}</span><strong>${escape(next?.title ?? '운영계획 목차')}</strong></a>
          </nav>
        </div>
      </div>
    </main>`,
  });
}

await mkdir(output, { recursive: true });
await Promise.all([
  copyFile(join(root, 'src', 'styles.css'), join(output, 'styles.css')),
  copyFile(join(root, 'src', 'cover-motion.js'), join(output, 'cover-motion.js')),
  writeFile(join(output, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="13" fill="#143B32"/><g transform="translate(3 14) scale(.91)" fill="none" stroke="#F0CB72" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="27" r="10"/><circle cx="50" cy="27" r="10"/><path d="M14 27 25 10l11 17H14m11-17h19l-8 17m14 0L43 5h7M20 10h10"/></g></svg>`),
  writeFile(join(output, 'index.html'), home()),
  ...chapters.map(async (chapter, index) => {
    const path = join(output, chapter.slug);
    await mkdir(path, { recursive: true });
    await writeFile(join(path, 'index.html'), chapterPage(chapter, index));
  }),
]);

console.log(`Generated ${chapters.length + 1} pages in dist/`);
