(function () {
    'use strict';

 angular.module('MeetingSidebar', [])
    .controller('leftSidebar',['$templateCache', function ($templateCache) {

    }])

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
    }])

    .directive('sidebar',['$templateCache', function ($templateCache) {
        return {
            restrict: 'E',
            replace:false,
            template : $templateCache.get('sidebar.html'),
            link: function($scope,element){

            }
        };
    }])
.run(["$templateCache", function($templateCache) {$templateCache.put("section.html","\n<header md-page-header>\n    <md-toolbar ng-style=\"toolbar_style()\">\n        <div class=\"md-toolbar-tools\">\n            <md-button class=\"md-icon-button\" ng-click=\"openSideBar();\" aria-label=\"Settings\">\n                <ng-md-icon icon=\"menu\" options=\"{\'duration\': 375}\"></ng-md-icon>\n            </md-button>\n            <h2 md-header-title flex>Katy Perry</h2>\n            <md-button>Войти</md-button>\n            <md-button>Зарегистрироваться</md-button>\n            <md-button class=\"md-icon-button\" aria-label=\"More\">\n                <ng-md-icon icon=\"more_vert\"></ng-md-icon>\n            </md-button>\n        </div>\n    </md-toolbar>\n\n</header>\n\n<md-content flex md-scroll-y  ng-transclude>\n\n</md-content>\n");
$templateCache.put("sidebar.html","<md-sidenav class=\"md-sidenav-left\" md-component-id=\"left\" >\n    <md-toolbar class=\"md-theme-light\">\n        <h1 class=\"md-toolbar-tools\"></h1>\n    </md-toolbar>\n    <md-content layout-padding>\n        <login></login>\n    </md-content>\n</md-sidenav>");}])

})();