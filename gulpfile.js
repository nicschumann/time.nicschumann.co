'use strict';

/** ==========================
 * Global Package Requirements
 * =========================== */
const path = require('path');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const log = require('gulp-logger');
const livereload = require('gulp-livereload');
const autoprefixer = require('gulp-autoprefixer');


/** ===============================
 * Local Configuration Requirements
 * ================================ */
const pkg = require('./package.json');
const paths = pkg.paths;

/** ==================================================
 * Include Paths, Watch Paths, and Compilation Targets
 * =================================================== */
const bourbon_includePaths = require('node-bourbon').includePaths;
const slick_includePaths = path.join(__dirname,'node_modules','slick-carousel', 'slick');

const php_entrypoint = path.join( __dirname, paths.src, '**', '*.!(js|scss|md)' );
const php_exitpoint = path.join( __dirname, paths.dest );

const js_entrypoint = path.join( __dirname, paths.src, 'scripts', 'main.js' );
const js_exitpoint = path.join( __dirname, paths.dest, 'scripts' );
const js_watch_files = path.join( __dirname, paths.src, 'scripts', '**', '*.js' );

const sass_entrypoint = path.join( __dirname, paths.src, 'styles', 'main.scss' );
const sass_exitpoint = path.join( __dirname, paths.dest, 'styles' );
const sass_watch_files = path.join( __dirname, paths.src, 'styles', '**', '*.scss' );

const admin_sass_entrypoint = path.join( __dirname, paths.src, 'styles', 'admin.scss' );
const admin_sass_exitpoint = path.join( __dirname, paths.dest, 'styles' );
const admin_sass_watch_files = [path.join( __dirname, paths.src, 'styles', 'admin.scss' ), path.join( __dirname, paths.src, 'styles', 'admin', '**', '*.scss' )];

const js_bundler = browserify(js_entrypoint).transform( babelify, {presets: ['env']});

/** =============
 * Gulp Processes
 * ============== */


/**
 * This rule compiles the main.scss file, producing
 * a bundle.css output.
 */
function sass_bundle( development ) {
        return function() {

            gulp.src( sass_entrypoint )
                .pipe( sass({
                    includePaths: [ slick_includePaths ].concat( bourbon_includePaths ),
                    errLogToConsole: true,
                    outputStyle: ( development ) ? 'expanded' : 'compressed'
                }).on('error', sass.logError ) )
                .pipe( autoprefixer({
                    browsers: [
                        'last 2 versions',
                        '> 5%',
                        'Firefox ESR'
                    ]
                }))
                .pipe( rename({ basename: 'bundle', ext: '.css' }) )
                .pipe( sourcemaps.write('./', {
                    includeContent: false,
                    sourceRoot: path.join(__dirname, paths.src)
                }))
                .pipe( gulp.dest( sass_exitpoint ) )
                .pipe( livereload() );

        };

}

/**
 * This rule compiles the main.js file, producing
 * a bundle.css output. It also performes source code translation
 * from ES6 to standards compliant browser JS via browserify and babelify.
 */
function js_bundle( development ) {
    return function() {

        return js_bundler.bundle()
            .pipe( source('bundle.js') )
            .pipe( buffer() )
            // .pipe(sourcemaps.init({ loadMaps: true }))
            // .pipe(sourcemaps.write('./'))
            .pipe( livereload() )
            .pipe( gulp.dest( js_exitpoint ) );

    };
}

/**
 * This routine watches all files for changes, and passes those changes
 * to the livereload server, allowing for CSS and image injection, and
 * auto page refresh for other file-types.
 */
function watch() {

    livereload.listen({ start: true, quiet: false });

    gulp.watch('components/**/*.js').on('change', function( file ) { livereload.changed( file.path ); });
    gulp.watch( js_watch_files, ['js']);
    gulp.watch( sass_watch_files, ['scss']);

}


/** =========
 * Gulp Rules
 * ========== */

gulp.task('scss', sass_bundle( process.env.NODE_ENV === 'development' ) );

gulp.task('js', js_bundle( process.env.NODE_ENV === 'development' ) );

gulp.task('watch', watch );

gulp.task('default', ['scss', 'js', 'watch']);
