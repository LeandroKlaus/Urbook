// Referências do DOM
const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const restartBtn = document.querySelector("#restart-btn");
const book = document.querySelector("#book");
const papers = document.querySelectorAll(".paper");
const backgroundMusic = document.querySelector("#background-music");
const musicBtn = document.querySelector("#music-btn");
const orientationPrompt = document.querySelector("#orientation-prompt");

// Lógica de Paginação
const numOfPapers = papers.length;
const maxLocation = numOfPapers + 1;
let currentLocation = 1;
let isAnimating = false;

// Inicialização
resetZIndex();
updateButtons();
createHearts();

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
    papers.forEach((p, i) => {
        p.style.zIndex = numOfPapers - i;
    });
}

// ================================
// CÁLCULO DO TRANSLATE
// Desloca o livro metade de sua própria largura para simular abertura.
// Usa a largura real do elemento para precisão em qualquer tamanho de tela.
// ================================
function getBookHalfWidth() {
    return book.offsetWidth / 2;
}

function openBook() {
    const half = getBookHalfWidth();
    book.style.transform = `translateX(${half}px)`;
}

function closeBook(isAtBeginning) {
    if (isAtBeginning) {
        book.style.transform = "translateX(0px)";
    } else {
        const half = getBookHalfWidth();
        book.style.transform = `translateX(${half}px)`;
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

    if (currentLocation === 1) openBook();

    const paper = papers[currentLocation - 1];
    paper.classList.add("flipped");

    setTimeout(() => {
        paper.style.zIndex = currentLocation;
    }, 100);

    if (currentLocation === numOfPapers) closeBook(false);

    currentLocation++;
    updateButtons();

    setTimeout(() => { isAnimating = false; }, 800);
}

function goPrevPage() {
    if (isAnimating || currentLocation <= 1) return;
    isAnimating = true;

    currentLocation--;

    if (currentLocation === numOfPapers) openBook();

    const paper = papers[currentLocation - 1];
    paper.classList.remove("flipped");

    setTimeout(() => {
        paper.style.zIndex = numOfPapers - (currentLocation - 1);
    }, 100);

    if (currentLocation === 1) closeBook(true);

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
            closeBook(true);
            updateButtons();
            setTimeout(() => { isAnimating = false; }, 800);
        }
    }, 120);
}

// ================================
// ORIENTAÇÃO (MOBILE)
// ================================
function handleOrientationChange() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const isMobile = Math.min(window.innerWidth, window.innerHeight) < 600;

    if (isMobile && !isLandscape) {
        orientationPrompt.style.display = "flex";
        book.style.display = "none";
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
        restartBtn.style.display = "none";
    } else {
        orientationPrompt.style.display = "none";
        book.style.display = "block";

        // Reposiciona corretamente ao girar
        requestAnimationFrame(() => {
            if (currentLocation === 1) {
                book.style.transform = "translateX(0px)";
            } else if (currentLocation > numOfPapers) {
                closeBook(false);
            } else {
                openBook();
            }
            updateButtons();
        });
    }
}

// ================================
// CORAÇÕES FLUTUANTES — SEM LAG
// ================================
function createHearts() {
    const container = document.getElementById("hearts-container");
    const symbols = ["♥", "❤", "❥"];
    const MAX_HEARTS = 15;

    function spawnHeart() {
        const existing = container.querySelectorAll(".heart").length;
        if (existing >= MAX_HEARTS) return;

        const heart = document.createElement("div");
        heart.classList.add("heart");
        heart.innerText = symbols[Math.floor(Math.random() * symbols.length)];

        const size     = Math.random() * 1.2 + 0.6;
        const duration = Math.random() * 3 + 5;
        const leftPos  = Math.random() * 96 + 2;

        heart.style.cssText = `
            left: ${leftPos}vw;
            font-size: ${size}rem;
            animation-duration: ${duration}s;
        `;

        container.appendChild(heart);
        heart.addEventListener("animationend", () => heart.remove(), { once: true });
    }

    setInterval(spawnHeart, 700);
}

// ================================
// SWIPE (TOQUE)
// ================================
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) goNextPage();
        else goPrevPage();
    }
}, { passive: true });

// ================================
// EVENT LISTENERS GLOBAIS
// ================================
window.addEventListener("resize", handleOrientationChange);
screen.orientation?.addEventListener("change", handleOrientationChange);
document.addEventListener("DOMContentLoaded", handleOrientationChange);
