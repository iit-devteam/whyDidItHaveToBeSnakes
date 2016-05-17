var iitSnakeComponent = {
    template: '{{vm.greet}}',
    controller: iitSnakeController,
    controllerAs: 'vm',
    transclude: true
};

function iitSnakeController() {
    var vm = this;
    vm.greet = 'Hello World';
}

angular.module('snake', [])
        .component('iitSnake', iitSnakeComponent);
