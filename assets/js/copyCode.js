/*
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
});*/

document.addEventListener('DOMContentLoaded', function() {
    const originalContents = new WeakMap();
    const expandStates = new WeakMap();
    
    // 创建用于自动折叠的 Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && entry.boundingClientRect.bottom <= 0) {
                const block = entry.target;
                
                if (expandStates.get(block) === true) {
                    const pre = block.querySelector('pre');
                    const expandButton = block.querySelector('.toggle-button');
                    
                    // 记录代码块底部的位置
                    const blockBottom = block.getBoundingClientRect().bottom;
                    const absoluteBottom = window.scrollY + blockBottom;

                    // 获取原始内容并只显示前50行
                    const lines = originalContents.get(block).split('\n');
                    
                    // 使用绝对定位临时固定底部位置
                    const originalPosition = window.getComputedStyle(block).position;
                    block.style.position = 'relative';
                    
                    // 更新内容
                    pre.innerHTML = lines.slice(0, 50).join('\n');
                    pre.style.maxHeight = '400px';

                    // 重建展开部分
                    const expandWrapper = document.createElement('div');
                    expandWrapper.className = 'expand-wrapper';

                    const ellipsis = document.createElement('span');
                    ellipsis.textContent = '...';
                    ellipsis.className = 'code-ellipsis';

                    if (expandButton) {
                        expandButton.textContent = 'Expand';
                        expandWrapper.appendChild(ellipsis);
                        expandWrapper.appendChild(expandButton);
                        pre.appendChild(expandWrapper);
                    }

                    // 更新状态
                    expandStates.set(block, false);
                    
                    // 计算新的底部位置
                    const newBottom = block.getBoundingClientRect().bottom;
                    const newAbsoluteBottom = window.scrollY + newBottom;
                    
                    // 调整滚动位置，使折叠后的底部对齐原来的底部
                    const adjustment = absoluteBottom - newAbsoluteBottom;
                    if (adjustment !== 0) {
                        window.scrollBy(0, -adjustment);
                    }
                    
                    // 恢复原始定位
                    requestAnimationFrame(() => {
                        block.style.position = originalPosition;
                    });
                }
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0
    });

    // 添加 CSS 样式以支持平滑过渡
    const style = document.createElement('style');
    style.textContent = `
        .org-src-container {
            transition: max-height 0.3s ease;
        }
        .org-src-container pre {
            transition: max-height 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    const codeBlocks = document.querySelectorAll('.org-src-container');
    
    codeBlocks.forEach(block => {
        const pre = block.querySelector('pre');
        const originalHTML = pre.innerHTML;
        const plainText = pre.textContent;
        const lines = originalHTML.split('\n');

        // 存储原始内容
        originalContents.set(block, originalHTML);
        expandStates.set(block, false);

        // 创建复制按钮
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';

        // 添加复制功能
        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(plainText);
                copyButton.textContent = 'Copied!';
                copyButton.classList.add('copied');

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

        // 将复制按钮添加到代码块容器中
        block.appendChild(copyButton);

        // 处理长代码的折叠功能
        if (lines.length > 50) {
            // 重置pre的内容为前50行
            pre.innerHTML = lines.slice(0, 50).join('\n');
            pre.style.maxHeight = '400px';

            // 创建展开包装器
            const expandWrapper = document.createElement('div');
            expandWrapper.className = 'expand-wrapper';

            // 创建省略号元素
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'code-ellipsis';

            // 创建展开按钮
            const expandButton = document.createElement('button');
            expandButton.className = 'toggle-button';
            expandButton.textContent = 'Expand';

            // 添加展开/折叠功能
            expandButton.addEventListener('click', () => {
                const currentState = expandStates.get(block);

                // 记录底部位置
                const blockBottom = block.getBoundingClientRect().bottom;
                const absoluteBottom = window.scrollY + blockBottom;

                if (!currentState) {
                    // 展开
                    pre.innerHTML = originalContents.get(block);
                    pre.style.maxHeight = '700px';
                    expandButton.textContent = 'Collapse';
                    expandWrapper.innerHTML = '';
                    expandWrapper.appendChild(expandButton);
                    pre.appendChild(expandWrapper);
                    expandStates.set(block, true);
                } else {
                    // 折叠
                    pre.innerHTML = lines.slice(0, 50).join('\n');
                    pre.style.maxHeight = '400px';
                    expandButton.textContent = 'Expand';
                    expandWrapper.innerHTML = '';
                    expandWrapper.appendChild(ellipsis);
                    expandWrapper.appendChild(expandButton);
                    pre.appendChild(expandWrapper);
                    expandStates.set(block, false);
                }

                // 调整滚动位置以保持底部对齐
                requestAnimationFrame(() => {
                    const newBottom = block.getBoundingClientRect().bottom;
                    const newAbsoluteBottom = window.scrollY + newBottom;
                    const adjustment = absoluteBottom - newAbsoluteBottom;
                    if (adjustment !== 0) {
                        window.scrollBy(0, -adjustment);
                    }
                });
            });

            // 组装展开部分
            expandWrapper.appendChild(ellipsis);
            expandWrapper.appendChild(expandButton);
            pre.appendChild(expandWrapper);

            // 添加到观察器
            observer.observe(block);
        }
    });
});
