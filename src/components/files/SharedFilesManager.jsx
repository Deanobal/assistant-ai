import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Trash2 } from 'lucide-react';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('File could not be read'));
    reader.readAsDataURL(file);
  });
}

export default function SharedFilesManager({ files = [], canUpload = false, onAddFile, onRemoveFile }) {
  const inputRef = useRef(null);
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('contract');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handlePick = () => inputRef.current?.click();

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !onAddFile) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const file_url = await readFileAsDataUrl(file);
      onAddFile({
        name: label.trim() || file.name,
        category,
        file_url,
        storage_mode: 'embedded_data_url',
        size_bytes: file.size,
        mime_type: file.type || 'application/octet-stream',
        uploaded_at: new Date().toISOString(),
      });
      setLabel('');
      setCategory('contract');
      event.target.value = '';
    } catch (error) {
      setUploadError(error.message || 'File upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {canUpload && (
        <Card className="bg-[#12121a] border-white/5">
          <CardContent className="p-5 space-y-4">
            <div className="grid md:grid-cols-[1fr_180px_auto] gap-3">
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="File name or short label"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handlePick} disabled={isUploading} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50">
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </div>
            <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} />
            <p className="text-sm text-gray-400">Upload contracts, briefs, and client assets. Files are saved into the client record until dedicated cloud storage is connected.</p>
            {uploadError && <p className="text-sm text-red-300">{uploadError}</p>}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {files.length === 0 ? (
          <Card className="bg-[#12121a] border-white/5">
            <CardContent className="p-6 text-gray-400">No files uploaded yet.</CardContent>
          </Card>
        ) : files.map((file, index) => (
          <Card key={`${file.file_url}-${index}`} className="bg-[#12121a] border-white/5">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{file.name}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className="bg-white/5 text-gray-300 border-white/10 capitalize">{file.category || 'file'}</Badge>
                    <span className="text-xs text-gray-500">{file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString() : ''}</span>
                    {file.storage_mode === 'embedded_data_url' && <span className="text-xs text-amber-300">embedded</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/5">
                  <a href={file.file_url} target="_blank" rel="noreferrer">
                    <Download className="w-4 h-4 mr-2" />Open
                  </a>
                </Button>
                {canUpload && onRemoveFile && (
                  <Button variant="ghost" onClick={() => onRemoveFile(index)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
