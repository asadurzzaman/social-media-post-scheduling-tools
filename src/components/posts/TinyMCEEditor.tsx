import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

interface TinyMCEEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export const TinyMCEEditor = ({ value, onChange, maxLength = 2200 }: TinyMCEEditorProps) => {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    // Strip HTML tags for character count
    const strippedContent = content.replace(/<[^>]*>/g, '');
    
    if (!maxLength || strippedContent.length <= maxLength) {
      onChange(content);
    }
  };

  return (
    <div className="space-y-2">
      <Editor
        apiKey="your-tinymce-api-key" // You'll need to get this from TinyMCE
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: 300,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'emoticons'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | link image media emoticons | help',
          content_style: 'body { font-family: Inter, sans-serif; font-size: 14px }',
          branding: false,
          statusbar: false,
          max_chars: maxLength,
          setup: (editor) => {
            editor.on('keyup', () => {
              const charCount = editor.getContent({ format: 'text' }).length;
              if (charCount > maxLength) {
                editor.setContent(value); // Revert to previous content if over limit
              }
            });
          }
        }}
      />
      <div className="flex justify-end text-sm text-muted-foreground">
        <span>{value.replace(/<[^>]*>/g, '').length}/{maxLength}</span>
      </div>
    </div>
  );
};