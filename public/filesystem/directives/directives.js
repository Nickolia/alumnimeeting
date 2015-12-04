(function(angular) {
    "use strict";
    var app = angular.module('FileManagerApp');

    app.directive('angularFilemanager', ['$parse', 'fileManagerConfig', function($parse, fileManagerConfig) {
        return {
            restrict: 'EA',
            templateUrl: fileManagerConfig.tplPath + '/main.html',
            resolve: {
                SelectedMatter: function($rootScope){
                    return $rootScope.SelectedMatter;
                }
            }
        };
    }]);

    var getSelectableElements = function (element) {
        var out = [];
        var childs = element.children();
        for (var i = 0; i < childs.length; i++) {
            var child = angular.element(childs[i]);
            if (child.scope().isSelectable) {
                out.push(child);
            } else {
                if (child.scope().$id!=element.scope().$id && child.scope().isSelectableZone === true) {

                } else {
                    out = out.concat(getSelectableElements(child));
                }
            }
        }
        return out;
    };

    var offset = function (element) {
        var documentElem,
            box = {
                top: 0,
                left: 0
            },
            doc = element && element.ownerDocument;
        documentElem = doc.documentElement;

        if (typeof element.getBoundingClientRect !== undefined) {
            box = element.getBoundingClientRect();
        }

        return {
            top: box.top + (window.pageYOffset || documentElem.scrollTop) - (documentElem.clientTop || 0),
            left: box.left + (window.pageXOffset || documentElem.scrollLeft) - (documentElem.clientLeft || 0)
        };
    };

    app.directive('ngFile', ['$parse', function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.ngFile);
                var modelSetter = model.assign;

                element.bind('change', function() {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files);
                    });
                });
            }
        };
    }]);

    app.directive('ngRightClick', ['$parse', function($parse) {
        return function(scope, element, attrs) {
            var fn = $parse(attrs.ngRightClick);
            element.bind('contextmenu', function(event) {
                scope.$apply(function() {
                    event.preventDefault();
                    fn(scope, {$event: event});
                });
            });
        };
    }]);
    app.directive('mslFileInput', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attributes) {
                var handler = attributes['mslFileInput'];
                if (!handler) throw 'msl-file-input: You should specify a file selection handler';
                if (!scope[handler]) throw 'msl-file-input: The specified handler doesn\'t exist in your scope';

                element.removeAttr('multiple');
                element.append('<input type="file" ' + ( attributes['multiple'] ? 'multiple' : '' ) + ' style="display: none;">');
                var hidden_file_input = element.children().eq(-1);
                hidden_file_input.bind('change', function (event) {
                    var files = event.target.files;
                    scope.$apply(function () {
                        _.each(files, function(item){
                            item.path = scope.fileNavigator.currentPath.join('/');
                            var find_clone = _.findWhere(scope[handler], {name: item.name, path: item.path, size: item.size, type: item.type});
                            if(!!find_clone) return false;
                            item.id = scope.generateRandomId();
                            scope[handler].push(item);
                        });
                        event.target.value = null; // reset file input
                    });
                });
                element.bind('click', function (event) {
                    if (event.target.lastChild) event.target.lastChild.click();
                });
            }
        };
    });

    app.directive('mslFolderInput', ['fileManagerConfig',function (fileManagerConfig) {
        function folderUploadAvailable() {
            var dummy = document.createElement('input');
            return 'webkitdirectory' in dummy;
        }

        return {
            restrict: 'A',
            link: function (scope, element, attributes) {
                if(!fileManagerConfig.isChrome){
                    element.css({"display": "none"});
                    throw 'msl-file-input: Upload-Folder work only in Browser Google Chrome';
                }
                var handler = attributes['mslFolderInput'];
                if (!handler) throw 'msl-folder-input: You should specify a folder selection handler';
                if (!scope[handler]) throw 'msl-folder-input: The specified handler doesn\'t exist in your scope';

                if (folderUploadAvailable()) {
                    element.append('<input type="file" webkitdirectory  ' + ( attributes['multiple'] ? 'multiple' : '' ) + '  style="display: none;">');
                    var hidden_file_input = element.children().eq(-1);
                    hidden_file_input.bind('change', function (event) {
                        var files = event.target.files;
                        scope.$apply(function () {
                            _.each(files, function(item){
                                item.path = scope.fileNavigator.currentPath.join('/') + "/" +item.webkitRelativePath.substr(0, item.webkitRelativePath.lastIndexOf('/')+1);
                                var find_clone = _.findWhere(scope[handler], {name: item.name, path: item.path, size: item.size, type: item.type});
                                if(!!find_clone) return false;
                                item.id = scope.generateRandomId();
                                scope[handler].push(item);
                            });
                            event.target.value = null; // reset file input
                        });
                    });
                    element.bind('click', function (event) {
                        if (event.target.lastChild) event.target.lastChild.click();
                    });
                } else {
                    element.prop('disabled', true);
                }
            }
        };
    }]);

    app.directive('mslDndFileInput', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attributes) {
                var handler = attributes['mslDndFileInput'];
                if (!handler) throw 'msl-dnd-file-input: You should specify a file selection handler';
                if (!scope[handler]) throw 'msl-dnd-file-input: The specified handler doesn\'t exist in your scope';

                element.bind('dragover', function (event) {
                    event.preventDefault();
                    element.addClass('msl-drag-over');
                });
                element.bind('dragleave', function (event) {
                    element.removeClass('msl-drag-over');
                });
                element.bind('drop', function (event) {
                    event.preventDefault();
                    element.removeClass('msl-drag-over');
                    var handler = attributes['mslDndFileInput'];
                    var files = event.dataTransfer.files;
                    scope.$apply(function () {
                        _.each(files, function(item){
                            item.path = scope.fileNavigator.currentPath.join('/');
                            scope[handler].push(item);
                        });
                    });
                });
            }
        };
    });

    app.directive('mslDndFolderInput', ['fileManagerConfig',function () {
        function folderUploadAvailable() {
            var dummy = document.createElement('input');
            return 'webkitdirectory' in dummy;
        }

        return {
            restrict: 'A',
            link: function (scope, element, attributes) {
                var handler = attributes['mslDndFolderInput'],
                    items_path = attributes['mslDndFolderInputPath'],
                    handler_transfer = attributes['mslDndTarget'];
                if (!!items_path && items_path != "dir") return false;
                if (!handler) throw 'msl-dnd-folder-input: You should specify a folder selection handler';
                if (!scope[handler]) throw 'msl-dnd-folder-input: The specified handler doesn\'t exist in your scope';

                function exploreFolder(item, data_path) {
                    var path_data = item.fullPath.substr(0, item.fullPath.lastIndexOf('/')+1) ;
                    if (item.isFile) {
                        item.file(function (item) {
                            scope.$apply(function () {
                                item.path = (data_path == "/" && path_data != ""?"":data_path) + path_data;
                                var find_clone = _.findWhere(scope[handler], {name: item.name, path: item.path, size: item.size, type: item.type});
                                if(!!find_clone) return false;
                                item.id = scope.generateRandomId();
                                scope[handler].push(item);
                            });
                        });
                    } else if (item.isDirectory) {
                        var directory_reader = item.createReader();
                        directory_reader.readEntries(function(entries) {
                            for (var i = 0; i < entries.length; i++) {
                                var entry = entries[i];
                                exploreFolder(entry, data_path);
                            }
                        });
                    }
                };

                element.bind('dragover', function (event) {
                    event.preventDefault();
                    element.addClass('msl-drag-over');
                });
                element.bind('dragleave', function (event) {
                    element.removeClass('msl-drag-over');
                });
                element.bind('drop', function (event) {
                    event.preventDefault();
                    element.removeClass('msl-drag-over');
                    var items_array = [];
                    event.path.every(function(items) {
                        if(!!items.getAttribute("msl-dnd-folder-input")){
                            if(!!items.getAttribute("msl-dnd-folder-input-path") && items.getAttribute("msl-dnd-folder-input-path") != "dir")return true;
                            items_array.push(items);
                            return false
                        } else {
                            return true;
                        }
                    });
                    if(items_array[0] != element[0]) return false;
                    var data_as_string = event.dataTransfer.getData('text');
                    if(!!handler_transfer && data_as_string != "" ){
                        if(items_path === "dir"){
                            var data = JSON.parse(data_as_string);
                            if(!!scope.item){
                                scope.$apply(function () {
                                    scope[handler_transfer](data, scope.item);
                                });
                            } else {
                                scope.$apply(function () {
                                    scope[handler_transfer](data);
                                });
                            }
                        }
                    } else {
                        if(!!event.dataTransfer.files.length){
                            var data_path = !!items_path?scope.item.model.origin_path + scope.item.model.name:"/"+scope.fileNavigator.currentPath.join('/');
                            if (folderUploadAvailable()) {
                                var roots = event.dataTransfer.items;
                                for (var i = 0; i < roots.length; i++) {
                                    var root = roots[i].webkitGetAsEntry();
                                    exploreFolder(root,data_path);
                                }
                                scope.modal('uploadfile', false);
                            } else {
                                var files = event.dataTransfer.files;
                                scope.$apply(function () {
                                    _.each(files, function(item){
                                        item.path = data_path + "/" +item.webkitRelativePath.substr(0, item.webkitRelativePath.lastIndexOf('/')+1);
                                        scope[handler].push(item);
                                        scope.modal('uploadfile', false);
                                    });
                                });
                            }
                        }

                    }

                });
            }
        };
    }]);

    app.directive('multipleSelectionItem', [function() {
        return {
            scope: true,
            restrict: 'A',
            link: function(scope, element, iAttrs, controller) {
                var binded_object_name = iAttrs['multipleSelectionItem'];
                if (!binded_object_name) throw 'msl-dnd-item: You should specify a scope variable';
                scope.binded_object = scope[binded_object_name];
                if (!scope.binded_object) throw 'msl-dnd-item: The specified scope variable doesn\'t exist';
                scope.isSelectable = true;
                scope.isSelecting = false;
                scope.isSelected = false;
                element.prop('draggable', false);
                element.bind('dragstart', function (event) {
                    if(!!event.shiftKey) return false;
                    var childs = getSelectableElements(element.parent());
                    var selectedArray = [];
                    for (var i = 0; i < childs.length; i++) {
                        if (childs[i].scope().isSelected) {
                            selectedArray.push(childs[i].scope().binded_object);
                        }
                    }
                    var as_json = JSON.stringify(selectedArray);
                    event.dataTransfer.effectAllowed = 'move';;
                    event.dataTransfer.setData('text', as_json);
                });
                element.on('dragend', function(event) {
                    element.prop('draggable', false);
                })
                element.on('mousedown', function(event) {

                    if(!!event.shiftKey) return false;
                    if (element.scope().isSelected) {
                        if (event.ctrlKey) {
                            element.scope().isSelected = false;
                            element.prop('draggable', false);
                            element.scope().$apply();
                        }
                    } else {
                        if (!event.ctrlKey) {
                            var childs = getSelectableElements(element.parent());
                            for (var i = 0; i < childs.length; i++) {
                                if (childs[i].scope().isSelectable) {
                                    if (childs[i].scope().isSelecting === true || childs[i].scope().isSelected === true) {
                                        childs[i].scope().isSelecting = false;
                                        childs[i].scope().isSelected = false;
                                        childs[i].prop('draggable', true);
                                        childs[i].scope().$apply();
                                    }
                                }
                            }
                        }
                        element.scope().isSelected = true;
                        element.prop('draggable', true);
                        element.scope().$apply();

                    }
                    event.stopPropagation();
                });
            }
        };
    }]);
    app.directive('multipleSelectionZone', ['$document', function($document) {
        return {
            scope: true,
            restrict: 'A',
            link: function(scope, element, iAttrs, controller) {

                scope.isSelectableZone = true;

                var startX = 0,
                    startY = 0;
                var helper;

                /**
                 * Check that 2 boxes hitting
                 * @param  {Object} box1
                 * @param  {Object} box2
                 * @return {Boolean} is hitting
                 */
                function checkElementHitting(box1, box2) {
                    return (box2.beginX <= box1.beginX && box1.beginX <= box2.endX || box1.beginX <= box2.beginX && box2.beginX <= box1.endX) &&
                        (box2.beginY <= box1.beginY && box1.beginY <= box2.endY || box1.beginY <= box2.beginY && box2.beginY <= box1.endY);
                }

                /**
                 * Transform box to object to:
                 *  beginX is always be less then endX
                 *  beginY is always be less then endY
                 * @param  {Number} startX
                 * @param  {Number} startY
                 * @param  {Number} endX
                 * @param  {Number} endY
                 * @return {Object} result Transformed object
                 */
                function transformBox(startX, startY, endX, endY) {

                    var result = {};

                    if (startX > endX) {
                        result.beginX = endX;
                        result.endX = startX;
                    } else {
                        result.beginX = startX;
                        result.endX = endX;
                    }
                    if (startY > endY) {
                        result.beginY = endY;
                        result.endY = startY;
                    } else {
                        result.beginY = startY;
                        result.endY = endY;
                    }
                    return result;
                }

                /**
                 * Method move selection helper
                 * @param  {Element} hepler
                 * @param  {Number} startX
                 * @param  {Number} startY
                 * @param  {Number} endX
                 * @param  {Number} endY
                 */
                function moveSelectionHelper(hepler, startX, startY, endX, endY) {

                    var box = transformBox(startX, startY, endX, endY);

                    helper.css({
                        "top": box.beginY + "px",
                        "left": box.beginX + "px",
                        "width": (box.endX - box.beginX) + "px",
                        "height": (box.endY - box.beginY) + "px"
                    });
                }


                /**
                 * Method on Mouse Move
                 * @param  {Event} @event
                 */
                function mousemove(event) {
                    // Prevent default dragging of selected content
                    event.preventDefault();
                    // Move helper
                    moveSelectionHelper(helper, startX, startY, event.pageX, event.pageY);
                    // Check items is selecting
                    var childs = getSelectableElements(element);
                    for (var i = 0; i < childs.length; i++) {
                        if (checkElementHitting(transformBox(offset(childs[i][0]).left, offset(childs[i][0]).top, offset(childs[i][0]).left + childs[i].prop('offsetWidth'), offset(childs[i][0]).top + childs[i].prop('offsetHeight')), transformBox(startX, startY, event.pageX, event.pageY))) {
                            if (childs[i].scope().isSelecting === false) {
                                childs[i].scope().isSelecting = true;
                                childs[i].scope().$apply();
                            }
                        } else {
                            if (childs[i].scope().isSelecting === true) {
                                childs[i].scope().isSelecting = false;
                                childs[i].scope().$apply();
                            }
                        }
                    }
                }



                /**
                 * Event on Mouse up
                 * @param  {Event} event
                 */
                function mouseup(event) {
                    // Prevent default dragging of selected content
                    event.preventDefault();
                    // Remove helper
                    helper.remove();
                    // Change all selecting items to selected
                    var childs = getSelectableElements(element);

                    for (var i = 0; i < childs.length; i++) {
                        if (childs[i].scope().isSelecting === true) {
                            childs[i].scope().isSelecting = false;

                            childs[i].scope().isSelected = event.ctrlKey ? !childs[i].scope().isSelected : true;
                            childs[i].prop('draggable', true);
                            childs[i].scope().$apply();
                        } else {
                            if (checkElementHitting(transformBox(childs[i].prop('offsetLeft'), childs[i].prop('offsetTop'), childs[i].prop('offsetLeft') + childs[i].prop('offsetWidth'), childs[i].prop('offsetTop') + childs[i].prop('offsetHeight')), transformBox(event.pageX, event.pageY, event.pageX, event.pageY))) {
                                if (childs[i].scope().isSelected === false) {
                                    childs[i].scope().isSelected = true;
                                    childs[i].prop('draggable', true);
                                    childs[i].scope().$apply();
                                }
                            }
                        }
                    }
                    // Remove listeners
                    $document.off('mousemove', mousemove);
                    $document.off('mouseup', mouseup);
                }

                element.on('mousedown', function(event) {
                    // Prevent default dragging of selected content
                    if(!event.shiftKey) return false;
                    event.preventDefault();
                    if (!event.ctrlKey) {
                        // Skip all selected or selecting items
                        var childs = getSelectableElements(element);
                        for (var i = 0; i < childs.length; i++) {
                            if (childs[i].scope().isSelecting === true || childs[i].scope().isSelected === true) {
                                childs[i].scope().isSelecting = false;
                                childs[i].scope().isSelected = false;
                                childs[i].prop('draggable', false);
                                childs[i].scope().$apply();
                            }
                        }
                    }
                    // Update start coordinates
                    startX = event.pageX;
                    startY = event.pageY;
                    // Create helper
                    helper = angular
                        .element("<div></div>")
                        .addClass('select-helper');

                    $document.find('body').eq(0).append(helper);
                    // Attach events
                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                });
            }
        };
    }]);

    
})(angular);
