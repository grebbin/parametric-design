// Function to calculate the offset between the mouse position and the center of the shape
function pickup(shape) {

    // Calculate the horizontal and vertical offsets from the mouse to the shape's center
    offsetX = mouseX - shape.center[0];
    offsetY = mouseY - shape.center[1];
}

// Function to update the position of a shape while it is being dragged
function drag(shape, mouseX, mouseY) {
    
    // Update the shape's center position based on the mouse position
    shape.center[0] = mouseX - offsetX;
    shape.center[1] = mouseY - offsetY;

    // Calculate the difference between the new shape center and the average vertex position
    let dx = shape.center[0] - shape.vertices.reduce((sum, v) => sum + v[0], 0) / shape.vertices.length;
    let dy = shape.center[1] - shape.vertices.reduce((sum, v) => sum + v[1], 0) / shape.vertices.length;
    
    // Update each vertex position to reflect the new center position, keeps the shape intact while moving
    shape.vertices = shape.vertices.map(v => [v[0] + dx, v[1] + dy]);
}