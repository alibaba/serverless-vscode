# Change Log

所有对 "Aliyun Serverless" 插件的更改都将记录在这个文件中。

## 1.6.0 - 2019-08-22
### Added
- 支持 nodejs10 运行时。
- 支持空模版文件快速构建 ROS 模版。在新建的 template.yml 中，输入 ROS 字样，会出现自动补全的可选项。

![quick-ros](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.6.0/quick-ros.gif?raw=true)

- 支持 template.yml 模版文件资源配置的上下文帮助。在 template.yml 中，将鼠标悬浮在相关资源的键名上，会出现关于该键下可配置字段的悬浮信息展示 (字段名、字段类型、文档地址)。

![template-hover](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.6.0/template-hover.gif?raw=true)

- 支持项目中包含多 template.yml 模版文件。在本地资源面板中会显示多个 template.yml 节点，左击模版文件名称会跳转至对应的 template.yml 模版文件
  - 支持指定 template.yml 模版文件创建函数。在本地资源面板中左击模版文件名称右侧的创建函数按钮，会弹出创建函数向导。完成向导后，相关函数会创建在模版文件的同目录下并将函数描述块自动填充在模版文件中。
  - 支持指定 template.yml 模版文件进行部署。在本地资源面板中右击模版文件名称选择部署，会根据所指定模版文件的描述内容进行部署。

![multi-tmp](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.6.0/multi-tmp.gif?raw=true)

### Other
- 远端调用带有 HTTP 触发器的函数时，在输出面板提供访问链接。
- 本地资源面板监听模版文件变化，进行自动刷新。

## 1.5.0 - 2019-08-15
### Added
- 模版文件 template.yml 提供层级色彩。在 template.yml 中会根据设定的缩进大小进行彩虹色渲染。

![rainbow](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.5.0/rainbow.gif?raw=true)

- 支持服务级别以及函数级别的部署。在本地资源面板中，右击服务名或函数名，选择部署服务或函数，会进行相应的局部部署。

![partial-deploy](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.5.0/partial-deploy.gif?raw=true)

- 本地资源面板提供触发器列表。在本地资源面板中，会在函数下列出该函数的触发器列表，左击触发器名称会跳转至模版文件 template.yml 中的对应行，该触发器描述块的背景会高亮并逐渐退去。

![local-resource-trigger](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.5.0/local-resource-trigger.gif?raw=true)

- 本地资源面板提供 NAS 列表。在本地资源面板中，会在服务下列出该服务的 NAS 挂载点列表。左击 NAS 挂载点名称会跳转至模版文件 template.yml 中的对应行，该 NAS 挂载点描述块的背景会高亮并逐渐退去。
- 支持将本地 NAS 资源同步到云端 NAS 服务。在本地资源面板中，左击 NAS 挂载点名称右侧的上传图标，即可将本地 NAS 资源同步到云端 NAS 服务。
- 支持从本地资源面板快速打开 NAS 挂载点对应的本地 NAS 资源目录。在本地资源面板中，左击 NAS 挂载点名称右侧的文件夹图标，即可打开该 NAS 挂载点对应的本地 NAS 资源目录。

![local-resource-nas](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.5.0/local-resource-nas.gif?raw=true)

### Other
- 支持配置外部 Fun。在 Settings 中可以通过设定 `aliyun.fc.fun.path` 替代插件使用的 fun。


## 1.4.2 - 2019-08-10
### Added
- 补充模版文件 template.yml 资源配置信息的校验。在 template.yml 中会检测资源配置信息是否符合[规格说明](https://github.com/alibaba/funcraft/blob/master/docs/specs/2018-04-03-zh-cn.md)，并在不符合的地方进行标示，鼠标移动到标示位置即可看到相关提示信息。

### Other
- Windows 平台静默下载 Fun。

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
