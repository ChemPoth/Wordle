const words = [
    "PLANE", "APPLE", "GRAPE", "HOUSE", "FLAME", "CLOUD", "SHINE", 
    "CRANE", "TIGER", "HAPPY", "BRAVE", "SNAKE", "WATER", "PEACE", 
    "SMILE", "LIGHT", "STORM", "EARTH", "FLOOR", "SWEET", // Add more words as needed
  ];
  
  const targetWord = words[Math.floor(Math.random() * words.length)]; // Randomly select a word
  let currentGuess = "";
  let currentRow = 0;
  let attempts = 6;
  let timer;
  let timeInSeconds = 0;
  let timerStarted = false;
  
  // Function to check if the word is valid using Free Dictionary API
  async function isValidWord(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    return response.ok;
  }
  
  // Initialize grid
  const grid = document.getElementById("grid");
  for (let i = 0; i < attempts * 5; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    grid.appendChild(cell);
  }
  
  // Display message function
  function displayMessage(message) {
    const messageEl = document.getElementById("message");
    messageEl.textContent = message;
    messageEl.style.opacity = "1";
    setTimeout(() => { messageEl.style.opacity = "0"; }, 2000);
  }
  
  // Timer display function
  function startTimer() {
    timer = setInterval(() => {
      timeInSeconds++;
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = timeInSeconds % 60;
      document.getElementById("timer").textContent = `Time: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }, 1000);
  }
  
  // Stop the timer function
  function stopTimer() {
    clearInterval(timer);
  }
  
  // Update the timer to add 30 seconds on each attempt
  function addExtraTime() {
    timeInSeconds += 30;
  }
  
  // Handle keyboard input
  document.addEventListener("keydown", handleKeyPress);
  document.querySelectorAll(".key").forEach(button => button.addEventListener("click", () => handleKeyPress({ key: button.textContent })));
  
  // Main keyboard and grid input function
  function handleKeyPress(event) {
    const key = event.key.toUpperCase();
  
    if (key === "ENTER") {
      if (currentGuess.length === 5) {
        isValidWord(currentGuess).then(valid => {
          if (valid) {
            if (!timerStarted) {
              startTimer();
              timerStarted = true;
            }
            checkGuess();
            currentGuess = "";
            currentRow++; // Move to next row only if the word is valid
            addExtraTime();
          } else {
            displayMessage("Word not found");
            shakeRow(currentRow);
          }
        });
      } else {
        displayMessage("Enter a 5-letter word");
        shakeRow(currentRow);
      }
    } else if (key === "BACKSPACE") {
      currentGuess = currentGuess.slice(0, -1);
      updateGrid();
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      currentGuess += key;
      updateGrid();
    }
  }
  
  // Update the grid display
  function updateGrid() {
    const cells = document.querySelectorAll(".cell");
    for (let i = 0; i < 5; i++) {
      const cell = cells[currentRow * 5 + i];
      cell.textContent = currentGuess[i] || "";
    }
  }
  
  // Check the guessed word, apply animations, and update keyboard colors
  function checkGuess() {
    const cells = document.querySelectorAll(".cell");
    const guessArray = currentGuess.split("");
  
    guessArray.forEach((letter, index) => {
      const cell = cells[currentRow * 5 + index];
      
      setTimeout(() => {
        cell.style.transform = "rotateX(90deg)"; // Flip animation start
        setTimeout(() => {
          if (letter === targetWord[index]) {
            cell.classList.add("correct");
            updateKeyboard(letter, "correct");
          } else if (targetWord.includes(letter)) {
            cell.classList.add("present");
            updateKeyboard(letter, "present");
          } else {
            cell.classList.add("absent");
            updateKeyboard(letter, "absent");
          }
          cell.style.transform = "rotateX(0deg)"; // Flip animation end
        }, 150);
      }, 250 * index); // Delayed flip for each letter
    });
  
    // Check if player has won or lost
    if (currentGuess === targetWord) {
      displayMessage("Congratulations! You've won!");
      stopTimer();
      document.removeEventListener("keydown", handleKeyPress);
    } else if (currentRow === attempts - 1) {
      displayMessage(`Game over! The word was: ${targetWord}.`);
      stopTimer();
      document.removeEventListener("keydown", handleKeyPress);
    }
  }
  
  // Update keyboard color based on feedback
  function updateKeyboard(letter, status) {
    const key = [...document.querySelectorAll(".key")].find(key => key.textContent === letter);
    if (key && (!key.classList.contains("correct") || status === "correct")) {
      key.className = `key ${status}`;
    }
  }
  
  // Shake the row for invalid input
  function shakeRow(row) {
    const cells = document.querySelectorAll(".cell");
    for (let i = 0; i < 5; i++) {
      const cell = cells[row * 5 + i];
      cell.classList.add("shake");
      cell.addEventListener("animationend", () => {
        cell.classList.remove("shake");
      });
    }
  }
  