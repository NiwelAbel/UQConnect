// public/js/bg.js
(function () {
  const bg = document.querySelector(".page-bg");
  if (!bg) return;

  // Respect reduced motion users
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // When everything is ready, reveal the background
  const reveal = () => {
    if (prefersReduced) {
      bg.style.transition = "none";
      bg.style.opacity = "1";
    } else {
      bg.classList.add("is-visible");
    }
  };

  // Adjust background position for narrow viewports (keeps faces/UI centered)
  const tuneForViewport = () => {
    if (window.innerWidth <= 640) {
      bg.style.backgroundPosition = "center top";
      bg.style.backgroundAttachment = "scroll"; // smoother on mobile
    } else {
      bg.style.backgroundPosition = "center center";
      bg.style.backgroundAttachment = "fixed";
    }
  };

  // Run once and on resize
  tuneForViewport();
  window.addEventListener("resize", tuneForViewport);

  // Reveal on load
  if (document.readyState === "complete") {
    reveal();
  } else {
    window.addEventListener("load", reveal);
  }
})();
