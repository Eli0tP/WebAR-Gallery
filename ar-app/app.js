/**
 * Application Core - Augmented Reality Module
 * Handles target detection, media overlay, and UI feedback.
 */
'use strict';

const artworkData = [
  { id: 1, title: 'The Little Mermaid',   media: 'assets/videos/1.mp4' },
  { id: 2, title: 'Red Starfish',         media: 'assets/videos/2.mp4' },
  { id: 3, title: 'Treasure Chest',       media: 'assets/videos/3.mp4' },
  { id: 4, title: 'Shells & Starfish',    media: 'assets/videos/4.mp4' },
  { id: 5, title: 'Squirt & Sebastian',   media: 'assets/videos/5.mp4' },
  { id: 6, title: 'Pirate Ship',          media: 'assets/videos/6.mp4' },
  { id: 7, title: 'Nemo & Dory',          media: 'assets/videos/7.mp4' },
  { id: 8, title: 'SpongeBob SquarePants',media: 'assets/videos/8.mp4' },
  { id: 9, title: 'Pink Shell',           media: 'assets/videos/9.mp4' },
];

/* ── DOM Elements ── */
const getEl = id => document.getElementById(id);
const introView       = getEl('intro-view');
const loadingScreen   = getEl('loading-screen');
const loadingMessage  = getEl('loading-message');
const loadingDetail   = getEl('loading-detail');
const cachedNotice    = getEl('cached-notice');
const progressBarFill = getEl('progress-fill');
const overlayHud      = getEl('overlay-hud');
const indicatorDot    = getEl('indicator-dot');
const statusText      = getEl('status-text');
const instructionText = getEl('instruction-text');
const sceneElement    = getEl('ar-scene');
const sceneWrapper    = getEl('ar-wrapper');
const mediaOverlay    = getEl('media-overlay');
const arPlayer        = getEl('ar-player');
const mediaHeading    = getEl('media-heading');
const targetFrame     = document.querySelector('.target-frame');

/* ── Application State ── */
let trackingEngine    = null;
let isSessionActive   = false;
let activeTargetIndex = -1;
let soundEnabled      = false;
let isCooldown        = false;

/* HUD Elements */
const frameContainer  = getEl('frame-container');
const signalLevel     = getEl('signal-level');
const userTip         = getEl('user-tip');
let tipTimer          = null;
let signalTimer       = null;

const SCAN_TIPS = [
  "Ensure the area is well-lit for better tracking.",
  "Avoid strong reflections on the artwork.",
  "Move closer so the artwork fills the screen.",
  "Hold your device steady while scanning.",
  "Step back slightly if detection is struggling."
];

/* ── Service Worker Registration ── */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(registration => {
    console.log('ServiceWorker registered with scope:', registration.scope);
  }).catch(error => {
    console.warn('ServiceWorker registration failed:', error);
  });
}

/* ── Initialization ── */
getEl('init-btn').addEventListener('click', initializeSession);

async function initializeSession() {
  introView.classList.add('hidden');
  loadingScreen.classList.remove('hidden');

  const isCached = await checkCacheStatus();
  if (isCached) {
    cachedNotice.style.display = 'block';
    loadingDetail.textContent   = 'Loading resources from local cache...';
  } else {
    loadingDetail.textContent = 'Initial load may take up to 60 seconds. Please wait.';
  }

  updateProgress(10, 'Preparing 3D environment...');
  sceneWrapper.classList.remove('visibility-hidden');
  sceneWrapper.classList.add('visibility-visible');

  updateProgress(25, 'Initializing tracking engine...');
  await awaitSceneLoad();

  updateProgress(45, 'Downloading tracking data...');

  try {
    trackingEngine = sceneElement.systems['mindar-image-system'];
    if (!trackingEngine) throw new Error('Tracking engine initialization failed');

    const progressAnimation = animateLoadBar(45, 95, isCached ? 6000 : 45000);
    const startTime = Date.now();

    await trackingEngine.start();

    clearInterval(progressAnimation);
    console.log(`Engine ready in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    updateProgress(100, 'System Ready!');
    await delay(400);

    loadingScreen.classList.add('hidden');
    overlayHud.classList.remove('hidden');
    isSessionActive = true;

    bindTargetEvents();
    beginHudRoutines();
    displayNotification('Point your camera at an artwork to begin.');

  } catch (err) {
    console.error('Startup Error:', err);
    triggerErrorState(err.message);
  }
}

async function checkCacheStatus() {
  try {
    const cacheStorage = await caches.open('iapt-ar-v1');
    const response = await cacheStorage.match('/ar-app/assets/targets.mind');
    return !!response;
  } catch { return false; }
}

function awaitSceneLoad() {
  return new Promise(resolve => {
    if (sceneElement.hasLoaded) { resolve(); return; }
    sceneElement.addEventListener('loaded', resolve, { once: true });
    setTimeout(resolve, 8000); 
  });
}

/* ── Target Detection Logic ── */
function bindTargetEvents() {
  for (let i = 0; i < artworkData.length; i++) {
    const targetEntity = getEl(`target-${i}`);
    if (!targetEntity) continue;
    
    targetEntity.addEventListener('targetFound', () => handleDetection(i));
    targetEntity.addEventListener('targetLost',  () => handleLoss(i));
  }
}

function handleDetection(index) {
  if (isCooldown) return;
  activeTargetIndex = index;
  const currentArt = artworkData[index];

  indicatorDot.classList.add('active');
  statusText.textContent = 'Artwork Detected';
  instructionText.textContent = currentArt.title;
  
  if (targetFrame) targetFrame.style.animationPlayState = 'paused';
  if (frameContainer) frameContainer.classList.add('locked');
  if (signalLevel) {
    signalLevel.style.width = '100%';
    signalLevel.style.backgroundColor = '#10b981'; // emerald-500
  }

  setTimeout(() => { if (activeTargetIndex === index) presentMedia(index); }, 400);
}

function handleLoss(index) {
  if (activeTargetIndex !== index) return;
  activeTargetIndex = -1;
  
  indicatorDot.classList.remove('active');
  statusText.textContent = 'Scanning Environment...';
  instructionText.textContent = 'Locate an artwork in the gallery';
  
  if (targetFrame) targetFrame.style.animationPlayState = 'running';
  if (frameContainer) frameContainer.classList.remove('locked');
  if (signalLevel) signalLevel.style.backgroundColor = '#3b82f6'; // blue-500
}

/* ── HUD Visual Feedback ── */
function beginHudRoutines() {
  let currentTip = 0;
  clearInterval(tipTimer);
  tipTimer = setInterval(() => {
    currentTip = (currentTip + 1) % SCAN_TIPS.length;
    if (userTip) userTip.textContent = SCAN_TIPS[currentTip];
  }, 6500);

  clearInterval(signalTimer);
  signalTimer = setInterval(() => {
    if (activeTargetIndex === -1 && signalLevel) {
      const fluctuation = 15 + Math.random() * 40;
      signalLevel.style.width = fluctuation + '%';
    }
  }, 900);
}

function haltHudRoutines() {
  clearInterval(tipTimer);
  clearInterval(signalTimer);
}

/* ── Media Presentation ── */
function presentMedia(index) {
  const art = artworkData[index];
  mediaHeading.textContent = art.title;
  arPlayer.src = art.media;
  arPlayer.muted = !soundEnabled;
  arPlayer.load();
  arPlayer.play().catch(() => requestPlaybackInteraction());
  
  mediaOverlay.classList.remove('hidden');

  isCooldown = true;
  setTimeout(() => { isCooldown = false; }, 1000);
}

function requestPlaybackInteraction() {
  const interactBtn = document.createElement('button');
  interactBtn.className = 'btn-primary interact-overlay';
  interactBtn.textContent = 'Tap to Play Video';
  interactBtn.onclick = () => {
    soundEnabled = true;
    arPlayer.muted = false;
    getEl('btn-audio').textContent = 'Mute';
    arPlayer.play(); 
    interactBtn.remove();
  };
  mediaOverlay.appendChild(interactBtn);
}

function dismissMedia() {
  arPlayer.pause(); 
  arPlayer.src = '';
  mediaOverlay.classList.add('hidden');
  
  indicatorDot.classList.remove('active');
  statusText.textContent = 'Scanning Environment...';
  instructionText.textContent = 'Locate an artwork in the gallery';
  
  if (targetFrame) targetFrame.style.animationPlayState = 'running';
  if (frameContainer) frameContainer.classList.remove('locked');
  if (signalLevel) signalLevel.style.backgroundColor = '#3b82f6';
}

getEl('btn-close-media').onclick = dismissMedia;
getEl('btn-return-scan').onclick = dismissMedia;

getEl('btn-audio').onclick = () => {
  soundEnabled = !soundEnabled;
  arPlayer.muted = !soundEnabled;
  getEl('btn-audio').textContent = soundEnabled ? 'Mute' : 'Unmute';
};

/* ── Terminate Session ── */
getEl('btn-exit').addEventListener('click', async () => {
  dismissMedia();
  haltHudRoutines();
  if (trackingEngine) {
    try { await trackingEngine.stop(); } catch(e){}
  }
  sceneWrapper.classList.remove('visibility-visible');
  sceneWrapper.classList.add('visibility-hidden');
  overlayHud.classList.add('hidden');
  isSessionActive = false;
  introView.classList.remove('hidden');
});

/* ── Error Handling ── */
function triggerErrorState(message) {
  loadingMessage.textContent = 'System Initialization Failed';
  loadingDetail.textContent = message || 'Please refresh the page and try again.';
  updateProgress(0);

  const retryBtn = document.createElement('button');
  retryBtn.className = 'btn-primary margin-top-md';
  retryBtn.textContent = 'Retry Connection';
  retryBtn.onclick = () => location.reload();
  document.querySelector('.loading-inner').appendChild(retryBtn);
}

/* ── Utilities ── */
function updateProgress(percentage, label) {
  if (progressBarFill) progressBarFill.style.width = Math.min(100, percentage) + '%';
  if (label && loadingMessage) loadingMessage.textContent = label;
}

function animateLoadBar(startPct, endPct, durationMs) {
  const segments = 40;
  const intervalMs = durationMs / segments;
  const stepSize = (endPct - startPct) / segments;
  let currentVal = startPct;
  
  return setInterval(() => {
    currentVal = Math.min(endPct - 0.5, currentVal + stepSize);
    if (progressBarFill) progressBarFill.style.width = currentVal + '%';
  }, intervalMs);
}

const delay = timeMs => new Promise(res => setTimeout(res, timeMs));

let toastTimeout;
function displayNotification(message) {
  let toastEl = document.querySelector('.system-toast');
  if (!toastEl) { 
    toastEl = document.createElement('div'); 
    toastEl.className = 'system-toast'; 
    document.body.appendChild(toastEl); 
  }
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastEl.classList.remove('visible'), 3500);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    arPlayer.pause();
  } else if (!mediaOverlay.classList.contains('hidden')) {
    arPlayer.play().catch(() => {});
  }
});
