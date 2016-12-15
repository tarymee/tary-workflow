var path = require("path");
var gulp = require("gulp");
var sass = require("gulp-sass");
var uglify = require("gulp-uglify");
var spritesmith = require('gulp.spritesmith');
var browserSync = require("browser-sync"); //浏览器同步
var reload = browserSync.reload;
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename'); // 文件重命名
var rev = require('gulp-rev'); // 为静态资源文件替换带MD5的文件名
var revCollector = require('gulp-rev-collector'); // 替换静态资源链接
var changed = require("gulp-changed"); // 尝试change失败
// var imagemin = require('gulp-imagemin'); //图片压缩




// src中 匹配符“!”，“*”，“**”，“{}”的用法 *表示任意字符 **表示任意多个文件夹 ！表示不匹配 {}表示匹配指定某个 多个的话 用逗号分隔如 gulp.src(['src/js/*.js', '!src/js/**/{test1,test2}.js']) 

function getPath(p) {
    return path.resolve(__dirname, "../../../../", p);
}
var _PATH_ = {
    host: getPath("host/2016pclady/201611/md1.3/active"),
    svnHtml: getPath("SVN_collector/data/mobile/2016/mdxy_app"),
    svnCss: getPath("SVN_collector/style_wap/2016/mdxy_app"),
    svnJs: getPath("SVN_collector/allData/js/pclady/lady2016/wap/mdxy_app"),
}

// 上线替换所有静态资源路径操作
gulp.task("online", ["revtpl:online", "revcss:online"]);

gulp.task("revtpl:online", function() {
    return gulp.src(["./rev/**/*.json", "./src/tpl/*.html"])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                './static/css': '//js.3conline.com/wap/pclady/2016/mdxy_app/',
                './static/js': '//js.3conline.com/js/pclady/lady2016/wap/mdxy_app/',
                './static/images': '//www1.pclady.com.cn/global/2016/images/wap/mdxyApp/'
            }
        }))
        .pipe(gulp.dest('./online'));
})
gulp.task("revcss:online", function() {
    return gulp.src(["./rev/**/*.json", "./online/static/*.css"])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                '../images': '//www1.pclady.com.cn/global/2016/images/wap/mdxyApp/'
            }
        }))
        .pipe(gulp.dest('./online'));
})


//SVN 上线操作
gulp.task("svn", ["svnhtml:online", "svncss:online", "svnjs:online"]);
gulp.task("svnhtml:online", function() {
    return gulp.src("./online/*.html")
        .pipe(gulp.dest(_PATH_.svnHtml));
})
gulp.task("svncss:online", function() {
    return gulp.src("./online/*.css")
        .pipe(gulp.dest(_PATH_.svnCss));
})
gulp.task("svnjs:online", function() {
    return gulp.src("./online/*.js")
        .pipe(gulp.dest(_PATH_.svnJs));
})



//编辑预览模式
gulp.task("host", function() {
    return gulp.src(["./dist/*.html", "./dist/**/*.{js,css,png,jpg,gif,mp4}"])
        .pipe(gulp.dest('../../../../host/2016pclady/201611/md1.3/active'));
})


// dev开发环境 添加了监听以及实时刷新功能的task gulp
gulp.task("dev", ["sprite:dev", "image:dev", "tpl:dev", "js:dev", "sass:dev"], function() {
    browserSync.init({
        server: {
            baseDir: "./dist",
            index: 'activeFinal.html'
        },
        notify: false
    })

    gulp.watch("./src/css/*scss", ["sass:dev"])
    gulp.watch("./src/js/*.js", ["js:dev"])
    gulp.watch("./src/tpl/*.html", ["tpl:dev"])

    gulp.watch("./src/images/sp/*.png", ["sprite:dev"])
    gulp.watch(["src/images/**/*.{png,jpg,gif}", "!src/images/sp/*.{png,jpg,gif}"], ["image:dev"])
})

gulp.task("js:dev", function() {
    return browserify({
            //先处理依赖，入口文件
            entries: ["./src/js/index.js"],
            transform: []
        })
        .bundle() // 多文件打包
        .pipe(source("bundle.js")) // browserify
        .pipe(buffer())
        .pipe(rename({
            suffix: '.min'
        })) //一定要注意替换文件名 要放在sourcemap的外面 否则会导致浏览器无法抓取到对应的map文件
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(uglify({
            mangle: true,
            compress: true
        }))
        .pipe(sourcemaps.write('./')) // 写入 .map 文件
        .pipe(gulp.dest("./dist/static/js"))

    .pipe(rev())
        .pipe(gulp.dest("./online"))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/js'))

    .pipe(reload({
        stream: true
    }));
})

gulp.task("sass:dev", function() {
    return gulp.src(["./src/css/activefinal.scss"])
        .pipe(changed("./dist/static/css", {
            extension: '.css'
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("./dist/static/css"))
        .pipe(rev())
        .pipe(gulp.dest("./online/static"))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/css'))
        .pipe(reload({
            stream: true
        }));
})

gulp.task("tpl:dev", function() {
    return gulp.src("./src/tpl/*.html")
        .pipe(gulp.dest("./dist"))
        .pipe(reload({
            stream: true
        }));
})

gulp.task("sprite:dev", function() {
    var spriteData = gulp.src("./src/images/sp/*.png")
        .pipe(spritesmith({
            imgName: 'spriteActive.png',
            imgPath: "../images/spriteActive.png", //scss中引入的图片路径地址
            cssName: 'sprite.scss',
            padding: 2
        }))
    spriteData.img.pipe(buffer())
        // .pipe(imagemin()) //每次压缩图片均会失败
        .pipe(gulp.dest("./dist/static/images"))
        .pipe(rev())
        .pipe(gulp.dest("./online/static/images"))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/sp')) //讲映射表存放到sp文件夹下面

    spriteData.css.pipe(gulp.dest("./src/css/"))
})

gulp.task("image:dev", function() {
    gulp.src(["src/images/**/*.{png,jpg,gif}", "!src/images/sp/*.{png,jpg,gif}"])
        // .pipe(imagemin()) /每次压缩图片均会失败
        .pipe(gulp.dest("./dist/static/images"))
        .pipe(rev())
        .pipe(gulp.dest("./online/static/images"))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/images'))
        .pipe(reload({
            stream: true
        }));
})