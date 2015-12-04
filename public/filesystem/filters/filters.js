(function(angular) {
    "use strict";
    var app = angular.module('FileManagerApp');

    app.filter('strLimit', ['$filter', function($filter) {
        return function(input, limit) {
            if (input.length <= limit) {
                return input;
            }
            return $filter('limitTo')(input, limit) + '...';
        };
    }]);

    app.filter('formatDate', ['$filter', function($filter) {
        return function(input, limit) {
            var newDate = new Date();
            newDate.setTime(0);
            newDate.setTime((input*1000) - (newDate.getTimezoneOffset() * 60 * 1000));

            var string = ('0' + newDate.getDate()).slice(-2)+"/"+('0' + (newDate.getMonth()+1)).slice(-2)+"/"+newDate.getFullYear()+"  "+ ('0' + newDate.getHours()).slice(-2)+":"+('0' + newDate.getMinutes()).slice(-2)

            return string
        };
    }]);
})(angular);
