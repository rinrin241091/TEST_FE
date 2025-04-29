import React from 'react';

const FileUpload = ({ onFileContentChange }) => {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const text = await file.text();
        onFileContentChange(text);
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Error reading file');
      }
    }
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        onChange={handleFileChange}
        accept=".txt,.doc,.docx,.pdf"
      />
      <p className="file-hint">Upload a file (TXT, DOC, DOCX, PDF)</p>
    </div>
  );
};

export default FileUpload;