# Aliyun Serverless Extension

Aliyun Serverless Extension 是阿里云 Serverless 产品 [函数计算 Function Compute](https://www.aliyun.com/product/fc) 的 VSCode IDE 插件，该插件是结合了[函数计算 Fun 工具](https://github.com/aliyun/fun)以及[函数计算 SDK](https://help.aliyun.com/document_detail/53277.html) ，为用户提供 VSCode 图形化开发调试函数计算以及操作函数计算资源的工具。

通过该插件，您可以：
- 快速地在本地初始化项目、创建函数
- 运行、调试本地函数（调试功能目前支持 nodejs、python、php）
- 拉取云端的服务函数列表，执行云端函数
- 部署服务函数至云端，并更新相关配置

## 前置需求
如果您期望使用 Aliyun Serverless Extension 的所有功能，那么您需要确保系统中有以下组件：
1. VSCode IDE：在 [Visual Studio Code 官网](https://code.visualstudio.com/) 中可以下载安装
2. 函数计算 Fun 工具以及 Docker：可以在 [aliyun/fun](https://github.com/aliyun/fun) 中根据教程安装配置 Fun 以及 Docker

## 安装插件
1. 打开 VSCode IDE 并进入插件市场。
2. 在插件市场中搜索“Aliyun Serverless Extension”，查看详情并安装。
3. 重启 VSCode IDE，左侧边栏中会展示已安装的 Aliyun Serverless Extension 插件。

## 功能介绍
### 绑定阿里云账户
打开左侧 Aliyun Serverless Extension，单击绑定阿里云账户的按钮。
![绑定阿里云账户](https://yqfile.alicdn.com/159c4426cba3cb8c8922c40db6cfdf20ea20baed.png)
依次输入阿里云 Account ID，阿里云 Access Key ID，阿里云 Access Key Secret。
![绑定阿里云账户弹窗](https://yqfile.alicdn.com/c7f440c39fde79ef576285f63c347ce11de1cf85.png)
绑定完成后，可以看到所绑定的阿里云账户的云端服务与函数列表。
![绑定阿里云账户结果](https://yqfile.alicdn.com/ea07d8e4e01ac11e9c7f07d01b07eb461b7eeb92.png)
您可以通过切换区域 Region 来查看不同区域的服务与函数。单击云端资源面板的切换区域按钮或 VSCode IDE 下方的区域信息。
![切换区域](https://yqfile.alicdn.com/660f217e0f353315113ca87d6c8c6e4206b0ceb0.png)

### 创建函数
通过 VSCode IDE，打开一个空的目录文件。单击本地资源面板中的创建函数按钮，可以在本地初始化一个函数计算项目。
![创建函数](https://yqfile.alicdn.com/2bf238b36a91d26d794473dcc7deec006e130124.png)
按照导航依次输入或选择服务名称、函数名称、函数运行时、函数类型。填写完毕后，插件会自动创建函数并在本地资源面板中会展示新建的本地服务与函数。
![创建函数结果](https://yqfile.alicdn.com/52620740a01641dafbfc6379157467487a531992.png)

__Tips：__
您也可以直接单击本地资源面板中服务名右侧的创建函数按钮，来为该服务创建函数。按照导航依次输入或选择函数名称、函数运行时、函数类型即可。
![服务创建函数](https://yqfile.alicdn.com/a258807f5356d42c74cc09626fcb40621e272a79.png)

### 本地调用函数
在本地资源面板中，单击函数名称右侧的执行按钮，可以在本地调用该函数。
![本地调用函数](https://yqfile.alicdn.com/3cdc8c09e849e351a75491f59185a5e114d20a6f.png)
函数的日志以及结果会输出在 Terminal 中。
![本地调用函数结果](https://yqfile.alicdn.com/714eefc653a41947ebceef5a781bdf0e7cb235f1.png)

插件会为您在函数入口文件同目录下创建 event.dat 文件，您可以通过修改该文件设置每次调用函数时触发的事件信息。
![本地调用修改事件输入](https://yqfile.alicdn.com/78332e3ab53dd926d7c1d5b6126d31a37563bac5.png)

### 本地调试函数
在本地资源面板中，单击函数名称右侧的调试按钮，可以在本地调试该函数。
![本地调试函数](https://yqfile.alicdn.com/d480bcf52e3acf7f843679c9da71476912183e08.png)
在代码文件中插入断点，启动调试后即可看到调试信息。
![本地调试函数结果](https://yqfile.alicdn.com/d62ba822b045aff8af32d3e9f88a9f5487737b6a.png)
插件会为您在函数入口文件同目录下创建 event.dat 文件，您可以通过修改该文件设置每次调试函数时触发的事件信息。

__注意：__
- 若您想要调试 python 2.7 或 python 3 runtime 的函数，需要事先在插件安装 _Python_ 插件。
- 若您想调试 php runtime 的函数，需要事先在插件安装 _PHP Debug_ 插件。

### 部署服务以及函数
单击本地资源面板中的部署按钮，可以将本地的服务与函数部署到云端。
![部署服务以及函数](https://yqfile.alicdn.com/d89adf8f8884b5be39723479071ce22c0857a277.png)
部署完成后，单击云端资源面板中的刷新按钮，可以查看部署到云端的服务与函数。
![部署服务以及函数结果](https://yqfile.alicdn.com/782eb26ee2d9a4d3a7380eda629e7cbed37bd11a.png)

### 执行云端函数
单击云端资源面板中函数右侧的执行按钮，可以执行云端函数。
![执行云端函数](https://yqfile.alicdn.com/4911d22f4fa1508752896610908f2ea9924dccd2.png)
函数的日志以及结果会输出在 Output 中。
![执行云端函数结果](https://yqfile.alicdn.com/e31b0b43145527fa27aefc93ec8924fd1d92bdfa.png)
插件会为您在项目根目录下创建 event.dat 文件，您可以通过修改该文件设置每次调用云端函数时触发的事件信息。
![云端调用修改事件输入](https://yqfile.alicdn.com/97cabf800c054efcf5e3e157d2d999be68041270.png)

---

欢迎感兴趣的同学加入钉钉群(钉钉群号： 21915868 )。欢迎随时提出宝贵的意见和建议，我们将会根据你们的需求不断完善，力求给大家带来更好的开发体验。

<img src="https://yqfile.alicdn.com/3be4e20f9076e109b04b9924b9443da7a73af46d.png" width="200px" height="200px" />
