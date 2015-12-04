angular.module('MeetingSidebar', [])
    .directive('sidebar',['$templateCache', function ($templateCache) {
        return {
            restrict: 'E',
            replace:false,
            template : $templateCache.get('sidebar.html'),
            link: function($scope,element){

            }
        };
    }]);