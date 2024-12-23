import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export const RichTextEditor = ({ value, onChange, maxLength = 2200 }: RichTextEditorProps) => {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (_event: any, editor: any) => {
    const content = editor.getData();
    // Strip HTML tags for character count
    const strippedContent = content.replace(/<[^>]*>/g, '');
    
    if (!maxLength || strippedContent.length <= maxLength) {
      onChange(content);
    } else {
      // If over limit, revert to previous content
      editor.setData(value);
    }
  };

  return (
    <div className="space-y-2">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={handleEditorChange}
        onReady={(editor) => {
          editorRef.current = editor;
          // Remove the bottom bar that shows "Powered by CKEditor"
          const element = editor.ui.view.element;
          if (element) {
            const bottomBar = element.querySelector('.ck-editor__bottom-bar');
            if (bottomBar) {
              bottomBar.remove();
            }
          }
        }}
        config={{
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'blockQuote',
            'insertTable',
            'undo',
            'redo'
          ],
          placeholder: 'Write your post content here...',
        }}
      />
      <div className="flex justify-end text-sm text-muted-foreground">
        <span>{value.replace(/<[^>]*>/g, '').length}/{maxLength}</span>
      </div>
    </div>
  );
};