$(function () {
  let cases = {};

  let caseNumber = 1;
  let previousIndex = -1;
  const characterPhotos = {
    "EL CHAVO": "images/chavo.jpg",
    "QUICO": "images/quico.avif",
    "LA CHILINDRINA": "images/chilindrina.jpg",
    "DON RAMÓN": "images/don ramon.jpg",
    "DOÑA FLORINDA": "images/doña florinda.jpg",
    "SEÑOR BARRIGA": "images/señor barriga.webp"
  };

  function setFace(selector, emoji, characterName, specificPhoto) {
    const $face = $(selector).empty();
    const $panel = $face.closest(".comic-panel");
    const photo = specificPhoto || characterPhotos[characterName];
    $panel.children(".character-art").remove();
    if (photo) {
      $panel.addClass("with-character-photo").prepend($("<img>", { class: "character-art", src: photo, alt: "" }));
      $face.text(emoji);
    } else {
      $panel.removeClass("with-character-photo");
      $face.text(emoji);
    }
  }

  function setTwistPhotos(photos) {
    const $panel = $("#twist-face").closest(".comic-panel");
    $panel.children(".twist-photo").remove();
    $panel.toggleClass("with-twist-photos", Boolean(photos));
    if (photos) {
      photos.forEach(function (source, index) {
        const photoClass = photos.length === 1 ? "twist-photo-single" : index === 0 ? "twist-photo-first" : "twist-photo-second";
        $panel.prepend($("<img>", { class: "twist-photo " + photoClass, src: source, alt: "" }));
      });
    }
  }

  function generateComic() {
    const situation = $("#situation").val();
    const options = cases[situation];
    if (!options || options.length === 0) return;
    let index = Math.floor(Math.random() * options.length);
    if (options.length > 1 && index === previousIndex) index = (index + 1) % options.length;
    previousIndex = index;
    const comic = options[index];

    $("#first-label").text(comic.labels[0]);
    $("#second-label").text(comic.labels[1]);
    $("#student-line").text(comic.student);
    $("#teacher-line").text(comic.teacher);
    $("#twist-line").text(comic.twist);
    setFace("#student-face", comic.faces[0], comic.labels[0], comic.photos && comic.photos[0]);
    setFace("#teacher-face", comic.faces[1], comic.labels[1], comic.photos && comic.photos[1]);
    setTwistPhotos(comic.twistPhotos);
    $("#twist-face").text(comic.faces[2]);
    $("#student-sfx").text(comic.sfx[0]);
    $("#teacher-sfx").text(comic.sfx[1]);
    $("#twist-sfx").text(comic.sfx[2]);

    caseNumber = caseNumber === 999 ? 1 : caseNumber + 1;
    $("#case-number").text("#" + String(caseNumber).padStart(3, "0"));
    $(".character").removeClass("pop");
    window.setTimeout(function () {
      $(".character").css("animation", "none");
      void document.querySelector(".character").offsetWidth;
      $(".character").css("animation", "");
    }, 0);
  }

  $("#generate, #reroll").on("click", generateComic);
  setFace("#student-face", "😋", "EL CHAVO");
  setFace("#teacher-face", "😮", "DON RAMÓN");
  setTwistPhotos(["images/chavo.jpg", "images/don ramon.jpg"]);

  $.getJSON("api.json")
    .done(function (response) {
      if (!response.historias) {
        $("#api-status").text("Error en el JSON");
        return;
      }
      cases = response.historias;
      $("#api-status").text("API JSON conectada");
      $("#generate, #reroll").prop("disabled", false);
    })
    .fail(function () {
      $("#api-status").text("No se pudo cargar api.json");
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