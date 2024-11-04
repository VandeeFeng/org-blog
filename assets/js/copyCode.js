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
    // 使用 WeakMap 存储状态和原始内容
    const originalContents = new WeakMap();
    const expandStates = new WeakMap();
    
    // 创建用于自动折叠的 Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                const block = entry.target;
                const pre = block.querySelector('pre');
                const expandButton = block.querySelector('.toggle-button');

                // 检查当前是否是展开状态
                if (expandStates.get(block) === true) {
                    // 在折叠之前记录当前滚动位置和元素位置
                    const scrollTop = window.scrollY;
                    const blockTop = block.getBoundingClientRect().top;
                    const absoluteBlockTop = scrollTop + blockTop;

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

                    // 在下一个微任务中调整滚动位置
                    requestAnimationFrame(() => {
                        // 计算高度变化
                        const newBlockTop = block.getBoundingClientRect().top;
                        const newAbsoluteBlockTop = window.scrollY + newBlockTop;
                        const heightDifference = absoluteBlockTop - newAbsoluteBlockTop;
                        
                        // 调整滚动位置以保持相对位置不变
                        if (heightDifference !== 0) {
                            window.scrollTo({
                                top: window.scrollY - heightDifference,
                                behavior: 'instant' // 使用即时滚动避免动画
                            });
                        }
                    });
                }
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0
    });

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
                
                // 记录点击时的滚动位置和元素位置
                const scrollTop = window.scrollY;
                const blockTop = block.getBoundingClientRect().top;
                const absoluteBlockTop = scrollTop + blockTop;

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

                // 在布局更新后调整滚动位置
                requestAnimationFrame(() => {
                    // 计算新的位置和高度变化
                    const newBlockTop = block.getBoundingClientRect().top;
                    const newAbsoluteBlockTop = window.scrollY + newBlockTop;
                    const heightDifference = absoluteBlockTop - newAbsoluteBlockTop;
                    
                    // 调整滚动位置
                    if (heightDifference !== 0) {
                        window.scrollTo({
                            top: window.scrollY - heightDifference,
                            behavior: 'instant'
                        });
                    }
                });
            });

            // 组装展开部分
            expandWrapper.appendChild(ellipsis);
            expandWrapper.appendChild(expandButton);
            pre.appendChild(expandWrapper);

            // 设置初始状态
            pre.style.maxHeight = '400px';

            // 添加到观察器
            observer.observe(block);
        }
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
