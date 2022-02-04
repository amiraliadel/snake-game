window.animate = (function () {
    return window.requestAnimationFrame || 
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame || 
           function (callback) {
            setTimeout(callback, 1000 / 60);
           }
})();
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const score = document.getElementById('score');
canvas.width = 400;
canvas.height = 400;
// Game obj
const game = {
    width: canvas.width,
    height: canvas.height,
    score: 0,
    direction: {x: 1, y: 0},
    arrowKey: {up_down: true, left_right: false},
    play: false,
    start: function () {
        if (!this.play) this.play = true;
    },
    stop: function () {
        if (this.play) this.play = false;
    },
    restart: function () {
        location.reload();
    },
    displayScore: function () {
        score.textContent = this.score;
    },
    clearCanvas: function () {
        ctx.fillStyle = '#212121';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    gameOver: function () {
        this.stop();
        alert('Game Over');
        this.restart();
    },
    initGame: function () {
        ground.initSurface();
        food.initFoods();
        snake.initBody();
    },
    bodyCollisionDetector: function (_colliders) { // Detects if the head collides with body tiles.
        const head = _colliders[0];
        for (let i = 1; i < _colliders.length; i++) {
            if (head.x === _colliders[i].x && head.y === _colliders[i].y) {
                this.gameOver();
            }
        }
    },
    foodCollisionDetector: function (_head, _colliders) { // Detects if the head collides with foods.
        _colliders.map(collider => {
            if (_head.x === collider.x && _head.y === collider.y) {
                collider.eaten = true;
                snake.addTile(snake.body[snake.body.length - 1].path.x, snake.body[snake.body.length - 1].path.y);
                food.updateFoods();
                this.score += 10;
                this.displayScore();
            }
        });
        if (food.foods.length < 2) {
            food.addFood();
        }
    },
    wallCollisionDetector: function (_head) {
        if ((_head.x + ground.size) > game.width || // Detects if the head collides with the top, right, bottom or left of canvas.
            _head.x < 0 || 
            (_head.y + ground.size) > game.height || 
            _head.y < 0) {
            this.gameOver();
        }
    }
};
// Ground obj
const ground = {
    size: 20,
    color: '#00ff00',
    surface: [],
    initSurface: function () { // Initializes the surface and sets the value for all squares to false as default.
        for (let i = 0; i < game.width/this.size; i++) {
            const row = [];
            for (let z = 0; z < game.height/this.size; z++) {
                row.push({x: z * this.size, y: i * this.size, value: false});
            }
            this.surface.push(row);
        }
    },
    updateSurface: function (_positions) { // Updates the surface and set the value of each square to true, which the snake is on it.
        this.surface.map(column => {
            column.map(row => {
                row.value = false;
            });
        });
        _positions.map(position => {
            if (position.x >= 0) {
                this.surface[position.y][position.x].value = true;
            }
        });
    },
    draw: function () { // Draws surface.
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ground.surface.map(column => {
            column.map(row => ctx.strokeRect(row.x, row.y, this.size, this.size));
        });
        ctx.closePath();
    }
};