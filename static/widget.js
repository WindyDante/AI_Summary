(function () {
    // 在脚本执行时立即保存 currentScript 引用
    const currentScript = document.currentScript;
    
    // 直接内嵌模板定义，避免额外的 HTTP 请求
    const AISummaryTemplates = {
        // 头部模板
        header: (showThemeToggle) => `
            <div class="ai-summary-window-controls">
                <div class="ai-summary-control close"></div>
                <div class="ai-summary-control minimize"></div>
                <div class="ai-summary-control maximize"></div>
            </div>
            ${showThemeToggle ? `
            <button class="ai-summary-theme-toggle">
                <span class="ai-summary-theme-icon">🌙</span>
                <span class="ai-summary-theme-text">Dark Mode</span>
            </button>
            ` : ''}
        `,

        // 加载状态模板
        loading: () => `
            <div class="ai-summary-text">
                <div class="ai-summary-loading">
                    <div class="ai-summary-loading-animation"></div>
                    <span>😏 AI 正在分析内容，生成摘要中...</span>
                </div>
            </div>
        `,

        // 成功结果模板
        success: (data, stats, showStats, typewriterId, badgeText) => `
            <div class="ai-summary-badge">
                ${badgeText || 'AI-Powered Summary'}
            </div>
            <div class="ai-summary-text">
                <p class="ai-summary-typewriter" id="${typewriterId}">
                    ${data}
                </p>
            </div>
        `,

        // 错误状态模板
        error: (errorMessage) => `
            <div class="ai-summary-badge error">
                <span>❌</span>
                <span>摘要生成失败</span>
            </div>
            <div class="ai-summary-error">
                <span>❌</span>
                <span>摘要加载失败：${errorMessage}</span>
            </div>
        `,

        // 底部模板
        footer: () => `
            <a href="#" class="ai-summary-source">AI Summary Engine</a>
            <div class="ai-summary-model-info">loading...</div>
        `,

        // 完整组件结构模板
        container: (headerId, contentId, footerId) => `
            <div class="ai-summary-widget-container">
                ${headerId ? `<div class="ai-summary-widget-header" id="${headerId}"></div>` : ''}
                <div class="ai-summary-content" id="${contentId}"></div>
                ${footerId ? `<div class="ai-summary-footer" id="${footerId}"></div>` : ''}
            </div>
        `
    };
    
    // 自动加载资源文件 - 只加载 CSS
    function loadResources(backendPrefix) {
        // 加载 CSS 样式
        if (!document.getElementById('ai-summary-widget-styles')) {
            let cssUrl;
            if (backendPrefix) {
                // 优先使用后端服务器的CSS路径
                cssUrl = `${backendPrefix}/static/widget.css`;
            } else {
                // 回退到脚本同目录
                const scriptSrc = currentScript ? currentScript.src : '';
                if (scriptSrc) {
                    const basePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
                    cssUrl = `${basePath}/widget.css`;
                } else {
                    cssUrl = './static/widget.css';
                }
            }
            
            const link = document.createElement('link');
            link.id = 'ai-summary-widget-styles';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = cssUrl;
            // 添加错误处理
            link.onerror = function() {
                console.error('AI 摘要组件：无法加载样式文件:', cssUrl);
                // 如果CSS加载失败，组件依然可以工作，只是没有样式
                console.warn('AI 摘要组件：将以无样式模式运行');
            };
            link.onload = function() {
                console.log('AI 摘要组件：样式文件加载成功');
            };
            document.head.appendChild(link);
        }
        
        // 直接设置模板到全局变量
        if (!window.AISummaryTemplates) {
            window.AISummaryTemplates = AISummaryTemplates;
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
    
    // 等待模板加载完成 - 简化逻辑
    function waitForTemplates(callback) {
        // 由于模板已经内嵌，直接执行回调
        callback();
    }
    
    // 动画控制工具函数
    function addBadgeAnimation(badge, animationType, duration = 600) {
        if (!badge) return;
        
        // 移除之前的动画类
        badge.classList.remove('loading', 'success', 'error', 'text-changing', 'width-changing');
        
        // 添加新动画类
        badge.classList.add(animationType);
        
        // 动画完成后移除类
        setTimeout(() => {
            badge.classList.remove(animationType);
        }, duration);
    }
    
    // 文字内容变换动画
    function animateTextChange(textElement, newContent, callback) {
        if (!textElement) return;
        
        // 添加变换动画
        textElement.classList.add('content-changing');
        
        setTimeout(() => {
            textElement.textContent = newContent;
            textElement.classList.remove('content-changing');
            if (callback) callback();
        }, 300);
    }
    
    // 增强的打字机效果
    function enhancedTypewriter(element, text, speed = 30, onComplete) {
        if (!element) return;
        
        element.classList.add('typing');
        element.innerHTML = '';
        
        let currentIndex = 0;
        const chars = text.split('');
        
        function typeChar() {
            if (currentIndex < chars.length) {
                const char = chars[currentIndex];
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char;
                span.style.animationDelay = `${currentIndex * 0.02}s`;
                element.appendChild(span);
                
                currentIndex++;
                setTimeout(typeChar, speed);
            } else {
                // 打字完成
                element.classList.remove('typing');
                element.classList.add('typing-complete');
                if (onComplete) onComplete();
            }
        }
        
        // 开始打字
        setTimeout(typeChar, 200);
    }
    
    // 徽章文字变换
    function changeBadgeText(badge, newText, showAnimation = true) {
        if (!badge) return;
        
        if (showAnimation) {
            addBadgeAnimation(badge, 'text-changing', 800);
            setTimeout(() => {
                badge.innerHTML = newText;
            }, 300);
        } else {
            badge.innerHTML = newText;
        }
    }

    function initializeWidget() {
        // 更健壮的脚本查找逻辑
        let script = currentScript;
        
        console.log('开始查找脚本元素...', { currentScript });
        
        if (!script) {
            // 方法1：查找包含widget.js的脚本
            const scripts1 = document.querySelectorAll('script[src*="widget.js"]');
            script = scripts1[scripts1.length - 1];
            console.log('方法1 - 查找widget.js脚本:', scripts1.length, script);
        }
        
        if (!script) {
            // 方法2：查找包含data-selector属性的脚本
            const scripts2 = document.querySelectorAll('script[data-selector]');
            script = scripts2[scripts2.length - 1];
            console.log('方法2 - 查找data-selector脚本:', scripts2.length, script);
        }
        
        if (!script) {
            // 方法3：查找包含data-backend-prefix属性的脚本
            const scripts3 = document.querySelectorAll('script[data-backend-prefix]');
            script = scripts3[scripts3.length - 1];
            console.log('方法3 - 查找data-backend-prefix脚本:', scripts3.length, script);
        }
        
        if (!script) {
            // 方法4：查找所有外部脚本，取最后一个有相关属性的
            const scripts4 = document.querySelectorAll('script[src]');
            for (let i = scripts4.length - 1; i >= 0; i--) {
                if (scripts4[i].src && (
                    scripts4[i].hasAttribute('data-selector') || 
                    scripts4[i].hasAttribute('data-backend-prefix') ||
                    scripts4[i].src.includes('widget')
                )) {
                    script = scripts4[i];
                    console.log('方法4 - 找到匹配脚本:', script);
                    break;
                }
            }
        }
        
        if (!script) {
            console.error("AI 摘要组件：无法找到脚本元素。请确保脚本标签包含必要的属性。");
            console.error("示例用法：<script src='widget.js' data-selector='.content' data-backend-prefix='http://localhost:6123'></script>");
            console.error("当前页面所有脚本:", document.querySelectorAll('script'));
            return false;
        }
        
        console.log('成功找到脚本元素:', script);
        
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
        const badgeText = script.getAttribute("data-badge-text") || "AI-Powered Summary";
        
        console.log('组件配置:', { selector, targetId, backend_prefix, theme });
        
        // 验证必需参数
        if (!selector) {
            console.warn("AI 摘要组件：未设置 data-selector 属性。");
            return false;
        }
        
        if (!backend_prefix) { 
            console.warn("AI 摘要组件：未设置后端url，请检查 data-backend-prefix 属性。");
            return false;
        }
        
        // 检查是否已存在组件
        if (document.getElementById("ai-summary-widget")) {
            console.warn("AI 摘要组件：页面中已存在摘要组件。");
            return false;
        }
        
        // 加载CSS资源，使用backend_prefix
        loadResources(backend_prefix);
        
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
                const contentType = res.headers.get('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    return res.json().then(data => {
                        throw new Error(data.msg || '服务器错误');
                    });
                } else {
                    throw new Error('服务器返回非JSON格式数据');
                }
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
            
            if (!data.data || !data.data.summary) {
                throw new Error('摘要内容为空');
            }
            
            // 计算统计信息
            const stats = calculateStats(contentText);
            const typewriterId = `ai-summary-typewriter-${Date.now()}`;
            
            // 直接显示成功结果，不添加成功动画
            widgetContentEl.innerHTML = window.AISummaryTemplates.success(
                '', // 先显示空内容
                stats, 
                showStats, 
                typewriterId,
                badgeText
            );
            
            // 更新页脚显示模型信息
            if (showFooter && data.data.model) {
                const footerEl = container.querySelector(`#${footerId}`);
                if (footerEl) {
                    const modelInfo = footerEl.querySelector('.ai-summary-model-info');
                    if (modelInfo) {
                        modelInfo.textContent = data.data.model;
                    }
                }
            }
            
            // 实现增强的打字效果，使用 data.data.summary
            const typewriterElement = container.querySelector(`#${typewriterId}`);
            if (typewriterElement) {
                enhancedTypewriter(typewriterElement, data.data.summary, 25, () => {
                    // 打字完成后的回调
                    console.log('摘要显示完成');
                });
            }
        })
        .catch(err => {
            console.error('AI 摘要组件错误：', err);
            
            // 获取当前的徽章元素并添加错误动画
            const currentBadge = container.querySelector('.ai-summary-badge');
            if (currentBadge) {
                addBadgeAnimation(currentBadge, 'error', 800);
                
                // 在错误动画中更改文字 - 显示具体错误信息
                setTimeout(() => {
                    changeBadgeText(currentBadge, '<span>❌</span><span>生成失败</span>', false);
                }, 400);
            }
            
            // 延迟显示错误内容 - 显示具体的错误消息
            setTimeout(() => {
                widgetContentEl.innerHTML = window.AISummaryTemplates.error(err.message || err);
            }, 600);
        });
        
        return true;
    }
    
    // 改进的初始化逻辑
    let initAttempts = 0;
    const maxAttempts = 3;
    let isInitializing = false;
    
    function tryInitialize() {
        // 防止重复初始化
        if (isInitializing) {
            console.log('AI摘要组件：已在初始化中，跳过重复调用');
            return;
        }
        
        // 检查是否已存在组件
        if (document.getElementById("ai-summary-widget")) {
            console.log('AI摘要组件：组件已存在，跳过初始化');
            return;
        }
        
        // 检查重试次数
        if (initAttempts >= maxAttempts) {
            console.error('AI摘要组件：达到最大重试次数，停止初始化');
            return;
        }
        
        isInitializing = true;
        initAttempts++;
        
        try {
            console.log(`AI摘要组件：开始初始化... (第${initAttempts}次尝试)`, {
                readyState: document.readyState,
                currentScript: currentScript
            });
            
            const result = initializeWidget();
            if (result) {
                console.log('AI摘要组件：初始化成功');
                isInitializing = false;
                return; // 成功后不再重试
            } else {
                console.warn(`AI摘要组件：第${initAttempts}次初始化失败`);
                isInitializing = false;
                
                // 只有在未达到最大重试次数时才重试
                if (initAttempts < maxAttempts) {
                    console.log(`AI摘要组件：将在1秒后进行第${initAttempts + 1}次重试`);
                    setTimeout(tryInitialize, 1000);
                } else {
                    console.error('AI摘要组件：所有重试均失败，请检查配置');
                }
            }
        } catch (error) {
            console.error(`AI 摘要组件第${initAttempts}次初始化失败：`, error);
            isInitializing = false;
            
            // 只有在未达到最大重试次数时才重试
            if (initAttempts < maxAttempts) {
                console.log(`AI摘要组件：将在2秒后进行第${initAttempts + 1}次重试`);
                setTimeout(tryInitialize, 2000);
            } else {
                console.error('AI摘要组件：所有重试均失败，请检查页面配置');
            }
        }
    }
    
    // 多重初始化策略
    if (document.readyState === 'loading') {
        // 如果文档还在加载，等待DOMContentLoaded
        console.log('AI摘要组件：等待DOM加载完成...');
        document.addEventListener("DOMContentLoaded", tryInitialize);
    } else {
        // 如果文档已经加载完成，立即初始化
        console.log('AI摘要组件：DOM已加载，立即初始化...');
        // 使用setTimeout确保脚本执行完成
        setTimeout(tryInitialize, 0);
    }
    
    // 提供手动初始化的全局方法
    window.initAISummaryWidget = function() {
        console.log('手动初始化 AI 摘要组件');
        // 重置重试计数器
        initAttempts = 0;
        isInitializing = false;
        tryInitialize();
    };
    
    // 暴露重新初始化方法（用于调试）
    window.reinitAISummaryWidget = function() {
        console.log('重新初始化 AI 摘要组件');
        // 重置状态
        initAttempts = 0;
        isInitializing = false;
        
        // 移除现有组件
        const existingWidget = document.getElementById("ai-summary-widget");
        if (existingWidget) {
            existingWidget.remove();
            console.log('已移除现有组件');
        }
        
        // 重新初始化
        setTimeout(tryInitialize, 100);
    };
    
    // 暴露调试信息方法
    window.debugAISummaryWidget = function() {
        console.log('=== AI摘要组件调试信息 ===');
        console.log('document.currentScript:', document.currentScript);
        console.log('currentScript (保存的):', currentScript);
        console.log('document.readyState:', document.readyState);
        console.log('所有script标签:', document.querySelectorAll('script'));
        console.log('包含widget.js的script:', document.querySelectorAll('script[src*="widget.js"]'));
        console.log('包含data-selector的script:', document.querySelectorAll('script[data-selector]'));
        console.log('包含data-backend-prefix的script:', document.querySelectorAll('script[data-backend-prefix]'));
        console.log('现有组件:', document.getElementById("ai-summary-widget"));
        console.log('=== 调试信息结束 ===');
    };
})();