(() => {
  const hero = document.querySelector(".hero");
  const scene = document.querySelector("#characterScene");
  const character = document.querySelector("#character");
  const particles = document.querySelector(".particles");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionPreference.matches;
  document.querySelector("#year").textContent = new Date().getFullYear();

  // Create soft, floating light particles.
  if (!reducedMotion) {
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("span");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.setProperty("--duration", `${4 + Math.random() * 6}s`);
      particle.style.setProperty("--delay", `${Math.random() * -10}s`);
      particles.appendChild(particle);
    }
  }

  if (motionPreference.addEventListener) {
    motionPreference.addEventListener("change", (event) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        resetPointer();
      }
    });
  }

  const aboutSection = document.querySelector("#about");
  if (aboutSection && !reducedMotion && "IntersectionObserver" in window) {
    aboutSection.classList.add("about-motion-ready");
    const aboutObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        aboutSection.classList.add("is-visible");
        aboutObserver.disconnect();
      }
    }, { threshold: 0.08 });
    aboutObserver.observe(aboutSection);
  }

  const gallery = document.querySelector("#work");
  if (gallery && !reducedMotion && "IntersectionObserver" in window) {
    gallery.classList.add("gallery-motion-ready");
    const galleryObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        gallery.classList.add("is-visible");
        galleryObserver.disconnect();
      }
    }, { threshold: 0.08 });
    galleryObserver.observe(gallery);
  }

  const lightbox = gallery.querySelector(".gallery-lightbox");
  const lightboxImage = lightbox.querySelector(".gallery-lightbox-image");
  const lightboxClose = lightbox.querySelector(".gallery-lightbox-close");

  gallery.addEventListener("click", (event) => {
    const imageButton = event.target.closest(".gallery-image");
    if (!imageButton || !gallery.contains(imageButton)) return;
    const image = imageButton.querySelector("img");
    if (!image) return;

    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightbox.showModal();
  });

  lightboxClose.addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("close", () => {
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
  });

  const videoShowcase = document.querySelector("#editing");
  if (videoShowcase && !reducedMotion && "IntersectionObserver" in window) {
    videoShowcase.classList.add("video-showcase-motion-ready");
    const videoShowcaseObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        videoShowcase.classList.add("is-visible");
        videoShowcaseObserver.disconnect();
      }
    }, { threshold: 0.06 });
    videoShowcaseObserver.observe(videoShowcase);
  }

  if (videoShowcase) {
    const videoProjects = [...videoShowcase.querySelectorAll(".video-project")];
    videoProjects.forEach((project) => {
      const video = project.querySelector(".portfolio-video");
      const playButton = project.querySelector(".video-play");
      const frame = project.querySelector(".video-project-frame");
      const status = project.querySelector(".video-play-status");

      video.controls = false;

      playButton.addEventListener("click", async () => {
        videoShowcase.querySelectorAll(".portfolio-video").forEach((otherVideo) => {
          if (otherVideo !== video) otherVideo.pause();
        });

        status.textContent = "";
        video.controls = true;
        try {
          await video.play();
          project.classList.add("is-playing");
        } catch {
          video.controls = false;
          status.textContent = "Playback couldn't start. Please try again.";
        }
      });

      frame.addEventListener("click", (event) => {
        if (event.target === video && !video.controls && video.paused) playButton.click();
      });
      video.addEventListener("play", () => project.classList.add("is-playing"));
      video.addEventListener("play", () => project.classList.add("is-playing"));
      video.addEventListener("ended", () => {
        video.controls = false;
        video.currentTime = 0;
        project.classList.remove("is-playing");
      });
      video.addEventListener("error", () => {
        status.textContent = "This video couldn't be loaded.";
      });
    });
  }

  // A restrained cursor parallax keeps the full-bleed background from shifting out of view.
  let target = { x: 0, y: 0 };
  let current = { x: 0, y: 0 };
  let rafId = null;

  function onPointerMove(event) {
    if (reducedMotion || event.pointerType === "touch") return;
    const rect = scene.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
    const ny = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));

    target.x = nx * 12;
    target.y = ny * 8;

    if (!rafId) rafId = requestAnimationFrame(animate);
  }

  function animate() {
    const ease = 0.075;
    current.x += (target.x - current.x) * ease;
    current.y += (target.y - current.y) * ease;

    character.style.setProperty("--move-x", `${current.x.toFixed(2)}px`);
    character.style.setProperty("--move-y", `${current.y.toFixed(2)}px`);

    const stillMoving = Math.abs(target.x - current.x) > 0.05 ||
      Math.abs(target.y - current.y) > 0.05;

    if (stillMoving) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
    }
  }

  function resetPointer() {
    target = { x: 0, y: 0 };
    if (!reducedMotion && !rafId) rafId = requestAnimationFrame(animate);
  }

  hero.addEventListener("pointermove", onPointerMove);
  hero.addEventListener("pointerleave", resetPointer);
})();
