(function(angular) {
    "use strict";
    angular.module('FileManagerApp').provider("fileManagerConfig", function() {

        var values = {
            appName: "FileManager",
            defaultLang: "en",
            listUrl: "filesystem",
            uploadUrl: "filesystem",
            renameUrl: "filesystem",
            copyUrl: "filesystem",
            removeUrl: "filesystem",
            editUrl: "filesystem",
            getContentUrl: "filesystem",
            createFolderUrl: "filesystem",
            downloadFileUrl: "filesystem",
            compressUrl: "filesystem",
            extractUrl: "filesystem",
            permissionsUrl: "filesystem",

            sidebar: true,
            breadcrumb: true,
            allowedActions: {
                rename: true,
                copy: true,
                edit: true,
                changePermissions: true,
                compress: true,
                compressChooseName: true,
                extract: true,
                download: true,
                preview: true,
                remove: true
            },

            enablePermissionsRecursive: true,
            compressAsync: true,
            extractAsync: true,
            isChrome: navigator.userAgent.toLowerCase().indexOf('chrome') > -1,

            isEditableFilePattern: /\.(txt|html?|aspx?|ini|pl|py|md|css|js|log|htaccess|htpasswd|json|sql|xml|xslt?|sh|rb|as|bat|cmd|coffee|php[3-6]?|java|c|cbl|go|h|scala|vb)$/i,
            isImageFilePattern: /\.(jpe?g|gif|bmp|png|svg|tiff?)$/i,
            isExtractableFilePattern: /\.(gz|tar|rar|g?zip)$/i,
            tplPath: 'templates'
        };

        return { 
            $get: function() {
                return values;
            }, 
            set: function (constants) {
                angular.extend(values, constants);
            }
        };
    
    });
})(angular);
