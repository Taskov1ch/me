// Может мне вообще стоит начать учить JS, а не зависеть от ChatGPT?

$(document).ready(function () {
	// Глобальные переменные
	let currentSlide = 0, isAnimating = false, isSecret = false;
	const $slides = $(".slide"), $indicatorsUl = $(".indicators ul");
	const $screamer = $(".screamer"), $screamerAudio = $("#screamer-audio");
	const $music = $("#background-music"), $musicButton = $(".music-button img");

	// Утилита задержки
	const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

	// Обработка клика для активации скримера
	$(window).on("click", async () => {
		if (isSecret) {
			isSecret = false;
			setTimeout(() => {
				$screamerAudio[0].play();
				$screamer.css({ visibility: "visible", opacity: "1" });
				setTimeout(() => $screamer.css("opacity", "0"), 2000);
				setTimeout(() => $screamer.css("visibility", "hidden"), 2500);
			}, 5000);
		}
	});

	// Функция обновления слайдов
	const updateSlider = () => {
		// Ограничение номера слайда в допустимых пределах
		currentSlide = Math.max(0, Math.min(currentSlide, $slides.length - 1));

		const $target = $slides.eq(currentSlide);
		const slideId = $target.attr("id");

		// Обновляем URL с идентификатором слайда
		history.replaceState(null, "", `?slide=${slideId}`);

		// Обновляем индикаторы
		$indicatorsUl.children().removeClass("active").eq(currentSlide).addClass("active");

		// Обновляем заголовок страницы
		const titles = {
			"about-me": "Обо мне",
			"links": "Мои ссылки",
			"mascots": "Мои маскоты"
		};
		if (titles[slideId]) {
			document.title = titles[slideId] + " | Taskov1ch";
		}

		// Если целевой слайд уже активен, завершаем анимацию
		if ($target.hasClass("active")) {
			isAnimating = false;
			return;
		}

		// Скрываем текущий активный слайд
		const $current = $(".slide.active");
		if ($current.length) {
			$current.removeClass("active").css("opacity", "0");
		}

		// Все остальные тоже как подстраховку
		setTimeout(() => $slides.not($target).hide(), 300);

		// Показываем целевой слайд с анимацией появления
		$target.css("display", "flex");
		setTimeout(() => $target.addClass("active").css("opacity", "1"), 300);

		// Завершаем анимацию через 600 мс
		setTimeout(() => {
			isAnimating = false;
		}, 600);
	};

	// Генерация индикаторов
	const generateIndicators = () => {
		$indicatorsUl.empty();
		$slides.each((i) => $("<li>").toggleClass("active", i === currentSlide)
			.on("click", () => { if (!isAnimating && currentSlide !== i) isAnimating = true, currentSlide = i, updateSlider(); })
			.appendTo($indicatorsUl));
	};

	// Проверка URL для активации секретного режима
	const checkForSecretSlide = () => {
		if (new URLSearchParams(window.location.search).get("slide") === "secret") {
			console.log("Секретный слайд активирован!");
			isSecret = true;
		}
	};

	// Установка текущего слайда по URL
	const checkURL = () => {
		const slideId = new URLSearchParams(window.location.search).get("slide");
		const targetIndex = $slides.index($(`#${slideId}`));
		currentSlide = targetIndex !== -1 ? targetIndex : 0;
	};

	// Переход к слайду по ID
	window.goToSlideById = slideId => {
		const targetIndex = $slides.index($(`#${slideId}`));
		if (targetIndex !== -1 && targetIndex !== currentSlide) {
			isAnimating = true;
			currentSlide = targetIndex;
			updateSlider();
		}
	};

	// Обработчики клавиатуры
	$(document).on("keydown", e => {
		if (isAnimating) return;
		if (e.key === "ArrowDown" && currentSlide < $slides.length - 1) currentSlide++;
		else if (e.key === "ArrowUp" && currentSlide > 0) currentSlide--;
		else return;
		isAnimating = true;
		updateSlider();
	});

	// Обработка свайпов
	let touchStartY = 0;
	$(document).on("touchstart", e => touchStartY = e.originalEvent.touches[0].screenY);
	$(document).on("touchend", e => {
		const diff = touchStartY - e.originalEvent.changedTouches[0].screenY;
		if (!isAnimating && Math.abs(diff) > 50) {
			isAnimating = true;
			if (diff > 0 && currentSlide < $slides.length - 1) currentSlide++;
			else if (diff < 0 && currentSlide > 0) currentSlide--;
			updateSlider();
		}
	});

	// Инициализация слайдера
	checkForSecretSlide();
	checkURL();
	generateIndicators();
	updateSlider();

	// Анимация прелоадера
	(async function runPreloader() {
		await delay(1000);
		$(".preloader").css("opacity", "0");
		$(".background").css("opacity", 1);
		await delay(500);
		$(".preloader").hide();
		$(".welcome-layer").css("opacity", "1");
		await delay(1500);
		$(".welcome-layer").css("opacity", "0");
		await delay(1000);
		$(".welcome-layer").hide();
		$("main").css("opacity", "1");
	})();

	// Переключение музыки
	window.toggleMusic = () => {
		$music[0].paused ? $music[0].play() : $music[0].pause();
		$musicButton.toggleClass("music-playing");
	};

	// Эффект наклона
	$(document).on("mousemove", e => {
		if ($music[0].paused) return;
		const w = $(window).width(), h = $(window).height();
		const rotateY = ((e.clientX - w / 2) / (w / 2)) * 3;
		const rotateX = -((e.clientY - h / 2) / (h / 2)) * 3;
		$("main").css("transform", `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
	});
});
