# Change Log

所有对 "Aliyun Serverless" 插件的更改都将记录在这个文件中。

## 1.2.0 - 2019-07-26

### Fixed
- 使用函数本地执行或本地调试功能，event 文件路径带空格时，无法正确执行。[Track](https://github.com/alibaba/serverless-vscode/issues/16)

### Added
- 提供云端服务与函数资源信息面板。

![提供云端服务与函数资源信息面板](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.2.0/remote-resource-panel.gif?raw=true)

- 支持导入云端服务与函数到本地工作区。

![支持导入云端服务与函数到本地工作区](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.2.0/fun-import.gif?raw=true)

- 支持从 Handler、Initializer 属性跳转到源码文件。在 template.yml 中 Ctrl/⌘ + 鼠标左击函数的 Handler 或 Initializer 属性，可跳转到对应的源码文件。

![template 文件跳转](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.2.0/template-jump.gif?raw=true)

### Other
- 检测到 Fun 工程时自动激活插件。[Track](https://github.com/alibaba/serverless-vscode/issues/18)
- 执行报错输出到 Output 面板而不是错误弹窗。[Track](https://github.com/alibaba/serverless-vscode/issues/24)

## 1.1.0 - 2019-07-19

### Fixed
- 使用函数本地调试功能，在遇到下载镜像时，系统弹出 Failed to attach 错误。[Track](https://github.com/alibaba/serverless-vscode/issues/4)

### Added
- 支持多账户多区域的切换。

![多账户多区域切换](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.1.0/multi-account-region-switch.gif?raw=true)

- 支持多会话调试。允许用户同时调试多个函数，每个函数的调试上下文是独立的。在启动多个调试会话后，可以在 VSCode 调试栏中切换调试会话。

![多会话调试](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.1.0/multi-debug-session.gif?raw=true)

- 函数入口文件添加本地执行与本地调试快捷入口。插件将会根据用户设定的函数入口文件，在函数入口方法名上显示 FC: Local Run 以及 FC: Local Debug，用户点击后将会分别触发该函数的本地执行与本地调试。

![执行与调试快捷入口](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.1.0/local-opt.gif?raw=true)
