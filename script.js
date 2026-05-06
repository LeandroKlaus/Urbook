// Referências do DOM
const prevBtn       = document.querySelector("#prev-btn");
const nextBtn       = document.querySelector("#next-btn");
const restartBtn    = document.querySelector("#restart-btn");
const book          = document.querySelector("#book");
const papers        = document.querySelectorAll(".paper");
const backgroundMusic = document.querySelector("#background-music");
const musicBtn      = document.querySelector("#music-btn");
const orientationPrompt = document.querySelector("#orientation-prompt");

// Paginação
const numOfPapers = papers.length;
const maxLocation = numOfPapers + 1;
let currentLocation = 1;
let isAnimating = false;

// Init
resetZIndex();
updateButtons();
createHearts();

// ================================
// SAFARI FULLSCREEN WORKAROUND
// Safari iOS bloqueia requestFullscreen.
// Truque: body fica 101vh → provoca scroll → scrollTo(0,1)
// faz a barra de endereços sumir automaticamente.
// ================================
let safariScrollApplied = false;

function safariHideBar() {
    // Só aplica em Safari iOS (não tem fullscreen API)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (!isSafari) return;

    // Ativa overflow temporário no html para permitir o scroll
    document.documentElement.style.height = "101vh";
    document.documentElement.style.overflowY = "scroll";

    requestAnimationFrame(() => {
        window.scrollTo({ top: 1, behavior: "instant" });

        // Depois do scroll, trava de volta
        setTimeout(() => {
            document.documentElement.style.height = "100%";
            document.documentElement.style.overflowY = "hidden";
        }, 300);
    });
}

function safariRestoreBar() {
    // Volta ao topo → browser restaura a barra
    if (safariScrollApplied) {
        window.scrollTo({ top: 0, behavior: "instant" });
        safariScrollApplied = false;
    }
}

// ================================
// FULLSCREEN (Android / Desktop)
// ================================
function requestFullscreenLandscape() {
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

    // Também tenta o truque do Safari
    safariHideBar();
}

function exitFullscreenIfActive() {
    const isFs = document.fullscreenElement || document.webkitFullscreenElement;
    if (isFs) {
        (document.exitFullscreen || document.webkitExitFullscreen)?.call(document).catch(() => {});
    }
    safariRestoreBar();
}

// ================================
// MÚSICA
// ================================
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

// ================================
// BOTÕES
// ================================
function updateButtons() {
    prevBtn.style.display    = currentLocation === 1 ? "none" : "block";
    restartBtn.style.display = currentLocation > numOfPapers ? "block" : "none";
    nextBtn.style.display    = currentLocation > numOfPapers ? "none" : "block";
}

function resetZIndex() {
    papers.forEach((p, i) => { p.style.zIndex = numOfPapers - i; });
}

// ================================
// POSICIONAMENTO DO LIVRO
//
// Lógica das 3 posições:
//   FECHADO INÍCIO  → translateX(0)          — livro encostado na esquerda do centro
//   ABERTO (meio)   → translateX(+halfWidth)  — livro deslocado para mostrar a dobra central
//   FECHADO FIM     → translateX(0)           — livro volta ao centro (todas páginas viradas)
// ================================
function getHalf() {
    return book.offsetWidth / 2;
}

function positionBook(state) {
    switch (state) {
        case "start":  // capa fechada
            book.style.transform = "translateX(0px)";
            break;
        case "open":   // páginas abertas
            book.style.transform = `translateX(${getHalf()}px)`;
            break;
        case "end":    // quarta-capa fechada — volta ao centro também
            book.style.transform = "translateX(0px)";
            break;
    }
}

// ================================
// NAVEGAÇÃO
// ================================
nextBtn.addEventListener("click", goNextPage);
prevBtn.addEventListener("click", goPrevPage);
restartBtn.addEventListener("click", goInitialState);

function goNextPage() {
    if (isAnimating || currentLocation >= maxLocation) return;
    isAnimating = true;

    // Primeira página: abre o livro
    if (currentLocation === 1) positionBook("open");

    const paper = papers[currentLocation - 1];
    paper.classList.add("flipped");
    setTimeout(() => { paper.style.zIndex = currentLocation; }, 100);

    // Última página: fecha o livro no final
    if (currentLocation === numOfPapers) positionBook("end");

    currentLocation++;
    updateButtons();
    setTimeout(() => { isAnimating = false; }, 800);
}

function goPrevPage() {
    if (isAnimating || currentLocation <= 1) return;
    isAnimating = true;

    currentLocation--;

    // Voltando da última página: reabre
    if (currentLocation === numOfPapers) positionBook("open");

    const paper = papers[currentLocation - 1];
    paper.classList.remove("flipped");
    setTimeout(() => { paper.style.zIndex = numOfPapers - (currentLocation - 1); }, 100);

    // Voltando para a capa: fecha no início
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

// ================================
// ORIENTAÇÃO + FULLSCREEN
// ================================
function isMobile() {
    return Math.min(window.innerWidth, window.innerHeight) < 600;
}

function applyBookPosition() {
    requestAnimationFrame(() => {
        if (currentLocation === 1)              positionBook("start");
        else if (currentLocation > numOfPapers) positionBook("end");
        else                                     positionBook("open");
        updateButtons();
    });
}

function handleOrientationChange() {
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isMobile()) {
        if (isLandscape) {
            orientationPrompt.style.display = "none";
            book.style.display = "block";
            requestFullscreenLandscape();
            applyBookPosition();
        } else {
            exitFullscreenIfActive();
            orientationPrompt.style.display = "flex";
            book.style.display = "none";
            prevBtn.style.display = "none";
            nextBtn.style.display = "none";
            restartBtn.style.display = "none";
        }
    } else {
        orientationPrompt.style.display = "none";
        book.style.display = "block";
        applyBookPosition();
    }
}

// Toque na tela de "gire" = gesto do usuário → permite fullscreen ao girar
orientationPrompt.addEventListener("click", () => {
    orientationPrompt.dataset.userConsented = "true";
});

// ================================
// CORAÇÕES FLUTUANTES
// ================================
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
            left: ${Math.random() * 96 + 2}vw;
            font-size: ${Math.random() * 1.2 + 0.6}rem;
            animation-duration: ${Math.random() * 3 + 5}s;
        `;
        container.appendChild(h);
        h.addEventListener("animationend", () => h.remove(), { once: true });
    }

    setInterval(spawn, 700);
}

// ================================
// SWIPE
// ================================
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
        dx < 0 ? goNextPage() : goPrevPage();
    }
}, { passive: true });

// ================================
// LISTENERS GLOBAIS
// ================================
window.addEventListener("resize", handleOrientationChange);
screen.orientation?.addEventListener("change", handleOrientationChange);
document.addEventListener("DOMContentLoaded", handleOrientationChange);
