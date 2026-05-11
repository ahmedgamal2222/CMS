'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight,
  Link2, Image as ImageIcon, Undo, Redo, Minus
} from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder = 'ابدأ الكتابة هنا...' }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'tiptap-editor min-h-[350px] px-1 py-2 outline-none prose prose-sm max-w-none',
        dir: 'rtl',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-1.5 rounded transition-colors ${active ? 'text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600'}`;

  const addImage = () => {
    const url = window.prompt('رابط الصورة:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = window.prompt('الرابط:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)', background: 'var(--color-surface)' }}>
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="تراجع"><Undo className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="إعادة"><Redo className="w-3.5 h-3.5" /></ToolBtn>
        <Divider />
        <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="عنوان 1"><Heading1 className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="عنوان 2"><Heading2 className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="عنوان 3"><Heading3 className="w-3.5 h-3.5" /></ToolBtn>
        <Divider />
        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="غامق"><Bold className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="مائل"><Italic className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="شطب"><Strikethrough className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="كود"><Code className="w-3.5 h-3.5" /></ToolBtn>
        <Divider />
        <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="يمين"><AlignRight className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="وسط"><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="يسار"><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
        <Divider />
        <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="قائمة"><List className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="قائمة مرقمة"><ListOrdered className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="اقتباس"><Quote className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="فاصل"><Minus className="w-3.5 h-3.5" /></ToolBtn>
        <Divider />
        <ToolBtn onClick={addLink} title="رابط"><Link2 className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={addImage} title="صورة"><ImageIcon className="w-3.5 h-3.5" /></ToolBtn>
        <Divider />
        <input type="color" title="لون النص"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-7 h-7 rounded cursor-pointer border-0 p-0.5"
          style={{ border: '1px solid rgba(0,0,0,0.15)' }} />
      </div>

      {/* Editor */}
      <div dir="rtl" style={{ minHeight: 350 }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolBtn({ onClick, active, title, children }: any) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={`p-1.5 rounded transition-colors text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 ${active ? 'text-white' : ''}`}
      style={active ? { background: 'var(--color-primary)', color: '#fff' } : {}}>
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />;
}
