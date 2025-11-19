'use strict';

let kaleidoState = {
    isDrawing: false,
    segments: 8,
    mode: 'draw',
    hue: 0,
    animationId: null,
    lastX: 0,
    lastY: 0
};

const elements = {
    canvas: document.getElementById('kaleidoCanvas'),
    segmentSelect: document.getElementById('segmentSelect'),
    drawMode: document.getElementById('drawMode'),
    animateMode: document.getElementById('animateMode'),
    clearBtn: document.getElementById('clearBtn')
};

let ctx, centerX, centerY;

function initGame() {
    setupCanvas();
    setupEventListeners();
    clearCanvas();
}

function setupCanvas() {
    const canvas = elements.canvas;
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth - 30, container.clientHeight - 30, 500);
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    centerX = size / 2;
    centerY = size / 2;
}

function startDrawing(e) {
    e.preventDefault();
    kaleidoState.isDrawing = true;
    const pos = getCanvasPosition(e);
    kaleidoState.lastX = pos.x;
    kaleidoState.lastY = pos.y;
}

function draw(e) {
    if (!kaleidoState.isDrawing) return;
    e.preventDefault();

    const pos = getCanvasPosition(e);

    // Calculate position relative to center
    const relX = pos.x - centerX;
    const relY = pos.y - centerY;
    const lastRelX = kaleidoState.lastX - centerX;
    const lastRelY = kaleidoState.lastY - centerY;

    // Draw in all segments
    for (let i = 0; i < kaleidoState.segments; i++) {
        const angle = (Math.PI * 2 / kaleidoState.segments) * i;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);

        // Draw stroke
        const color = `hsl(${kaleidoState.hue}, 100%, 50%)`;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(lastRelX, lastRelY);
        ctx.lineTo(relX, relY);
        ctx.stroke();

        // Mirror effect
        ctx.scale(1, -1);
        ctx.beginPath();
        ctx.moveTo(lastRelX, lastRelY);
        ctx.lineTo(relX, relY);
        ctx.stroke();

        ctx.restore();
    }

    kaleidoState.lastX = pos.x;
    kaleidoState.lastY = pos.y;
    kaleidoState.hue = (kaleidoState.hue + 1) % 360;
}

function stopDrawing(e) {
    if (kaleidoState.isDrawing) {
        e.preventDefault();
        kaleidoState.isDrawing = false;
    }
}

function startAnimation() {
    let angle = 0;
    let radius = 50;

    function animate() {
        angle += 0.05;
        radius = 50 + Math.sin(angle * 2) * 30;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (kaleidoState.lastX && kaleidoState.lastY) {
            // Simulate drawing
            kaleidoState.isDrawing = true;
            draw({
                preventDefault: () => {},
                type: 'auto',
                clientX: x,
                clientY: y
            });
        }

        kaleidoState.lastX = x;
        kaleidoState.lastY = y;

        if (kaleidoState.mode === 'animate') {
            kaleidoState.animationId = requestAnimationFrame(animate);
        }
    }

    animate();
}

function stopAnimation() {
    if (kaleidoState.animationId) {
        cancelAnimationFrame(kaleidoState.animationId);
        kaleidoState.animationId = null;
    }
}

function setMode(mode) {
    kaleidoState.mode = mode;

    elements.drawMode.classList.toggle('active', mode === 'draw');
    elements.animateMode.classList.toggle('active', mode === 'animate');

    if (mode === 'animate') {
        startAnimation();
    } else {
        stopAnimation();
        kaleidoState.isDrawing = false;
    }
}

function getCanvasPosition(e) {
    const canvas = elements.canvas;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.type.includes('touch')) {
        const touch = e.touches[0] || e.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function clearCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
    kaleidoState.hue = 0;
}

function setupEventListeners() {
    const canvas = elements.canvas;

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    elements.segmentSelect.addEventListener('change', () => {
        kaleidoState.segments = parseInt(elements.segmentSelect.value);
    });

    elements.drawMode.addEventListener('click', () => setMode('draw'));
    elements.animateMode.addEventListener('click', () => setMode('animate'));

    elements.clearBtn.addEventListener('click', () => {
        if (confirm('Clear the kaleidoscope?')) {
            stopAnimation();
            clearCanvas();
            if (kaleidoState.mode === 'animate') {
                startAnimation();
            }
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (e.target === canvas) e.preventDefault();
    }, { passive: false });
}

document.addEventListener('DOMContentLoaded', initGame);
