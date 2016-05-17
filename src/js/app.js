/////////////////////////////////////////////////////////////
//IIT-SNAKE-COMPONENT
/////////////////////////////////////////////////////////////
var iitSnakeComponent = {
    templateUrl: 'iitSnakeComponent.html',
    controller: iitSnakeController,
    controllerAs: 'vm',
    transclude: true
};

function iitSnakeController(iitSnakeGame) {
    var vm = this;
    vm.rows = 20;
    vm.cols = 50;

    iitSnakeGame.init(vm.rows, vm.cols);
    vm.grid = iitSnakeGame.grid;
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
function iitSnakeGame(iitSnakeCellStatuses, $interval) {
    var game = {
        rows: 0,
        cols: 0,
        grid: [],
        snake: [{x: 2, y: 0}, {x: 1, y: 0}, {x: 0, y: 0}]
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
        var direction = {y: 1, x:0};
        game.move(direction);
        var head = game.snake[0];
        var tail = game.snake.last();
        game.grid[head.x][head.y] = iitSnakeCellStatuses.SNAKE;
        game.grid[tail.x][tail.y] = iitSnakeCellStatuses.EMPTY;
        
    };
    
    game.move = function(delta) {
        var head = game.snake[0];
        var newHead = {x:head.x+delta.x, y:head.y+delta.y};
        game.snake.unshift(newHead);
        game.snake.pop();
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
        .filter('iitSnakeCellStatusesFilter', iitSnakeCellStatusesFilter)
        .service('iitSnakeGame', iitSnakeGame);


if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};