let v = [];
let cols = 600, rows = 30;

let t_D = 180*15/cols;
let r_D = 1/rows;

let opening, vDensity;
let opening_, vDensity_;

function setup(){
    createCanvas(windowWidth, windowHeight, WEBGL);
    colorMode(HSB);
    angleMode(DEGREES);
    noStroke();

    opening_ = createDiv();
    opening = createSlider(1, 10, 2, 0.1);

    vDensity_ = createDiv();
    vDensity = createSlider(1, 20, 8, 0.01);

    for(let r = 0; r <= rows; r++){
        v.push([]);
        for(let theta = 0; theta <= cols; theta++){
            let phi = (180/opening.value()) * Math.exp(-theta*t_D/(vDensity.value()*180));
            let petalCut = 1-(1/2) * pow((5/4) * pow(1-((3.6*theta*t_D%360)/180), 2)-1/4, 2);
            let hangDown = 2 * pow(r*r_D, 2) * pow(1.3*r*r_D-1, 2) * sin(phi);

            let pX = 260 * petalCut * (r*r_D * sin(phi)+hangDown * cos(phi)) * sin(theta*t_D);
            let pY = -260 * petalCut * (r*r_D * cos(phi)-hangDown * sin(phi));
            let pZ = 260 * petalCut * (r*r_D * sin(phi)+hangDown * cos(phi)) * cos(theta*t_D);
            let pos = createVector(pX, pY, pZ);
            v[r].push(pos);
        }
    }
}

function draw(){
    background(230, 50, 15);
    orbitControl(4,4); //3D mouse control

    rotateX(-30);
    
    for(let r = 0; r < v.length; r++){
        fill(340, 100, -20+r*r_D*120);
        for(let theta = 0; theta < v[r].length; theta++){
            if(r < v.length-1 && theta < v[r].length-1){
                beginShape();
                vertex(v[r][theta].x, v[r][theta].y, v[r][theta].z);
                vertex(v[r+1][theta].x, v[r+1][theta].y, v[r+1][theta].z);
                vertex(v[r+1][theta+1].x, v[r+1][theta+1].y, v[r+1][theta+1].z);
                vertex(v[r][theta+1].x, v[r][theta+1].y, v[r][theta+1].z);
                endShape(CLOSE);
            }
        }
    }

    opening_.html("Flower opening" + opening.value());
    vDensity_.html("Vertical Density" + vDensity.value());
}