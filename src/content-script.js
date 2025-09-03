// Content Script for VT Keyboard Extension
// Enhanced virtual keyboard support with multiple fallback strategies
// Works on all websites

// Detect if we're on a mobile device with virtual keyboard
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
}

// Insert newline using multiple methods for maximum compatibility
function insertNewline(target) {
    // Prevent multiple insertions within 100ms
    const now = Date.now();
    if (target._lastInsertion && now - target._lastInsertion < 100) {
        return;
    }
    target._lastInsertion = now;

    const start = target.selectionStart;
    const end = target.selectionEnd;
    const originalValue = target.value;

    // Method 1: Direct value manipulation
    target.value = originalValue.substring(0, start) + '\n' + originalValue.substring(end);

    // Ensure cursor position is correct
    setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1;
        target.focus();

        // Trigger input event to notify the application
        const inputEvent = new Event('input', { bubbles: true });
        target.dispatchEvent(inputEvent);
    }, 0);
}

function handleEnterKey(event) {
    const isEnterKey = event.key === 'Enter' || event.keyCode === 13 || event.which === 13;

    if (isEnterKey && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const target = event.target;

        // Single insertion with slight delay for virtual keyboards
        if (isMobileDevice()) {
            setTimeout(() => insertNewline(target), 0);
        } else {
            insertNewline(target);
        }

        return false;
    }
}

function handleBeforeInput(event) {
    if (event.inputType === 'insertLineBreak' || event.data === '\n') {
        event.preventDefault();
        insertNewline(event.target);
    }
}

function handleCompositionEnd(event) {
    // Handle composition events from virtual keyboards
    if (event.data === '\n' || event.data === '\r\n') {
        event.preventDefault();
        insertNewline(event.target);
    }
}

function handleTouchEnd(event) {
    // Additional handling for touch-based virtual keyboards
    const target = event.target;
    if (target.tagName.toLowerCase() === 'textarea' ||
        (target.tagName.toLowerCase() === 'input' && target.type === 'text')) {
        // Check if this might be a virtual keyboard enter
        setTimeout(() => {
            if (target.value.endsWith('\n') && !target._naturalNewline) {
                // This might be from virtual keyboard, ensure proper handling
                const cursorPos = target.selectionStart;
                target.selectionStart = target.selectionEnd = cursorPos;
            }
        }, 100);
    }
}

// Activate on all websites - no whitelist restriction
// Touch event handler for virtual keyboards
document.addEventListener('touchend', handleTouchEnd, true);

// Element-specific handlers
document.addEventListener('focusin', (event) => {
    const target = event.target;
    const tagName = target.tagName.toLowerCase();
    const type = target.type?.toLowerCase();

    const isTextarea = tagName === 'textarea';
    const isTextInput = tagName === 'input' && (type === 'text' || type === 'email' || type === 'password' || type === 'url');
    const isSearch = type === 'search' || target.role === 'search' || (target.ariaLabel && target.ariaLabel.toLowerCase().includes('search'));

    if ((isTextarea || isTextInput) && !isSearch) {
        // Remove existing listeners
        target.removeEventListener('keydown', handleEnterKey);
        target.removeEventListener('keypress', handleEnterKey);
        target.removeEventListener('beforeinput', handleBeforeInput);
        target.removeEventListener('compositionend', handleCompositionEnd);

        // Add comprehensive event listeners
        target.addEventListener('keydown', handleEnterKey, true);
        target.addEventListener('keypress', handleEnterKey, true);
        target.addEventListener('beforeinput', handleBeforeInput, true);
        target.addEventListener('compositionend', handleCompositionEnd, true);

        // Cleanup function
        target._cleanupHandler = () => {
            target.removeEventListener('keydown', handleEnterKey, true);
            target.removeEventListener('keypress', handleEnterKey, true);
            target.removeEventListener('beforeinput', handleBeforeInput, true);
            target.removeEventListener('compositionend', handleCompositionEnd, true);
        };

        target.addEventListener('focusout', target._cleanupHandler);
    }
}, true);