(function () {
    // 在脚本执行时立即保存 currentScript 引用
    const currentScript = document.currentScript;
    
    // 自动加载资源文件
    function loadResources() {
        // 加载 CSS 样式
        if (!document.getElementById('ai-summary-widget-styles')) {
            const scriptSrc = currentScript ? currentScript.src : '';
            const cssPath = scriptSrc.replace('widget.js', 'widget.css');
            const cssUrl = cssPath.includes('widget.js') ? cssPath : './static/widget.css';
            
            const link = document.createElement('link');
            link.id = 'ai-summary-widget-styles';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = cssUrl;
            document.head.appendChild(link);
        }
        
        // 加载模板文件
        if (!window.AISummaryTemplates) {
            const scriptSrc = currentScript ? currentScript.src : '';
            const templatesPath = scriptSrc.replace('widget.js', 'template.js');
            const templatesUrl = templatesPath.includes('widget.js') ? templatesPath : './static/template.js';
            
            const script = document.createElement('script');
            script.src = templatesUrl;
            document.head.appendChild(script);
        }
    }
    
    // 主题切换功能
    function createThemeToggle(container) {
        return function toggleTheme() {
            const themeIcon = container.querySelector('.ai-summary-theme-icon');
            const themeText = container.querySelector('.ai-summary-theme-text');
            
            if (container.classList.contains('theme-dark')) {
                container.classList.remove('theme-dark');
                themeIcon.textContent = '🌙';
                themeText.textContent = 'Dark Mode';
            } else {
                container.classList.add('theme-dark');
                themeIcon.textContent = '☀️';
                themeText.textContent = 'Light Mode';
            }
        };
    }
    
    // 计算文本统计信息
    function calculateStats(text) {
        const words = text.split(/\s+/).length;
        const readTime = Math.ceil(words / 200); // 假设每分钟读200个单词
        
        return {
            words: words > 1000 ? `${(words / 1000).toFixed(1)}k` : words.toString(),
            readTime: `${readTime}`,
            accuracy: '95%',
            rating: '4.8'
        };
    }
    
    // 等待模板加载完成
    function waitForTemplates(callback) {
        if (window.AISummaryTemplates) {
            callback();
        } else {
            setTimeout(() => waitForTemplates(callback), 100);
        }
    }
    
    document.addEventListener("DOMContentLoaded", () => {
        // 加载资源文件
        loadResources();
        
        // 等待模板加载后初始化组件
        waitForTemplates(() => {
            initializeWidget();
        });
    });
    
    function initializeWidget() {
        // 如果 currentScript 不可用，尝试通过其他方式获取脚本元素
        let script = currentScript;
        
        if (!script) {
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
        const theme = script.getAttribute("data-theme") || "light";
        const compact = script.getAttribute("data-compact") === "true";
        const showStats = script.getAttribute("data-show-stats") !== "false";
        const showThemeToggle = script.getAttribute("data-show-theme-toggle") !== "false";
        const showHeader = script.getAttribute("data-show-header") !== "false";
        const showFooter = script.getAttribute("data-show-footer") !== "false";
        const badgeText = script.getAttribute("data-badge-text") || "AI-Powered Summary"; // 新增：从script标签读取椭圆框文字
        
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
        
        const sourceContentEl = document.querySelector(selector);
        const mountEl = targetId ? document.getElementById(targetId) : null;
  
        if (!sourceContentEl) {
            console.warn("AI 摘要组件：未找到内容元素：" + selector);
            return;
        }
  
        const contentText = sourceContentEl.innerText.trim();
        if (!contentText) {
            console.warn("AI 摘要组件：内容为空。");
            return;
        }
        
        // 生成唯一ID
        const widgetId = `ai-summary-widget-${Date.now()}`;
        const headerId = showHeader ? `${widgetId}-header` : null;
        const contentId = `${widgetId}-content`;
        const footerId = showFooter ? `${widgetId}-footer` : null;
        
        // 创建主容器
        const container = document.createElement("div");
        container.id = "ai-summary-widget";
        container.className = `ai-summary-widget ${theme !== 'light' ? 'theme-' + theme : ''} ${compact ? 'compact' : ''}`;
        
        // 使用模板创建组件结构
        container.innerHTML = window.AISummaryTemplates.container(headerId, contentId, footerId);
        
        // 填充各部分内容
        if (showHeader) {
            const headerEl = container.querySelector(`#${headerId}`);
            headerEl.innerHTML = window.AISummaryTemplates.header(showThemeToggle);
        }
        
        if (showFooter) {
            const footerEl = container.querySelector(`#${footerId}`);
            footerEl.innerHTML = window.AISummaryTemplates.footer();
        }
        
        const widgetContentEl = container.querySelector(`#${contentId}`);
        widgetContentEl.innerHTML = window.AISummaryTemplates.loading();
        
        // 挂载容器
        if (mountEl) {
            mountEl.appendChild(container);
        } else {
            document.body.appendChild(container);
        }
        
        // 绑定主题切换事件
        if (showThemeToggle && showHeader) {
            const themeToggle = container.querySelector('.ai-summary-theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', createThemeToggle(container));
            }
        }
        
        // 根据系统偏好设置初始主题
        if (theme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            container.classList.add('theme-dark');
            const themeIcon = container.querySelector('.ai-summary-theme-icon');
            const themeText = container.querySelector('.ai-summary-theme-text');
            if (themeIcon && themeText) {
                themeIcon.textContent = '☀️';
                themeText.textContent = 'Light Mode';
            }
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
            console.log('API 响应:', data);
            
            if (!data) {
                throw new Error('服务器返回数据为空');
            }
            
            if (data.code !== 1) {
                throw new Error(data.msg || '服务器返回错误');
            }
            
            if (!data.data) {
                throw new Error('摘要内容为空');
            }
            
            // 计算统计信息
            const stats = calculateStats(contentText);
            const typewriterId = `ai-summary-typewriter-${Date.now()}`;
            
            // 使用模板显示成功结果
            widgetContentEl.innerHTML = window.AISummaryTemplates.success(
                '', // 先显示空内容
                stats, 
                showStats, 
                typewriterId,
                badgeText
            );
            
            // 实现真正的打字效果
            const typewriterElement = container.querySelector(`#${typewriterId}`);
            if (typewriterElement) {
                const text = data.data;
                typewriterElement.classList.add('typing');
                
                let currentIndex = 0;
                const typingSpeed = 30; // 减少打字速度，让效果更流畅
                
                function typeText() {
                    if (currentIndex < text.length) {
                        typewriterElement.textContent = text.substring(0, currentIndex + 1);
                        currentIndex++;
                        setTimeout(typeText, typingSpeed);
                    } else {
                        // 打字完成，移除光标和打字状态
                        typewriterElement.classList.remove('typing');
                        typewriterElement.classList.add('typing-complete');
                    }
                }
                
                // 开始打字前清空内容
                typewriterElement.textContent = '';
                // 延迟开始打字
                setTimeout(typeText, 300);
            }
        })
        .catch(err => {
            console.error('AI 摘要组件错误：', err);
            // 使用模板显示错误信息
            widgetContentEl.innerHTML = window.AISummaryTemplates.error(err.message || err);
        });
    }
})();