const wordList = ['APPLE', 'MANGO', 'GRAPE', 'BANANA', 'PEACH'];
let secretWord = wordList[Math.floor(Math.random() * wordList.length)];
let currentGuess = '';
let currentRow = 0;
let timer; // Timer variable
let secondsElapsed = 0; // Seconds counter

const board = document.getElementById('game-board');
const messageDisplay = document.getElementById('message'); // Message area
const timerDisplay = document.getElementById('timer'); // Timer display area

for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.id = `row-${i}-col-${j}`;
        board.appendChild(tile);
    }
}

// Event listener for physical keyboard inputs
document.addEventListener('keydown', handlePhysicalKeyPress);

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        handleKeyPress(key.innerText);
    });
});

function handlePhysicalKeyPress(event) {
    const key = event.key.toUpperCase();
    if (key === 'ENTER') {
        if (currentGuess.length === 5) {
            checkWordValidity(currentGuess);
        } else {
            displayMessage('Word must be 5 letters long!');
        }
    } else if (key === 'BACKSPACE') {
        removeLastLetter();
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) { // Allow only letters A-Z
        addLetter(key);
    }
}

function handleKeyPress(key) {
    if (key === 'Enter') {
        if (currentGuess.length === 5) {
            checkWordValidity(currentGuess);
        } else {
            displayMessage('Word must be 5 letters long!');
        }
    } else if (key === 'Backspace') {
        removeLastLetter();
    } else if (currentGuess.length < 5) {
        addLetter(key);
    }
}

function addLetter(letter) {
    currentGuess += letter;
    const tile = document.getElementById(`row-${currentRow}-col-${currentGuess.length - 1}`);
    tile.innerText = letter;

    // Start the timer on the first letter entry
    if (currentGuess.length === 1 && !timer) {
        startTimer();
    }
}

function removeLastLetter() {
    if (currentGuess.length > 0) {
        // Remove the last letter from currentGuess
        currentGuess = currentGuess.slice(0, -1);
        // Get the last tile index
        const tileIndex = currentGuess.length; // The index of the last filled tile
        const tile = document.getElementById(`row-${currentRow}-col-${tileIndex}`);
        tile.innerText = ''; // Clear the tile content
    }
}

// Timer functions
function startTimer() {
    timer = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    timerDisplay.innerText = `Time: ${secondsElapsed}s`;
}

// Fetch the word validity from Datamuse API
function checkWordValidity(word) {
    fetch(`https://api.datamuse.com/words?sp=${word}&max=1`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0 && data[0].word.toUpperCase() === word) {
                checkGuess();
            } else {
                displayMessage("Word does not exist!");
                currentGuess = ''; // Clear the current guess after invalid word
                for (let i = 0; i < 5; i++) {
                    const tile = document.getElementById(`row-${currentRow}-col-${i}`);
                    tile.innerText = ''; // Clear the row tiles
                }
            }
        })
        .catch(error => {
            console.error('Error checking word validity:', error);
        });
}

// Display messages in the message area
function displayMessage(message) {
    messageDisplay.innerText = message;
    messageDisplay.style.display = 'block'; // Ensure the message is visible
}

// Update key colors based on the guess
function updateKeyColors(guessArray, secretArray, colorCodes) {
    guessArray.forEach((letter, index) => {
        const keyElement = document.querySelector(`.key[data-letter="${letter}"]`);
        if (keyElement) {
            if (colorCodes[index] === 'green') {
                keyElement.style.backgroundColor = 'green'; // Correct letter in the correct position
            } else if (colorCodes[index] === 'yellow') {
                keyElement.style.backgroundColor = 'yellow'; // Correct letter in the wrong position
            } else {
                keyElement.style.backgroundColor = 'gray'; // Letter not in the word
            }
        }
    });
}

// Check the user's guess and change tile colors based on Wordle rules
function checkGuess() {
    const secretArray = secretWord.split('');
    const guessArray = currentGuess.split('');

    const colorCodes = new Array(5).fill('gray');

    // Step 1: Mark correct positions (Green)
    for (let i = 0; i < 5; i++) {
        if (guessArray[i] === secretArray[i]) {
            colorCodes[i] = 'green';
            secretArray[i] = null; // Mark the letter in the secret word as "used"
        }
    }

    // Step 2: Mark wrong positions (Yellow)
    for (let i = 0; i < 5; i++) {
        if (colorCodes[i] === 'green') continue; // Skip already marked green tiles
        const indexInSecret = secretArray.indexOf(guessArray[i]);
        if (indexInSecret !== -1) {
            colorCodes[i] = 'yellow';
            secretArray[indexInSecret] = null; // Mark the letter in the secret word as "used"
        }
    }

    // Step 3: Apply the colors to the tiles with class changes for animation
    for (let i = 0; i < 5; i++) {
        const tile = document.getElementById(`row-${currentRow}-col-${i}`);
        tile.classList.add(colorCodes[i]); // Add the corresponding class for color
    }

    // Update key colors
    updateKeyColors(guessArray, secretArray, colorCodes);

    // Check if the guess was correct
    if (currentGuess === secretWord) {
        // Stop the timer
        clearInterval(timer);
        // Delay the success message by 1 second to allow the colors to show first
        setTimeout(() => {
            displayMessage(`You got it in ${currentRow + 1} ${currentRow === 0 ? 'try' : 'tries'}! Time taken: ${secondsElapsed}s`);
        }, 1000);
    } else {
        // Increment the timer by 30 seconds for every guess
        secondsElapsed += 30;
        currentGuess = '';
        currentRow++;
        updateTimerDisplay(); // Update display after incrementing

        if (currentRow === 6) {
            // Stop the timer if attempts are exhausted
            clearInterval(timer);
            setTimeout(() => {
                displayMessage(`You've used all attempts! The word was: ${secretWord}. Time taken: ${secondsElapsed}s`);
            }, 1000); // Delay the alert to ensure tile colors are applied before the message
        }
    }
}
