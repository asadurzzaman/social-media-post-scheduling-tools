import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export const RichTextEditor = ({ value, onChange, maxLength = 2200 }: RichTextEditorProps) => {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
      }
    };
  }, []);

  const handleEditorChange = (_event: any, editor: any) => {
    try {
      const data = editor.getData();
      // Strip HTML tags for character count
      const strippedContent = data.replace(/<[^>]*>/g, '');
      
      if (!maxLength || strippedContent.length <= maxLength) {
        onChange(data);
      } else {
        // If over limit, revert to previous content
        editor.setData(value);
      }
    } catch (error) {
      console.error('Error handling editor change:', error);
    }
  };

  const handleEditorReady = (editor: any) => {
    try {
      editorRef.current = editor;
      
      // Remove the bottom bar that shows "Powered by CKEditor"
      const element = editor.ui.view.element;
      if (element) {
        const bottomBar = element.querySelector('.ck-editor__bottom-bar');
        if (bottomBar) {
          bottomBar.remove();
        }
      }
    } catch (error) {
      console.error('Error in editor ready:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="min-h-[200px]">
        <CKEditor
          editor={ClassicEditor}
          data={value}
          onChange={handleEditorChange}
          onReady={handleEditorReady}
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
            removePlugins: ['CKFinderUploadAdapter', 'CKFinder', 'EasyImage', 'Image', 'ImageCaption', 'ImageStyle', 'ImageToolbar', 'ImageUpload'],
          }}
        />
      </div>
      <div className="flex justify-end text-sm text-muted-foreground">
        <span>{value.replace(/<[^>]*>/g, '').length}/{maxLength}</span>
      </div>
    </div>
  );
};