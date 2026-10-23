'use strict';
/* Personalização: WhatsApp informado para as confirmações. */
const CONFIG = Object.freeze({
  nome: 'Júlia Vitória', idade: 18,
  data: '2026-11-28T13:00:00-03:00',
  fim: '2026-11-29T00:00:00-03:00',
  whatsapp: '5599981045325',
  prazoConfirmacao: '2026-11-13',
  local: 'Piscina Encanto da Natureza',
  // Substitua por um link exato do Maps quando disponível.
  mapa: 'https://www.google.com/maps/search/?api=1&query=Piscina%20Encanto%20da%20Natureza'
});
const cover = document.getElementById('cover');
const coverCopy = document.getElementById('coverCopy');
const introStage = document.getElementById('introStage');
const introVideo = document.getElementById('introVideo');
const invitation = document.getElementById('invitation');
const audio = document.getElementById('bgMusic');
const musicButton = document.getElementById('musicButton');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const PLAYLIST = [
  { src: 'fotos/audioconvite-julia.mp3', title: 'Áudio do convite' },
  { src: 'fotos/young-and-beautiful.mp3', title: 'Young and Beautiful — Lana Del Rey' }
];
let trackIndex = 0;
let introStarted = false;
let opened = false;
document.body.classList.add('locked');
invitation.inert = true;

function updateMusic() {
  const playing = !audio.paused && !audio.ended;
  musicButton.setAttribute('aria-pressed', String(playing));
  musicButton.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproduzir música');
  musicButton.title = PLAYLIST[trackIndex].title;
  document.getElementById('musicText').textContent = playing ? 'Pausar música' : 'Ouvir música';
  document.getElementById('musicIcon').textContent = playing ? 'Ⅱ' : '♫';
}
async function playMusic() {
  try { await audio.play(); } catch (_) { updateMusic(); }
}
function selectTrack(index) {
  trackIndex = index;
  audio.src = PLAYLIST[index].src;
  audio.loop = false;
  audio.load();
  updateMusic();
}
audio.addEventListener('play', updateMusic);
audio.addEventListener('pause', updateMusic);
audio.addEventListener('ended', () => {
  if (trackIndex < PLAYLIST.length - 1) {
    selectTrack(trackIndex + 1);
    playMusic();
  } else {
    updateMusic();
  }
});
audio.addEventListener('error', () => {
  if (trackIndex === 0) {
    selectTrack(1);
    if (opened) playMusic();
  } else {
    document.getElementById('musicText').textContent = 'Música indisponível';
    musicButton.disabled = true;
  }
});
musicButton.addEventListener('click', () => audio.paused ? playMusic() : audio.pause());

function openInvitation() {
  if (opened) return;
  opened = true;
  introVideo.pause();
  invitation.inert = false;
  cover.classList.add('opening');
  document.body.classList.remove('locked');
  window.scrollTo({ top: 0, behavior: 'instant' });
  // O áudio anterior toca uma vez; ao terminar, inicia a música anexada.
  audio.volume = .45;
  playMusic();
  window.setTimeout(() => {
    cover.hidden = true;
    document.querySelector('.hero-name').focus({ preventScroll: true });
  }, reducedMotion ? 0 : 850);
  if (!reducedMotion) startPetals();
}

document.getElementById('openInvite').addEventListener('click', () => {
  if (introStarted || opened) return;
  introStarted = true;
  coverCopy.hidden = true;
  introStage.hidden = false;
  cover.setAttribute('aria-label', 'Vídeo de abertura do convite');
  // O gesto de abrir inicia o vídeo com seu áudio, sem sobrepor a trilha.
  introVideo.play().catch(() => {
    if (!opened) document.getElementById('introStatus').textContent = 'Toque no vídeo para reproduzir ou continue para o convite.';
  });
});
introVideo.addEventListener('ended', openInvitation);
introVideo.addEventListener('error', openInvitation);
document.getElementById('skipIntro').addEventListener('click', openInvitation);
updateMusic();

function startPetals() {
  const layer = document.getElementById('petalLayer');
  for (let i = 0; i < 10; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.style.cssText = `width:${7 + i % 5}px;height:${12 + i % 6}px;left:${(i * 37) % 100}%;background:${i % 2 ? '#eb4c80' : '#f28a35'};animation-duration:${13 + i % 7}s;animation-delay:${i * .9}s;`;
    petal.style.setProperty('--drift', `${i % 2 ? 70 : -65}px`);
    layer.appendChild(petal);
  }
}

const TARGET = Date.parse(CONFIG.data);
const END = Date.parse(CONFIG.fim);
function tick(now = Date.now()) {
  const remaining = Math.max(0, TARGET - now);
  const seconds = Math.floor(remaining / 1000);
  const parts = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
  ['days', 'hours', 'minutes', 'seconds'].forEach((id, index) => {
    document.getElementById(id).textContent = String(parts[index]).padStart(2, '0');
  });
  document.getElementById('countdownStatus').textContent = now < TARGET
    ? 'Para uma tarde que vai ficar na memória.'
    : now < END ? 'Chegou o grande dia! Espero você às 13h.'
      : 'Obrigada por fazer parte dessa história!';
}
tick();
window.setInterval(tick, 1000);

// Novembro de 2026 começa no domingo e possui 30 dias.
const calendarDays = document.getElementById('calendarDays');
for (let day = 1; day <= 30; day++) {
  const cell = document.createElement('span');
  cell.textContent = String(day);
  cell.setAttribute('aria-label', `${day} de novembro de 2026${day === 28 ? ', sábado, festa de Júlia Vitória às 13h' : ''}`);
  if (day === 28) cell.className = 'highlight';
  calendarDays.appendChild(cell);
}

document.getElementById('mapLink').href = CONFIG.mapa;
document.getElementById('rsvpForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.getElementById('guestName');
  const name = input.value.trim();
  if (!name) { input.setCustomValidity('Digite seu nome para preparar a confirmação.'); input.reportValidity(); return; }
  input.setCustomValidity('');
  const message = `Olá, ${CONFIG.nome}! Sou ${name} e confirmo minha presença na sua festa de ${CONFIG.idade} anos, dia 28/11/2026, às 13h, na ${CONFIG.local}. 🌺☀️`;
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
  const fallback = document.getElementById('whatsappFallback');
  fallback.href = url;
  window.open(url, '_blank', 'noopener,noreferrer');
  document.getElementById('rsvpStatus').textContent = 'Mensagem preparada! Envie no WhatsApp para concluir. Se a nova janela não abriu, use o link abaixo.';
});
document.getElementById('guestName').addEventListener('input', (event) => event.target.setCustomValidity(''));

if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
}
