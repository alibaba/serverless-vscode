# Change Log

所有对 "Aliyun Serverless" 插件的更改都将记录在这个文件中。

## 1.4.0 - 2019-08-09
### Added
- 去除了对 Fun CLI 的安装依赖。安装插件后可以直接使用插件的所有功能，无需再额外安装 Fun。
- 支持模版文件 template.yml 内服务与函数配置信息的校验。在 template.yml 中会检测服务与函数的配置信息是否符合[规格说明](https://github.com/alibaba/funcraft/blob/master/docs/specs/2018-04-03-zh-cn.md)，并在不符合的地方进行标示，鼠标移动到标示位置即可看到相关提示信息。

![信息校验](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.4.0/template-validate.gif?raw=true)

- 从本地资源面板跳到模版文件 template.yml 时对应资源描述块会高亮显示。在本地资源面板左击服务名或函数名，会跳转至 template.yml 文件并将相关服务或函数描述块的背景会高亮并逐渐退去。

![高亮显示](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.4.0/template-highlight.gif?raw=true)

- 为模版文件 template.yml 添加自定义图标。在插件管理中点击 Aliyun Serverless 插件，在插件信息中左击 'Set File Icon Theme'，选择 Aliyun Serverless 主题即可获得 template.yml 自定义图标。

![自定义图标](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.4.0/template-icon.gif?raw=true)

## 1.3.1 - 2019-08-02

### Fixed
- 函数入口文件本地执行与本地调试快捷入口在视窗外时，输入内容会导致滚动条抖动。

### Added
- 支持模版文件 template.yml 内属性自动补全。自动补全会依据缩进层级给出更精准的提示选项。

![支持模版文件内所有资源属性的自动补全](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.3.0/template-auto-complete.gif?raw=true)

- 提供模版文件 template.yml 资源配置文档地址。在 template.yml 中，输入符合正确缩进的资源名，会列出匹配的资源名列表，资源名右侧会显示资源配置文档地址，鼠标左击可跳转到相应地址。

![提供模版文件内所有资源的配置文档地址](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.3.0/template-resource-url.gif?raw=true)

- 本地资源面板提供更多菜单项。在本地资源面板的右上角按钮中，提供了更多的菜单选项，如：View Quick Start, View Documentation, Report an Issue 等。

![本地资源面板提供更多菜单项](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.3.0/menu-added.gif?raw=true)

- 支持版本更新通知。当插件更新版本后，会在 VSCode 右下角弹出更新通知，可点击 Release Notes 查看更新内容。

### Other
- 优化模版文件内的代码智能提示。在 template.yml 中，智能提示的展示时机更加精准。
- 优化远端服务资源的信息展示。在服务未配置 NAS 挂载信息时，不展现挂载信息表格。

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
