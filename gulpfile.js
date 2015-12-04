var gulp = require('gulp'),
    angularTemplates = require('gulp-angular-templatecache'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    each = require('gulp-foreach'),
    uglify = require('gulp-uglify'),
    insert = require('gulp-insert'),
    replace = require('gulp-replace'),
    path = require('path');

gulp.task('html', function () {
    return gulp.src('public/js/**/template/*.html')
        .pipe(each(function(stream, file){
            var module = file.path.replace( /.*js\/(.*?)\/.*/gi, "$1"),
                data = file.path.replace(file.path.replace( /.*template\/(.*?)/gi, "$1"), "*.html"),
                data_path = data.replace("*.html", ''),
                filename = module+'/'+path.extname;
             return gulp.src(data)
                 .pipe(angularTemplates({
                     standalone: true,
                     filename: filename,
                     module:module
                 }))
                 .pipe(concat('template.js'))
                 .pipe(gulp.dest(data_path));
        }))
});
gulp.task('js-builder',['html'], function () {
    return gulp.src('public/js/***/**/*.js')
        .pipe(each(function(stream, file){
            var module = file.path.replace( /.*js\/(.*?)\/.*/gi, "$1"),
                data = path.dirname(file.path) + '/*.js',
                data_name_reg = new RegExp('/.*'+module+'/', 'gi'),
                data_name = path.dirname(file.path).replace(data_name_reg, ''),
                data_path = file.path.replace(file.path.replace( /.*js\/(.*?)/gi, "$1"), '');
            if(!(data_name == 'build' || path.basename(file.path) == 'build.js')){
                console.log('create file:' + path.basename(file.path))
                return gulp.src(data)
                    .pipe(concat(data_name+'.js'))
                    .pipe(gulp.dest(data_path + '/' + module + '/build/'));
            } else {
                console.log('not create file:' + path.basename(file.path))
                return gulp.src(data)
            }

        }))
});
gulp.task('js',['html','js-builder'], function () {
    return gulp.src('public/js/**/build/*.js')
        .pipe(each(function(stream, file){
            var module = file.path.replace( /.*js\/(.*?)\/.*/gi, "$1"),
                data = path.dirname(file.path) + '/*.js',
                data_path = file.path.replace(file.path.replace( /.*js\/(.*?)/gi, "$1"), ''),
                replaceMod = "angular.module('"+module+"', [])",
                replaceMod4 = 'angular.module("'+module+'", [])',
                replaceMod2 = "angular.module('"+module+"')",
                replaceMod3 = "}]);";
             return gulp.src(data)
                 .pipe(concat('build.js'))
                 .pipe(replace(replaceMod, ''))
                 .pipe(replace(replaceMod2, ''))
                 .pipe(replace(replaceMod3, '}])'))
                 .pipe(replace(replaceMod4, ''))
                 .pipe(insert.prepend("(function () {\n    'use strict';\n\n angular.module('"+module+"', [])"))
                 .pipe(insert.append("\n\n})();"))
                 .pipe(gulp.dest(data_path + '/' + module + '/'));
        }))
});
gulp.task('watch', ['html','js-builder','js'], function() {
    // Watch our scripts
    gulp.watch(['public/js/**/template/*.html','public/js/**/***/*.js'],[
        'html','js-builder','js'
    ]);
});
gulp.task('default', function() {
    gulp.run('html','js-builder','js');
});
