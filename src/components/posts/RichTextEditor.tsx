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
  const initialValueRef = useRef(value);

  useEffect(() => {
    // Only update editor data if the value has changed and editor exists
    if (editorRef.current && value !== editorRef.current.getData()) {
      editorRef.current.setData(value);
    }
  }, [value]);

  useEffect(() => {
    // Cleanup function to properly destroy the editor instance
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.destroy?.()
            .catch((error: any) => console.error('Error destroying editor:', error));
        } catch (error) {
          console.error('Error during editor cleanup:', error);
        }
      }
    };
  }, []);

  const handleReady = (editor: any) => {
    editorRef.current = editor;
    
    // Set initial data after editor is ready
    if (initialValueRef.current) {
      editor.setData(initialValueRef.current);
    }
  };

  const handleChange = (_event: any, editor: any) => {
    if (!editor) return;

    try {
      const data = editor.getData();
      const strippedContent = data.replace(/<[^>]*>/g, '');
      
      if (!maxLength || strippedContent.length <= maxLength) {
        onChange(data);
      }
    } catch (error) {
      console.error('Error handling editor change:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="min-h-[200px] border rounded-md overflow-hidden">
        <CKEditor
          editor={ClassicEditor}
          onReady={handleReady}
          onChange={handleChange}
          config={{
            toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList'],
            placeholder: 'Write your post content here...',
            removePlugins: [
              'CKFinderUploadAdapter',
              'CKFinder',
              'EasyImage',
              'Image',
              'ImageCaption',
              'ImageStyle',
              'ImageToolbar',
              'ImageUpload'
            ],
          }}
        />
      </div>
      <div className="flex justify-end text-sm text-muted-foreground">
        <span>{value.replace(/<[^>]*>/g, '').length}/{maxLength}</span>
      </div>
    </div>
  );
};