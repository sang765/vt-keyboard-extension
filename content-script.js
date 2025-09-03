// Content Script for VT Keyboard Extension
// Modifies Enter key behavior in text inputs on whitelisted sites

function handleEnterKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const target = event.target;
        const start = target.selectionStart;
        const end = target.selectionEnd;

        // Insert a newline character at the cursor position
        target.value = target.value.substring(0, start) + '\n' + target.value.substring(end);

        // Move the cursor to the position after the newline
        target.selectionStart = target.selectionEnd = start + 1;
    }
}

document.addEventListener('focusin', (event) => {
    const target = event.target;
    const tagName = target.tagName.toLowerCase();
    const type = target.type?.toLowerCase();

    // Check if it's a valid target (textarea, text input) and NOT a search field
    const isTextarea = tagName === 'textarea';
    const isTextInput = tagName === 'input' && (type === 'text' || type === 'email' || type === 'password' || type === 'url');
    const isSearch = type === 'search' || target.role === 'search' || (target.ariaLabel && target.ariaLabel.toLowerCase().includes('search'));

    if ((isTextarea || isTextInput) && !isSearch) {
        target.addEventListener('keydown', handleEnterKey);
        // Add event listener to remove the keydown listener on focusout to avoid memory leaks
        target._cleanupHandler = () => target.removeEventListener('keydown', handleEnterKey);
        target.addEventListener('focusout', target._cleanupHandler);
    }
}, true); // Use capture phase to catch events early