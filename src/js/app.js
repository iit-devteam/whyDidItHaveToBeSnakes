/////////////////////////////////////////////////////////////
//IIT-SNAKE-COMPONENT
/////////////////////////////////////////////////////////////
var iitSnakeComponent = {
    templateUrl: 'iitSnakeComponent.html',
    controller: iitSnakeController,
    controllerAs: 'vm'
};

function iitSnakeController(iitSnakeGame, iitSnakeDirections) {
    var vm = this;
    vm.onKeypress = onKeypress;
    vm.iitSnakeGame = iitSnakeGame;

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
    controllerAs: 'vm',
    bindings: {
        status: '<'
    }
};

/////////////////////////////////////////////////////////////
//IIT-SNAKE-CONFIG-COMPONENT
/////////////////////////////////////////////////////////////
var iitSnakeCommandsComponent = {
    templateUrl: 'iitSnakeCommands.html',
    controller: iitSnakeCommandsController,
    controllerAs: 'vm'
};

function iitSnakeCommandsController(iitSnakeGame) {
    var vm = this;
    vm.configs = {};

    vm.apply = apply;
    vm.start = start;
    vm.stop = stop;

    vm.difficultyList = [
        {value: 80, label: "Hard"},
        {value: 200, label: "Medium"},
        {value: 500, label: "Easy"}
    ];

    vm.configs = {
        rows: 30,
        cols: 30,
        difficulty: vm.difficultyList[0].value
    };

    function apply() {
        var difficulty = vm.configs.difficulty;
        var rows = parseInt(vm.configs.rows, 10);
        var cols = parseInt(vm.configs.cols, 10);
        iitSnakeGame.stop();
        iitSnakeGame.init(rows, cols, difficulty);
        iitSnakeGame.start();
    }
    function start() {
        iitSnakeGame.stop();
        iitSnakeGame.start();
    }
    function stop() {
        iitSnakeGame.stop();
    }
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
        difficulty: 0,
        rows: 0,
        cols: 0,
        grid: [],
        snake: [],
        direction: 0
    };
    game.init = function (rows, cols, difficulty) {
        game.difficulty = difficulty;
        game.rows = rows;
        game.cols = cols;
        game.food = game.getRandomFood();
        game.grid = game.createGrid(rows, cols);


        game.snake = [{x: 0, y: 0}];
        game.direction = iitSnakeDirections.RIGHT;

        game.drawSnake();
        game.drawFood();
        game.execution = undefined;
    };

    game.start = function () {
        if (game.execution !== undefined)
            return;

        game.execution = $interval(game.update, game.difficulty);
    };

    game.stop = function () {
        if (game.execution === undefined)
            return;

        $interval.cancel(game.execution);
        game.execution = undefined;
    };

    game.update = function () {
        game.deleteSnake();
        game.move();
        game.bite();
        game.drawFood();
        game.drawSnake();

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
            if (game.snake.length < 5)
                return false;

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
        function isOppositeDirection() {
            //Terrible hack!!!!
            return Math.abs(game.direction - direction) === 2;
        }
        if (isOppositeDirection(direction) || game.moved)
            return;
        game.direction = direction;
        game.moved = true;
    };

    game.getDelta = function () {
        var directionMappings = {};
        directionMappings[iitSnakeDirections.UP] = {x: -1, y: 0};
        directionMappings[iitSnakeDirections.RIGHT] = {x: 0, y: 1};
        directionMappings[iitSnakeDirections.DOWN] = {x: 1, y: 0};
        directionMappings[iitSnakeDirections.LEFT] = {x: 0, y: -1};

        return directionMappings[game.direction];
    };

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
        .component('iitSnakeCommands', iitSnakeCommandsComponent)
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
