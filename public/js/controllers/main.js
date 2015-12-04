(function(window, angular, $) {
    "use strict";
    angular.module('FileManagerApp').controller('FileManagerCtrl', [
    '$scope', '$translate', '$cookies', 'fileManagerConfig', 'item', 'fileNavigator', 'fileUploader','$window',
    function($scope, $translate, $cookies, fileManagerConfig, Item, FileNavigator, FileUploader,$window) {

        $scope.config = fileManagerConfig;
        $scope.appName = fileManagerConfig.appName;

        $scope.reverse = false;
        $scope.predicate = ['model.type', 'model.name'];        
        $scope.order = function(predicate) {
            $scope.reverse = ($scope.predicate[1] === predicate) ? !$scope.reverse : false;
            $scope.predicate[1] = predicate;
        };

        $scope.query = '';
        $scope.temp = new Item();
        $scope.fileNavigator = new FileNavigator();
        $scope.fileUploader = FileUploader;
        $scope.uploadFileList = [];
        $scope.rewriteFileList = [];
        $scope.movedFileList = [];
        $scope.folderCreatedList = [];
        $scope.viewTemplate = $cookies.viewTemplate || 'main-table.html';

        $scope.setTemplate = function(name) {
            $scope.viewTemplate = $cookies.viewTemplate = name;
        };
        $scope.removeUploadFile = function(item) {
            $scope.uploadFileList = _.filter($scope.uploadFileList, function(file){ return file.id != item.id})
        };
        $scope.removeMovedFile = function(item) {
            if(!!item.deleted){
                item.rewrite = false;
            } else {
                $scope.movedFileList = _.filter($scope.movedFileList, function(file){ return file.id != item.id})
            }

        };
        $scope.generateRandomId = function(){
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for( var i=0; i < 16; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        };
        $scope.removeRewriteFile = function(item) {
            $scope.rewriteFileList = _.filter($scope.rewriteFileList, function(file){ return file.id != item.id})
            if(!$scope.rewriteFileList.length){
                $scope.modal("rewrite", true);
            }
        };
        $scope.changeLanguage = function (locale) {
            if (locale) {
                return $translate.use($cookies.language = locale);
            }
            $translate.use($cookies.language || fileManagerConfig.defaultLang);
        };

        $scope.touch = function(item) {
            item = item instanceof Item ? item : new Item();
            item.revert && item.revert();
            $scope.temp = item;
        };

        $scope.smartClick = function(item,event) {
            if(!!event && !!event.shiftKey) return false;
            if (item.isFolder()) {
                return $scope.fileNavigator.folderClick(item);
            } else if (item.model.type == "image") {
                item.getContent();
                $scope.touch(item);
                return $scope.modal('preview')
            } else if (item.model.type == "pdf") {
                item.getBaseContent().then(function(){
                    window.open("data:application/pdf;base64, " + item.model.content);
                });
                //var newTab = $window.open(item.download() , '_blank');
                //newTab.document.write("<object width='400' height='400' data='" + item.download() + "' type='"+ item.model.content_type +"' ></object>");
            } else if (item.model.type == "text") {
                item.getBaseContent();
                $scope.touch(item);
                return $scope.modal('edit');
            } else {
                var element = angular.element('<a/>');
                element.attr({
                    href: item.download(),
                    target: '_blank',
                    download: ""
                })[0].click();
            }
        };

        $scope.modal = function(id, hide) {
            $('#' + id).modal(hide ? 'hide' : 'show')
        };

        $scope.isInThisPath = function(path) {
            var currentPath = $scope.fileNavigator.currentPath.join('/');
            return currentPath.indexOf(path) !== -1;
        };

        $scope.edit = function(item) {
            item.edit().then(function() {
                $scope.modal('edit', true);
            });
        };

        $scope.changePermissions = function(item) {
            item.changePermissions().then(function() {
                $scope.modal('changepermissions', true);
            });
        };

        $scope.copy = function(item) {
            var samePath = item.tempModel.path.join() === item.model.path.join();
            if (samePath && $scope.fileNavigator.fileNameExists(item.tempModel.name)) {
                item.error = $translate.instant('error_invalid_filename');
                return false;
            }
            item.copy().then(function() {
                $scope.fileNavigator.refresh();
                $scope.modal('copy', true);
            });
        };

        $scope.compress = function(item) {
            item.compress().then(function() {
                $scope.fileNavigator.refresh();
                if (! $scope.config.compressAsync) {
                    return $scope.modal('compress', true);
                }
                item.asyncSuccess = true;
            }, function() {
                item.asyncSuccess = false;
            });
        };

        $scope.extract = function(item) {
            item.extract().then(function() {
                $scope.fileNavigator.refresh();
                if (! $scope.config.extractAsync) {
                    return $scope.modal('extract', true);
                }
                item.asyncSuccess = true;
            }, function() {
                item.asyncSuccess = false;
            });
        };

        $scope.remove = function(item) {
            item.remove().then(function() {
                $scope.fileNavigator.refresh();
                $scope.modal('delete', true);
            });
        };

        $scope.rename = function(item) {
            var samePath = item.tempModel.path.join() === item.model.path.join();
            if (samePath && $scope.fileNavigator.fileNameExists(item.tempModel.name)) {
                item.error = $translate.instant('error_invalid_filename');
                return false;
            }
            item.rename().then(function() {
                $scope.fileNavigator.refresh();
                $scope.modal('rename', true);
            });
        };

        $scope.downloadImage = function(item) {
            var element = angular.element('<a/>');
            element.attr({
                href: item.download(),
                target: '_blank',
                download: ""
            })[0].click();
        };
        $scope.printImage = function(item) {
            var model = item.tempModel;
            var popupWin = window.open();
            popupWin.document.open("about:blank", "_blank");
            popupWin.document.write('<html><head><script>function step1(){setTimeout(step2(), 10);}function step2(){console.log(1);window.print();window.close()}</script></head><body onload="window.print();window.close()"><img style="max-width:100%" src="data:'+model.content_type+";base64,"+model.content + '"/></html>');
            popupWin.document.close();
        }

        $scope.createFolder = function(item) {
            var name = item.tempModel.name && item.tempModel.name.trim();
            item.tempModel.type = 'dir';
            item.tempModel.path = $scope.fileNavigator.currentPath;
            if (name && !$scope.fileNavigator.fileNameExists(name)) {
                item.createFolder().then(function() {
                    $scope.fileNavigator.refresh();
                    $scope.modal('newfolder', true);
                });
            } else {
                $scope.temp.error = $translate.instant('error_invalid_filename');
                return false;
            }
        };

        $scope.uploadFiles = function() {
            $scope.fileUploader.upload($scope.uploadFileList).then(function(data) {
                $scope.fileNavigator.refresh();
                $scope.modal('uploadfile', true);
                if(!!data.result.not_upload.length){
                    $scope.rewriteFileList = _.filter($scope.uploadFileList, function(item){
                        return _.findWhere(data.result.not_upload,{name: item.name,path:item.path})
                    });
                    $scope.modal("rewrite", false);
                    $scope.uploadFileList = [];
                } else {
                    $scope.uploadFileList = [];
                }
            }, function(data) {
                var errorMsg = data.result && data.result.error || $translate.instant('error_uploading_files');
                $scope.temp.error = errorMsg;
            });
        };

        $scope.rewriteFiles = function() {
            $scope.fileUploader.rewrite($scope.rewriteFileList).then(function(data) {
                $scope.fileNavigator.refresh();
                $scope.modal('rewrite', true);
                $scope.rewriteFileList = [];
            }, function(data) {
                var errorMsg = data.result && data.result.error || $translate.instant('error_rewriting_files');
                $scope.temp.error = errorMsg;
            });
        };

        $scope.getQueryParam = function(param) {
            var found;
            window.location.search.substr(1).split("&").forEach(function(item) {
                if (param ===  item.split("=")[0]) {
                    found = item.split("=")[1];
                    return false;
                }
            });
            return found;
        };

        $scope.changeLanguage($scope.getQueryParam('lang'));
        $scope.isWindows = $scope.getQueryParam('server') === 'Windows';
        $scope.fileNavigator.refresh(true);

        $scope.moveHandler = function (investedFile, staticFile) {
            var items_array = [];
            _.each(investedFile, function(item){
                items_array.push({
                    name: item.model.name,
                    path: item.model.origin_path,
                    type: item.model.type,
                    id: item.model.id
                })
            });
            $scope.temp.move(items_array, (!!staticFile.model?staticFile.model.origin_path + staticFile.model.name:staticFile.origin_path + staticFile.name) + "/", $scope.fileNavigator.currentPath).then(function(data) {
                $scope.fileNavigator.refresh();
                if(!!data.result.not_moved.length){
                    $scope.movedFileList = data.result.not_moved;
                    $scope.modal("moved", false);
                }
            }, function(data) {
                var errorMsg = data.result && data.result.error || $translate.instant('error_rewriting_files');
                $scope.temp.error = errorMsg;
            });
        };
        $scope.movedFiles = function () {
            $scope.temp.rewriteMoved($scope.movedFileList).then(function(data) {
                $scope.fileNavigator.refresh();
                if(!!data.result.not_moved.length){
                    $scope.movedFileList = data.result.not_moved;
                    $scope.modal("moved", false);
                } else {
                    $scope.movedFileList = [];
                    $scope.modal("moved", true);
                }

            }, function(data) {
                var errorMsg = data.result && data.result.error || $translate.instant('error_rewriting_files');
                $scope.temp.error = errorMsg;
            });
        }
    }]);
})(window, angular, jQuery);
