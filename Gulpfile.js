var gulp = require("gulp");
var bower = require("gulp-bower");
var notify = require("gulp-notify");
var sass = require("gulp-sass");
var neat = require("node-neat").includePaths;
var underscore = require('underscore');
var concat = require('gulp-concat');
var underscoreStr = require('underscore.string');
var uglify = require('gulp-uglify');

var exclude = [];

gulp.task("bower", function() {
    bower()
});

gulp.task('icons', function() {
    return gulp.src('./bower_components/font-awesome/fonts/**.*')
        .pipe(gulp.dest('./site/public/fonts'))
})

gulp.task("bundle", function() {
    var bowerFile = require('./bower.json');
    var bowerPackages = bowerFile.dependencies;
    var bowerDir = './bower_components';
    var packagesOrder = [];
    var mainFiles = [];

    // adding package name to packagesOrder in the correct order
    function addPackage(name) {
        var info = require(bowerDir + '/' + name + '/bower.json');
        var dependencies = info.dependencies;

        if(!!dependencies) {
            underscore.each(dependencies, function(value, key) {
                if(exclude.indexOf(key) === -1) {
                    addPackage(key);
                }
            });
        }

        if (packagesOrder.indexOf(name) === -1) {
            packagesOrder.push(name);
        }
    }

    underscore.each(bowerPackages, function(value, key) {
        if(exclude.indexOf(key) === -1) {
            addPackage(key);
        }
    });

    underscore.each(packagesOrder, function(bowerPackage) {
        var info = require(bowerDir + '/' + bowerPackage + '/bower.json');
        var main = info.main;
        var mainFile = main;

        if(underscore.isArray(main)){
            underscore.each(main, function(file) {
                if(underscoreStr.endsWith(file, '.js')) {
                    mainFile = file;
                }
            });
        }

        mainFile = bowerDir + '/' + bowerPackage + '/' + mainFile;

        if(underscoreStr.endsWith(mainFile, '.js')) {
            mainFiles.push(mainFile);
        }
    });

    return gulp.src(mainFiles)
        .pipe(concat('libs.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./site/public/js'))
});