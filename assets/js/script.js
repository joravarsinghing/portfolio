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
  const modalDate = document.querySelector('[data-modal-date]');
  const modalText = document.querySelector('[data-modal-text]');

  if (!modalContainer || !modalCloseBtn || !overlay || !modalImg || !modalTitle || !modalText) {
    return;
  }

  let typeTimeout = null;

  const testimonialsModalFunc = function () {
    modalContainer.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('modal-open');
    
    // Clear typing timeout if modal is closed
    if (!modalContainer.classList.contains('active') && typeTimeout) {
      clearTimeout(typeTimeout);
      typeTimeout = null;
    }
  };

  const typeTerminalText = function (element, htmlContent) {
    if (typeTimeout) clearTimeout(typeTimeout);
    element.innerHTML = '';
    
    // Create terminal cursor
    const cursor = document.createElement('span');
    cursor.className = 'terminal-cursor';
    
    let index = 0;
    let currentHTML = '';
    
    const type = () => {
      if (index < htmlContent.length) {
        if (htmlContent.charAt(index) === '<') {
          const closingBracket = htmlContent.indexOf('>', index);
          if (closingBracket !== -1) {
            currentHTML += htmlContent.substring(index, closingBracket + 1);
            index = closingBracket + 1;
          } else {
            currentHTML += htmlContent.charAt(index);
            index++;
          }
        } else {
          currentHTML += htmlContent.charAt(index);
          index++;
        }
        element.innerHTML = currentHTML;
        element.appendChild(cursor);
        
        // Very fast typing for readability
        const delay = htmlContent.length > 500 ? 1 : 4;
        typeTimeout = setTimeout(type, delay);
      } else {
        element.innerHTML = htmlContent;
        element.appendChild(cursor);
      }
    };
    
    type();
  };

  testimonialsItems.forEach((item) => {
    item.addEventListener('click', function () {
      modalImg.src = this.querySelector('[data-testimonials-avatar]').src;
      modalImg.alt = this.querySelector('[data-testimonials-avatar]').alt;
      modalTitle.innerHTML = this.querySelector('[data-testimonials-title]').innerHTML;
      
      const dateEl = this.querySelector('[data-testimonials-date]');
      if (dateEl && modalDate) {
        modalDate.setAttribute('datetime', dateEl.getAttribute('datetime') || '');
        modalDate.innerHTML = dateEl.innerHTML;
      }
      
      const fullTextHTML = this.querySelector('[data-testimonials-text]').innerHTML;
      testimonialsModalFunc();
      
      // Start terminal typing decryption readout
      typeTerminalText(modalText, fullTextHTML);
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
    mediaList: document.querySelector('[data-project-media-list]'),
    externalContainer: document.querySelector('[data-project-viewer-external-container]'),
    externalBtn: document.querySelector('[data-project-viewer-external-btn]')
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
  elements.mediaList.classList.remove('single-media', 'multi-media');
  if (!Array.isArray(mediaList) || mediaList.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'project-viewer-media-caption';
    emptyState.textContent = 'Media not available for this project yet.';
    elements.mediaList.replaceChildren(emptyState);
    elements.mediaList.scrollTop = 0;
    return;
  }


  elements.mediaList.classList.toggle('single-media', mediaList.length === 1);
  elements.mediaList.classList.toggle('multi-media', mediaList.length > 1);

  mediaList.forEach((mediaItem) => {
    const normalizedType = mediaItem && mediaItem.type === 'video' ? 'video' : 'image';
    const mediaSource = mediaItem && typeof mediaItem.src === 'string' ? mediaItem.src : '';
    if (!mediaSource) {
      const missingCard = document.createElement('div');
      missingCard.className = `project-viewer-media-card project-viewer-media-card--${normalizedType}`;
      missingCard.appendChild(createMediaErrorMessage('Media source is missing for this project item.'));
      mediaFragment.appendChild(missingCard);
      return;
    }

    const card = document.createElement('div');
    card.className = `project-viewer-media-card project-viewer-media-card--${normalizedType}`;

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

  // Handle external link/button
  if (elements.externalContainer && elements.externalBtn) {
    if (project.showExternalLink && project.externalLinkUrl) {
      elements.externalContainer.style.display = 'flex';
      elements.externalBtn.href = project.externalLinkUrl;
      const btnTextSpan = elements.externalBtn.querySelector('span');
      if (btnTextSpan) {
        btnTextSpan.textContent = project.externalLinkText || 'View Project';
      }
    } else {
      elements.externalContainer.style.display = 'none';
    }
  }

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

  document.querySelectorAll('[data-open-project]').forEach((trigger) => {
    trigger.addEventListener('click', function () {
      const projectId = this.dataset.openProject;
      const index = projects.findIndex((p) => p.id === projectId);
      const portfolioLink = Array.from(document.querySelectorAll('[data-nav-link]'))
        .find((el) => el.textContent.trim().toLowerCase() === 'portfolio');
      if (index === -1) {
        if (portfolioLink) portfolioLink.click();
        return;
      }
      if (portfolioLink) portfolioLink.click();
      openProjectViewer(projects, index, this);
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

const setupSkillIconTooltips = function () {
  const skillIcons = document.querySelectorAll('.skill .skill-icons > .skill-icon');

  if (skillIcons.length === 0) {
    return;
  }

  const closeSkillTooltips = function (exceptItem) {
    document.querySelectorAll('.skill-icon-item.active').forEach((item) => {
      if (item !== exceptItem) {
        item.classList.remove('active');
      }
    });
  };

  const alignSkillTooltip = function (item) {
    const tooltip = item.querySelector('.skill-icon-tooltip');

    if (!tooltip) {
      return;
    }

    item.classList.remove('align-left', 'align-right');

    const itemRect = item.getBoundingClientRect();
    const tooltipWidth = Math.min(tooltip.scrollWidth, window.innerWidth - 32);
    const centeredLeft = itemRect.left + (itemRect.width / 2) - (tooltipWidth / 2);
    const viewportGutter = 16;

    if (centeredLeft < viewportGutter) {
      item.classList.add('align-left');
    } else if (centeredLeft + tooltipWidth > window.innerWidth - viewportGutter) {
      item.classList.add('align-right');
    }
  };

  skillIcons.forEach((icon) => {
    const skillName = icon.getAttribute('title') || icon.getAttribute('alt');

    if (!skillName || icon.parentElement.classList.contains('skill-icon-item')) {
      return;
    }

    const item = document.createElement('span');
    item.className = 'skill-icon-item';
    item.dataset.skillName = skillName;
    item.tabIndex = 0;
    item.setAttribute('role', 'listitem');
    item.setAttribute('aria-label', skillName);

    const tooltip = document.createElement('span');
    tooltip.className = 'skill-icon-tooltip';
    tooltip.setAttribute('aria-hidden', 'true');
    tooltip.textContent = skillName;

    icon.removeAttribute('title');
    icon.parentNode.insertBefore(item, icon);
    item.appendChild(icon);
    item.appendChild(tooltip);

    item.addEventListener('click', function (event) {
      event.stopPropagation();
      const willOpen = !this.classList.contains('active');
      alignSkillTooltip(this);
      closeSkillTooltips(this);
      this.classList.toggle('active', willOpen);
    });

    item.addEventListener('focusin', function () {
      alignSkillTooltip(this);
      closeSkillTooltips(this);
    });

    item.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      const willOpen = !this.classList.contains('active');
      alignSkillTooltip(this);
      closeSkillTooltips(this);
      this.classList.toggle('active', willOpen);
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.skill-icon-item')) {
      closeSkillTooltips();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSkillTooltips();
    }
  });
};
const setupHeroNav = function () {
  document.querySelectorAll('[data-goto-page]').forEach(btn => {
    btn.addEventListener('click', function () {
      const target = this.dataset.gotoPage.toLowerCase();
      const navLink = Array.from(document.querySelectorAll('[data-nav-link]'))
        .find(el => el.textContent.trim().toLowerCase() === target);
      if (navLink) navLink.click();
    });
  });
};

const setupHeroTypewriter = function () {
  const headline = document.querySelector('.about-hero-headline');
  if (!headline) return;
  
  const originalText = headline.textContent.trim();
  headline.textContent = '';
  
  const cursor = document.createElement('span');
  cursor.className = 'cyber-cursor';
  cursor.textContent = '_';
  headline.appendChild(cursor);
  
  let i = 0;
  const type = () => {
    if (i < originalText.length) {
      const charNode = document.createTextNode(originalText.charAt(i));
      headline.insertBefore(charNode, cursor);
      i++;
      setTimeout(type, 25 + Math.random() * 15); // Fast, organic typewriter speed
    } else {
      headline.classList.add('typewriter-done');
    }
  };
  
  setTimeout(type, 400); // Small initial delay
};

const setupResumeAccordions = function () {
  const timelines = document.querySelectorAll('.timeline');
  timelines.forEach((timeline) => {
    const titleWrapper = timeline.querySelector('.title-wrapper');
    if (!titleWrapper) return;
    
    // Collapse by default
    timeline.classList.remove('expanded');
    
    titleWrapper.addEventListener('click', function () {
      timeline.classList.toggle('expanded');
    });
  });
};

const setupTopTelemetry = function () {
  const telemetryTime = document.getElementById('telemetry-time');
  const telemetryTimeStatus = document.getElementById('telemetry-time-status');
  const telemetryDayStatus = document.getElementById('telemetry-day-status');

  if (!telemetryTime && !telemetryTimeStatus && !telemetryDayStatus) return;

  const updateTime = () => {
    try {
      const now = new Date();

      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dubai',
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });

      const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const parts = dateFormatter.formatToParts(now);

      const getValue = (type) => parts.find(p => p.type === type)?.value || '';

      const weekday = getValue('weekday').toUpperCase();
      const day = getValue('day');
      const month = getValue('month').toUpperCase();

      const formattedDay = `${weekday}::${day}_${month}`;
      const formattedTime = timeFormatter.format(now);

      if (telemetryDayStatus) {
        telemetryDayStatus.textContent = formattedDay;
      }

      if (telemetryTime) {
        telemetryTime.textContent = `${formattedDay} | ${formattedTime}`;
      }

      if (telemetryTimeStatus) {
        telemetryTimeStatus.textContent = formattedTime;
      }
    } catch (e) {
      const now = new Date();
      const fallbackTime = now.toISOString().replace('T', ' ').slice(0, 19);

      if (telemetryDayStatus) telemetryDayStatus.textContent = 'DAY::DATE';
      if (telemetryTime) telemetryTime.textContent = fallbackTime;
      if (telemetryTimeStatus) telemetryTimeStatus.textContent = fallbackTime;
    }
  };

  setInterval(updateTime, 1000);
  updateTime();
};

const initializePage = async function () {
  const data = await initializeDynamicSections();
  if (data && Array.isArray(data.projects) && Array.isArray(data.certificates)) {
    setupProjectViewer(data.projects, data.certificates);
  }
  setupSidebarToggle();
  setupTestimonialsModal();
  setupPortfolioFilter();
  setupSkillIconTooltips();
  setupPageNavigation();
  setupHeroNav();
  setupHeroTypewriter();
  setupResumeAccordions();
  setupTopTelemetry();
};

initializePage();

// Background Circuit Canvas Simulation
(function(){
  const canvas=document.getElementById('c');
  if(!canvas)return;
  const ctx=canvas.getContext('2d'),pc=document.getElementById('pc'),G=40;
  let W=canvas.width=window.innerWidth,H=canvas.height=window.innerHeight;
  let cols=Math.ceil(W/G)+1,rows=Math.ceil(H/G)+1,isMobile=W<768,maxP=isMobile?20:60;
  let pulses=[],ripples=[],staticTraces=[];
  const D=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]],C=['#00f0ff','#fcee09'],GL=['rgba(0,240,255,.22)','rgba(252,238,9,.22)'];
  const getNext=(cx,cy,ld)=>{
    for(let o of[-1,0,1].sort(()=>Math.random()-.5)){let i=(ld+o+8)%8,d=D[i],tx=cx+d[0],ty=cy+d[1];if(tx>=0&&tx<cols&&ty>=0&&ty<rows)return[tx,ty,i]}
    for(let i of[...Array(8).keys()].sort(()=>Math.random()-.5)){if(i===(ld+4)%8)continue;let d=D[i],tx=cx+d[0],ty=cy+d[1];if(tx>=0&&tx<cols&&ty>=0&&ty<rows)return[tx,ty,i]}
    return null;
  };
  const createPulse=(x,y,di)=>{
    const cyan=Math.random()<.8,r=getNext(x,y,di);if(!r)return null;
    return{cx:x,cy:y,tx:r[0],ty:r[1],t:0,dt:(2.2+Math.random()*1.5)/Math.hypot((r[0]-x)*G,(r[1]-y)*G),di:r[2],color:cyan?C[0]:C[1],glow:cyan?GL[0]:GL[1],h:[],mh:4+Math.floor(Math.random()*4),l:4+Math.floor(Math.random()*8)};
  };
  const spawnPulse=()=>{
    const x=Math.floor(Math.random()*cols),y=Math.floor(Math.random()*rows),p=createPulse(x,y,Math.floor(Math.random()*8));
    if(p)pulses.push(p);
  };
  const init=()=>{
    W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;
    cols=Math.ceil(W/G)+1;rows=Math.ceil(H/G)+1;isMobile=W<768;maxP=isMobile?20:60;
    pulses=[];ripples=[];staticTraces=[];
    for(let i=0;i<(isMobile?12:32);i++){
      let cx=Math.floor(Math.random()*cols),cy=Math.floor(Math.random()*rows),path=[{x:cx*G,y:cy*G}],lastDir=Math.floor(Math.random()*8);
      for(let j=0;j<3+Math.floor(Math.random()*5);j++){
        const res=getNext(cx,cy,lastDir);if(!res)break;
        cx=res[0];cy=res[1];lastDir=res[2];path.push({x:cx*G,y:cy*G});
      }
      staticTraces.push(path);
    }
    for(let i=0;i<(isMobile?6:20);i++)spawnPulse();
  };
  window.addEventListener('resize',init);
  const handleInteract=(cx,cy)=>{
    const gx=Math.round(cx/G),gy=Math.round(cy/G);
    ripples.push({x:gx*G,y:gy*G,r:2,maxR:isMobile?35:70,alpha:1});
    for(let i=0;i<(3+Math.floor(Math.random()*2));i++){
      const p=createPulse(gx,gy,Math.floor(Math.random()*8));if(p)pulses.push(p);
    }
    while(pulses.length>maxP)pulses.shift();
  };
  window.addEventListener('mousedown',e=>{if(e.button===0)handleInteract(e.clientX,e.clientY)});
  window.addEventListener('touchstart',e=>{const t=e.touches[0];if(t)handleInteract(t.clientX,t.clientY)},{passive:true});
  const updateAndDraw=()=>{
    ctx.fillStyle='#030508';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(0,240,255,0.05)';
    for(let c=0;c<cols;c++)for(let r=0;r<rows;r++)ctx.fillRect(c*G-1,r*G-1,2,2);
    ctx.lineWidth=1;ctx.strokeStyle='rgba(0,240,255,0.03)';
    for(let p of staticTraces){
      ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);for(let i=1;i<p.length;i++)ctx.lineTo(p[i].x,p[i].y);ctx.stroke();
    }
    for(let i=ripples.length-1;i>=0;i--){
      const r=ripples[i];ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,Math.PI*2);
      ctx.strokeStyle='rgba(0,240,255,'+r.alpha+')';ctx.lineWidth=1.5;ctx.stroke();
      r.r+=1.8;r.alpha-=0.025;if(r.alpha<=0)ripples.splice(i,1);
    }
    if(pc)pc.textContent=pulses.length;
    for(let i=pulses.length-1;i>=0;i--){
      const p=pulses[i];p.t+=p.dt;
      const x1=p.cx*G,y1=p.cy*G,x2=p.tx*G,y2=p.ty*G,px=x1+(x2-x1)*p.t,py=y1+(y2-y1)*p.t;
      if(p.t>=1){
        p.h.push({x:x2,y:y2});if(p.h.length>p.mh)p.h.shift();
        p.cx=p.tx;p.cy=p.ty;p.t=0;p.l--;if(p.l<=0){pulses.splice(i,1);continue;}
        const res=getNext(p.cx,p.cy,p.di);
        if(res){
          p.tx=res[0];p.ty=res[1];p.di=res[2];
          p.dt=(2.2+Math.random()*1.5)/Math.hypot((res[0]-p.cx)*G,(res[1]-p.cy)*G);
        }else{pulses.splice(i,1);continue;}
      }
      ctx.beginPath();
      if(p.h.length>0){
        ctx.moveTo(p.h[0].x,p.h[0].y);for(let j=1;j<p.h.length;j++)ctx.lineTo(p.h[j].x,p.h[j].y);ctx.lineTo(px,py);
      }else{ctx.moveTo(x1,y1);ctx.lineTo(px,py);}
      ctx.strokeStyle=p.glow;ctx.lineWidth=4;ctx.stroke();
      ctx.strokeStyle=p.color;ctx.lineWidth=1.5;ctx.stroke();
      ctx.beginPath();ctx.arc(px,py,2.5,0,Math.PI*2);ctx.fillStyle=p.color;ctx.fill();
    }
    if(pulses.length<maxP/3&&Math.random()<0.06)spawnPulse();
    requestAnimationFrame(updateAndDraw);
  };
  init();updateAndDraw();
})();
