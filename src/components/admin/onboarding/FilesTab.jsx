import React from 'react';
import SharedFilesManager from '@/components/files/SharedFilesManager';

export default function FilesTab({ client, onUpdate }) {
  const files = client?.shared_files || [];

  return (
    <SharedFilesManager
      files={files}
      canUpload
      onAddFile={(file) => onUpdate({ shared_files: [...files, file], last_activity: 'Client files updated' })}
      onRemoveFile={(index) => onUpdate({ shared_files: files.filter((_, itemIndex) => itemIndex !== index), last_activity: 'Client files updated' })}
    />
  );
}