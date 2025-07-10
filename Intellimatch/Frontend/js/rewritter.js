/**
 * AI Resume Line Rewriter
 * Handles the enhancement of resume bullet points using AI
 */

class ResumeRewriter {
  constructor() {
    this.enhancementQueue = [];
    this.isProcessing = false;
    this.initEventListeners();
  }

  initEventListeners() {
    // Initialize all enhance buttons on the page
    document.querySelectorAll('.enhance-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleEnhanceClick(e));
    });

    // Event delegation for dynamically added buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('enhance-btn')) {
        this.handleEnhanceClick(e);
      }
    });
  }

  async handleEnhanceClick(e) {
    const button = e.target;
    const textarea = button.previousElementSibling;
    const originalText = textarea.value.trim();

    if (!originalText) {
      this.showToast('Please enter some text to enhance', 'warning');
      return;
    }

    // Add to queue and process
    this.enhancementQueue.push({ button, textarea, originalText });
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.enhancementQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const { button, textarea, originalText } = this.enhancementQueue.shift();

    try {
      this.toggleButtonState(button, true, 'Enhancing...');
      
      const enhancedText = await this.fetchEnhancedText(originalText);
      this.showEnhancementUI(textarea, originalText, enhancedText, button);
    } catch (error) {
      console.error('Enhancement error:', error);
      this.showToast('Failed to enhance text. Please try again.', 'error');
      this.toggleButtonState(button, false, 'Enhance');
    } finally {
      this.processQueue();
    }
  }

  async fetchEnhancedText(text) {
    // In a real app, this would call your backend API
    // For demo purposes, we'll simulate an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate AI enhancement
        const enhanced = this.simulateAIEnhancement(text);
        resolve(enhanced);
      }, 1500);
    });

    // Actual implementation would look like:
    /*
    const response = await fetch('/api/ai/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) throw new Error('Enhancement failed');
    const { enhancedText } = await response.json();
    return enhancedText;
    */
  }

  simulateAIEnhancement(text) {
    // This is just for demo purposes - real app would use actual AI
    const actions = [
      'Developed', 'Implemented', 'Designed', 'Led', 'Optimized', 
      'Increased', 'Reduced', 'Created', 'Managed', 'Improved'
    ];
    const metrics = ['by 30%', 'by 50%', 'to 99.9%', 'from 2s to 0.5s', 'by $1M'];
    const results = [
      'resulting in improved performance',
      'leading to increased customer satisfaction',
      'which reduced operational costs',
      'delivering ahead of schedule',
      'exceeding business objectives'
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const randomMetric = metrics[Math.floor(Math.random() * metrics.length)];
    const randomResult = results[Math.floor(Math.random() * results.length)];

    if (text.endsWith('.')) {
      text = text.slice(0, -1);
    }

    return `${randomAction} ${text} ${randomMetric} ${randomResult}.`;
  }

  showEnhancementUI(textarea, originalText, enhancedText, button) {
    const container = button.parentElement;
    
    // Create enhancement UI
    const enhancementUI = document.createElement('div');
    enhancementUI.className = 'enhancement-result';
    enhancementUI.innerHTML = `
      <div class="enhanced-text">
        <h5>Enhanced Version:</h5>
        <p>${enhancedText}</p>
      </div>
      <div class="enhancement-actions">
        <button class="accept-btn">Accept</button>
        <button class="reject-btn">Keep Original</button>
        <button class="regenerate-btn">Regenerate</button>
      </div>
    `;
    
    // Replace the button with this UI
    container.replaceChild(enhancementUI, button);
    
    // Add event listeners
    enhancementUI.querySelector('.accept-btn').addEventListener('click', () => {
      textarea.value = enhancedText;
      this.restoreOriginalButton(container, enhancementUI, button);
      this.showToast('Enhancement applied!', 'success');
    });
    
    enhancementUI.querySelector('.reject-btn').addEventListener('click', () => {
      textarea.value = originalText;
      this.restoreOriginalButton(container, enhancementUI, button);
    });
    
    enhancementUI.querySelector('.regenerate-btn').addEventListener('click', () => {
      container.removeChild(enhancementUI);
      this.toggleButtonState(button, false, 'Enhance');
      button.click(); // Trigger another enhancement
    });
  }

  restoreOriginalButton(container, enhancementUI, button) {
    container.removeChild(enhancementUI);
    container.appendChild(button);
    this.toggleButtonState(button, false, 'Enhance');
  }

  toggleButtonState(button, isLoading, text) {
    button.disabled = isLoading;
    button.textContent = text;
    if (isLoading) {
      button.classList.add('loading');
    } else {
      button.classList.remove('loading');
    }
  }

  showToast(message, type) {
    // Implement a toast notification system
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => document.body.removeChild(toast), 500);
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const rewriter = new ResumeRewriter();
  
  // Make available globally for debugging
  window.resumeRewriter = rewriter;
});

// CSS for the enhancement UI (could also be in your main CSS file)
const style = document.createElement('style');
style.textContent = `
  .enhancement-result {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 15px;
    margin-top: 10px;
  }
  
  .enhanced-text h5 {
    margin: 0 0 8px 0;
    color: #4361ee;
  }
  
  .enhanced-text p {
    margin: 0 0 12px 0;
    line-height: 1.5;
  }
  
  .enhancement-actions {
    display: flex;
    gap: 8px;
  }
  
  .enhancement-actions button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .accept-btn {
    background: #4bb543;
    color: white;
  }
  
  .reject-btn {
    background: #f0ad4e;
    color: white;
  }
  
  .regenerate-btn {
    background: #4361ee;
    color: white;
  }
  
  .enhance-btn.loading {
    position: relative;
    pointer-events: none;
  }
  
  .enhance-btn.loading::after {
    content: '';
    position: absolute;
    right: -25px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: translateY(-50%) rotate(360deg); }
  }
  
  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    color: white;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  }
  
  .toast.success {
    background: #4bb543;
  }
  
  .toast.error {
    background: #d9534f;
  }
  
  .toast.warning {
    background: #f0ad4e;
  }
  
  .toast.fade-out {
    animation: fadeOut 0.5s ease-out;
    opacity: 0;
  }
  
  @keyframes slideIn {
    from { transform: translateY(100px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);