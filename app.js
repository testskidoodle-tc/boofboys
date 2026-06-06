const slides = [
  {
    src: "images/tco-lv-pool.jpg",
    alt: "tco wearing Louis Vuitton by the pool",
    name: "tco",
    tag: "lv by the pool",
  },
  {
    src: "images/tco-chicken.png",
    alt: "tco eating chicken with orange sauce",
    name: "tco",
    tag: "orange chicken moment",
  },
  {
    src: "images/dominik-koleah.png",
    alt: "Dominik Palasz in a blue hoodie",
    name: "dominik palasz",
    tag: "aka koleah",
  },
  {
    src: "images/ralph-afro.png",
    alt: "Ralph Ortiz portrait",
    name: "ralph ortiz",
    tag: "afro hours",
  },
  {
    src: "images/ralph-aba.png",
    alt: "Ralph Ortiz ABA anime edit",
    name: "ralph ortiz",
    tag: "aba awakened",
  },
  {
    src: "images/noah-jersey.png",
    alt: "Noah Jenkins in orange jersey",
    name: "noah jenkins",
    tag: "orange jersey",
  },
];

const YT_ID = "_ALPYlwYzGU";
const YT_BASE = `https://www.youtube.com/embed/${YT_ID}`;

let index = 0;
let muted = false;
let started = false;
let currentView = "home";

const photo = document.getElementById("photo");
const nameEl = document.getElementById("name");
const tagEl = document.getElementById("tag");
const counterEl = document.getElementById("counter");
const thumbsEl = document.getElementById("thumbs");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const muteBtn = document.getElementById("mute-btn");
const muteIcon = document.getElementById("mute-icon");
const enterOverlay = document.getElementById("enter");
const enterBtn = document.getElementById("enter-btn");
const nowPlaying = document.getElementById("now-playing");
const goGalleryBtn = document.getElementById("go-gallery");
const replayMusicBtn = document.getElementById("replay-music");
const playerWrap = document.getElementById("player-wrap");
const tabs = document.querySelectorAll(".tab");
const homeView = document.getElementById("home-view");
const galleryView = document.getElementById("gallery-view");

function pad(n) {
  return String(n).padStart(2, "0");
}

function setView(view) {
  currentView = view;
  homeView.classList.toggle("active", view === "home");
  galleryView.classList.toggle("active", view === "gallery");
  counterEl.classList.toggle("hidden", view !== "gallery");

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === view);
  });
}

function renderSlide(newIndex) {
  const slide = slides[newIndex];
  index = newIndex;

  photo.classList.add("fade-out");

  window.setTimeout(() => {
    photo.src = slide.src;
    photo.alt = slide.alt;
    nameEl.textContent = slide.name;
    tagEl.textContent = slide.tag;
    counterEl.textContent = `${pad(index + 1)} / ${pad(slides.length)}`;

    document.querySelectorAll(".thumb").forEach((btn, i) => {
      btn.classList.toggle("active", i === index);
    });

    photo.classList.remove("fade-out");
  }, 180);
}

function next() {
  renderSlide((index + 1) % slides.length);
}

function prev() {
  renderSlide((index - 1 + slides.length) % slides.length);
}

function buildThumbs() {
  slides.forEach((slide, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `thumb${i === 0 ? " active" : ""}`;
    btn.setAttribute("aria-label", `${slide.name} - ${slide.tag}`);

    const img = document.createElement("img");
    img.src = slide.src;
    img.alt = "";
    btn.appendChild(img);

    btn.addEventListener("click", () => renderSlide(i));
    thumbsEl.appendChild(btn);
  });
}

function buildEmbedUrl({ autoplay = true, mute = false } = {}) {
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    mute: mute ? "1" : "0",
    loop: "1",
    playlist: YT_ID,
    controls: "0",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    enablejsapi: "1",
  });

  return `${YT_BASE}?${params.toString()}`;
}

function getAudioFrame() {
  return document.getElementById("yt-audio");
}

function ensureAudioFrame() {
  let frame = getAudioFrame();
  if (frame) return frame;

  frame = document.createElement("iframe");
  frame.id = "yt-audio";
  frame.title = "Background music";
  frame.setAttribute("allow", "autoplay; encrypted-media; fullscreen");
  frame.setAttribute("referrerpolicy", "origin");
  playerWrap.innerHTML = "";
  playerWrap.appendChild(frame);
  return frame;
}

function updateMusicUi() {
  if (started && !muted) {
    nowPlaying.classList.remove("hidden");
    muteIcon.textContent = "♪";
  } else if (started && muted) {
    nowPlaying.classList.add("hidden");
    muteIcon.textContent = "ø";
  } else {
    nowPlaying.classList.add("hidden");
    muteIcon.textContent = "ø";
  }
}

function startMusic() {
  const frame = ensureAudioFrame();
  const shouldMute = muted;

  frame.src = buildEmbedUrl({ autoplay: true, mute: shouldMute });
  started = true;
  updateMusicUi();
}

function toggleMute() {
  if (!started) {
    muted = false;
    startMusic();
    return;
  }

  muted = !muted;
  const frame = ensureAudioFrame();
  frame.src = buildEmbedUrl({ autoplay: true, mute: muted });
  updateMusicUi();
}

function enterSite() {
  enterOverlay.classList.add("hidden");
  muted = false;
  startMusic();
}

enterBtn.addEventListener("click", enterSite);
replayMusicBtn.addEventListener("click", () => {
  muted = false;
  startMusic();
});
goGalleryBtn.addEventListener("click", () => setView("gallery"));

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setView(tab.dataset.view));
});

prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);
muteBtn.addEventListener("click", toggleMute);

window.addEventListener("keydown", (event) => {
  if (currentView !== "gallery") return;
  if (event.key === "ArrowRight") next();
  if (event.key === "ArrowLeft") prev();
});

let touchStartX = 0;
window.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.changedTouches[0].screenX;
  },
  { passive: true }
);

window.addEventListener(
  "touchend",
  (event) => {
    if (currentView !== "gallery") return;
    const delta = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) next();
    else prev();
  },
  { passive: true }
);

buildThumbs();
updateMusicUi();
