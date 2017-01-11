### 配置Node.js开发环境

1. 安装nvm
2. 利用nvm安装nodejs
3. 安装 tnpm
4. git (可参考这里[学习](http://pcottle.github.io/learnGitBranching/) )  


请参考[node.js阿里手册](http://node.alibaba-inc.com/env/README.html?spm=0.0.0.0.QpL0Ll)

### 开发指南
开发mode:
    开发app
        1. npm start
        2. npm run devAppMac
    开发core
        1. npm start
        2. npm run devCoreMac

you can also visit http://localhost:7777/index.html


发布mode:
    打包app bundle 
        1. npm run testApp 这个命令会将app打包，并且启动electron来测试该app
        2. npm run deployApp 这个命令会将app打包，并经过zip后拷贝到server/webapps/default/1.0.0/下
    
    发布core(配套默认的app)，生成可执行的exe或者mac app
        1. npm run release (分别打包app和core之后，将app拷贝入core/apps，执行eletron packager打包操作)
        2. npm run test (测试生成的electron core app)
    升级core： 
        1. npm run deployCore, 会执行webpack core, 
          并且将core拷贝到server/webapps/core.js下去
         
目录结构
src/
    app/
        默认的app代码：目前定位是打开一个html页面，并且控制window窗口全屏，刷新
    common/
    core/
        agent核心代码：负责与 server的连接，中转shell和server的通信，升级更新shell等
release/
    app/  app被webpack打包后的产物
    core/ core被webpack打包后的产物
build/
  VMaxAgent-darwin-x64 最终生成发布的产物


注意事项：
electron-v1.4.4-darwin-x64.zip下载很慢，可以提前将其下载好放到~/.electron下面，
plugins/下面的两个文件因为太大，没有加入gitlab,需要自行下载
       PepperFlashPlayer.plugin  
        pepflashplayer.dll  (请参考 http://dutiantech.com/c?id=3)

