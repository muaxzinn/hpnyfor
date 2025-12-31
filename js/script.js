// --- Configuration ---
const START_DATE = new Date('2025-01-01T00:00:00'); // Start of 2025
const REQUIRED_FIREWORKS = 5;

// --- Elements ---
const introOverlay = document.getElementById('intro-overlay');
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('music-toggle');
const themeBtns = document.querySelectorAll('.theme-btn');
const introCanvas = document.getElementById('intro-canvas');
const introCtx = introCanvas ? introCanvas.getContext('2d') : null;

// --- State ---
let gameState = 'FIREWORKS'; // 'FIREWORKS', 'WISH', 'MAIN'
let clicks = 0;
let introParticles = [];
let animationFrameId = null;

// --- 1. Theme Switcher ---
const savedTheme = localStorage.getItem('hny-theme') || 'theme-cute';
document.body.className = savedTheme;

themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        document.body.className = theme;
        localStorage.setItem('hny-theme', theme);
        gsap.fromTo('body', { opacity: 0.8 }, { opacity: 1, duration: 0.5 });
    });
});

// ==========================================
// GAME: FIREWORKS INTRO
// ==========================================
function initFireworksGame() {
    gameState = 'LOADING';
    if (introCanvas) introCanvas.classList.remove('hidden');

    // Simulate Loading then Show Game
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        const gameUI = document.getElementById('game-ui');

        if (loader) {
            gsap.to(loader, {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    loader.classList.add('hidden');
                    if (gameUI) {
                        gameUI.classList.remove('hidden');
                        gsap.fromTo(gameUI, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1 });
                    }
                    gameState = 'FIREWORKS';
                    resizeIntroCanvas();
                    fireworksLoop();
                }
            });
        }
    }, 2000); // 2 Seconds Loading
}

function resizeIntroCanvas() {
    if (introCanvas) {
        introCanvas.width = window.innerWidth;
        introCanvas.height = window.innerHeight;
    }
}
window.addEventListener('resize', () => {
    if (gameState === 'FIREWORKS') resizeIntroCanvas();
});

function fireworksLoop() {
    if (gameState !== 'FIREWORKS' || !introCtx) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        return;
    }

    introCtx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Trails
    introCtx.fillRect(0, 0, introCanvas.width, introCanvas.height);

    for (let i = 0; i < introParticles.length; i++) {
        introParticles[i].update();
        introParticles[i].draw(introCtx);
        if (introParticles[i].life <= 0) {
            introParticles.splice(i, 1);
            i--;
        }
    }
    animationFrameId = requestAnimationFrame(fireworksLoop);
}

// Click to Launch Firework
if (introCanvas) {
    introCanvas.addEventListener('click', (e) => {
        if (gameState !== 'FIREWORKS') return;

        // 1. Play Music on first interaction logic
        if (bgm && bgm.paused) {
            bgm.play().catch(err => console.log("Audio autoplay prevented", err));
            const mainBtn = document.getElementById('music-toggle');
            if (mainBtn) mainBtn.innerHTML = '<i class="ph-fill ph-pause"></i>';
        }

        // 2. Handle Game Interaction (Fireworks & Messages)
        handleInteraction(e);
    });
}

function createExplosion(x, y) {
    // Pink/Rose/Gold Palette
    const colors = ['#ff9aa2', '#ffb7b2', '#ff6f91', '#ff9671', '#ffc75f', '#f9f871', '#e84393', '#fd79a8'];
    const pCount = 50;

    for (let i = 0; i < pCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        introParticles.push(new IntroParticle(x, y, color));
    }
}

class IntroParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 2;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed;
        this.gravity = 0.05;
        this.friction = 0.95;
        this.life = 100;
        this.alpha = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.speedX *= this.friction;
        this.speedY *= this.friction;
        this.life -= 2;
        this.alpha = this.life / 100;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// --- Cleanup & Helpers ---
function launchFireworksCleanup() {
    // Launch a finale of random fireworks
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createExplosion(
                Math.random() * introCanvas.width,
                Math.random() * introCanvas.height * 0.8
            );
        }, i * 300);
    }
}

// ==========================================
// TRANSITION: FLOWER -> MAIN SITE
// ==========================================
function transitionToFlowerGift() {
    if (gameState === 'FLOWER') return;
    gameState = 'FLOWER';

    const wishUI = document.getElementById('wish-ui'); // Note: wish-ui might contain the button now
    const gameUI = document.getElementById('game-ui'); // The button is actually in game-ui if dynamically added
    const flowerUI = document.getElementById('flower-gift-ui');

    // Helper to hide whatever is currently visible
    const fadeOutTarget = gameUI || wishUI;

    gsap.to(fadeOutTarget, {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power2.in",
        onComplete: () => {
            if (gameUI) gameUI.classList.add('hidden');
            if (wishUI) wishUI.classList.add('hidden');

            // 2. Show Flower UI
            if (flowerUI) {
                flowerUI.classList.remove('hidden');

                // --- Background Sparkles (Stars) ---
                const nightLayer = flowerUI.querySelector('.night') || flowerUI;
                // Create 50 sparkles
                for (let k = 0; k < 50; k++) {
                    const s = document.createElement('div');
                    s.className = 'flower-sparkle';
                    s.style.left = Math.random() * 100 + '%';
                    s.style.top = Math.random() * 80 + '%'; // Keep mostly in upper sky
                    s.style.animationDelay = Math.random() * 3 + 's';
                    s.style.background = Math.random() > 0.8 ? '#ffdf00' : 'white'; // Some gold stars
                    nightLayer.appendChild(s);
                }

                // 2. Fireflies (Romantic Floating Lights) - "Date Night" Vibe
                setInterval(() => {
                    if (gameState !== 'FLOWER') return;
                    const nLayer = flowerUI.querySelector('.night') || flowerUI;
                    const f = document.createElement('div');
                    f.className = 'firefly';
                    f.style.left = Math.random() * 100 + '%';
                    f.style.top = (Math.random() * 40 + 60) + '%'; // Start near bottom
                    f.style.animationDuration = (Math.random() * 3 + 4) + 's';
                    nLayer.appendChild(f);

                    // Cleanup firefly
                    setTimeout(() => f.remove(), 8000);
                }, 800); // New firefly every 0.8s

                // 3. Mini Background Fireworks (Celebration)
                setInterval(() => {
                    if (gameState !== 'FLOWER') return;
                    const nLayer = flowerUI.querySelector('.night') || flowerUI;
                    const fx = Math.random() * 100; // %
                    const fy = Math.random() * 50; // Top half
                    createCSSFirework(fx, fy, nLayer);
                }, 1500); // Burst every 1.5s

                function createCSSFirework(x, y, container) {
                    const colors = ['#ff0044', '#ffdd00', '#00ffcc', '#ff00ff'];
                    const color = colors[Math.floor(Math.random() * colors.length)];

                    // Create particles
                    for (let i = 0; i < 12; i++) {
                        const p = document.createElement('div');
                        p.className = 'mini-firework';
                        p.style.backgroundColor = color;
                        p.style.left = x + '%';
                        p.style.top = y + '%';

                        // Random angle explosion
                        const angle = (Math.PI * 2 * i) / 12;
                        const dist = Math.random() * 50 + 30; // px distance
                        const tx = Math.cos(angle) * dist;
                        const ty = Math.sin(angle) * dist;

                        container.appendChild(p);

                        gsap.to(p, {
                            x: tx,
                            y: ty,
                            opacity: 0,
                            scale: 0.5,
                            duration: 1,
                            ease: "power2.out",
                            onComplete: () => p.remove()
                        });
                    }
                }

                // Animate Text
                const titleEl = document.getElementById('flower-title-text');
                const text = "Happy New Year 2026";
                let i = 0;
                titleEl.innerHTML = '';
                gsap.to('.flower-title', { opacity: 1, duration: 1 });

                function typeWriter() {
                    if (i < text.length) {
                        titleEl.innerHTML += text.charAt(i);
                        i++;
                        setTimeout(typeWriter, 150);
                    } else {
                        // Text done, wait then go to main
                        setTimeout(() => {
                            finishIntroSequence();
                        }, 5000);
                    }
                }
                typeWriter();
            } else {
                finishIntroSequence();
            }
        }
    });
}


// --- Intro Message Sequence Logic ---
const introMessages = [
    "ดีใจที่กดเข้ามานะจิงๆเรามีเรื่องอยากบอกตั้งนานละแต่หาจังหวะไม่ได้เลยขอมาพิมบอกในนี้แทนละกันคับ",
    "อยากบอกว่าแกเก่งมากๆเลยนะที่อดทนผ่านทุกๆวินาทีของปีที่ผ่านมาได้รู้ว่ามันไม่ง่ายเลยแต่แกก็ยังสู้มาถึงตรงนี้ได้เราภูมิใจในตัวแกที่สุดเลยคับ",
    "ปีหน้าคงต้องเหนื่อยหน่อยนะเพื่อสิ่งที่แกฝันไม่รู้ว่าสรุปแล้วอยากเป็นพยาบาลมั้ยหรือเป็นไรแต่ไหนๆก็ชอบเรียกเราว่าจารย์ละงั้นให้จารย์คนนี้อวยพรให้แกสมหวังละกันนะคับ",
    "ถ้าวันไหนเหนื่อยจนท้อก็หันมานะจารย์จะคอยเชียร์อยู่ตรงนี้แหละสัญญาว่าจะรอดูวันที่แกประสบความสำเร็จนะคับสู้ๆนะคนเก่ง",
    "Happy New Year 2026 นะคับขอให้ปีหน้าใจดีกับแกมากๆเป็นรอยยิ้มให้จารย์ไปนานๆนะเป็นห่วงและหวังดีกับแกที่สุดเลยคับ"
];

function handleInteraction(e) {
    if (gameState !== 'FIREWORKS') return;

    // Get click position
    const rect = introCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (clicks < 5) {
        clicks++;
        createExplosion(x, y);

        // Update UI with Story Message
        const instruction = document.querySelector('.game-instruction');

        if (instruction && introMessages[clicks - 1]) {
            // Retrieve message text
            const msg = introMessages[clicks - 1];

            // 1. Fade old out
            gsap.to(instruction, {
                opacity: 0,
                y: -10,
                duration: 0.2,
                onComplete: () => {
                    // 2. Prepare new text split by characters
                    instruction.innerHTML = ''; // Clear
                    instruction.style.opacity = 1; // Reset container opacity so spans can show
                    instruction.style.transform = 'translateY(0)'; // Reset position

                    // Create spans for characters
                    const chars = msg.split('');
                    chars.forEach(char => {
                        const span = document.createElement('span');
                        span.textContent = char;
                        span.style.opacity = 0; // Start hidden
                        instruction.appendChild(span);
                    });

                    // Styling Ensure
                    instruction.style.fontSize = "2rem";
                    instruction.style.maxWidth = "80%";
                    instruction.style.margin = "0 auto 2rem auto";

                    // 3. Stagger Fade In (Typewriter effect)
                    gsap.to(instruction.children, {
                        opacity: 1,
                        y: 0,
                        duration: 0.05, // Fast fade per char
                        stagger: 0.03,  // Interval between chars
                        ease: "none"
                    });
                }
            });
        }

        // Final Step reached
        if (clicks === 5) {
            launchFireworksCleanup();

            // Show "Open Gift" button after the last message settles
            setTimeout(() => {
                const gameUI = document.getElementById('game-ui');

                if (gameUI) {
                    const openBtn = document.createElement('button');
                    openBtn.className = 'wish-btn';
                    openBtn.innerHTML = 'Open Gift <i class="ph-fill ph-gift"></i>';
                    // Important: Ensure the button can be clicked
                    openBtn.style.pointerEvents = 'auto';
                    openBtn.onclick = transitionToFlowerGift;

                    gameUI.appendChild(openBtn);
                    gsap.from(openBtn, { y: 20, opacity: 0, duration: 0.5 });
                }
            }, 1000);
        }
    }
}

// ==========================================
// TRANSITION: FLOWER -> MAIN SITE
// ==========================================
function finishIntroSequence() {
    if (gameState === 'MAIN') return;
    gameState = 'MAIN';

    // Fade out entire overlay including flowers
    gsap.to('#intro-overlay', {
        opacity: 0,
        duration: 2,
        onComplete: () => {
            const overlay = document.getElementById('intro-overlay');
            if (overlay) overlay.style.display = 'none';
            if (introCanvas) introCanvas.remove();
            startMainAnimations();
        }
    });
}

// --- Main Message Form ---
const mainMsgForm = document.getElementById('message-form');
if (mainMsgForm) {
    mainMsgForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const textarea = mainMsgForm.querySelector('textarea');
        const msg = textarea.value;
        const btn = mainMsgForm.querySelector('button');

        if (msg.trim()) {
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Sending... <i class="ph-bold ph-spinner ph-spin"></i>';
            btn.disabled = true;

            sendToSheet({ type: 'Message', content: msg }).finally(() => {
                alert("Message sent! She will read it soon. ❤️");
                textarea.value = '';
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
        }
    });
}


// --- 3. Audio Control ---
if (musicBtn && bgm) {
    musicBtn.addEventListener('click', () => {
        if (bgm.paused) {
            bgm.play();
            musicBtn.innerHTML = '<i class="ph-fill ph-pause"></i>';
        } else {
            bgm.pause();
            musicBtn.innerHTML = '<i class="ph-fill ph-play"></i>';
        }
    });
    bgm.addEventListener('play', () => musicBtn.innerHTML = '<i class="ph-fill ph-pause"></i>');
    bgm.addEventListener('pause', () => musicBtn.innerHTML = '<i class="ph-fill ph-play"></i>');
}


// --- 4. Main Timer & Render ---
// --- 4. Main Timer & Render ---
let timerMode = '2025'; // '2025' or '2026'
const DATE_2025 = new Date('2025-01-01T00:00:00');
const DATE_2026 = new Date('2026-01-01T00:00:00');

function updateTimer() {
    const now = new Date();
    let diff;

    if (timerMode === '2025') {
        // Time Passed since start of 2025
        diff = now - DATE_2025;
    } else {
        // 2026 Logic
        if (now < DATE_2026) {
            // Countdown to 2026
            diff = DATE_2026 - now;
            const lbl = document.querySelector('.time-label');
            if (lbl) lbl.innerText = "Countdown to 2026";
        } else {
            // Time Passed in 2026
            diff = now - DATE_2026;
            const lbl = document.querySelector('.time-label');
            if (lbl) lbl.innerText = "Time passed in 2026";
        }
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const dEl = document.getElementById('days');
    if (dEl) {
        dEl.innerText = days;
        document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
    }

    requestAnimationFrame(updateTimer);
}

// Button Listener for Timer Switch
document.addEventListener('click', (e) => {
    const readyBtn = e.target.closest('.ready-btn');
    if (readyBtn) {
        // Switch Timer Mode
        timerMode = '2026';

        // Pulse animation for timer
        gsap.from('.timer-grid', { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 });

        // Swap Buttons: Hide Ready -> Show Special
        gsap.to(readyBtn, {
            opacity: 0,
            y: -10,
            duration: 0.3,
            onComplete: () => {
                readyBtn.style.display = 'none';

                const specialBtn = document.getElementById('special-btn');
                if (specialBtn) {
                    specialBtn.classList.remove('hidden');
                    gsap.fromTo(specialBtn,
                        { opacity: 0, y: 10 },
                        { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
                    );
                }
            }
        });
    }
});

function startMainAnimations() {
    updateTimer();

    // Hero Canvas (Simpler background particles)
    const hCanvas = document.getElementById('hero-canvas');
    if (hCanvas) {
        hCanvas.width = window.innerWidth;
        hCanvas.height = window.innerHeight;
    }

    gsap.from('.hny-title', { y: 50, opacity: 0, duration: 1.5, ease: "power3.out" });
    gsap.from('.timer-grid .time-unit', {
        y: 30, opacity: 0, duration: 1, stagger: 0.2, delay: 0.5, ease: "back.out(1.7)"
    });
    gsap.from('.hero-submessage', { opacity: 0, scale: 0.9, duration: 1.5, delay: 1, ease: "power2.out" });

    // FETCH DYNAMIC CONTENT FROM GOOGLE SHEETS
    fetchDailyContent();
}

function fetchDailyContent() {
    // TODO: User must replace this URL after deploying the script
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKZUibLE59ppXOiSLM9Yxtlr-DPWtMEWvvt6dRfIaonbSVhT6Dydyczgiy7qyE9Ik/exec';

    if (GOOGLE_SCRIPT_URL.includes('REPLACE')) {
        if (window.hnyData) renderPosts();
        return;
    }

    // Call doGet to get the links
    fetch(GOOGLE_SCRIPT_URL)
        .then(res => res.json())
        .then(response => {
            // New Backend returns { dailyContent: [...], specialMessage: "..." }
            const data = response.dailyContent || (Array.isArray(response) ? response : []);
            const specialMsg = response.specialMessage || "";

            if (Array.isArray(data) && data.length > 0) {
                // Merge Sheet data into local window.hnyData
                data.forEach(sheetItem => {
                    // sheetItem: { day, title, ig_link, music, messages: [] }

                    // Simple merge strategy: Look for Day match
                    // Assuming window.hnyData has "day" property if we had it, but currently it's array index based
                    // Let's rely on day index 1-based
                    const index = sheetItem.day - 1;
                    if (window.hnyData && window.hnyData[index]) {
                        // Title
                        if (sheetItem.title) window.hnyData[index].title = sheetItem.title;

                        // Messages (Multi-column join)
                        if (sheetItem.messages && sheetItem.messages.length > 0) {
                            window.hnyData[index].message = sheetItem.messages.map(m => `<p style="margin-bottom:10px;">${m}</p>`).join('');
                        } else if (sheetItem.message) {
                            window.hnyData[index].message = sheetItem.message;
                        }

                        // Links (IG)
                        if (sheetItem.ig_link) {
                            window.hnyData[index].links = [sheetItem.ig_link];
                        }

                        // Music (New!)
                        if (sheetItem.music) {
                            window.hnyData[index].music = sheetItem.music;
                        }
                    }
                });
            }

            renderPosts();
        })
        .catch(err => {
            console.error("Failed to load sheet content", err);
            renderPosts();
        });
}

function renderPosts() {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;

    const today = new Date();

    if (!window.hnyData) return;

    window.hnyData.forEach((item) => {
        const postDate = new Date(item.date);
        today.setHours(0, 0, 0, 0);
        postDate.setHours(0, 0, 0, 0);

        if (today < postDate) {
            // Future Post: Do NOT render anything (User request: "Tonight just HNY")
            return;
        }

        // Unlocked Content
        const card = document.createElement('div');
        card.className = 'timeline-item';
        card.classList.remove('locked');

        let linksHtml = '';
        if (item.links && item.links.length > 0) {
            item.links.forEach(link => {
                if (link.trim().startsWith('<')) {
                    linksHtml += `<div class="ig-embed-container">${link}</div>`;
                } else if (link.includes('instagram.com')) {
                    linksHtml += `<div class="ig-embed-container">
                         <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${link}" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
                         </blockquote>
                      </div>`;
                } else {
                    // Generic Link
                    linksHtml += `<div class="generic-link"><a href="${link}" target="_blank">View Link <i class="ph-bold ph-arrow-square-out"></i></a></div>`;
                }
            });
        }

        if (item.customAction === 'chat') {
            card.innerHTML = `
                 <div class="post-date">${new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                 <h3 class="post-title">${item.title}</h3>
                 <p class="post-msg">${item.message}</p>
                 <button class="action-btn" onclick="openChat(${JSON.stringify(item.chatData).replace(/"/g, '&quot;')})">
                     Click to Start Chat <i class="ph-fill ph-chats-circle"></i>
                 </button>
             `;
        } else {
            card.innerHTML = `
                 <div class="post-date">${new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                 <h3 class="post-title">${item.title}</h3>
                 <div class="post-msg">${item.message}</div>
                 <div class="post-media">${linksHtml}</div>
             `;

            // Add Music Button if specific music exists
            if (item.music) {
                const musicBtn = document.createElement('button');
                musicBtn.className = 'action-btn';
                musicBtn.style.marginTop = '1rem';
                musicBtn.style.fontSize = '0.9rem';
                musicBtn.innerHTML = `Play Song for this Day <i class="ph-fill ph-play-circle"></i>`;
                musicBtn.onclick = () => {
                    const bgm = document.getElementById('bgm');
                    if (bgm) {
                        bgm.src = item.music;
                        bgm.load();
                        bgm.play();
                        const mainBtn = document.getElementById('music-toggle');
                        if (mainBtn) mainBtn.innerHTML = '<i class="ph-fill ph-pause"></i>';
                    }
                };
                card.appendChild(musicBtn);
            }
        }

        timeline.appendChild(card);

        gsap.from(card, {
            scrollTrigger: { trigger: card, start: "top 85%" },
            y: 50, opacity: 0, duration: 0.8, ease: "power2.out"
        });
    });

    if (window.instgrm) window.instgrm.Embeds.process();
}

// Start Application
initFireworksGame();

// Track Visit (on load) - Simple mock
window.addEventListener('load', () => {
    let visits = localStorage.getItem('daily_visits_count') || 0;
    visits++;
    localStorage.setItem('daily_visits_count', visits);
    // sendToSheet is logic for backend, keeping it minimal here to avoid clutter
});

// Mock sendToSheet for form
function sendToSheet(data) {
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKZUibLE59ppXOiSLM9Yxtlr-DPWtMEWvvt6dRfIaonbSVhT6Dydyczgiy7qyE9Ik/exec';
    return fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

// CHAT FUNCTIONALITY
let currentChatData = [];
let chatIndex = 0;

window.openChat = function (chatData) {
    const overlay = document.getElementById('chat-overlay');
    const chatBox = document.getElementById('chat-box');
    const controls = document.getElementById('chat-controls');

    currentChatData = chatData;
    chatIndex = 0;

    chatBox.innerHTML = ''; // Clear previous
    controls.innerHTML = '<button class="chat-btn" onclick="nextChatStep()">Click to Continue</button>';
    overlay.classList.remove('hidden');

    nextChatStep();
}

window.closeChat = function () {
    document.getElementById('chat-overlay').classList.add('hidden');
}

window.nextChatStep = function () {
    if (chatIndex >= currentChatData.length) {
        const controls = document.getElementById('chat-controls');
        controls.innerHTML = '<button class="chat-btn" onclick="closeChat()">End Conversation</button>';
        return;
    }

    const data = currentChatData[chatIndex];
    const chatBox = document.getElementById('chat-box');

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${data.sender}`;
    bubble.innerText = data.text;
    chatBox.appendChild(bubble);

    gsap.to(bubble, { opacity: 1, y: 0, duration: 0.5 });
    chatBox.scrollTop = chatBox.scrollHeight;

    const controls = document.getElementById('chat-controls');
    if (data.options) {
        controls.innerHTML = '';
        data.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chat-btn';
            btn.innerText = opt;
            btn.onclick = () => {
                const userBubble = document.createElement('div');
                userBubble.className = 'chat-bubble user';
                userBubble.innerText = opt;
                chatBox.appendChild(userBubble);
                gsap.to(userBubble, { opacity: 1, y: 0, duration: 0.5 });
                chatIndex++;
                setTimeout(nextChatStep, 500);
            };
            controls.appendChild(btn);
        });
    } else {
        controls.innerHTML = '<button class="chat-btn" onclick="nextChatStep()">Click to Continue</button>';
        chatIndex++;
    }
}
