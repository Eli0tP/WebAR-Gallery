'use strict';

const galleryItems = [
  { id: 1, title: 'The Little Mermaid',   image: '../ar-app/assets/images/1.jpg' },
  { id: 2, title: 'Red Starfish',         image: '../ar-app/assets/images/2.jpg' },
  { id: 3, title: 'Treasure Chest',       image: '../ar-app/assets/images/3.jpg' },
  { id: 4, title: 'Shells & Starfish',    image: '../ar-app/assets/images/4.jpg' },
  { id: 5, title: 'Squirt & Sebastian',   image: '../ar-app/assets/images/5.jpg' },
  { id: 6, title: 'Pirate Ship',          image: '../ar-app/assets/images/6.jpg' },
  { id: 7, title: 'Nemo & Dory',          image: '../ar-app/assets/images/7.jpg' },
  { id: 8, title: 'SpongeBob SquarePants',image: '../ar-app/assets/images/8.jpg' },
  { id: 9, title: 'Pink Shell',           image: '../ar-app/assets/images/9.jpg' },
];

async function determineNetworkEndpoint() {
  try {
    const response  = await fetch('/api/ip', { cache: 'no-store' });
    const payload = await response.json();
    if (payload && payload.ip) return `https://${payload.ip}:${payload.port}`;
  } catch (error) {
    // API not reachable, fallback to window.location
  }
  const host = window.location.hostname;
  const port = window.location.port || '8443';
  return `${window.location.protocol}//${host}:${port}`;
}

function generateQRCode(targetUrl) {
  try {
    const canvasElement = document.getElementById('qrCanvas');
    canvasElement.innerHTML = '';
    new QRCode(canvasElement, {
      text: targetUrl,
      width: 240, height: 240,
      colorDark: '#000000', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H,
    });
    document.getElementById('connectionUrl').textContent = targetUrl;
  } catch (err) {
    document.getElementById('connectionUrl').textContent = "Error generating QR: " + err.message;
  }
}

async function initializeConnectionPortal() {
  const baseUrl = await determineNetworkEndpoint();
  const arExperienceUrl = `${baseUrl}/ar-app/`;
  generateQRCode(arExperienceUrl);
}

document.getElementById('btnCopy').addEventListener('click', () => {
  const urlText = document.getElementById('connectionUrl').textContent;
  if (urlText && urlText.length > 5) {
    navigator.clipboard.writeText(urlText).then(() => {
      document.getElementById('iconCopy').textContent = 'Copied!';
      setTimeout(() => { document.getElementById('iconCopy').textContent = 'Copy'; }, 2000);
    });
  }
});

function populateGallery() {
  const gridContainer = document.getElementById('exhibitGrid');
  galleryItems.forEach(item => {
    const cardElement = document.createElement('div');
    cardElement.className = 'exhibit-card';
    cardElement.innerHTML = `
      <div class="exhibit-media">
        <img class="exhibit-img" src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'" />
        <div class="exhibit-badge">Exhibit ${item.id}</div>
        <div class="exhibit-action">Interactive AR</div>
      </div>
      <div class="exhibit-info">
        <div class="exhibit-id">Artwork #${item.id}</div>
        <div class="exhibit-title">${item.title}</div>
      </div>`;
    gridContainer.appendChild(cardElement);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  populateGallery();
  initializeConnectionPortal();
});
