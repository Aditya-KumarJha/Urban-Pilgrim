import { useState, useRef, useEffect } from 'react';
import { FiBold, FiItalic, FiUnderline } from 'react-icons/fi';

export default function RichTextEditor({ value = '', onChange, placeholder = 'Enter text...', rows = 3 }) {
    const editorRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    // Initialize content when value changes from parent
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    // Handle formatting commands
    const applyFormat = (command) => {
        document.execCommand(command, false, null);
        editorRef.current.focus();
    };

    // Handle content change
    const handleInput = () => {
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            onChange(content);
        }
    };

    // Handle paste - strip unwanted formatting but keep basic formatting
    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');

        // Create a temporary div to parse the HTML
        const temp = document.createElement('div');
        temp.innerHTML = text;

        // Clean up - keep only b, i, u, strong, em tags
        const cleanHTML = temp.innerHTML
            .replace(/<(?!\/?(b|i|u|strong|em)\b)[^>]+>/gi, '')
            .replace(/style="[^"]*"/gi, '')
            .replace(/class="[^"]*"/gi, '');

        document.execCommand('insertHTML', false, cleanHTML);
    };

    // Check if a format is currently active
    const isFormatActive = (command) => {
        return document.queryCommandState(command);
    };

    return (
        <div className="w-full">
            {/* Toolbar */}
            <div className={`flex gap-1 p-2 border border-b-0 rounded-t-lg bg-gray-50 ${isFocused ? 'border-blue-500' : 'border-gray-300'}`}>
                <button
                    type="button"
                    onClick={() => applyFormat('bold')}
                    className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                        isFormatActive('bold') ? 'bg-gray-300' : ''
                    }`}
                    title="Bold (Ctrl+B)"
                >
                    <FiBold className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => applyFormat('italic')}
                    className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                        isFormatActive('italic') ? 'bg-gray-300' : ''
                    }`}
                    title="Italic (Ctrl+I)"
                >
                    <FiItalic className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => applyFormat('underline')}
                    className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                        isFormatActive('underline') ? 'bg-gray-300' : ''
                    }`}
                    title="Underline (Ctrl+U)"
                >
                    <FiUnderline className="w-4 h-4" />
                </button>
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`text-sm w-full border rounded-b-lg p-3 outline-none min-h-[${rows * 24}px] overflow-y-auto ${
                    isFocused ? 'border-blue-500' : 'border-gray-300'
                }`}
                style={{
                    minHeight: `${rows * 24}px`,
                }}
                suppressContentEditableWarning
                data-placeholder={placeholder}
            />

            <style>{`
                [contentEditable][data-placeholder]:empty:before {
                    content: attr(data-placeholder);
                    color: #9CA3AF;
                    pointer-events: none;
                    position: absolute;
                }
                [contentEditable] {
                    position: relative;
                }
            `}</style>
        </div>
    );
}
