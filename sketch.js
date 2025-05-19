function preload(){
  // preload assets
}

function setup() {
  createCanvas(400, 400, SVG);
}

function draw() {

  // background pattern

  background(48, 27, 52);

  strokeWeight(0);

  fill(48, 47, 52);
  circle(200, 200, 500);

  fill(48, 67, 52);
  circle(200, 200, 400);

  fill(48, 87, 52);
  circle(200, 200, 300);

  fill(48, 107, 52);
  circle(200, 200, 200);

  // ornaments

  fill(243, 211, 74);

  triangle(25, 25, 25, 50, 50, 25)
  triangle(375, 375, 375, 350, 350, 375)
  triangle(375, 25, 375, 50, 350, 25)
  triangle(25, 375, 25, 350, 50, 375)

  stroke(243, 211, 74);
  strokeWeight(2.5);
  strokeCap(SQUARE);

  line(25, 75, 25, 325);
  line(75, 25, 325, 25);
  line(375, 75, 375, 325);
  line(75, 375, 325, 375);

  // edges of triforce

  strokeWeight(0);

  fill(242, 169, 44);

  rect(150, 180, 100, 5);
  rect(100, 260, 200, 5);

  // triforce (three triangles)

  fill(243, 211, 74);

  triangle(150, 180, 200, 100, 250, 180);
  triangle(100, 260, 150, 180, 200, 260);
  triangle(200, 260, 250, 180, 300, 260);

  noLoop();
}

// save Image (SVG) by pressing Enter

function keyPressed() {
  if (key === 'Enter') {
    save('triforce.svg');
  }
}