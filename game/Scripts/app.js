
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
ctx.textBaseline = "middle";

//game parameters
const cvWidth = canvas.width;
const cvHeight = canvas.height;
const paddleSpeed = 0.7;
const ballSpeed = 0.5;
const ballSpin = 0.25;


//dimensions 

const paddleHeight = 18;
const paddleWidth = 120;
const brickRows = 3;
const brickCols = 10;
const ballSize = 20;
const brickGap = 5;
const margin = 3;
const textMargin = 7;

//game objects 

let paddle, ball;
let bricks = [];

//game variables

let level, lives, score, highScore;
let timeDelta, timeLast;
let gameOver, win;
let brickNumber;


//definitions 

const maxLevel = 5;
const gameLives = 3;
const keyScore = "highscore"; // save key for local storage of high score
const colorText = "#B22222";
const Direction = {
    left: 1,
    right: 2,
    stop: 3
};


// text 

const textFont = "Freckle Face, cursive";
const textLevel = "Level";
const textLives = "Lives";
const textScore = "Score";
const textBest = "Best";
const textGameOver = "GAME OVER";
const textWin = "You won!!";
let textSize;


// sounds 

let fxBrick = new Audio("Sounds/brick.m4a");
let fxWall = new Audio("Sounds/wall.m4a");
let fxPaddle = new Audio("Sounds/paddle.m4a");




function Paddle() {
    this.image = document.getElementById("paddle");
    this.width = paddleWidth;
    this.height = paddleHeight;
    this.x = cvWidth / 2;
    this.y = cvHeight - this.height - 20;
    this.xv = 0; // moving along x 
    this.speed = paddleSpeed * cvWidth;

}



function Ball() {
    this.image = document.getElementById("ball");
    this.width = ballSize;
    this.height = ballSize;
    this.x = paddle.x;
    this.y = paddle.y - paddle.height / 2 - this.height / 2;
    this.xv = 0; // moving along x 
    this.yv = 0; // moving along y
    this.speed = ballSpeed * cvWidth;

}

function Brick(left, top, w, h, score) {
    this.image = document.getElementById("brick");
    this.width = w;
    this.height = h;
    this.bottom = top + h;
    this.left = left;
    this.right = left + w;
    this.top = top;
    this.score = score;

    this.intersect = function (ball) {

        let ballBottom = ball.y + ball.height / 2;
        let ballLeft = ball.x - ball.width / 2;
        let ballRight = ball.x + ball.width / 2;
        let ballTop = ball.y - ball.height / 2;

        return this.left < ballRight
            && ballLeft < this.right
            && this.bottom > ballTop
            && ballBottom > this.top;

    }
}





function getTimeDifference(timeNow) {
    if (!timeLast) {
        timeLast = timeNow;
    }
    //calculate the time difference 
    timeDelta = (timeNow - timeLast) / 1000; // get seconds
    timeLast = timeNow;
}


function drawBackground() {

    const backgroundImage = document.getElementById("yellow");
    ctx.drawImage(backgroundImage, 0, 0, cvWidth, cvHeight);

}


function drawPaddle() {
    ctx.drawImage(
        paddle.image,
        paddle.x - paddle.width / 2,
        paddle.y,
        paddle.width,
        paddle.height
    );
}

function drawBall() {
    ctx.drawImage(
        ball.image,
        ball.x - ball.width / 2,
        ball.y,
        ball.width,
        ball.height
    )
}



function drawBrick() {
    for (let row of bricks) {
        for (let brick of row) {
            if (brick == null) {
                continue;
            }
            ctx.drawImage(
                brick.image,
                brick.left,
                brick.top,
                brick.width,
                brick.height,
            )
        }
    }
}


function drawText() {

    ctx.fillStyle = colorText;


    let labelSize = textSize / 2;
    let margin = 20;
    let maxWidth = cvWidth - margin * 2;
    let maxWidthCol1 = maxWidth * 0.3;
    let maxWidthCol2 = maxWidth * 0.2;
    let maxWidthCol3 = maxWidth * 0.2;
    let maxWidthCol4 = maxWidth * 0.3;

    let col1x = margin;
    let col2x = cvWidth * 0.4;
    let col3x = cvWidth * 0.6;
    let col4x = cvWidth - margin;

    let yLabel = textMargin + labelSize;
    let yValue = yLabel + textSize * 0.7;


    // draw score labels

    ctx.font = labelSize + "px " + textFont;
    ctx.textAlign = "left";
    ctx.fillText(textScore, col1x, yLabel, maxWidthCol1);
    ctx.textAlign = "center";
    ctx.fillText(textLives, col2x, yLabel, maxWidthCol2);
    ctx.fillText(textLevel, col3x, yLabel, maxWidthCol3);
    ctx.textAlign = "right";
    ctx.fillText(textBest, col4x, yLabel, maxWidthCol4);



    // draw score values 

    ctx.font = labelSize + "px " + textFont;
    ctx.textAlign = "left";
    ctx.fillText(score, col1x, yValue, maxWidthCol1);
    ctx.textAlign = "center";
    ctx.fillText(lives + "/" + gameLives, col2x, yValue, maxWidthCol2);
    ctx.fillText(level, col3x, yValue, maxWidthCol3);
    ctx.textAlign = "right";
    ctx.fillText(highScore, col4x, yValue, maxWidthCol4);


    DrawGameOverText();

}

function DrawGameOverText() {

    if (gameOver) {
        let text;
        if (win) {
            text = textWin;
        }
        else {
            text = textGameOver;
        }
        ctx.font = 50 + "px " + textFont;
        ctx.textAlign = "center";
        ctx.fillText(text, cvWidth / 2, cvHeight / 2);
    }
}

function updateBall(delta) {

    ball.x += ball.xv * delta;
    ball.y += ball.yv * delta;


    BounceOffWall();
    BounceOffPaddle();

    if (ball.y > cvHeight) {

        outOfBounds();
    }

    MoveStationaryBall();
}



function MoveStationaryBall() {
    if (ball.yv == 0) {
        ball.x = paddle.x;
    }
}



function serveBall() {

    if (ball.yv != 0) {
        return;
    }

    let angle = Math.random() * Math.PI / 2 + Math.PI / 4;
    applyBallSpeed(angle);
    fxPaddle.play();

}


function applyBallSpeed(angle) {

    ball.xv = ball.speed * Math.cos(angle);
    ball.yv = -ball.speed * Math.sin(angle);
}

function BounceOffWall() {

    if (ball.x < ball.width / 2) {
        ball.x = ball.width / 2;
        ball.xv = -ball.xv;
        fxWall.play();
        spinBall();
    }
    else if (ball.x > cvWidth - ball.width / 2) {
        ball.x = cvWidth - ball.width / 2;
        ball.xv = -ball.xv;
        fxWall.play();
        spinBall();
    }
    else if (ball.y < 0 + ball.height / 2) {
        ball.y = 0 + ball.height / 2;
        ball.yv = -ball.yv;
        fxWall.play();
        spinBall();
    }
}

function BounceOffPaddle() {

    if (ball.y > paddle.y - paddle.height / 2 - ball.height / 2
        && ball.y < paddle.y
        && ball.x > paddle.x - paddle.width / 2 - ball.width / 2
        && ball.x < paddle.x + paddle.width / 2 + ball.width / 2) {
        ball.y = paddle.y - paddle.height / 2 - ball.height / 2;
        ball.yv = -ball.yv;
        fxPaddle.play();
        spinBall();
    }
}




function outOfBounds() {
    lives--;
    if (lives == 0) {
        gameOver = true;
    }
    newBall();
}




function spinBall() {
    //randomize angle spin

    let ballUpwards = ball.yv < 0;
    let angle = Math.atan2(-ball.yv, ball.xv);
    angle += (Math.random() * Math.PI / 2 - Math.PI / 4) * ballSpin;

    if (ballUpwards) {
        if (angle < Math.PI / 6) {
            angle = Math.PI / 6;
        } else if (angle > Math.PI * 5 / 6) {
            angle > Math.PI * 5 / 6;
        }
    } else {
        if (angle > -Math.PI / 6) {
            angle = -Math.PI / 6;
        } else if (angle < -Math.PI * 5 / 6) {
            angle > -Math.PI * 5 / 6;
        }
    }

    applyBallSpeed(angle);
}



function movePaddle(direction) {
    switch (direction) {
        case Direction.left:
            paddle.xv = -paddle.speed;
            break;
        case Direction.right:
            paddle.xv = paddle.speed;
            break;
        case Direction.stop:
            paddle.xv = 0;
            break;
    }
}

function keyDown(event) {
    switch (event.keyCode) {
        case 32:
            serveBall();
            if (gameOver) {
                newGame();
            }
            break;
        case 37:
            movePaddle(Direction.left);
            break;
        case 39:
            movePaddle(Direction.right);
            break;
    }
}


function keyUp(event) {

    switch (event.keyCode) {
        case 37:
            if (paddle.xv < 0) {
                movePaddle(Direction.stop);
            }
            break;
        case 39:
            if (paddle.xv > 0) {
                movePaddle(Direction.stop);
            }
            break;
    }
}


function updatePaddle(delta) {
    paddle.x += paddle.xv * delta;


    if (paddle.x < paddle.width / 2) {
        paddle.x = paddle.width / 2;
    } else if (paddle.x > cvWidth - paddle.width / 2) {
        paddle.x = cvWidth - paddle.width / 2
    }
}




function createBricks() {

    // row dimensions
    let minY = 0;
    let maxY = ball.y - ball.height * 5.5;
    let totalSpaceY = maxY - minY;
    let totalRows = margin + brickRows + maxLevel * 2;
    let rowH = totalSpaceY / totalRows;
    let gap = brickGap;
    let h = rowH - gap;

    textSize = rowH * margin / 2;


    // col dimensions
    let totalSpaceX = cvWidth - 40;
    let colW = (totalSpaceX - gap) / brickCols;
    let w = colW - gap;


    //fill bricks array
    bricks = [];
    let cols = brickCols;
    let rows = brickRows + level;
    let left, top, score;
    brickNumber = cols * rows;

    for (let i = 0; i < rows; i++) {
        bricks[i] = [];
        score = 100;
        top = (margin + i) * rowH;
        for (let j = 0; j < cols; j++) {
            left = gap + j * colW + 20;
            bricks[i][j] = new Brick(left, top, w, h, score)

        }
    }
}



function updateBricks(delta) {

    //check collision 

    allLOOPS: for (let i = 0; i < bricks.length; i++) {
        for (let j = 0; j < brickCols; j++) {
            if (bricks[i][j] != null && bricks[i][j].intersect(ball)) {
                updateScore(bricks[i][j].score);
                bricks[i][j] = null;
                ball.yv = -ball.yv;
                spinBall();
                brickNumber--;
                fxBrick.play();
                break allLOOPS;
            }
        }
    }
    // check next level

    if (brickNumber == 0) {
        if (level < maxLevel) {
            level++;
            newLevel();
        } else {
            gameOver = true;
            win = true;
            newBall();
        }
    }
}

function updateScore(brickScore) {
    score += brickScore;


    if (score > highScore) {
        highScore = score;
        localStorage.setItem(keyScore, highScore);
    }
}


function newBall() {
    paddle = new Paddle();
    ball = new Ball();
}


function newGame() {


    gameOver = false;
    lives = gameLives;
    level = 1;
    score = 0;
    win = false;

    GetHighScore();
    initEventListeners();
    newLevel();

}


function GetHighScore() {
    let scoreString = localStorage.getItem(keyScore);
    if (scoreString == null) {
        highScore = 0;
    }
    else {
        highScore = parseInt(scoreString);
    }
}

function newLevel() {

    newBall();
    createBricks();

}


function initEventListeners() {
    
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    // mouse move
    canvas.addEventListener('mousemove', function (event) {
        paddle.x = event.offsetX;
    }); 
}



function loop(timeNow) {

    ctx.clearRect(0, 0, cvWidth, cvHeight);
    getTimeDifference(timeNow);

    //update

    if (!gameOver) {

        updatePaddle(timeDelta);
        updateBall(timeDelta);
        updateBricks(timeDelta);
    };

    //draw
    drawBackground();
    drawPaddle();
    drawBrick();
    drawText();
    drawBall();

    requestAnimationFrame(loop);

}

newGame();
requestAnimationFrame(loop);


