'use strict';
var fs = require('fs');
var path = require('path');
var del = require('del');
// var copy = require('./tasks/copy.js');
var browserSync = require('browser-sync').create();
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var htmlmin = require('gulp-htmlmin'); //压缩html
var less = require('gulp-less'); //编译less
var sass = require('gulp-sass'); //编译sass
var cssnano = require('gulp-cssnano'); //压缩css
var uglify = require('gulp-uglify'); //压缩js
var spriter = require('gulp-spriter'); //css图片精灵 https://www.npmjs.com/package/gulp-spriter
var imagemin = require('gulp-imagemin'); //压缩图片
var pngquant = require('imagemin-pngquant'); //压缩图片
// var sequence = require('gulp-sequence'); //gulp异步
var zip = require('gulp-zip'); //打包


// 刷新服务器
function browserSyncReload() {
    process.stdout.write('刷新服务器...\n');
    browserSync.reload();
};

// 返回当前日期 20161117
function getNowTime() {
    var now = new Date();
    var fullYear = now.getFullYear();
    var month = now.getMonth();
    var date = now.getDate();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    var time = '' + (fullYear) + (month < 10 ? '0' + (month + 1) : (month + 1)) + (date < 10 ? '0' + date : date);
    return time;
}

// 正则路径
var paths = {
    src: {
        dir: './src',
        file: './src/**/*',
        html: './src/**/*.html',
        less: './src/css/**/*.less',
        sass: './src/css/**/*.scss',
        css: './src/css/**/*.css',
        cssDir: './src/css',
        js: './src/js/**/*.js',
        lib: './src/lib/**/*',
        img: './src/img/**/*.{JPG,jpg,png,gif,svg}',
        imgSprite: './src/img/sprite/**/*.{JPG,jpg,png}',
        imgSpriteDir: './src/img/sprite',
        media: './src/media/**/*'
    },
    dist: {
        dir: './dist',
        file: './dist/**/*',
        htmlDir: './dist',
        cssDir: './dist/css',
        jsDir: './dist/js',
        libDir: './dist/lib',
        imgDir: './dist/img',
        imgSpriteDir: './dist/img/sprite',
        mediaDir: './dist/media'
    }
};


// 开启服务器
function server() {
    process.stdout.write('正在启动服务器...\n');
    browserSync.init({
        server: {
            baseDir: paths.src.dir,
            directory: true //打开目录
        },
        notify: false,// 默认: true 显示通知
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
// build html
function buildHtml() {
    process.stdout.write('正在压缩html到dist...\n');
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: false,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: false,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    return gulp.src(paths.src.html)
        .pipe(htmlmin(options))
        .pipe(gulp.dest(paths.dist.htmlDir))
        .on('finish', function() {
            process.stdout.write('完成压缩html到dist\n');
        })
}

// 编译less
function compileLess() {
    process.stdout.write('正在编译less...\n');
    return gulp.src(paths.src.less)
        .pipe(plumber())
        .pipe(less())
        .pipe(gulp.dest(paths.src.cssDir))
        .on('finish', function() {
            process.stdout.write('完成编译less\n');
        })
}
// 编译sass
function compileSass() {
    process.stdout.write('正在编译sass...\n');
    return gulp.src(paths.src.sass)
        .pipe(sass())
        .pipe(gulp.dest(paths.src.cssDir))
        .on('finish', function() {
            process.stdout.write('完成编译sass\n');
        })
}
// 压缩css
function buildCss() {
    process.stdout.write('正在压缩css到dist...\n');
    return gulp.src(paths.src.css)
        .pipe(cssnano())
        .pipe(gulp.dest(paths.dist.cssDir))
        .on('finish', function() {
            process.stdout.write('完成压缩css到dist\n');
        })
}


// build js
function buildJs() {
    process.stdout.write('正在编译压缩js到dist...\n');
    return gulp.src([paths.src.js])
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist.jsDir))
        .on('finish', function() {
            process.stdout.write('完成编译压缩js到dist\n');
        })
}

// build media
function buildMedia() {
    process.stdout.write('正在build媒体文件...\n');
    return gulp.src(paths.src.media)
        .pipe(gulp.dest(paths.dist.mediaDir))
        .on('finish', function() {
            process.stdout.write('完成build媒体文件\n');
        })
}
// build img
function buildImg() {
    process.stdout.write('正在压缩图片...\n');
    return gulp.src(paths.src.img)
        .pipe(imagemin({
            // optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            // progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            // interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            // multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        }))
        .pipe(gulp.dest(paths.dist.imgDir))
        .on('finish', function() {
            process.stdout.write('压缩图片成功！\n');
        })
}


//监听文件
function watchCss(cb) {
    process.stdout.write('监听css变动...\n');
    // gulp.watch([paths.src.sass, paths.src.less], gulp.parallel(compileSass, compileLess))
    gulp.watch([paths.src.sass, paths.src.less])
        .on('change', function (file) {
            process.stdout.write(file + ' has been changed');
            compileSass();
            compileLess();
        })
        .on('add', function (file) {
            process.stdout.write(file + ' has been added');
            compileSass();
            compileLess();
        })
        .on('unlink', function (file) {
            process.stdout.write(file + ' is deleted');
            //取文件后缀
            var ext = path.extname(file);
            // 删除生成的css文件
            var tmp = file.replace(ext, '.css');
            del([tmp]);
        })
    cb();
}




// 删除dist下的文件
function delDist() {
    process.stdout.write('正在删除dist文件夹...\n');
    return del(paths.dist.dir, function () {
        process.stdout.write('删除dist文件夹成功！\n');
    });
}
// 打包
function zip() {
    process.stdout.write('正在打包dist文件夹...\n');
    return gulp.src(paths.dist.file)
        .pipe(zip('dist.zip'))
        .pipe(gulp.dest('./'))
        .on('finish', function() {
            process.stdout.write('打包dist.zip成功\n');
        })
}
// 删除zip打包
function delZip() {
    process.stdout.write('正在删除.zip文件...\n');
    return del('./dist.zip', function () {
        process.stdout.write('删除.zip文件成功！\n');
    });
}


gulp.task('default', gulp.series(
    gulp.parallel(
        compileLess,
        compileSass
    ),
    watchCss,
    server
));


gulp.task('build', gulp.series(
    delDist,
    gulp.parallel(
        buildHtml,
        gulp.series(gulp.parallel(compileLess, compileSass), buildCss),
        buildJs,
        buildImg,
        buildMedia
    )
));

// 打包
gulp.task('zip', gulp.series(
    delZip,
    zip,
    delDist
));




// build sprite
gulp.task("sprite", function() {
    var timestamp = +new Date();
    return gulp.src("./src/test/css/index.css")
        .pipe(spriter({
            outpath: "./src/test/img/sprite",//雪碧图输出路径
            sprite: 'sprite'+timestamp+'.png',//雪碧图文件名
            slice: "./src/test/img/slice"//切片文件存放位置，基于根目录
        }))
        .pipe(gulp.dest('./src/test/css/debug'))
})

gulp.task("aaa", function() {
    return gulp.src(paths.src.js)
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist.jsDir))
        .on('finish', function() {
            process.stdout.write('完成编译压缩js到dist\n');
        })
})


// 帮助
gulp.task('help', function() {
    var styles = {
        'bold': ['\x1B[1m'],
        'italic': ['\x1B[3m'],
        'underline': ['\x1B[4m'],
        'inverse': ['\x1B[7m'],
        'strikethrough': ['\x1B[9m'],
        'white': ['\x1B[37m'],
        'grey': ['\x1B[90m'],
        'black': ['\x1B[30m'],
        'blue': ['\x1B[34m'],
        'cyan': ['\x1B[36m'],
        'green': ['\x1B[32m'],
        'magenta': ['\x1B[35m'],
        'red': ['\x1B[31m'],
        'yellow': ['\x1B[33m'],
        'whiteBG': ['\x1B[47m'],
        'greyBG': ['\x1B[49;5;8m'],
        'blackBG': ['\x1B[40m'],
        'blueBG': ['\x1B[44m'],
        'cyanBG': ['\x1B[46m'],
        'greenBG': ['\x1B[42m'],
        'magentaBG': ['\x1B[45m'],
        'redBG': ['\x1B[41m'],
        'yellowBG': ['\x1B[43m']
    };
    console.log(styles.green[0], '\n');
    console.log(styles.green[0], 'gulp【初始化】\n');
    console.log(styles.green[0], 'gulp build【打包】\n');
    console.log(styles.green[0], 'gulp zip【压缩】\n');
    console.log(styles.green[0], 'gulp help【查看帮助文档】\n');

})