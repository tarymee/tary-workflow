var tasks = {
    // help: require('./tasks/help'), //命令行帮助提示
    // doc: require('./tasks/doc'), //前端文档命令
    // test: require('./tasks/test'), //前端测试命令
    // perf: require('./tasks/perf'), //前端性能监控命令
    // init: require('./tasks/init'), //前端工程初始化
    // deploy: require('./tasks/deploy'), //前端工程部署命令
    // publish: require('./tasks/publish'), //前端工程打包命令
    build: require('./tasks/build'), //系统编译输出静态资源
    default: require('./tasks/default') //默认命令
}


console.log(process.argv);
// tasks[process.argv[2] || 'default']();
