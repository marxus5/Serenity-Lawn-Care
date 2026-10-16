// Enable progressive-enhancement styles before the page is rendered.
document.documentElement.classList.add("js");

// Wait until the page markup is ready before connecting its controls.
document.addEventListener("DOMContentLoaded", initializePage);

function initializePage() {
  initializeNavigation();
  initializeScrollControls();
  initializeScrollReveals();
  updateCopyrightYear();
  initializeQuoteForm();
}

// Toggle the mobile menu and close it after following a section link.
function initializeNavigation() {
  const menuButton = document.querySelector(".menu");
  const navigation = document.getElementById("nav");

  if (!menuButton || !navigation) {
    return;
  }

  menuButton.addEventListener("click", function () {
    const isOpen = navigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navigation.addEventListener("click", function (event) {
    if (!(event.target instanceof Element) || !event.target.closest("a")) {
      return;
    }

    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
}

// Hide the header while scrolling down and reveal the sticky quote controls.
function initializeScrollControls() {
  const header = document.querySelector(".top");
  const stickyBar = document.getElementById("bar");
  const hero = document.getElementById("top");

  if (!header || !stickyBar || !hero) {
    return;
  }

  let lastScrollY = window.scrollY;
  let scrollFramePending = false;

  function updateControls() {
    const scrollY = window.scrollY;
    const navigationOpen = document.getElementById("nav")?.classList.contains("open");

    if (scrollY > 80 && scrollY > lastScrollY + 4 && !navigationOpen) {
      header.classList.add("hide");
    } else if (scrollY < lastScrollY - 4 || scrollY <= 80) {
      header.classList.remove("hide");
    }

    lastScrollY = scrollY;
    stickyBar.classList.toggle(
      "show",
      scrollY >= hero.offsetTop + hero.offsetHeight - 60
    );
    scrollFramePending = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (scrollFramePending) {
        return;
      }

      scrollFramePending = true;
      window.requestAnimationFrame(updateControls);
    },
    { passive: true }
  );

  header.addEventListener("focusin", function () {
    header.classList.remove("hide");
  });

  updateControls();
}

// Reveal content as it enters the viewport; leave it visible if unsupported.
function initializeScrollReveals() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );

  document
    .querySelectorAll(
      ".sec h2, .sec .lead, .services li, .slogan, .frame, .gallery figure, blockquote, details, .proof > *, .qwrap form, .foot p"
    )
    .forEach(function (element) {
      const siblingIndex = Array.prototype.indexOf.call(
        element.parentNode.children,
        element
      );

      element.style.setProperty(
        "--d",
        `${Math.min(siblingIndex, 6) * 0.08}s`
      );
      element.classList.add("rv");
      observer.observe(element);
    });
}

// Keep the copyright year current without requiring annual markup updates.
function updateCopyrightYear() {
  const year = document.getElementById("yr");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
}

// Send quote requests to the optional form endpoint or the visitor's email app.
function initializeQuoteForm() {
  const form = document.getElementById("form");
  const status = document.getElementById("status");

  if (!(form instanceof HTMLFormElement) || !status) {
    return;
  }

  const sendTo = "hello@example.com"; // Replace with the email that receives quote requests.
  const endpoint = ""; // Optional Formspree URL; takes priority over the email fallback.

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(form);

    // Ignore submissions caught by the hidden spam-prevention field.
    if (formData.get("_gotcha")) {
      return;
    }

    if (endpoint) {
      sendQuoteRequest(form, status, endpoint, formData);
      return;
    }

    openQuoteEmail(status, sendTo, formData);
  });
}

function sendQuoteRequest(form, status, endpoint, formData) {
  status.textContent = "Sending...";

  fetch(endpoint, {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" }
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error(`Quote request failed with status ${response.status}.`);
      }

      form.reset();
      status.textContent = "Thanks! We will contact you soon.";
    })
    .catch(function () {
      status.textContent = "Something went wrong. Please call (555) 000-0000.";
    });
}

function openQuoteEmail(status, sendTo, formData) {
  const name = String(formData.get("name") || "");
  const body = [
    `Name: ${name}`,
    `Phone: ${formData.get("phone") || ""}`,
    `Email: ${formData.get("email") || ""}`,
    "",
    String(formData.get("message") || "")
  ].join("\n");
  const subject = `Free quote request from ${name}`;

  window.location.href =
    `mailto:${sendTo}?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;
  status.textContent =
    "Opening your email app. Press send to finish, or call (555) 000-0000.";
}