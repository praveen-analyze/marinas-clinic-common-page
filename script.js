/* ============================================================
   Marina's Clinic clone — interactivity
   ============================================================ */

// ---------- FAQ accordion ----------
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const answer = item.querySelector('.faq-a');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach(open => {
      open.classList.remove('open');
      open.querySelector('.faq-a').style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// ---------- Symptom self-check counter ----------
const checks = document.querySelectorAll('.symptom-check');
const scoreCount = document.getElementById('scoreCount');
const scoreHint = document.getElementById('scoreHint');

function updateScore() {
  const n = [...checks].filter(c => c.checked).length;
  scoreCount.textContent = n;
  if (n === 0) {
    scoreHint.textContent = 'Tick what applies above to see whether an assessment is worth your time.';
  } else if (n <= 2) {
    scoreHint.textContent = 'Even one persistent symptom is worth a proper explanation.';
  } else {
    scoreHint.textContent = 'Several symptoms together — a focused consultation is strongly worth booking.';
  }
}
checks.forEach(c => c.addEventListener('change', updateScore));
updateScore();

// ---------- Marquee: duplicate items for seamless loop ----------
const track = document.getElementById('marqueeTrack');
if (track) track.innerHTML += track.innerHTML;

// ---------- Scroll reveal ----------
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- Hero video slider ----------
const heroSliderTrack = document.getElementById('heroSliderTrack');
const sliderTabs = document.querySelectorAll('.slider-tab');
const sliderDots = document.querySelectorAll('.slider-dot');
const sliderPrev = document.querySelector('.slider-arrow.slider-prev');
const sliderNext = document.querySelector('.slider-arrow.slider-next');
const sliderCurrent = document.getElementById('sliderCurrent');

if (heroSliderTrack) {
  let activeSlide = 0;
  const totalSlides = 2;

  function goToSlide(index) {
    activeSlide = Math.max(0, Math.min(index, totalSlides - 1));
    heroSliderTrack.style.transform = `translateX(-${activeSlide * 100}%)`;

    // Update tabs
    sliderTabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === activeSlide);
    });

    // Update dots
    sliderDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeSlide);
    });

    // Update counter
    if (sliderCurrent) {
      sliderCurrent.textContent = String(activeSlide + 1).padStart(2, '0');
    }

    // Update arrows
    if (sliderPrev) sliderPrev.disabled = activeSlide === 0;
    if (sliderNext) sliderNext.disabled = activeSlide === totalSlides - 1;
  }

  sliderTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      goToSlide(parseInt(tab.dataset.slide, 10));
    });
  });

  sliderDots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.slide, 10));
    });
  });

  if (sliderPrev) {
    sliderPrev.addEventListener('click', () => {
      if (activeSlide > 0) goToSlide(activeSlide - 1);
    });
  }

  if (sliderNext) {
    sliderNext.addEventListener('click', () => {
      if (activeSlide < totalSlides - 1) goToSlide(activeSlide + 1);
    });
  }

  // Touch / swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  heroSliderTrack.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  heroSliderTrack.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && activeSlide < totalSlides - 1) {
        goToSlide(activeSlide + 1);
      } else if (diff < 0 && activeSlide > 0) {
        goToSlide(activeSlide - 1);
      }
    }
  }, { passive: true });

  goToSlide(0);
}

// ---------- Patient reviews continuous auto-scroll ----------
const reviewsViewport = document.getElementById('reviewsViewport');
const reviewsTrack = document.getElementById('reviewsTrack');
const revPrev = document.querySelector('.rev-arrow.rev-prev');
const revNext = document.querySelector('.rev-arrow.rev-next');

if (reviewsViewport && reviewsTrack) {
  // Duplicate cards for seamless continuous loop
  reviewsTrack.innerHTML += reviewsTrack.innerHTML;

  let isPaused = false;
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let resumeTimer = null;
  const SCROLL_SPEED = 0.85; // smooth, steady readable speed

  function autoScrollStep() {
    if (!isPaused && !isDragging) {
      reviewsViewport.scrollLeft += SCROLL_SPEED;

      // When half the track is scrolled (the original cards), loop seamlessly
      const halfWidth = reviewsTrack.scrollWidth / 2;
      if (reviewsViewport.scrollLeft >= halfWidth) {
        reviewsViewport.scrollLeft -= halfWidth;
      }
    }
    requestAnimationFrame(autoScrollStep);
  }
  requestAnimationFrame(autoScrollStep);

  function pauseAuto() {
    isPaused = true;
    if (resumeTimer) clearTimeout(resumeTimer);
  }

  function resumeAuto(delay = 1800) {
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      isPaused = false;
    }, delay);
  }

  // Hover pauses so users can read comfortably
  reviewsViewport.addEventListener('mouseenter', pauseAuto);
  reviewsViewport.addEventListener('mouseleave', () => {
    if (!isDragging) resumeAuto(400);
  });

  // Touch on mobile/tablet: allows natural swipe and pauses auto-scroll while touching
  reviewsViewport.addEventListener('touchstart', pauseAuto, { passive: true });
  reviewsViewport.addEventListener('touchend', () => resumeAuto(2000), { passive: true });

  // Mouse wheel / trackpad: allows natural scrolling
  reviewsViewport.addEventListener('wheel', () => {
    pauseAuto();
    resumeAuto(2000);
  }, { passive: true });

  // Mouse drag-to-scroll support
  reviewsViewport.addEventListener('mousedown', e => {
    isDragging = true;
    pauseAuto();
    reviewsViewport.classList.add('is-dragging');
    startX = e.pageX - reviewsViewport.offsetLeft;
    startScrollLeft = reviewsViewport.scrollLeft;
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - reviewsViewport.offsetLeft;
    const walk = (x - startX) * 1.4;
    reviewsViewport.scrollLeft = startScrollLeft - walk;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      reviewsViewport.classList.remove('is-dragging');
      resumeAuto(2000);
    }
  });

  // Manual arrow navigation
  if (revPrev) {
    revPrev.addEventListener('click', () => {
      pauseAuto();
      const card = reviewsTrack.querySelector('.review-slide');
      const step = card ? card.offsetWidth + 20 : 400;
      reviewsViewport.scrollBy({ left: -step, behavior: 'smooth' });
      resumeAuto(3000);
    });
  }

  if (revNext) {
    revNext.addEventListener('click', () => {
      pauseAuto();
      const card = reviewsTrack.querySelector('.review-slide');
      const step = card ? card.offsetWidth + 20 : 400;
      reviewsViewport.scrollBy({ left: step, behavior: 'smooth' });
      resumeAuto(3000);
    });
  }
}


// ---------- Booking form -> Google Sheet (Apps Script web app) ----------
// Paste your deployed Web app URL here (see apps-script/Code.gs)
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxgVjQ2qaPP7m-moGnb9eQfztKJoxe0qn0oSpDwFA5zTq6BR9e5g9rDBp8-6-A5j8k/exec';
const form = document.getElementById('bookingForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const condition = form.condition.value;
    const time = form.time.value;

    if (!name || !phone || !condition) {
      alert('Please fill your name, phone number and condition so the team can call you.');
      return;
    }
    if (!/^[0-9+\-\s]{10,15}$/.test(phone)) {
      alert('Please enter a valid phone number.');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    const showSuccess = () => {
      const formContainer = document.getElementById('bookingFormContainer');
      const successState = document.getElementById('formSuccessState');

      if (formContainer && successState) {
        formContainer.classList.add('fade-out');
        setTimeout(() => {
          formContainer.hidden = true;
          formContainer.classList.remove('fade-out');
          successState.hidden = false;

          // Re-trigger SVG tick animation
          const circle = successState.querySelector('.checkmark-circle');
          const check = successState.querySelector('.checkmark-check');
          if (circle && check) {
            circle.style.animation = 'none';
            check.style.animation = 'none';
            void circle.offsetHeight; // trigger reflow
            circle.style.animation = '';
            check.style.animation = '';
          }
        }, 280);
      }
    };

    // Send data to Apps Script
    fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        name,
        phone,
        condition,
        time,
        page: location.href
      })
    })
      .then(() => {
        showSuccess();
      })
      .catch(() => {
        showSuccess();
      })
      .finally(() => {
        btn.disabled = false;
        btn.textContent = label;
      });
  });
}

// Reset form button handler
const btnResetForm = document.getElementById('btnResetForm');
if (btnResetForm) {
  btnResetForm.addEventListener('click', () => {
    const formContainer = document.getElementById('bookingFormContainer');
    const successState = document.getElementById('formSuccessState');
    const bookingForm = document.getElementById('bookingForm');

    if (successState) successState.hidden = true;
    if (bookingForm) bookingForm.reset();
    if (formContainer) formContainer.hidden = false;
  });
}

// ---------- Treatment image topic buttons (if present) ----------
const topicImage = document.getElementById('topicImage');
if (topicImage) {
  document.querySelectorAll('.topic').forEach(topic => {
    topic.addEventListener('click', () => {
      document.querySelectorAll('.topic').forEach(t => t.classList.remove('active'));
      topic.classList.add('active');
      topicImage.src = topic.dataset.image;
      topicImage.alt = topic.dataset.alt;
    });
  });
}

