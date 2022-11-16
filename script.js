"use strict";

const words = [
  {
    "en": "famine",
    "ru": "голод",
    "example": "My grandmother told me about famine."
  },
  {
    "en": "peel",
    "ru": "чистить",
    "example": "I always help my mother peel potatoes."
  },
  {
    "en": "parsley",
    "ru": "петрушка",
    "example": "You can use parsley to decorate your food."
  },
  {
    "en": "dill",
    "ru": "укроп",
    "example": "The dill is very good for our health."
  },
  {
    "en": "sprinkle",
    "ru": "поливать",
    "example": "I like to sprinkle my pancakes with walnuts."
  },
]

const cardFront = document.querySelector("#card-front h1");
const cardBack = document.querySelector("#card-back h1");
const cardBackExample = document.querySelector("#card-back p span");

const back = document.querySelector("#back");
const next = document.querySelector("#next");

const totalWord = document.querySelector("#total-word");
totalWord.textContent = words.length;

const currentWord = document.querySelector("#current-word");
let currentWordCount = 1;

const wordsProgress = document.querySelector("#words-progress");

//////////////////////////////////////////////////////////////////

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function makeCard(n) {
  cardFront.textContent = words[n].en;
  cardBack.textContent = words[n].ru;
  cardBackExample.textContent = words[n].example;
}

function slideCards(condition, elem) {
  if (i === condition) {
    event.target.setAttribute("disabled", "disabled");
  }

  makeCard(i);

  elem.removeAttribute("disabled");
}

function trackProgress(mode, percent) {
  mode.setAttribute("value", percent);
}

//////////////////////////////////////////////////////////////////

let i = 0;
makeCard(i);
localStorage.setItem("currentWord", cardFront.textContent);

const orderCards = {};
  words.forEach(function(item, index) {
    orderCards[index] = words[index].en;
  })

//////////////////////////////////////////////////////////////////

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const shuffleBtn = document.querySelector("#shuffle-words");

shuffleBtn.addEventListener("click", () => {
  shuffle(words);
  makeCard(i);

  localStorage.setItem("currentWord", cardFront.textContent);

  words.forEach((item, index) => {
    orderCards[index] = item.en;
  });
  localStorage.setItem("orderCards", JSON.stringify(orderCards));
});

//////////////////////////////////////////////////////////////////

next.addEventListener("click", () => {
  //i++;
  i = (i + 1) % words.length;
  makeCard(i);

  currentWord.textContent = ++currentWordCount;
  trackProgress(wordsProgress, ((i * 100) / (words.length - 1)));

  slideCards(words.length - 1, back);

  localStorage.setItem("currentWord", cardFront.textContent);
})

back.addEventListener("click", (event) => {
  //i--;
  i = (i + words.length - 1) % words.length;
  makeCard(i);

  currentWord.textContent = --currentWordCount;
  trackProgress(wordsProgress, ((i * 100) / (words.length - 1)));

  slideCards(0, next);

  localStorage.setItem("currentWord", cardFront.textContent);
});

//////////////////////////////////////////////////////////////////

const flip = document.querySelector(".flip-card");
flip.addEventListener("click", () => {
  flip.classList.toggle("active");
});

//////////////////////////////////////////////////////////////////

const examCardsContainer = document.querySelector("#exam-cards");
const exam = document.querySelector("#exam");

const correctPercent = document.querySelector("#correct-percent");
const examProgress = document.querySelector("#exam-progress");

const time = document.querySelector("#time");

//////////////////////////////////////////////////////////////////

let timerId = null;
const minutesSeconds = time.textContent.split(":");
let minutes = "00";
let seconds = +minutesSeconds[1];

function countTime() {
  seconds++;

  if (seconds > 59) {
    seconds = 0;
    minutes++;

    if (minutes < 10) {
      minutes = "0" + minutes;
    }
  }

  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  minutesSeconds[0] = minutes;
  minutesSeconds[1] = seconds;
  time.textContent = minutesSeconds.join(":");
}

//////////////////////////////////////////////////////////////////

const testWords = {};
words.forEach((word) => {
  testWords[word.en] = word.ru;
});

//////////////////////////////////////////////////////////////////

exam.addEventListener("click", () => {
  document.querySelector("#exam-mode").classList.toggle("hidden");
  document.querySelector("#study-mode").classList.toggle("hidden");
  document.querySelector(".study-cards").classList.toggle("hidden");

  const fragmentTest = new DocumentFragment();

  for (let testWord in testWords) {
    const divEn = document.createElement("div");
    divEn.classList.add("card");
    divEn.textContent = testWord;

    const divRu = document.createElement("div");
    divRu.classList.add("card");
    divRu.textContent = testWords[testWord];

    fragmentTest.append(divEn, divRu);
  }

  examCardsContainer.append(fragmentTest);

  const cards = document.querySelectorAll("#exam-cards div");
  
  cards.forEach(card => {
    card.style.order = getRandomInt(cards.length);
  });

  timerId = setInterval(countTime, 1000);
});

//////////////////////////////////////////////////////////////////

const resultsModal = document.querySelector(".results-modal");
const resultsContent = document.querySelector(".results-content");
const resultsTime = document.querySelector("#timer");
const wordStatsTemplate = document.querySelector("#word-stats");

const statsFragment = new DocumentFragment();

function makeWordStats(word, click) {
  const wordStats = wordStatsTemplate.content.cloneNode(true);
  wordStats.querySelector(".word span").textContent = word;
  wordStats.querySelector(".attempts span").textContent = click;

  statsFragment.append(wordStats);
}

//////////////////////////////////////////////////////////////////

const attemptCounter = {};
words.forEach((word) => {
  attemptCounter[word.en] = 0;
});

//////////////////////////////////////////////////////////////////

let firstWord = null;
let secondWord = null;
let count = 0;
let right = 0;
let wrong = 0;

examCardsContainer.addEventListener("click", function exam(e) {
  if (e.target === e.currentTarget) {
    return;
  }

  for (let enWord in attemptCounter) {
    if (e.target.textContent === enWord) {
      attemptCounter[e.target.textContent]++;
    }
  }

  if (!firstWord) {
    firstWord = e.target;
    firstWord.classList.add("correct");
    return;
  }

  secondWord = e.target; 

  if (secondWord.textContent === testWords[firstWord.textContent] || firstWord.textContent === testWords[secondWord.textContent]) {
    secondWord.classList.add("correct");
    firstWord.classList.add("fade-out");
    secondWord.classList.add("fade-out");
    firstWord.style.pointerEvents = "none";
    secondWord.style.pointerEvents = "none";

    firstWord = null;

    count++;

    let percentCount = ((count * 100) / (words.length));
    correctPercent.textContent = Math.round(percentCount) + "%";
    trackProgress(examProgress, percentCount);
  } else {
    secondWord.classList.add("wrong");

    setTimeout(() => {
      secondWord.classList.remove("wrong");
      firstWord.classList.remove("correct");
      firstWord = null;
    }, 500);
  }

  setTimeout(() => {
    if (count === words.length) {
      this.removeEventListener("click", exam);
      clearInterval(timerId);
      localStorage.setItem("examTime", time.textContent);
      alert("win");

      for (let enWord in attemptCounter) {
        makeWordStats(enWord, attemptCounter[enWord]);

        if (attemptCounter[enWord] > 1) {
          localStorage.setItem("wrong", ++wrong);
          localStorage.setItem("right", words.length - wrong);
        } else {
          localStorage.setItem("right", ++right);
          localStorage.setItem("wrong", 0);
        }
      }
      resultsContent.append(statsFragment);
      resultsTime.textContent = time.textContent;
      resultsModal.classList.remove("hidden");
    }
  }, 600)
});

//////////////////////////////////////////////////////////////////



