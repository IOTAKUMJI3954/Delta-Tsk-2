const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const c = canvas.getContext('2d');
 

c.lineWidth = 3;
let paused = false;
const rectstartx = 0;
const rectstarty = 0;
let rectlength = canvas.width;
let rectheight = canvas.height;
let tilesize = rectheight/5;
let roadsize = tilesize/3;
let tilesx = rectlength/(tilesize+roadsize);
let tilesy = rectheight/(tilesize+roadsize);
let basex = Math.floor(Math.random()*(tilesx-1));
let basey = Math.floor(Math.random()*(tilesy-1));
let centralx = Math.floor(Math.random()*(tilesx-1));
let centraly = Math.floor(Math.random()*(tilesy-1));
while(centralx === basex && centraly ===basey){
    centralx = Math.floor(Math.random()*(tilesx-1));
    centraly = Math.floor(Math.random()*(tilesy-1));
}
let basestation;
let centralhub;
let playerlol;
let aurexsize = tilesize/5;
let playersize = tilesize/10;
let bulletsize = tilesize/40;
let databoxx = 2.5*tilesize;
let databoxy = 1.3*tilesize;
let bulletspeed = 10;
let shardsize = tilesize/20;
let keysize = shardsize;
let keys = {};
let lose = false;
let highscore = 0;
let buttonwidth = tilesize/1.7;
let buttonheight = tilesize/4;
let midbuttonx = rectlength/2 - buttonwidth/2;
let spacing = tilesize/2;

//helper functions
function drawbox(x,y,length,height,strokecolor,color){
    c.beginPath();
    c.moveTo(x,y);
    c.lineTo(x+length,y);
    c.lineTo(x+length,y+height);
    c.lineTo(x,y+height);
    c.lineTo(x,y);
    c.fillStyle = color;
    c.fill();
    c.strokeStyle=strokecolor;
    c.stroke();
}
function drawring(x,y,progress,radius){
    c.beginPath();
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (progress / 100) * 2 * Math.PI;
    
    // Progress arc
    c.beginPath();
    c.arc(x, y, radius, startAngle, endAngle, false);
    c.strokeStyle = "black";
    c.stroke();
}
function drawsurveillancetower(x,y,radius,angle1,angle2){
    c.beginPath();
    c.moveTo(x,y);
    c.lineTo(x + radius * Math.cos(angle1), y + radius * Math.sin(angle1));
    c.arc(x,y,radius,angle1,angle2,false);
    c.lineTo(x,y);
    c.strokeStyle = "red";
    c.fillStyle = "rgba(255,0,0,0.5)";
    c.fill();
    c.stroke();
}
function drawplayer(x,y){
    c.beginPath();
    c.arc(x,y,playersize,0,2*Math.PI,false);
    c.fillStyle = "rgba(0,255,0,0.5)";
    c.fill();
    c.strokeStyle = "green";
    c.stroke();
}
function drawbullet(x,y){
    c.beginPath();
    c.arc(x,y,bulletsize,0,2*Math.PI,false);
    c.fillStyle = "brown";
    c.fill();
    c.strokeStyle = "black";
    c.stroke();
}
function drawdecryptedshard(x,y){
    c.beginPath();
    c.arc(x,y,shardsize,0,2*Math.PI,false);
    c.fillStyle = "red";
    c.fill();
    c.strokeStyle = "black  ";
    c.stroke();
}
function drawaurex(x,y){
    c.beginPath();
    c.arc(x+tilesize/2,y+tilesize/2,aurexsize,0,2*Math.PI,false);
    c.fillStyle = "rgba(0,0,0,0.5)";
    c.fill();
    c.strokeStyle = "black";
    c.stroke();
}
function createKey(){
    let keyx = Math.random()*rectlength*9/10+50;
    let keyy = Math.random()*rectheight*9/10+50;
    let key = new Key(keyx,keyy);
    keyarray.push(key);
}
function drawkey(x,y){
    c.beginPath();
    c.arc(x,y,keysize,0,2*Math.PI,false);
    c.fillStyle = "blue";
    c.fill();
    c.strokeStyle = "black";
    c.stroke();
}
function createbullet(x,y){
    let angle = Math.atan2(y-playerlol.y,x-playerlol.x);
    let dx = bulletspeed*Math.cos(angle);
    let dy = bulletspeed*Math.sin(angle);
    let bully = new Bullet(playerlol.x,playerlol.y,dx,dy);
    bulletarray.push(bully);
    console.log(bulletarray);
}
function buildingontop(x, y, size, isbullet) {
    for (let block of blockarray) {
        for (let i = 0; i < block.buildingdata.length; i++) {
            let [localBX, localBY, bW, bH] = block.buildingdata[i];
            let bX = block.x + localBX;
            let bY = block.y + localBY;
            if (x+size>bX&& x-size<bX+bW&&y-size<bY+bH&&y+size>bY) {
                if(isbullet){
                    if(Math.random()<0.1){
                        block.buildingdata.splice(i, 1);
                        }
                }
                return true;
            }
        }
    }
    return false;
}
function buildingonbottom(x, y, size, isbullet) {
    for (let block of blockarray) {
        for (let i = 0; i < block.buildingdata.length; i++) {
            let [localBX, localBY, bW, bH] = block.buildingdata[i];
            let bX = block.x + localBX;
            let bY = block.y + localBY;

            if (x + size > bX && x - size < bX + bW &&
                y + size > bY && y - size < bY + bH) {
                if (isbullet) {
                    if(Math.random()<0.1){
                        block.buildingdata.splice(i, 1);
                        }
                }
                return true;
            }
        }
    }
    return false;
}
function buildingonleft(x, y, size, isbullet) {
    for (let block of blockarray) {
        for (let i = 0; i < block.buildingdata.length; i++) {
            let [localBX, localBY, bW, bH] = block.buildingdata[i];
            let bX = block.x + localBX;
            let bY = block.y + localBY;

            if (x - size < bX + bW && x + size > bX &&
                y + size > bY && y - size < bY + bH) {
                if(isbullet){
                    if(Math.random()<0.1){
                        block.buildingdata.splice(i, 1);
                        }
                    }
                return true;
            }
        }
    }
    return false;
}
function buildingonright(x, y, size, isbullet) {
    for (let block of blockarray) {
        for (let i = 0; i < block.buildingdata.length; i++) {
            let [localBX, localBY, bW, bH] = block.buildingdata[i];
            let bX = block.x + localBX;
            let bY = block.y + localBY;

            if (x + size > bX && x - size < bX + bW &&
                y + size > bY && y - size < bY + bH) {
                if (isbullet) {
                    if(Math.random()<0.1){
                    block.buildingdata.splice(i, 1);
                    }
                }
                return true;
            }
        }
    }
    return false;
}
function insideSurveillanceTower(x,y){
    for(block of blockarray){
        if(block.buildingdata.length!==0){
        let blockcenterx = block.x + block.size/2;
        let blockcentery = block.y + block.size/2;
        let distance = Math.sqrt((y-blockcentery)**2 + (x-blockcenterx)**2);
        let angle = Math.atan2(y-blockcentery,x-blockcenterx);
        if (distance <= block.size / Math.sqrt(2) &&
            angleInRange(angle, block.towerangle, block.towerangle + Math.PI / 4)) {
            return true;
        }
    }
    }
    return false;
}
function insideCentralHub(x,y){
    if(x>centralhub.x && x<centralhub.x + centralhub.size && y>centralhub.y && y<centralhub.y +centralhub.size){
        return true;
    }
    return false;
}
function insideBaseStation(x,y){
    if(x>basestation.x && x<basestation.x + basestation.size && y>basestation.y && y<basestation.y +basestation.size){
        return true;
    }
    return false;
}
function spawnDecryptedShard(value){
    let x = centralhub.x + Math.random()*(tilesize-shardsize) + shardsize;
    let y = centralhub.y + Math.random()*(tilesize-shardsize) + shardsize;
    let decryptedshard = new DecryptedShard(x,y,value);
    decryptedshardarray.push(decryptedshard);
}
function angleInRange(angle, start, end) {
    angle = (angle + Math.PI * 2) % (Math.PI * 2);
    start = (start + Math.PI * 2) % (Math.PI * 2);
    end = (end + Math.PI * 2) % (Math.PI * 2);

    if (start < end) {
        return angle >= start && angle <= end;
    } else {
        return angle >= start || angle <= end;
    }
}
function death(){
    alert("Game Over! You died. LOSER!");
    lose = true;
    location.reload();
}
function drawPlayerHealthBar(health, maxHealth) {
    let barWidth = 100;
    let barHeight = 10;
    let x = canvas.width - barWidth - 20; 
    let y = 20; 

    c.fillStyle = "gray";
    c.fillRect(x, y, barWidth, barHeight);

    c.fillStyle = "green";
    c.fillRect(x, y, (health / maxHealth) * barWidth, barHeight);

    c.strokeStyle = "black";
    c.strokeRect(x, y, barWidth, barHeight);
}
function drawBaseHealthBar(health, maxHealth) {
    let barWidth = 100;
    let barHeight = 10;
    let x = canvas.width - barWidth - 20; 
    let y = 50; 

    c.fillStyle = "gray";
    c.fillRect(x, y, barWidth, barHeight);

    c.fillStyle = "blue";
    c.fillRect(x, y, (health / maxHealth) * barWidth, barHeight);

    c.strokeStyle = "black";
    c.strokeRect(x, y, barWidth, barHeight);
}
function collisionWithDecryptedShard(x,y){
    for(i=0;i<decryptedshardarray.length;i+=1){
        let shardx = decryptedshardarray[i].x;
        let shardy = decryptedshardarray[i].y;
        distance = Math.sqrt((y-shardy)**2 + (x-shardx)**2);
        if(distance <= playersize-shardsize+5){
            playerlol.decryptedshardvalue += decryptedshardarray[i].value;
            decryptedshardarray.splice(i, 1);
            return true;
        }
    }
    return false;
}
function collisionWithKey(x,y){
    for(i=0;i<keyarray.length;i+=1){
        let keyx = keyarray[i].x;
        let keyy = keyarray[i].y;
        distance = Math.sqrt((y-keyy)**2 + (x-keyx)**2);
        if(distance <= playersize-keysize+5){
            keyarray.splice(i, 1);
            return true;
        }
    }
    return false;
}
function collisionWithAurex(x,y){
    let aurexx = basestation.x + tilesize/2;
    let aurexy = basestation.y + tilesize/2;
    let distance = Math.sqrt((y-aurexy)**2 + (x-aurexx)**2);
    if(distance <= aurexsize+playersize){
        return true;
    }
    return false;
}
function drawData(){
    const x = 10, y = 10;
    const padding = 0.1 * databoxy; 
    const lineHeight = databoxy / 6; 
    const fontSize = databoxy / 8;
    c.beginPath();
    c.roundRect(10, 10, databoxx, databoxy, 5);
    c.fillStyle = "rgba(0,0,0,0.5)";
    c.fill();
    c.strokeStyle = "cyan";
    c.stroke();

    c.fillStyle = "cyan";
    c.font = `${fontSize}px monospace`;

    const textX = x + 0.05 * databoxx; // 5% horizontal padding
    let textY = y + padding + fontSize;

    // Draw 4 lines of text
    c.fillText(`Keys: ${playerlol.keys}`, textX, textY);
    textY += lineHeight;
    c.fillText(`Decrypted Shards: ${playerlol.decryptedshards}`, textX, textY);
    textY += lineHeight;
    c.fillText(`Mined Shards: ${centralhub.shardvalues}`, textX, textY);
    textY += lineHeight;
    c.fillText(`Score: ${playerlol.deliveredshards}`, textX, textY);
    textY += lineHeight;
    c.fillText(`Highscore: ${highscore}`, textX, textY)
}    
function drawButtons() {
        let fontsize = buttonheight/1.7;
        let paddingleft = 0.1*buttonwidth;
        let paddingtop = 0.05*buttonheight;
        let x = midbuttonx;
        let y = rectheight - buttonheight - 20;
        //pause
        c.beginPath();
        c.roundRect(x-buttonwidth-spacing,y,buttonwidth,buttonheight,4);
        c.fillStyle = "rgba(0,0,0,0.5)";
        c.fill();
        c.strokeStyle = "cyan";
        c.stroke();
        c.fillStyle = "cyan";
        c.font = `${fontsize}px monospace`;
        c.fillText(`Pause`, x-buttonwidth-spacing+paddingleft, y+fontsize+paddingtop);
        //resume
        c.beginPath();
        c.roundRect(x,y,buttonwidth,buttonheight,4);
        c.fillStyle = "rgba(0,0,0,0.5)";
        c.fill();
        c.strokeStyle = "cyan";
        c.stroke();
        c.fillStyle = "cyan";
        c.font = `${fontsize}px monospace`;
        c.fillText(`Resume`, x+paddingleft, y+fontsize+paddingtop);
        //reset
        c.beginPath();
        c.roundRect(x+buttonwidth+spacing,y,buttonwidth,buttonheight,4);
        c.fillStyle = "rgba(0,0,0,0.5)";
        c.fill();
        c.strokeStyle = "cyan";
        c.stroke();
        c.fillStyle = "cyan";
        c.font = `${fontsize}px monospace`;
        c.fillText(`Reset`, x+buttonwidth+spacing+paddingleft, y+fontsize+paddingtop);
}
//objects
function Block(x,y,size){
    this.x = x;
    this.y = y;
    this.size = size;
    this.buildingdata = [];
    this.towerangle = Math.random()*Math.PI*2;;

    this.generatebuildings = function(){
        let numberOfBuildings = Math.floor(Math.random()*5 + 2);
        for(k=0;k<numberOfBuildings;k+=1){
            let buildingx = Math.floor(Math.random()*2*tilesize/3);
            let buildingy = Math.floor(Math.random()*2*tilesize/3);
            let buildingWidth = Math.min((tilesize/50)*6*(Math.floor(Math.random()*5)+2),this.size - buildingx);
            let buildingHeight = Math.min((tilesize/10)*(Math.floor(Math.random()*5)+2),this.size-buildingy);
            this.buildingdata.push([buildingx,buildingy,buildingWidth,buildingHeight]);
        }
    }
    this.draw = function(){
        if(this.buildingdata.length!==0){
        drawsurveillancetower(this.x+this.size/2,this.y+this.size/2,this.size/Math.sqrt(2),this.towerangle,this.towerangle+Math.PI/4);
        }
    }
    this.update = function(){
        this.towerangle+=Math.PI/180;
        this.draw();
    }
}
function BaseStation(x,y,size){
    this.x = x;
    this.y = y;
    this.health = 100;
    this.size = size;
    this.draw = function(){
        drawbox(this.x,this.y,this.size,this.size,"black","lightgreen");
        drawaurex(this.x,this.y);
    }
}
function CentralHub(x,y,size){
    this.x = x;
    this.y = y;
    this.size = size;
    this.shards = 5;
    this.shardvalues = [];
    this.keys = 0;
    this.processpercent = 0;
    this.decryptedshardvalues = []
    //shardvalues initialization
    for (let i = 0; i < this.shards; i++) {
        this.shardvalues.push(Math.floor(Math.random() * 4) + 1); // values 1–4
    }
    console.log(this.shardvalues);
    this.draw = function(){
        drawbox(this.x,this.y,this.size,this.size,"black","cyan");
        c.fillStyle = "black";
        c.font = `${this.size/10}px monospace`;
        c.fillText(`${this.keys}`, this.x+5, this.y+this.size/10);
        drawring(this.x+this.size/2,this.y+this.size/2,this.processpercent,this.size/4);
    }
    this.process = function(){
        const requiredKeys = this.shardvalues[0];
        if(this.keys>=requiredKeys){
            this.processpercent+=1;
            if(this.processpercent===100){
                spawnDecryptedShard(requiredKeys);
                this.shardvalues.shift();
                this.shardvalues.push(Math.floor(Math.random() * 4) + 1);
                console.log(this.shardvalues);
                this.keys -= requiredKeys;
                this.processpercent = 0;
                
            }
        }
    }
}
function Player(x,y){
    this.x = x;
    this.y = y;
    this.health = 100;
    this.decryptedshards = 0;
    this.decryptedshardvalue = [];
    this.keys = 0;
    this.deliveredshards = 0;
    this.draw = function(){
        drawplayer(this.x,this.y);
    }
    this.update = function(){
        //movement
        const speed = 3;
        if ((keys["w"] || keys["arrowup"])&&!buildingontop(this.x,this.y-speed,playersize,false)) {
            if(!(this.y-speed<playersize)){
                this.y -= speed;
            }
        }
        if ((keys["s"] || keys["arrowdown"])&&!buildingonbottom(this.x,this.y+speed,playersize,false)) {
            if(!(this.y+speed>rectheight-playersize)){
                this.y += speed;
            }
        }
        if ((keys["a"] || keys["arrowleft"])&&!buildingonleft(this.x-speed,this.y,playersize,false)) {
            if(!(this.x-speed<playersize)){
                this.x -= speed;
            }
        }
        if ((keys["d"] || keys["arrowright"])&&!buildingonright(this.x+speed,this.y,playersize,false)) {
            if(!(this.x+speed>rectlength-playersize)){
                this.x += speed;
            }
        }
        //health
        if(insideSurveillanceTower(this.x,this.y)){
            this.health -= 1;
            if(this.health===0){
                death();
            }
        }
        //pickup system
        if(insideCentralHub(this.x,this.y)){
            centralhub.keys += this.keys;
            this.keys = 0;
        }
        if(collisionWithKey(this.x,this.y)){
            createKey();
            this.keys+=1;
        }
        if(collisionWithDecryptedShard(this.x,this.y)){
            this.decryptedshards += 1;
        }
        if(insideBaseStation(this.x,this.y)){
            if(this.health<=99.98){
            this.health += 0.2;
            }
        if(collisionWithAurex(this.x,this.y)){
            basestation.health += this.decryptedshardvalue*10;
            if(basestation.health>100){
                basestation.health = 100;
            }
            this.deliveredshards += this.decryptedshards;
            this.decryptedshards = 0;
            this.decryptedshardvalue = 0;
        }
    }
        this.draw();
    }  
}
function Bullet(x,y,dx,dy){
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.distance = 0;
    this.draw = function(){
        drawbullet(this.x,this.y);
    }
    this.update = function(){
        this.distance += 1;
        console.log(this.distance);
        if (buildingontop(this.x, this.y - this.dy, bulletsize,true) || 
        buildingonbottom(this.x, this.y + this.dy, bulletsize,true)) {
        this.dy*=0.5;
        this.dy *= -1;
        }
        if (buildingonleft(this.x - this.dx, this.y, bulletsize,true) || 
        buildingonright(this.x + this.dx, this.y, bulletsize,true)) {
        this.dx*=0.5;
        this.dx *= -1;
        }
        this.y += this.dy;
        this.x += this.dx;
        this.draw();
    }

}
function DecryptedShard(x,y,value){
    this.x = x;
    this.y = y;
    this.value = value;
    this.draw = function(){
        drawdecryptedshard(this.x,this.y);
    }
}
function Key(x,y){
    this.x=x;
    this.y=y;
    this.draw = function(){
        drawkey(this.x,this.y);
    }
}


//random initialization
var decryptedshardarray = [];
var keyarray = [];
let numberOfKeys = 10;
for(i=0;i<numberOfKeys;i+=1){
    createKey();
}

var blockarray = [];
for(let i=0;i<tilesx;i++){
    for(let j=0;j<tilesy;j++){
        let temp1 = rectstartx+i*(tilesize+roadsize);
        let temp2 = rectstarty+j*(tilesize+roadsize);   
        if(i===centralx && j === centraly){
            centralhub = new CentralHub(temp1,temp2,tilesize);
            centralhub.draw();
            continue;
        }
        if(i===basex&&j===basey){
            basestation = new BaseStation(temp1,temp2,tilesize);
            basestation.draw();
            playerlol = new Player(temp1+tilesize/2,temp2+tilesize/2);
            playerlol.draw();
            continue;
        } 
        let block = new Block(temp1,temp2,tilesize);
        block.generatebuildings();
        drawbox(block.x, block.y, block.size, block.size, "black", "green");
        for (let b of block.buildingdata) {
            drawbox(block.x + b[0], block.y + b[1], b[2], b[3], "black", "black");
        }
        blockarray.push(block);
        block.draw();
    }
}
for(i=1;i<tilesx;i+=1){
        let temp1 = rectstartx+i*(tilesize+roadsize)-roadsize/2;
        c.beginPath();
        c.moveTo(temp1,rectstarty);
        c.lineTo(temp1,rectstarty+rectheight);
        c.strokeStyle = "black";
        c.stroke();
    }
for(j=1;j<tilesy;j+=1){
    let temp2 = rectstarty+j*(tilesize+roadsize)-roadsize/2;
    c.beginPath();
        c.moveTo(rectstartx,temp2);
        c.lineTo(rectstartx+rectlength,temp2);
        c.strokeStyle = "black";
        c.stroke();
    }

//bullets
let bulletarray = [];


//updating
function update() {
if(!lose && !paused){
    c.clearRect(0, 0, canvas.width, canvas.height);
    //drawing map
    basestation.draw();
    centralhub.draw();
    centralhub.process();
    for (let block of blockarray) {
        drawbox(block.x, block.y, block.size, block.size, "black", "green");
        for (let b of block.buildingdata) {
            drawbox(block.x + b[0], block.y + b[1], b[2], b[3], "black", "black");
        }
    }
    for(let i=1;i<tilesx;i++){
        let temp1 = rectstartx + i * (tilesize + roadsize) - roadsize/2;
        c.beginPath();
        c.moveTo(temp1, rectstarty);
        c.lineTo(temp1, rectstarty + rectheight);
        c.strokeStyle = "black";
        c.stroke();
    }
    for(let j=1;j<tilesy;j++){
        let temp2 = rectstarty + j * (tilesize + roadsize) - roadsize/2;
        c.beginPath();
        c.moveTo(rectstartx, temp2);
        c.lineTo(rectstartx + rectlength, temp2);
        c.strokeStyle = "black";
        c.stroke();
    }
    //player
    playerlol.update();
    //decrypted shards (not picked up)
    for(decryptedshard of decryptedshardarray){
        decryptedshard.draw();
    }
    //keys
    for(key of keyarray){
        key.draw();
    }
    //surveillance towers
    for (let block of blockarray) {
        block.update();
    }
    for(i=0; i<bulletarray.length;i+=1){
        bulletarray[i].update();
        if(bulletarray[i].distance >= 500){
            bulletarray.splice(i, 1);
        }
    }
    //health bars
    drawPlayerHealthBar(playerlol.health, 100);
    drawBaseHealthBar(basestation.health,100);
    if(basestation.health>0){
        basestation.health -= 0.05;
        if(basestation.health <1 && !lose){
            window.alert("System health dropped to 0. You lose!!!");
            lose = true;
            location.reload();
        }
    }
    //data thing
    highscore = localStorage.getItem("highscore");  
    if(playerlol.deliveredshards > highscore){
        localStorage.setItem("highscore",playerlol.deliveredshards);
    }
    drawData();
    //time control
}
    drawButtons();
    requestAnimationFrame(update);
}
update();



window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});
window.addEventListener('click', function(event) {
    const x = event.x;
    const y = event.y;

    const buttonY = rectheight - buttonheight - 20;
    const pauseX = midbuttonx - buttonwidth - spacing;
    const resumeX = midbuttonx;
    const resetX = midbuttonx + buttonwidth + spacing;

    const insidePause = x > pauseX && x < pauseX + buttonwidth &&
                        y > buttonY && y < buttonY + buttonheight;
    const insideResume = x > resumeX && x < resumeX + buttonwidth &&
                         y > buttonY && y < buttonY + buttonheight;
    const insideReset = x > resetX && x < resetX + buttonwidth &&
                        y > buttonY && y < buttonY + buttonheight;

    if (insidePause) {
        console.log('hi');
        paused = true;
    } 
    else if (insideResume) {
        paused = false;
    } 
    else if (insideReset) {
        location.reload();
    } else {
        createbullet(x, y);
    }
});