import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export const RichTextEditor = ({ value, onChange, maxLength = 2200 }: RichTextEditorProps) => {
  const [editor, setEditor] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const initialValue = useRef(value);

  useEffect(() => {
    return () => {
      if (editor && typeof editor.destroy === 'function') {
        editor.destroy()
          .catch((error: any) => console.error('Error destroying editor:', error));
      }
    };
  }, [editor]);

  const handleReady = (editor: any) => {
    setEditor(editor);
    setIsReady(true);
  };

  const handleChange = (_event: any, editor: any) => {
    if (!editor || !isReady) return;

    const data = editor.getData();
    const strippedContent = data.replace(/<[^>]*>/g, '');
    
    if (!maxLength || strippedContent.length <= maxLength) {
      onChange(data);
    }
  };

  return (
    <div className="space-y-2">
      <div className="min-h-[200px] border rounded-md overflow-hidden">
        <CKEditor
          editor={ClassicEditor}
          data={value}
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