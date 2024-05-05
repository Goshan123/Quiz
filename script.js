//HTML элементы
let categoriesList = document.querySelectorAll(".categories p");
let difficulty = document.querySelectorAll(".difficulty p");
let numSelect = document.querySelectorAll(".number p");
let answerButton = document.querySelector(".answer-button");
let questionsAnswers = questionsPage.querySelectorAll(".answer");
let startAgainButton = document.querySelector(".start-again-button");
let root = document.querySelector(".root")
let startButton = document.querySelector(".start-quiz");
let resultText = document.querySelector(".user-result");
//страницы
let startPage = document.querySelector("#start-page");
let loadingPage = document.getElementById("loading-page");
let questionsPage = document.getElementById("questions-page");
let resultPage = document.querySelector("#result-page");
//программные переменные
let quizInfo = [];
let userAnswers = [];
let activeQuestionIndex = 0;
let quizQuery = {
  categories: [],
  difficulty: "",
  number: "",
};
//Event Listeners
startAgainButton.addEventListener("click", () => {
  location.reload();
});
document.addEventListener("DOMContentLoaded", () => {
  chooseFewElements(categoriesList);
  chooseOneElement(difficulty, "active", (id) => {
    setQuizQuery("difficulty", id);
  });
  chooseOneElement(numSelect, "active", (id) => {
    setQuizQuery("number", id);
  });
  chooseOneElement(
    questionsPage.querySelectorAll(".answer"),
    "active-answer",
    (id) => {}
  );
});
startButton.addEventListener("click", () => {
  if (quizQuery.categories.length && quizQuery.difficulty && quizQuery.number) {
    sendQuizRequest();
    togglePageVisibility(startPage, loadingPage);
    setTimeout(() => {
      togglePageVisibility(loadingPage, questionsPage);
      renderQuizQuestion(quizInfo[activeQuestionIndex]);
    }, 1500);
  } else {
    alert("You should select all of the following quiz parametres");
  }
});
answerButton.addEventListener("click", () => {
  let questionsAnswersArray = Array.from(questionsAnswers);
  let userAnswer = questionsAnswersArray.find((el) => {
    return el.classList.contains("active-answer");
  });
  if (userAnswer) {
    userAnswers.push(userAnswer.textContent);
    userAnswer.classList.remove("active-answer");
    activeQuestionIndex = activeQuestionIndex + 1;
    if (activeQuestionIndex < quizInfo.length) {
      renderQuizQuestion(quizInfo[activeQuestionIndex]);
    } else {
      renderResultPage();
    }
  } else {
    alert("You must choose one of the answers");
  }
});
//функции 
function resetActiveClass(list, className) {
  //удаление класса active у всех элементов списка
  list.forEach((el) => {
    el.classList.remove(className);
  });
}
function chooseOneElement(nodeList, className, handler) {
  //выбор элемента в колонке с количеством вопросов и в колонке с сложностью
  nodeList.forEach((el) => {
    el.addEventListener("click", () => {
      if (el.classList.contains(className)) {
        return;
      }
      resetActiveClass(nodeList, className);
      el.classList.add(className);
      handler(el.id);
    });
  });
}
function chooseFewElements(nodeList) {
  //выбор категорий
  nodeList.forEach((el) => {
    el.addEventListener("click", () => {
      if (el.classList.contains("active")) {
        el.classList.remove("active");
        setQuizQuery(
          "categories",
          quizQuery.categories.filter((item) => {
            return item != el.id;
          })
        );
      } else {
        el.classList.add("active");
        let newValue = quizQuery.categories;
        newValue.push(el.id);
        setQuizQuery("categories", newValue);
      }
    });
  });
}
function setQuizQuery(key, value) {
  //устанавливаем значение переменной quizQuery по ключу
  quizQuery[key] = value === "random" ? getRandomNuber(5, 15) : value;
}
function getRandomNuber(min, max) {
  //получение рандомного целого числа если выберут от 5 до 15 вопросов
  return Math.round(Math.random() * (max - min) + min);
}
function sendQuizRequest() {
  //отправление запроса на сервер с выбранными пользователем значениями query параметров
  fetch(
    `https://the-trivia-api.com/v2/questions?limit=${
      quizQuery.number
    }&categories=${quizQuery.categories.join(",")}&difficulties=${
      quizQuery.difficulty
    }`
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      quizInfo = data.map((el) => {
        return {
          question: el.question.text,
          correctAnswer: el.correctAnswer,
          incorrectAnswers: el.incorrectAnswers,
        };
      });
    });
}
function togglePageVisibility(hiddenPage, openPage) {
  //переход на новую страницу
  openPage.classList.remove("hidden");
  hiddenPage.classList.add("hidden");
}
function renderQuizQuestion(quizItem) {
  //отображение вопроса с ответами квиза
  let questionHeader = questionsPage.querySelector("h2");
  questionHeader.textContent = quizItem.question;
  let answerArray = quizItem.incorrectAnswers.concat([quizItem.correctAnswer]);
  let answerIndexOrder = getAnswerIndexOrder();
  questionsAnswers.forEach((el, index) => {
    el.textContent = answerArray[answerIndexOrder[index]];
  });
}
function getAnswerIndexOrder() {
  //возвращает массив чисел 0,1,2,3 в рандомном порядке
  let answerIndexOrder = [];
  while (answerIndexOrder.length < 4) {
    let randomIndex = getRandomNuber(0, 3);
    if (!answerIndexOrder.includes(randomIndex)) {
      answerIndexOrder.push(randomIndex);
    }
  }
  return answerIndexOrder;
}
function getRightAnswers(quizInfo) {
  let rightAnswers = quizInfo.map((el) => {
    return el.correctAnswer;
  });
  return rightAnswers;
}
function renderResultPage() {
  togglePageVisibility(questionsPage, resultPage);
  root.style.overflow = "auto"
  root.style.height = "auto"
  let rightAnswers = getRightAnswers(quizInfo);
  let userRightAnswersNumber = getEqualElementsNumber(
    rightAnswers,
    userAnswers
  );
  document.querySelector(".quiz-result").textContent =
    userRightAnswersNumber + "/" + userAnswers.length;
    renderQuestionInfo()
}
function getEqualElementsNumber(arr1, arr2) {
  let matches = 0;
  arr1.forEach((el, index) => {
    if (el === arr2[index]) {
      matches = matches + 1;
    }
  });
  return matches;
}
function renderQuestionInfo() {
  let fragment = "";
  let resultCont = document.querySelector(".result-cont");
  quizInfo.forEach((el, index) => {
    let questionInfo = `
    <div class="result-question">
    <p class="result-question-header">${el.question}</p>
    <p>Your answer: <span class="user-answer">${userAnswers[index]}</span></p>
    <p>Right answer: <span class="right-answer">${el.correctAnswer}</span></p>
  </div>`;
    fragment += questionInfo;// тоже самое что fragment = fragment + questioonInfo
  });
  resultCont.insertAdjacentHTML("afterbegin", fragment)
}