class vec2d{ //vector class

    constructor(c0,c1){
        this.c0 =c0;
        this.c1 = c1;
    } 

    add(vec){ //add this vector with input vector
        return new vec2d(this.c0+vec.c0, this.c1+vec.c1);
    }

    sub(vec){ //subtract input vector from this vector
        return new vec2d(this.c0-vec.c0, this.c1-vec.c1);
    }

    scaleUp(lamda){ //multiply by scalar
        return new vec2d(lamda * this.c0, lamda * this.c1);
    }

    scaleDown(lamda){ //divide by scalar
        return new vec2d( 1/lamda * this.c0, 1/lamda * this.c1);
    }

    norm(){ //norm of vector
        return Math.sqrt(this.c0**2+this.c1**2);
    }
}

class simulation{ //a simulated pendulum class

    constructor(pos0, pos1, color = "black"){
        this.pos = new vec2d(pos0,pos1); //position of simulated object
        this.speed = new vec2d(0,0); //starts at rest
        this.color = color;
    }
    drawBoard(){ //draw the board
        ctx.beginPath(); //draws the simulated object
        ctx.arc(this.pos.c0, this.pos.c1, 10, 0, 2* Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    
    update(){ //update data
        var acc = (((zeroVec.sub(this.speed)).scaleUp(b * dt/1000)).sub(this.pos.scaleUp(g*dt/1000))).add(magSum(this.pos, mags).scaleUp(-1));//diff eq
        this.speed = this.speed.add(acc); //acc is the derivative of speed
        this.pos = this.pos.add(this.speed.scaleUp(dt/1000)); //speed is the derivative of pos
    }
    
    clearBoard(){ //clear the board
        ctx.clearRect(-200, -200, 400, 400);
    }
    
}

//main canvas setup

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
const canvasWidth = 340;
const canvasHeight = 340;
const center = new vec2d(canvasWidth/2,canvasHeight/2) //center of the canvas
ctx.translate(center.c0,center.c1); //translate origin to center of canvas
ctx.scale(1,-1); //flip y axis
center.c0 = 0; //update center coords
center.c1 = 0;

//gCanvas setup
const gCanvas = document.getElementById("graphCanvas");
const gctx = gCanvas.getContext('2d');
const gCanvasWidth = 340;
const gCanvasHeight = 340;
gctx.translate(gCanvasWidth/2, gCanvasHeight/2);
gctx.scale(1,-1);

//xCanvas setup
const xCanvas = document.getElementById("xCanvas");
const xctx = xCanvas.getContext('2d');
const xCanvasWidth=340;
const xCanvasHeight = 340;
xctx.translate(0, xCanvasHeight/2);
xctx.scale(1,-1);

//yCanvas setup
const yCanvas = document.getElementById("yCanvas");
const yctx = yCanvas.getContext('2d');
const yCanvasWidth=340;
const yCanvasHeight = 340;
yctx.translate(0, yCanvasHeight/2);
yctx.scale(1,-1);

var interval; //interval for later

const zeroVec = new vec2d(0,0) //the zero vector, for calculations

var b = 0.1;//friction coefficient
var h = 20;//average error in distance from magnets
var n = 3; //number of magnets 
var g = 5; //gravitational constant

var strength = 3; //how strong are the magnets
var scale = 80; //how close/far the magnets are from each other

const dt = 10; //dt in milliseconds

var mags = []; //magnet list

var sims = []; //array of simulations
var ogSims = []; //starting conditions
var lastSimPos = []; //last position of simulations (for graph canvas)
var xPosList = []; //list of x positions for x graph
var yPosList = []; //same for y positions
var posFlag = false; //for slightly improving performance lol

const colorList = [ "red", "orange", "yellow", "green", "blue", "indigo", "violet", "BurlyWood", "grey", "lime", "gold", "cyan",
 "BlueViolet", "Chartreuse", "CadetBlue", "Aquamarine", "Aqua", "Brown", "Crimson", "Chocolate", "DarkOrange", "DarkMagenta",
 "DeepPink", "DarkTurquoise", "FireBrick", "ForestGreen", "PowderBlue", "Silver", "Black"];

 //simulation functions

 function magSum(pos, magList){ //sum of magnet potential forces
    // var s = new vec2d(0,0);
    // for(let i=0; i<magList.length; i++){
    //     s = s.add((magList[i].sub(pos)).scaleDown((((magList[i].sub(pos)).norm())**2 + h*h)**(5/2))) //from equations
    // }

    var s = magList.reduce((pv, pc)=> pv.sub((pc.sub(pos)).scaleDown((((pc.sub(pos)).norm())**2 + h*h)**(5/2))), new vec2d(0,0));

    return s.scaleUp(strength * 10000000);
}

//misc

function copySimArr(arr){ //copy an array of simulations
    var copy = [];
    for(let i=0; i<arr.length; i++){
        copy.push(new simulation(arr[i].pos.c0, arr[i].pos.c1, arr[i].color));
    }
    return copy;
}

//global functions

 function start(){
    clearInterval(interval); //otherwise on each start everything becomes faster
    sims = copySimArr(ogSims); //copy ogSims, to make sure the simulation starts from 0 each time
    setConstants();

    cleargBoard(); //incase a simulation was running prior
    clearxyBoards();

    interval = setInterval(()=>{ //sets the interval and what should be done during the interval
        updatePath(); //updatePath first, so it would "stay behind" (lastSimPos needs to be a step behind)
        for(let i=0;i<sims.length;i++){
            sims[i].update();
        }

        sims[0].clearBoard();
        for(let i=0; i<mags.length; i++){ //draws the magnets
            ctx.beginPath();
            ctx.arc(mags[i].c0, mags[i].c1, 20, 0, 2*Math.PI)
            ctx.fillStyle = "teal";
            ctx.fill()
        }
        for(let i=0;i<sims.length;i++){
            sims[i].drawBoard();
        }

        clearxyBoards();
        updateXY();
        drawXY();
        drawPath();
    }, dt)

    mags = magGen(n); //generate magnets
    for(let i=0;i<sims.length;i++){
        sims[i].drawBoard();
    } //draw starting position
}

//setup

function MSO(){ //m simulations with an offset
    let xpos = parseInt(document.getElementById("xInput2").value);
    let ypos = parseInt(document.getElementById("yInput2").value);
    let xOff = parseInt(document.getElementById("xOffsetInput").value);
    let yOff = parseInt(document.getElementById("yOffsetInput").value);
    let m = parseInt(document.getElementById("mInput").value);
    
    let index = ogSims.length;
    for(let i=0; i<m; i++){
        ogSims.push(new simulation(xpos + xOff * i, ypos + yOff * i, colorList[index]));
        index ++;
        lastSimPos.push(new vec2d(xpos+xOff * i), ypos+yOff * i);
        xPosList.push([xpos + xOff * i]);
        yPosList.push([ypos + yOff * i]);
    }
}

function magGen(n){ //generate n magnets
    lst = [];
    for(let i=0; i<n; i++){
        lst[i] = new vec2d(scale*Math.cos(2*Math.PI * i /n), scale*Math.sin(2*Math.PI*i/n)) //equally spaced in a circle around the origin
    }
    return lst;
}

function setConstants(){

    var scaleIn = document.getElementById("scaleInput").value;
    var gIn = document.getElementById("gInput").value;
    var strengthIn = document.getElementById("strengthInput").value;
    var bIn = document.getElementById("bInput").value;
    var hIn = document.getElementById("hInput").value;
    var nIn = document.getElementById("nmagsInput").value;

    if(scaleIn != ""){
        scale = parseInt(scaleIn); 
    }

    if(gIn != ""){
        g = parseInt(gIn); 
    }

    if(strengthIn != ""){
        strength = parseInt(strengthIn); 
    }

    if(hIn != ""){
        h = parseInt(hIn); 
    }

    if(bIn != ""){
        b = parseInt(bIn); 
    }

    if(nIn != ""){
        n = parseInt(nIn); 
    }
}

function addSim(){ //add a simulation to the tracked simulations list
    
    let index = ogSims.length;
    let x = parseInt(document.getElementById("xInput").value);
    let y = parseInt(document.getElementById("yInput").value);

    ogSims.push(new simulation(x,y,colorList[index]));

    lastSimPos.push(new vec2d(x,y));

    xPosList.push([x]);
    yPosList.push([y]);
}

//gCanvas-specific-functions (canvas displaying path of pendulums)

 function updatePath(){
    for(let i=0;i<sims.length;i++){
        lastSimPos[i] = new vec2d(sims[i].pos.c0, sims[i].pos.c1);
    }
 }

 function drawPath(){

    for(let i=0; i<sims.length; i++){
        gctx.strokeStyle = sims[i].color;
        gctx.beginPath();
        gctx.moveTo(lastSimPos[i].c0, lastSimPos[i].c1);
        gctx.lineTo(sims[i].pos.c0, sims[i].pos.c1);
        gctx.stroke();
    }
 }

 function cleargBoard(){
     gctx.clearRect(-gCanvasWidth/2,-gCanvasHeight/2, gCanvasWidth,gCanvasHeight);
 }

 //xCanvas-specific-functions (canvas displaying x position over time)
 function updateXY(){
    for(let i =0; i<xPosList.length; i++){
        if(posFlag){
            xPosList[i].shift();
            yPosList[i].shift();
            xPosList[i].push(sims[i].pos.c0);
            yPosList[i].push(sims[i].pos.c1);
        }

        else{
            xPosList[i].push(sims[i].pos.c0);
            yPosList[i].push(sims[i].pos.c1);

            if(xPosList[0].length > xCanvasWidth){
                posFlag = true;
            }
        }
    }
 }

 function drawXY(){
    for(let i=0; i<xPosList.length;i++){
        xctx.strokeStyle = sims[i].color;
        xctx.lineWidth = 3;
        yctx.strokeStyle = sims[i].color;
        yctx.lineWidth = 3;
        for(let j=0; j<xPosList[0].length-1; j++){
            xctx.beginPath();
            xctx.moveTo(j, xPosList[i][j] / 1.5);
            xctx.lineTo((j+1), xPosList[i][j+1]/ 1.5);
            xctx.stroke();
            yctx.beginPath();
            yctx.moveTo(j, yPosList[i][j] / 1.5);
            yctx.lineTo((j+1), yPosList[i][j+1]/ 1.5);
            yctx.stroke();
        }
    }
 }

 function clearxyBoards(){
     xctx.clearRect(0, -xCanvasHeight/2, xCanvasWidth, xCanvasHeight);
     yctx.clearRect(0, -yCanvasHeight/2, yCanvasWidth, yCanvasHeight);
 }
