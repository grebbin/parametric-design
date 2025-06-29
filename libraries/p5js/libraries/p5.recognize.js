var shapes = [];

/* Create polygon object and add it to the shapes array with parameters
vertices (Array coordinates), color and start and end time of audio segments*/
p5.prototype.createPolygon = function(vertices, color, startTime, endTime) {
    let cx = 0, cy = 0;
    
    // Calculate the center of the polygon by averaging the vertices
    vertices.forEach(v => {
        cx += v[0];
        cy += v[1];
    });
    cx /= vertices.length;
    cy /= vertices.length;

    // Create the polygon object with properties
    var poly_obj = {
        type: "polygon",
        vertices: vertices,
        center: [cx, cy],
        col: color,
        startTime: startTime, 
        endTime: endTime
    };

    // Add the polygon object to the shapes array
    shapes.push(poly_obj);
};

// Function to display all the polygons stored in the shapes array
p5.prototype.display = function() {
    for (var i = 0; i < shapes.length; i++) {
        let shape = shapes[i];
        
        // Set up drawing styles for each shape
        push();
        fill(shape.col);

        if (shape.strokeCol) {
            stroke(shape.strokeCol);
        } else {
            stroke('rgba(255, 255, 255, 1)');
        }
        
        strokeWeight(3);

        // If the shape is a polygon, draw it using the vertices
        if (shape.type === "polygon") {
            beginShape();
            shape.vertices.forEach(v => vertex(v[0], v[1]));
            endShape(CLOSE);
        }

        // Restore drawing styles to previous state
        pop();
    }
};

/* Function to determine if the mouse is inside any polgyon 
and return the associated shape*/
p5.prototype.findShapeType = function(mx, my) {
    
    // Initialize minimum distance and add variable to store closest shape
    var mini = Infinity;
    var mini_obj;


    // Iterate through shapes to find the closest one
    for (var i = 0; i < shapes.length; i++) {
        var d = dist(shapes[i].center[0], shapes[i].center[1], mx, my);

        if (d <= mini) {
            mini = d;
            mini_obj = shapes[i];
        }
    }

    // If the clostet shape is a polygon, check if the mouse is inside it
    if (mini_obj && mini_obj.type === "polygon") {
        
        // Initialize inside flag as false
        let inside = false;

        // Get verticales of the polygon
        let vs = mini_obj.vertices;

        // Use an algorithm to determin if the mouse position is within the polygon
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            let xi = vs[i][0], yi = vs[i][1];
            let xj = vs[j][0], yj = vs[j][1];

            // Check if the mouse position intersects with the line segements of the polygon
            let intersect = ((yi > my) !== (yj > my)) &&
                            (mx < (xj - xi) * (my - yi) / (yj - yi + 0.00001) + xi);
            
            // Toogle inside flag when intersecting
            if (intersect) inside = !inside;
        }

        // Return shape information, either as a polygon or background
        return inside ? ["polygon", mini_obj] : ["background", undefined];
    } else {
        
        // If no shape is detected, return background
        return ["background", undefined];
    }
};