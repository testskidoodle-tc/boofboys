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

function pad(n) {
  return String(n).padStart(2, "0");
}

function renderSlide(newIndex, direction = 1) {
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
  renderSlide((index + 1) % slides.length, 1);
}

function prev() {
  renderSlide((index - 1 + slides.length) % slides.length, -1);
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

function startMusic() {
  if (!player || started) return;
  started = true;
  player.unMute();
  player.setVolume(35);
  player.playVideo();
  muted = false;
  muteIcon.textContent = "♪";
}

function toggleMute() {
  if (!player) return;
  if (!started) {
    startMusic();
    return;
  }
  if (muted) {
    player.unMute();
    muteIcon.textContent = "♪";
  } else {
    player.mute();
    muteIcon.textContent = "ø";
  }
  muted = !muted;
}

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "0",
    width: "0",
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
    },
    events: {
      onReady: () => {
        player.mute();
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.ENDED) {
          player.playVideo();
        }
      },
    },
  });
};

enterBtn.addEventListener("click", () => {
  enterOverlay.classList.add("hidden");
  startMusic();
});

prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);
muteBtn.addEventListener("click", toggleMute);

window.addEventListener("keydown", (event) => {
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
    const delta = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) next();
    else prev();
  },
  { passive: true }
);

buildThumbs();
