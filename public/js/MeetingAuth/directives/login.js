angular.module('MeetingAuth', [])
    .directive('login',['$templateCache','socket', function ($templateCache,socket) {
        return {
            restrict: 'E',
            template : $templateCache.get('login.html'),
            controller: function($scope){
                $scope.sendLogin = function(){
                    socket.emit('login:set', $scope.login);
                };
                socket.on('login:get', function (data) {
                    console.log(data)
                });
            }
        };
    }]);