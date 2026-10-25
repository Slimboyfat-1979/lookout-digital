const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    primaryNav.classList.toggle("is-open", !isOpen);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      primaryNav.classList.remove("is-open");
    }
  });
}

const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  let previousScrollY = window.scrollY;
  let scrollTicking = false;

  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;

    window.requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const menuIsOpen = menuToggle?.getAttribute("aria-expanded") === "true";

      if (currentScrollY < 80 || menuIsOpen || currentScrollY < previousScrollY - 6) {
        siteHeader.classList.remove("is-hidden");
      } else if (currentScrollY > previousScrollY + 6) {
        siteHeader.classList.add("is-hidden");
      }

      previousScrollY = currentScrollY;
      scrollTicking = false;
    });
  }, { passive: true });
}

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".primary-nav a").forEach((link) => {
  if (link.getAttribute("href") === currentPage) {
    link.setAttribute("aria-current", "page");
  }
});

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  const status = document.querySelector("#form-status");
  const formResult = new URLSearchParams(window.location.search).get("status");
  const statusMessages = {
    sent: ["Your enquiry has been sent. Thanks for getting in touch.", "success"],
    invalid: ["Please check your details and try submitting the form again.", "error"],
    failed: ["Your enquiry could not be sent right now. Please email hello@lookoutdigital.co.nz directly.", "error"]
  };
  const result = statusMessages[formResult];

  if (status && result) {
    status.textContent = result[0];
    status.dataset.state = result[1];
  }
}

const motionArts = document.querySelectorAll(".lo-art");
if (motionArts.length) {
  motionArts.forEach((art) => art.classList.add("is-armed"));
  if ("IntersectionObserver" in window) {
    const artObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const art = entry.target.querySelector(".lo-art");
        if (!art) return;
        if (entry.isIntersecting) art.classList.add("is-live");
        art.classList.toggle("is-offscreen", !entry.isIntersecting);
      });
    }, { threshold: 0.2 });
    motionArts.forEach((art) => artObserver.observe(art.parentElement));
  } else {
    motionArts.forEach((art) => art.classList.add("is-live"));
  }
}
