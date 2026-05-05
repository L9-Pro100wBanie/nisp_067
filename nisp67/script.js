let balance = 1000;
let currentBetType = null;
let currentBetValue = null;
let isSpinning = false;

const wheel = document.getElementById('wheel');
const innerWheel = document.querySelector('.inner-wheel');
const resultMsg = document.getElementById('result-message');
const balanceDisplay = document.getElementById('balance');
const spinBtn = document.getElementById('spin-btn');
const selectionDisplay = document.getElementById('current-selection');
const boardContainer = document.getElementById('betting-board');

// Układ tarczy i czerwone numery
const wheelOrder = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const sliceAngle = 360 / 37;
let currentRotation = 0;

// GENEROWANIE TARCZY RULETKI
function setupWheel() {
    let gradientParts = [];
    wheelOrder.forEach((num, index) => {
        let color = num === 0 ? '#27ae60' : (redNumbers.includes(num) ? '#e74c3c' : '#2c3e50');
        let startAngle = index * sliceAngle;
        let endAngle = (index + 1) * sliceAngle;
        gradientParts.push(`${color} ${startAngle}deg ${endAngle}deg`);
    });
    wheel.style.background = `conic-gradient(${gradientParts.join(', ')})`;
}

// GENEROWANIE PLANSZY DO OBSTAWIANIA
function buildBoard() {
    // Zero
    let zeroBtn = document.createElement('button');
    zeroBtn.className = 'bet-btn board-green zero-cell';
    zeroBtn.innerText = '0';
    zeroBtn.onclick = () => selectBet('number', 0, zeroBtn);
    boardContainer.appendChild(zeroBtn);

    // Numery 1-36 układane w 3 rzędach
    const gridLayout = [
        [3,6,9,12,15,18,21,24,27,30,33,36],
        [2,5,8,11,14,17,20,23,26,29,32,35],
        [1,4,7,10,13,16,19,22,25,28,31,34]
    ];

    gridLayout.forEach((row, rowIndex) => {
        row.forEach((num, colIndex) => {
            let btn = document.createElement('button');
            let isRed = redNumbers.includes(num);
            btn.className = `bet-btn ${isRed ? 'board-red' : 'board-black'}`;
            btn.style.gridColumn = colIndex + 2;
            btn.style.gridRow = rowIndex + 1;
            btn.innerText = num;
            btn.onclick = () => selectBet('number', num, btn);
            boardContainer.appendChild(btn);
        });
    });

    // Zakłady poboczne (Outside bets) w kontenerze
    let outsideContainer = document.createElement('div');
    outsideContainer.className = 'outside-bets';

    const outsideOptions = [
        { label: 'PARZYSTE (EVEN)', type: 'parity', val: 'even' },
        { label: 'CZERWONE', type: 'color', val: 'red', extraClass: 'board-red' },
        { label: 'CZARNE', type: 'color', val: 'black', extraClass: 'board-black' },
        { label: 'NIEPARZYSTE (ODD)', type: 'parity', val: 'odd' }
    ];

    outsideOptions.forEach(opt => {
        let btn = document.createElement('button');
        btn.className = `bet-btn ${opt.extraClass || ''}`;
        btn.innerText = opt.label;
        btn.onclick = () => selectBet(opt.type, opt.val, btn);
        outsideContainer.appendChild(btn);
    });

    boardContainer.appendChild(outsideContainer);
}

// WYBÓR ZAKŁADU
function selectBet(type, value, element) {
    if (isSpinning) return;
    
    // Usuń podświetlenie z innych przycisków
    document.querySelectorAll('.bet-btn').forEach(btn => btn.classList.remove('selected'));
    
    // Zaznacz nowy
    element.classList.add('selected');
    currentBetType = type;
    currentBetValue = value;
    
    selectionDisplay.innerText = `Zakład: ${type === 'number' ? 'Liczba ' + value : value.toUpperCase()}`;
    spinBtn.disabled = false;
}

// LOGIKA KRĘCENIA
spinBtn.addEventListener('click', () => {
    const betInput = document.getElementById('bet-amount');
    const bet = parseInt(betInput.value);

    if (bet > balance) {
        resultMsg.innerHTML = "<span class='lose'>Nie masz tyle punktów!</span>";
        return;
    }

    // Pobranie stawki i blokada
    balance -= bet;
    balanceDisplay.innerText = balance;
    isSpinning = true;
    spinBtn.disabled = true;
    resultMsg.innerText = "Koło w ruchu...";
    innerWheel.innerText = "?";

    const targetIndex = Math.floor(Math.random() * 37);
    const randomNumber = wheelOrder[targetIndex];
    
    // Obliczanie animacji (identycznie jak w poprzedniej wersji)
    const targetAngle = 360 - (targetIndex * sliceAngle + (sliceAngle / 2));
    const extraSpins = 360 * 5; 
    const currentModulo = currentRotation % 360;
    const rotationToAdd = extraSpins + ((targetAngle - currentModulo + 360) % 360);
    
    currentRotation += rotationToAdd;
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    // Rozstrzygnięcie po obrocie
    setTimeout(() => {
        innerWheel.innerText = randomNumber;
        let isWin = false;
        let payoutMultiplier = 0;

        // Sprawdzanie warunków wygranej
        if (currentBetType === 'number' && currentBetValue === randomNumber) {
            isWin = true;
            payoutMultiplier = 36; // Płaci 35:1 (stawka + 35)
        } else if (currentBetType === 'color' && randomNumber !== 0) {
            let isRed = redNumbers.includes(randomNumber);
            if ((currentBetValue === 'red' && isRed) || (currentBetValue === 'black' && !isRed)) {
                isWin = true;
                payoutMultiplier = 2; // Płaci 1:1
            }
        } else if (currentBetType === 'parity' && randomNumber !== 0) {
            let isEven = randomNumber % 2 === 0;
            if ((currentBetValue === 'even' && isEven) || (currentBetValue === 'odd' && !isEven)) {
                isWin = true;
                payoutMultiplier = 2; // Płaci 1:1
            }
        }

        if (isWin) {
            let winAmount = bet * payoutMultiplier;
            balance += winAmount;
            resultMsg.innerHTML = `<span class="win">WYGRAŁEŚ! Wypadło: ${randomNumber}</span> (+${winAmount})`;
        } else {
            resultMsg.innerHTML = `<span class="lose">PRZEGRAŁEŚ! Wypadło: ${randomNumber}</span>`;
        }

        balanceDisplay.innerText = balance;
        isSpinning = false;
        
        // Zostawiamy ostatni wybrany zakład podświetlony, by można było grać dalej tym samym
        spinBtn.disabled = false;
    }, 4000);
});

// Start gry
setupWheel();
buildBoard();
/**
 * JUWENALIA 2026 - Countdown Engine
 * Profesjonalna implementacja bez wycieków pamięci
 */

const countdown = () => {
    // Ustawiamy datę docelową (15 maja 2026, 20:00)
    const targetDate = new Date('May 15, 2026 20:00:00').getTime();
    
    const update = () => {
        const now = new Date().getTime();
        const gap = targetDate - now;

        // Jeśli data minęła, czyścimy interwał
        if (gap <= 0) {
            document.getElementById('countdown').innerHTML = "<h3>ZACZYNAMY ZABAWĘ!</h3>";
            clearInterval(timerInterval);
            return;
        }

        // Magia matematyki (ms -> s -> m -> h -> d)
        const second = 1000;
        const minute = second * 60;
        const hour = minute * 60;
        const day = hour * 24;

        const d = Math.floor(gap / day);
        const h = Math.floor((gap % day) / hour);
        const m = Math.floor((gap % hour) / minute);
        const s = Math.floor((gap % minute) / second);

        // Renderowanie z formatowaniem "00"
        document.getElementById('days').innerText = d.toString().padStart(2, '0');
        document.getElementById('hours').innerText = h.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = m.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = s.toString().padStart(2, '0');
    };

    // Odpalamy raz od razu, żeby nie było widać "00" przez pierwszą sekundę
    update();
    const timerInterval = setInterval(update, 1000);
};

// Czekamy na załadowanie DOM, żeby nie wywalić błędów
document.addEventListener('DOMContentLoaded', countdown);

/**
 * MOBILE MENU LOGIC
 */
const initMobileMenu = () => {
    const menu = document.querySelector('#mobile-menu');
    const links = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    // Toggle menu
    menu.addEventListener('click', () => {
        menu.classList.toggle('active');
        links.classList.toggle('active');
    });

    // Zamknij menu po kliknięciu w dowolny link (scroll do sekcji)
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            menu.classList.remove('active');
            links.classList.remove('active');
        });
    });
};

// Dodaj wywołanie w DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    countdown(); // Twoja poprzednia funkcja
    initMobileMenu();
});
