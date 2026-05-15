'use strict';

const elementToggleFunc = function (elem) {
  elem.classList.toggle('active');
};

const projectViewerState = {
  projects: [],
  activeProjectIndex: 0,
  lastTrigger: null,
  focusableElements: [],
  pointerStartX: null,
  pointerStartY: null,
  isScrolling: false
};

const normalizeAssetPath = function (value) {
  if (typeof value !== 'string' || value.length === 0) {
    return value;
  }

  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  if (value.startsWith('./dist/')) {
    return `./${value.slice('./dist/'.length)}`;
  }

  if (value.startsWith('dist/')) {
    return value.slice('dist/'.length);
  }

  return value;
};

const getProjectCover = function (project) {
  if (project.cover) {
    return normalizeAssetPath(project.cover);
  }

  const projectMedia = getProjectMediaList(project);
  if (projectMedia.length > 0) {
    const firstMedia = projectMedia[0];
    if (firstMedia.type === 'video') {
      return normalizeAssetPath(firstMedia.poster || project.imageSrc || '');
    }

    return normalizeAssetPath(firstMedia.src || project.imageSrc || '');
  }

  return normalizeAssetPath(project.imageSrc || '');
};

const getProjectPrimaryHref = function (project) {
  const projectMedia = getProjectMediaList(project);
  if (projectMedia.length === 0) {
    return normalizeAssetPath(project.href || project.imageSrc || '#');
  }

  const firstMedia = projectMedia[0];
  if (firstMedia.type === 'video') {
    return normalizeAssetPath(firstMedia.src || firstMedia.poster || '#');
  }

  return normalizeAssetPath(firstMedia.src || '#');
};

const getProjectMediaList = function (project) {
  if (Array.isArray(project.media) && project.media.length > 0) {
    return project.media.map((item) => ({
      ...item,
      src: normalizeAssetPath(item.src),
      poster: normalizeAssetPath(item.poster)
    }));
  }

  const fallbackSource = normalizeAssetPath(project.href || project.imageSrc);
  if (!fallbackSource) {
    return [];
  }

  const isVideo = /\.mp4($|\?)/i.test(fallbackSource);
  if (isVideo) {
    return [
      {
        type: 'video',
        src: fallbackSource,
        poster: normalizeAssetPath(project.cover || project.imageSrc || ''),
        title: project.title
      }
    ];
  }

  return [
    {
      type: 'image',
      src: fallbackSource,
      title: project.title
    }
  ];
};

const renderProjects = function (projects) {
  const projectList = document.querySelector('[data-project-list]');
  const projectTemplate = document.querySelector('#project-item-template');

  if (!projectList || !projectTemplate) {
    return;
  }

  const fragment = document.createDocumentFragment();

  projects.forEach((project, index) => {
    const projectNode = projectTemplate.content.firstElementChild.cloneNode(true);
    const projectLink = projectNode.querySelector('a');
    const projectImage = projectNode.querySelector('img');
    const projectTitle = projectNode.querySelector('.project-title');
    const projectCategory = projectNode.querySelector('.project-category');

    projectNode.dataset.category = project.category;
    projectNode.dataset.projectId = project.id;
    const primaryHref = getProjectPrimaryHref(project);
    projectLink.href = primaryHref;
    projectLink.dataset.projectId = project.id;
    projectLink.dataset.projectIndex = String(index);
    projectLink.dataset.title = project.dataTitle || project.title;
    projectImage.src = getProjectCover(project);
    projectImage.alt = project.imageAlt;
    projectTitle.textContent = project.title;
    projectCategory.textContent = project.displayCategory;

    fragment.appendChild(projectNode);
  });

  projectList.replaceChildren(fragment);
};

const renderCertificates = function (certificates) {
  const certificatesList = document.querySelector('[data-certificates-list]');
  const certificateTemplate = document.querySelector('#certificate-item-template');

  if (!certificatesList || !certificateTemplate) {
    return;
  }

  const fragment = document.createDocumentFragment();

  certificates.forEach((certificate, index) => {
    const certificateNode = certificateTemplate.content.firstElementChild.cloneNode(true);
    const certificateLink = certificateNode.querySelector('a');
    const certificateImage = certificateNode.querySelector('img');
    const certificateTitle = certificateNode.querySelector('.project-title');
    const certificateCategory = certificateNode.querySelector('.project-category');

    certificateLink.href = getProjectPrimaryHref(certificate);
    certificateLink.dataset.certificateIndex = String(index);
    certificateImage.src = getProjectCover(certificate);
    certificateImage.alt = certificate.imageAlt;
    certificateTitle.textContent = certificate.title;
    certificateCategory.textContent = certificate.category;

    fragment.appendChild(certificateNode);
  });

  certificatesList.replaceChildren(fragment);
};

const mapCertificatesToViewerItems = function (certificates) {
  return certificates.map((certificate, index) => ({
    ...certificate,
    id: certificate.id || `certificate-${index}`,
    displayCategory: [certificate.category, certificate.date].filter(Boolean).join(' | ')
  }));
};

const initializeDynamicSections = async function () {
  try {
    const [projectsResponse, certificatesResponse] = await Promise.all([
      fetch('./data/projects.json'),
      fetch('./data/certificates.json')
    ]);

    if (!projectsResponse.ok || !certificatesResponse.ok) {
      throw new Error('Failed to fetch one or more data files.');
    }

    const [projects, certificates] = await Promise.all([
      projectsResponse.json(),
      certificatesResponse.json()
    ]);

    renderProjects(projects);
    renderCertificates(certificates);
    return { projects, certificates: mapCertificatesToViewerItems(certificates) };
  } catch (error) {
    console.error('Dynamic content failed to load:', error);
    return null;
  }
};

const setupSidebarToggle = function () {
  const sidebar = document.querySelector('[data-sidebar]');
  const sidebarBtn = document.querySelector('[data-sidebar-btn]');

  if (!sidebar || !sidebarBtn) {
    return;
  }

  sidebarBtn.addEventListener('click', function () {
    elementToggleFunc(sidebar);
  });
};

const setupTestimonialsModal = function () {
  const testimonialsItems = document.querySelectorAll('[data-testimonials-item]');
  const modalContainer = document.querySelector('[data-modal-container]');
  const modalCloseBtn = document.querySelector('[data-modal-close-btn]');
  const overlay = document.querySelector('[data-overlay]');
  const modalImg = document.querySelector('[data-modal-img]');
  const modalTitle = document.querySelector('[data-modal-title]');
  const modalText = document.querySelector('[data-modal-text]');

  if (!modalContainer || !modalCloseBtn || !overlay || !modalImg || !modalTitle || !modalText) {
    return;
  }

  const testimonialsModalFunc = function () {
    modalContainer.classList.toggle('active');
    overlay.classList.toggle('active');
  };

  testimonialsItems.forEach((item) => {
    item.addEventListener('click', function () {
      modalImg.src = this.querySelector('[data-testimonials-avatar]').src;
      modalImg.alt = this.querySelector('[data-testimonials-avatar]').alt;
      modalTitle.innerHTML = this.querySelector('[data-testimonials-title]').innerHTML;
      modalText.innerHTML = this.querySelector('[data-testimonials-text]').innerHTML;
      testimonialsModalFunc();
    });
  });

  modalCloseBtn.addEventListener('click', testimonialsModalFunc);
  overlay.addEventListener('click', testimonialsModalFunc);
};

const setupPortfolioFilter = function () {
  const select = document.querySelector('[data-select]');
  const selectItems = document.querySelectorAll('[data-select-item]');
  const selectValue = document.querySelector('[data-select-value]');
  const filterButtons = document.querySelectorAll('[data-filter-btn]');

  if (!select || !selectValue || filterButtons.length === 0) {
    return;
  }

  const filterFunc = function (selectedValue) {
    const filterItems = document.querySelectorAll('[data-filter-item]');

    filterItems.forEach((item) => {
      if (selectedValue === 'all' || selectedValue === item.dataset.category) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  };

  select.addEventListener('click', function () {
    elementToggleFunc(this);
  });

  selectItems.forEach((item) => {
    item.addEventListener('click', function () {
      const selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);
    });
  });

  let lastClickedBtn = filterButtons[0];
  filterButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      filterFunc(selectedValue);

      lastClickedBtn.classList.remove('active');
      this.classList.add('active');
      lastClickedBtn = this;
    });
  });
};

const getProjectViewerElements = function () {
  return {
    modal: document.querySelector('[data-project-modal]'),
    dialog: document.querySelector('[data-project-modal-dialog]'),
    backdrop: document.querySelector('[data-project-modal-backdrop]'),
    closeButton: document.querySelector('[data-project-close]'),
    previousButton: document.querySelector('[data-project-prev]'),
    nextButton: document.querySelector('[data-project-next]'),
    rail: document.querySelector('[data-project-rail]'),
    title: document.querySelector('[data-project-viewer-title]'),
    category: document.querySelector('[data-project-viewer-category]'),
    mediaList: document.querySelector('[data-project-media-list]')
  };
};

const teardownProject = function (mediaList) {
  const videos = mediaList.querySelectorAll('video');
  videos.forEach((video) => {
    video.pause();
    video.currentTime = 0;
  });
};

const getFocusableElements = function (root) {
  const selector = [
    'button:not([disabled])',
    '[href]:not([tabindex="-1"])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  return Array.from(root.querySelectorAll(selector)).filter((element) => element.offsetParent !== null);
};

const buildProjectRail = function (elements) {
  const railFragment = document.createDocumentFragment();

  projectViewerState.projects.forEach((project, index) => {
    const railButton = document.createElement('button');
    railButton.type = 'button';
    railButton.className = 'project-viewer-rail-item';
    railButton.dataset.projectRailIndex = String(index);
    railButton.setAttribute('aria-label', `Open ${project.title}`);
    railButton.textContent = project.title;
    railButton.addEventListener('click', function () {
      setActiveProject(index, elements, 'right');
    });
    railFragment.appendChild(railButton);
  });

  elements.rail.replaceChildren(railFragment);
};

const renderProjectMediaStack = function (project, elements) {
  teardownProject(elements.mediaList);

  const mediaFragment = document.createDocumentFragment();
  const mediaList = getProjectMediaList(project);
  if (!Array.isArray(mediaList) || mediaList.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'project-viewer-media-caption';
    emptyState.textContent = 'Media not available for this project yet.';
    elements.mediaList.replaceChildren(emptyState);
    elements.mediaList.scrollTop = 0;
    return;
  }

  mediaList.forEach((mediaItem) => {
    const normalizedType = mediaItem && mediaItem.type === 'video' ? 'video' : 'image';
    const mediaSource = mediaItem && typeof mediaItem.src === 'string' ? mediaItem.src : '';
    if (!mediaSource) {
      const missingCard = document.createElement('div');
      missingCard.className = 'project-viewer-media-card';
      missingCard.appendChild(createMediaErrorMessage('Media source is missing for this project item.'));
      mediaFragment.appendChild(missingCard);
      return;
    }

    const card = document.createElement('div');
    card.className = 'project-viewer-media-card';

    if (normalizedType === 'video') {
      const video = document.createElement('video');
      video.controls = true;
      video.preload = 'metadata';
      video.setAttribute('playsinline', '');
      video.addEventListener('error', function () {
        const videoPoster = normalizeAssetPath(mediaItem.poster || '');
        if (videoPoster) {
          const fallbackImage = document.createElement('img');
          fallbackImage.src = videoPoster;
          fallbackImage.alt = mediaItem.title || project.title;
          fallbackImage.addEventListener('error', function () {
            card.replaceChildren(createMediaErrorMessage('Video unavailable for this project media.'));
          });
          card.replaceChildren(fallbackImage);
        } else {
          card.replaceChildren(createMediaErrorMessage('Video unavailable for this project media.'));
        }
      });
      if (mediaItem.poster) {
        video.poster = mediaItem.poster;
      }
      video.src = mediaSource;
      card.appendChild(video);
    } else {
      const image = document.createElement('img');
      image.loading = 'eager';
      image.decoding = 'async';
      image.alt = mediaItem.title || project.title;
      image.addEventListener('error', function () {
        card.replaceChildren(createMediaErrorMessage('Image unavailable for this project media.'));
      });
      image.src = mediaSource;
      card.appendChild(image);
    }

    mediaFragment.appendChild(card);
  });

  if (mediaFragment.childElementCount === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'project-viewer-media-caption';
    emptyState.textContent = 'Media not available for this project yet.';
    elements.mediaList.replaceChildren(emptyState);
  } else {
    elements.mediaList.replaceChildren(mediaFragment);
  }
  elements.mediaList.scrollTop = 0;
};

const createMediaErrorMessage = function (message) {
  const fallback = document.createElement('p');
  fallback.className = 'project-viewer-media-caption project-viewer-media-error';
  fallback.textContent = message;
  return fallback;
};

var setActiveProject = function () { };

const syncActiveRail = function (elements) {
  const railButtons = elements.rail.querySelectorAll('[data-project-rail-index]');

  railButtons.forEach((button, index) => {
    const isActive = index === projectViewerState.activeProjectIndex;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-current', isActive ? 'true' : 'false');
    if (isActive) {
      button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
};

setActiveProject = function (index, elements, direction) {
  if (projectViewerState.projects.length === 0) {
    return;
  }

  const projectCount = projectViewerState.projects.length;
  const normalizedIndex = (index + projectCount) % projectCount;
  projectViewerState.activeProjectIndex = normalizedIndex;

  elements.mediaList.dataset.transitionDirection = direction || 'right';
  const project = projectViewerState.projects[normalizedIndex];
  elements.title.textContent = project.title;
  elements.category.textContent = project.displayCategory;
  renderProjectMediaStack(project, elements);
  syncActiveRail(elements);
};

const lockBackgroundScroll = function () {
  document.body.classList.add('project-viewer-open');
};

const unlockBackgroundScroll = function () {
  document.body.classList.remove('project-viewer-open');
};

const trapFocusInsideModal = function (event) {
  if (event.key !== 'Tab') {
    return;
  }

  const focusableElements = projectViewerState.focusableElements;
  if (focusableElements.length === 0) {
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
};

const setupProjectViewer = function (projects, certificates) {
  const elements = getProjectViewerElements();
  if (!elements.modal || !elements.dialog || !elements.closeButton || !elements.mediaList || !elements.rail) {
    return;
  }

  const closeProjectViewer = function () {
    if (!elements.modal.classList.contains('active')) {
      return;
    }

    teardownProject(elements.mediaList);
    elements.modal.classList.remove('active');
    elements.modal.setAttribute('aria-hidden', 'true');
    unlockBackgroundScroll();

    document.removeEventListener('keydown', handleModalKeydown);
    projectViewerState.focusableElements = [];

    if (projectViewerState.lastTrigger instanceof HTMLElement) {
      projectViewerState.lastTrigger.focus();
    }
  };

  const openProjectViewer = function (items, itemIndex, triggerElement) {
    projectViewerState.projects = items;
    projectViewerState.lastTrigger = triggerElement;
    buildProjectRail(elements);
    elements.modal.classList.add('active');
    elements.modal.setAttribute('aria-hidden', 'false');
    lockBackgroundScroll();

    setActiveProject(itemIndex, elements, 'right');

    projectViewerState.focusableElements = getFocusableElements(elements.dialog);
    elements.closeButton.focus();
    document.addEventListener('keydown', handleModalKeydown);
  };

  var handleModalKeydown = function () { };
  handleModalKeydown = function (event) {
    if (!elements.modal.classList.contains('active')) {
      return;
    }

    if (event.key === 'Escape') {
      closeProjectViewer();
      return;
    }

    if (event.key === 'ArrowLeft') {
      setActiveProject(projectViewerState.activeProjectIndex - 1, elements, 'left');
      return;
    }

    if (event.key === 'ArrowRight') {
      setActiveProject(projectViewerState.activeProjectIndex + 1, elements, 'right');
      return;
    }

    trapFocusInsideModal(event);
  };

  elements.closeButton.addEventListener('click', closeProjectViewer);
  elements.backdrop.addEventListener('click', closeProjectViewer);

  elements.previousButton.addEventListener('click', function () {
    setActiveProject(projectViewerState.activeProjectIndex - 1, elements, 'left');
  });

  elements.nextButton.addEventListener('click', function () {
    setActiveProject(projectViewerState.activeProjectIndex + 1, elements, 'right');
  });

  elements.dialog.addEventListener('pointerdown', function (event) {
    // Only handle touch pointers for swipe detection
    if (event.pointerType !== 'touch') {
      return;
    }
    // Record start positions
    projectViewerState.pointerStartX = event.clientX;
    projectViewerState.pointerStartY = event.clientY;
    // Reset scrolling flag
    projectViewerState.isScrolling = false;
    // Detect wheel scroll during gesture
    const wheelHandler = function () {
      projectViewerState.isScrolling = true;
    };
    elements.dialog.addEventListener('wheel', wheelHandler, { once: true, passive: true });
    // Prevent default for touch to avoid native scrolling interference

  });

  elements.dialog.addEventListener('pointerup', function (event) {
    if (projectViewerState.pointerStartX === null || projectViewerState.pointerStartY === null) {
      return;
    }

    const deltaX = event.clientX - projectViewerState.pointerStartX;
    const deltaY = event.clientY - projectViewerState.pointerStartY;

    const horizontalThreshold = 40;
    const verticalThreshold = 30;

    // Determine if horizontal movement is dominant enough for swipe
    const isDominantHorizontal = Math.abs(deltaX) > horizontalThreshold && Math.abs(deltaX) > Math.abs(deltaY);

    // If a wheel scroll was detected during the gesture, or vertical movement dominates, ignore swipe handling
    if (projectViewerState.isScrolling || !isDominantHorizontal) {
      // Reset start positions for next gesture
      projectViewerState.pointerStartX = null;
      projectViewerState.pointerStartY = null;
      return;
    }

    // Perform swipe navigation based on direction
    if (deltaX < 0) {
      setActiveProject(projectViewerState.activeProjectIndex + 1, elements, 'right');
    } else {
      setActiveProject(projectViewerState.activeProjectIndex - 1, elements, 'left');
    }

    // Reset start positions after handling
    projectViewerState.pointerStartX = null;
    projectViewerState.pointerStartY = null;
  });

  document.querySelectorAll('[data-project-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      const projectIndex = Number.parseInt(this.dataset.projectIndex, 10);
      if (Number.isNaN(projectIndex)) {
        return;
      }
      openProjectViewer(projects, projectIndex, this);
    });
  });

  document.querySelectorAll('[data-certificate-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      const certificateIndex = Number.parseInt(this.dataset.certificateIndex, 10);
      if (Number.isNaN(certificateIndex)) {
        return;
      }
      openProjectViewer(certificates, certificateIndex, this);
    });
  });

  elements.rail.addEventListener('keydown', function (event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    if (event.key === 'ArrowLeft') {
      setActiveProject(projectViewerState.activeProjectIndex - 1, elements, 'left');
    } else {
      setActiveProject(projectViewerState.activeProjectIndex + 1, elements, 'right');
    }

    const activeRailButton = elements.rail.querySelector(
      `[data-project-rail-index="${projectViewerState.activeProjectIndex}"]`
    );
    if (activeRailButton instanceof HTMLElement) {
      activeRailButton.focus();
    }
  });
};

const setupPageNavigation = function () {
  const navigationLinks = document.querySelectorAll('[data-nav-link]');
  const pages = document.querySelectorAll('[data-page]');

  navigationLinks.forEach((link) => {
    link.addEventListener('click', function () {
      pages.forEach((page, index) => {
        if (this.innerHTML.toLowerCase() === page.dataset.page) {
          page.classList.add('active');
          navigationLinks[index].classList.add('active');
          window.scrollTo(0, 0);
        } else {
          page.classList.remove('active');
          navigationLinks[index].classList.remove('active');
        }
      });
    });
  });
};

const initializePage = async function () {
  const data = await initializeDynamicSections();
  if (data && Array.isArray(data.projects) && Array.isArray(data.certificates)) {
    setupProjectViewer(data.projects, data.certificates);
  }
  setupSidebarToggle();
  setupTestimonialsModal();
  setupPortfolioFilter();
  setupPageNavigation();
};

initializePage();
