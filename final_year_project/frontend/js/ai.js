import { apiRequest } from './api.js';

export function initChat() {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-box');
    const submitBtn = document.getElementById('chat-submit');

    const scrollToBottom = () => {
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const appendMessage = (message, sender) => {
        const div = document.createElement('div');
        div.className = `flex items-start gap-4 ${sender === 'user' ? 'flex-row-reverse justify-start' : 'ai-msg'}`;
        
        let iconHtml = '';
        let headerHtml = '';

        if (sender === 'user') {
            const userName = JSON.parse(localStorage.getItem('penguin_user'))?.name || 'Commander';
            iconHtml = `<div class="w-10 h-10 rounded-full border border-purple-500 overflow-hidden shrink-0"><img src="https://api.dicebear.com/7.x/bottts/svg?seed=${userName}" class="w-full h-full object-cover"></div>`;
            headerHtml = `<p class="text-sm font-bold text-glow-purple text-right mb-1">${userName}</p>`;
            div.innerHTML = `
                ${iconHtml}
                <div class="glass-card p-4 rounded-tr-none bg-[rgba(176,38,255,0.1)] border-[rgba(176,38,255,0.3)]">
                    ${headerHtml}
                    <p class="text-[0.95rem]">${message}</p>
                </div>
            `;
        } else {
            iconHtml = `<div class="w-10 h-10 rounded-full bg-[rgba(0,240,255,0.1)] border border-neon-blue p-2 shrink-0 flex items-center justify-center filter drop-shadow-[0_0_5px_#00f0ff]">🐧</div>`;
            headerHtml = `<p class="text-sm font-bold text-neon-blue mb-1">PenguinAI</p>`;
            const formattedMsg = message.replace(/\n/g, '<br>');
            div.innerHTML = `
                ${iconHtml}
                <div class="glass-card p-4 rounded-tl-none border-[rgba(0,240,255,0.3)]">
                    ${headerHtml}
                    <div class="text-[0.95rem] leading-relaxed">${formattedMsg}</div>
                </div>
            `;
        }

        chatBox.appendChild(div);
        
        gsap.from(div, {
            opacity: 0,
            y: 20,
            scale: 0.95,
            duration: 0.4,
            ease: 'back.out(1)'
        });

        scrollToBottom();
    };

    const appendTypingIndicator = () => {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = `flex items-start gap-4 ai-msg`;
        div.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-[rgba(0,240,255,0.1)] border border-neon-blue p-2 shrink-0 flex items-center justify-center filter drop-shadow-[0_0_5px_#00f0ff]">🐧</div>
            <div class="glass-card p-4 rounded-tl-none border-[rgba(0,240,255,0.3)] flex items-center gap-1 h-12">
                <div class="w-2 h-2 rounded-full bg-neon-blue animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 rounded-full bg-neon-blue animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 rounded-full bg-neon-blue animate-bounce" style="animation-delay: 300ms"></div>
            </div>
        `;
        chatBox.appendChild(div);
        scrollToBottom();
        return id;
    };

    const removeElement = (id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = input.value.trim();
        if (!msg) return;

        input.value = '';
        appendMessage(msg, 'user');

        const indicatorId = appendTypingIndicator();
        submitBtn.disabled = true;

        try {
            const res = await apiRequest('/ai/chatbot/', 'POST', { message: msg });
            
            let botReply = res.reply || res.message || res.response || "Task recognized.";
            removeElement(indicatorId);
            appendMessage(botReply, 'ai');

        } catch (error) {
            removeElement(indicatorId);
            appendMessage(`Comm-link disrupted. Error: ${error.message}`, 'ai');
        } finally {
            submitBtn.disabled = false;
            input.focus();
        }
    });
}
