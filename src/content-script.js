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
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const originalValue = target.value;

    // Method 1: Direct value manipulation
    target.value = originalValue.substring(0, start) + '\n' + originalValue.substring(end);

    // Method 2: Try execCommand for older browsers
    try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(target, start);
        range.setEnd(target, start);
        selection.removeAllRanges();
        selection.addRange(range);

        document.execCommand('insertText', false, '\n');
    } catch (e) {
        // execCommand failed, use direct method
    }

    // Ensure cursor position is correct
    setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1;
        target.focus();

        // Trigger multiple events to ensure the application notices
        const events = ['input', 'change', 'keyup', 'keydown'];
        events.forEach(eventType => {
            const event = new Event(eventType, { bubbles: true });
            target.dispatchEvent(event);
        });
    }, 0);
}

function handleEnterKey(event) {
    const isEnterKey = event.key === 'Enter' || event.keyCode === 13 || event.which === 13;

    if (isEnterKey && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const target = event.target;

        // For mobile/virtual keyboards, use different timing strategies
        if (isMobileDevice()) {
            // Immediate insertion for virtual keyboards
            insertNewline(target);
            // Additional delayed insertion as fallback
            setTimeout(() => insertNewline(target), 10);
            setTimeout(() => insertNewline(target), 50);
        } else {
            // Standard insertion for physical keyboards
            setTimeout(() => insertNewline(target), 0);
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

// Global document-level handlers for virtual keyboards
function handleDocumentKeydown(event) {
    const target = event.target;
    const tagName = target.tagName?.toLowerCase();
    const type = target.type?.toLowerCase();

    const isValidTarget = tagName === 'textarea' ||
                         (tagName === 'input' && (type === 'text' || type === 'email' || type === 'password' || type === 'url'));

    if (isValidTarget) {
        const isEnterKey = event.key === 'Enter' || event.keyCode === 13 || event.which === 13;
        if (isEnterKey && !event.shiftKey) {
            handleEnterKey(event);
        }
    }
}

// Activate on all websites - no whitelist restriction
// Global document handlers for virtual keyboards
document.addEventListener('keydown', handleDocumentKeydown, true);
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