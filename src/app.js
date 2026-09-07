// Configuración: cada HTML indica, mediante data-catalog, qué JSON cargar.
// Para añadir novelas, edita data/translations.json (o translations-private.json); no hace falta tocar este archivo.
const body = document.body;
const elements = {
  grid: document.querySelector('#catalog-grid'), search: document.querySelector('#search'), count: document.querySelector('#project-count'),
  empty: document.querySelector('#empty-state'), clear: document.querySelector('#clear-search'), status: document.querySelector('#results-status'),
  tutorials: document.querySelector('#tutorial-list'), modal: document.querySelector('#project-modal'), modalContent: document.querySelector('#modal-content'), close: document.querySelector('#close-modal'), social: document.querySelector('#social-links')
};

const safeArray = (value) => Array.isArray(value) ? value : [];
const text = (value, fallback = '') => String(value ?? fallback);
const escapeHTML = (value) => text(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
async function loadJSON(path, fallback = []) {
  try { const response = await fetch(new URL(path, window.location.href)); if (!response.ok) throw new Error(response.status); return await response.json(); }
  catch (error) { console.warn(`No se pudo cargar ${path}`, error); return fallback; }
}

let projects = [];
function openModal() {
  // `dialog` funciona en los navegadores modernos. El atributo es un respaldo para
  // navegadores o visores integrados que no implementan showModal().
  if (typeof elements.modal.showModal === 'function') elements.modal.showModal();
  else { elements.modal.setAttribute('open', ''); elements.modal.setAttribute('aria-modal', 'true'); }
  elements.close.focus();
}
function closeModal() {
  if (typeof elements.modal.close === 'function') elements.modal.close();
  else { elements.modal.removeAttribute('open'); elements.modal.removeAttribute('aria-modal'); }
}
function projectCard(project, index) {
  const name = escapeHTML(project.name || 'Sin título');
  const author = escapeHTML(project.author || 'Autor no indicado');
  const status = escapeHTML(project.status || 'Sin estado');
  const image = escapeHTML(project.image || '');
  const originalIndex = Number.isInteger(project._originalIndex) ? project._originalIndex : index;
  return `<article class="project-card"><button class="project-button" type="button" data-project="${originalIndex}" aria-label="Ver detalles de ${name}"><div class="cover-wrap">${image ? `<img src="${image}" alt="Portada de ${name}" loading="lazy">` : '<div class="cover-placeholder">Sin portada</div>'}<span class="status status-${status.toLowerCase().replaceAll(' ', '-')}">${status}</span></div><div class="card-copy"><h3>${name}</h3><p>${author}</p></div></button></article>`;
}
function renderCatalog(list) {
  elements.grid.innerHTML = list.map(projectCard).join('');
  elements.empty.hidden = list.length > 0;
  elements.count.textContent = `${list.length} ${list.length === 1 ? 'proyecto' : 'proyectos'}`;
  elements.status.textContent = `${list.length} resultados encontrados`;
}
function filterProjects(query = '') {
  const term = query.trim().toLocaleLowerCase('es');
  const filtered = !term ? projects : projects.filter(project => Object.values(project).flatMap(value => typeof value === 'object' ? Object.values(value || {}) : value).join(' ').toLocaleLowerCase('es').includes(term));
  renderCatalog(filtered.map(project => ({...project, _originalIndex: projects.indexOf(project)})));
}
function showProject(index) {
  const project = projects[index]; if (!project) return;
  const links = project.links || {};
  const buttons = [['official', 'Juego oficial'], ['pc', 'Parche en español — PC'], ['android', 'Port en español — Android']]
    .filter(([key]) => links[key]).map(([key, label]) => `<a class="action-button ${key}" href="${escapeHTML(links[key])}" target="_blank" rel="noopener noreferrer">${label}<span aria-hidden="true">↗</span></a>`).join('');
  elements.modalContent.innerHTML = `<div class="modal-cover">${project.image ? `<img src="${escapeHTML(project.image)}" alt="Portada de ${escapeHTML(project.name)}">` : ''}</div><div class="modal-copy"><span class="status status-${escapeHTML(text(project.status).toLowerCase().replaceAll(' ', '-'))}">${escapeHTML(project.status || 'Sin estado')}</span><p class="modal-kicker">${escapeHTML(project.author || 'Autor no indicado')}</p><h2 id="modal-title">${escapeHTML(project.name || 'Sin título')}</h2><div class="details"><div><h3>Sobre la novela</h3><p>${escapeHTML(project.description || 'No hay descripción disponible todavía.')}</p></div><div><h3>Notas de traducción</h3><p>${escapeHTML(project.translationNotes || 'No hay notas de traducción disponibles todavía.')}</p></div></div>${buttons ? `<div class="action-buttons">${buttons}</div>` : ''}</div>`;
  openModal();
}

function bindInteractions() {
  elements.search.addEventListener('input', event => filterProjects(event.target.value));
  window.addEventListener('keydown', event => { if (event.key === 'Escape' && document.activeElement === elements.search) { elements.search.value = ''; filterProjects(); } });
  elements.clear.addEventListener('click', () => { elements.search.value = ''; filterProjects(); elements.search.focus(); });
  elements.grid.addEventListener('click', event => { const button = event.target.closest('[data-project]'); if (button) showProject(Number(button.dataset.project)); });
  elements.close.addEventListener('click', closeModal);
  elements.modal.addEventListener('click', event => { if (event.target === elements.modal) closeModal(); });
}
function renderTutorials(tutorials) {
  elements.tutorials.innerHTML = tutorials.map((tutorial, i) => `<details class="tutorial" ${i === 0 ? 'open' : ''}><summary><span>${escapeHTML(tutorial.title || 'Tutorial')}</span><span class="tutorial-plus" aria-hidden="true">+</span></summary><div class="tutorial-content">${tutorial.content || '<p>Contenido próximamente.</p>'}</div></details>`).join('');
}
function renderSocials(site) {
  // Cambia o añade redes en data/site.json.
  elements.social.innerHTML = safeArray(site.socialLinks).filter(link => link.url).map(link => `<a href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(link.label)}"><span aria-hidden="true">${escapeHTML(link.icon || '↗')}</span>${escapeHTML(link.label)}</a>`).join('');
}
async function start() {
  const [catalog, tutorials, site] = await Promise.all([loadJSON(body.dataset.catalog), loadJSON(body.dataset.tutorials), loadJSON(body.dataset.site)]);
  projects = safeArray(catalog); renderCatalog(projects); renderTutorials(safeArray(tutorials)); renderSocials(site || {}); bindInteractions();
}
start();
