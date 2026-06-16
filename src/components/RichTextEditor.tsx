import { useEditor, EditorContent, Extension } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import FontFamily from '@tiptap/extension-font-family';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Palette } from 'lucide-react';

export const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            style: 'font-family: monospace; font-size: 20px; font-weight: bold;',
          },
        },
      }),
      TextStyle,
      Color,
      Underline,
      FontFamily,
      FontSize,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const setFontFamily = (family: string) => {
    editor.chain().focus().setFontFamily(family).run();
  };
  
  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-[#1a1a20] border-b border-white/5 p-2 flex flex-wrap gap-2 items-center">
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          className={`px-2 py-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          className={`px-2 py-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
          className={`px-2 py-1.5 rounded transition-colors ${editor.isActive('underline') ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          title="Underline"
        >
          <UnderlineIcon size={14} />
        </button>
        
        <div className="h-4 w-px bg-white/10 mx-1"></div>
        
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
          className={`px-2 py-1.5 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
          <List size={14} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
          className={`px-2 py-1.5 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
          <ListOrdered size={14} />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1"></div>

        <div className="flex items-center gap-2">
          <Palette size={14} className="text-gray-500" />
          <input
            type="color"
            onChange={(e) => setColor(e.target.value)}
            className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
            title="Text Color"
          />
        </div>

        <select
          onChange={(e) => setFontFamily(e.target.value)}
          className="text-xs bg-black/40 border border-white/10 rounded px-2 py-1 text-gray-300 focus:text-white focus:border-orange-500 outline-none"
          defaultValue=""
        >
          <option value="">Default Font</option>
          <option value="Inter">Inter</option>
          <option value="serif">Serif</option>
          <option value="monospace">Monospace</option>
          <option value="cursive">Cursive</option>
        </select>
        
        <select
          onChange={(e) => {
            if (e.target.value) {
              (editor.chain().focus() as any).setFontSize(e.target.value).run();
            } else {
              (editor.chain().focus() as any).unsetFontSize().run();
            }
          }}
          className="text-xs bg-black/40 border border-white/10 rounded px-2 py-1 text-gray-300 focus:text-white focus:border-orange-500 outline-none"
          defaultValue=""
        >
          <option value="">Size</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="30px">30px</option>
          <option value="36px">36px</option>
          <option value="48px">48px</option>
        </select>
        
        <select
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: level as any }).run();
          }}
          className="text-xs bg-black/40 border border-white/10 rounded px-2 py-1 text-gray-300 focus:text-white focus:border-orange-500 outline-none"
        >
          <option value="0">Normal text</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

      </div>
      <div className="p-6 min-h-[300px] rich-text focus:outline-none flex-1">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
