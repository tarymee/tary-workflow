'use strict';
var fs = require('fs');
var browserSync = require('browser-sync').create();
var gulp = require('gulp');


// 输入当前时间 201611171021
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

// 初始化任务
gulp.task('init', function() {
    var fileName = '';
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('close', function() {
        process.exit(0);
    });

    rl.question('请输入您想创建的项目名字【不接受中文】\n留空则默认以当前系统时间作为项目名称来创建：', (answer) => {
        if (answer == '') {
            fileName = getNowTime();
        } else {
            fileName = answer;
        };
        fs.exists('./project/' + fileName, function(isExists) {
            if (isExists) {
                console.log(fileName + '项目已经存在\n请进入该项目启动服务器...');
                console.log('\n');
                console.log('cd project/' + fileName);
                console.log('gulp dev');
                console.log('\n');
                rl.close();
            } else {
                console.log('正在创建' + fileName + '项目...');
                return gulp.src('./template/**/*')
                    .pipe(gulp.dest('./project/' + fileName))
                    .on('finish', function() {
                        console.log(fileName + '项目创建成功！\n请进入该项目启动服务器...');
                        console.log('\n');
                        console.log('cd project/' + fileName);
                        console.log('gulp dev');
                        console.log('\n');
                        rl.close();
                    });
            };
        });
    });
})

// 开启服务器
gulp.task('server', function() {
    process.stdout.write('starting server...\n');
    browserSync.init({
        server: {
            baseDir: './project',
            directory: true //打开目录
        },
        notify: false, // 默认: true 显示通知
        // // 修改后需要刷新
        // files: [
        //     paths.src.dir
        // ]
        // https: true,
        // host: '127.0.0.1',
        // port: 3000,
        // startPath: 'index.html',//启动时先打开
    })
});

// 帮助
gulp.task('help', function() {
    console.log('\n');
    console.log('gulp init【创建初始化项目】\n');
    console.log('gulp server【把 project 文件夹作为服务器开启】\n');
})