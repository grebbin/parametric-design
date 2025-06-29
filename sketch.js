// Variable to store the shape properties
let shape;

// Variable to store amplitude and change the amplitude level effect
let amp;
let ampLevelIncrease = 1;

// Track the shape currently playing music
let playingShape = null;
let audio;
let isDragging = false;

// Variables for the progress bar
let interval;
let progressBar;
let progressBarWidth = 0;
let progressBarMaxWidth;

// Variables to store the offset between mouse position and shape's center for dragging purposes
let offsetX, offsetY;

// Track Composition playback status
let CompositionPlaying = false;
let CompositionIndex = 0;

// Variable to store the ID of the setTimeout
let nextSegmentTimeout;

// Variable for a button that changes information based on action
let infoButton;

// Variable to store the audio file name and variable to store the div element for audio file name
let audioFileName;
let audioFileNameDiv;

// Preload the audio file to be used for the music segments
function preload() {
    audio = loadSound('./assets/music/Noble Demon – Beware the Forest’s Mushrooms Arrangement [Super Mario RPG].mp3', captureAudioFileName);
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    // Define the number of polygons to create
    const numPolygons = 5;

    // Define the scale of the polygons
    const scalePolygons = 2;

    // Define a common set of vertices to form the shape
    const vertices = [  
        [0, -50 * scalePolygons], // Top vertex
        [43 * scalePolygons, -25 * scalePolygons], // Top right
        [43 * scalePolygons, 25 * scalePolygons],  // Bottom right
        [0, 50 * scalePolygons], // Bottom vertex
        [-43 * scalePolygons, 25 * scalePolygons], // Bottom left
        [-43 * scalePolygons, -25 * scalePolygons] // Top left
    ];

    // Calculate the duration segment for each polygon based on the audio's total length
    const totalDuration = audio.duration();
    const segmentDuration = totalDuration / numPolygons;

    // Create each polygon with randomly assigned position, color, and audio segment
    for (let i = 0; i < numPolygons; i++) {
        const centerX = random(100, windowWidth - 100);
        const centerY = random(100, windowHeight - 100);

        // Adjust vertices to place polygons at the random center position
        const offsetVertices = vertices.map(([x, y]) => [x + centerX, y + centerY]);

        // Generate a random color for each polygon and set the start and end times for audio playback
        const randomColor = color(random(100, 255), random(100, 255), random(100, 255));
        const startTime = i * segmentDuration;
        const endTime = (i + 1) * segmentDuration;
        createPolygon(offsetVertices, randomColor, startTime, endTime);
    }

    // Initialize the p5.Amplitude object to analyze the audio
    amp = new p5.Amplitude();
    amp.setInput(audio);

    // Create progress bar container
    progressBarMaxWidth = width * 0.5;
    let progressBarContainer = createDiv('');
    progressBarContainer.class('progress-bar-container');
    progressBarContainer.style('width', progressBarMaxWidth + 'px');

    // Create progress bar within the container
    progressBar = createDiv('');
    progressBar.parent(progressBarContainer);
    progressBar.class('progress-bar');
    progressBar.style('width', '0px');

    // Create a button to toggle composition playback
    infoButton = createButton('Press Space to play your composition from left to right');
    infoButton.class('info-button');
    infoButton.mousePressed(toggleCompositionPlayback);

    // Create a div for displaying current audio file name
    audioFileNameDiv = createDiv(`${audioFileName}`);
    audioFileNameDiv.class('audio-file-name');
}

function draw() {
    background('white');

    const level = amp.getLevel(); // Get the current amplitude level of the audio

    // Display all polygons (Function provided by p5.recognize.js)
    display();

    // Check if the mouse is hovering over a polygon when not dragging
    if (!isDragging) {
        const result = findShapeType(mouseX, mouseY);
        const currentShape = result[1];

        if (currentShape) {
            cursor('grab');
        } else {
            cursor(ARROW);
            progressBar.style('width', '0px');
            infoButton.html('Press Space to play your composition from left to right');
        }
    }

    // Handle dragging of shapes (Function provided by p5.drag.js)
    if (isDragging && shape) {
        drag(shape, mouseX, mouseY);
    }

    // Modify vertices based on amplitude while shape is playing audio
    if (playingShape) {
        const amplitudeFactor = level * ampLevelIncrease;
        modifyShapeVertices(playingShape, amplitudeFactor);
    }
}

function mousePressed() {
    // Check if the mouse is pressed on a shape and identify the type and object
    const result = findShapeType(mouseX, mouseY);
    shape = result[1];
    const shapeType = result[0];

    // If a shape is found and it's not the background, initiate dragging movement
    if (shape && shapeType !== "background") {
        isDragging = true;
        cursor('grabbing');
        pickup(shape);

        // Play the corresponding audio segment for the selected shape if it's different from the current one
        if (playingShape !== shape) {
            playShapeAudio(shape);
            infoButton.html('Press Space while dragging to play at 2× speed');
        }
    }
}

function mouseReleased() {
    // Stop dragging and revert the cursor
    if (isDragging && shape) {
        cursor('grab');
        isDragging = false;

        // Stop audio playback if a shape was being dragged
        if (audio.isPlaying()) {
            audio.stop();
            progressBar.style('width', '0px');
        }
        playingShape = null;
    }
}

function keyPressed() {
    if (key === 'Enter') {
        save('composition.png');
    }
    if (key === ' ' && isDragging === false) {
        toggleCompositionPlayback();
    }
    if (key === ' ' && playingShape) {
        playShapeAudio(playingShape, 2);
    }
}

// Function to start or stop individual shape audio playback
function playShapeAudio(selectedShape, speedFactor = 1) {
    if (audio.isPlaying()) {
        audio.stop();
    }

    // Calculate the duration based on the speed factor and end time
    let playDuration = (selectedShape.endTime - selectedShape.startTime);
    let adjustedPlayDuration = playDuration / speedFactor;

    // Play the audio segment at the desired speed
    audio.play(0, speedFactor, 1, selectedShape.startTime, playDuration);
    playingShape = selectedShape;

    // Initialize progress for this segment
    progressBarWidth = 0;

    // Create an interval to update the progress bar based on play duration
    let intervalTime = 50;
    let totalUpdates = adjustedPlayDuration * 1000 / intervalTime;
    let updateIncrement = progressBarMaxWidth / totalUpdates;

    clearInterval(interval);

    interval = setInterval(() => {
        if (progressBarWidth < progressBarMaxWidth && audio.isPlaying()) {
            progressBarWidth += updateIncrement;
            progressBar.style('width', progressBarWidth + 'px');
        } else {
            clearInterval(interval);
            progressBar.style('width', '0px');
        }
    }, intervalTime);
}

// Function to modify the vertices of a shape based on the amplitude level
function modifyShapeVertices(shape, amplitudeFactor) {
    const [centerX, centerY] = shape.center;

    // Base scale adjustment for smooth oscillation
    const baseScale = 1;
    const scaleStrength = amplitudeFactor * 0.05;

    // Dynamic random offset magnitude influenced by amplitude
    const offsetMagnitude = amplitudeFactor * 3;

    shape.vertices = shape.vertices.map(([x, y]) => {
        const directionX = x - centerX;
        const directionY = y - centerY;

        // Calculate scale based on amplitude-influenced oscillation
        const scale = constrain(baseScale + scaleStrength * sin(frameCount * amplitudeFactor), baseScale - 0.05, baseScale + 0.05);

        // Apply pulse scaling and add amplitude-influenced random offsets
        const offsetX = directionX * scale + random(-offsetMagnitude, offsetMagnitude);
        const offsetY = directionY * scale + random(-offsetMagnitude, offsetMagnitude);

        return [centerX + offsetX, centerY + offsetY];
    });
}

// Function to toggle the composition playback of audio segments
function toggleCompositionPlayback() {
    if (CompositionPlaying) {
        stopCompositionPlayback();
    } else {
        startCompositionPlayback();
    }
}

// Function to start sequential playback of all polygons based on horizontal order
function startCompositionPlayback() {
    CompositionPlaying = true;
    CompositionIndex = 0;

    // Sort shapes by horizontal position (center x-coordinate)
    shapes.sort((a, b) => a.center[0] - b.center[0]);
    playNextSegment();
}

// Function to handle playing the next audio segment in the composition
function playNextSegment() {
    if (!CompositionPlaying || CompositionIndex >= shapes.length) {
        stopCompositionPlayback();
        return;
    }

    let shapeToPlay = shapes[CompositionIndex];
    strokeShape(shapeToPlay, 'black');

    let playDuration = shapeToPlay.endTime - shapeToPlay.startTime;
    audio.play(0, 1, 1, shapeToPlay.startTime, playDuration);

    // Schedule to play the next segment after the current one ends
    nextSegmentTimeout = setTimeout(() => {
        unstrokeShape(shapeToPlay);
        CompositionIndex++;
        playNextSegment();
    }, playDuration * 1000); // Convert playDuration to milliseconds
}

// Function to stop composition playback and reset strokes
function stopCompositionPlayback() {
    CompositionPlaying = false;

    // Reset composition index for new playback
    CompositionIndex = 0;

    clearTimeout(nextSegmentTimeout);

    if (audio.isPlaying()) {
        audio.stop();
    }
    if (playingShape) {
        unstrokeShape(playingShape);
    }
    shapes.forEach(unstrokeShape);
}

// Function to capture the audio file name
function captureAudioFileName() {
    audioFileName = getFileName(audio.url);
}

// Function to extract filename from the audio URL and remove the file extension
function getFileName(url) {
    let fullName = url.substring(url.lastIndexOf('/') + 1);
    return fullName.replace(/\.[^/.]+$/, "");
}

function strokeShape(shape, color) {
    shape.strokeCol = color;
}

function unstrokeShape(shape) {
    shape.strokeCol = null;
}