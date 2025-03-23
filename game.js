// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let startTime = 0;
let currentTime = 0;
let bestTime = null;
let gameOver = false;
let raceStarted = false;
let currentLevel = 1;

// Car colors
const carColors = [
    { name: 'Rot', body: '#FF0000', roof: '#CC0000' },
    { name: 'Blau', body: '#0000FF', roof: '#0000CC' },
    { name: 'Grün', body: '#00FF00', roof: '#00CC00' },
    { name: 'Gelb', body: '#FFFF00', roof: '#CCCC00' },
    { name: 'Lila', body: '#800080', roof: '#660066' }
];
let currentColorIndex = 0;

// Fahrzeugdefinitionen
const vehicles = {
    car: {
        name: 'Auto',
        width: 60,
        height: 30,
        speed: 5,
        draw: function(ctx, x, y, angle, color) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            
            // Karosserie
            ctx.fillStyle = color.body;
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            
            // Dach
            ctx.fillStyle = color.roof;
            ctx.fillRect(-this.width/3, -this.height/2, this.width/1.5, this.height/2);
            
            // Räder
            ctx.fillStyle = '#000000';
            ctx.fillRect(-this.width/2, -this.height/2 - 5, 10, 10);
            ctx.fillRect(-this.width/2, this.height/2 - 5, 10, 10);
            ctx.fillRect(this.width/2 - 10, -this.height/2 - 5, 10, 10);
            ctx.fillRect(this.width/2 - 10, this.height/2 - 5, 10, 10);
            
            // Scheinwerfer
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(-this.width/2 + 5, -this.height/2 + 5, 5, 5);
            ctx.fillRect(-this.width/2 + 5, this.height/2 - 10, 5, 5);
            
            ctx.restore();
        }
    },
    bus: {
        name: 'Bus',
        width: 80,
        height: 40,
        speed: 4,
        draw: function(ctx, x, y, angle, color) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            
            // Karosserie
            ctx.fillStyle = color.body;
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            
            // Fenster
            ctx.fillStyle = '#FFFFFF';
            for(let i = 0; i < 4; i++) {
                ctx.fillRect(-this.width/2 + 15 + i*20, -this.height/2 + 5, 15, 15);
            }
            
            // Räder
            ctx.fillStyle = '#000000';
            ctx.fillRect(-this.width/2, -this.height/2 - 5, 15, 15);
            ctx.fillRect(-this.width/2, this.height/2 - 10, 15, 15);
            ctx.fillRect(this.width/2 - 15, -this.height/2 - 5, 15, 15);
            ctx.fillRect(this.width/2 - 15, this.height/2 - 10, 15, 15);
            
            // Scheinwerfer
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(-this.width/2 + 5, -this.height/2 + 5, 8, 8);
            ctx.fillRect(-this.width/2 + 5, this.height/2 - 13, 8, 8);
            
            ctx.restore();
        }
    },
    bike: {
        name: 'Fahrrad',
        width: 40,
        height: 20,
        speed: 6,
        draw: function(ctx, x, y, angle, color) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            
            // Rahmen
            ctx.strokeStyle = color.body;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-this.width/2, 0);
            ctx.lineTo(this.width/2, 0);
            ctx.stroke();
            
            // Räder
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(-this.width/2, 0, 8, 0, Math.PI * 2);
            ctx.arc(this.width/2, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Lenker
            ctx.strokeStyle = color.body;
            ctx.beginPath();
            ctx.moveTo(-this.width/2, 0);
            ctx.lineTo(-this.width/2, -10);
            ctx.stroke();
            
            // Sattel
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -15);
            ctx.stroke();
            
            ctx.restore();
        }
    }
};
let currentVehicle = 'car';

// Sound effects
const sounds = {
    start: new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'),
    finish: new Audio('https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3')
};

// Track definitions
const tracks = {
    1: {
        width: 40,
        points: [
            { x: 100, y: 100 },     // Start
            { x: 400, y: 100 },     // Gerade nach rechts
            { x: 400, y: 200 },     // Kurz runter
            { x: 300, y: 200 },     // Kurve nach links
            { x: 300, y: 400 },     // Gerade runter
            { x: 200, y: 400 },     // Kurve nach links
            { x: 200, y: 300 },     // Kurve nach oben
            { x: 100, y: 300 },     // Gerade nach links
            { x: 100, y: 100 }      // Zurück zum Start
        ],
        longTrack: [
            { x: 100, y: 100 },     // Start
            { x: 400, y: 100 },     // Erste Abzweigung
            { x: 800, y: 100 },     // Langer Weg nach rechts
            { x: 800, y: 200 },     // Kurz runter
            { x: 700, y: 200 },     // Kurve nach links
            { x: 700, y: 400 },     // Gerade runter
            { x: 600, y: 400 },     // Kurve nach links
            { x: 600, y: 300 },     // Kurve nach oben
            { x: 500, y: 300 },     // Gerade nach links
            { x: 500, y: 500 },     // Gerade runter
            { x: 400, y: 500 },     // Kurve nach links
            { x: 400, y: 200 },     // Gerade nach oben
            { x: 300, y: 200 },     // Kurve nach links
            { x: 300, y: 400 },     // Gerade runter
            { x: 200, y: 400 },     // Kurve nach links
            { x: 200, y: 300 },     // Kurve nach oben
            { x: 100, y: 300 },     // Gerade nach links
            { x: 100, y: 100 }      // Zurück zum Start
        ]
    },
    2: {
        width: 40,
        points: [
            { x: 100, y: 100 },     // Start
            { x: 400, y: 100 },     // Gerade nach rechts
            { x: 400, y: 500 },     // Gerade runter
            { x: 700, y: 500 },     // Gerade nach rechts
            { x: 700, y: 100 },     // Gerade hoch
            { x: 400, y: 100 },     // Gerade nach links
            { x: 400, y: 300 },     // Kurz runter
            { x: 100, y: 300 },     // Gerade nach links
            { x: 100, y: 100 }      // Zurück zum Start
        ],
        longTrack: [
            { x: 100, y: 100 },     // Start
            { x: 400, y: 100 },     // Gerade nach rechts
            { x: 400, y: 500 },     // Gerade runter
            { x: 700, y: 500 },     // Gerade nach rechts
            { x: 700, y: 100 },     // Gerade hoch
            { x: 400, y: 100 },     // Gerade nach links
            { x: 400, y: 300 },     // Kurz runter
            { x: 100, y: 300 },     // Gerade nach links
            { x: 100, y: 100 }      // Zurück zum Start
        ]
    },
    3: {
        width: 40,
        points: [
            { x: 100, y: 100 },     // Start
            { x: 300, y: 100 },     // Gerade nach rechts
            { x: 300, y: 200 },     // Kurz runter
            { x: 500, y: 200 },     // Gerade nach rechts
            { x: 500, y: 400 },     // Gerade runter
            { x: 600, y: 400 },     // Kurz nach rechts
            { x: 600, y: 500 },     // Kurz runter
            { x: 700, y: 500 },     // Gerade nach rechts
            { x: 700, y: 300 },     // Gerade hoch
            { x: 500, y: 300 },     // Gerade nach links
            { x: 500, y: 200 },     // Kurz hoch
            { x: 300, y: 200 },     // Gerade nach links
            { x: 300, y: 100 },     // Gerade hoch
            { x: 100, y: 100 }      // Zurück zum Start
        ],
        longTrack: [
            { x: 100, y: 100 },     // Start
            { x: 300, y: 100 },     // Gerade nach rechts
            { x: 300, y: 200 },     // Kurz runter
            { x: 500, y: 200 },     // Gerade nach rechts
            { x: 500, y: 400 },     // Gerade runter
            { x: 600, y: 400 },     // Kurz nach rechts
            { x: 600, y: 500 },     // Kurz runter
            { x: 700, y: 500 },     // Gerade nach rechts
            { x: 700, y: 300 },     // Gerade hoch
            { x: 500, y: 300 },     // Gerade nach links
            { x: 500, y: 200 },     // Kurz hoch
            { x: 300, y: 200 },     // Gerade nach links
            { x: 300, y: 100 },     // Gerade hoch
            { x: 100, y: 100 }      // Zurück zum Start
        ]
    },
    4: {
        width: 40,
        points: [
            { x: 100, y: 100 },     // Start
            { x: 400, y: 100 },     // Gerade nach rechts
            { x: 400, y: 300 },     // Gerade runter
            { x: 600, y: 300 },     // Gerade nach rechts
            { x: 600, y: 500 },     // Gerade runter
            { x: 400, y: 500 },     // Gerade nach links
            { x: 400, y: 400 },     // Kurz hoch
            { x: 200, y: 400 },     // Gerade nach links
            { x: 200, y: 200 },     // Gerade hoch
            { x: 100, y: 200 },     // Kurz nach links
            { x: 100, y: 100 }      // Zurück zum Start
        ],
        longTrack: [
            { x: 100, y: 100 },     // Start
            { x: 400, y: 100 },     // Gerade nach rechts
            { x: 400, y: 300 },     // Gerade runter
            { x: 600, y: 300 },     // Gerade nach rechts
            { x: 600, y: 500 },     // Gerade runter
            { x: 400, y: 500 },     // Gerade nach links
            { x: 400, y: 400 },     // Kurz hoch
            { x: 200, y: 400 },     // Gerade nach links
            { x: 200, y: 200 },     // Gerade hoch
            { x: 100, y: 200 },     // Kurz nach links
            { x: 100, y: 100 }      // Zurück zum Start
        ]
    },
    5: {
        width: 40,
        points: [
            { x: 100, y: 100 },     // Start
            { x: 300, y: 100 },     // Gerade nach rechts
            { x: 300, y: 300 },     // Gerade runter
            { x: 500, y: 300 },     // Gerade nach rechts
            { x: 500, y: 100 },     // Gerade hoch
            { x: 700, y: 100 },     // Gerade nach rechts
            { x: 700, y: 300 },     // Gerade runter
            { x: 500, y: 300 },     // Gerade nach links
            { x: 500, y: 500 },     // Gerade runter
            { x: 300, y: 500 },     // Gerade nach links
            { x: 300, y: 300 },     // Gerade hoch
            { x: 100, y: 300 },     // Gerade nach links
            { x: 100, y: 100 }      // Zurück zum Start
        ],
        longTrack: [
            { x: 100, y: 100 },     // Start
            { x: 300, y: 100 },     // Gerade nach rechts
            { x: 300, y: 300 },     // Gerade runter
            { x: 500, y: 300 },     // Gerade nach rechts
            { x: 500, y: 100 },     // Gerade hoch
            { x: 700, y: 100 },     // Gerade nach rechts
            { x: 700, y: 300 },     // Gerade runter
            { x: 500, y: 300 },     // Gerade nach links
            { x: 500, y: 500 },     // Gerade runter
            { x: 300, y: 500 },     // Gerade nach links
            { x: 300, y: 300 },     // Gerade hoch
            { x: 100, y: 300 },     // Gerade nach links
            { x: 100, y: 100 }      // Zurück zum Start
        ]
    },
    6: {
        width: 40,
        points: [
            { x: 100, y: 100 },     // Start
            { x: 400, y: 100 },     // Gerade nach rechts
            { x: 400, y: 200 },     // Kurz runter
            { x: 600, y: 200 },     // Gerade nach rechts
            { x: 600, y: 400 },     // Gerade runter
            { x: 400, y: 400 },     // Gerade nach links
            { x: 400, y: 300 },     // Kurz hoch
            { x: 200, y: 300 },     // Gerade nach links
            { x: 200, y: 500 },     // Gerade runter
            { x: 100, y: 500 },     // Kurz nach links
            { x: 100, y: 300 },     // Gerade hoch
            { x: 100, y: 100 }      // Zurück zum Start
        ],
        longTrack: [
            { x: 100, y: 100 },     // Start
            { x: 400, y: 100 },     // Gerade nach rechts
            { x: 400, y: 200 },     // Kurz runter
            { x: 600, y: 200 },     // Gerade nach rechts
            { x: 600, y: 400 },     // Gerade runter
            { x: 400, y: 400 },     // Gerade nach links
            { x: 400, y: 300 },     // Kurz hoch
            { x: 200, y: 300 },     // Gerade nach links
            { x: 200, y: 500 },     // Gerade runter
            { x: 100, y: 500 },     // Kurz nach links
            { x: 100, y: 300 },     // Gerade hoch
            { x: 100, y: 100 }      // Zurück zum Start
        ]
    },
    7: {
        width: 40,
        points: [
            { x: 100, y: 100 },     // Start
            { x: 300, y: 100 },     // Gerade nach rechts
            { x: 300, y: 200 },     // Kurz runter
            { x: 500, y: 200 },     // Gerade nach rechts
            { x: 500, y: 400 },     // Gerade runter
            { x: 600, y: 400 },     // Kurz nach rechts
            { x: 600, y: 500 },     // Kurz runter
            { x: 700, y: 500 },     // Gerade nach rechts
            { x: 700, y: 300 },     // Gerade hoch
            { x: 500, y: 300 },     // Gerade nach links
            { x: 500, y: 200 },     // Kurz hoch
            { x: 300, y: 200 },     // Gerade nach links
            { x: 300, y: 100 },     // Gerade hoch
            { x: 100, y: 100 }      // Zurück zum Start
        ],
        longTrack: [
            { x: 100, y: 100 },     // Start
            { x: 300, y: 100 },     // Gerade nach rechts
            { x: 300, y: 200 },     // Kurz runter
            { x: 500, y: 200 },     // Gerade nach rechts
            { x: 500, y: 400 },     // Gerade runter
            { x: 600, y: 400 },     // Kurz nach rechts
            { x: 600, y: 500 },     // Kurz runter
            { x: 700, y: 500 },     // Gerade nach rechts
            { x: 700, y: 300 },     // Gerade hoch
            { x: 500, y: 300 },     // Gerade nach links
            { x: 500, y: 200 },     // Kurz hoch
            { x: 300, y: 200 },     // Gerade nach links
            { x: 300, y: 100 },     // Gerade hoch
            { x: 100, y: 100 }      // Zurück zum Start
        ]
    },
    8: {
        width: 40,
        points: [
            { x: 100, y: 100 },     // Start
            { x: 400, y: 100 },     // Gerade nach rechts
            { x: 400, y: 300 },     // Gerade runter
            { x: 600, y: 300 },     // Gerade nach rechts
            { x: 600, y: 500 },     // Gerade runter
            { x: 400, y: 500 },     // Gerade nach links
            { x: 400, y: 400 },     // Kurz hoch
            { x: 200, y: 400 },     // Gerade nach links
            { x: 200, y: 200 },     // Gerade hoch
            { x: 100, y: 200 },     // Kurz nach links
            { x: 100, y: 100 }      // Zurück zum Start
        ],
        longTrack: [
            { x: 100, y: 100 },     // Start
            { x: 400, y: 100 },     // Gerade nach rechts
            { x: 400, y: 300 },     // Gerade runter
            { x: 600, y: 300 },     // Gerade nach rechts
            { x: 600, y: 500 },     // Gerade runter
            { x: 400, y: 500 },     // Gerade nach links
            { x: 400, y: 400 },     // Kurz hoch
            { x: 200, y: 400 },     // Gerade nach links
            { x: 200, y: 200 },     // Gerade hoch
            { x: 100, y: 200 },     // Kurz nach links
            { x: 100, y: 100 }      // Zurück zum Start
        ]
    }
};

// Checkpoints
const checkpoints = {
    start: {
        x: 100,
        y: 100,
        width: 40,
        height: 40,
        color: '#00FF00',
        passed: false
    },
    finish: {
        x: 500,
        y: 500,
        width: 40,
        height: 40,
        color: '#FF0000',
        passed: false
    }
};

// Car object
const car = {
    x: tracks[currentLevel].points[0].x,
    y: tracks[currentLevel].points[0].y,
    width: vehicles.car.width,
    height: vehicles.car.height,
    speed: vehicles.car.speed,
    angle: 0,
    rotationSpeed: 0.2,
    targetAngle: 0
};

// Reset button
const resetButton = {
    x: canvas.width / 2 - 100,
    y: canvas.height / 2 + 60,
    width: 200,
    height: 50
};

// Color selection button
const colorButton = {
    x: canvas.width - 300,
    y: 10,
    width: 140,
    height: 40
};

// Vehicle selection button
const vehicleButton = {
    x: canvas.width - 150,
    y: 10,
    width: 140,
    height: 40
};

// Handle keydown events
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

document.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});

// Handle mouse click events
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Prüfe Klicks auf die Fahrzeugauswahl (funktioniert immer)
    if (x >= vehicleButton.x && x <= vehicleButton.x + vehicleButton.width &&
        y >= vehicleButton.y && y <= vehicleButton.y + vehicleButton.height) {
        const vehicleTypes = Object.keys(vehicles);
        const currentIndex = vehicleTypes.indexOf(currentVehicle);
        currentVehicle = vehicleTypes[(currentIndex + 1) % vehicleTypes.length];
        
        // Aktualisiere die Fahrzeuggröße und Geschwindigkeit
        car.width = vehicles[currentVehicle].width;
        car.height = vehicles[currentVehicle].height;
        car.speed = vehicles[currentVehicle].speed;
        
        // Aktualisiere die Position, damit das Fahrzeug auf der Strecke bleibt
        const centerX = car.x + car.width/2;
        const centerY = car.y + car.height/2;
        car.x = centerX - car.width/2;
        car.y = centerY - car.height/2;
    }
    
    // Prüfe Klicks auf die Farbauswahl (funktioniert immer)
    if (x >= colorButton.x && x <= colorButton.x + colorButton.width &&
        y >= colorButton.y && y <= colorButton.y + colorButton.height) {
        currentColorIndex = (currentColorIndex + 1) % carColors.length;
    }
    
    // Prüfe Klicks auf die Reset-Buttons (nur im gameOver-Zustand)
    if (gameOver) {
        if (x >= resetButton.x && x <= resetButton.x + resetButton.width) {
            if (y >= resetButton.y && y <= resetButton.y + resetButton.height) {
                // Nächstes Level
                if (currentLevel < 8) {
                    currentLevel++;
                    resetGame();
                }
            } else if (y >= resetButton.y + 60 && y <= resetButton.y + 110) {
                // Level wiederholen
                resetGame();
            } else if (y >= resetButton.y + 120 && y <= resetButton.y + 170) {
                // Spiel neu starten
                currentLevel = 1;
                bestTime = null;
                resetGame();
            }
        }
    }
});

// Update checkpoint positions based on level
function updateCheckpointPositions() {
    switch(currentLevel) {
        case 1:
            checkpoints.start.x = 100;
            checkpoints.start.y = 100;
            checkpoints.finish.x = 300;
            checkpoints.finish.y = 400;
            break;
        case 2:
            checkpoints.start.x = 100;
            checkpoints.start.y = 100;
            checkpoints.finish.x = 700;
            checkpoints.finish.y = 100;
            break;
        case 3:
            checkpoints.start.x = 100;
            checkpoints.start.y = 100;
            checkpoints.finish.x = 700;
            checkpoints.finish.y = 300;
            break;
        case 4:
            checkpoints.start.x = 100;
            checkpoints.start.y = 100;
            checkpoints.finish.x = 600;
            checkpoints.finish.y = 500;
            break;
        case 5:
            checkpoints.start.x = 100;
            checkpoints.start.y = 100;
            checkpoints.finish.x = 700;
            checkpoints.finish.y = 100;
            break;
        case 6:
            checkpoints.start.x = 100;
            checkpoints.start.y = 100;
            checkpoints.finish.x = 100;
            checkpoints.finish.y = 500;
            break;
        case 7:
            checkpoints.start.x = 100;
            checkpoints.start.y = 100;
            checkpoints.finish.x = 700;
            checkpoints.finish.y = 500;
            break;
        case 8:
            checkpoints.start.x = 100;
            checkpoints.start.y = 100;
            checkpoints.finish.x = 600;
            checkpoints.finish.y = 300;
            break;
    }
}

// Reset game function
function resetGame() {
    startTime = 0;
    currentTime = 0;
    gameOver = false;
    raceStarted = false;
    checkpoints.start.passed = false;
    checkpoints.finish.passed = false;
    
    // Setze die Auto-Position auf den Start des aktuellen Levels
    car.x = tracks[currentLevel].points[0].x;
    car.y = tracks[currentLevel].points[0].y;
    car.angle = 0;
    car.targetAngle = 0;
    
    // Aktualisiere die Checkpoint-Positionen
    updateCheckpointPositions();
}

// Check if point is on track
function isOnTrack(x, y) {
    // Prüfe beide Strecken
    const currentTrack = tracks[currentLevel];
    
    for (let i = 0; i < currentTrack.points.length - 1; i++) {
        const p1 = currentTrack.points[i];
        const p2 = currentTrack.points[i + 1];
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        
        if (len === 0) continue;
        
        const t = ((x - p1.x) * dx + (y - p1.y) * dy) / (len * len);
        
        if (t >= 0 && t <= 1) {
            const projX = p1.x + t * dx;
            const projY = p1.y + t * dy;
            const dist = Math.sqrt(Math.pow(x - projX, 2) + Math.pow(y - projY, 2));
            
            if (dist <= tracks[currentLevel].width / 2) {
                return true;
            }
        }
    }
    
    for (let i = 0; i < currentTrack.longTrack.length - 1; i++) {
        const p1 = currentTrack.longTrack[i];
        const p2 = currentTrack.longTrack[i + 1];
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        
        if (len === 0) continue;
        
        const t = ((x - p1.x) * dx + (y - p1.y) * dy) / (len * len);
        
        if (t >= 0 && t <= 1) {
            const projX = p1.x + t * dx;
            const projY = p1.y + t * dy;
            const dist = Math.sqrt(Math.pow(x - projX, 2) + Math.pow(y - projY, 2));
            
            if (dist <= tracks[currentLevel].width / 2) {
                return true;
            }
        }
    }
    return false;
}

// Check collision with checkpoint
function checkCheckpointCollision(car, checkpoint) {
    const carCenter = {
        x: car.x + car.width/2,
        y: car.y + car.height/2
    };
    
    const checkpointCenter = {
        x: checkpoint.x + checkpoint.width/2,
        y: checkpoint.y + checkpoint.height/2
    };
    
    const distance = Math.sqrt(
        Math.pow(carCenter.x - checkpointCenter.x, 2) +
        Math.pow(carCenter.y - checkpointCenter.y, 2)
    );
    
    return distance < 30;
}

// Format time
function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
}

// Normalize angle between -PI and PI
function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
}

// Update game objects
function update() {
    if (gameOver) return;

    // Update target angle based on key presses
    if (keys.ArrowUp) {
        car.targetAngle = -Math.PI/2; // Nach oben
    } else if (keys.ArrowDown) {
        car.targetAngle = Math.PI/2; // Nach unten
    } else if (keys.ArrowLeft) {
        car.targetAngle = Math.PI; // Nach links
    } else if (keys.ArrowRight) {
        car.targetAngle = 0; // Nach rechts
    }

    // Smoothly rotate towards target angle
    const angleDiff = normalizeAngle(car.targetAngle - car.angle);
    if (Math.abs(angleDiff) > 0.1) {
        car.angle += Math.sign(angleDiff) * car.rotationSpeed;
    } else {
        car.angle = car.targetAngle;
    }

    // Move car in current direction if any key is pressed
    if (keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight) {
        const newX = car.x + Math.cos(car.angle) * car.speed;
        const newY = car.y + Math.sin(car.angle) * car.speed;
        
        if (isOnTrack(newX + car.width/2, newY + car.height/2)) {
            car.x = newX;
            car.y = newY;
        }
    }

    // Check checkpoint collisions
    if (!checkpoints.start.passed && checkCheckpointCollision(car, checkpoints.start)) {
        checkpoints.start.passed = true;
        raceStarted = true;
        startTime = Date.now();
        sounds.start.play();
    }

    if (raceStarted && !checkpoints.finish.passed && checkCheckpointCollision(car, checkpoints.finish)) {
        checkpoints.finish.passed = true;
        currentTime = Date.now() - startTime;
        if (!bestTime || currentTime < bestTime) {
            bestTime = currentTime;
        }
        gameOver = true;
        sounds.finish.play();
    }

    // Update current time
    if (raceStarted && !gameOver) {
        currentTime = Date.now() - startTime;
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw current track
    const currentTrack = tracks[currentLevel];
    
    // Draw both tracks
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = currentTrack.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw short track
    ctx.beginPath();
    ctx.moveTo(currentTrack.points[0].x, currentTrack.points[0].y);
    for (let i = 1; i < currentTrack.points.length; i++) {
        ctx.lineTo(currentTrack.points[i].x, currentTrack.points[i].y);
    }
    ctx.stroke();
    
    // Draw long track
    ctx.beginPath();
    ctx.moveTo(currentTrack.longTrack[0].x, currentTrack.longTrack[0].y);
    for (let i = 1; i < currentTrack.longTrack.length; i++) {
        ctx.lineTo(currentTrack.longTrack[i].x, currentTrack.longTrack[i].y);
    }
    ctx.stroke();

    // Draw track borders
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    // Draw short track border
    ctx.beginPath();
    ctx.moveTo(currentTrack.points[0].x, currentTrack.points[0].y);
    for (let i = 1; i < currentTrack.points.length; i++) {
        ctx.lineTo(currentTrack.points[i].x, currentTrack.points[i].y);
    }
    ctx.stroke();
    
    // Draw long track border
    ctx.beginPath();
    ctx.moveTo(currentTrack.longTrack[0].x, currentTrack.longTrack[0].y);
    for (let i = 1; i < currentTrack.longTrack.length; i++) {
        ctx.lineTo(currentTrack.longTrack[i].x, currentTrack.longTrack[i].y);
    }
    ctx.stroke();

    // Draw checkpoints
    ctx.fillStyle = checkpoints.start.color;
    ctx.fillRect(checkpoints.start.x - 20, checkpoints.start.y - 20, checkpoints.start.width, checkpoints.start.height);
    
    ctx.fillStyle = checkpoints.finish.color;
    ctx.fillRect(checkpoints.finish.x - 20, checkpoints.finish.y - 20, checkpoints.finish.width, checkpoints.finish.height);

    // Draw vehicle
    vehicles[currentVehicle].draw(ctx, car.x + car.width/2, car.y + car.height/2, car.angle, carColors[currentColorIndex]);

    // Draw time, best time and level
    ctx.fillStyle = '#000000';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Level: ${currentLevel}`, 10, 30);
    ctx.fillText(`Zeit: ${formatTime(currentTime)}`, 10, 60);
    if (bestTime) {
        ctx.fillText(`Beste Zeit: ${formatTime(bestTime)}`, 10, 90);
    }

    // Draw buttons on top of everything
    // Draw color selection button
    ctx.fillStyle = carColors[currentColorIndex].body;
    ctx.fillRect(colorButton.x, colorButton.y, colorButton.width, colorButton.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(colorButton.x, colorButton.y, colorButton.width, colorButton.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Farbe: ${carColors[currentColorIndex].name}`, colorButton.x + colorButton.width/2, colorButton.y + 25);

    // Draw vehicle selection button
    ctx.fillStyle = vehicles[currentVehicle].body;
    ctx.fillRect(vehicleButton.x, vehicleButton.y, vehicleButton.width, vehicleButton.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(vehicleButton.x, vehicleButton.y, vehicleButton.width, vehicleButton.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Fahrzeug: ${vehicles[currentVehicle].name}`, vehicleButton.x + vehicleButton.width/2, vehicleButton.y + 25);

    // Draw game over message and reset button
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        if (currentLevel < 8) {
            ctx.fillText('Level geschafft!', canvas.width/2, canvas.height/2);
        } else {
            ctx.fillText('Spiel gewonnen!', canvas.width/2, canvas.height/2);
        }
        ctx.font = '24px Arial';
        ctx.fillText(`Endzeit: ${formatTime(currentTime)}`, canvas.width/2, canvas.height/2 + 40);
        
        // Draw buttons
        if (currentLevel < 8) {
            // Nächstes Level Button
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(resetButton.x, resetButton.y, resetButton.width, resetButton.height);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '24px Arial';
            ctx.fillText('Nächstes Level', canvas.width/2, resetButton.y + 32);
        }
        
        // Level wiederholen Button
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(resetButton.x, resetButton.y + 60, resetButton.width, resetButton.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.fillText('Level wiederholen', canvas.width/2, resetButton.y + 92);
        
        // Spiel neu starten Button
        ctx.fillStyle = '#FF9800';
        ctx.fillRect(resetButton.x, resetButton.y + 120, resetButton.width, resetButton.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.fillText('Spiel neu starten', canvas.width/2, resetButton.y + 152);
    }
}

// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
