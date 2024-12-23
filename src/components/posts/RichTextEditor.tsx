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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (editor && editor.destroy) {
        editor.destroy()
          .then(() => {
            setEditor(null);
            setIsReady(false);
          })
          .catch((error: any) => {
            console.error('Error destroying editor:', error);
          });
      }
    };
  }, [editor]);

  const handleEditorChange = (_event: any, editorInstance: any) => {
    if (!editorInstance || !isReady) return;

    try {
      const data = editorInstance.getData();
      const strippedContent = data.replace(/<[^>]*>/g, '');
      
      if (!maxLength || strippedContent.length <= maxLength) {
        onChange(data);
      } else {
        editorInstance.setData(value);
      }
    } catch (error) {
      console.error('Error handling editor change:', error);
    }
  };

  const handleEditorReady = (editorInstance: any) => {
    try {
      setEditor(editorInstance);
      setIsReady(true);
    } catch (error) {
      console.error('Error in editor ready:', error);
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="min-h-[200px] border rounded-md">
        <CKEditor
          editor={ClassicEditor}
          data={value}
          onChange={handleEditorChange}
          onReady={handleEditorReady}
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
              'ImageUpload',
              'MediaEmbed',
              'Table'
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