# Aliyun Serverless VSCode Extension

Aliyun Serverless VSCode Extension 是阿里云 Serverless 产品 [函数计算 Function Compute](https://www.aliyun.com/product/fc) 的 VSCode 插件，该插件是结合了[函数计算 Fun 工具](https://github.com/aliyun/fun)以及[函数计算 SDK](https://help.aliyun.com/document_detail/53277.html) ，为用户提供 VSCode 图形化开发调试函数计算以及操作函数计算资源的工具。

通过该插件，您可以：
- 快速地在本地初始化项目、创建函数
- 运行、调试本地函数（调试功能目前支持 nodejs、python、php）
- 拉取云端的服务函数列表，执行云端函数
- 部署服务函数至云端，并更新相关配置

## 前置需求
如果您期望使用 Aliyun Serverless VSCode Extension 的所有功能，那么您需要确保系统中有以下组件：
1. VSCode：在 [Visual Studio Code 官网](https://code.visualstudio.com/) 中可以下载安装
2. 函数计算 Fun 工具以及 Docker：可以在 [aliyun/fun](https://github.com/aliyun/fun) 中根据教程安装配置 Fun 以及 Docker

## 安装插件
1. 打开 VSCode 并进入插件市场。
2. 在插件市场中搜索 “Aliyun Serverless”，查看详情并安装。
3. 重启 VSCode，左侧边栏中会展示已安装的 Aliyun Serverless VSCode Extension 插件。

## 快速入门
### 绑定阿里云账户
打开左侧 Aliyun Serverless VSCode Extension，单击绑定阿里云账户的按钮。
![绑定阿里云账户](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/bind-account.png?raw=true)
依次输入阿里云 Account ID，阿里云 Access Key ID，阿里云 Access Key Secret。
![绑定阿里云账户弹窗](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/bind-account-toast.png?raw=true)
绑定完成后，可以看到所绑定的阿里云账户的云端服务与函数列表。
![绑定阿里云账户结果](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/bind-account-result.png?raw=true)
您可以通过切换区域 Region 来查看不同区域的服务与函数。单击云端资源面板的切换区域按钮或 VSCode 下方的区域信息。
![切换区域](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/switch-region.png?raw=true)

### 创建函数
通过 VSCode，打开一个空的目录文件。单击本地资源面板中的创建函数按钮，可以在本地初始化一个函数计算项目。
![创建函数](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/create-func.png?raw=true)
按照导航依次输入或选择服务名称、函数名称、函数运行时、函数类型。填写完毕后，插件会自动创建函数并在本地资源面板中会展示新建的本地服务与函数。
![创建函数结果](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/create-func-result.png?raw=true)

__Tips：__
您也可以直接单击本地资源面板中服务名右侧的创建函数按钮，来为该服务创建函数。按照导航依次输入或选择函数名称、函数运行时、函数类型即可。
![服务创建函数](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/create-func-under-service.png?raw=true)

### 部署服务以及函数
单击本地资源面板中的部署按钮，可以将本地的服务与函数部署到云端。
![部署服务以及函数](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/deploy.png?raw=true)
部署完成后，单击云端资源面板中的刷新按钮，可以查看部署到云端的服务与函数。
![部署服务以及函数结果](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/deploy-result.png?raw=true)

## 其余功能介绍
### 本地调用函数
在本地资源面板中，单击函数名称右侧的执行按钮，可以在本地调用该函数。
![本地调用函数](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-invoke.png?raw=true)
函数的日志以及结果会输出在 Terminal 中。
![本地调用函数结果](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-invoke-result.png?raw=true)

插件会为您在函数入口文件同目录下创建 event.dat 文件，您可以通过修改该文件设置每次调用函数时触发的事件信息。
![本地调用修改事件输入](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-invoke-event.png?raw=true)

### 本地调试函数
在本地资源面板中，单击函数名称右侧的调试按钮，可以在本地调试该函数。
![本地调试函数](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-debug.png?raw=true)
在代码文件中插入断点，启动调试后即可看到调试信息。
![本地调试函数结果](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-debug-result.png?raw=true)
插件会为您在函数入口文件同目录下创建 event.dat 文件，您可以通过修改该文件设置每次调试函数时触发的事件信息。

__注意：__
- 若您想要调试 python 2.7 或 python 3 runtime 的函数，需要事先在插件安装 _Python_ 插件。
- 若您想调试 php runtime 的函数，需要事先在插件安装 _PHP Debug_ 插件。

### 执行云端函数
单击云端资源面板中函数右侧的执行按钮，可以执行云端函数。
![执行云端函数](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/remote-invoke.png?raw=true)
函数的日志以及结果会输出在 Output 中。
![执行云端函数结果](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/remote-invoke-result.png?raw=true)
插件会为您在项目根目录下创建 event.dat 文件，您可以通过修改该文件设置每次调用云端函数时触发的事件信息。
![云端调用修改事件输入](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/remote-invoke-event.png?raw=true)

### 跳转到模版文件定义
[函数计算 Fun 工具](https://github.com/aliyun/fun) 通过 [YAML 格式](https://yaml.org/spec/1.1/) 的模板文件来描述 serverless 应用。通过 Aliyun Serverless VSCode Extension 创建函数时，会使用默认值自动填充模版文件。若您想修改本地服务或函数的配置，可以通过点击本地资源面板中的服务或函数名，跳转到模版文件中的定义。
![跳转到模版文件定义](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/goto-template.png?raw=true)

### 模版文件填充提示
您可以在模版文件中通过输入 Aliyun 或 FC 触发模版文件的填充提示。
![填充提示](https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/template-suggestion.gif?raw=true)

---

欢迎感兴趣的同学加入钉钉群(钉钉群号： 21915868 )。欢迎随时提出宝贵的意见和建议，我们将会根据你们的需求不断完善，力求给大家带来更好的开发体验。

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/two-dimension-code.png?raw=true" width="360px" />
