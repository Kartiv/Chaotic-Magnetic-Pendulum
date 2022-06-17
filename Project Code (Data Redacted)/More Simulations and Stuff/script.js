class jsn{

    //Random
    static random(a,b){
        return a + Math.random()*(b-a);
    }
    
    static randint(a,b){
        return a+Math.floor(Math.random()*(b-a));
    }
    
    static randomize(arr){
        let newarr = [];
        let m = arr.length;
        for(let i=0; i<m; i++){
            let s = jsn.randint(0,arr.length);
            newarr.push(arr.splice(s,1)[0]);
        }
        return newarr;
    }

    //Linear Algebra
    static dot(lst1, lst2){
        let s=0;
        for(let i=0; i<lst1.length; i++){
            s+=lst1[i] * lst2[i]
        }
        return s
    }

    static operator(A, b){ //matrix A times vector b
        let C = [];
        for(let r=0; r<A.length; r++){
            C.push(jsn.dot(A[r], b));
        }
        return C
    }

    //List Operations
    static areEqual(a,b){
        if(a.length!=b.length){
            return false;
        }
        for(let i=0; i<a.length; i++){
            if(a[i]!=b[i]){
                return false;
            }
        }
        return true;
    }

    static randArr(n){
        let lst = [];
        for(let i=0; i<n; i++){
            lst.push(jsn.random(-1, 1));
        }
        return lst;
    }

    static roundArr(arr){
        let newArr = [];
        for(let i=0; i<arr.length; i++){
            newArr.push(Math.round(arr[i]));
        }
        return newArr;
    }

    static linspace(a,b,n){
        let x = [];
        for(let i=0; i<n; i++){
            x.push(a+i*b/n);
        }
        return x;
    }

    static arange(a,b,dt){
        let x = [];
        while(a<b){
            x.push(a);
            a+=dt;
        }
        return x;
    }

    //Relevant Functions

    static sigmoid(z){
        //return 1/(1+Math.exp(-z));
        return Math.atan(z)/Math.PI+1/2;
    }

    static lstSigmoid(lst){
        var nlist = [];
        for(let i=0; i<lst.length; i++){
            nlist.push(jsn.sigmoid(lst[i]));
        }
        return nlist;
    }

    //POLYGONS

    static generateConvex(N, bound){
        let X = [];
        let Y = [];
        for(let i=0; i<N; i++){
            X[i] = jsn.randint(0,bound);
            Y[i] = jsn.randint(0,bound);
        }
        X.sort((a,b)=>{
            return a-b;
        })
        Y.sort((a,b)=>{
            return a-b;
        })
        let xmin = X[0];
        let xmax = X[X.length-1];
        let ymin = Y[0];
        let ymax = Y[Y.length-1];
        let xGroups = [[xmin],[xmin]];
        let yGroups = [[ymin], [ymin]];
        for(let i=1; i<N-1; i++){
            let s1 = jsn.randint(0,2);
            let s2 = jsn.randint(0,2);
            if(s1){
                xGroups[0].push(X[i])
            }
            else{
                xGroups[1].push(X[i]);
            }
            if(s2){
                yGroups[0].push(Y[i])
            }
            else{
                yGroups[1].push(Y[i]);
            }
        }
        xGroups[0].push(xmax);
        xGroups[1].push(xmax);
        yGroups[0].push(ymax);
        yGroups[1].push(ymax);

        let xVec = [];
        let yVec = [];
        for(let i=0; i<xGroups[0].length-1; i++){
            xVec.push(xGroups[0][i+1]-xGroups[0][i]);
        }
        for(let i=0; i<xGroups[1].length-1; i++){
            xVec.push(xGroups[1][i]-xGroups[1][i+1]);
        }
        for(let i=0; i<yGroups[0].length-1; i++){
            yVec.push(yGroups[0][i+1]-yGroups[0][i]);
        }
        for(let i=0; i<yGroups[1].length-1; i++){
            yVec.push(yGroups[1][i]-yGroups[1][i+1]);
        }

        yVec = jsn.randomize(yVec);
        
        let Vectors = [];
        for(let i=0; i<xVec.length; i++){
            Vectors.push(new vec2d(xVec[i], yVec[i]));
        }
        
        Vectors.sort((a,b)=>{
            let anga = Math.atan2(a.x1, a.x0);
            let angb = Math.atan2(b.x1, b.x0);
            if(anga<0){
                anga+=2*Math.PI;
            }
            if(angb<0){
                angb+=2*Math.PI;
            }
            return anga-angb;
        })

        let verts = [Vectors[0].add(new vec2d(xmax,ymax))];
        for(let i=1; i<Vectors.length; i++){
            verts.push(verts[i-1].add(Vectors[i]));
        }

        return new polygon(verts);
    }

    static createRect(x,y,width,height){
        return new polygon([new vec2d(x-width/2, y-height/2), new vec2d(x-width/2, y+height/2), new vec2d(x+width/2, y-height/2),
            new vec2d(x+width/2, y+height/2)]);
    }

    static SAT(poly1, poly2){
        for(let i=0; i<poly1.vertices.length; i++){
            let axis = poly1.edge(i).normal();
            let p1 = poly1.project(axis);
            let p2 = poly2.project(axis);
            if(p1[0]>p2[1] || p2[0]>p1[1]){
                return false;
            }
        }
        for(let i=0; i<poly2.vertices.length; i++){
            let axis = poly2.edge(i).normal();
            let p1 = poly1.project(axis);
            let p2 = poly2.project(axis);
            if(p1[0]>p2[1] || p2[0]>p1[1]){
                return false;
            }
        }
        return true;
    }
}

class Simulation{
    /**
     * 
     * @param {Vector} x - Initial position of system
     * @param {Vector} v - Initial velocity of system, irrelevant when solving first order equations
     * @param {float} dt - iTme increment for simulation
     * @param {float} maxt - End time (t) value for simulation
     * @param {function} dfunc - Differential equation function. Formatted f(x,t) for first order, f(x,v,t) for second order.
     * @param {boolean} second - Boolean which defines if the system is a first order or second order ode
     */
    constructor(x,v, dt, maxt, dfunc, second = true){
        this.pos = x;
        this.speed = v;
        this.maxt = maxt;
        this.xlist = [x];
        this.vlist = [v];
        this.dt = dt;
        this.t = 0;
        if(second){
            this.prop = this.rk4s;
            this.f1 = (x1,x2,t)=>x2;
            this.f2 = dfunc;
        }
        else{
            this.prop = this.rk4;
            this.f1 = dfunc;
        }
    }

    /**
     * Fully run the system
     */
    run(){
        this.t = this.dt;
        while(this.t<this.maxt){
            this.t+=this.dt;
            this.prop();
        }
    }

    /**
     * standard runge kutta 4th order
     */
    rk4(){
        let k1 = this.f1(this.pos,this.t).scaleUp(this.dt);
    
        let k2 = this.f1(this.pos.add(k1.scaleDown(2)), this.t + this.dt/2).scaleUp(this.dt);

        let k3 = this.f1(this.pos.add(k2.scaleDown(2)), this.t + this.dt/2).scaleUp(this.dt);

        let k4 = this.f1(this.pos.add(k3), this.t + this.dt).scaleUp(this.dt);

        this.pos = this.pos.add((k1.add(k2.scaleUp(2)).add(k4).add(k3.scaleUp(2))).scaleDown(6));

        this.xlist.push(this.pos);

    }

    /**
     * runge kutta 4th order for a coupled system of equations, here for the functions x and v
     */
    rk4s(){
        let k11 = this.f1(this.pos,this.speed,this.t).scaleUp(this.dt);
        let k21 = this.f2(this.pos,this.speed,this.t).scaleUp(this.dt);
        let k12 = this.f1(this.pos.add(k11.scaleDown(2)),this.speed.add(k21.scaleDown(2)),this.t+0.5*this.dt).scaleUp(this.dt);
        let k22 = this.f2(this.pos.add(k11.scaleDown(2)),this.speed.add(k21.scaleDown(2)),this.t+0.5*this.dt).scaleUp(this.dt);
        let k13 = this.f1(this.pos.add(k12.scaleDown(2)),this.speed.add(k22.scaleDown(2)),this.t+0.5*this.dt).scaleUp(this.dt);
        let k23 = this.f2(this.pos.add(k12.scaleDown(2)),this.speed.add(k22.scaleDown(2)),this.t+0.5*this.dt).scaleUp(this.dt);
        let k14 = this.f1(this.pos.add(k13),this.speed.add(k23),this.t+this.dt).scaleUp(this.dt);
        let k24 = this.f2(this.pos.add(k13),this.speed.add(k23),this.t+this.dt).scaleUp(this.dt);
        this.pos = this.pos.add((k11.add(k12.scaleUp(2)).add(k14).add(k13.scaleUp(2))).scaleDown(6));
        this.speed = this.speed.add((k21.add(k22.scaleUp(2)).add(k23.scaleUp(2)).add(k24)).scaleDown(6));

        this.xlist.push(this.pos);
        //this.vlist.push(this.speed);
    }

    /**
     * 
     * @param {int} i - which body in the position list is required
     * @returns - position list over time for required body
     */
    getSolution(i){
        let a =[];
        for(let v of this.xlist){
            a.push(v.coords[i]);
        }
        return a;
    }
}
class Vector{ //vector class

    constructor(coords){
        this.coords = coords;
        this.dim = coords.length;
    } 

    add(v){ //add this vector with input vector
        if(v.dim!=this.dim){
            throw("Vector Dimensions don't Match");
        }

        let a = [];
        for(let i in this.coords){
            a.push(this.coords[i]+v.coords[i]);
        }
        return new Vector(a);
    }

    sub(v){ //subtract input vector from this vector
        if(v.dim!=this.dim){
            throw("Vector Dimensions don't Match");
        }

        let a = [];
        for(let i in this.coords){
            a.push(this.coords[i]-v.coords[i]);
        }
        return new Vector(a);
    }

    scaleUp(lambda){ //multiply by scalar
        let a = [];
        for(let i in this.coords){
            a.push(this.coords[i]*lambda);
        }
        return new Vector(a);
    }

    scaleDown(lambda){ //divide by scalar
        let a = [];
        for(let i in this.coords){
            a.push(this.coords[i]*1/lambda);
        }
        return new Vector(a);
    }

    dot(v){
        if(v.dim!=this.dim){
            throw("Vector Dimensions don't Match");
        }
        let s = 0;
        for(let i=0; i<v.dim; i++){
            s+=v.coords[i]*this.coords[i];
        }
        return s;
    }

    norm(){ //norm of vector
        return Math.sqrt(this.dot(this));
    }
}

class Graph{
    constructor(canvas, xmin = null, ymin = null, xmax = null, ymax = null){
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.xmin = xmin;
        this.xmax = xmax;
        this.ymin = ymin;
        this.ymax = ymax;
    }

    plot(xdata, ydata, color=null, s=2){

        let xmin = this.xmin;
        let ymin = this.ymin;
        let xmax = this.xmax;
        let ymax = this.ymax;
        if(!xmin){
            xmin = Math.min(...xdata);
        }
        if(!ymin){
            ymin = Math.min(...ydata);
        }
        if(!xmax){
            xmax = Math.max(...xdata);
        }
        if(!ymax){
            ymax = Math.max(...ydata);
        }   
        
        if(ymax==ymin){
            ymax+=2;
            ymin-=2;
        }
        this.ctx.fillText(ymax,0,20);
        this.ctx.fillText(ymin, 0, this.canvas.height-20);
        
        if(xdata.length != ydata.length){ //check for error in drawing
            console.error("xdata and ydata have mismatching dimensions");
        }

        if(color==null){ //set color
            ctx.strokeStyle="blue";
        }
        else{
            ctx.strokeStyle = color;
        }

        this.ctx.lineWidth = s;
        this.ctx.beginPath();
        this.ctx.moveTo((xdata[0] - xmin)/(xmax-xmin)*this.canvas.width, (ymax-ydata[0])/(ymax-ymin)*this.canvas.height); //minus on ydata cuz canvas flipped
        for(let i in xdata){
            this.ctx.lineTo((xdata[i] - xmin)/(xmax-xmin)*this.canvas.width, (ymax-ydata[i])/(ymax-ymin)*this.canvas.height);
        }
        this.ctx.stroke();
        this.ctx.closePath();

        return;
    }

    scatter(xdata, ydata, color = null, c=null, s=3){

        let xmin = this.xmin;
        let ymin = this.ymin;
        let xmax = this.xmax;
        let ymax = this.ymax;
        if(!xmin){
            xmin = Math.min(...xdata);
        }
        if(!ymin){
            ymin = Math.min(...ydata);
        }
        if(!xmax){
            xmax = Math.max(...xdata);
        }
        if(!ymax){
            ymax = Math.max(...ydata);
        }

        if(xdata.length != ydata.length){ //check for error in drawing
            console.error("xdata and ydata have mismatching dimensions");
        }

        if(!c && !color){ //set color
            ctx.fillStyle="blue";
            for(let i in xdata){
                ctx.beginPath();
                this.ctx.arc((xdata[i] - xmin)/(xmax-xmin)*this.canvas.width, (ymax-ydata[i])/(ymax-ymin)*this.canvas.height, s, 0, 2*Math.PI);
                this.ctx.fill();
                this.ctx.closePath();
            }
        }
        else if(color){
            ctx.fillStyle=color;
            for(let i in xdata){
                ctx.beginPath();
                this.ctx.arc((xdata[i] - xmin)/(xmax-xmin)*this.canvas.width, (ymax-ydata[i])/(ymax-ymin)*this.canvas.height, s, 0, 2*Math.PI);
                this.ctx.fill();
                this.ctx.closePath();
            }
        }
        else{
            for(let i in xdata){
                ctx.fillStyle = c[i];
                ctx.beginPath();
                this.ctx.arc((xdata[i] - xmin)/(xmax-xmin)*this.canvas.width, (ymax-ydata[i])/(ymax-ymin)*this.canvas.height, s, 0, 2*Math.PI);
                this.ctx.fill();
                this.ctx.closePath();
            }
        }

        return;
    }
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
canvas.style.border = "solid";
canvas.width = 1000;
canvas.height = 500;

//Functions

function createMags(n){
    let mags = [];
    for(let i=1; i<n+1; i++){
        mags.push(new Vector([R*Math.cos(i*2*Math.PI/n), R*Math.sin(i*2*Math.PI/n), L+h]));
    }
    return mags;
}

// function dist(angs, i){
//     return Math.sqrt((L+h)**2+R**2+L**2 -2*L*R*Math.sin(angs.coords[1])*Math.cos(angs.coords[0]-2*Math.PI*i/n) -2*L*(L+h)*Math.cos(angs.coords[1]));
// }

// function acc(x1, x2, t)  {
//     let s1 = 0;
//     let s2 = 0;
//     for(let i=0; i<n; i++){
//         let di5 = dist(x1, i+1) ** (-5);
//         s1+= zeta[i] * di5 * Math.sin(x1.coords[0]-2*Math.PI*(i+1)/n);
//         s2+= zeta[i] * di5 * ((L+h)*Math.sin(x.coords[1]) - R*Math.cos(x1.coords[1])*Math.cos(x1.coords[0]-2*Math.PI*(i+1)/n));
//     }

//     return new Vector([-2*x2.coords[0]*x2.coords[1]*Math.cos(x1.coords[1])/(Math.sin(x1.coords[1])) + 3*R/(m*L*Math.sin(x1.coords[1])) * s1, Math.sin(x1.coords[1])*Math.cos(x1.coords[1])*x2.coords[0]**2 -g*Math.sin(x1.coords[1])/L + 3/(m*L) * s2]);
// }

//Initialize Simulation


// function dist(x, i){ //almost working 3d
//     return Math.sqrt((x.coords[0]-R*Math.cos(2*Math.PI*i/n))**2 + (x.coords[1]-R*Math.sin(2*Math.PI*i/n))**2 + 
//     (Math.sqrt(L**2-x.coords[0]**2-x.coords[1]**2)-L-h)**2);
// }
// function acc(x1, x2, t){
//     let s1 = -g*x1.coords[0]/Math.sqrt(L**2-x1.coords[0]**2-x1.coords[1]**2);
//     let s2 = -g*x1.coords[1]/Math.sqrt(L**2-x1.coords[0]**2-x1.coords[1]**2);

//     for(let i=0; i<n; i++){
//         let di5 = dist(x1, i+1)**(-5);
//         s1 += -3*zeta[i]/m * di5 * (x1.coords[0]-R*Math.cos(2*Math.PI*(i+1)/n));
//         s2 += -3*zeta[i]/m * di5 * (x1.coords[1]-R*Math.sin(2*Math.PI*(i+1)/n));
//     }

//     return(new Vector([s1-b*x2.coords[0], s2-b*x2.coords[1]]));
// }

// function dist(x, i){ //almost working 3d
//     return Math.sqrt( (L*Math.sin(x.coords[1])*Math.cos(x.coords[0])-R*Math.cos(2*Math.PI*i/n))**2 
//     + (L*Math.sin(x.coords[1])*Math.sin(x.coords[0])-R*Math.sin(2*Math.PI*i/n))**2
//     + (L+h-L*Math.cos(x.coords[1]))**2);
// }
// function acc(x1, x2, t){
//     let s1 = -2*Math.cos(x1.coords[1])/Math.sin(x1.coords[1])*x2.coords[0]*x2.coords[1];
//     let s2 = Math.sin(x1.coords[1])*Math.cos(x1.coords[1])*x2.coords[0]**2-m*g/(2*L)*Math.sin(x1.coords[1]);

//     for(let i=0; i<n; i++){
//         let di = dist(x1, i+1);
//         let alpha = Math.asin((L+h-L*Math.cos(x1.coords[1]))/(di));
//         let force = magStrength/di**4 // * (2*Math.cos(alpha-Math.PI/2)*Math.cos(alpha+x1.coords[1]-Math.PI/2)
//                                       //      -Math.sin(alpha-Math.PI/2)*Math.sin(alpha+x1.coords[1]-Math.PI/2));

//         s1 += force/(m*L*L*Math.sin(x1.coords[0])**2+eps)*R*Math.cos(x1.coords[1])*Math.sin(2*Math.PI*(i+1)/n-x1.coords[0])/(L*L*Math.sin(x1.coords[1])+eps);
//         s2 += force/(2*L**2)*Math.cos(x1.coords[1])*(Math.cos(x1.coords[1])*(1-R/L*Math.cos(2*Math.PI*(i+1)/n-x1.coords[0])/(Math.sin(x1.coords[1])+eps))-Math.cos(x1.coords[0])+1+h/L);
//     }

//     return(new Vector([s1-b*x2.coords[0], s2-b*x2.coords[1]]));
// }

function dist(x, i){ //toy equations
    return Math.sqrt((x.coords[0]-R*Math.cos(2*Math.PI*i/n))**2 + (x.coords[1]-R*Math.sin(2*Math.PI*i/n))**2 + h**2);
}
function acc(x1, x2, t){
    let s1 = -2*g * x1.coords[0] - b*x2.coords[0];
    let s2 = -2*g * x1.coords[1] - b*x2.coords[1];
    for(let i=0; i<n; i++){
        let di5 = dist(x1, i+1)**(-5);
        s1 += -3*zeta[i]/m * di5 * (x1.coords[0]-R*Math.cos(2*Math.PI*(i+1)/n));
        s2 += -3*zeta[i]/m * di5 * (x1.coords[1]-R*Math.sin(2*Math.PI*(i+1)/n));
    }
    return new Vector([s1,s2]);
}

// function dist(x, i){ //new idea
//     return (L*Math.sin(x.coords[1])*Math.cos(x.coords[0])-R*Math.cos(2*Math.PI*i/n))**2 
//     + (L*Math.sin(x.coords[1])*Math.sin(x.coords[0])-R*Math.sin(2*Math.PI*i/n))**2
//     + (L+h-L*Math.cos(x.coords[1]))**2;
// }

// function acc(x1, x2, t){ 
//     let s1 = -g*x1.coords[0]/Math.sqrt(L**2-x1.coords[0]**2-x1.coords[1]**2);
//     let s2 = -g*x1.coords[1]/Math.sqrt(L**2-x1.coords[0]**2-x1.coords[1]**2);
//         for(let i=0; i<n; i++){
//         let di = dist(x1, i+1)**(-2);
//         s1 += magStrength * di * (magList[i].coords[0]);
//         s2 += magStrength * di;
//     }

//     return(new Vector([s1-b*x2.coords[0], s2-b*x2.coords[1]]));
// }

var dt = 0.01;
var maxt = 60;

var n = 3;

var R = 1;
var L = 1;
var h = 0.25;
var m = 2;
var g = 9.8;
var b = 0.1;

var eps = 0.2;

var magStrength = 1;

var zeta = [];
for(let i=0; i<n; i++){
    zeta.push(magStrength);
}
mags = createMags(n);


var x = new Vector([0.8,0.8]);
var v = new Vector([0 ,0]);

var u = new Vector([0.00000001, 0.00000001]);

var sim1 = new Simulation(x, v, dt, maxt, acc, second = true);
sim1.run();

var sim2 = new Simulation(x.add(u), v, dt, maxt, acc, second = true);
sim2.run();

//console.log(1/maxt * Math.log((sim2.xlist[sim2.xlist.length-1].sub(sim1.xlist[sim1.xlist.length-1]).norm())/(u.norm()))); //lyapunov?

//Plot Graphs

function lyapunov(sim1,sim2){
    var graph = new Graph(canvas);
    let tlist = [];
    let llist = [];
    for(i in sim1.xlist){
        if(i>5){
            tlist.push(i*dt);
            llist.push(1/(i*dt)*Math.log(sim1.xlist[i].sub(sim2.xlist[i]).norm()/u.norm()));
        }
    }
    graph.plot(tlist, llist);
}

function plotDist(sim1, sim2){
    var graph = new Graph(canvas);
    var tlist = jsn.arange(0, maxt, dt);

    var dlist = [];
    for(let i in sim1.xlist){
        dlist.push((sim1.xlist[i].sub(sim2.xlist[i]).norm()))
    }
    graph.plot(tlist,dlist);
}


function angsToCart(angList){
    let xlist = [];
    let ylist = [];
    for(let angs of angList){
        xlist.push(L*Math.sin(angs.coords[1])*Math.cos(angs.coords[0]));
        ylist.push(L*Math.sin(angs.coords[1])*Math.sin(angs.coords[0]));
    }
    return [xlist, ylist]
}

function lyapunov2(sim1, sim2, n, m){
    let s = 0;
    for(let i=n; i<n+m; i++){
        s+=Math.log(sim1.xlist[i].sub(sim2.xlist[i]).norm());
    }
    return s/m;
}

// plotDist(sim1, sim2);

//polar
// let lists = angsToCart(sim1.xlist);
// let xlist = lists[0];
// let ylist = lists[1];


//cartesian
let xlist = [];
let ylist = [];

for(let i=0; i<sim1.xlist.length; i++){
    xlist.push(sim1.xlist[i].coords[0]);
    ylist.push(sim1.xlist[i].coords[1]);
}

plotDist(sim1,sim2);


//Simulation animation
// canvas.width = 500;
// canvas.height = 500;
// ctx.translate(canvas.width/2, canvas.height/2);
// ctx.scale(1,-1);

// var scale = 100;

// let i = 0;
// var interval = setInterval(()=>{
//     ctx.fillStyle = "green";
//     ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
//     ctx.beginPath();
//     ctx.arc(xlist[i] * scale, ylist[i] * scale, 10, 0, 2*Math.PI);
//     ctx.fill();

//     // //second simulation
//     // ctx.fillStyle = "blue";
//     // ctx.beginPath();
//     // ctx.arc(sim2.xlist[i].coords[0] * scale, sim2.xlist[i].coords[1] * scale, 10, 0, 2*Math.PI);
//     // ctx.fill();


//     ctx.fillStyle = "red";
//     for(let mag of mags){
//         ctx.beginPath();
//         ctx.arc(mag.coords[0] * scale, mag.coords[1] * scale, 10, 0, 2*Math.PI);
//         ctx.fill();
//     }
//     ctx.beginPath();
//     ctx.arc(0,0,L * scale, 0, 2*Math.PI);
//     ctx.stroke();
//     i++;
// }, 1)