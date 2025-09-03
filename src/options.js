// Options page script for VT Keyboard Extension
// Handles whitelist management

const newDomainInput = document.getElementById('newDomain');
const addBtn = document.getElementById('addBtn');
const domainList = document.getElementById('domainList');

// Function to render the domain list
function renderDomains(whitelist) {
  domainList.innerHTML = '';
  whitelist.forEach(domain => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${domain}</span>
      <button class="remove-btn" data-domain="${domain}">Remove</button>
    `;
    domainList.appendChild(li);
  });
}

// Function to validate domain format
function isValidDomain(domain) {
  const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain) && !domain.includes(' ');
}

// Load and display whitelist on page load
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['whitelist'], (result) => {
    const whitelist = result.whitelist || ['docs.google.com', 'notion.so', 'etherpad.net'];
    renderDomains(whitelist);
  });
});

// Handle add button click
addBtn.addEventListener('click', () => {
  const newDomain = newDomainInput.value.trim();
  if (!newDomain) {
    alert('Please enter a domain.');
    return;
  }
  if (!isValidDomain(newDomain)) {
    alert('Please enter a valid domain (e.g., example.com).');
    return;
  }

  chrome.storage.sync.get(['whitelist'], (result) => {
    const whitelist = result.whitelist || ['docs.google.com', 'notion.so', 'etherpad.net'];
    if (whitelist.includes(newDomain)) {
      alert('Domain already in whitelist.');
      return;
    }
    whitelist.push(newDomain);
    chrome.storage.sync.set({ whitelist }, () => {
      renderDomains(whitelist);
      newDomainInput.value = '';
    });
  });
});

// Handle remove button clicks
domainList.addEventListener('click', (event) => {
  if (event.target.classList.contains('remove-btn')) {
    const domainToRemove = event.target.getAttribute('data-domain');
    chrome.storage.sync.get(['whitelist'], (result) => {
      const whitelist = result.whitelist || [];
      const updatedWhitelist = whitelist.filter(domain => domain !== domainToRemove);
      chrome.storage.sync.set({ whitelist: updatedWhitelist }, () => {
        renderDomains(updatedWhitelist);
      });
    });
  }
});