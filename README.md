# AI Summary - 智能文章摘要生成器 📝

一个超简单的 AI 文章摘要工具！只需要把你的文章内容发给它，就能自动生成一段 150-250 字的精炼摘要。

**🎯 适合谁用？**
- 博客作者：为文章快速生成摘要
- 内容创作者：节省写摘要的时间
- 网站开发者：为网站添加 AI 摘要功能
- 学习者：学习如何部署 AI 应用

## ✨ 有什么功能？

- 🤖 **智能摘要**：基于腾讯云 AI，生成高质量中文摘要
- 📝 **支持长文**：最多可以处理 18,000 个字符（约 9,000 汉字）
- 🚀 **简单易用**：提供网页接口，一键生成摘要
- 🌐 **网页组件**：可以直接嵌入到你的网站里
- 🐳 **一键部署**：使用 Docker，3 分钟搞定部署
- ⚡ **速度很快**：通常几秒钟就能生成摘要

## 🚀 快速开始（新手推荐）

### 第一步：准备工作

**你需要准备：**
1. 一台电脑（Windows/Mac/Linux 都可以）
2. 安装 Docker（类似一个软件容器，让部署变简单）
3. 腾讯云账号和 API 密钥（免费申请，用来调用 AI 服务）

**如何获取腾讯云 API 密钥？**
1. 注册腾讯云账号：https://cloud.tencent.com/
2. 进入控制台 → 访问管理 → API 密钥管理
3. 新建密钥，得到 `SecretId` 和 `SecretKey`
4. 开通混元大模型服务（腾讯混元的lite模型完全免费!）

### 第二步：下载项目

打开命令行（Windows 用户按 `Win+R`，输入 `cmd`），然后输入：

```bash
# 下载项目到你的电脑
git clone https://github.com/WindyDante/AI_Summary.git

# 进入项目文件夹
cd AI_Summary
```

### 第三步：配置密钥

在项目文件夹里，创建一个名为 `.env` 的文件（就是个文本文件），内容如下：

```env
SecretId=你的腾讯云SecretId
SecretKey=你的腾讯云SecretKey
```

**小贴士：** 
- 把上面的 `你的腾讯云SecretId` 替换成你实际的密钥
- 不要把这个文件分享给别人，因为包含你的私密信息

### 第四步：启动服务

在命令行里输入这一行命令：

```bash
docker-compose up -d
```

等待几分钟，Docker 会自动下载和安装所有需要的东西。

## 📱 如何使用？

### 嵌入到你的网站

如果你有自己的网站或博客，可以这样添加 AI 摘要功能：

```html
<!DOCTYPE html>
<html>
<head>
    <title>我的博客</title>
</head>
<body>
    <!-- 你的文章内容 -->
    <article id="my-article">
        <h1>文章标题</h1>
        <p>这里是你的文章内容...</p>
    </article>
    
    <!-- AI 摘要会显示在这里 -->
    <div id="summary-box"></div>
    
    <!-- 神奇的一行代码，添加 AI 摘要功能
        如果是ssl就改为https
     -->
    <script 
        src="http://你的域名或ip+端口/static/widget.js"
        data-selector="#my-article"
        data-target="summary-box"
        data-backend-prefix="http://你的域名或ip+端口">
    </script>
</body>
</html>
```

**这行代码做了什么？**
- `data-selector="#my-article"`：告诉 AI 分析 id 为 "my-article" 的内容，通过这里的id选择器就会获取里面的文字
- `data-target="summary-box"`：把生成的摘要放到 id 为 "summary-box" 的地方
- `data-backend-prefix`：AI 服务的地址

### 程序调用（给开发者）

如果你会编程，可以直接调用 API：

```javascript
// 发送文章内容给 AI
fetch('http://localhost:6123/api/v1/summary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: '你的文章内容...'
  })
})
.then(response => response.json())
.then(data => {
  console.log('AI 生成的摘要：', data.data.summary);
});
```

## 🛠️ 常见问题

### Q：我不会用命令行怎么办？
A：推荐使用 Windows 的 PowerShell 或 Mac 的终端。只需要复制粘贴上面的命令就行，不需要理解每个命令的含义。

### Q：Docker 是什么？我需要学会吗？
A：Docker 就像一个"软件打包器"，把所有需要的东西打包在一起，让部署变得超级简单。你不需要学会 Docker，只需要安装它，然后运行我们提供的命令就行。

### Q：为什么需要腾讯云 API？
A：因为 AI 摘要功能需要调用腾讯云的人工智能服务。就像你用手机需要插 SIM 卡一样，这个 API 就是我们的"SIM 卡"。

### Q：会花很多钱吗？
A：腾讯云混元大模型有免费额度，对于个人使用来说通常够用。lite模型完全免费,不花任何钱

### Q：部署失败了怎么办？
A：检查这几个地方：
1. Docker 是否正常安装？
2. `.env` 文件是否正确创建？
3. API 密钥是否有效？
4. 网络是否正常？
5. 找不出来请提issue，并配以图片及文字步骤

### Q：我想部署到服务器上给别人用？
A：把上面命令中的 `localhost:6123` 改成你的服务器地址就行，比如 `your-website.com`。

## 🎨 自定义设置

你可以修改摘要组件的外观和行为：

```html
<script 
    src="http://localhost:6123/static/widget.js"
    data-selector="#content1"
    data-target="summary1"
    data-backend-prefix="http://localhost:6123"
    data-theme="light"
    data-show-stats="true"
    data-show-theme-toggle="true"
    data-show-header="true"
    data-show-footer="true"
    data-badge-text="东风学习摘要">
</script>
```

**可以调整的设置：**
- `data-theme`：主题颜色（`light` 亮色 / `dark` 暗色 / `auto` 自动）
- `data-badge-text`：显示的标签文字（比如"智能摘要"、"AI助手"等）
- `data-show-stats`：是否显示统计信息（`true` 显示 / `false` 不显示）
- `data-show-theme-toggle`：是否显示主题切换按钮（`true` 显示 / `false` 不显示）
- `data-show-header`：是否显示组件头部（`true` 显示 / `false` 不显示）
- `data-show-footer`：是否显示组件底部（`true` 显示 / `false` 不显示）

**简单例子：**
```html
<!-- 暗色主题，自定义标签 -->
<script src="..." data-theme="dark" data-badge-text="我的AI助手">

<!-- 极简模式，只显示摘要内容 -->
<script src="..." data-show-header="false" data-show-footer="false">

<!-- 完整功能模式 -->
<script src="..." data-show-stats="true" data-show-theme-toggle="true">
```

## 📂 项目文件说明（给好奇的人看）

```
AI_Summary/
├── docker-compose.yml      # Docker 配置文件（告诉 Docker 怎么运行）
├── Dockerfile             # 构建说明书（告诉 Docker 怎么打包）
├── .env                   # 密钥配置文件（你需要创建的）
├── test.html              # 测试页面（打开浏览器就能用）
├── static/                # 网页组件文件
│   ├── widget.js          # 主要的 JavaScript 代码
│   ├── widget.css         # 样式文件
│   └── template.js        # 模板文件
└── 其他文件/               # Go 语言后端代码（不用管）
```

**简单来说：**
- `static/` 文件夹里是script前端网页组件
- 其他文件夹是后端 AI 服务代码
- 你只需要关心 `.env` 配置文件

## 🔧 给开发者的进阶说明

### 本地开发

如果你想修改代码或添加新功能：

```bash
# 安装 Go 语言环境（Go 1.24+）
# 下载依赖
go mod tidy

# 运行开发服务器
go run cmd/server/main.go
```

### 添加新的 AI 模型

项目设计支持接入其他 AI 服务，比如 OpenAI、Claude 等。主要修改这些文件：
- `internal/model/constant.go` - 添加新模型常量
- `internal/controller/method.go` - 添加新模型调用逻辑

## 🤝 参与贡献

欢迎大家一起改进这个项目！

**我能做什么？**
- 🐛 发现 Bug？在 GitHub 上报告问题
- 💡 有好想法？提出功能建议
- 📖 文档不清楚？帮忙改进说明
- 🎨 界面不好看？优化前端样式
- 🤖 想要新功能？添加其他 AI 模型支持

**怎么参与？**
1. 在 GitHub 上 Fork 这个项目：https://github.com/WindyDante/AI_Summary
2. 修改代码或文档
3. 提交 Pull Request

即使你是编程新手，也可以帮忙改进文档、测试功能、提出建议！

## 📄 许可证

这个项目使用开源许可证，你可以自由使用、修改和分发。详情请查看 [LICENSE](LICENSE) 文件。

---

**🎉 恭喜你！现在你已经学会了如何使用 AI Summary 智能摘要生成器！**

有问题？欢迎在 GitHub 上提问：https://github.com/WindyDante/AI_Summary/issues