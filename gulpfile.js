'use strict';
var fs = require('fs');
var del = require('del');
var copy = require('./tasks/copy.js');
var browserSync = require('browser-sync').create();
var browserSyncReload = function () {
    process.stdout.write('刷新服务器...\n');
    browserSync.reload();// 服务器刷新
};
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var htmlmin = require('gulp-htmlmin');
var less = require('gulp-less');
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var sequence = require('gulp-sequence');
var zip = require('gulp-zip');


// 输入当前时间 201611171021
function getNowTime() {
    var now = new Date();
    var fullYear = now.getFullYear();
    var month = now.getMonth();
    var date = now.getDate();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    var time = '' + (fullYear) + (month < 10 ? '0' + (month + 1) : (month + 1)) + (date < 10 ? '0' + date : date) + (hours < 10 ? '0' + hours : hours) + (minutes < 10 ? '0' + minutes : minutes) + (seconds < 10 ? '0' + seconds : seconds);
    return time;
    // return Date.now();
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
        img: './src/img/**/*.{JPG,jpg,png,gif,svg}',
        media: './src/media/**/*'
    },
    dist: {
        dir: './dist',
        file: './dist/**/*',
        htmlDir: './dist',
        cssDir: './dist/css',
        jsDir: './dist/js',
        imgDir: './dist/img',
        mediaDir: './dist/media'
    }
};
var fileName = '';
// 根据用户项目名重新组装项目路径
gulp.task('make-paths', function() {
    try {
        fileName = '/' + fs.readFileSync('./log.txt', 'utf-8');
    } catch (err) {
        if (err.code !== 'ENOENT') throw e;
    }
    paths = {
        src: {
            dir: './src' + fileName,
            file: './src' + fileName + '/**/*',
            html: './src' + fileName + '/**/*.html',
            less: './src' + fileName + '/css/**/*.less',
            sass: './src' + fileName + '/css/**/*.scss',
            css: './src' + fileName + '/css/**/*.css',
            cssDir: './src' + fileName + '/css',
            js: './src' + fileName + '/js/**/*.js',
            img: './src' + fileName + '/img/**/*.{JPG,jpg,png,gif,svg}',
            media: './src' + fileName + '/media/**/*'
        },
        dist: {
            dir: './dist' + fileName,
            file: './dist' + fileName + '/**/*',
            htmlDir: './dist' + fileName,
            cssDir: './dist' + fileName + '/css',
            jsDir: './dist' + fileName + '/js',
            imgDir: './dist' + fileName + '/img',
            mediaDir: './dist' + fileName + '/media'
        }
    };
})


// 初始化任务
gulp.task('default', function() {
    var fileName = '';
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('请输入您想启动或者创建的项目名字【不接受中文】 留空则默认以当前系统时间作为项目名称来创建', (answer) => {
        // 是否为空
        if (answer == '') {
            fileName = getNowTime();
        }else {
            fileName = answer;
        };
        fs.writeFile('./log.txt', fileName, function(err) {
            if (err) {
                throw err;
            }
            fs.exists('./src/' + fileName, function (isExists) {
                if (isExists) {
                    console.log(fileName + '项目已经存在\n请输入gulp init启动项目...');
                    rl.close();
                }else {
                    console.log('正在创建' + fileName + '项目...');
                    gulp.src('./mod/**/*').pipe(gulp.dest('./src/' + fileName)).on('finish', function() {
                        console.log(fileName + '项目创建成功！\n请输入gulp init启动项目...');
                        rl.close();
                    });
                };
            });
        });
    });
    rl.on('close', function() {
        process.exit(0);
    });
})



// 开启服务器
gulp.task('server', function() {
    process.stdout.write('正在启动服务器...\n');
    browserSync.init({
        server: {
            baseDir: paths.src.dir,
            directory: true //打开目录
        },
        notify: false,// 默认: true 显示通知
        // https: true,
        // host: '127.0.0.1',
        // port: 3000,
        // startPath: 'index.html',//启动时先打开
        // 修改后需要刷新
        // files: [
        //     './src/**'
        // ]
    })
})



// 删除dist下的文件
gulp.task('clean', function() {
    process.stdout.write('正在删除dist文件夹...\n');
    del([paths.dist.dir], function () {
        process.stdout.write('删除dist文件夹成功！\n');
    });
})

// 编译less
gulp.task('compile-less', function() {
    process.stdout.write('正在编译less...\n');
    return gulp.src(paths.src.less)
        .pipe(plumber())
        .pipe(less())
        .pipe(gulp.dest(paths.src.cssDir))
        .on('finish', function() {
            process.stdout.write('完成编译less\n');
        })
})

// 编译sass
gulp.task('compile-sass', function() {
    process.stdout.write('正在编译sass...\n');
    return gulp.src(paths.src.sass)
        .pipe(sass())
        .pipe(gulp.dest(paths.src.cssDir))
        .on('finish', function() {
            process.stdout.write('完成编译sass\n');
        })
})

// 压缩css
gulp.task('mini-css', function() {
    process.stdout.write('正在压缩css到dist...\n');
    return gulp.src(paths.src.css)
        .pipe(cssnano())
        .pipe(gulp.dest(paths.dist.cssDir))
        .on('finish', function() {
            process.stdout.write('完成压缩css到dist\n');
        })
})

// build css
gulp.task('build-css', sequence(['compile-less', 'compile-sass'], 'mini-css'))


// build js
gulp.task('build-js', function() {
    process.stdout.write('正在编译压缩js到dist...\n');
    return gulp.src([paths.src.js])
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist.jsDir))
        .on('finish', function() {
            process.stdout.write('完成编译压缩js到dist\n');
        })
})

// build html
gulp.task('build-html', function() {
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
})

// build media
gulp.task('build-media', function() {
    process.stdout.write('正在build媒体文件...\n');
    return gulp.src(paths.src.media)
        .pipe(gulp.dest(paths.dist.mediaDir))
        .on('finish', function() {
            process.stdout.write('完成build媒体文件\n');
        })
})

// build img
gulp.task('build-img', function() {
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
})

gulp.task('watch', function(){
    process.stdout.write('默认任务启动...\n');
    // 监听
    gulp.watch(paths.src.html, browserSyncReload);
    gulp.watch(paths.src.sass, function(event) {
        sequence('compile-sass')(function(err) {
            browserSyncReload();
            if (err) console.log(err)
        })
    });
    gulp.watch(paths.src.less, function(event) {
        sequence('compile-less')(function(err) {
            browserSyncReload();
            if (err) console.log(err)
        })
    });
    gulp.watch(paths.src.js, browserSyncReload);
    gulp.watch(paths.src.img, browserSyncReload);
    gulp.watch(paths.src.media, browserSyncReload);
})


gulp.task('init', sequence('make-paths', ['server', 'compile-less', 'compile-sass'], 'watch'))


// build工程
gulp.task('build', sequence('make-paths', 'clean', ['build-html', 'build-css', 'build-js', 'build-img', 'build-media']))

// 打包
gulp.task('zip', function () {
    sequence('make-paths', 'zip-clean', function () {
        var zipname = fileName + '.zip';
        return gulp.src(paths.dist.file)
            .pipe(zip(zipname))
            .pipe(gulp.dest('./dist'))
    })
})

// var pkg = require('./package.json');
gulp.task('zip-clean', function() {
    var zipname = fileName + '.zip';
    process.stdout.write('正在删除' + zipname + '...\n');
    del.sync(['./dist/' + zipname])
})




var util = require('util');
gulp.task('help', function() {
    // process.stdout.write(util.format('The most commonly available tasks are:\n\n'));
    // process.stdout.write(util.format('\x1b[32m%s', '  node main.js help:    '));
    // process.stdout.write(util.format('\x1b[37m%s', 'get all task info\n\n'));
    // process.stdout.write(util.format('\x1b[32m%s', '  node main.js doc:     '));
    // process.stdout.write(util.format('\x1b[37m%s', 'get front-end framework doc\n\n'));
    // process.stdout.write(util.format('\x1b[32m%s', '  node main.js test:    '));
    // process.stdout.write(util.format('\x1b[37m%s', 'run front-end auto test\n\n'));
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
    console.log(styles.green[0], 'gulp init【初始化之后开启服务器】\n');
    console.log(styles.green[0], 'gulp build【打包】\n');
    console.log(styles.green[0], 'gulp zip【压缩】\n');
    console.log(styles.green[0], 'gulp help【查看帮助文档】\n');

})





