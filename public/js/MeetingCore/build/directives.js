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
angular.module('MeetingCore', [])
    .directive('updateList',['$templateCache',function ($templateCache) {
        return {
            restrict: 'E',
            scope: {
                list: "="
            },
            template: $templateCache.get('update_list.html'),
            link: function($scope, element, attr){
                $scope.tags_options = {
                    lib_params : {
                        "EDT" : "edit",
                        "TXT" : "edit",
                        "DEL" : "delete",
                        "NEW" : "new",
                        "RPL" : "edit",
                        "REN" : "edit",
                        "UNK" : ""
                    },
                    lib_name : {
                        "edit" : "Обновления",
                        "new" : "Новинки",
                        "del" : "Удаленные"
                    }

                };

                $scope.options = {
                    tag : attr.propertyTag,
                    tag_name : !attr.propertyTag?'Все обновления!':$scope.tags_options.lib_name[attr.propertyTag],
                    limit: 100,
                    order: '-unix_time',
                    addToLimit: function(){
                        if(this.limit+100 < $scope.list.length){
                            this.limit+=100;
                        } else {
                            this.limit = $scope.list.length;
                        }
                    }
                };

                $scope.filter_active = function(item) {
                    if(!$scope.options.tag || $scope.tags_options.lib_params[item.tag] == $scope.options.tag){
                        return item;
                    } else {
                        return false;
                    }

                };
            }
        };
    }])