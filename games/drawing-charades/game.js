'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const WORDS = [
    // Animals
    'Cat', 'Dog', 'Fish', 'Bird', 'Rabbit', 'Elephant', 'Lion', 'Giraffe',
    'Monkey', 'Bear', 'Tiger', 'Frog', 'Turtle', 'Butterfly', 'Bee',

    // Objects
    'Sun', 'Moon', 'Star', 'Cloud', 'Tree', 'Flower', 'House', 'Car',
    'Boat', 'Airplane', 'Bicycle', 'Ball', 'Book', 'Apple', 'Pizza',

    // Actions/Things
    'Rainbow', 'Heart', 'Smile', 'Crown', 'Castle', 'Robot', 'Rocket',
    'Dinosaur', 'Ice Cream', 'Cake', 'Gift', 'Balloon', 'Kite'
];

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    isPlaying: false,
    currentWord: '',
    drawing: false,
    currentColor: '#000000',
    currentTool: 'pencil',
    brushSize: 5,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    newWordBtn: document.getElementById('newWordBtn'),
    pencilBtn: document.getElementById('pencilBtn'),
    eraserBtn: document.getElementById('eraserBtn'),
    clearBtn: document.getElementById('clearBtn'),

    // Display elements
    currentWordDisplay: document.getElementById('currentWord'),
    canvas: document.getElementById('drawingCanvas'),
    brushSizeInput: document.getElementById('brushSize'),

    // Color buttons
    colorBtns: document.querySelectorAll('.color-btn'),
};

// Canvas context
let ctx;

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Drawing Charades initialized');

    // Setup canvas
    setupCanvas();

    // Setup event listeners
    setupEventListeners();
}

function setupCanvas() {
    const canvas = elements.canvas;
    ctx = canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Canvas settings
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function resizeCanvas() {
    const canvas = elements.canvas;
    const rect = canvas.getBoundingClientRect();

    // Store current drawing
    const imageData = ctx ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;

    // Set new size
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Restore drawing if it existed
    if (imageData) {
        ctx.putImageData(imageData, 0, 0);
    }

    // Reset context settings
    if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('click', handleStart);

    // New word button
    elements.newWordBtn.addEventListener('click', handleNewWord);

    // Tool buttons
    elements.pencilBtn.addEventListener('click', () => selectTool('pencil'));
    elements.eraserBtn.addEventListener('click', () => selectTool('eraser'));
    elements.clearBtn.addEventListener('click', clearCanvas);

    // Color buttons
    elements.colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectColor(btn.dataset.color);

            // Update active state
            elements.colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Brush size
    elements.brushSizeInput.addEventListener('input', (e) => {
        gameState.brushSize = parseInt(e.target.value);
    });

    // Canvas drawing - mouse events
    elements.canvas.addEventListener('mousedown', startDrawing);
    elements.canvas.addEventListener('mousemove', draw);
    elements.canvas.addEventListener('mouseup', stopDrawing);
    elements.canvas.addEventListener('mouseout', stopDrawing);

    // Canvas drawing - touch events
    elements.canvas.addEventListener('touchstart', handleTouchStart);
    elements.canvas.addEventListener('touchmove', handleTouchMove);
    elements.canvas.addEventListener('touchend', stopDrawing);
}

// ==========================================
// DRAWING FUNCTIONS
// ==========================================

function startDrawing(e) {
    gameState.drawing = true;

    const rect = elements.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e) {
    if (!gameState.drawing) return;

    const rect = elements.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Set drawing style
    if (gameState.currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = gameState.brushSize * 3;
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = gameState.currentColor;
        ctx.lineWidth = gameState.brushSize;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing() {
    gameState.drawing = false;
    ctx.beginPath();
}

function handleTouchStart(e) {
    e.preventDefault();

    if (e.touches.length > 0) {
        gameState.drawing = true;

        const rect = elements.canvas.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    }
}

function handleTouchMove(e) {
    e.preventDefault();

    if (!gameState.drawing || e.touches.length === 0) return;

    const rect = elements.canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    // Set drawing style
    if (gameState.currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = gameState.brushSize * 3;
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = gameState.currentColor;
        ctx.lineWidth = gameState.brushSize;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
}

function clearCanvas() {
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
}

// ==========================================
// TOOL FUNCTIONS
// ==========================================

function selectTool(tool) {
    gameState.currentTool = tool;

    // Update button states
    elements.pencilBtn.classList.remove('active');
    elements.eraserBtn.classList.remove('active');

    if (tool === 'pencil') {
        elements.pencilBtn.classList.add('active');
    } else if (tool === 'eraser') {
        elements.eraserBtn.classList.add('active');
    }
}

function selectColor(color) {
    gameState.currentColor = color;

    // Switch to pencil if eraser is selected
    if (gameState.currentTool === 'eraser') {
        selectTool('pencil');
    }
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;

    // Get random word
    gameState.currentWord = getRandomWord();

    // Update UI
    elements.currentWordDisplay.textContent = gameState.currentWord;
    elements.startBtn.style.display = 'none';
    elements.newWordBtn.style.display = 'inline-block';

    // Clear canvas
    clearCanvas();

    console.log('Game started. Word:', gameState.currentWord);
}

function handleNewWord() {
    // Get new random word
    gameState.currentWord = getRandomWord();
    elements.currentWordDisplay.textContent = gameState.currentWord;

    // Clear canvas
    clearCanvas();
}

function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * WORDS.length);
    return WORDS[randomIndex];
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleStart(e) {
    e.preventDefault();
    if (!gameState.isPlaying) {
        startGame();
    }
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
