(function () {
    // 在脚本执行时立即保存 currentScript 引用
    const currentScript = document.currentScript;
    
    document.addEventListener("DOMContentLoaded", () => {
        // 如果 currentScript 不可用，尝试通过其他方式获取脚本元素
        let script = currentScript;
        
        if (!script) {
            // 备用方案：查找最后一个包含 widget.js 的 script 标签
            const scripts = document.querySelectorAll('script[src*="widget.js"]');
            script = scripts[scripts.length - 1];
        }
        
        if (!script) {
            console.error("AI 摘要组件：无法找到脚本元素");
            return;
        }
        
        // 获取配置参数
        const selector = script.getAttribute("data-selector");
        const targetId = script.getAttribute("data-target");
        const backend_prefix = script.getAttribute("data-backend-prefix") || "";
        
        // 验证必需参数
        if (!selector) {
            console.warn("AI 摘要组件：未设置 data-selector 属性。");
            return;
        }
        
        if (!backend_prefix) { 
            console.warn("AI 摘要组件：未设置后端url，请检查 data-backend-prefix 属性。");
            return;
        }
        
        // 检查是否已存在组件
        if (document.getElementById("ai-summary-widget")) {
            console.warn("AI 摘要组件：页面中已存在摘要组件。");
            return;
        }
        
        const contentEl = document.querySelector(selector);
        const mountEl = targetId ? document.getElementById(targetId) : null;
  
        if (!contentEl) {
            console.warn("AI 摘要组件：未找到内容元素：" + selector);
            return;
        }
  
        const contentText = contentEl.innerText.trim();
        if (!contentText) {
            console.warn("AI 摘要组件：内容为空。");
            return;
        }
  
        // 创建容器
        const container = document.createElement("div");
        container.id = "ai-summary-widget";
        Object.assign(container.style, {
            border: '1px solid #ccc',
            padding: '10px',
            margin: '10px 0',
            fontFamily: 'sans-serif',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9'
        });
        container.textContent = "🤖 正在生成 AI 摘要...";
  
        // 挂载容器
        if (mountEl) {
            mountEl.appendChild(container);
        } else {
            document.body.appendChild(container);
        }
  
        // 发送请求
        fetch(backend_prefix + "/api/v1/summary", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: contentText })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log('API 响应:', data); // 调试日志
            
            // 根据您的后端响应格式进行处理
            if (!data) {
                throw new Error('服务器返回数据为空');
            }
            
            // 检查业务状态码
            if (data.code !== 1) {
                throw new Error(data.msg || '服务器返回错误');
            }
            
            // 检查摘要内容
            if (!data.data) {
                throw new Error('摘要内容为空');
            }
            
            // 安全地显示摘要
            container.innerHTML = '';
            const label = document.createElement('strong');
            label.textContent = '🤖 AI 摘要：';
            const summaryText = document.createTextNode(data.data);
            container.appendChild(label);
            container.appendChild(document.createTextNode(' '));
            container.appendChild(summaryText);
        })
        .catch(err => {
            console.error('AI 摘要组件错误：', err);
            container.textContent = "❌ 摘要加载失败：" + (err.message || err);
        });
    });
})();