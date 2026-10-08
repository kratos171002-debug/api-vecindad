$(function () {
  window.appApiData = null;

  async function loadApiData() {
    const service = window.ApiDataService.createDataService({
      endpoint: "https://api-vecindad-1.onrender.com/api.json",
      fallback: "https://api-vecindad-1.onrender.com/data.json",
      fetcher: typeof fetch === "function" ? fetch.bind(globalThis) : null,
      fallbackFetcher: typeof fetch === "function" ? fetch.bind(globalThis) : null
    });

    try {
      const result = await service.load();
      window.appApiData = result.data;

      if (result.source === "online") {
        $("#api-status").text("API JSON conectada");
        console.info("API JSON conectada");
        $(".live-dot").removeClass("is-offline");
      } else {
        $("#api-status").text("Modo offline · datos locales");
        console.info("Modo offline · datos locales");
        $(".live-dot").addClass("is-offline");
      }
    } catch (error) {
      $("#api-status").text("Error API");
      $(".live-dot").addClass("is-offline");
      console.error("Error API", error);
    }
  }

  loadApiData();

  $("#enter-vecindad").on("click", function () {
    $("body").removeClass("is-landing");
  });

  const characterPhotos = {
    "EL CHAVO": "images/chavo.jpg",
    "QUICO": "images/quico.avif",
    "LA CHILINDRINA": "images/chilindrina.jpg",
    "DON RAMÓN": "images/don ramon.jpg",
    "DOÑA FLORINDA": "images/doña florinda.jpg",
    "SEÑOR BARRIGA": "images/señor barriga.webp"
  };

  function showView(panelId) {
    $(".view-tab").removeClass("is-active").attr("aria-selected", "false");

    const $targetTab = $("#tab-" + panelId.replace("-view", ""));
    if ($targetTab.length) {
      $targetTab.addClass("is-active").attr("aria-selected", "true");
    }

    $(".view-panel").prop("hidden", true);
    $("#" + panelId).prop("hidden", false);
  }

  $(".view-tab").on("click", function () {
    showView($(this).attr("aria-controls"));
  });

  $(".quick-link").on("click", function () {
    showView($(this).data("viewTarget"));
    document.querySelector("#" + $(this).data("viewTarget")).scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const jokeQuestions = [
    {
      question: "¿Por qué el Chavo lleva una escalera al patio?",
      correctIndex: 1,
      answerText: "Para llegar a la altura de la situación",
      options: ["Para probar la gravedad", "Para llegar a la altura de la situación", "Para esconder una pelota"]
    },
    {
      question: "¿Qué hace el Quico cuando se queda sin pelota?",
      correctIndex: 0,
      answerText: "Busca una pelota nueva",
      options: ["Busca una pelota nueva", "Hace una canción", "Pide ayuda al gato"]
    },
    {
      question: "¿Por qué la Chilindrina guarda un reloj en la boca?",
      correctIndex: 0,
      answerText: "Para saber cuándo decir 'ya llego'",
      options: ["Para saber cuándo decir 'ya llego'", "Para contar los segundos", "Para escuchar el patio"]
    }
  ];
  let jokeIndex = 0;
  let jokeScore = 0;
  let jokeAnswered = false;
  let jokeFinished = false;

  function showJoke() {
    const currentJoke = jokeQuestions[jokeIndex];
    jokeAnswered = false;
    jokeFinished = false;
    $("#joke-number").text("CHISTE " + (jokeIndex + 1));
    $("#joke-question").text(currentJoke.question);
    $("#joke-score").text(jokeScore + " / 3");
    $("#joke-feedback").text("");
    $("#joke-next").prop("hidden", true);

    const $options = $("#joke-options").empty();
    currentJoke.options.forEach(function (option, index) {
      $("<button>", {
        class: "joke-option",
        type: "button",
        "data-answer": String(index === currentJoke.correctIndex),
        text: option
      }).appendTo($options);
    });
  }

  $("#joke-options").on("click", ".joke-option", function () {
    if (jokeAnswered || jokeIndex >= jokeQuestions.length) return;
    jokeAnswered = true;
    const selectedIndex = $(this).index();
    const currentJoke = jokeQuestions[jokeIndex];
    const isCorrect = $(this).data("answer") === true;

    $("#joke-options .joke-option").prop("disabled", true).each(function () {
      const buttonIndex = $(this).index();
      $(this).toggleClass("is-correct", buttonIndex === currentJoke.correctIndex);
      $(this).toggleClass("is-wrong", buttonIndex === selectedIndex && !isCorrect);
    });

    if (isCorrect) jokeScore += 1;
    $("#joke-score").text(jokeScore + " / 3");
    $("#joke-feedback").text(isCorrect ? "¡Correcto! El chiste quedó limpio." : "No. La respuesta era: " + currentJoke.answerText);
    $("#joke-next").text(jokeIndex === jokeQuestions.length - 1 ? "Ver resultados" : "Chiste siguiente").prop("hidden", false);
  });

  $("#joke-next").on("click", function () {
    if (jokeFinished) {
      jokeIndex = 0;
      jokeScore = 0;
      showJoke();
      return;
    }

    if (jokeIndex >= jokeQuestions.length - 1) {
      jokeFinished = true;
      $("#joke-number").text("RESULTADO");
      $("#joke-question").text(jokeScore === jokeQuestions.length ? "¡Tres chistes correctos! La vecindad quedó sorprendida." : "¡Buen intento! El chiste también se ríe de uno.");
      $("#joke-options").empty();
      $("#joke-feedback").text("Puntaje final: " + jokeScore + " de 3.");
      $("#joke-next").text("Jugar otra vez").prop("hidden", false);
      return;
    }

    jokeIndex += 1;
    showJoke();
  });

  $("#exit-to-main").on("click", function () {
    $("body").addClass("is-landing");
    $(".view-panel").prop("hidden", true);
    $("#tab-comic").addClass("is-active").attr("aria-selected", "true");
    $("#tab-games, #tab-thanks").removeClass("is-active").attr("aria-selected", "false");
    $("#comic-view").prop("hidden", false);
  });

  function toggleThankYouModal(forceOpen) {
    const $modal = $("#thank-you-modal");
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : $modal.prop("hidden");
    $modal.prop("hidden", !shouldOpen).attr("aria-hidden", String(!shouldOpen));
  }

  $("#open-thank-you-image").on("click", function () {
    toggleThankYouModal(true);
  });

  $("#close-thank-you-image, [data-close='true']").on("click", function () {
    toggleThankYouModal(false);
  });

  $(document).on("keydown", function (event) {
    if (event.key === "Escape") toggleThankYouModal(false);
  });

  function showGamePanel(panelId) {
    $(".game-tab").removeClass("is-active").attr("aria-selected", "false");
    $(".mini-game-link").removeClass("is-active");
    $(".game-panel").prop("hidden", true);
    $("#" + panelId).prop("hidden", false);
    $("#tab-" + panelId.replace("-panel", "") + "-game").addClass("is-active").attr("aria-selected", "true");
    $(".mini-game-link[data-game-panel='" + panelId + "']").addClass("is-active");
  }

  $(".game-tab").on("click", function () {
    showGamePanel($(this).attr("aria-controls"));
  });

  $(".mini-game-link").on("click", function () {
    showGamePanel($(this).data("gamePanel"));
  });

  let gameScore = 0;
  let gameTime = 15;
  let gameTimer = null;
  let snackMover = null;

  function moveSnack() {
    const arena = document.querySelector("#game-arena");
    const snack = document.querySelector("#snack-target");
    const maxLeft = Math.max(0, arena.clientWidth - snack.offsetWidth);
    const maxTop = Math.max(0, arena.clientHeight - snack.offsetHeight - 104);
    snack.style.left = Math.round(Math.random() * maxLeft) + "px";
    snack.style.top = Math.round(12 + Math.random() * maxTop) + "px";
  }

  function finishGame() {
    window.clearInterval(gameTimer);
    window.clearInterval(snackMover);
    gameTimer = null;
    snackMover = null;
    $("#snack-target").prop("hidden", true);
    $("#game-message").text("¡Se acabó! Rescataste " + gameScore + (gameScore === 1 ? " torta." : " tortas."));
    $("#game-start").text("Jugar otra vez");
  }

  $("#game-start").on("click", function () {
    window.clearInterval(gameTimer);
    window.clearInterval(snackMover);
    gameScore = 0;
    gameTime = 15;
    $("#game-score").text(gameScore);
    $("#game-time").text(gameTime);
    $("#game-message").text("¡Corre, Chavo!");
    $("#snack-target").prop("hidden", false);
    $(this).text("Jugando...");
    moveSnack();
    snackMover = window.setInterval(moveSnack, 700);
    gameTimer = window.setInterval(function () {
      gameTime -= 1;
      $("#game-time").text(gameTime);
      if (gameTime <= 0) finishGame();
    }, 1000);
  });

  $("#snack-target").on("click", function () {
    if (gameTimer === null) return;
    gameScore += 1;
    $("#game-score").text(gameScore);
    $("#game-message").text(gameScore % 3 === 0 ? "¡Buen provecho!" : "¡Ñam!");
    moveSnack();
  });

  const mysteryCases = [
    { clue: "Desapareció la torta. Solo quedaron migas y una servilleta junto a un barril. ¿Quién fue?", answer: "EL CHAVO", choices: ["EL CHAVO", "QUICO", "DON RAMÓN"] },
    { clue: "El silbato estaba en el bolsillo de quien juró que no lo había visto. ¿Quién fue?", answer: "LA CHILINDRINA", choices: ["LA CHILINDRINA", "DOÑA FLORINDA", "DON RAMÓN"] },
    { clue: "El último juguete terminó en una colección de trofeos. ¿Quién lo guardó?", answer: "QUICO", choices: ["QUICO", "SEÑOR BARRIGA", "DOÑA FLORINDA"] }
  ];
  let mysteryRound = 0;
  let mysteryScore = 0;
  let mysteryAnswered = false;

  function showMysteryCase() {
    if (mysteryRound >= mysteryCases.length) {
      $("#mystery-round").text("CASO CERRADO");
      $("#mystery-clue").text("Puntaje final: " + mysteryScore + " de " + mysteryCases.length + ".");
      $("#mystery-choices").empty();
      $("#mystery-feedback").text("¡Gracias por ayudar a la vecindad!");
      $("#mystery-next").text("Jugar otra vez").prop("hidden", false);
      return;
    }

    const currentCase = mysteryCases[mysteryRound];
    mysteryAnswered = false;
    $("#mystery-round").text("CASO " + (mysteryRound + 1) + " DE " + mysteryCases.length);
    $("#mystery-score").text(mysteryScore);
    $("#mystery-clue").text(currentCase.clue);
    $("#mystery-feedback").text("");
    $("#mystery-next").prop("hidden", true);
    const $choices = $("#mystery-choices").empty();

    currentCase.choices.forEach(function (character) {
      const photo = characterPhotos[character];
      const $button = $("<button>", {
        class: "mystery-choice",
        type: "button",
        "data-character": character
      });
      if (photo) $button.append($("<img>", { src: photo, alt: "" }));
      $button.append($("<span>").text(character));
      $choices.append($button);
    });
  }

  $("#mystery-choices").on("click", ".mystery-choice", function () {
    if (mysteryAnswered) return;
    mysteryAnswered = true;
    const selectedCharacter = $(this).data("character");
    const correct = selectedCharacter === mysteryCases[mysteryRound].answer;
    $("#mystery-choices .mystery-choice").prop("disabled", true).each(function () {
      const isAnswer = $(this).data("character") === mysteryCases[mysteryRound].answer;
      const isSelected = $(this).data("character") === selectedCharacter;
      $(this).toggleClass("is-correct", isAnswer).toggleClass("is-wrong", isSelected && !correct);
    });
    if (correct) mysteryScore += 1;
    $("#mystery-score").text(mysteryScore);
    $("#mystery-feedback").text(correct ? "¡Adivinaste!" : "Casi. La respuesta era " + mysteryCases[mysteryRound].answer + ".");
    $("#mystery-next").text(mysteryRound === mysteryCases.length - 1 ? "Ver resultado" : "Siguiente caso").prop("hidden", false);
  });

  $("#mystery-next").on("click", function () {
    if (mysteryRound >= mysteryCases.length) {
      mysteryRound = 0;
      mysteryScore = 0;
    } else {
      mysteryRound += 1;
    }
    showMysteryCase();
  });

  showMysteryCase();

  const duelCharacters = [
    { name: "EL CHAVO", image: "images/chavo.jpg" },
    { name: "QUICO", image: "images/quico.avif" }
  ];
  let duelScore = 0;
  let duelTime = 15;
  let duelTimer = null;
  let duelSwitchTimer = null;
  let duelTarget = null;

  function showDuelTarget() {
    const choices = duelCharacters.filter(character => character.name !== duelTarget);
    const character = choices[Math.floor(Math.random() * choices.length)];
    duelTarget = character.name;
    $("#duel-target-image").attr("src", character.image);
    $("#duel-target-name").text(character.name);
  }

  function finishDuel() {
    window.clearInterval(duelTimer);
    window.clearInterval(duelSwitchTimer);
    duelTimer = null;
    duelSwitchTimer = null;
    $(".duel-choice").prop("disabled", true);
    $("#duel-start").text("Jugar otra vez");
    $("#duel-message").text("¡Tiempo! Acertaste " + duelScore + (duelScore === 1 ? " vez." : " veces."));
  }

  $("#duel-start").on("click", function () {
    window.clearInterval(duelTimer);
    window.clearInterval(duelSwitchTimer);
    duelScore = 0;
    duelTime = 15;
    duelTarget = null;
    $("#duel-score").text(duelScore);
    $("#duel-time").text(duelTime);
    $("#duel-message").text("¡Rápido, ya cambió!");
    $(".duel-choice").prop("disabled", false);
    $(this).text("Jugando...");
    showDuelTarget();
    duelSwitchTimer = window.setInterval(showDuelTarget, 1300);
    duelTimer = window.setInterval(function () {
      duelTime -= 1;
      $("#duel-time").text(duelTime);
      if (duelTime <= 0) finishDuel();
    }, 1000);
  });

  $(".duel-choice").on("click", function () {
    if (duelTimer === null) return;
    const correct = $(this).data("character") === duelTarget;
    if (correct) {
      duelScore += 1;
      $("#duel-score").text(duelScore);
      $("#duel-message").text("¡Bien visto!");
    } else {
      $("#duel-message").text("¡Se te escapó!");
    }
    showDuelTarget();
  });
});