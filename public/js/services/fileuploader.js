(function(window, angular) {
    "use strict";
    angular.module('FileManagerApp').service('fileUploader', ['$http', '$q', 'fileManagerConfig', function ($http, $q, fileManagerConfig) {

        function deferredHandler(data, deferred, errorMessage) {
            if (!data || typeof data !== 'object') {
                return deferred.reject('Bridge response error, please check the docs');
            }
            if (data.result && data.result.error) {
                return deferred.reject(data);
            }
            if (data.error) {
                return deferred.reject(data);
            }
            if (errorMessage) {
                return deferred.reject(errorMessage);
            }
            deferred.resolve(data);
        }

        this.requesting = false; 
        this.upload = function(fileList) {
            if (! window.FormData) {
                throw new Error('Unsupported browser version');
            }
            var self = this;
            var form = new window.FormData();
            var deferred = $q.defer();
            var path = [];
            var paths = [];
            form.append('destination', '/' + path.join('/'));

            for (var i = 0; i < fileList.length; i++) {
                var fileObj = fileList[i];
                path.push({name: 'file-' + i, path: fileObj.path, id: fileObj.id});
                if(fileObj.path != "" && fileObj.path != "/"){
                    paths.push(fileObj.path);
                }
                fileObj instanceof window.File && form.append('file-' + i, fileObj);
            }
            paths = _.uniq(paths);
            form.append('params', JSON.stringify({
                mode:"upload",
                project_id: "4d85c7039ab0fd70a117d730",
                path: path,
                paths: paths
            }));

            self.requesting = true;
            $http.post(fileManagerConfig.uploadUrl, form, {
                transformRequest: angular.identity,
                headers: {
                    "Content-Type": undefined
                }
            }).success(function(data) {
                deferredHandler(data, deferred);
            }).error(function(data) {
                deferredHandler(data, deferred, 'Unknown error uploading files');
            })['finally'](function(data) {
                self.requesting = false;
            });

            return deferred.promise;
        };
        this.rewrite = function(fileList) {
            if (! window.FormData) {
                throw new Error('Unsupported browser version');
            }
            var self = this;
            var form = new window.FormData();
            var deferred = $q.defer();
            var path = [];
            form.append('destination', '/' + path.join('/'));

            for (var i = 0; i < fileList.length; i++) {
                var fileObj = fileList[i];
                path.push({name: 'file-' + i, path: fileObj.path});
                fileObj instanceof window.File && form.append('file-' + i, fileObj);
            }
            form.append('params', JSON.stringify({
                mode:"rewrite",
                project_id: "4d85c7039ab0fd70a117d730",
                path: path
            }));

            self.requesting = true;
            $http.post(fileManagerConfig.uploadUrl, form, {
                transformRequest: angular.identity,
                headers: {
                    "Content-Type": undefined
                }
            }).success(function(data) {
                deferredHandler(data, deferred);
            }).error(function(data) {
                deferredHandler(data, deferred, 'Unknown error rewriting files');
            })['finally'](function(data) {
                self.requesting = false;
            });

            return deferred.promise;
        };
    }]);
})(window, angular);