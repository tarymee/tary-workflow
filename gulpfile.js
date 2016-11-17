'use strict';
var del = require('del');
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

// 正则路径
var paths = {
    src: {
        dir: './src',
        html: './src/**/*.html',
        less: './src/css/**/*.less',
        sass: './src/css/**/*.scss',
        css: './src/css/**/*.css',
        css1: './src/css',
        js: './src/js/**/*.js',
        img: './src/img/**/*.{JPG,jpg,png,gif,svg}',
        media: './src/media/**/*'
    },
    dist: {
        dir: './dist',
        html: './dist',
        css: './dist/css',
        js: './dist/js',
        img: './dist/img',
        media: './dist/media'
    }
};

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
        // host: "127.0.0.1",
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
        .pipe(gulp.dest(paths.src.css1))
        .on('finish', function() {
            process.stdout.write('完成编译less\n');
        })
})

// 编译sass
gulp.task('compile-sass', function() {
    process.stdout.write('正在编译sass...\n');
    return gulp.src(paths.src.sass)
        .pipe(sass())
        .pipe(gulp.dest(paths.src.css1))
        .on('finish', function() {
            process.stdout.write('完成编译sass\n');
        })
})

// 压缩css
gulp.task('mini-css', function() {
    process.stdout.write('正在压缩css到dist...\n');
    return gulp.src(paths.src.css)
        .pipe(cssnano())
        .pipe(gulp.dest(paths.dist.css))
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
        .pipe(gulp.dest(paths.dist.js))
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
        .pipe(gulp.dest(paths.dist.html))
        .on('finish', function() {
            process.stdout.write('完成压缩html到dist\n');
        })
})

// build media
gulp.task('build-media', function() {
    process.stdout.write('正在build媒体文件...\n');
    return gulp.src(paths.src.media)
        .pipe(gulp.dest(paths.dist.media))
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
        .pipe(gulp.dest(paths.dist.img))
        .on('finish', function() {
            process.stdout.write('压缩图片成功！\n');
        })
})



// 默认任务：启动服务器 编译less和sass 监听文件变动刷新服务器
gulp.task('default', ['server', 'compile-less', 'compile-sass'], function(){
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


// 测试任务
gulp.task('t', function() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('请输入您想启动或者创建的项目名字【不接受中文】? ', (answer) => {
        // TODO: Log the answer in a database
        console.log('Thank you for your valuable feedback:', answer);
        rl.close();
    });
    // close事件监听
    rl.on("close", function() {
        // 结束程序
        process.exit(0);
    });
})








// build工程
gulp.task('build', sequence('clean', ['build-html', 'build-css', 'build-js', 'build-img', 'build-media']))


// 打包
var pkg = require('./package.json');
var zipname = pkg.name + ".zip";
gulp.task('zip-clean', function() {
    del.sync([zipname])
})

gulp.task('zip', ['zip-clean'], function() {
    return gulp.src(['dist/**'])
        .pipe(zip(zipname))
        .pipe(gulp.dest('./'))
})