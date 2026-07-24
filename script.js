// --- Sakura Canvas Animation ---
const canvas = document.getElementById('sakura-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let petals = [];

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Petal {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height - height;
        this.size = Math.random() * 6 + 4; // Slightly smaller, delicate
        this.speedY = Math.random() * 0.7 + 0.3; // Slower fall
        this.speedX = Math.random() * 1 - 0.5; // Gentler drift
        this.angle = Math.random() * 360;
        this.spin = Math.random() * 1 - 0.5; // Very slow spin
        this.opacity = Math.random() * 0.6 + 0.2;
    }
    update(intensity = 1) {
        this.y += this.speedY * intensity;
        this.x += this.speedX + (Math.sin(this.angle * Math.PI / 180) * 0.5);
        this.angle += this.spin;

        if (this.y > height + this.size) {
            this.y = -this.size;
            this.x = Math.random() * width;
        }
        if (this.x > width + this.size) this.x = -this.size;
        if (this.x < -this.size) this.x = width + this.size;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.fillStyle = `rgba(255, 183, 197, ${this.opacity})`;
        ctx.beginPath();
        // A simple petal shape
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(this.size, -this.size, this.size*2, this.size, 0, this.size*1.5);
        ctx.bezierCurveTo(-this.size*2, this.size, -this.size, -this.size, 0, 0);
        ctx.fill();
        ctx.restore();
    }
}

function initPetals(count = 50) {
    petals = [];
    for (let i = 0; i < count; i++) {
        petals.push(new Petal());
    }
}

let petalIntensity = 1;
function animatePetals() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach(petal => {
        petal.update(petalIntensity);
        petal.draw();
    });
    requestAnimationFrame(animatePetals);
}

initPetals(80);
animatePetals();


// --- Interaction Logic ---
const envelopeWrapper = document.getElementById('envelope-wrapper');
const envelope = document.querySelector('.envelope');
const sceneOpening = document.getElementById('scene-opening');
const sceneStory = document.getElementById('scene-story');
const sceneEnding = document.getElementById('scene-ending');
const flashOverlay = document.getElementById('flash-overlay');

// Open Envelope
envelopeWrapper.addEventListener('click', () => {
    // Only trigger once
    if (envelopeWrapper.classList.contains('open')) return;

    // Attempt to play audio if exists
    // const audio = document.getElementById('bg-music');
    // if(audio) audio.play();

    // 1. Open envelope animation
    envelopeWrapper.classList.add('open');
    document.getElementById('start-hint').style.display = 'none';
    
    // Increase petal intensity temporarily
    petalIntensity = 3;

    const overlay = document.getElementById('white-overlay');

    // Step 2: Letter pulls out slightly after flap opens
    setTimeout(() => {
        document.getElementById('env-letter').classList.add('pull-out');
        
        // Begin fading the screen to white for a smooth scene transition
        if(overlay) overlay.classList.add('active'); 
    }, 600); 

    // Step 3: Directly transition to the next scene (no more zooming/expanding)
    setTimeout(() => {
        transitionToScene(sceneOpening, sceneStory);
        petalIntensity = 1; // restore intensity
        
        // Remove overlay to reveal the story scene
        if(overlay) overlay.classList.remove('active');
        
        // Start typing page 1
        startTypewriter(document.getElementById('page-1'));
    }, 1600); // Trigger transition 1 second after letter pulls out
});

// Page Navigation
function nextPage(pageNum) {
    const currentPage = document.querySelector('.page.active');
    const nextPageEl = document.getElementById(`page-${pageNum}`);
    
    if (pageNum <= 3) {
        // Direct aesthetic transition for story pages (relies on CSS fadeInPage)
        currentPage.classList.remove('active');
        nextPageEl.classList.add('active');
        
        // Start typewriter animation for the new page
        startTypewriter(nextPageEl);
    } else {
        // Transition to ending scene seamlessly
        transitionToScene(sceneStory, sceneEnding);
        
        // Change background to sunset smoothly
        document.getElementById('bg-afternoon').classList.remove('active');
        document.getElementById('bg-sunset').classList.add('active');
        
        // More petals for ending
        initPetals(120);
        petalIntensity = 1.5;
    }
}

// Scene Transition Helper
function transitionToScene(hideScene, showScene) {
    hideScene.style.opacity = 0; // Trigger CSS opacity fade-out
    setTimeout(() => {
        hideScene.classList.remove('active');
        showScene.classList.add('active');
        showScene.style.opacity = 1; // Trigger CSS opacity fade-in

    }, 1000);
}

// Trick Button Logic (Tidak dimaafin)
const btnNo = document.getElementById('btn-no');
let currentTx = 0;
let currentTy = 0;
let dodgeCount = 0;

function moveButtonAway() {
    dodgeCount++;
    
    // After 5 attempts, the button gives up and fades away gracefully
    if (dodgeCount > 5) {
        btnNo.style.transition = 'opacity 0.8s ease, transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        btnNo.style.opacity = '0';
        btnNo.style.pointerEvents = 'none';
        return;
    }

    // Get the current physical bounding box of the button
    const rect = btnNo.getBoundingClientRect();
    
    // Calculate a random absolute position on the screen
    // We add 20px padding so it never touches the absolute edge
    const targetX = Math.random() * (window.innerWidth - rect.width - 40) + 20;
    const targetY = Math.random() * (window.innerHeight - rect.height - 40) + 20;
    
    // Calculate the difference between current position and target position
    const deltaX = targetX - rect.left;
    const deltaY = targetY - rect.top;
    
    // Accumulate the translation
    currentTx += deltaX;
    currentTy += deltaY;
    
    // Apply elegant, smooth GPU-accelerated translation
    btnNo.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    btnNo.style.transform = `translate(${currentTx}px, ${currentTy}px)`;
}

if (btnNo) {
    // Move ONLY when strictly clicked
    btnNo.addEventListener('click', (e) => {
        e.preventDefault();
        moveButtonAway();
    });
}

// --- Typewriter Animation Logic ---
let typeWriterTimeouts = [];

function startTypewriter(pageEl) {
    // Clear any existing typing timeouts to prevent overlaps
    typeWriterTimeouts.forEach(t => clearTimeout(t));
    typeWriterTimeouts = [];
    
    // Hide the Next button initially
    const nextBtn = pageEl.querySelector('.btn-next');
    if (nextBtn) nextBtn.classList.remove('show');

    // Find all handwriting and list items to type
    const elements = pageEl.querySelectorAll('.handwriting, .promise-list li');
    
    // Hide and prepare elements by saving their original text
    elements.forEach(el => {
        if(!el.dataset.originalText) {
            // Keep the checkmark symbol if it exists, or just the text
            el.dataset.originalText = el.textContent.trim();
        }
        el.textContent = '';
        el.style.opacity = 1; // Make sure CSS doesn't hide it
    });

    let currentElIndex = 0;
    let currentCharIndex = 0;

    function typeNextChar() {
        if (currentElIndex >= elements.length) {
            // Done typing all elements! Show the Next button.
            if (nextBtn) nextBtn.classList.add('show');
            return;
        }
        
        const el = elements[currentElIndex];
        const text = el.dataset.originalText;
        
        if (currentCharIndex < text.length) {
            el.textContent += text.charAt(currentCharIndex);
            currentCharIndex++;
            // Type very fast for immediate readability (5ms - 15ms per char)
            typeWriterTimeouts.push(setTimeout(typeNextChar, Math.random() * 10 + 5)); 
        } else {
            // Done this paragraph/line, move to next after a very short pause
            currentElIndex++;
            currentCharIndex = 0;
            typeWriterTimeouts.push(setTimeout(typeNextChar, 80)); // 80ms pause
        }
    }
    
    // Start typing after a short delay so the page fade-in has time to start
    typeWriterTimeouts.push(setTimeout(typeNextChar, 400)); 
}

// Ending Logic
function chooseEnding(choice) {
    const buttonGroup = document.getElementById('ending-buttons');
    const endingMsg = document.getElementById('ending-message');
    
    buttonGroup.classList.add('hidden');
    endingMsg.classList.remove('hidden');
    
    if (choice === 'forgive') {
        petalIntensity = 3; // Storm of petals
        initPetals(200);
        endingMsg.innerHTML = "Terima kasih sayangku...<br>aku berjanji tidak mengulanginya lagi. 🌸";
        endingMsg.style.color = "#ffb7c5";
        endingMsg.style.textShadow = "0 0 10px rgba(255, 183, 197, 0.5)";
    } else {
        petalIntensity = 0.5; // Calm
        endingMsg.innerHTML = "Aku akan menunggu.<br>Terima kasih sudah mau membaca semuanya. ❤️";
        endingMsg.style.color = "#e0e0e0";
    }
}

// --- Procedural Fractal SVG Environment Generation ---

function createSVGBranches() {
    const branchLeft = document.getElementById('branch-left');
    const branchRight = document.getElementById('branch-right');

    // Helper to generate a realistic looking Sakura flower
    const createSakuraFlower = (cx, cy, scale) => {
        let f = `<g transform="translate(${cx}, ${cy}) scale(${scale})">`;
        // Sakura petal path (with the characteristic cleft/notch at the tip)
        const petalPath = "M 0,0 C -12,-15 -12,-28 -5,-32 Q 0,-26 0,-23 Q 0,-26 5,-32 C 12,-28 12,-15 0,0 Z";
        
        // Outer petals
        for(let i = 0; i < 5; i++) {
            f += `<path d="${petalPath}" fill="#ffb7c5" transform="rotate(${i * 72})"/>`;
            // Add slight shadow/depth petal
            f += `<path d="${petalPath}" fill="#ff9eaa" transform="rotate(${i * 72}) scale(0.6)"/>`;
        }
        // Delicate stamens
        for(let i = 0; i < 5; i++) {
            f += `<line x1="0" y1="0" x2="0" y2="-12" stroke="#e91e63" stroke-width="0.8" transform="rotate(${i * 72})"/>`;
            f += `<circle cx="0" cy="-12" r="1.2" fill="#f44336" transform="rotate(${i * 72})"/>`;
        }
        // Center
        f += `<circle cx="0" cy="0" r="2.5" fill="#ffeb3b"/>`;
        f += `</g>`;
        return f;
    };

    // Helper to generate a realistic branch leaf
    const createLeaf = (cx, cy, scale, angle) => {
        return `<g transform="translate(${cx}, ${cy}) scale(${scale}) rotate(${angle})">
            <path d="M 0,0 Q -8,-15 0,-30 Q 8,-15 0,0 Z" fill="#66bb6a" opacity="0.85"/>
            <path d="M 0,0 L 0,-28" stroke="#2e7d32" stroke-width="1" opacity="0.5"/>
        </g>`;
    };

    // Seeded Random Number Generator for deterministic fractal trees
    const seededRandom = (seed) => {
        return function() {
            var t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }
    };

    function generateFractalSVG(isRight, seedValue) {
        let svgContent = '';
        const maxDepth = 6; // Depth of branches
        const random = seededRandom(seedValue); // Use deterministic random
        
        function drawBranch(x1, y1, len, angle, depth, branchWidth) {
            let x2 = x1 + Math.cos(angle) * len;
            let y2 = y1 + Math.sin(angle) * len;
            
            // Organic curve control point
            let curveOffset = (random() - 0.5) * (len * 0.5);
            let cx = x1 + Math.cos(angle + 0.5) * (len/2) + curveOffset;
            let cy = y1 + Math.sin(angle + 0.5) * (len/2) + curveOffset;

            // Draw wood branch using path for curve and decreasing stroke-width
            svgContent += `<path d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}" fill="none" stroke="#2d1c15" stroke-width="${branchWidth}" stroke-linecap="round" />`;

            // Random leaves along the branch (increased frequency for lushness)
            if (depth < maxDepth && random() > 0.4) {
                let leafAngle = (angle * 180 / Math.PI) + (random() > 0.5 ? 45 : -45);
                svgContent += createLeaf(cx, cy, 0.4 + random() * 0.3, leafAngle);
            }

            if (depth === 0) {
                // Tips of branches have clusters of Sakura
                svgContent += createSakuraFlower(x2, y2, 0.5 + random() * 0.4);
                if (random() > 0.3) svgContent += createSakuraFlower(x2 + (random()*15-7), y2 + (random()*15-7), 0.4);
                // Add a leaf at the tip sometimes
                if (random() > 0.4) {
                    let leafAngle = (angle * 180 / Math.PI) + (random() > 0.5 ? 30 : -30);
                    svgContent += createLeaf(x2, y2, 0.5, leafAngle);
                }
                return;
            }

            // Number of sub-branches: Main trunk splits more, tips split less (Increased branching)
            let numBranches = (depth === maxDepth) ? 3 : (random() > 0.2 ? 2 : 1);
            
            for(let i = 0; i < numBranches; i++) {
                let dir = (i % 2 === 0) ? 1 : -1;
                let newAngle = angle + dir * (0.2 + random() * 0.5); 
                // First branch usually continues the main path slightly
                if (i === 0) newAngle = angle + (random() * 0.3 - 0.15);

                let newLen = len * (0.65 + random() * 0.2); // Taper length
                let newWidth = branchWidth * 0.7; // Taper thickness

                drawBranch(x2, y2, newLen, newAngle, depth - 1, newWidth);
            }

            // Occasional flowers on the nodes of thick branches (increased frequency)
            if (depth < maxDepth && random() > 0.5) {
                 svgContent += createSakuraFlower(x2, y2, 0.4 + random() * 0.3);
            }
        }

        if (isRight) {
            // Top Right Corner Canopy (Main + 2 Secondary branches for lush density)
            drawBranch(600, 0, 180, Math.PI * 0.7, maxDepth, 20);
            drawBranch(600, 30, 120, Math.PI * 0.85, maxDepth - 1, 14);
            drawBranch(550, -10, 140, Math.PI * 0.6, maxDepth - 1, 15);
        } else {
            // Top Left Corner Canopy (Main + 2 Secondary branches for lush density)
            drawBranch(0, 0, 180, Math.PI * 0.3, maxDepth, 20);
            drawBranch(0, 30, 120, Math.PI * 0.15, maxDepth - 1, 14);
            drawBranch(50, -10, 140, Math.PI * 0.4, maxDepth - 1, 15);
        }

        return `<svg viewBox="0 0 600 600" width="100%" height="100%" preserveAspectRatio="${isRight ? 'xMaxYMin meet' : 'xMinYMin meet'}" style="overflow: visible;">${svgContent}</svg>`;
    }

    // Using fixed seed values for beautiful, consistent branches
    branchLeft.innerHTML = generateFractalSVG(false, 8888);
    branchRight.innerHTML = generateFractalSVG(true, 12345);
}

function generateAnimatedGarden() {
    const gardenContainer = document.getElementById('animated-garden');
    if(!gardenContainer) return;

    const numFlowers = 45; // Balanced amount (not too crowded, not too sparse)
    const spacing = 100 / numFlowers; // VW width per segment
    
    // Colorful palettes
    const palettes = [
        { c1: '#ff9eaa', c2: '#ffb7c5' }, // Pink
        { c1: '#a0c4ff', c2: '#c9e4ff' }, // Blue
        { c1: '#fdffb6', c2: '#ffffd1' }, // Yellow
        { c1: '#caffbf', c2: '#e4ffdb' }, // Green
        { c1: '#dcb0ff', c2: '#e8ccff' }, // Purple
        { c1: '#ffadad', c2: '#ffd6a5' }, // Peach
        { c1: '#ff99c8', c2: '#fcf6bd' }  // Magenta-Yellow
    ];

    for (let i = 0; i < numFlowers; i++) {
        // Balanced distribution with jitter
        let jitter = (Math.random() * 0.8) * spacing;
        let xPos = (i * spacing) + jitter; // Ensure no empty patches
        
        let stemHeight = 50 + Math.random() * 50; // px
        let delayOffset = Math.random() * 0.8; // randomize start slightly
        let scale = 0.7 + Math.random() * 0.4;
        let swayAngle = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2); // degrees
        let palette = palettes[Math.floor(Math.random() * palettes.length)];

        // Create elements
        const flowerWrapper = document.createElement('div');
        flowerWrapper.className = 'growing-flower';
        flowerWrapper.style.left = `${xPos}vw`;
        flowerWrapper.style.setProperty('--scale', scale);
        flowerWrapper.style.transform = `scale(${scale}) rotate(0deg)`; // Initial state before animation starts
        flowerWrapper.style.setProperty('--sway-angle', `${swayAngle}deg`);
        flowerWrapper.style.setProperty('--petal-color-1', palette.c1);
        flowerWrapper.style.setProperty('--petal-color-2', palette.c2);
        // Continuous sway starts after 2.5 seconds of initial growth
        flowerWrapper.style.animation = `continuousSwayAnim 2s ease-in-out infinite alternate`;
        flowerWrapper.style.animationDelay = `${2.5 + delayOffset}s`;

        const stem = document.createElement('div');
        stem.className = 'flower-stem';
        stem.style.setProperty('--stem-height', `${stemHeight}px`);
        stem.style.animation = `growStemAnim 0.8s ease-out ${0 + delayOffset}s forwards`;

        const leafLeft = document.createElement('div');
        leafLeft.className = 'flower-leaf leaf-left';
        leafLeft.style.setProperty('--leaf-angle', `-20deg`);
        leafLeft.style.animation = `growLeafAnim 0.5s ease-out ${0.5 + delayOffset}s forwards`;

        const leafRight = document.createElement('div');
        leafRight.className = 'flower-leaf leaf-right';
        leafRight.style.setProperty('--leaf-angle', `20deg`);
        leafRight.style.animation = `growLeafAnim 0.5s ease-out ${0.6 + delayOffset}s forwards`;

        const head = document.createElement('div');
        head.className = 'flower-head';
        
        const bud = document.createElement('div');
        bud.className = 'flower-bud';
        // Chain two animations: grow bud, then hide bud
        bud.style.animation = `growBudAnim 0.3s ease-out ${1 + delayOffset}s forwards, hideBudAnim 0.2s ease-out ${1.6 + delayOffset}s forwards`;

        const center = document.createElement('div');
        center.className = 'flower-center';
        center.style.animation = `popCenterAnim 0.3s ease-out ${2 + delayOffset}s forwards`;

        // Assemble petals with depth
        for(let p=0; p<5; p++) {
            // Outer Petal
            let petal = document.createElement('div');
            petal.className = 'flower-petal';
            let angle = p * 72;
            petal.style.setProperty('--angle', `${angle}deg`);
            petal.style.animation = `bloomPetalAnim 0.8s ease-out ${1.5 + delayOffset + (p * 0.08)}s forwards`;
            head.appendChild(petal);
            
            // Inner Petal
            let inner = document.createElement('div');
            inner.className = 'flower-petal inner';
            inner.style.setProperty('--angle', `${angle + 36}deg`);
            inner.style.animation = `bloomPetalAnim 0.8s ease-out ${1.7 + delayOffset + (p * 0.08)}s forwards`;
            head.appendChild(inner);
        }

        stem.appendChild(leafLeft);
        stem.appendChild(leafRight);
        head.appendChild(bud);
        head.appendChild(center);
        flowerWrapper.appendChild(head); // Head goes on top
        flowerWrapper.appendChild(stem); // Stem goes on bottom
        
        gardenContainer.appendChild(flowerWrapper);
    }
}

// Particle system
function spawnParticle() {
    const gardenContainer = document.getElementById('animated-garden');
    if(!gardenContainer) return;

    const types = ['effect-heart', 'effect-bubble', 'effect-sparkle'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const particle = document.createElement('div');
    particle.className = `particle-effect ${type}`;
    particle.style.left = `${Math.random() * 100}vw`;
    
    if (type === 'effect-heart') particle.innerHTML = '❤';
    
    let drift = (Math.random() - 0.5) * 100; // -50px to 50px
    particle.style.setProperty('--drift', `${drift}px`);
    
    gardenContainer.appendChild(particle);
    
    // Remove after animation finishes (approx 10s max)
    setTimeout(() => {
        if(particle.parentNode) particle.parentNode.removeChild(particle);
    }, 11000);
}

// Start particles only after initial bloom sequence (2.5 seconds)
setTimeout(() => {
    setInterval(spawnParticle, 800); // spawn a particle every 800ms
}, 2500);

// Fireflies logic
function initFireflies() {
    const canvas = document.getElementById('fireflies-canvas');
    if (!canvas) return;
    
    // Spawn a firefly every 600ms for a dense meadow feel
    setInterval(() => {
        const firefly = document.createElement('div');
        firefly.className = 'firefly';
        
        // Random starting position (mostly lower half of screen near flowers)
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight - (Math.random() * window.innerHeight * 0.6);
        
        // Random movement vector (floating upwards and sideways)
        const moveX = (Math.random() - 0.5) * 200; // -100px to 100px
        const moveY = -150 - Math.random() * 200; // -150px to -350px
        
        // Random animation duration
        const duration = 6 + Math.random() * 6; // 6s to 12s
        const blinkDuration = 2 + Math.random() * 3;
        
        firefly.style.left = `${startX}px`;
        firefly.style.top = `${startY}px`;
        firefly.style.setProperty('--move-x', `${moveX}px`);
        firefly.style.setProperty('--move-y', `${moveY}px`);
        
        // Apply animations
        firefly.style.animation = `
            fireflyFloat ${duration}s ease-in-out forwards,
            fireflyBlink ${blinkDuration}s ease-in-out infinite alternate
        `;
        
        canvas.appendChild(firefly);
        
        // Remove after animation finishes to prevent memory leak
        setTimeout(() => {
            if (firefly.parentNode) firefly.parentNode.removeChild(firefly);
        }, duration * 1000);
        
    }, 600);
}

// Initialize the environment
window.onload = () => {
    createSVGBranches();
    generateAnimatedGarden();
    initPetals(50);
    initFireflies();
};
