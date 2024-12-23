import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export const RichTextEditor = ({ value, onChange, maxLength = 2200 }: RichTextEditorProps) => {
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const initialValueRef = useRef(value);

  useEffect(() => {
    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy()
          .catch((error: any) => console.error('Error destroying editor:', error));
      }
    };
  }, []);

  const handleEditorChange = (_event: any, editor: any) => {
    if (!editor || !isEditorReady) return;

    try {
      const data = editor.getData();
      const strippedContent = data.replace(/<[^>]*>/g, '');
      
      if (!maxLength || strippedContent.length <= maxLength) {
        onChange(data);
      } else {
        editor.setData(value);
      }
    } catch (error) {
      console.error('Error handling editor change:', error);
    }
  };

  const handleEditorReady = (editor: any) => {
    try {
      editorRef.current = editor;
      editor.setData(initialValueRef.current);
      setIsEditorReady(true);
    } catch (error) {
      console.error('Error in editor ready:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="min-h-[200px] border rounded-md overflow-hidden">
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