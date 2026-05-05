let balance = 1000;
const wheel = document.getElementById('wheel');
const resultMsg = document.getElementById('result-message');
const balanceDisplay = document.getElementById('balance');

function placeBet(chosenColor) {
    const betInput = document.getElementById('bet-amount');
    const bet = parseInt(betInput.value);

    if (bet > balance) {
        resultMsg.innerText = "Nie masz tyle punktów!";
        return;
    }

    // Blokada przycisków na czas kręcenia
    document.querySelectorAll('.color-buttons button').forEach(b => b.disabled = true);
    
    resultMsg.innerText = "Kręcimy...";
    
    // Losowanie wyniku (0-36, jak w ruletce)
    const randomNumber = Math.floor(Math.random() * 37);
    let winningColor = '';

    if (randomNumber === 0) {
        winningColor = 'green';
    } else if ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(randomNumber)) {
        winningColor = 'red';
    } else {
        winningColor = 'black';
    }

    // Animacja kręcenia (pełne obroty + losowy kąt)
    const extraDegrees = 1800 + (Math.random() * 360);
    wheel.style.transform = `rotate(${extraDegrees}deg)`;

    setTimeout(() => {
        // Ustawienie koloru koła na wynikowy
        if (winningColor === 'red') wheel.style.background = '#e74c3c';
        else if (winningColor === 'black') wheel.style.background = '#2c3e50';
        else wheel.style.background = '#27ae60';

        wheel.querySelector('.inner-wheel').innerText = randomNumber;

        if (chosenColor === winningColor) {
            let winAmount = winningColor === 'green' ? bet * 14 : bet * 2;
            balance += winAmount;
            resultMsg.innerHTML = `<span class="win">WYGRAŁEŚ!</span> (+${winAmount})`;
        } else {
            balance -= bet;
            resultMsg.innerHTML = `<span class="lose">PRZEGRAŁEŚ!</span> (-${bet})`;
        }

        balanceDisplay.innerText = balance;
        document.querySelectorAll('.color-buttons button').forEach(b => b.disabled = false);
        
        // Reset rotacji po chwili (opcjonalne)
        setTimeout(() => { wheel.style.transition = 'none'; wheel.style.transform = 'rotate(0deg)'; setTimeout(() => wheel.style.transition = 'transform 3s cubic-bezier(0.1, 0, 0.2, 1)', 50); }, 2000);
    }, 3000);
}


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