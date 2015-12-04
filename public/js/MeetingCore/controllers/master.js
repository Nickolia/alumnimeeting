angular.module('MeetingCore', [])
    .controller('Master',['$scope', 'socket', function ($scope, socket) {
        socket.emit('connection');
        $scope.update_list = {
            list: [],
            limit: 100,
            order: '-unix_time',
            addToLimit: function(){
                if(this.limit+100 < this.list.length){
                    this.limit+=100;
                } else {
                    this.limit = this.list.length;
                }
            }
        };
        socket.on('clear&update:samlib:list', function (list_clear, list_update) {
            _.each(list_clear, function(item){
                $scope.update_list.list = _.filter($scope.update_list.list, function(num){ return (num.id != item.id)||(num.id == item.id && num.unix_time == item.unix_time); });
            });
            _.each(list_update, function(item){
                item.unix_time = item.unix_time*1;
                $scope.update_list.list.push(item);
            });
        });
    }]);