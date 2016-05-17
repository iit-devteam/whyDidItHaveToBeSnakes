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
    FOOD: 2
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
        direction: iitSnakeDirections.UP
    };
    game.init = function (rows, cols) {
        game.rows = rows;
        game.cols = cols;
        for (var x = 0; x < rows; x++) {
            game.grid.push([]);
            for (var y = 0; y < cols; y++) {
                game.grid[x].push(iitSnakeCellStatuses.EMPTY);
            }
        }
        var head = game.snake[0];
        game.grid[head.x][head.y] = iitSnakeCellStatuses.SNAKE;
        
        $interval(game.update, 100);
    };
    
    game.update = function() {
        var directionMappings = {};
        directionMappings[iitSnakeDirections.UP] = {x: -1, y:0};
        directionMappings[iitSnakeDirections.RIGHT] = {x:0, y: 1};
        directionMappings[iitSnakeDirections.DOWN] = {x: 1, y:0};
        directionMappings[iitSnakeDirections.LEFT] = {x:0, y: -1};
        
        var delta = directionMappings[game.direction];
        var res = game.move(delta);
        var head = res.head;
        var tail = res.tail;
        game.grid[head.x][head.y] = iitSnakeCellStatuses.SNAKE;
        game.grid[tail.x][tail.y] = iitSnakeCellStatuses.EMPTY;
        
    };
    
    game.move = function(delta) {
        var head = game.snake[0];
        var newX = (head.x+delta.x + game.rows)%game.rows;
        var newY = (head.y+delta.y+game.cols)%game.cols;
        var newHead = {x: newX, y: newY};
        game.snake.unshift(newHead);
        var tail = game.snake.pop();
        return {head: newHead, tail: tail};
    };
    
    game.setDirection = function(direction) {
        //Terrible hack!!!!
        if (Math.abs(game.direction - direction) === 2)
            return;
        game.direction = direction;
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