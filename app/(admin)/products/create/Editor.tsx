"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface EditorProps {
    value: string;
    onChange: (richText: string) => void;
}

const Editor = ({ value, onChange }: EditorProps) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class:
                    "min-h-[150px] w-full rounded-md border px-4 py-2 prose prose-sm max-w-none outline-none transition-all",
                style: "border-color: var(--border-secondary); background-color: var(--card-background); color: var(--text-primary);"
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    return (
        <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border-secondary)' }}>
            {/* Toolbar */}
            <div className="p-2 flex gap-2 flex-wrap border-b" style={{ backgroundColor: 'var(--border-muted)', borderColor: 'var(--border-secondary)' }}>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1 px-3 rounded border transition`}
                    style={{
                        backgroundColor: editor.isActive("bold") ? 'var(--text-primary)' : 'var(--card-background)',
                        color: editor.isActive("bold") ? 'var(--text-inverse)' : 'var(--text-primary)',
                        borderColor: 'var(--border-secondary)'
                    }}
                    onMouseEnter={(e) => !editor.isActive("bold") && (e.currentTarget.style.backgroundColor = 'var(--border-muted)')}
                    onMouseLeave={(e) => !editor.isActive("bold") && (e.currentTarget.style.backgroundColor = 'var(--card-background)')}
                >
                    <b>B</b>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1 px-3 rounded border transition`}
                    style={{
                        backgroundColor: editor.isActive("italic") ? 'var(--text-primary)' : 'var(--card-background)',
                        color: editor.isActive("italic") ? 'var(--text-inverse)' : 'var(--text-primary)',
                        borderColor: 'var(--border-secondary)'
                    }}
                    onMouseEnter={(e) => !editor.isActive("italic") && (e.currentTarget.style.backgroundColor = 'var(--border-muted)')}
                    onMouseLeave={(e) => !editor.isActive("italic") && (e.currentTarget.style.backgroundColor = 'var(--card-background)')}
                >
                    <i>I</i>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1 px-3 rounded border transition`}
                    style={{
                        backgroundColor: editor.isActive("bulletList") ? 'var(--text-primary)' : 'var(--card-background)',
                        color: editor.isActive("bulletList") ? 'var(--text-inverse)' : 'var(--text-primary)',
                        borderColor: 'var(--border-secondary)'
                    }}
                    onMouseEnter={(e) => !editor.isActive("bulletList") && (e.currentTarget.style.backgroundColor = 'var(--border-muted)')}
                    onMouseLeave={(e) => !editor.isActive("bulletList") && (e.currentTarget.style.backgroundColor = 'var(--card-background)')}
                >
                    • Bullet
                </button>

                {/* TOMBOL LIST NOMOR (ORDERED LIST) */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1 px-3 rounded border transition`}
                    style={{
                        backgroundColor: editor.isActive("orderedList") ? 'var(--text-primary)' : 'var(--card-background)',
                        color: editor.isActive("orderedList") ? 'var(--text-inverse)' : 'var(--text-primary)',
                        borderColor: 'var(--border-secondary)'
                    }}
                    onMouseEnter={(e) => !editor.isActive("orderedList") && (e.currentTarget.style.backgroundColor = 'var(--border-muted)')}
                    onMouseLeave={(e) => !editor.isActive("orderedList") && (e.currentTarget.style.backgroundColor = 'var(--card-background)')}
                >
                    1. Number
                </button>
            </div>

            {/* Area Input Teks */}
            <EditorContent editor={editor} />
        </div>
    );
};

export default Editor;