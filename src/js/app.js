/////////////////////////////////////////////////////////////
//IIT-SNAKE-COMPONENT
/////////////////////////////////////////////////////////////
var iitSnakeComponent = {
    templateUrl: 'iitSnakeComponent.html',
    controller: iitSnakeController,
    controllerAs: 'vm',
    transclude: true
};

function iitSnakeController(iitSnakeGame, iitSnakeDirections) {
    var vm = this;
    vm.rows = 40;
    vm.cols = 60;
    vm.onKeypress = onKeypress;

    iitSnakeGame.init(vm.rows, vm.cols);
    vm.grid = iitSnakeGame.grid;

    function onKeypress($event) {
        var keyMappings = {};
        keyMappings[38] = iitSnakeDirections.UP;
        keyMappings[39] = iitSnakeDirections.RIGHT;
        keyMappings[40] = iitSnakeDirections.DOWN;
        keyMappings[37] = iitSnakeDirections.LEFT;
        var direction = keyMappings[$event.keyCode];
        if (direction === undefined)
            return;
        iitSnakeGame.setDirection(direction);
    }
}
/////////////////////////////////////////////////////////////
//IIT-SNAKE-CELL-COMPONENT
/////////////////////////////////////////////////////////////
var iitSnakeCellComponent = {
    templateUrl: 'iitSnakeCellComponent.html',
    controller: iitSnakeCellController,
    controllerAs: 'vm',
    transclude: true,
    bindings: {
        status: '<'
    }
};

function iitSnakeCellController(iitSnakeCellStatuses) {
    var vm = this;
    vm.status = iitSnakeCellStatuses.EMPTY;
}
/////////////////////////////////////////////////////////////
//IIT-SNAKE-CELL-STATUSES
/////////////////////////////////////////////////////////////
var iitSnakeCellStatuses = {
    EMPTY: 0,
    SNAKE: 1,
    FOOD: 2,
    DEATH: 3
};
/////////////////////////////////////////////////////////////
//IIT-SNAKE-CELL-STATUSES
/////////////////////////////////////////////////////////////
var iitSnakeDirections = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};
/////////////////////////////////////////////////////////////
//IIT-SNAKE-CELL-STATUSES
/////////////////////////////////////////////////////////////
function iitSnakeCellStatusesFilter(iitSnakeCellStatuses) {
    return function (input) {
        var mappings = {};
        mappings[iitSnakeCellStatuses.EMPTY] = 'empty';
        mappings[iitSnakeCellStatuses.SNAKE] = 'snake';
        mappings[iitSnakeCellStatuses.FOOD] = 'food';
        mappings[iitSnakeCellStatuses.DEATH] = 'death';
        return mappings[input];
    };
}
/////////////////////////////////////////////////////////////
//IIT-SNAKE-GAME
/////////////////////////////////////////////////////////////
function iitSnakeGame(iitSnakeCellStatuses, iitSnakeDirections, $interval) {
    var game = {
        rows: 0,
        cols: 0,
        grid: [],
        snake: [{x: 2, y: 0}, {x: 1, y: 0}, {x: 0, y: 0}],
        direction: iitSnakeDirections.RIGHT
    };
    game.init = function (rows, cols) {
        game.rows = rows;
        game.cols = cols;
        game.food = game.getRandomFood();
        game.grid = game.createGrid(rows, cols);

        game.drawSnake();
        game.drawFood();

        game.start();
    };

    game.start = function () {
        game.execution = $interval(game.update, 80);
    };

    game.stop = function () {
        $interval.cancel(game.execution);
        game.execution = undefined;
    };

    game.update = function () {
        game.deleteSnake();
        game.move();
        game.bite();
        game.drawSnake();
        game.drawFood();

        game.moved = false;
    };

    game.move = function () {
        var delta = game.getDelta();
        var head = game.snake[0];
        var newX = (head.x + delta.x + game.rows) % game.rows;
        var newY = (head.y + delta.y + game.cols) % game.cols;
        var newHead = {x: newX, y: newY};
        game.snake.unshift(newHead);
        game.snake.pop();
    };

    game.bite = function () {
        function isBitingItself(head) {
            var snakeBody = game.snake.slice(1);
            return (snakeBody.some(function (s) {
                return game.sameCell(s, head);
            }));
        }
        var head = game.snake[0];
        if (game.sameCell(head, game.food)) {
            game.eat();
        }
        if (isBitingItself(head)) {
            game.grid[head.x][head.y] = iitSnakeCellStatuses.DEATH;
            game.stop();
        }
    };

    game.setDirection = function (direction) {
        //Terrible hack!!!!
        function isOppositeDirection() {
            return Math.abs(game.direction - direction) === 2;
        }
        if (isOppositeDirection(direction) || game.moved)
            return;
        game.direction = direction;
        game.moved = true;
    };
    
    game.getDelta = function() {
        var directionMappings = {};
        directionMappings[iitSnakeDirections.UP] = {x: -1, y: 0};
        directionMappings[iitSnakeDirections.RIGHT] = {x: 0, y: 1};
        directionMappings[iitSnakeDirections.DOWN] = {x: 1, y: 0};
        directionMappings[iitSnakeDirections.LEFT] = {x: 0, y: -1};

        return directionMappings[game.direction];
    }
 
    game.eat = function () {
        var tail = game.snake.last();
        game.snake.push(tail);
        game.food = game.getRandomFood();
    };

    game.getRandomFood = function () {
        var x = getRandomInt(0, game.rows);
        var y = getRandomInt(0, game.cols);
        return {x: x, y: y};
    };

    game.sameCell = function (c1, c2) {
        return c1.x === c2.x && c1.y === c2.y;
    };

    game.deleteSnake = function () {
        game.snake.forEach(function (s) {
            game.grid[s.x][s.y] = iitSnakeCellStatuses.EMPTY;
        });
    };

    game.drawSnake = function () {
        game.snake.forEach(function (s) {
            if (game.grid[s.x][s.y] === iitSnakeCellStatuses.EMPTY)
                game.grid[s.x][s.y] = iitSnakeCellStatuses.SNAKE;
        });
    };

    game.drawFood = function () {
        game.grid[game.food.x][game.food.y] = iitSnakeCellStatuses.FOOD;
    };

    game.createGrid = function (rows, cols) {
        var grid = [];
        for (var x = 0; x < rows; x++) {
            grid.push([]);
            for (var y = 0; y < cols; y++) {
                grid[x].push(iitSnakeCellStatuses.EMPTY);
            }
        }
        return grid;
    };

    return game;
}
/////////////////////////////////////////////////////////////
//IIT-SNAKE-MODULE
/////////////////////////////////////////////////////////////
angular.module('snake', [])
        .component('iitSnake', iitSnakeComponent)
        .component('iitSnakeCell', iitSnakeCellComponent)
        .constant('iitSnakeCellStatuses', iitSnakeCellStatuses)
        .constant('iitSnakeDirections', iitSnakeDirections)
        .filter('iitSnakeCellStatusesFilter', iitSnakeCellStatusesFilter)
        .service('iitSnakeGame', iitSnakeGame);





if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
}



function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
