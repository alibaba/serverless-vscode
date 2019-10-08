# Aliyun Serverless VSCode Extension
[![Version](https://vsmarketplacebadge.apphb.com/version/aliyun.aliyun-serverless.svg)](https://marketplace.visualstudio.com/items?itemName=aliyun.aliyun-serverless) ![Downloads](https://vsmarketplacebadge.apphb.com/downloads-short/aliyun.aliyun-serverless.svg)

Aliyun Serverless VSCode Extension 是阿里云 Serverless 产品 [函数计算 Function Compute](https://www.aliyun.com/product/fc) 的 VSCode 插件，该插件结合了[函数计算 Fun 工具](https://github.com/aliyun/fun)以及[函数计算 SDK](https://help.aliyun.com/document_detail/53277.html) ，是一款 VSCode 图形化开发调试函数计算以及操作函数计算资源的工具。

通过该插件，您可以：
- 快速地在本地初始化项目、创建服务函数
- 运行调试本地函数、部署服务函数至云端
- 拉取云端的服务函数列表、查看服务函数配置信息、调用云端函数
- 获得模版文件的语法提示: 自动补全、Schema 校验、悬浮提示

## 前置需求
如果您期望使用 Aliyun Serverless VSCode Extension 的所有功能，那么您需要确保系统中有以下组件：
1. VSCode：在 [Visual Studio Code 官网](https://code.visualstudio.com/) 中可以下载安装
2. Docker：可以根据 [aliyun/fun](https://github.com/alibaba/funcraft/blob/master/docs/usage/installation-zh.md) 中的教程安装配置 Docker

## 安装插件
1. 打开 VSCode 并进入插件市场。
2. 在插件市场中搜索 “Aliyun Serverless”，查看详情并安装。
3. 重启 VSCode，左侧边栏中会展示已安装的 Aliyun Serverless VSCode Extension 插件。

## 快速入门
### 绑定阿里云账户
打开左侧 Aliyun Serverless VSCode Extension，单击绑定阿里云账户的按钮。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/bind-account.png?raw=true" width="300" height="200"/>

依次输入阿里云 Account ID，阿里云 Access Key ID，阿里云 Access Key Secret。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/bind-account-toast.png?raw=true" width="600" height="350">

绑定完成后，可以看到所绑定的阿里云账户的云端服务与函数列表。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/bind-account-result.png?raw=true" width="600" height="350">

您可以通过切换区域 Region 来查看不同区域的服务与函数。单击云端资源面板的切换区域按钮或 VSCode 下方的区域信息。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/switch-region.png?raw=true" width="600" height="350">

### 创建函数
通过 VSCode，打开一个空的目录文件。单击本地资源面板中的创建函数按钮，可以在本地初始化一个函数计算项目。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/create-func.png?raw=true" width="360" height="200">

按照导航依次输入或选择服务名称、函数名称、函数运行时、函数类型。填写完毕后，插件会自动创建函数并在本地资源面板中会展示新建的本地服务与函数。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/create-func-toast.png?raw=true" width="600" height="200">

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/create-func-result.png?raw=true" width="600" height="400">

__Tips：__
您也可以直接单击本地资源面板中模版文件名或服务名右侧的创建函数按钮来创建函数。按照导航依次输入或选择服务名称、函数名称、函数运行时、函数类型即可。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/create-func-under-tmp.png?raw=true" width="350" height="150">

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/create-func-under-service.png?raw=true" width="350" height="150">

### 部署服务以及函数
单击本地资源面板中的部署按钮，可以将本地的服务与函数部署到云端。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/deploy.png?raw=true" width="350" height="150">

部署完成后，单击云端资源面板中的刷新按钮，可以查看部署到云端的服务与函数。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/deploy-result.png?raw=true" width="350" height="200">

__Tips：__
您也可以右键本地资源面板中的模版文件名、服务名、函数名，在上下文菜单中选择部署，从而按照模版文件、服务、函数的粒度进行部署。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/deploy-under-tmp.png?raw=true" width="350" height="200">

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/deploy-under-service.png?raw=true" width="350" height="200">

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/deploy-under-func.png?raw=true" width="350" height="300">

## 其余功能介绍
### 本地调用函数
在本地资源面板中，单击函数名称右侧的执行按钮或单击函数入口文件中入口函数上方的 `Local Run`，可以在本地调用该函数。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-invoke.png?raw=true" width="600" height="300">

函数的日志以及结果会输出在 Terminal 中。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-invoke-result.png?raw=true" width="600" height="400">

插件会为您在函数入口文件同目录下创建 event.evt 文件，您可以通过修改该文件设置每次调用函数时触发的事件信息。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-invoke-event.png?raw=true" width="350" height="200">

### 本地调试函数
在本地资源面板中，单击函数名称右侧的调试按钮或单击函数入口文件中入口函数上方的 `Local Debug`，可以在本地调试该函数。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-debug.png?raw=true" width="600" height="300">

在代码文件中插入断点，启动调试后即可看到调试信息。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-debug-result.png?raw=true" width="600" height="400">

插件会为您在函数入口文件同目录下创建 event.evt 文件，您可以通过修改该文件设置每次调试函数时触发的事件信息。

__注意：__
- 若您想要调试 python 2.7 或 python 3 runtime 的函数，需要事先在插件安装 _Python_ 插件。
- 若您想调试 php runtime 的函数，需要事先在插件安装 _PHP Debug_ 插件。

### 执行云端函数
单击云端资源面板中函数右侧的执行按钮，可以执行云端函数。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/remote-invoke.png?raw=true" width="350" height="200">

函数的日志以及结果会输出在 Output 中。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/remote-invoke-result.png?raw=true" width="600" height="150">

插件会为您在项目根目录下创建 event.evt 文件，您可以通过修改该文件设置每次调用云端函数时触发的事件信息。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/remote-invoke-event.png?raw=true" width="350" height="200">

### 跳转到模版文件定义
[函数计算 Fun 工具](https://github.com/aliyun/fun) 通过 [YAML 格式](https://yaml.org/spec/1.1/) 的模板文件来描述 serverless 应用。通过 Aliyun Serverless VSCode Extension 创建函数时，会使用默认值自动填充模版文件。若您想修改本地服务或函数的配置，可以通过点击本地资源面板中的模版文件名、服务名或函数名，跳转到模版文件中的相关描述，所选择资源在模版文件中的相关描述块会高亮并逐渐褪去。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/goto-template.png?raw=true" width="450" height="225">

### 模版文件语法提示
- 自动补全

支持模版文件 template.yml 内所有资源配置属性的自动补全。自动补全会依据缩进层级给出精准的提示选项。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/tmp-auto-complete.png?raw=true" width="400" height="250">

- 错误校验

支持模版文件 template.yml 内所有资源配置信息的校验。在 template.yml 中会检测资源的配置信息是否符合[规格说明](https://github.com/alibaba/funcraft/blob/master/docs/specs/2018-04-03-zh-cn.md)，并在不符合的地方进行标示，鼠标移动到标示位置即可看到相关提示信息。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/tmp-validate.png?raw=true" width="450" height="225">

- 悬浮提示

提供模版文件 template.yml 内所有资源配置的上下文帮助。在 template.yml 中，将鼠标悬浮在相关资源的键名上，会出现关于该键下可配置字段的悬浮信息展示 (字段名、字段类型、文档地址)。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/tmp-hover.png?raw=true" width="400" height="250">

---

欢迎感兴趣的同学加入钉钉群(钉钉群号： 21915868 )。欢迎随时提出宝贵的意见和建议，我们将会根据你们的需求不断完善，力求给大家带来更好的开发体验。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/two-dimension-code.png?raw=true" width="360px" />
