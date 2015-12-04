(function () {
    'use strict';

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
    }])
.run(["$templateCache", function($templateCache) {$templateCache.put("login.html","<form>\n    <md-input-container>\n        <label for=\"email\">Email</label>\n        <input type=\"text\" id=\"email\"\n               ng-model=\"login.email\" md-autofocus>\n    </md-input-container>\n    <md-input-container>\n        <label for=\"password\">Password</label>\n        <input type=\"text\" id=\"password\"\n               ng-model=\"login.password\" md-autofocus>\n    </md-input-container>\n    <md-button class=\"md-icon-button\" ng-click=\"sendLogin()\" aria-label=\"More\">\n        LOGIN\n    </md-button>\n</form>");}])

})();