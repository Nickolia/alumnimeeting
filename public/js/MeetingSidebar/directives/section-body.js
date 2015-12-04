angular.module('MeetingSidebar', [])
    .directive('sectionBody',['$templateCache','$mdSidenav', function ($templateCache,$mdSidenav) {
        return {
            restrict: 'E',
            transclude: true,
            template : $templateCache.get('section.html'),
            controller: function($scope){
                $scope.openSideBar = function(){
                    $mdSidenav('left').toggle();
                }
            }
        };
    }]);