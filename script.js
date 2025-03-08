const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let currentSlide = 0,
	isAnimating = false;
const $slides = $(".slide");
const $indicatorsUl = $(".indicators ul");

$(window).on("load", async () => {

	// Инициализация слайдов
	$slides.hide().removeClass("active");
	$slides.eq(currentSlide).show().addClass("active");

	const updateSlider = () => {
		if (currentSlide < 0) currentSlide = 0;
		if (currentSlide >= $slides.length) currentSlide = $slides.length - 1;

		const $target = $slides.eq(currentSlide);
		history.replaceState(null, "", `?slide=${$target.attr("id")}`);
		$indicatorsUl.children().removeClass("active").eq(currentSlide).addClass("active");

		// Если слайд уже активен, не обновляем
		if ($target.hasClass("active")) {
			isAnimating = false;
			return;
		}

		const $current = $(".slide.active");

		if ($current.length) {
			$current.removeClass("active").css("opacity", "0");
			setTimeout(() => $current.css("display", "none"), 300); // скрываем после анимации
		}

		setTimeout(() => {
			$target.css("display", "flex"); // Показываем слайд
			setTimeout(() => $target.addClass("active").css("opacity", "1"), 10); // появление
			isAnimating = false;
		}, 300);
	};

	const generateIndicators = () => {
		$indicatorsUl.empty();
		$slides.each((i) => {
			$("<li>")
				.toggleClass("active", i === currentSlide)
				.on("click", () => {
					if (!isAnimating && currentSlide !== i) {
						isAnimating = true;
						currentSlide = i;
						updateSlider();
					}
				})
				.appendTo($indicatorsUl);
		});
	};

	const checkURL = () => {
		const slideId = new URLSearchParams(window.location.search).get("slide");
		const targetIndex = $slides.index($(`#${slideId}`));
		currentSlide = targetIndex !== -1 ? targetIndex : 0;
	};

	// Обработка клавиатуры
	$(document).on("keydown", (e) => {
		if (isAnimating) return;
		if (e.key === "ArrowDown" && currentSlide < $slides.length - 1) {
			isAnimating = true;
			currentSlide++;
			updateSlider();
		} else if (e.key === "ArrowUp" && currentSlide > 0) {
			isAnimating = true;
			currentSlide--;
			updateSlider();
		}
	});

	// Обработка свайпов
	let touchStartY = 0;
	$(document).on("touchstart", e => {
		touchStartY = e.originalEvent.touches[0].screenY;
	});

	$(document).on("touchend", e => {
		const diff = touchStartY - e.originalEvent.changedTouches[0].screenY;
		if (!isAnimating && Math.abs(diff) > 50) {
			isAnimating = true;
			if (diff > 0 && currentSlide < $slides.length - 1) currentSlide++;
			else if (diff < 0 && currentSlide > 0) currentSlide--;
			updateSlider();
		}
	});

	checkURL();
	generateIndicators();
	updateSlider();

	// Анимация прелоадера и приветственного слоя
	(async function runPreloader() {
		await delay(1000);
		$(".preloader").css("opacity", "0");
		await delay(500);
		$(".welcome-layer").css("opacity", "1");
		await delay(1500);
		$(".preloader").hide();
		$(".welcome-layer").css("opacity", "0");
		await delay(1000);
		$(".welcome-layer").hide();
		$("main").css("opacity", "1");
	})();
});