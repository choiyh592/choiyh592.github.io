// Global variables
let allPublications = [];
let allNews = [];
let allProjects = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Load data from JSON
  loadData();
  
  // Initialize tab navigation
  initTabs();
  
  // Initialize animation delays for sections
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    section.style.animationDelay = `${index * 0.1}s`;
  });
});

// Setup tab navigation logic (with ARIA state + URL-hash routing)
const VALID_TABS = ['home', 'research', 'experience'];

// The third tab was renamed 'projects' -> 'experience'. Keep any previously
// shared or bookmarked #projects link pointing at the right tab.
const TAB_ALIASES = { projects: 'experience' };

// Activate a tab by its name (e.g. 'home'). Visual behaviour is unchanged:
// the .active class still drives display; this only adds ARIA sync, hash
// routing and the existing mobile scroll.
function activateTab(tabName, opts = {}) {
  const { scroll = false, updateHash = true } = opts;
  tabName = TAB_ALIASES[tabName] || tabName;
  if (!VALID_TABS.includes(tabName)) {
    tabName = 'home';
  }
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const targetTabId = tabName + '-tab';

  tabButtons.forEach(btn => {
    const isActive = btn.getAttribute('data-tab') === tabName;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  tabContents.forEach(content => {
    content.classList.toggle('active', content.id === targetTabId);
  });

  // Keep the URL in sync so tabs are deep-linkable and survive refresh.
  if (updateHash && ('#' + tabName) !== window.location.hash) {
    history.pushState({ tab: tabName }, '', '#' + tabName);
  }

  if (scroll && window.innerWidth <= 768) {
    document.querySelector('.tabs-nav').scrollIntoView({ behavior: 'smooth' });
  }
}

function initTabs() {
  const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));

  tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      if (button.classList.contains('active')) {
        return;
      }
      activateTab(button.getAttribute('data-tab'), { scroll: true });
    });

    // Keyboard support for the tablist (Left/Right/Home/End arrows).
    button.addEventListener('keydown', (e) => {
      let newIndex = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        newIndex = (index + 1) % tabButtons.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        newIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      } else if (e.key === 'Home') {
        newIndex = 0;
      } else if (e.key === 'End') {
        newIndex = tabButtons.length - 1;
      }
      if (newIndex !== null) {
        e.preventDefault();
        const nextBtn = tabButtons[newIndex];
        activateTab(nextBtn.getAttribute('data-tab'), { scroll: true });
        nextBtn.focus();
      }
    });
  });

  // Respond to back/forward navigation.
  window.addEventListener('popstate', () => {
    const tab = (window.location.hash || '').replace('#', '');
    activateTab(tab || 'home', { updateHash: false });
  });

  // Honour an incoming hash (deep link / refresh) without pushing a new entry.
  const rawTab = (window.location.hash || '').replace('#', '');
  const initialTab = TAB_ALIASES[rawTab] || rawTab;
  if (VALID_TABS.includes(initialTab) && initialTab !== 'home') {
    activateTab(initialTab, { updateHash: false });
  }
}

// Load data from publications.json
function loadData() {
  fetch('publications.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      allPublications = data.publications || [];
      allNews = data.news || [];
      allProjects = data.projects || [];
      
      renderHomeTab();
      renderResearchTab();
      renderExperienceTab();
    })
    .catch(error => {
      console.error('Error loading data:', error);
      displayFallback();
    });
}

// Fallback displays
function displayFallback() {
  const selectedContainer = document.getElementById('selected-publications-container');
  if (selectedContainer) selectedContainer.innerHTML = 'Error loading content.';
  const peerReviewedContainer = document.getElementById('peer-reviewed-container');
  if (peerReviewedContainer) peerReviewedContainer.innerHTML = 'Error loading content.';
}

// Renders the Home Tab dynamic components
function renderHomeTab() {
  // 1. Render News Feed
  const newsContainer = document.getElementById('news-container');
  if (newsContainer) {
    newsContainer.innerHTML = '';
    allNews.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${item.date}</strong>: ${item.content}`;
      newsContainer.appendChild(li);
    });
  }

  // 2. Render Selected Work (Top 1-2 publications with selected: 1)
  const selectedContainer = document.getElementById('selected-publications-container');
  if (selectedContainer) {
    selectedContainer.innerHTML = '';
    const selectedPubs = allPublications.filter(pub => pub.selected === 1).slice(0, 2);
    if (selectedPubs.length === 0) {
      selectedContainer.innerHTML = '<p>No selected publications to display.</p>';
    } else {
      selectedPubs.forEach(pub => {
        const element = createItemElement(pub, 'publication');
        selectedContainer.appendChild(element);
      });
    }
  }
}

// Renders the Research Tab components
function renderResearchTab() {
  const categories = {
    'paper': document.getElementById('peer-reviewed-container'),
    'patent': document.getElementById('patents-container'),
    'poster': document.getElementById('presentations-container')
  };

  // Clear all containers
  for (let key in categories) {
    if (categories[key]) categories[key].innerHTML = '';
  }

  // Group and render publications
  allPublications.forEach(pub => {
    const type = pub.type || 'paper';
    const container = categories[type];
    if (container) {
      const element = createItemElement(pub, type);
      container.appendChild(element);
    }
  });

  // Display empty messages if any category is empty
  for (let key in categories) {
    const container = categories[key];
    if (container && container.children.length === 0) {
      container.innerHTML = `<p class="text-muted">No ${key === 'paper' ? 'publications' : key + 's'} to display.</p>`;
    }
  }
}

// Renders the Experience Tab dynamic components
// (the Experience section itself is static markup in index.html)
function renderExperienceTab() {
  const containers = {
    'project': document.getElementById('projects-container'),
    'competition': document.getElementById('competitions-container')
  };

  // Clear all containers
  for (let key in containers) {
    if (containers[key]) containers[key].innerHTML = '';
  }

  // Group and render projects / competitions
  allProjects.forEach(proj => {
    const type = proj.type || 'project';
    const container = containers[type];
    if (container) {
      const element = createItemElement(proj, 'project');
      container.appendChild(element);
    }
  });

  // Certifications live in publications.json alongside papers/posters
  const certContainer = document.getElementById('certifications-container');
  if (certContainer) {
    certContainer.innerHTML = '';
    allPublications
      .filter(pub => pub.type === 'certification')
      .forEach(cert => certContainer.appendChild(createItemElement(cert, 'certification')));
  }

  // Display empty messages if any container is empty
  [...Object.values(containers), certContainer].forEach(container => {
    if (container && container.children.length === 0) {
      container.innerHTML = '<p class="text-muted">No items to display.</p>';
    }
  });
}

// Creates an item element (unified for publications, patents, posters, certs, projects)
function createItemElement(item, displayType) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'publication-item';

  // Create thumbnail (if present)
  if (item.thumbnail) {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'pub-thumbnail';
    thumbnail.onclick = () => openModal(item.thumbnail);
    
    const thumbnailImg = document.createElement('img');
    thumbnailImg.src = item.thumbnail;
    thumbnailImg.alt = `${item.title} thumbnail`;
    thumbnailImg.loading = 'lazy';
    thumbnail.appendChild(thumbnailImg);
    itemDiv.appendChild(thumbnail);
  }

  // Create content container
  const content = document.createElement('div');
  content.className = 'pub-content';

  // Title
  const title = document.createElement('div');
  title.className = 'pub-title';
  title.textContent = item.title;
  content.appendChild(title);

  // Middle details (Authors for papers, Description for projects)
  if (displayType === 'project') {
    const description = document.createElement('div');
    description.className = 'pub-authors';
    description.textContent = item.description || '';
    content.appendChild(description);
  } else {
    // Render authors
    if (item.authors && item.authors.length > 0) {
      const authors = document.createElement('div');
      authors.className = 'pub-authors';
      
      let authorsHTML = '';
      item.authors.forEach((author, index) => {
        if (author.includes('Yoonhyeok Choi')) { // Highlight portfolio owner
          authorsHTML += `<span class="highlight-name">${author}</span>`;
        } else {
          authorsHTML += author;
        }
        if (index < item.authors.length - 1) {
          authorsHTML += ', ';
        }
      });
      authors.innerHTML = authorsHTML;
      content.appendChild(authors);
    }
  }

  // Venue / Organization / Date
  if (item.venue) {
    const venueContainer = document.createElement('div');
    venueContainer.className = 'pub-venue-container';
    
    const venue = document.createElement('div');
    venue.className = 'pub-venue';
    venue.textContent = item.venue;
    venueContainer.appendChild(venue);
    
    // Award Badge (if exists)
    if (item.award) {
      const award = document.createElement('div');
      award.className = 'pub-award';
      award.textContent = item.award;
      venueContainer.appendChild(award);
    }
    
    content.appendChild(venueContainer);
  }

  // Links
  if (item.links) {
    const links = document.createElement('div');
    links.className = 'pub-links';
    
    if (item.links.pdf) {
      const pdfLink = document.createElement('a');
      pdfLink.href = item.links.pdf;
      pdfLink.textContent = '[PDF]';
      links.appendChild(pdfLink);
    }
    if (item.links.doi) {
      const doiLink = document.createElement('a');
      doiLink.href = item.links.doi;
      doiLink.textContent = '[DOI]';
      links.appendChild(doiLink);
    }
    if (item.links.code) {
      const codeLink = document.createElement('a');
      codeLink.href = item.links.code;
      codeLink.textContent = '[Code]';
      links.appendChild(codeLink);
    }
    if (item.links.project) {
      const projectLink = document.createElement('a');
      projectLink.href = item.links.project;
      projectLink.textContent = '[Project Page]';
      links.appendChild(projectLink);
    }
    if (item.links.patent) {
      const patentLink = document.createElement('a');
      patentLink.href = item.links.patent;
      patentLink.textContent = '[Patent]';
      links.appendChild(patentLink);
    }
    if (item.links.credential) {
      const credLink = document.createElement('a');
      credLink.href = item.links.credential;
      credLink.textContent = '[View Credential]';
      links.appendChild(credLink);
    }
    
    // Open external resources in a new tab safely (behaviour only, no visual change).
    links.querySelectorAll('a').forEach(a => {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });

    if (links.children.length > 0) {
      content.appendChild(links);
    }
  }

  itemDiv.appendChild(content);
  return itemDiv;
}

// Modal functionality for viewing original images
let modalLastFocused = null;

function openModal(imageSrc) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  modalLastFocused = document.activeElement;
  modal.style.display = "block";
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  modalImg.src = imageSrc;
  modal.setAttribute('aria-hidden', 'false');
  // Move focus to the close control for keyboard users.
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
  // Restore focus to the element that opened the modal.
  if (modalLastFocused && typeof modalLastFocused.focus === 'function') {
    modalLastFocused.focus();
  }
  modalLastFocused = null;
}

// Close modal when clicking outside the image
window.onclick = function(event) {
  const modal = document.getElementById('imageModal');
  if (event.target == modal) {
    closeModal();
  }
}

// Keyboard support: Escape closes the modal; Enter/Space activate the close control.
document.addEventListener('keydown', function(event) {
  const modal = document.getElementById('imageModal');
  if (!modal || modal.style.display !== 'block') return;
  if (event.key === 'Escape') {
    closeModal();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        closeModal();
      }
    });
  }
});


