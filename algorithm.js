const canvas = document.getElementById('board');
const context = canvas.getContext("2d");
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const MARGIN = 16;
const NODE_SIZE = 25;

let BOARD_NODES = [];
let WALLS = [];
let isMouseDown = false;
let isMovingStartNode = false;
let isMovingEndNode = false;
let isDrawingWall = false;
let isRemovingWall = false;

const Status = {
    EMPTY: 'EMPTY',
    WALL: 'WALL',
    START: 'START',
    END: 'END',
    PATH: 'PATH',
    VISITED: 'VISITED'
}

class Node {
    constructor(x, y, size, status) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.status = status;
        this.f = Infinity;
        this.g = Infinity;
        this.h = Infinity;
        this.d = Infinity;
        this.parent = null;
    }

    clearParams(){
        this.f = Infinity;
        this.g = Infinity;
        this.h = Infinity;
        this.d = Infinity;
        this.parent = null;
    }

    animateNode() {
        if (this.size < NODE_SIZE) {
            this.size += 1;
        }
        this.drawNode();
    }

    drawNode() {
        context.beginPath();
        switch (this.status) {
            case Status.START:
                context.fillStyle = "green";
                break;
            case Status.END:
                context.fillStyle = "red";
                break;
            case Status.WALL:
                context.fillStyle = "black";
                break;
            case Status.PATH:
                context.fillStyle = "yellow";
                break;
            default:
                context.fillStyle = "white";
        }
        context.fillRect(this.x, this.y, this.size, this.size);
        context.rect(this.x, this.y, this.size, this.size);
        context.closePath();
        context.stroke();
    }
}

class Board {
    createBoard() {
        for (let y = 0; y < CANVAS_HEIGHT / NODE_SIZE; y++) {
            const row = [];
            for (let x = 0; x < CANVAS_WIDTH / NODE_SIZE; x++) {
                const node = new Node(x * NODE_SIZE, y * NODE_SIZE, NODE_SIZE, Status.EMPTY);
                node.drawNode();
                row.push(node);
            }
            BOARD_NODES.push(row);
        }
    }

    addWall(x, y) {
        const node = new Node(Math.floor(x / NODE_SIZE) * NODE_SIZE, Math.floor(y / NODE_SIZE) * NODE_SIZE, 0, Status.WALL);
        if (BOARD_NODES[node.y / NODE_SIZE][node.x / NODE_SIZE].status === Status.EMPTY) {
            this.addWallAnimation(node);
        }
    }

    removeWall(x, y) {
        const node = new Node(Math.floor(x / NODE_SIZE) * NODE_SIZE, Math.floor(y / NODE_SIZE) * NODE_SIZE, NODE_SIZE, Status.EMPTY);
        if (BOARD_NODES[node.y / NODE_SIZE][node.x / NODE_SIZE].status === Status.WALL) {
            this.addNode(node);
            WALLS = WALLS.filter(i => i.x !== node.x && y !== node.y);
        }
    }

    addWallAnimation(node) {
        WALLS.push(node);
        this.addNode(node);
    }

    addNode(node) {
        BOARD_NODES[node.y / NODE_SIZE][node.x / NODE_SIZE] = node;
        node.drawNode();
    }

    moveNode(node, x, y) {
        const old = BOARD_NODES[y][x];
        const status = node.status;
        if (old.status !== Status.EMPTY) {
            return;
        }
        old.x = node.x;
        old.y = node.y;
        old.status = Status.EMPTY;
        this.addNode(old);
        node.x = x * NODE_SIZE;
        node.y = y * NODE_SIZE;
        node.status = status;
        this.addNode(node);
    }

    startAction(x, y) {
        if (isMovingStartNode) {
            this.moveNode(startNode, Math.floor(x / NODE_SIZE), Math.floor(y / NODE_SIZE));
        } else if (isMovingEndNode) {
            this.moveNode(finishNode, Math.floor(x / NODE_SIZE), Math.floor(y / NODE_SIZE));
        } else if (isDrawingWall) {
            this.addWall(x, y);
        } else if (isRemovingWall) {
            this.removeWall(x, y);
        } else if (BOARD_NODES[Math.floor(y / NODE_SIZE)][Math.floor(x / NODE_SIZE)].status === Status.START) {
            isMovingStartNode = true;
        } else if (BOARD_NODES[Math.floor(y / NODE_SIZE)][Math.floor(x / NODE_SIZE)].status === Status.END) {
            isMovingEndNode = true;
        } else if (BOARD_NODES[Math.floor(y / NODE_SIZE)][Math.floor(x / NODE_SIZE)].status === Status.WALL) {
            isRemovingWall = true;
        } else {
            isDrawingWall = true;
        }
    }

}

const board = new Board();
const startNode = new Node(3 * NODE_SIZE, 13 * NODE_SIZE, NODE_SIZE, Status.START);
const finishNode = new Node(70 * NODE_SIZE, 13 * NODE_SIZE, NODE_SIZE, Status.END);

initializeBoard();

canvas.addEventListener('mousedown', function (event) {
    isMouseDown = true;
});
canvas.addEventListener('mousemove', function (event) {
    if (isMouseDown) {
        board.startAction(event.x - MARGIN, event.y - MARGIN);
    }
});
canvas.addEventListener('mouseup', function (event) {
    isMouseDown = false;
    isMovingStartNode = false;
    isMovingEndNode = false;
    isDrawingWall = false
    isRemovingWall = false;
});

function clearBoard() {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    BOARD_NODES = [];
    WALLS = [];
    initializeBoard();
}

function clearPath() {
    for (let y = 0; y < CANVAS_HEIGHT / NODE_SIZE; y++) {
        for (let x = 0; x < CANVAS_WIDTH / NODE_SIZE; x++) {
            if (BOARD_NODES[y][x].status === Status.PATH) {
                const node = BOARD_NODES[y][x];
                node.status = Status.EMPTY;
                board.addNode(node);
            }
            BOARD_NODES[y][x].clearParams();
        }
    }
}

function initializeBoard() {
    board.createBoard();
    board.addNode(startNode);
    board.addNode(finishNode);
}

function runAlgorithm() {
    const algorithm = document.getElementById('algo-select').value;
    if (algorithm === "asearch") {
        var pathNodes = Asearch(startNode, finishNode);
        for (var i = 0; i < pathNodes.length - 1; i++) {
            pathNodes[i].status = Status.PATH
            pathNodes[i].drawNode()
        }
    } else {
        var pathNodes = dijkstraSearch(startNode, finishNode);
        for (var i = 1; i < pathNodes.length; i++) {
            pathNodes[i].status = Status.PATH
            pathNodes[i].drawNode()
        }
    }
}


// Algorithms

function distance(node1, node2) {
    return Math.pow(Math.pow(node1.x/NODE_SIZE - node2.x/NODE_SIZE, 2) + Math.pow(node1.y/NODE_SIZE - node2.y/NODE_SIZE, 2), 0.5);
}

function getNeighbors(node) {
    var result = [];
    var x = node.x / NODE_SIZE;
    var y = node.y / NODE_SIZE;

    if (x >= 1) {
        result.push(BOARD_NODES[y][x - 1]);
    }
    if (x + 1 < CANVAS_WIDTH / NODE_SIZE) {
        result.push(BOARD_NODES[y][x + 1]);
    }
    if (y >= 1) {
        result.push(BOARD_NODES[y - 1][x]);
    }
    if (y + 1 < CANVAS_HEIGHT / NODE_SIZE) {
        result.push(BOARD_NODES[y + 1][x]);
    }
    return result;
}

function removeNode(array, node) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === node) {
            array.splice(i, 1)
            break;
        }
    }
}

function findNode(array, node) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === node) {
            return true
        }
    }
    return false
}


function Asearch(start, end) {

    var opened = [];
    var closed = [];
    start.g = 0;
    start.h = distance(start,end);
    start.f = start.g + start.h;
    opened.push(start);
    console.log("Start");
    console.log(Math.floor(start.x/NODE_SIZE),Math.floor(start.y/NODE_SIZE));
    var z = 0;
    while (opened.length > 0) {
        // Choosing the node with lowest f
        var lowInd = 0;
        for (var i = 0; i < opened.length; i++) {
            if (opened[i].f < opened[lowInd].f) {
                lowInd = i;
            }
        }
        var currentNode = opened[lowInd];
        if(z<10){
            console.log(currentNode.x/NODE_SIZE,currentNode.y/NODE_SIZE);
            console.log(currentNode.f);
            z++;
        }
        
        // When endpoint is reached
        if (currentNode.x === end.x && currentNode.y === end.y) {
            var curr = currentNode;
            var result = [];
            while (curr.parent) {
                result.push(curr);
                curr = curr.parent;
            }
            return result.reverse();
        }


        // Removing node from opened

        removeNode(opened, currentNode)

        // Adding node to closed
        closed.push(currentNode);
        // Getting node neighbors
        var neighbors = getNeighbors(currentNode);
        // Adding neighbors to open list and changing f,g and h for them
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];
            if (findNode(closed, neighbor) || neighbor.status === Status.WALL) {
                continue;
            }


            var gScore = currentNode.g + 1;
            // If this g score is the better than previous for this node
            var gScoreIsBest = false;

            // If we visit this node firstly
            if (!findNode(opened, neighbor)) {
                gScoreIsBest = true;
                neighbor.h = distance(neighbor, end);
                opened.push(neighbor);
            } else if (gScore < neighbor.g) {
                gScoreIsBest = true;
            }

            if (gScoreIsBest) {
                neighbor.parent = currentNode;
                neighbor.g = gScore;
                neighbor.f = neighbor.g + neighbor.h;
            }
        }
    }

    return [];
};


function dijkstraSearch(start, end) {
    start.d = 0;
    var opened = [];
    var closed = [];
    for (var i = 0; i < BOARD_NODES.length; i++) {
        for (var j = 0; j < BOARD_NODES[0].length; j++) {
            opened.push(BOARD_NODES[i][j]);
        }
    }

    while (opened.length > 0) {
        // Choosing node with minimal distance so far

        var index = 0
        var minD = Infinity;
        for (var i = 0; i < opened.length; i++) {
            if (opened[i].d < minD) {
                minD = opened[i].d;
                index = i;
            }
        }
        var currentNode = opened[index];

        // Update neighbors
        var neighbors = getNeighbors(currentNode);

        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];
            if (!findNode(closed, neighbor) && neighbor.status !== Status.WALL) {
                if (currentNode.d + 1 < neighbor.d) {
                    neighbor.d = currentNode.d + 1;
                    neighbor.parent = currentNode;
                }
            }
        }
        // Put current node to closed
        removeNode(opened, currentNode);
        closed.push(currentNode);
    }

    // Getting path
    var result = [];
    var curr = end;
    while (curr !== start) {
        result.push(curr.parent);
        curr = curr.parent;
    }
    return result.reverse();
}


// Generating Maze

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function generateMaze() {
    var genWalls = [];
    clearBoard();
    recursiveDivision(0, Math.floor(CANVAS_WIDTH / NODE_SIZE), 0, Math.floor(CANVAS_HEIGHT / NODE_SIZE), 8, genWalls, 0, 0);
    // for (var i = 0; i < genWalls.length; i++) {
    //     genWalls[i].status = Status.WALL;
    //     genWalls[i].drawNode();
    // }
}

function recursiveDivision(X1, X2, Y1, Y2, n, walls, pGap1, pGap2) {
    if (X2 - X1 < 4 && Y2 - Y1 < 4) {
        return 0;
    }
    if (n > 0) {
        // Vertically
        if (X2 - X1 > Y2 - Y1) {
            var randomX = getRandomInt(X1 + 1, X2 - 1);
            while (randomX === Math.floor(startNode.x / NODE_SIZE) || randomX === Math.floor(finishNode.x / NODE_SIZE || randomX === pGap1 || randomX === pGap2)) {
                randomX = getRandomInt(X1 + 1, X2 - 1);
            }
            var gap1 = getRandomInt(Y1, Y2);
            var gap2 = getRandomInt(Y1, Y2);
            for (var y = Y1; y < Y2; y++) {
                if (y !== gap1 && y !== gap2) {
                    const node = BOARD_NODES[y][randomX];
                    node.size = 0;
                    node.status = Status.WALL;
                    WALLS.push(node);
                    // walls.push(BOARD_NODES[y][randomX]);
                }
            }
            recursiveDivision(X1, randomX, Y1, Y2, n - 1, walls, gap1, gap2);
            recursiveDivision(randomX + 1, X2, Y1, Y2, n - 1, walls, gap1, gap2);
        }
        // Horisontally
        else {
            var randomY = getRandomInt(Y1 + 1, Y2 - 1);
            while (randomY === Math.floor(startNode.y / NODE_SIZE) || randomY === Math.floor(finishNode.y / NODE_SIZE || randomY === pGap1 || randomY === pGap2)) {
                randomY = getRandomInt(Y1 + 1, Y2 - 1);
            }
            var gap1 = getRandomInt(X1, X2);
            var gap2 = getRandomInt(X1, X2);

            for (var x = X1; x < X2; x++) {
                if (x !== gap1 && x !== gap2) {
                    const node = BOARD_NODES[randomY][x];
                    node.size = 0;
                    node.status = Status.WALL;
                    WALLS.push(node);
                    // walls.push(BOARD_NODES[randomY][x]);
                }
            }
            recursiveDivision(X1, X2, Y1, randomY, n - 1, walls, gap1, gap2);
            recursiveDivision(X1, X2, randomY + 1, Y2, n - 1, walls, gap1, gap2);
        }
    }
}

function update() {
    WALLS.forEach(wall => wall.animateNode());
    setTimeout(update, 1);
}
update();
