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
let index = 0;
let player = null;
let muted = false;
let started = false;
let musicRequested = false;
let apiReady = false;
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

function loadYouTubeApi() {
  if (window.YT && window.YT.Player) {
    initPlayer();
    return;
  }

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}

function initPlayer() {
  if (player || !document.getElementById("player")) return;

  player = new YT.Player("player", {
    height: "200",
    width: "200",
    videoId: YT_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      loop: 1,
      playlist: YT_ID,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
      origin: window.location.origin,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    },
  });
}

function onPlayerReady() {
  apiReady = true;
  if (musicRequested) {
    attemptPlay();
  }
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    player.seekTo(0, true);
    player.playVideo();
  }

  if (event.data === YT.PlayerState.PLAYING && !muted) {
    started = true;
    updateMusicUi();
  }
}

function onPlayerError() {
  fallbackIframePlay();
}

function attemptPlay() {
  if (!player || !apiReady) return;

  try {
    player.unMute();
    player.setVolume(60);
    const result = player.playVideo();

    if (result && typeof result.then === "function") {
      result.catch(() => fallbackIframePlay());
    }

    started = true;
    muted = false;
    updateMusicUi();
  } catch {
    fallbackIframePlay();
  }
}

function fallbackIframePlay() {
  const wrap = document.getElementById("player-wrap");
  wrap.innerHTML = `<iframe
    id="yt-fallback"
    src="https://www.youtube.com/embed/${YT_ID}?autoplay=1&mute=0&loop=1&playlist=${YT_ID}&controls=0&modestbranding=1&playsinline=1"
    allow="autoplay; encrypted-media"
    title="Background music"
  ></iframe>`;

  started = true;
  muted = false;
  updateMusicUi();
}

function startMusic() {
  musicRequested = true;
  loadYouTubeApi();

  if (window.YT && window.YT.Player && !player) {
    initPlayer();
  }

  if (apiReady && player) {
    attemptPlay();
  } else {
    window.setTimeout(() => {
      if (musicRequested && apiReady) attemptPlay();
    }, 800);
  }
}

function toggleMute() {
  if (!started) {
    startMusic();
    return;
  }

  const iframe = document.getElementById("yt-fallback");
  if (iframe) {
    const nextSrc = muted
      ? iframe.src.replace("mute=1", "mute=0")
      : iframe.src.replace("mute=0", "mute=1");
    iframe.src = nextSrc.includes("mute=") ? nextSrc : `${iframe.src}&mute=${muted ? 0 : 1}`;
    muted = !muted;
    updateMusicUi();
    return;
  }

  if (!player) return;

  if (muted) {
    player.unMute();
    player.setVolume(60);
    player.playVideo();
    muted = false;
  } else {
    player.mute();
    muted = true;
  }

  updateMusicUi();
}

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  initPlayer();
};

function enterSite() {
  enterOverlay.classList.add("hidden");
  startMusic();
}

enterBtn.addEventListener("click", enterSite);
replayMusicBtn.addEventListener("click", startMusic);
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
