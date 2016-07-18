$(document).ready(function () {

	// Simon object
	var simon = {

		sequence: [],
		sequenceIndex: 0,
		strictMode: false,
		gameState: false,
		gameEvent: null,
		gameDifficulty: 1,
		difficulty: {
			// level: [buttonHighlightTime, expireTime]
			1: [1300, 5000],
			5: [1000, 4000],
			10: [700, 2000],
			15: [450, 1500]
		},


		turnOn: function () {
			simon.gameState = true;
			screen.startScreen();
			buttons.disable();

		},

		turnOff: function () {
			simon.cancelAllEvents();
			screen.shutDownScreen();
			buttons.disable();
			if (simon.strictMode) {
				simon.toggleStrictMode();
			}
			simon.gameState = false;

		},

		reset: function () {
			//If game is off, turn it on
			if (!simon.gameState) {
				return;
			}

			simon.cancelAllEvents();
			buttons.disable();
			simon.sequence = [];
			simon.sequenceIndex = 0;
			simon.generateNextStep();
		},

		toggleStrictMode: function () {
			//If game is off, turn it on
			if (!simon.gameState) {
				return;
			}

			simon.strictMode ? (simon.strictMode = false, $(".strict").css("opacity", ".3")) : (simon.strictMode = true, $(".strict").css("opacity", "1"));
		},

		generateNextStep: function () {
			buttons.disable();
			if (simon.sequence.length >= 20) {
				simon.win();
				return;
			}
			if (simon.sequence.length <= 20) {
				simon.sequence.push(Math.floor(Math.random() * 4 + 1));
				screen.updateScreenValue(simon.sequence.length)
				console.log(simon.sequence);
				simon.showSequence();
			}

		},

		showSequence: function () {
			// When the whole sequence has been shown, prepare for input
			if (simon.sequenceIndex > simon.sequence.length - 1) {
				buttons.enable();
				simon.setExpireTimer(simon.difficulty[simon.gameDifficulty][1]);
				simon.sequenceIndex = 0;
				return;
			}

			if (simon.sequence.length === 5 || simon.sequence.length === 10 || simon.sequence.length === 15) {
				simon.setDifficulty(simon.sequence.length);
			}


			buttons.lightButton(simon.sequence[simon.sequenceIndex], simon.difficulty[simon.gameDifficulty][0]);
			audio.playButton(simon.sequence[simon.sequenceIndex]);
		},

		processInput: function (input) {

			//Make sure game is on and buttons are enabled
			console.log(simon.gameState, buttons.state);
			if (simon.gameState && buttons.state) {
				simon.clearExpireTimer();
				audio.playButton(input);
				//If the button press was correct, move on.  If not, call wrongButton()
				if (input === simon.sequence[simon.sequenceIndex]) {
					simon.sequenceIndex++;
					simon.setExpireTimer(simon.difficulty[simon.gameDifficulty][1]);
				} else {
					simon.wrongButton();
				}

				//If that button press concludes the sequence, generate a new step
				if (simon.sequenceIndex === simon.sequence.length) {
					simon.clearExpireTimer();
					simon.sequenceIndex = 0;
					window.setTimeout(function () {
						simon.generateNextStep();
					}, 1000);
				}
			} else {
				return;
			}
		},

		setDifficulty: function(level) {
			simon.gameDifficulty = level;
			console.log(simon.gameDifficulty);
		},

		setExpireTimer: function (delay) {
			simon.clearExpireTimer();
			simon.gameEvent = window.setTimeout(function () {
				simon.wrongButton();
			}, delay);
		},

		clearExpireTimer: function () {
			window.clearTimeout(simon.gameEvent);
		},

		wrongButton: function () {
			audio.playWarning();
			simon.gameEvent = window.setTimeout(function () {
				simon.strictMode ? simon.reset() : (simon.sequenceIndex = 0, simon.showSequence());
			}, 1100)
		},

		win: function () {
			audio.playWin();
			screen.updateScreenValue("!!");
			//add blinking lights
			simon.gameEvent = setTimeout(function () {
				simon.turnOn();
			}, 1500);
		},

		cancelAllEvents: function () {
			window.clearTimeout(buttons.lightEvent);
			window.clearTimeout(audio.soundEvent);
			simon.clearExpireTimer();
		},


	};

	// Screen object
	var screen = {

		startScreen: function () {
			this.updateScreenValue("--");
		},

		shutDownScreen: function () {
			this.updateScreenValue("");
		},

		updateScreenValue: function (val) {
			value = val;
			$(".screen").html(val);
		}

	}

	// Buttons object
	var buttons = {
		lightEvent: null,
		state: false,

		disable: function () {
			buttons.state = false;
			$(".button").removeClass("active");
			$(".button").removeClass("highlight");
		},

		enable: function () {
			buttons.state = true;
			$(".button").addClass("active");
		},

		lightButton: function (button, delay) {
			buttons.disable();
			if (button === 1) {
				$(".one").addClass("highlight");
				buttons.lightEvent = window.setTimeout(function () {
					lightsOut("one");
				}, delay);
			} else if (button === 2) {
				$(".two").addClass("highlight");
				buttons.lightEvent = window.setTimeout(function () {
					lightsOut("two");
				}, delay);
			} else if (button === 3) {
				$(".three").addClass("highlight");
				buttons.lightEvent = window.setTimeout(function () {
					lightsOut("three");
				}, delay);
			} else if (button === 4) {
				$(".four").addClass("highlight");
				buttons.lightEvent = window.setTimeout(function () {
					lightsOut("four");
				}, delay);
			}

			var lightsOut = function (button) {
				$("." + button).removeClass("highlight");
				buttons.lightEvent = window.setTimeout(function () {
					simon.sequenceIndex++;
					simon.showSequence();
				}, 50);
			}
		}


	}

	// Audio object
	var audio = {
		soundEvent: null,
		soundOne: new Audio("media/simon_1.mp3"),
		soundTwo: new Audio("media/simon_2.mp3"),
		soundThree: new Audio("media/simon_3.mp3"),
		soundFour: new Audio("media/simon_4.mp3"),

		playButton: function (sound) {
			if (sound === 1) {
				audio.soundOne.play();
				//audio.soundEvent = setTimeout(function () {
				//	return;
				//}, 500);
			}
			if (sound === 2) {
				audio.soundTwo.play();
				//audio.soundEvent = setTimeout(function () {
					//return;
				//}, 750);
			}
			if (sound === 3) {
				audio.soundThree.play();
				//audio.soundEvent = setTimeout(function () {
				//	return;
				//}, 750);
			}
			if (sound === 4) {
				audio.soundFour.play();
				//audio.soundEvent = setTimeout(function () {
				//	return;
				//}, 750);
			}
		},

		playWin: function () {
			audio.soundFour.play();
			audio.soundEvent = setTimeout(function () {
				audio.soundThree.play();
				audio.soundEvent = setTimeout(function () {
					audio.soundTwo.play();
					audio.soundEvent = setTimeout(function () {
						audio.soundOne.play();
						audio.soundEvent = setTimeout(function () {
							return;
						}, 1000);
					}, 200);
				}, 200);
			}, 200);

		},

		playWarning: function () {
			audio.soundOne.play();
			audio.soundEvent = setTimeout(function () {
				audio.soundTwo.play();
				audio.soundEvent = setTimeout(function () {
					return;
				}, 1000);
			}, 100);
		}
	}

	//Click handlers
	$(".button").on("click", function (event) {
		var buttonNumber = ["", "one", "two", "three", "four"].indexOf(event.target.className.split(" ")[1]);
		simon.processInput(buttonNumber);
	});

	$(".start").on("click", function () {
		simon.reset();
	});

	$(".strict").on("click", function () {
		simon.toggleStrictMode();
	});

	$(".slider-button").on("click", function (event) {
		switch (simon.gameState) {
			case true:
				$(this).animate({
					left: "25px"
				});
				simon.turnOff();
				break;
			case false:
				$(this).animate({
					left: "0px"
				});
				simon.turnOn();
				break;
		}

	});

	/*$(".").on("click", function (event) {


	});*/



});
