'use strict';

const state = {
  projects: [],
  certificates: [],
  activeProjectIndex: 0,
  activeCollection: 'projects',
  lastFocused: null,
  activeDialog: null
};

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const normalizeAssetPath = (value) => {
  if (typeof value !== 'string' || value.length === 0) return value;
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value;
  if (value.startsWith('./dist/')) return `./${value.slice(8)}`;
  if (value.startsWith('dist/')) return value.slice(5);
  return value;
};

const getMediaList = (item) => {
  if (Array.isArray(item.media) && item.media.length > 0) {
    return item.media.map((media) => ({
      ...media,
      src: normalizeAssetPath(media.src),
      poster: normalizeAssetPath(media.poster)
    }));
  }

  const source = normalizeAssetPath(item.cover || item.href || item.imageSrc);
  if (!source) return [];
  return [{ type: /\.mp4($|\?)/i.test(source) ? 'video' : 'image', src: source, title: item.title }];
};

const getCover = (item) => {
  if (item.cover) return normalizeAssetPath(item.cover);
  const media = getMediaList(item)[0];
  return media ? normalizeAssetPath(media.poster || media.src) : '';
};

const setPage = (pageName) => {
  const pages = qsa('[data-page]');
  const links = qsa('[data-nav-link]');
  const normalized = pageName.toLowerCase();

  pages.forEach((page) => {
    const active = page.dataset.page === normalized;
    page.classList.toggle('active', active);
    page.toggleAttribute('hidden', !active);
    if (active) page.focus({ preventScroll: true });
  });

  links.forEach((link) => {
    const active = link.textContent.trim().toLowerCase() === normalized || link.dataset.navLink === normalized;
    link.classList.toggle('active', active);
    link.setAttribute('aria-selected', String(active));
  });

  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
};

const setupNavigation = () => {
  qsa('[data-nav-link]').forEach((link) => {
    link.addEventListener('click', () => {
      const target = link.dataset.navLink || link.textContent.trim().toLowerCase();
      setPage(target);
    });
  });

  qsa('[data-goto-page]').forEach((button) => {
    button.addEventListener('click', () => setPage(button.dataset.gotoPage));
  });
};

const createProjectCard = (project, index) => {
  const template = qs('#project-item-template');
  if (!template) return null;
  const card = template.content.firstElementChild.cloneNode(true);
  const link = qs('a', card);
  const image = qs('img', card);
  const title = qs('.project-title', card);
  const category = qs('.project-category', card);
  card.dataset.category = project.category || '';
  card.dataset.projectId = project.id || '';
  link.href = getMediaList(project)[0]?.src || '#';
  link.dataset.projectId = project.id || '';
  link.dataset.projectIndex = String(index);
  image.src = getCover(project);
  image.alt = project.imageAlt || project.title || 'Project image';
  image.loading = 'lazy';
  image.decoding = 'async';
  title.textContent = project.title || 'Untitled project';
  category.textContent = project.displayCategory || project.category || 'Project';
  return card;
};

const renderProjects = (projects) => {
  const list = qs('[data-project-list]');
  const status = qs('#projects-status');
  if (!list) return;
  list.replaceChildren();
  projects.forEach((project, index) => {
    const card = createProjectCard(project, index);
    if (card) list.appendChild(card);
  });
  if (status) status.textContent = `${projects.length} projects in the archive.`;
};

const renderCertificates = (certificates) => {
  const list = qs('[data-certificates-list]');
  const status = qs('#certificates-status');
  const template = qs('#certificate-item-template');
  if (!list || !template) return;
  list.replaceChildren();

  certificates.forEach((certificate, index) => {
    const card = template.content.firstElementChild.cloneNode(true);
    const link = qs('a', card);
    const image = qs('img', card);
    const title = qs('.project-title', card);
    const category = qs('.project-category', card);
    link.href = getMediaList(certificate)[0]?.src || '#';
    link.dataset.certificateIndex = String(index);
    image.src = getCover(certificate);
    image.alt = certificate.imageAlt || certificate.title || 'Certificate image';
    image.loading = 'lazy';
    image.decoding = 'async';
    title.textContent = certificate.title || 'Certificate';
    category.textContent = [certificate.category, certificate.date].filter(Boolean).join(' / ');
    list.appendChild(card);
  });

  if (status) status.textContent = `${certificates.length} certificates and awards.`;
};

const showCollectionError = (message) => {
  ['#projects-status', '#certificates-status'].forEach((selector) => {
    const node = qs(selector);
    if (node) node.textContent = message;
  });
};

const setupFilters = () => {
  qsa('[data-filter-btn]').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.textContent.trim().toLowerCase();
      const category = selected === 'all' ? 'all' : selected.replaceAll(' ', '-');
      qsa('[data-filter-btn]').forEach((item) => item.classList.toggle('active', item === button));
      qsa('[data-filter-item]').forEach((item) => {
        item.hidden = category !== 'all' && item.dataset.category !== category;
      });
    });
  });
};

const getDialogFocusable = (dialog) => qsa('button, a[href], [tabindex]:not([tabindex="-1"])', dialog).filter((item) => !item.hasAttribute('disabled'));

const closeDialog = (dialog) => {
  if (!dialog) return;
  dialog.classList.remove('active');
  dialog.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  state.activeDialog = null;
  if (state.lastFocused instanceof HTMLElement) state.lastFocused.focus();
};

const openDialog = (dialog) => {
  if (!dialog) return;
  state.lastFocused = document.activeElement;
  dialog.classList.add('active');
  dialog.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  state.activeDialog = dialog;
  const panel = qs('[role="dialog"]', dialog);
  if (panel) {
    panel.focus();
    panel.scrollTop = 0;
  }
};

const setupTestimonialModal = () => {
  const modal = qs('[data-modal-container]');
  const panel = qs('.testimonials-modal', modal);
  const close = qs('[data-modal-close-btn]', modal);
  const overlay = qs('[data-overlay]', modal);
  const image = qs('[data-modal-img]', modal);
  const title = qs('[data-modal-title]', modal);
  const date = qs('[data-modal-date]', modal);
  const text = qs('[data-modal-text]', modal);
  if (!modal || !panel || !close || !image || !title || !text) return;

  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'testimonial-modal-title');
  title.id = 'testimonial-modal-title';
  modal.setAttribute('aria-hidden', 'true');

  const open = (card) => {
    const avatar = qs('[data-testimonials-avatar]', card);
    const name = qs('[data-testimonials-title]', card);
    const source = qs('.testimonials-text2', card);
    const fullText = qs('[data-testimonials-text]', card);
    if (!avatar || !name || !fullText) return;
    image.src = avatar.src;
    image.alt = avatar.alt;
    title.textContent = name.textContent.trim();
    text.textContent = fullText.textContent.trim();
    if (date) date.hidden = true;
    if (source) {
      const sourceNode = qs('.modal-source', modal);
      if (sourceNode) sourceNode.textContent = source.textContent.trim();
    }
    openDialog(modal);
  };

  qsa('[data-testimonials-item]').forEach((card) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-haspopup', 'dialog');
    card.addEventListener('click', () => open(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(card);
      }
    });
  });

  close.addEventListener('click', () => closeDialog(modal));
  if (overlay) overlay.addEventListener('click', () => closeDialog(modal));
};

const setupProjectViewer = () => {
  const modal = qs('[data-project-modal]');
  const dialog = qs('[data-project-modal-dialog]', modal);
  const close = qs('[data-project-close]', modal);
  const backdrop = qs('[data-project-modal-backdrop]', modal);
  const rail = qs('[data-project-rail]', modal);
  const mediaList = qs('[data-project-media-list]', modal);
  const title = qs('[data-project-viewer-title]', modal);
  const category = qs('[data-project-viewer-category]', modal);
  const externalContainer = qs('[data-project-viewer-external-container]', modal);
  const external = qs('[data-project-viewer-external-btn]', modal);
  const previous = qs('[data-project-prev]', modal);
  const next = qs('[data-project-next]', modal);
  if (!modal || !dialog || !close || !rail || !mediaList || !title || !category) return;

  modal.setAttribute('aria-hidden', 'true');

  const render = () => {
    const collection = state.activeCollection === 'certificates' ? state.certificates : state.projects;
    const item = collection[state.activeProjectIndex];
    if (!item) return;
    title.textContent = item.title || 'Project';
    category.textContent = [item.category, item.date].filter(Boolean).join(' / ');
    if (externalContainer && external) {
      if (item.externalLinkUrl) {
        externalContainer.hidden = false;
        external.href = item.externalLinkUrl;
        external.textContent = item.externalLinkText || 'Open link';
      } else {
        externalContainer.hidden = true;
      }
    }

    rail.replaceChildren();
    collection.forEach((entry, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'project-viewer-rail-item';
      button.textContent = entry.title || `Item ${index + 1}`;
      button.classList.toggle('active', index === state.activeProjectIndex);
      button.dataset.projectRailIndex = String(index);
      button.addEventListener('click', () => {
        state.activeProjectIndex = index;
        render();
      });
      rail.appendChild(button);
    });

    mediaList.replaceChildren();
    getMediaList(item).forEach((media) => {
      const card = document.createElement('figure');
      card.className = 'project-viewer-media-card';
      if (media.type === 'video') {
        const video = document.createElement('video');
        video.controls = true;
        video.preload = 'metadata';
        if (media.poster) video.poster = media.poster;
        video.src = media.src;
        card.appendChild(video);
      } else {
        const image = document.createElement('img');
        image.src = media.src;
        image.alt = media.title || item.title || 'Project media';
        image.loading = 'lazy';
        card.appendChild(image);
      }
      const caption = document.createElement('figcaption');
      caption.textContent = media.title || item.title || '';
      card.appendChild(caption);
      mediaList.appendChild(card);
    });
  };

  const open = (collectionName, index) => {
    state.activeCollection = collectionName;
    state.activeProjectIndex = index;
    render();
    openDialog(modal);
  };

  close.addEventListener('click', () => closeDialog(modal));
  if (backdrop) backdrop.addEventListener('click', () => closeDialog(modal));
  previous?.addEventListener('click', () => {
    const collection = state.activeCollection === 'certificates' ? state.certificates : state.projects;
    state.activeProjectIndex = (state.activeProjectIndex - 1 + collection.length) % collection.length;
    render();
  });
  next?.addEventListener('click', () => {
    const collection = state.activeCollection === 'certificates' ? state.certificates : state.projects;
    state.activeProjectIndex = (state.activeProjectIndex + 1) % collection.length;
    render();
  });

  document.addEventListener('click', (event) => {
    const projectTrigger = event.target.closest('[data-open-project], [data-project-trigger]');
    const certificateTrigger = event.target.closest('[data-certificate-trigger]');
    if (projectTrigger) {
      event.preventDefault();
      const id = projectTrigger.dataset.openProject || projectTrigger.dataset.projectId;
      const index = state.projects.findIndex((project) => project.id === id);
      if (index >= 0) open('projects', index);
    }
    if (certificateTrigger) {
      event.preventDefault();
      const index = Number.parseInt(certificateTrigger.dataset.certificateIndex, 10);
      if (!Number.isNaN(index)) open('certificates', index);
    }
  });
};

const setupKeyboard = () => {
  document.addEventListener('keydown', (event) => {
    if (!state.activeDialog) return;
    if (event.key === 'Escape') {
      closeDialog(state.activeDialog);
      return;
    }
    if (event.key !== 'Tab') return;
    const panel = qs('[role="dialog"]', state.activeDialog);
    if (!panel) return;
    const focusable = getDialogFocusable(panel);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
};

const initialize = async () => {
  setupNavigation();
  setupFilters();
  setupTestimonialModal();
  setupKeyboard();

  try {
    const [projectsResponse, certificatesResponse] = await Promise.all([
      fetch('./data/projects.json'),
      fetch('./data/certificates.json')
    ]);
    if (!projectsResponse.ok || !certificatesResponse.ok) throw new Error('Portfolio data could not be loaded.');
    state.projects = await projectsResponse.json();
    state.certificates = await certificatesResponse.json();
    renderProjects(state.projects);
    renderCertificates(state.certificates);
    setupProjectViewer();
  } catch (error) {
    console.error(error);
    showCollectionError('Content is temporarily unavailable. Please refresh or use the links above.');
  }
};

initialize();
