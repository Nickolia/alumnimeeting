
angular.module('MeetingCore', [])
    .factory('timeCore',[function () {
        var timeService = {};
        timeService.fix_zero = function (x)
        {
            var y = String(x);

            if (y.length === 1)
            {
                return "0" + y;
            }
            return y;
        };


        timeService.getTime =  function(timeData) {
            var newDate = new Date();
            newDate.setTime(0);
            newDate.setTime(timeData / 1000);

            return newDate
        };
        timeService.setTime =  function(Date) {

            return (Date.getTime() * 1000)
        };
        return timeService;
    }])
