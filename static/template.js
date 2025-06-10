// AI Summary Widget Templates
window.AISummaryTemplates = {
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