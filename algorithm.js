const canvas = document.getElementById('board');
const context = canvas.getContext("2d");

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const MARGIN = 16;
const NODE_SIZE = 25;

let BOARD_NODES = [];
let isMouseDown = false;

const Status = {
    EMPTY: 'EMPTY',
    WALL: 'WALL',
    START: 'START',
    END: 'END'
}

class Node {
    constructor(x, y, size, status) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.status = status;
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
            node.drawNode();
            BOARD_NODES[node.y / NODE_SIZE][node.x / NODE_SIZE] = node
        }

    }

    addNode(node) {
        BOARD_NODES[node.y / NODE_SIZE][node.x / NODE_SIZE] = node;
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
        board.addWall(event.x - MARGIN, event.y - MARGIN);
    }
});
canvas.addEventListener('mouseup', function (event) {
    isMouseDown = false;
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
    startNode.drawNode();
    finishNode.drawNode();
}
