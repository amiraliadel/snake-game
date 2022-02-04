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
// Food obj
const food = {
    color: '#0000ff',
    foods: [],
    initFoods: function () { // Creates 1 food in center of surface as default.
        this.addFood();
        this.addFood();
    },
    addFood: function () { // Adds 1 food randomly on surface if the coordinate is equal to false.
        const x = Math.floor(Math.random() * 19);
        const y = Math.floor(Math.random() * 19);
        if (ground.surface[y][x].value == false) {
            this.foods.push({x: x * ground.size, y: y * ground.size, eaten: false});
            ground.surface[y][x].value = true;
        }
    },
    updateFoods: function () { // Removes the food from the foods array if smake.head collides with it.
        this.foods = this.foods.filter(food => food.eaten == false);
    },
    draw: function () { // Draws foods on surface.
        ctx.beginPath();
        ctx.fillStyle = this.color;
        this.foods.map(food => {
            ctx.rect(food.x, food.y, ground.size, ground.size);
        });
        ctx.fill();
        ctx.closePath();
    }
};
// Snake obj
const snake = {
    head: new Tile(40, game.height/2),
    body: [],
    color: '#fff',
    speed: 2,
    directionX: 1,
    directionY: 0,
    initBody: function () { // Creates a body with 2 tiles as default.
        for (let i = 2; i > 0; i--) {
            this.body.push(new Body(i * ground.size - ground.size, game.height/2));
        }
    },
    addTile: function (_x, _y) { // Adds 1 square to the body at the end of it and increases bodyLength.
        this.body.push(new Body(_x, _y));
    },
    positions: function () {
        const position = [];
        position.push({x: this.head.x / ground.size, y: this.head.y / ground.size});
        this.body.map(tile => {
            position.push({x: tile.x / ground.size, y : tile.y / ground.size});
        });
        return position;
    },
    direction: function () {
        this.directionX = game.direction.x;
        this.directionY = game.direction.y;
    },
    move: function () {
        // Moving head.
        this.head.x += this.directionX * this.speed;
        this.head.y += this.directionY * this.speed;
        // Moving body
        this.body.map(tile => { // Moves each tile of body to the last position of forepart.
            if (tile.x < tile.path.x) tile.x += this.speed;
            if (tile.x > tile.path.x) tile.x -= this.speed;
            if (tile.y < tile.path.y) tile.y += this.speed;
            if (tile.y > tile.path.y) tile.y -= this.speed;
        });
    },
    updatePath: function () { // Updates the path of each tile of body to follow the head.     
        this.body[0].path.x = this.head.x;
        this.body[0].path.y = this.head.y;
        for (let i = 1; i < this.body.length; i++) {
            this.body[i].path.x = this.body[i-1].x;
            this.body[i].path.y = this.body[i-1].y;
        }
    },
    draw: function () { // Draws head & body in canvas.
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.rect(this.head.x, this.head.y, ground.size, ground.size);
        this.body.map(tile => {
            ctx.rect(tile.x, tile.y, ground.size, ground.size);
        });
        ctx.fill();
        ctx.closePath();
    }
};