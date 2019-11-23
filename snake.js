const pixelWidth = 20,
    pixelsX = 40,
    pixelsY = 20;

var snake = {
    direction:[1,0],
    length:2,
    coords:[[Math.floor(pixelsX/2),Math.floor(pixelsY/2)],[Math.floor(pixelsX/2)+1,Math.floor(pixelsY/2)]]
}

coordToIndex = ([x, y]) => pixelsX * y + x;
indexToCoord = i => [i % pixelsX, Math.floor(i/pixelsX)];

function setFood() {
    var emptyPixelIndices = d3.range(pixelsX*pixelsY).filter(d => !snake.coords.map(coordToIndex).includes(d));
    foodLocationIndex = emptyPixelIndices[Math.floor(Math.random()*emptyPixelIndices.length)];
    return indexToCoord(foodLocationIndex)
}

food = setFood();

body = d3.select("#body")

svg = body.append("svg")
    .attr("width", pixelWidth * pixelsX)
    .attr("height", pixelWidth * pixelsY)

bg = svg.append("g")
fg = svg.append("g")

d3.range(pixelsX).forEach(x => d3.range(pixelsY).forEach(y => 
        bg.append("rect")
            .attr("x", pixelWidth*x + 1)
            .attr("y", pixelWidth*y + 1)
            .attr("width", pixelWidth - 2)
            .attr("height", pixelWidth - 2)
            .attr("class", "pixel")
    )
)

function drawScreen() {
    // draw snake
    fg.selectAll(".snake").data(snake.coords, d => coordToIndex(d))
    .join(enter => enter.append("rect")
        .attr("class","snake")
        .attr("x", d => pixelWidth*d[0] + 1)
        .attr("y", d => pixelWidth*d[1] + 1)
        .attr("width", pixelWidth - 2)
        .attr("height", pixelWidth - 2),
        update => update,
        exit => exit.remove()
    )

    fg.selectAll(".food").data([food], d => coordToIndex(d))
    .join(enter => enter.append("rect")
        .attr("class","food")
        .attr("x", d => pixelWidth*d[0] + 1)
        .attr("y", d => pixelWidth*d[1] + 1)
        .attr("width", pixelWidth - 2)
        .attr("height", pixelWidth - 2),
        update => update,
        exit => exit.remove()
    )
}

d3.select("body").on("keydown", function(d) {
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(d3.event.key) && !pause) {
        keyBuffer.push(d3.event.key)
    }

    if (d3.event.key == "Escape" || d3.event.key.toLowerCase() == "p") {
        pause = !pause; 
        if (!pause) { play(); } 

    }
})

function play() {
    if (alive) {
        if (keyBuffer.length > 0) {
            key = keyBuffer[0];
            keyBuffer = keyBuffer.slice(1);

            if (key == "ArrowUp" && snake.direction[1] != 1) { snake.direction = [0,-1]; }
            if (key == "ArrowDown" && snake.direction[1] != -1) { snake.direction = [0,1]; }
            if (key == "ArrowLeft" && snake.direction[0] != 1) { snake.direction = [-1,0]; }
            if (key == "ArrowRight" && snake.direction[0] != -1) { snake.direction = [1,0]; }
        }


        // calculate snake's next position
        currentPos = snake.coords[snake.coords.length - 1];
        nextPos = [currentPos[0] + snake.direction[0], currentPos[1] + snake.direction[1]];

        // check if nextPos is outside of game area or hits snake
        if (nextPos[0] < 0 || nextPos[0] > pixelsX - 1 || nextPos[1] < 0 || nextPos[1] > pixelsY - 1 || snake.coords.map(coordToIndex).includes(coordToIndex(nextPos))) { 
            alive = false; 
            endGame();
        } else {
            snake.coords.push(nextPos)

            // check if nextPos is food
            if (coordToIndex(food) === coordToIndex(nextPos)) {
                food = setFood();
            } else {
                snake.coords = snake.coords.slice(1);
            }
            drawScreen();
            if (!pause) { setTimeout(play, 100); }
        }
    }
}

function endGame() {
    fg.selectAll(".snake").data([])
        .exit()
        .transition()
        .duration(1000)
        .attr("width", 0)
        .attr("height", 0)
        .attr("transform", `translate(${pixelWidth/2},${pixelWidth/2})`)
        .call(() => {
            snake = {
                direction:[1,0],
                length:2,
                coords:[[Math.floor(pixelsX/2),Math.floor(pixelsY/2)],[Math.floor(pixelsX/2)+1,Math.floor(pixelsY/2)]]
            }
            setTimeout(() => {alive = true; play();}, 1250);
        })
}

var alive = true,
    pause = false,
    keyblock = false;

var keyBuffer = [];

play();

