angular.module('MeetingCore', [])
    .directive('timer',['$templateCache',function ($templateCache) {
        return {
            restrict: 'AE',
            scope:{
                unixTime : "="
            },
            template: $templateCache.get('timer.html'),
            controller: function($scope, $timeout, timeCore){
                $scope.date = new Date($scope.unixTime);
            }
        };
    }])