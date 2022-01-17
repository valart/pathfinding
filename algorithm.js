const canvas = document.getElementById('board');
const context = canvas.getContext("2d");

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const MARGIN = 16;
const NODE_SIZE = 25;

let BOARD_NODES = [];
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
    PATH: 'PATH'
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
        for (let y = 0; y <= CANVAS_HEIGHT / NODE_SIZE; y++) {
            const row = [];
            for (let x = 0; x <= CANVAS_WIDTH / NODE_SIZE; x++) {
                const node = new Node(x * NODE_SIZE, y * NODE_SIZE, NODE_SIZE, Status.EMPTY);
                node.drawNode();
                row.push(node);
            }
            BOARD_NODES.push(row);
        }
    }

    addWall(x, y) {
        const node = new Node(Math.floor(x / NODE_SIZE) * NODE_SIZE, Math.floor(y / NODE_SIZE) * NODE_SIZE, NODE_SIZE, Status.WALL);
        if (BOARD_NODES[node.y / NODE_SIZE][node.x / NODE_SIZE].status === Status.EMPTY) {
            this.addNode(node)
        }
    }

    removeWall(x, y) {
        const node = new Node(Math.floor(x / NODE_SIZE) * NODE_SIZE, Math.floor(y / NODE_SIZE) * NODE_SIZE, NODE_SIZE, Status.EMPTY);
        if (BOARD_NODES[node.y / NODE_SIZE][node.x / NODE_SIZE].status === Status.WALL) {
            this.addNode(node)
        }
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
    initializeBoard();
}

function initializeBoard() {
    board.createBoard();
    board.addNode(startNode);
    board.addNode(finishNode);
}

function runAlgorithm() {
    // TODO: Check which algorithm was chosen
    const algorithm = document.getElementById('algo-select').value;
    var pathNodes = Asearch(startNode, finishNode);
    console.log(pathNodes.length);
    for (let i = 0; i < pathNodes.length - 1; i++) {
        pathNodes[i].status = Status.PATH
        pathNodes[i].drawNode()
    }
}

function generateMaze() {
    // TODO: Generate maze
}


// Algorithms

function distance(node1, node2) {
    return Math.pow(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2), 0.5);
}

function getNeighbors(node) {
    var result = [];
    var x = node.x / NODE_SIZE;
    var y = node.y / NODE_SIZE;

    if (x >= 1) {
        result.push(BOARD_NODES[y][x - 1]);
    }
    if (x < CANVAS_WIDTH / NODE_SIZE) {
        result.push(BOARD_NODES[y][x + 1]);
    }
    if (y >= 1) {
        result.push(BOARD_NODES[y - 1][x]);
    }
    if (y < CANVAS_HEIGHT / NODE_SIZE) {
        result.push(BOARD_NODES[y + 1][x]);
    }
    return result;
}

function removeNode(array, node) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == node) {
            array.splice(i, 1)
            break;
        }
    }
}

function findNode(array, node) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == node) {
            return true
        }
    }
    return false
}


function Asearch(start, end) {

    var opened = [];
    var closed = [];
    opened.push(start);

    while (opened.length > 0) {
        // Choosing the node with lowest f
        var lowInd = 0;
        for (var i = 0; i < opened.length; i++) {
            if (opened[i].f < opened[lowInd].f) {
                lowInd = i;
            }
        }
        var currentNode = opened[lowInd];
        console.log(currentNode.x, currentNode.y);
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
        console.log("Neighbors:")
        console.log(neighbors.length)
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
