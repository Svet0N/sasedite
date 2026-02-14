const navbar = document.getElementById("navbar");
const lightbox = document.getElementById("lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxClose = lightbox.querySelector("button");
const navToggle = document.querySelector(".nav-toggle");
const mobileMenu = document.getElementById("mobile-menu");

const onScroll = () => {
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
