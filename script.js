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
// ============================================================
resetZIndex();
updateButtons();
createHearts();

// ============================================================
// SAFARI — ocultar barra de endereços no clique do usuário
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
// BOTÕES E Z-INDEX
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
// ============================================================
function getHalf() { return book.offsetWidth / 2; }

function positionBook(state) {
    if (state === "start") {
        book.style.transform = "translateX(0px)";
    } else if (state === "open") {
        book.style.transform = `translateX(${getHalf()}px)`;
    } else if (state === "end") {
        book.style.transform = `translateX(${book.offsetWidth}px)`;
    }
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

    // Quando abre a capa
    if (currentLocation === 1) positionBook("open");

    // Quando vira a ÚLTIMA página (quarta-capa)
    if (currentLocation === numOfPapers) {
        positionBook("end");
        // Remove o fundo assim que o movimento começa
        book.style.backgroundColor = "transparent";
        book.style.boxShadow = "none";
        book.style.border = "none";
    }

    const paper = papers[currentLocation - 1];
    paper.classList.add("flipped");
    
    setTimeout(() => { paper.style.zIndex = currentLocation; }, 100);

    currentLocation++;
    updateButtons();
    setTimeout(() => { isAnimating = false; }, 800);
}

function goPrevPage() {
    if (isAnimating || currentLocation <= 1) return;
    isAnimating = true;

    // Se estiver voltando da última página
    if (currentLocation === maxLocation) {
        positionBook("open");
        // Atraso de 750ms: o branco SÓ VOLTA quando a página terminar de cair
        setTimeout(() => {
            book.style.backgroundColor = "";
            book.style.boxShadow = "";
            book.style.border = "";
        }, 750);
    }

    currentLocation--;

    // Se voltamos até a primeira página
    if (currentLocation === 1) {
        positionBook("start");
    }

    const paper = papers[currentLocation - 1];
    paper.classList.remove("flipped");
    
    setTimeout(() => { paper.style.zIndex = numOfPapers - (currentLocation - 1); }, 100);

    updateButtons();
    setTimeout(() => { isAnimating = false; }, 800);
}

function goInitialState() {
    if (isAnimating || currentLocation === 1) return;
    isAnimating = true;

    // Se estiver voltando direto do final, esconde até a folha cair
    if (currentLocation === maxLocation) {
        positionBook("open");
        setTimeout(() => {
            book.style.backgroundColor = "";
            book.style.boxShadow = "";
            book.style.border = "";
        }, 750);
    }

    let i = currentLocation - 1;
    const interval = setInterval(() => {
        if (i > 0) {
            papers[i - 1].classList.remove("flipped");
            papers[i - 1].style.zIndex = numOfPapers - (i - 1);
            
            if (i === 1) positionBook("start");
            i--;
        } else {
            clearInterval(interval);
            currentLocation = 1;
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
            requestFullscreen();
            safariHideDone = false;
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
// CORAÇÕES E LISTENERS
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
        else goPrevPage();
    }
}, { passive: true });

window.addEventListener("resize", handleOrientationChange);
screen.orientation?.addEventListener("change", handleOrientationChange);
document.addEventListener("DOMContentLoaded", handleOrientationChange);