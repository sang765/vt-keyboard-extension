// Content Script for VT Keyboard Extension
// Modifies Enter key behavior in text inputs on whitelisted sites

// Default whitelist for V2 (when dynamic injection isn't available)
const DEFAULT_WHITELIST = ['docs.google.com', 'notion.so', 'etherpad.net'];

function isDomainWhitelisted(domain) {
    // Check if current domain is in whitelist
    return DEFAULT_WHITELIST.some(whitelisted => domain.includes(whitelisted));
}

function insertNewline(target) {
    const start = target.selectionStart;
    const end = target.selectionEnd;

    // Insert a newline character at the cursor position
    target.value = target.value.substring(0, start) + '\n' + target.value.substring(end);

    // Move the cursor to the position after the newline
    target.selectionStart = target.selectionEnd = start + 1;

    // Trigger input event to notify the application of the change
    const inputEvent = new Event('input', { bubbles: true });
    target.dispatchEvent(inputEvent);
}

function handleEnterKey(event) {
    // Check for Enter key (both physical and virtual keyboards)
    const isEnterKey = event.key === 'Enter' || event.keyCode === 13 || event.which === 13;

    if (isEnterKey && !event.shiftKey) {
        // Prevent default behavior
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const target = event.target;

        // For virtual keyboards, we might need to handle this differently
        // Try multiple approaches
        setTimeout(() => insertNewline(target), 0);

        return false;
    }
}

function handleBeforeInput(event) {
    // Handle beforeinput event for virtual keyboards
    if (event.inputType === 'insertLineBreak' || (event.data === '\n' && !event.shiftKey)) {
        event.preventDefault();
        const target = event.target;
        insertNewline(target);
    }
}

function handleInput(event) {
    // Additional handling for input events
    const target = event.target;
    if (target._pendingNewline) {
        target._pendingNewline = false;
        // Ensure cursor position is correct after newline insertion
        const cursorPos = target.selectionStart;
        target.selectionStart = target.selectionEnd = cursorPos;
    }
}

// Check if we should activate on this page
const currentDomain = window.location.hostname;
if (isDomainWhitelisted(currentDomain)) {
    document.addEventListener('focusin', (event) => {
        const target = event.target;
        const tagName = target.tagName.toLowerCase();
        const type = target.type?.toLowerCase();

        // Check if it's a valid target (textarea, text input) and NOT a search field
        const isTextarea = tagName === 'textarea';
        const isTextInput = tagName === 'input' && (type === 'text' || type === 'email' || type === 'password' || type === 'url');
        const isSearch = type === 'search' || target.role === 'search' || (target.ariaLabel && target.ariaLabel.toLowerCase().includes('search'));

        if ((isTextarea || isTextInput) && !isSearch) {
            // Remove any existing listeners to avoid duplicates
            target.removeEventListener('keydown', handleEnterKey);
            target.removeEventListener('keypress', handleEnterKey);
            target.removeEventListener('beforeinput', handleBeforeInput);
            target.removeEventListener('input', handleInput);

            // Add multiple event listeners for better virtual keyboard support
            target.addEventListener('keydown', handleEnterKey, true);
            target.addEventListener('keypress', handleEnterKey, true);
            target.addEventListener('beforeinput', handleBeforeInput, true);
            target.addEventListener('input', handleInput, true);

            // Cleanup function
            target._cleanupHandler = () => {
                target.removeEventListener('keydown', handleEnterKey, true);
                target.removeEventListener('keypress', handleEnterKey, true);
                target.removeEventListener('beforeinput', handleBeforeInput, true);
                target.removeEventListener('input', handleInput, true);
            };

            // Add event listener to remove listeners on focusout
            target.addEventListener('focusout', target._cleanupHandler);
        }
    }, true); // Use capture phase to catch events early
}