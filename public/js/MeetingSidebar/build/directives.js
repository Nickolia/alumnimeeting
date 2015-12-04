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