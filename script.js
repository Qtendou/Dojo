// ==========================================
// 1. Custom Cursor Logic
// ==========================================
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursor-follower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  // Instant cursor pos
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

// Animate follower with a delay (Lerp)
function animateFollower() {
  followerX += (mouseX - followerX) * 0.15;
  followerY += (mouseY - followerY) * 0.15;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

// Cursor states on hoverable items
const hoverables = document.querySelectorAll('a, .magnetic, .hover-tilt');
hoverables.forEach((el) => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hovered');
    cursorFollower.classList.add('hovered');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hovered');
    cursorFollower.classList.remove('hovered');
  });
});

// ==========================================
// 2. Magnetic Elements (Buttons & Images)
// ==========================================
const magnetics = document.querySelectorAll('.magnetic');

magnetics.forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Scale down translation for a subtle magnetic pull
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    // Reset transform springs back
    btn.style.transform = 'translate(0px, 0px)';
  });
});

// ==========================================
// 3. 3D Tilt Effect for Cards
// ==========================================
const tiltCards = document.querySelectorAll('.hover-tilt');

tiltCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation limits (-10 to 10 deg)
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    
    // Update inner glow position
    const glow = card.querySelector('.card-glow');
    if (glow) {
      glow.style.transform = `translate(${x - rect.width}px, ${y - rect.height}px)`;
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  });
});

// ==========================================
// 4. Scroll Revel Animations
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const reveals = document.querySelectorAll('.reveal-slide-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));
});

// ==========================================
// 5. Parallax Hero Background Update
// ==========================================
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const parallaxBg = document.getElementById('parallax-bg');
  
  // Parallax translating the image down slower than content
  if (parallaxBg) {
    parallaxBg.style.transform = `translateY(${scrolled * 0.4}px)`;
  }
});

// ==========================================
// 6. Tide-linked Background Color & Wave Effect (Simulated Reality)
// ==========================================
let globalWaterLevel = 0.5;

function updateTideBackground() {
  const bg = document.getElementById('tide-bg');
  const now = new Date();
  const hour = now.getHours();
  // Simulate high tide around 12 and 0, low tide around 6 and 18.
  const normTime = ((hour % 12) / 12) * Math.PI; 
  globalWaterLevel = Math.abs(Math.cos(normTime)); // 1.0 = High, 0.0 = Low

  if (!bg) return;
  const rH = 6, gH = 17, bH = 33;    // Dark
  const rL = 12, gL = 43, bL = 71;   // Lighter

  const r = Math.round(rL + (rH - rL) * globalWaterLevel);
  const g = Math.round(gL + (gH - gL) * globalWaterLevel);
  const b = Math.round(bL + (bH - bL) * globalWaterLevel);

  bg.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}
updateTideBackground();
setInterval(updateTideBackground, 60000);

// Wave Animation Canvas
const waveCanvas = document.getElementById('wave-canvas');
const waveCtx = waveCanvas ? waveCanvas.getContext('2d') : null;
let waveBaseHeight = 0;
let waveTime = 0;

function resizeWaveCanvas() {
  if (!waveCanvas) return;
  waveCanvas.width = window.innerWidth;
  waveCanvas.height = window.innerHeight;
}
if (waveCanvas) {
  window.addEventListener('resize', resizeWaveCanvas);
  resizeWaveCanvas();
}

function drawSingleWaveLine(baseY, length, timeOffset, color, amplitude, lineWidth) {
  if (!waveCtx) return;
  waveCtx.beginPath();
  // Start drawing the line from the left edge
  waveCtx.moveTo(0, baseY + Math.sin(timeOffset) * amplitude);
  for (let x = 0; x <= waveCanvas.width; x += 20) {
    const y = baseY + Math.sin(x * length + timeOffset) * amplitude;
    waveCtx.lineTo(x, y);
  }
  // Remove closePath and fill, use stroke instead for wireframe lines
  waveCtx.strokeStyle = color;
  waveCtx.lineWidth = lineWidth;
  // Make lines smooth
  waveCtx.lineCap = 'round';
  waveCtx.lineJoin = 'round';
  waveCtx.stroke();
}

function animateWaves() {
  if (!waveCtx) return;
  requestAnimationFrame(animateWaves);
  waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
  
  const targetHeight = waveCanvas.height * (0.9 - (globalWaterLevel * 0.3));
  waveBaseHeight += (targetHeight - waveBaseHeight) * 0.02;
  if (waveBaseHeight === 0) waveBaseHeight = targetHeight;
  
  waveTime += 0.015;
  
  // Draw thick digital wave lines (Background -> Foreground)
  // Back wave (Blue, 4px)
  drawSingleWaveLine(waveBaseHeight - 20, 0.003, waveTime * 1.5, 'rgba(72, 202, 228, 0.4)', 30, 4);
  // Mid wave (White, 6px)
  drawSingleWaveLine(waveBaseHeight + 10, 0.004, waveTime + 2, 'rgba(255, 255, 255, 0.3)', 40, 6);
  // Front wave (Brand Orange, 8px)
  drawSingleWaveLine(waveBaseHeight + 40, 0.005, -waveTime * 1.2, 'rgba(255, 90, 0, 0.8)', 20, 8);
}

if (waveCanvas) {
  animateWaves();
}

// ==========================================
// 7. Advanced Interactive Particles (Connecting Lines)
// ==========================================
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let maxDistance = 120; // Distance to draw lines

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});

class Particle {
  constructor(x, y, vx, vy, size, color) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.size = size;
    this.baseX = this.x; this.baseY = this.y;
    this.density = (Math.random() * 30) + 1;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    // Mouse Interaction
    let dx = mouseX - this.x;
    let dy = mouseY - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let interactionDist = 150;

    if (distance < interactionDist) {
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let force = (interactionDist - distance) / interactionDist;
        let pushScale = 3; 

        // Repel
        this.x -= forceDirectionX * force * this.density * pushScale * 0.1;
        this.y -= forceDirectionY * force * this.density * pushScale * 0.1;
    } else {
        // Return slowly to normal drift pattern based on velocity
        this.x += this.vx;
        this.y += this.vy;
    }

    // Wrap
    if(this.x > canvas.width) this.x = 0;
    if(this.x < 0) this.x = canvas.width;
    if(this.y > canvas.height) this.y = 0;
    if(this.y < 0) this.y = canvas.height;
  }
}

function initParticles() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particlesArray = [];
  let numberOfParticles = (canvas.height * canvas.width) / 11000;
  
  for (let i = 0; i < numberOfParticles; i++) {
    let size = (Math.random() * 2) + 0.5;
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let vx = (Math.random() - 0.5);
    let vy = (Math.random() - 0.5);
    let color = Math.random() > 0.8 ? 'rgba(255, 90, 0, 0.8)' : 'rgba(255, 255, 255, 0.5)';
    particlesArray.push(new Particle(x, y, vx, vy, size, color));
  }
}

function connectParticles() {
    let opStr = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                // Lines opacity based on distance
                opStr = 1 - (distance/maxDistance);
                ctx.strokeStyle = `rgba(255, 255, 255, ${opStr * 0.2})`;
                // if it's an orange particle, make the line orange-ish
                if (particlesArray[a].color.includes('255, 90, 0') || particlesArray[b].color.includes('255, 90, 0')) {
                    ctx.strokeStyle = `rgba(255, 90, 0, ${opStr * 0.3})`;
                }

                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
  requestAnimationFrame(animateParticles);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
    particlesArray[i].draw();
  }
  connectParticles(); // Add the connecting lines effect
}

initParticles();
animateParticles();

// ==========================================
// 8. Dynamic Word Cycle (書き換える → 壊す → 変える → バグ)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const dynamicWord = document.getElementById('dynamic-word');
  if (!dynamicWord) return;

  const cycle = [
    { text: '書き換える。', class: 'effect-write', duration: 2000 },
    { text: '壊す。', class: 'effect-break', duration: 2000 },
    { text: '変える。', class: 'effect-change', duration: 2000 },
    { class: 'effect-glitch', duration: 2000 }
  ];

  let currentIndex = 0;
  let glitchInterval = null;

  function updateWord() {
    clearInterval(glitchInterval);

    // move to next
    currentIndex = (currentIndex + 1) % cycle.length;
    const currentPhase = cycle[currentIndex];

    // Reset element completely to re-trigger animations
    dynamicWord.style.animation = 'none';
    dynamicWord.offsetHeight; /* trigger reflow */
    dynamicWord.style.animation = null;

    dynamicWord.className = currentPhase.class;

    if (currentPhase.class === 'effect-glitch') {
       const glitchWords = ['書き換える。', '壊す。', '変える。', '%&$#@!。', '010110。', 'ERR_500。'];
       glitchInterval = setInterval(() => {
           const randWord = glitchWords[Math.floor(Math.random() * glitchWords.length)];
           dynamicWord.setAttribute('data-text', randWord);
           dynamicWord.innerText = randWord;
       }, 60); // fast random switch
    } else {
       dynamicWord.setAttribute('data-text', currentPhase.text);
       dynamicWord.innerText = currentPhase.text;
    }

    // Schedule next
    setTimeout(updateWord, currentPhase.duration);
  }

  // start cycle after initial reveal delay
  setTimeout(updateWord, 3500);
});

// ==========================================
// 9. GSAP ScrollTrigger Animations & Polygon Masks
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Check if GSAP is loaded
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Background huge typography parallax (Horizontal scroll tied to vertical scroll)
  const bgType = document.getElementById('bg-typography');
  if (bgType) {
    gsap.to(bgType, {
      x: "-=100vw", // Move left across the screen
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 2 // smooth scrub
      }
    });
  }

  // Polygon Image Scroll Morph
  const polyImages = document.querySelectorAll('.mask-polygon-scroll');
  polyImages.forEach(img => {
    gsap.set(img, { clipPath: 'polygon(5% 0%, 95% 5%, 100% 95%, 0% 100%)' });
    
    gsap.to(img, {
      clipPath: 'polygon(0% 10%, 100% 0%, 95% 100%, 5% 90%)',
      scrollTrigger: {
        trigger: img,
        start: "top 90%",
        end: "bottom 10%",
        scrub: 1
      }
    });
  });

  // Hero image mask animate on load
  const heroImg = document.querySelector('.hero-image.mask-polygon');
  if (heroImg) {
    gsap.fromTo(heroImg, 
      { clipPath: 'polygon(30% 0%, 70% 0%, 70% 100%, 30% 100%)' }, // slit
      { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 2, ease: "power4.out", delay: 0.1 }
    );
  }
});
