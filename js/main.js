const navbar = document.getElementById("navbar");
const lightbox = document.getElementById("lightbox");
const lightboxImage = lightbox ? lightbox.querySelector("img") : null;
const lightboxClose = lightbox ? lightbox.querySelector("button") : null;
const navToggle = document.querySelector(".nav-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const reservationForm = document.getElementById("reservation-form");
const reservationSuccess = document.getElementById("reservation-success");
const ratingContainer = document.querySelector(".rating-stars");
const feedbackError = document.getElementById("feedback-error");
const reservationStatus = document.getElementById("reservation-status");
const reservationError = document.getElementById("reservation-error");

const onScroll = () => {
	if (!navbar) return;
	navbar.classList.toggle("scrolled", window.scrollY > 40);
};

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (navToggle && mobileMenu) {
	navToggle.addEventListener("click", () => {
		const isOpen = mobileMenu.classList.toggle("open");
		navToggle.setAttribute("aria-expanded", String(isOpen));
	});

	mobileMenu.querySelectorAll("a").forEach((link) => {
		link.addEventListener("click", () => {
			mobileMenu.classList.remove("open");
			navToggle.setAttribute("aria-expanded", "false");
		});
	});
}

if (lightbox && lightboxImage && lightboxClose) {
	document.querySelectorAll(".gallery-item").forEach((item) => {
		item.addEventListener("click", () => {
			const fullSrc = item.getAttribute("data-full");
			if (!fullSrc) return;
			lightboxImage.src = fullSrc;
			lightbox.classList.add("open");
			lightbox.setAttribute("aria-hidden", "false");
		});
	});

	const closeLightbox = () => {
		lightbox.classList.remove("open");
		lightbox.setAttribute("aria-hidden", "true");
		lightboxImage.src = "";
	};

	lightboxClose.addEventListener("click", closeLightbox);
	lightbox.addEventListener("click", (event) => {
		if (event.target === lightbox) {
			closeLightbox();
		}
	});
}

// Rating flow: high scores go to public reviews, low scores go to feedback form.
if (ratingContainer) {
	const highUrl = ratingContainer.dataset.highUrl;
	const lowUrl = ratingContainer.dataset.lowUrl || "feedback.html";

	ratingContainer.querySelectorAll(".rating-button").forEach((button) => {
		button.addEventListener("click", () => {
			const rating = Number(button.dataset.rating || 0);
			const destination = rating >= 4 ? highUrl : lowUrl;
			if (destination) {
				window.location.href = destination;
			}
		});
	});
}

// Reservation validation handled client-side for the static site.
if (reservationForm) {
	const dateInput = reservationForm.querySelector("#date");
	const timeInput = reservationForm.querySelector("#time");
	const guestsInput = reservationForm.querySelector("#guests");
	const today = new Date();
	const todayValue = today.toISOString().split("T")[0];
	const appScriptUrl = "https://script.google.com/macros/s/AKfycbwJq4rVBWDmKVEQHqmGUEwX3qHPgA0V5rE6AFnaEsSI2sutYc1k4kmax7xH3JCoyVyFPg/exec";
	const messengerBase = "https://m.me/sasedite";

	if (dateInput) {
		dateInput.min = todayValue;
	}

	reservationForm.addEventListener("submit", (event) => {
		event.preventDefault();

		if (dateInput) {
			const selectedDate = dateInput.value;
			dateInput.setCustomValidity(selectedDate && selectedDate >= todayValue ? "" : "Изберете валидна дата.");
		}

		if (timeInput) {
			const selectedTime = timeInput.value;
			const validTime = selectedTime >= "11:00" && selectedTime <= "22:00";
			timeInput.setCustomValidity(validTime ? "" : "Изберете час между 11:00 и 22:00.");
		}

		if (guestsInput) {
			const guests = Number(guestsInput.value);
			const validGuests = guests >= 1 && guests <= 20;
			guestsInput.setCustomValidity(validGuests ? "" : "Броят гости трябва да е между 1 и 20.");
		}

		if (!reservationForm.reportValidity()) {
			return;
		}

		if (reservationStatus) reservationStatus.hidden = false;
		if (reservationError) reservationError.hidden = true;
		if (reservationSuccess) reservationSuccess.hidden = true;

		const payload = {
			name: reservationForm.querySelector("#name")?.value.trim() || "",
			phone: reservationForm.querySelector("#phone")?.value.trim() || "",
			date: dateInput?.value || "",
			time: timeInput?.value || "",
			guests: guestsInput?.value || "",
		};

		const message = `Резервация:%0AИме: ${payload.name}%0AТелефон: ${payload.phone}%0AДата: ${payload.date}%0AЧас: ${payload.time}%0AГости: ${payload.guests}`;
		const messengerUrl = `${messengerBase}?text=${encodeURIComponent(message)}`;

		if (appScriptUrl === "YOUR_GOOGLE_APPS_SCRIPT_URL") {
			if (reservationStatus) reservationStatus.hidden = true;
			if (reservationError) reservationError.hidden = false;
			return;
		}

		const formData = new FormData();
		Object.entries(payload).forEach(([key, value]) => {
			formData.append(key, value);
		});

		fetch(appScriptUrl, {
			method: "POST",
			mode: "no-cors",
			body: formData,
		})
			.then(() => {
				console.log("✓ Fetch успешен, показвам успешно съобщение...");
				if (reservationStatus) reservationStatus.hidden = true;
				if (reservationSuccess) reservationSuccess.hidden = false;
				reservationForm.reset();
				if (dateInput) {
					dateInput.min = todayValue;
				}
				console.log("✓ Отваря Messenger...", messengerUrl);
				window.open(messengerUrl, "_blank", "noopener");
			})
			.catch((err) => {
				console.error("✗ Fetch грешка:", err);
				if (reservationStatus) reservationStatus.hidden = true;
				if (reservationError) reservationError.hidden = false;
			});
	});
}

// Lightweight feedback confirmation without a backend.
const feedbackForm = document.getElementById("feedback-form");
const feedbackSuccess = document.getElementById("feedback-success");

// EmailJS configuration (replace with real values when available).
const emailjsConfig = {
	serviceId: "YOUR_SERVICE_ID",
	templateId: "YOUR_TEMPLATE_ID",
	publicKey: "YOUR_PUBLIC_KEY",
};

if (feedbackForm) {
	feedbackForm.addEventListener("submit", (event) => {
		event.preventDefault();
		const feedbackText = feedbackForm.querySelector("#feedback");
		const message = feedbackText ? feedbackText.value.trim() : "";
		const hasConfig =
			emailjsConfig.serviceId !== "YOUR_SERVICE_ID" &&
			emailjsConfig.templateId !== "YOUR_TEMPLATE_ID" &&
			emailjsConfig.publicKey !== "YOUR_PUBLIC_KEY";

		if (!hasConfig || typeof emailjs === "undefined") {
			if (feedbackError) {
				feedbackError.hidden = false;
			}
			return;
		}

		feedbackError && (feedbackError.hidden = true);
		emailjs.init({ publicKey: emailjsConfig.publicKey });
		emailjs
			.send(emailjsConfig.serviceId, emailjsConfig.templateId, {
				message,
				page: window.location.href,
			})
			.then(() => {
				feedbackForm.reset();
				if (feedbackSuccess) {
					feedbackSuccess.hidden = false;
				}
			})
			.catch(() => {
				if (feedbackError) {
					feedbackError.hidden = false;
				}
			});
	});
}
