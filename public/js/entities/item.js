(function(window, angular, $) {
    "use strict";
    angular.module('FileManagerApp').factory('item', ['$http', '$q', '$translate', 'fileManagerConfig', 'chmod', function($http, $q, $translate, fileManagerConfig, Chmod) {

        var Item = function(model, path) {
            var rawModel = {
                name: model && model.name || '',
                id: model && model.id || '',
                path: path || [],
                type: model && model.type || 'file',
                origin_path: model && model.path || '/',
                created_at: model && model.created_at || 0,
                updated_at: model && model.updated_at || 0,
                content_type: model && model.content_type || "",
                size: model && parseInt(model.size || 0),
                perms: new Chmod(model && model.rights),
                content: model && model.content || '',
                recursive: false,
                sizeKb: function() {
                    return Math.round(this.size / 1024, 1);
                },
                fullPath: function() {
                    return (this.origin_path + '/' + this.name).replace(/\/\//, '/');
                }
            };

            this.error = '';
            this.inprocess = false;

            this.model = angular.copy(rawModel);
            this.tempModel = angular.copy(rawModel);

            function parseMySQLDate(mysqlDate) {
                var d = (mysqlDate || '').toString().split(/[- :]/);
                return new Date(d[0], d[1] - 1, d[2], d[3], d[4], d[5]);
            }
        };

        Item.prototype.update = function() {
            angular.extend(this.model, angular.copy(this.tempModel));
        };

        Item.prototype.revert = function() {
            angular.extend(this.tempModel, angular.copy(this.model));
            this.error = '';
        };

        Item.prototype.deferredHandler = function(data, deferred, defaultMsg) {
            if (!data || typeof data !== 'object') {
                this.error = 'Bridge response error, please check the docs';
            }
            if (data.result && data.result.error) {
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
            this.update();
            return deferred.resolve(data);
        };

        Item.prototype.createFolder = function() {
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: "addfolder",
                project_id: "4d85c7039ab0fd70a117d730",
                path: self.tempModel.path.join('/') + "/",
                name: self.tempModel.name
            }};

            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.createFolderUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_creating_folder'));
            })['finally'](function(data) {
                self.inprocess = false;
            });
        
            return deferred.promise;
        };

        Item.prototype.rename = function() {
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                "mode": "rename",
                project_id: "4d85c7039ab0fd70a117d730",
                "id": self.model.id,
                "path": self.model.origin_path,
                "new_name": self.tempModel.name
            }};
            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.renameUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_renaming'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        Item.prototype.copy = function() {
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: "copy",
                project_id: "4d85c7039ab0fd70a117d730",
                path: self.model.fullPath(),
                newPath: self.tempModel.fullPath()
            }};

            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.copyUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_copying'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        Item.prototype.compress = function() {
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: "compress",
                project_id: "4d85c7039ab0fd70a117d730",
                path: self.model.fullPath(),
                destination: self.tempModel.fullPath()
            }};

            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.compressUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_compressing'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        Item.prototype.extract = function() {
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: "extract",
                project_id: "4d85c7039ab0fd70a117d730",
                path: self.model.fullPath(),
                sourceFile: self.model.fullPath(),
                destination: self.tempModel.fullPath()
            }};

            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.extractUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_extracting'));
            })["finally"](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        Item.prototype.download = function(preview) {
            var self = this;
            var deferred = $q.defer();
            var data = {
                mode: "download",
                project_id: "4d85c7039ab0fd70a117d730",
                id: self.model.id,
                path: self.model.origin_path
            };

            return location.href + [fileManagerConfig.downloadFileUrl, $.param(data)].join('?');
        };

        Item.prototype.preview = function() {
            var self = this;
            return self.download(true);
        };

        Item.prototype.getContent = function() {
            var self = this;
            self.tempModel.content = self.model.content = self.download(true);
        };

        Item.prototype.getBaseContent = function() {
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: "openfile",
                project_id: "4d85c7039ab0fd70a117d730",
                id: self.model.id,
                path: self.model.origin_path
            }};

            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.getContentUrl, data).success(function(data) {
                self.tempModel.content = self.model.content = data.result;
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_getting_content'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        Item.prototype.remove = function() {
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: "delete",
                project_id: "4d85c7039ab0fd70a117d730",
                name: self.model.name,
                path: self.model.origin_path,
                id: self.model.id,
                is_folder: self.isFolder(self.model)
            }};

            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.removeUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_deleting'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        Item.prototype.edit = function() {
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: "savefile",
                project_id: "4d85c7039ab0fd70a117d730",
                content: self.tempModel.content,
                path: self.tempModel.fullPath()
            }};

            self.inprocess = true;
            self.error = '';

            $http.post(fileManagerConfig.editUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_modifying'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        Item.prototype.move = function(items_array, new_path, path) {
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: "move",
                project_id: "4d85c7039ab0fd70a117d730",
                items_array: items_array,
                path:(path.join('/') == ""?"":'/' +path.join('/')) + "/",
                new_path: new_path
            }};

            self.inprocess = true;
            self.error = '';

            $http.post(fileManagerConfig.editUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_modifying'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };
        Item.prototype.rewriteMoved = function(items_array) {
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: "rewrite_moved",
                project_id: "4d85c7039ab0fd70a117d730",
                items_array: items_array
            }};

            self.inprocess = true;
            self.error = '';

            $http.post(fileManagerConfig.editUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_modifying'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        Item.prototype.changePermissions = function() {
            var self = this;
            var deferred = $q.defer();
            var data = {params: {
                mode: "changepermissions",
                project_id: "4d85c7039ab0fd70a117d730",
                path: self.tempModel.fullPath(),
                perms: self.tempModel.perms.toOctal(),
                permsCode: self.tempModel.perms.toCode(),
                recursive: self.tempModel.recursive
            }};
            
            self.inprocess = true;
            self.error = '';
            $http.post(fileManagerConfig.permissionsUrl, data).success(function(data) {
                self.deferredHandler(data, deferred);
            }).error(function(data) {
                self.deferredHandler(data, deferred, $translate.instant('error_changing_perms'));
            })['finally'](function() {
                self.inprocess = false;
            });
            return deferred.promise;
        };

        Item.prototype.isFolder = function() {
            return this.model.type === 'dir';
        };

        Item.prototype.isEditable = function() {
            return !this.isFolder() && fileManagerConfig.isEditableFilePattern.test(this.model.name);
        };

        Item.prototype.isImage = function() {
            return fileManagerConfig.isImageFilePattern.test(this.model.name);
        };

        Item.prototype.isPdf = function() {
            return fileManagerConfig.isImageFilePattern.test(this.model.name);
        };

        Item.prototype.isCompressible = function() {
            return this.isFolder();
        };

        Item.prototype.isExtractable = function() {
            return !this.isFolder() && fileManagerConfig.isExtractableFilePattern.test(this.model.name);
        };

        return Item;
    }]);
})(window, angular, jQuery);
