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
                    "min-h-[150px] w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 prose prose-sm max-w-none",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    return (
        <div className="border border-slate-300 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-slate-50 border-b border-slate-300 p-2 flex gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1 px-3 rounded border transition ${editor.isActive("bold")
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-900 hover:bg-slate-100"
                        }`}
                >
                    <b>B</b>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1 px-3 rounded border transition ${editor.isActive("italic")
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-900 hover:bg-slate-100"
                        }`}
                >
                    <i>I</i>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1 px-3 rounded border transition ${editor.isActive("bulletList")
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-900 hover:bg-slate-100"
                        }`}
                >
                    • Bullet
                </button>

                {/* TOMBOL LIST NOMOR (ORDERED LIST) */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1 px-3 rounded border transition ${editor.isActive("orderedList")
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-900 hover:bg-slate-100"
                        }`}
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