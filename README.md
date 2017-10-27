shadow-server：Shadow Widget 的本地 Web Service 系统
------------------------------

&nbsp;

### 简介：Shadow Widget 与 Shadow Server

Shadow Widget 是一种可视化控件框架，它基于 react 技术，将 JSX 及虚拟 DOM 封装成一种易用、易继承、易管理的形式，使界面设计与业务逻辑获得良好分离，进而支持所见即所得的开发模式。简单理解 Shadow Widget 就是 “react + react-router + redux”，再另加一套可视化 GUI 设计工具。

Shadow Server 工程为 Shadow Widget 开发环境提供一套在本地运行的 WebService 系统，既服务于调测，也用于本开发体系的产品在本机正式运行。本工程已包含 shadow-widget 的 cdn 发行库。

### 安装

```
mkdir user
cd user
git clone https://github.com/rewgt/shadow-server.git
```

### 在本机启动 web 服务

```
cd shadow-server
npm install
npm start
```

运行后，请在 Web 浏览器访问 `http://localhost:3000/`，试试网页能否正常打开。

### 相关资源

<a target="_blank" href="https://rewgt.github.io/shadow-server/public/static/files/rewgt/doc/doc_zh/github_doc.html">Shadow Widget 中文版用户手册</a>

[shadow-server 开源项目](https://github.com/rewgt/shadow-server)   
[shadow-widget 开源项目](https://github.com/rewgt/shadow-widget)   
[shadow-book 开源项目](https://github.com/rewgt/shadow-book)   
[shadow-slide 开源项目](https://github.com/rewgt/shadow-slide)   
[shadow-bootstrap 开源项目](https://github.com/rewgt/shadow-bootstrap)

[Shadow Widget 产品博客](https://rewgt.github.io/product-blogs/)   
[Shadow Widget FAQ ](https://rewgt.github.io/faq-blogs/)

### 版权（BSD开源协议）

Copyright 2015, PINP.ME Development Group. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

  - Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above
    copyright notice, this list of conditions and the following
    disclaimer in the documentation and/or other materials provided
    with the distribution.
  - Neither the name of PINP.ME nor the names of its contributors 
    may be used to endorse or promote products derived from this 
    software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
