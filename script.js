// ============================================================
// REFERÊNCIAS
// ============================================================
const prevBtn         = document.querySelector("#prev-btn");
const nextBtn         = document.querySelector("#next-btn");
const restartBtn      = document.querySelector("#restart-btn");
const book            = document.querySelector("#book");
const papers          = document.querySelectorAll(".paper");
const backgroundMusic = document.querySelector("#background-music");
const musicBtn        = document.querySelector("#music-btn");
const orientationPrompt = document.querySelector("#orientation-prompt");

const numOfPapers = papers.length;   // 9
const maxLocation = numOfPapers + 1; // 10
let currentLocation = 1;
let isAnimating = false;
let safariHideDone = false;

// ============================================================
// INIT
// O último paper (quarta-capa) precisa de transform-origin: right
// para que quando flipado ele "feche" naturalmente para a direita,
// sem projetar para a esquerda e criar a "marca de livro aberto".
// ============================================================
papers[numOfPapers - 1].style.transformOrigin = "right";

resetZIndex();
updateButtons();
createHearts();

// ============================================================
// SAFARI — ocultar barra de endereços
// Deve ser chamado DENTRO de um event listener de clique/touch
// (gesto do usuário). Funciona no Safari iOS 15+.
// ============================================================
function trySafariHideBar() {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (!isSafari || safariHideDone) return;
    safariHideDone = true;

    const html = document.documentElement;
    html.style.height = "101vh";
    html.style.overflowY = "auto";
    window.scrollTo(0, 1);

    setTimeout(() => {
        html.style.height = "100%";
        html.style.overflowY = "hidden";
    }, 500);
}

// ============================================================
// FULLSCREEN padrão (Android / Chrome / Firefox)
// ============================================================
function requestFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) {
        el.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
    } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
    }
    if (screen.orientation?.lock) {
        screen.orientation.lock("landscape").catch(() => {});
    }
}

function exitFullscreen() {
    const isFs = document.fullscreenElement || document.webkitFullscreenElement;
    if (isFs) {
        (document.exitFullscreen || document.webkitExitFullscreen)?.call(document).catch(() => {});
    }
}

// ============================================================
// MÚSICA
// ============================================================
musicBtn.addEventListener("click", () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play().catch(() => {});
        musicBtn.innerText = "🎵 Pausar Música";
        musicBtn.style.background = "var(--rose-gold)";
    } else {
        backgroundMusic.pause();
        musicBtn.innerText = "🎵 Nossa Música";
        musicBtn.style.background = "rgba(255, 255, 255, 0.12)";
    }
});

// ============================================================
// BOTÕES
// ============================================================
function updateButtons() {
    prevBtn.style.display    = currentLocation === 1 ? "none" : "block";
    restartBtn.style.display = currentLocation > numOfPapers ? "block" : "none";
    nextBtn.style.display    = currentLocation > numOfPapers ? "none"  : "block";
}

function resetZIndex() {
    papers.forEach((p, i) => { p.style.zIndex = numOfPapers - i; });
}

// ============================================================
// POSIÇÃO DO LIVRO
//
// "start" → translateX(0)      capa fechada, centrada
// "open"  → translateX(+half)  livro aberto, dobra no centro
// "end"   → translateX(0)      quarta-capa fechada, centrada
//
// Com transform-origin:right no último paper, quando ele está
// .flipped (rotateY(-180deg)) ele gira em torno do eixo DIREITO,
// então visualmente fecha para a direita — igual à capa do início.
// Resultado: translateX(0) é correto nos dois estados fechados.
// ============================================================
function getHalf() { return book.offsetWidth / 2; }

function positionBook(state) {
    book.style.transform = state === "open"
        ? `translateX(${getHalf()}px)`
        : "translateX(0px)";
}

// ============================================================
// NAVEGAÇÃO
// ============================================================
nextBtn.addEventListener("click", () => {
    if (isMobile()) trySafariHideBar();
    goNextPage();
});
prevBtn.addEventListener("click", goPrevPage);
restartBtn.addEventListener("click", goInitialState);

function goNextPage() {
    if (isAnimating || currentLocation >= maxLocation) return;
    isAnimating = true;

    if (currentLocation === 1) positionBook("open");

    const paper = papers[currentLocation - 1];
    paper.classList.add("flipped");
    setTimeout(() => { paper.style.zIndex = currentLocation; }, 100);

    if (currentLocation === numOfPapers) positionBook("end");

    currentLocation++;
    updateButtons();
    setTimeout(() => { isAnimating = false; }, 800);
}

function goPrevPage() {
    if (isAnimating || currentLocation <= 1) return;
    isAnimating = true;

    currentLocation--;

    if (currentLocation === numOfPapers) positionBook("open");

    const paper = papers[currentLocation - 1];
    paper.classList.remove("flipped");
    setTimeout(() => { paper.style.zIndex = numOfPapers - (currentLocation - 1); }, 100);

    if (currentLocation === 1) positionBook("start");

    updateButtons();
    setTimeout(() => { isAnimating = false; }, 800);
}

function goInitialState() {
    if (isAnimating) return;
    isAnimating = true;

    let i = numOfPapers;
    const interval = setInterval(() => {
        if (i > 0) {
            papers[i - 1].classList.remove("flipped");
            papers[i - 1].style.zIndex = numOfPapers - (i - 1);
            i--;
        } else {
            clearInterval(interval);
            currentLocation = 1;
            positionBook("start");
            updateButtons();
            setTimeout(() => { isAnimating = false; }, 800);
        }
    }, 120);
}

// ============================================================
// ORIENTAÇÃO + FULLSCREEN
// ============================================================
function isMobile() {
    return Math.min(window.innerWidth, window.innerHeight) < 600;
}

function applyBookPosition() {
    requestAnimationFrame(() => {
        if (currentLocation === 1)               positionBook("start");
        else if (currentLocation > numOfPapers)  positionBook("end");
        else                                      positionBook("open");
        updateButtons();
    });
}

function handleOrientationChange() {
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isMobile()) {
        if (isLandscape) {
            orientationPrompt.style.display = "none";
            book.style.display = "block";
            requestFullscreen(); // Android/Chrome
            safariHideDone = false; // reseta para tentar no próximo clique
            applyBookPosition();
        } else {
            exitFullscreen();
            safariHideDone = false;
            orientationPrompt.style.display = "flex";
            book.style.display      = "none";
            prevBtn.style.display    = "none";
            nextBtn.style.display    = "none";
            restartBtn.style.display = "none";
        }
    } else {
        orientationPrompt.style.display = "none";
        book.style.display = "block";
        applyBookPosition();
    }
}

// ============================================================
// CORAÇÕES
// ============================================================
function createHearts() {
    const container = document.getElementById("hearts-container");
    const symbols = ["♥", "❤", "❥"];
    const MAX = 15;

    function spawn() {
        if (container.querySelectorAll(".heart").length >= MAX) return;
        const h = document.createElement("div");
        h.classList.add("heart");
        h.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        h.style.cssText = `
            left:${Math.random() * 96 + 2}vw;
            font-size:${Math.random() * 1.2 + 0.6}rem;
            animation-duration:${Math.random() * 3 + 5}s;
        `;
        container.appendChild(h);
        h.addEventListener("animationend", () => h.remove(), { once: true });
    }
    setInterval(spawn, 700);
}

// ============================================================
// SWIPE
// ============================================================
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) { if (isMobile()) trySafariHideBar(); goNextPage(); }
        else          goPrevPage();
    }
}, { passive: true });

// ============================================================
// LISTENERS GLOBAIS
// ============================================================
window.addEventListener("resize", handleOrientationChange);
screen.orientation?.addEventListener("change", handleOrientationChange);
document.addEventListener("DOMContentLoaded", handleOrientationChange);
