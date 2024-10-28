import React from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface StyledQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const StyledQuillEditor: React.FC<StyledQuillEditorProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="styled-quill-wrapper h-[250px]">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        className="flex-grow h-full"
        placeholder={placeholder}
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline', 'link'],
            [{ list: 'ordered' }, { list: 'bullet' }],
          ],
        }}
      />
    </div>
  );
};
