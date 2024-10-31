document.addEventListener('DOMContentLoaded', function() {
    const codeBlocks = document.querySelectorAll('.org-src-container');
    
    codeBlocks.forEach(block => {
        // 创建复制按钮
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        
        // 添加复制功能
        copyButton.addEventListener('click', async () => {
            const code = block.querySelector('pre').textContent;
            try {
                await navigator.clipboard.writeText(code);
                copyButton.textContent = 'Copied!';
                copyButton.classList.add('copied');
                
                // 2秒后恢复原始状态
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                    copyButton.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Copy Failed:', err);
                copyButton.textContent = 'Copy Failed';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                }, 2000);
            }
        });
        
        // 将按钮添加到代码块容器中
        block.appendChild(copyButton);
    });

    // 为所有代码块添加语言标签
    document.querySelectorAll('.org-src-container pre[class*="src-"]').forEach(pre => {
        const lang = pre.className.match(/src-([\w-]+)/)?.[1];
        if (lang && lang !== 'nil') {
            pre.setAttribute('data-lang', lang);
            pre.style.setProperty('--show-lang-label', 'block');
        }
    });
});
