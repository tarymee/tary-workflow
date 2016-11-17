module.exports = function() {
    'use strict';
    var bs = require('browser-sync');
    var gulp = require('gulp');
    //启动 livereload
    function startServer() {
        process.stdout.write('开启服务器\n');
        process.stdout.write('开启服务器\n');
        bs({
            server: {
                baseDir: './src',
                directory: true //打开目录
            },
            port: 3000,
            // startPath: 'index.html',//启动时先打开
            reloadDelay: 0,
            // 修改后需要刷新
            files: [
                // 'src/*.html',
                // 'src/css/*.css',
                // 'src/js/*.js',
                // 'src/lib/**'
                './src/**'
            ],
            notify: {//自定制livereload 提醒条
                styles: [
                    "margin: 0",
                    "padding: 5px",
                    "position: fixed",
                    "font-size: 10px",
                    "z-index: 9999",
                    "bottom: 0px",
                    "right: 0px",
                    "border-radius: 0",
                    "border-top-left-radius: 5px",
                    "background-color: rgba(60,197,31,0.5)",
                    "color: white",
                    "text-align: center"
                ]
            }
        })
    }
    // 重启
    function startReload() {
        bs.reload();
    }

    gulp.task('default', function(){
        startServer();
    })

};

