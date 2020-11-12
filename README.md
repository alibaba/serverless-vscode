# Aliyun Serverless VSCode Extension

[![Version](https://vsmarketplacebadge.apphb.com/version/aliyun.aliyun-serverless.svg)](https://marketplace.visualstudio.com/items?itemName=aliyun.aliyun-serverless) [![Downloads](https://vsmarketplacebadge.apphb.com/downloads/aliyun.aliyun-serverless.svg)](https://marketplace.visualstudio.com/items?itemName=aliyun.aliyun-serverless) [![Installs](https://vsmarketplacebadge.apphb.com/installs/aliyun.aliyun-serverless.svg)](https://marketplace.visualstudio.com/items?itemName=aliyun.aliyun-serverless)

### [Chinese](README-zh.md)

Aliyun Serverless VSCode Extension is a graphic development, debugging, and resource-managing tool for Function Compute based on Visual Studio Code (VS Code). This topic describes how to use the extension to create a function and other common features.

Provided by Function Compute, Aliyun Serverless VSCode Extension is a VS Code-based development, debugging, and deployment tool that integrates the features of the Function Compute command line tool Fun and Function Compute SDK. You can use this extension to:

- Initialize projects and create functions locally.
- Run, debug, and deploy local functions of your services to Function Compute.
- Obtain functions and their specifications and invoke functions from Function Compute.
- Obtain syntax prompts for template files. The prompts include automatic completion, schema validation, and hovering prompts.

## Prerequisites

If you want to use all features provided by Aliyun Serverless VSCode Extension, ensure that the following components have been configured locally:

- VS Code: You can download this component from the [Visual Studio Code](https://code.visualstudio.com/) official website.
- Docker: For information about how to download and configure this component, visit [aliyun/fun](https://github.com/alibaba/funcraft/blob/master/docs/usage/installation.md).

## Install the extension

- Start VS Code and go to the extension marketplace.
- Search for Aliyun Serverless, view the details, and install the extension.
- Restart VS Code. The extension icon is displayed in the left-side activity bar.

## Quick start

### Bind an Alibaba Cloud account.

In the left-side activity bar, click the Aliyun Serverless VSCode Extension icon, and click Bind New Account.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/bind-account.png?raw=true" width="300" height="200"/>

Enter the account ID, AccessKey ID, AccessKey secret, and the local name of the account in sequence.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/bind-account-toast.png?raw=true" width="600" height="350">

After the account is bound, you can view the services and functions of the account.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/bind-account-result.png?raw=true" width="600" height="350">

To view services and functions located in different regions, you can click the More icon in the upper-right corner of the Remote Resources panel. In the drop-down list, select FC: Switch Region.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/switch-region.png?raw=true" width="600" height="350">

### Create a function

Open an empty directory file in VS Code. Click the function creation icon of the LOCAL RESOURCES panel to initialize a Function Compute project locally.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/create-func.png?raw=true" width="360" height="200">

Specify the service name, function name, runtime, and function type. After all parameters have been specified, the extension will automatically create the function. The new service and function will be displayed in the LOCAL RESOURCES panel.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/create-func-toast.png?raw=true" width="600" height="200">

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/create-func-result.png?raw=true" width="600" height="400">

You can also click the function creation icon to the right of a service in the LOCAL RESOURCES panel to create functions for the service. You must specify the function name, runtime, and function type.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/create-func-under-tmp.png?raw=true" width="350" height="150"> <img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/create-func-under-service.png?raw=true" width="350" height="150">

### Deploy services and functions

Click the deployment icon of the LOCAL RESOURCES panel to deploy local services and functions to Function Compute.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/deploy.png?raw=true" width="350" height="150">

After the deployment is complete, you can click the refresh icon of the REMOTE RESOURCES panel to view the deployed services and functions.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/deploy-result.png?raw=true" width="350" height="200">

Click the template file name, service name, and function name in the LOCAL RESOURCES panel, and select Deploy from the context menu to deploy the template file, service, and function granularity.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/deploy-under-tmp.png?raw=true" width="350" height="200">

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/deploy-under-service.png?raw=true" width="350" height="200">

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/deploy-under-func.png?raw=true" width="350" height="300">

## Other features

### Invoke functions locally

In the LOCAL RESOURCES panel, click the invoke icon to the right of a function or click the link in the Handler file to invoke the function.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-invoke.png?raw=true" width="600" height="300">

The logs and results of the function will be displayed in the TERMINAL panel.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-invoke-result.png?raw=true" width="600" height="400">

The extension creates an event.dat file under the directory that stores the function entry file. You can modify the event.dat file to configure events triggered when the function is invoked.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-invoke-event.png?raw=true" width="350" height="200">

### Debug locally

In the LOCAL RESOURCES panel, click the debugging icon to the right of a function or click the link in the Handler file to debug the function locally.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-debug.png?raw=true" width="600" height="300">

Set breakpoints in code and start debugging. The debug information will be displayed.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/local-debug-result.png?raw=true" width="600" height="400">

The extension creates an event.dat file under the directory that stores the function entry file. You can modify the event.dat file to configure events triggered when the function is debugged.

#### Notice

- If you want to debug functions that run in Python 2.7 or Python 3 runtimes, you must first install the Python extension from the extension marketplace.

- If you want to debug functions that run in PHP runtimes, you must first install the PHP Debug extension from the extension marketplace.

### Invoke functions in Function Compute

In the REMOTE RESOURCES panel, click the invoke icon to the right of a function to invoke the function.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/remote-invoke.png?raw=true" width="350" height="200">

The logs and results of the function will be displayed in the TERMINAL panel.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/remote-invoke-result.png?raw=true" width="600" height="150">

The extension creates an event.dat file under the root directory of the project. You can modify the event.dat file to configure events triggered when the function is invoked.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/remote-invoke-event.png?raw=true" width="350" height="200">

### Configure parameters in template files

[Fun](https://github.com/aliyun/fun) uses [YAML](<(https://yaml.org/spec/1.1/)>) template files to describe serverless applications. When you use the extension to create a function, the parameters in the template file will be specified as default values automatically. If you want to configure local services or functions, you can click the service name or function name in the LOCAL RESOURCES panel to go to the descriptions in the template file. The corresponding description blocks will be highlighted and dimmed after a short period of time.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/goto-template.png?raw=true" width="450" height="225">

### Obtain template prompts

- Automatic completion

Specifications of resources in the template.yml file are completed automatically according to prompts provided based on the indentation level.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/tmp-auto-complete.png?raw=true" width="400" height="250">

- Specification validation

All resource specifications in the template.yml file are validated based on the template specification description.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/tmp-validate.png?raw=true" width="450" height="225">

- Hovering prompts

Resource specifications that can be configured in the template.yml file are prompted when you move the pointer over the resource key. Prompts include specification names, types, and documentation.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/tmp-hover.png?raw=true" width="400" height="250">

## Feedback

You can scan the following QR code to join the Function Compute customer DingTalk group for troubleshooting or give feedback in GitHub.

<img src="https://github.com/alibaba/serverless-vscode/blob/master/media/snapshot/two-dimension-code.png?raw=true" width="360px" />
