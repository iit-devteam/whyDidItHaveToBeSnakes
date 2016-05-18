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
        game.food = getRandomFood();
        game.grid = getGrid(rows, cols);


        game.snake = [{x: 0, y: 0}];
        game.direction = iitSnakeDirections.RIGHT;

        drawSnake();
        drawFood();
        game.execution = undefined;
    };

    game.start = function () {
        if (game.execution !== undefined)
            return;

        game.execution = $interval(update, game.difficulty);
    };

    game.stop = function () {
        if (game.execution === undefined)
            return;

        $interval.cancel(game.execution);
        game.execution = undefined;
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

    return game;

    function update() {
        deleteSnake();
        move();
        bite();
        drawFood();
        drawSnake();

        game.moved = false;
    }

    function move() {
        var delta = getDelta();
        var head = game.snake[0];
        var newX = (head.x + delta.x + game.rows) % game.rows;
        var newY = (head.y + delta.y + game.cols) % game.cols;
        var newHead = {x: newX, y: newY};
        game.snake.unshift(newHead);
        game.snake.pop();
    }

    function bite() {
        function isBitingItself(head) {
            if (game.snake.length < 5)
                return false;

            var snakeBody = game.snake.slice(1);
            return (snakeBody.some(function (s) {
                return sameCell(s, head);
            }));
        }
        var head = game.snake[0];
        if (sameCell(head, game.food)) {
            eat();
        }
        if (isBitingItself(head)) {
            game.grid[head.x][head.y] = iitSnakeCellStatuses.DEATH;
            game.stop();
        }
    }

    function getDelta() {
        var directionMappings = {};
        directionMappings[iitSnakeDirections.UP] = {x: -1, y: 0};
        directionMappings[iitSnakeDirections.RIGHT] = {x: 0, y: 1};
        directionMappings[iitSnakeDirections.DOWN] = {x: 1, y: 0};
        directionMappings[iitSnakeDirections.LEFT] = {x: 0, y: -1};

        return directionMappings[game.direction];
    }

    function eat() {
        var tail = game.snake.last();
        game.snake.push(tail);
        game.food = getRandomFood();
    }

    function getRandomFood() {
        var x = getRandomInt(0, game.rows);
        var y = getRandomInt(0, game.cols);
        return {x: x, y: y};
    }

    function sameCell(c1, c2) {
        return c1.x === c2.x && c1.y === c2.y;
    }

    function deleteSnake() {
        game.snake.forEach(function (s) {
            game.grid[s.x][s.y] = iitSnakeCellStatuses.EMPTY;
        });
    }

    function drawSnake() {
        game.snake.forEach(function (s) {
            if (game.grid[s.x][s.y] === iitSnakeCellStatuses.EMPTY)
                game.grid[s.x][s.y] = iitSnakeCellStatuses.SNAKE;
        });
    }

    function drawFood() {
        game.grid[game.food.x][game.food.y] = iitSnakeCellStatuses.FOOD;
    }

    function getGrid(rows, cols) {
        var grid = [];
        for (var x = 0; x < rows; x++) {
            grid.push([]);
            for (var y = 0; y < cols; y++) {
                grid[x].push(iitSnakeCellStatuses.EMPTY);
            }
        }
        return grid;
    }
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
