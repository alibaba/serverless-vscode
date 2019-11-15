# Change Log

所有对 "Aliyun Serverless" 插件的更改都将记录在这个文件中。

## 1.16.0 - 2019-11-15
### Added
1. 支持本地 Function Flow 定义文件的可视化展示。
   - 在本地 Flow 定义文件中点击右上角的 Function Flow 图标，将会在新面板中呈现流程的可视化展示。
   - 修改 Flow 定义文件内容，点击面板中的刷新按钮，可看到定义更新后的可视化。

![](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.16.0/localGraph.gif?raw=true)  

2. Function Flow 云端资源信息面板增强。
   - 提供流程与执行基本信息中有关于流程定义的可视化展示。
   - 执行事件历史列表提供执行步骤详情。(单击执行事件列表中的某一行即可看到对应的执行步骤详情)

![](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.16.0/remoteGraph.gif?raw=true)  

3. 本地调用使用的 Event 文件归结到 .vscode 目录下，避免 Event 测试文件被提交到函数代码目录。远端调用复用本地调用配置。
4. 提供远端调用面板，在云端资源列表中单击函数名称可访问相应的调用面板。
   - 未打开工作目录时提供默认调用行为。
   - 提供 Event 文件列表，列表项以及文件内容与本地配置同步。
   - 支持修改 Event 内容发起调用，修改后的内容将自动同步到本地事件文件中。

![](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.16.0/remoteInvoke.gif?raw=true)  

## 1.15.0 - 2019-11-08
### Added
1. 支持更新部署云端 Function Flow 流程。
   - 在 Explorer 面板中，右键流程文件选择 `Deploy Flow`，根据向导输入流程名称等信息。
   - 若输入的流程名称在远端已存在，插件将会弹出是否继续更新的提示框，点击确认后将会进行更新。

![](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.15.0/updateFlow.gif?raw=true)

2. 提供 Function Flow 云端资源信息面板。在云端资源列表中单击流程名称可访问相应的资源信息面板。
   - 提供流程基本信息与流程定义。
   - 提供关于该流程的执行列表信息。
   - 提供执行基本信息与执行事件历史列表。(单击执行列表中的执行名称即可访问相关信息)

![](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.15.0/flow-info.gif?raw=true)

3. 支持在 Function Flow 云端资源信息面板中启动新执行。
   - 在云端资源信息面板中单击 "开始执行"，输入本次执行的名称与输入，单击 "启动执行"。
   - 新执行启动成功后，云端资源信息面板将自动跳转至执行基本信息与执行事件历史列表。

![](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.15.0/startExec.gif?raw=true)

## 1.14.0 - 2019-11-01
### Added
1. 支持部署 Function Flow 流程。
   - 在 Explorer 面板中，右键流程文件选择 `Deploy Flow`，根据向导输入流程名称、流程描述，即可将流程部署至云端。
   - 部署成功后，插件将会自动切换到 Function Flow 视图并刷新远端资源树。
2. 提供 Function Flow 远端资源面板。
   - 未存在流程时提供跳转到函数工作流控制台的方式。
   - 点击流程名称可查看该流程的 Execution 列表以及以树形结构呈现的 Definition。
3. 为 Flow 定义文件提供自定义图标。在插件管理中点击 Aliyun Serverless 插件，在插件信息中左击 'Set File Icon Theme'，选择 Aliyun Serverless 主题即可获得 `*.flow.yml` 文件的自定义图标。

![](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.14.0/changelog.gif?raw=true)

4. 提供 Debugger 插件自动检测。在调试本地 Python 以及 Php 函数时，插件将会检测相应的 Debugger 插件并提示安装。

### Other
1. 修复 fun install 功能在插件端无法使用的 Issue。

## 1.13.0 - 2019-10-23
### Added
1. Function Flow 流程定义文件提供语法智能提示。支持流程定义文件内属性的自动补全、信息校验和上下文帮助。
2. Function Flow 流程定义文件提供层级色彩。在流程定义文件中会根据设定的缩进大小进行彩虹色渲染。

![language-suggestion](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.13.0/language-suggestion.gif?raw=true)

### Other
1. 修复函数运行调试面板有时打开不加载事件文件列表.
2. 屏蔽内置 Fun 的版本自动检测。

## 1.12.3 - 2019-10-16
### Other
1. 适配 1.39 及以上版本的 VSCode。
2. 更新 Win 上 Fun 的下载地址。

## 1.12.0 - 2019-10-13
### Added
- Funfile 文件提供关键字补全以及 fun-install 子命令补全。在 Funfile 文件中输入关键字子串，自动补全会依据输入内容给出精准的提示选项。

![funfile-completion](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.12.0/funfile-completion.gif?raw=true)

- 模版文件 template.yml 自动补全优化。模版文件 template.yml 提供 MemorySize 可选值自动补全列表。

![memorySize-tip](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.12.0/memorySize-tip.gif?raw=true)

- 函数运行调试面板支持配置 Quick Run/Debug 默认事件文件。在函数运行调试面板中，选择相应事件文件并单击 `设为 Quick Run/Debug 默认事件文件`，即可进行相关配置。

### Other
- README 更新优化。

## 1.11.0 - 2019-09-27
### Added
- 函数运行调试面板支持启动长驻型函数。用户可在函数运行调试面板中启动运行或启动调试，启动后通过单击面板中的 "调用" 按钮，可以触发单次的运行或调试。每次点击 "调用" 按钮，Handler 函数都将被执行，Initializer 函数在启动后只会被初始化执行一次。

![invokePanel](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.11.0/invokePanel.gif?raw=true)

- 本地资源树支持拷贝函数。在本地资源面板中，单击函数名后右键函数名选择复制或按 `ctrl/⌘ c`，再右键服务名选择黏贴或单击服务名后按 `ctrl/⌘ v`，即可将指定函数在模版文件 template.yml 中的相关描述定义拷贝到指定服务下。

![copy-paste](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.11.0/copy-paste.gif?raw=true)

### Other
- 优化本地资源树的加载，提高资源树展开的加载速度。
- 优化 fun 命令调用方式。避免多次调试 HTTP Trigger 时，出现调试端口被占用的情况。

## 1.10.0 - 2019-09-20
### Added
- 新增函数运行调试面板。插件将会根据用户设定的函数入口文件，在 Event Trigger 函数入口方法名上显示 Invoke Panel，用户点击后将会跳转至函数运行调试面板。用户可在运行调试面板中新增编辑事件、运行调试函数。

![invokePanel](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.10.0/invokePanel.gif?raw=true)

- 模版文件 template.yml 内提供 Cron 表达式的可读性翻译，并显示该表达式所表示的上一次以及下一次的调用时间(UTC 时间以及本地时间)。用户将鼠标悬浮在模版文件定时触发器的 CronExpression 配置即可看到相关信息。

![cronExpression](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.10.0/cronExpression.png?raw=true)

### Other
- 优化命令顺序以及新增命令注册。
- 修复 win 下 fun 路径带有空格无法调用的 issue。

## 1.9.0 - 2019-09-12
### Added
- 优化 HTTP 触发器调试，调试进程可复用以及支持修改 HTTP 调用参数。指定调试带有 HTTP 触发器的某函数后，会在输出面板提示访问链接，可在浏览器或 Postman 中配置访问参数并进行调试，一次会话结束后可以再次发起调用进行下一次调试。

![http-trigger](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.9.0/http-trigger.gif?raw=true)

- 远端调用功能优化，替换为 Fun Invoke。
- Funfile 文件提供语法高亮以及符号自动补全。

![funfile](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.9.0/funfile.gif?raw=true)

### Other
- 修复 HTTP 触发器无法调试的 Issue。

## 1.8.3 - 2019-09-06
### Added
- 提供模版文件 template.yml 内触发器配置信息的智能提示
  - 支持模版文件 template.yml 内触发器属性的自动补全
  - 支持模版文件 template.yml 内触发器配置信息的校验
  - 支持模版文件 template.yml 内触发器配置的上下文帮助

![tpl-event](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.8.0/tpl-event.gif?raw=true)

- 支持本地启动函数沙箱环境。在本地资源面板中，右击函数名选择启动沙箱环境，即可在沙箱环境中安装依赖或进行配置。

![fun-sbox](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.8.0/fun-sbox.gif?raw=true)

- 支持配置云端服务与函数导入的根目录，通过在 VSCode 中配置 `aliyun.fc.import.base.path` 即可修改导入云端服务与函数时的根目录。

- 将内置 fun 加入终端 `PATH` 中。在 VSCode `Function Compute` 终端中，可以通过输入 `fun.sh` 或 `fun.exe` 使用 fun。

### Other
- 优化插件激活时机
- 更新本地资源面板的右键菜单排序

## 1.7.0 - 2019-08-29
### Added
- 支持引用 nodejs、python runtime 的内置模块。通过插件创建函数后，会弹出模块引用向导。完成向导后，可以在编辑器中引用 runtime 的内置模块以及获得相关智能提示。

![runtime-lib-refer](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.7.0/runtime-lib-refer.gif?raw=true)

- 新增本地调用的配置文件。插件将会根据用户设定的函数入口文件，在函数入口方法名上显示 FC: Invoke Config，左击后将跳转至本地调用配置文件。

- 支持函数级别安装倚赖。在本地资源面板中，右击函数名选择安装倚赖，会弹出安装倚赖向导。完成向导后，相关倚赖将会安装在函数目录中。

![install](https://github.com/alibaba/serverless-vscode/blob/master/media/changelog/v1.7.0/install.gif?raw=true)

- 提供云端触发器资源的显示。在云端资源面板中会显示函数的触发器列表，左击可看到触发器的详细信息。

### Changed
- 默认事件文件名由 event.dat 变更为 event.evt。

### Other
- 支持未打开工作区时调用云端函数。
- 优化部分弹窗显示时机。
- 优化云端视图样式。

## 1.6.2 - 2019-08-26
### Fixed
- 修复本地资源面板顶层 deploy 无效的问题。

## 1.6.1 - 2019-08-25
### Fixed
- 多模版下适配 Terminal 进行命令输出时 PowerShell 不支持 && 的问题。

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
