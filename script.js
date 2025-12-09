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

// Inicialização
resetZIndex();
updateButtons();
createHearts(); // Inicia os corações

// Lógica de Música (Melhorada para evitar bugs de autoplay)
musicBtn.addEventListener("click", () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        musicBtn.innerText = "🎵 Pausar Música";
        musicBtn.style.background = "var(--rose-gold)";
    } else {
        backgroundMusic.pause();
        musicBtn.innerText = "🎵 Nossa Música";
        musicBtn.style.background = "rgba(255, 255, 255, 0.1)";
    }
});

function updateButtons() {
    // Esconde/Mostra botões baseado na página atual
    if (currentLocation === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }

    if (currentLocation > numOfPapers) {
        nextBtn.style.display = 'none';
        restartBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        restartBtn.style.display = 'none';
    }
}

function resetZIndex() {
    for (let i = 0; i < numOfPapers; i++) {
        papers[i].style.zIndex = numOfPapers - i;
    }
}

// Event Listeners de Navegação
nextBtn.addEventListener("click", goNextPage);
prevBtn.addEventListener("click", goPrevPage);
restartBtn.addEventListener("click", goInitialState);

// Permite clicar na própria página para virar (mais intuitivo)
// Nota: Adicione essa lógica se quiser que o clique na foto vire a página
// papers.forEach((paper, index) => {
//     paper.addEventListener('click', () => {
//         if(currentLocation - 1 === index) goNextPage();
//     });
// });

function goNextPage() {
    if (currentLocation < maxLocation) {
        if (currentLocation === 1) {
            openBook();
        }

        papers[currentLocation - 1].classList.add("flipped");
        
        const pageToFlipIndex = currentLocation - 1;
        // Delay para ajustar z-index após a animação começar
        setTimeout(() => {
            papers[pageToFlipIndex].style.zIndex = pageToFlipIndex + 1;
        }, 100); // Sincronizado com CSS

        if (currentLocation === numOfPapers) {
            closeBook(false);
        }
        
        currentLocation++;
        updateButtons();
    }
}

function goPrevPage() {
    if (currentLocation > 1) {
        currentLocation--;
        
        if (currentLocation === numOfPapers) {
             openBook(false);
        }

        papers[currentLocation - 1].classList.remove("flipped");
        
        const pageToUnflipIndex = currentLocation - 1;
        setTimeout(() => {
            papers[pageToUnflipIndex].style.zIndex = numOfPapers - pageToUnflipIndex;
        }, 100);

        if (currentLocation === 1) {
            closeBook(true);
        }
        
        updateButtons();
    }
}

function goInitialState() {
    let i = numOfPapers;
    const interval = setInterval(() => {
        if (i > 0) {
            papers[i - 1].classList.remove("flipped");
            papers[i - 1].style.zIndex = numOfPapers - (i - 1); // Fix visual imediato
            i--;
        } else {
            clearInterval(interval);
            currentLocation = 1;
            closeBook(true);
            updateButtons();
        }
    }, 100); // Um pouco mais rápido para ser fluido
}

function openBook() {
    book.style.transform = "translateX(50%)";
}

function closeBook(isAtBeginning) {
    if (isAtBeginning) {
        book.style.transform = "translateX(0%)";
    } else {
        book.style.transform = "translateX(100%)";
    }
}

// Lógica de Orientação (Mobile)
function handleOrientationChange() {
    const isLandscape = screen.orientation.type.includes('landscape');
    
    // Verifica se é mobile pelo tamanho da tela também
    const isMobile = window.innerWidth < 768; 

    if (isMobile && !isLandscape) {
        orientationPrompt.style.display = 'flex';
        book.style.display = 'none';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        if(restartBtn) restartBtn.style.display = 'none';
    } else {
        orientationPrompt.style.display = 'none';
        book.style.display = 'block';
        updateButtons();
    }
}

// Efeito de Partículas (Corações Flutuantes)
function createHearts() {
    const container = document.getElementById('hearts-container');
    const heartSymbols = ['♥', '❤', '❥']; // Variações de corações
    const numberOfHearts = 20; // Quantidade de corações simultâneos

    setInterval(() => {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerText = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        
        // Posição aleatória na largura da tela
        heart.style.left = Math.random() * 100 + 'vw';
        
        // Tamanho aleatório
        const size = Math.random() * 1.5 + 0.5;
        heart.style.fontSize = size + 'rem';
        
        // Duração aleatória da animação
        heart.style.animationDuration = Math.random() * 3 + 4 + 's'; // Entre 4 e 7 segundos

        container.appendChild(heart);

        // Remove o coração do DOM após a animação terminar para não pesar
        setTimeout(() => {
            heart.remove();
        }, 8000);
    }, 400); // Cria um novo coração a cada 400ms
}

// Event Listeners Globais
window.addEventListener('resize', handleOrientationChange);
screen.orientation.addEventListener('change', handleOrientationChange);
document.addEventListener('DOMContentLoaded', handleOrientationChange);