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


function initCopyCode() {
    // 使用 WeakMap 存储状态和原始内容
    const originalContents = new WeakMap();
    const expandStates = new WeakMap();

    // 检查是否为移动设备
    const isMobileDevice = () => window.innerWidth <= 768;

    // 创建用于自动折叠的 Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && !isMobileDevice()) { // 只在非移动设备上执行自动折叠
                const block = entry.target;
                const pre = block.querySelector('pre');
                const expandButton = block.querySelector('.toggle-button');

                // 检查当前是否是展开状态
                if (expandStates.get(block) === true) {
                    console.log('Block left viewport, collapsing...'); // 调试日志

                    // 获取原始内容并只显示前50行
                    const lines = originalContents.get(block).split('\n');
                    pre.innerHTML = lines.slice(0, 50).join('\n');
                    pre.style.maxHeight = '400px';

                    // 重建展开部分
                    const expandWrapper = document.createElement('div');
                    expandWrapper.className = 'expand-wrapper';

                    const ellipsis = document.createElement('span');
                    ellipsis.textContent = '...';
                    ellipsis.className = 'code-ellipsis';

                    // 重置按钮文本
                    if (expandButton) {
                        expandButton.textContent = 'Expand';
                        expandWrapper.appendChild(ellipsis);
                        expandWrapper.appendChild(expandButton);
                        pre.appendChild(expandWrapper);
                    }

                    // 更新状态
                    expandStates.set(block, false);
                }
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0
    });

    const runWhenIdle = window.requestIdleCallback || ((callback) => setTimeout(callback, 0));
    const codeBlocks = Array.from(document.querySelectorAll('.org-src-container'));

    const initCodeBlock = (block) => {
        const pre = block.querySelector('pre');
        if (!pre) return;

        const originalHTML = pre.innerHTML;
        const plainText = pre.textContent;
        const lines = originalHTML.split('\n');

        originalContents.set(block, originalHTML);
        expandStates.set(block, false);

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';

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

        block.appendChild(copyButton);

        const langMatch = pre.className.match(/src-([\w-]+)/);
        pre.setAttribute('data-lang', langMatch && langMatch[1] !== 'nil' ? langMatch[1] : 'code');
        pre.style.setProperty('--show-lang-label', 'block');

        if (lines.length <= 50) return;

        pre.innerHTML = lines.slice(0, 50).join('\n');

        const expandWrapper = document.createElement('div');
        expandWrapper.className = 'expand-wrapper';

        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.className = 'code-ellipsis';

        const expandButton = document.createElement('button');
        expandButton.className = 'toggle-button';
        expandButton.textContent = 'Expand';

        expandButton.addEventListener('click', () => {
            const currentState = expandStates.get(block);

            if (!currentState) {
                pre.innerHTML = originalContents.get(block);
                pre.style.maxHeight = '700px';
                expandButton.textContent = 'Collapse';
                expandWrapper.innerHTML = '';
                expandWrapper.appendChild(expandButton);
                pre.appendChild(expandWrapper);
                expandStates.set(block, true);
                return;
            }

            pre.innerHTML = lines.slice(0, 50).join('\n');
            pre.style.maxHeight = '400px';
            expandButton.textContent = 'Expand';
            expandWrapper.innerHTML = '';
            expandWrapper.appendChild(ellipsis);
            expandWrapper.appendChild(expandButton);
            pre.appendChild(expandWrapper);
            expandStates.set(block, false);
        });

        expandWrapper.appendChild(ellipsis);
        expandWrapper.appendChild(expandButton);
        pre.appendChild(expandWrapper);
        pre.style.maxHeight = '400px';
        observer.observe(block);
    };

    let index = 0;
    const processBatch = (deadline) => {
        const end = Math.min(index + 5, codeBlocks.length);

        while (index < end && (!deadline?.timeRemaining || deadline.timeRemaining() > 4)) {
            initCodeBlock(codeBlocks[index]);
            index += 1;
        }

        if (index < codeBlocks.length) runWhenIdle(processBatch);
    };

    runWhenIdle(processBatch);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopyCode);
} else {
    initCopyCode();
}
