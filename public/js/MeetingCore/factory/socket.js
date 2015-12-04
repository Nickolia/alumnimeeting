angular.module('MeetingCore', [])
    .factory('socket',['socketFactory', function (socketFactory) {
        return socketFactory();
    }])
    .value('version', '0.1')