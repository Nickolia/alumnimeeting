(function(angular) {
    "use strict";
    angular.module('FileManagerApp').service('fileNavigator', [
        '$http', '$q', 'fileManagerConfig', 'item', function ($http, $q, fileManagerConfig, Item) {

        $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

        var FileNavigator = function() {
            this.requesting = false;
            this.selected = null;
            this.fileList = [];
            this.currentPath = [];
            this.history = [];
            this.error = '';
        };

        FileNavigator.prototype.deferredHandler = function(data, deferred, defaultMsg) {
            if (!data || typeof data !== 'object') {
                this.error = 'Bridge response error, please check the docs';
            }
            if (!this.error && data.result && data.result.error) {
                this.error = data.result.error;
            }
            if (!this.error && data.error) {
                this.error = data.error.message;
            }
            if (!this.error && defaultMsg) {
                this.error = defaultMsg;
            }
            if (this.error) {
                return deferred.reject(data);
            }
            return deferred.resolve(data);
        };

        FileNavigator.prototype.list = function(is_start) {
            var self = this;
            var deferred = $q.defer();
            var path = (self.currentPath.join('/') == ""?"":'/' +self.currentPath.join('/')) + "/";
            var data = {params: {
                mode: "list",
                onlyFolders: false,
                project_id: "4d85c7039ab0fd70a117d730",
                path: path,
                is_start: is_start
            }};

            self.requesting = true;
            self.fileList = [];
            self.error = '';

            $http.post(fileManagerConfig.listUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, 'Unknown error listing, check the response');
            })['finally'](function(data) {
                self.requesting = false;
            });
            return deferred.promise;
        };

        FileNavigator.prototype.refresh = function(is_start) {
            var self = this;
            var path = (self.currentPath.join('/') == "/"?"":'/' +self.currentPath.join('/')) + "/";

            is_start = is_start || false;
            
            return self.list(is_start).then(function(data) {
                self.fileList = (data.result || []).map(function(file) {
                    return new Item(file, self.currentPath);
                });
                if(!!data.path)self.buildTree(data.path);
            });
        };

        /*FileNavigator.prototype.buildTree = function(path) {
            var self = this;
            function recursive(parent, item, path) {
                var absName = path ? (path + '/' + item.model.name) : item.model.name;
                if (parent.name.trim() && path.trim().indexOf(parent.name) !== 0) {
                    parent.nodes = [];
                }
                if (parent.name !== path) {
                    for (var i in parent.nodes) {
                        recursive(parent.nodes[i], item, path);
                    }
                } else {
                    for (var e in parent.nodes) {
                        if (parent.nodes[e].name === absName) {
                            return;
                        }
                    }
                    parent.nodes.push({item: item, name: absName, nodes: []});
                }
                parent.nodes = parent.nodes.sort(function(a, b) {
                    return a.name < b.name ? -1 : a.name === b.name ? 0 : 1;
                });
            };

            !self.history.length && self.history.push({name: path, nodes: []});
            for (var o in self.fileList) {
                var item = self.fileList[o];
                item.isFolder() && recursive(self.history[0], item, path);
            }
        };*/

        FileNavigator.prototype.buildTree = function(dir) {
            var self = this;
            var dir_sortable = [],
                length_array_dir = 1;
            _.each(dir, function(item,index){
                item.current_path = _.initial(item.path.split("/"));
                item.current_path_length = item.current_path.length;
            });
            dir = _.sortBy(dir,"current_path_length");
            _.each(dir, function(item,index){
                if(item.current_path_length == 1){
                    dir_sortable.push({
                        name: item.name,
                        path: "/",
                        id: item.id,
                        nodes: [],
                        open: false,
                        show: true
                    })
                } else {
                    var parent_element = _.findWhere(dir_sortable, {name: item.current_path[1]});
                    for(var i = 2; i <= item.current_path_length; i++){
                        if(i == item.current_path_length){
                            parent_element.nodes.push({
                                name: item.name,
                                path: item.path,
                                id: item.id,
                                nodes: [],
                                open: false,
                                show: true
                            })
                        } else {
                            parent_element = _.findWhere(parent_element.nodes, {name: item.current_path[i]});
                        }
                    }
                }
            });
            self.history.push({name: "/",path:"/", nodes: dir_sortable});
        };

        FileNavigator.prototype.folderClick = function(item) {
            var self = this;
            self.currentPath = [];
            if (item && item.isFolder()) {
                self.currentPath = item.model.fullPath().split('/').splice(1);
            }
            self.refresh();
        };
        FileNavigator.prototype.folderClickSidebar = function(item) {
            var self = this;
            self.currentPath = (item.path+item.name).split("/").splice(1);
            self.refresh();
        };

        FileNavigator.prototype.upDir = function() {
            var self = this;
            if (self.currentPath[0]) {
                self.currentPath = self.currentPath.slice(0, -1);
                self.refresh();
            }
        };

        FileNavigator.prototype.goTo = function(index) {
            var self = this;
            self.currentPath = self.currentPath.slice(0, index + 1);
            self.refresh();
        };

        FileNavigator.prototype.fileNameExists = function(fileName) {
            var self = this;
            for (var item in self.fileList) {
                item = self.fileList[item];
                if (fileName.trim && item.model.name.trim() === fileName.trim()) {
                    return true;
                }
            }
        };

        FileNavigator.prototype.listHasFolders = function() {
            var self = this;
            for (var item in self.fileList) {
                if (self.fileList[item].model.type === 'dir') {
                    return true;
                }
            }
        };

        return FileNavigator;
    }]);
})(angular);