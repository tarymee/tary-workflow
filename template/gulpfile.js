'use strict';
var path = require('path');
var del = require('del');
var browserSync = require('browser-sync').create();
var gulp = require('gulp');
var gulpif = require('gulp-if');
var plumber = require('gulp-plumber');
var htmlmin = require('gulp-htmlmin'); // 压缩html
var less = require('gulp-less'); // 编译less
var cssnano = require('gulp-cssnano'); // 压缩css
var uglify = require('gulp-uglify'); // 压缩js
var imagemin = require('gulp-imagemin'); // 压缩图片
var pngquant = require('imagemin-pngquant'); // 压缩图片质量
var zip = require('gulp-zip'); // 打包
var babel = require('gulp-babel'); // babel

// 刷新服务器
function browserSyncReload() {
    process.stdout.write('刷新服务器...\n');
    browserSync.reload();
};

// 正则路径
var paths = {
    root: './',
    src: {
        dir: './src',
        file: './src/**/*',
        html: './src/*.html',
        less: './src/css/**/*.less',
        css: './src/css/**/*.css',
        cssDir: './src/css',
        js: './src/js/**/*.js',
        lib: './src/lib/**/*',
        img: './src/img/**/*.{JPG,jpg,png,gif,svg}',
        media: './src/media/**/*'
    },
    dist: {
        dir: './dist',
        file: './dist/**/*',
        html: './dist/*.html',
        htmlDir: './dist',
        css: './dist/css/**/*.css',
        cssDir: './dist/css',
        js: './dist/js/**/*.js',
        jsDir: './dist/js',
        libDir: './dist/lib',
        imgDir: './dist/img',
        sliceDir: './dist/img/slice',
        mediaDir: './dist/media'
    }
};


// 把src文件夹作为服务器开启
function serverSrc() {
    process.stdout.write('starting server on src folder...\n');
    browserSync.init({
        server: {
            baseDir: paths.src.dir,
            directory: true // 打开目录
        },
        notify: false, // 默认: true 显示通知
        // 修改后需要刷新
        files: [
                paths.src.dir
            ]
            // https: true,
            // host: '127.0.0.1',
            // port: 3000,
            // startPath: 'index.html',//启动时先打开
    })
}

// 把dist文件夹作为服务器开启 主要是为了看打包之后的效果与开发时有没有差别
// 必须先用 gulp build 命令创建dist文件夹 才可以开启
function serverDist() {
    process.stdout.write('Starting server on dist folder...\n');
    browserSync.init({
        server: {
            baseDir: paths.dist.dir,
            directory: true // 打开目录
        },
        notify: false, // 默认: true 显示通知
        // 修改后需要刷新
        // files: [
        //     paths.src.dir
        // ]
        // https: true,
        // host: '127.0.0.1',
        // port: 3000,
        // startPath: 'index.html',// 启动时先打开
    })
}

// copy src目录的html到dist目录
function buildHtml() {
    return gulp.src(paths.src.html)
        .pipe(gulp.dest(paths.dist.htmlDir))
}
// 压缩 html
function miniHtml() {
    return gulp.src(paths.dist.html)
        .pipe(htmlmin({
            removeComments: true, // 清除HTML注释
            collapseWhitespace: true, // 压缩HTML
            collapseBooleanAttributes: false, // 省略布尔属性的值 <input checked="true"/> ==> <input />
            removeEmptyAttributes: false, // 删除所有空格的属性值 <input id="" /> ==> <input />
            removeScriptTypeAttributes: true, // 删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true, // 删除<style>和<link>的type="text/css"
            minifyJS: true, // 压缩页面JS
            minifyCSS: true // 压缩页面CSS
        }))
        .pipe(gulp.dest(paths.dist.htmlDir))
}


// 编译 less 到 src
function compileLess() {
    return gulp.src(paths.src.less)
        .pipe(plumber())
        .pipe(less())
        .pipe(gulp.dest(paths.src.cssDir))
}


// copy src目录的css到dist目录
function buildCss() {
    return gulp.src(paths.src.css)
        .pipe(gulp.dest(paths.dist.cssDir))
}

// 压缩dist文件夹的css
function miniCss() {
    return gulp.src(paths.dist.css)
        .pipe(cssnano()) // 压缩css
        .pipe(gulp.dest(paths.dist.cssDir))
}

// copy src目录的js到dist目录
function buildJs() {
    return gulp.src(paths.src.js)
        .pipe(gulp.dest(paths.dist.jsDir))
}

// 压缩 js
function miniJs() {
    return gulp.src(paths.dist.js)
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist.jsDir))
}

// 编译 js 到 src
function compileJs() {
    return gulp.src(paths.src.js)
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(paths.dist.jsDir))
}

// copy lib目录到dist目录
function buildLib() {
    return gulp.src(paths.src.lib)
        .pipe(gulp.dest(paths.dist.libDir))
}

// build media
function buildMedia() {
    return gulp.src(paths.src.media)
        .pipe(gulp.dest(paths.dist.mediaDir))
}

// 压缩图片 并release到dist目录
function buildImg() {
    return gulp.src(paths.src.img)
        .pipe(imagemin({
            // optimizationLevel: 5, // 类型：Number  默认：3  取值范围：0-7（优化等级）
            // progressive: true, // 类型：Boolean 默认：false 无损压缩jpg图片
            // interlaced: true, // 类型：Boolean 默认：false 隔行扫描gif进行渲染
            // multipass: true // 类型：Boolean 默认：false 多次优化svg直到完全优化
            use: [pngquant()] // 使用pngquant深度压缩png图片的imagemin插件
        }))
        .pipe(gulp.dest(paths.dist.imgDir))
}
// 监听文件
function watchCss(cb) {
    process.stdout.write('watching less to compile...\n');
    // gulp.watch([paths.src.less], gulp.parallel(compileLess))
    gulp.watch([paths.src.less])
        .on('change', function(file) {
            process.stdout.write(file + ' has been changed');
            compileLess();
        })
        .on('add', function(file) {
            process.stdout.write(file + ' has been added');
            compileLess();
        })
        .on('unlink', function(file) {
            process.stdout.write(file + ' is deleted');
            // 取文件后缀
            var ext = path.extname(file);
            // 删除生成的css文件
            var tmp = file.replace(ext, '.css');
            del([tmp]);
        })
    cb();
}
// 监听JS文件 转化ES6
function watchJs(cb) {
    process.stdout.write('watching js to compile...\n');
    gulp.watch(paths.src.js)
        .on('change', function(file) {
            process.stdout.write(file + ' has been changed');
            compileJs();
        })
        .on('add', function(file) {
            process.stdout.write(file + ' has been added');
            compileJs();
        })
        .on('unlink', function(file) {
            process.stdout.write(file + ' is deleted');
            // 取文件后缀
            var ext = path.extname(file);
            // 删除生成的css文件
            var tmp = file.replace(ext, '.js');
            del([tmp]);
        })
    cb();
}
// 删除dist下的文件
function delDist() {
    return del(paths.dist.dir).then(function() {
        process.stdout.write('del dist...【done！】\n');
    });
}

// 打包
function buildZip() {
    var dirnames = __dirname.split(path.sep);
    var zipName = dirnames[dirnames.length - 1] + '.zip';
    return gulp.src(paths.dist.file)
        .pipe(zip(zipName))
        .pipe(gulp.dest(paths.root))
}

// 删除zip文件
function delZip() {
    process.stdout.write('del zip file...\n');
    var dirnames = __dirname.split(path.sep);
    var zipName = dirnames[dirnames.length - 1] + '.zip';
    return del('/' + zipName).then(function() {
        process.stdout.write('del zip file...【done！】\n');
    });
}

/**
 * [开发模式]
 * @ Less -> CSS
 * @ 监听文件变动 自动刷新浏览器 (LiveReload)
 */
gulp.task('dev', gulp.series(
    gulp.parallel(
        compileLess
    ),
    gulp.parallel(
        watchCss,
        watchJs
    ),
    serverSrc
));

/**
 * [生产模式]
 * @ src release 到 dist 目录
 * @ 清除HTML注释 压缩HTML
 * @ Less -> CSS -> 压缩
 * @ 压缩JS
 * @ 雪碧图合成
 * @ 图片压缩
 */
gulp.task('build', gulp.series(
    delDist,
    gulp.parallel(compileLess),
    gulp.parallel(buildCss, buildImg, buildHtml, buildJs, buildLib, buildMedia),
    gulp.parallel(miniCss, miniHtml, miniJs)
));

/**
 * [生产模式 - 开发]
 * @ src release 到 dist 目录
 * @ Less -> CSS
 * @ 雪碧图合成
 * @ 图片压缩
 * @ 与 build 模式的区别是没有压缩HTML CSS 和 JS 给开发套页面时方便调试
 */
gulp.task('build-dev', gulp.series(
    delDist,
    gulp.parallel(compileLess),
    gulp.parallel(buildCss, buildImg, buildHtml, buildJs, buildLib, buildMedia)
    // gulp.parallel(miniCss, miniHtml, miniJs)
));

/**
 * [把dist文件夹作为服务器开启]
 * @ 主要是为了看打包之后的效果与开发时有没有区别
 * @ 必须先用 gulp build 命令创建dist文件夹 才可以开启
 */
gulp.task('dist', gulp.series(
    serverDist
));

/**
 * [打包]
 */
gulp.task('zip', gulp.series(delZip, 'build', buildZip, delDist));
gulp.task('zip-dev', gulp.series(delZip, 'build-dev', buildZip, delDist));

/**
 * [帮助]
 */
var styles = {
    'bold': '\x1B[1m',
    'italic': '\x1B[3m',
    'underline': '\x1B[4m',
    'inverse': '\x1B[7m',
    'strikethrough': '\x1B[9m',
    'white': '\x1B[37m',
    'grey': '\x1B[90m',
    'black': '\x1B[30m',
    'blue': '\x1B[34m',
    'cyan': '\x1B[36m',
    'green': '\x1B[32m',
    'magenta': '\x1B[35m',
    'red': '\x1B[31m',
    'yellow': '\x1B[33m',
    'whiteBG': '\x1B[47m',
    'greyBG': '\x1B[49;5;8m',
    'blackBG': '\x1B[40m',
    'blueBG': '\x1B[44m',
    'cyanBG': '\x1B[46m',
    'greenBG': '\x1B[42m',
    'magentaBG': '\x1B[45m',
    'redBG': '\x1B[41m',
    'yellowBG': '\x1B[43m'
};

gulp.task('help', function() {
    console.log('\n');
    console.log(styles.green, 'gulp dev【开发模式】\n');
    console.log(styles.green, 'gulp dist【开启dist目录服务器】\n');
    console.log(styles.green, 'gulp build【打包】\n');
    console.log(styles.green, 'gulp build-dev【打包开发模式 没有压缩HTML CSS JS】\n');
    console.log(styles.green, 'gulp zip【打包压缩 build 模式】\n');
    console.log(styles.green, 'gulp zip-dev【打包压缩 build-dev 模式】\n');
    console.log(styles.green, 'gulp help【查看帮助文档】\n');
})