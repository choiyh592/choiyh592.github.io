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

// Setup tab navigation logic
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTabId = button.getAttribute('data-tab') + '-tab';
      
      // Update button active state
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update content active state
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetTabId) {
          content.classList.add('active');
        }
      });
      
      // Scroll to top of content area on mobile
      if (window.innerWidth <= 768) {
        document.querySelector('.tabs-nav').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
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
      console.log("Data loaded successfully:", data);
      allPublications = data.publications || [];
      allNews = data.news || [];
      allProjects = data.projects || [];
      
      renderHomeTab();
      renderResearchTab();
      renderProjectsTab();
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
    'poster': document.getElementById('presentations-container'),
    'certification': document.getElementById('certifications-container')
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

// Renders the Projects Tab components
function renderProjectsTab() {
  const containers = {
    'project': document.getElementById('projects-container'),
    'experiment': document.getElementById('dl-experiments-container'),
    'open-source': document.getElementById('open-source-container')
  };

  // Clear all containers
  for (let key in containers) {
    if (containers[key]) containers[key].innerHTML = '';
  }

  // Group and render projects
  allProjects.forEach(proj => {
    const type = proj.type || 'project';
    const container = containers[type];
    if (container) {
      const element = createItemElement(proj, 'project');
      container.appendChild(element);
    }
  });

  // Display empty messages if any container is empty
  for (let key in containers) {
    const container = containers[key];
    if (container && container.children.length === 0) {
      container.innerHTML = '<p class="text-muted">No items to display.</p>';
    }
  }
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
        if (author.includes('Author 3')) { // Highlight portfolio owner
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
    
    if (links.children.length > 0) {
      content.appendChild(links);
    }
  }

  itemDiv.appendChild(content);
  return itemDiv;
}

// Modal functionality for viewing original images
function openModal(imageSrc) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  modal.style.display = "block";
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  modalImg.src = imageSrc;
}

function closeModal() {
  const modal = document.getElementById('imageModal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

// Close modal when clicking outside the image
window.onclick = function(event) {
  const modal = document.getElementById('imageModal');
  if (event.target == modal) {
    closeModal();
  }
}
