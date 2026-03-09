import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import type { Template, TemplatePostPayload } from './types';

interface NewPostModalProps {
  templates: Template[];
  initialTemplateId?: string;
  onClose: () => void;
  onSubmit: (payload: TemplatePostPayload) => void;
}

export function NewPostModal({ templates, initialTemplateId = '', onClose, onSubmit }: NewPostModalProps) {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [templateId, setTemplateId] = useState(initialTemplateId || templates[0]?.id || '');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('writing');

  const handleImageUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim() || !templateId) return;

    onSubmit({
      title: title.trim(),
      caption: caption.trim(),
      templateId,
      imageUrl: imageUrl || undefined,
      category,
    });
  };

  return (
    <div className="pit-modal-overlay">
      <div className="pit-modal-card pit-modal-card-post">
        <div className="pit-modal-head">
          <h3>Create Template Post</h3>
          <button onClick={onClose} className="pit-icon-btn"><X size={18} /></button>
        </div>

        <form className="pit-form-grid" onSubmit={submit}>
          <label className="pit-form-label">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="pit-input" placeholder="Fantasy Adventure Epic Quest" required />
          </label>

          <label className="pit-form-label">
            <span>Caption</span>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} className="pit-input pit-textarea" placeholder="Add context for the community..." />
          </label>

          <label className="pit-form-label">
            <span>Select Template</span>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="pit-select"
              style={{ colorScheme: 'dark' }}
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>{template.title}</option>
              ))}
            </select>
          </label>

          <label className="pit-form-label">
            <span>Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="pit-select"
              style={{ colorScheme: 'dark' }}
            >
              <option value="writing">Writing</option>
              <option value="coding">Coding</option>
              <option value="marketing">Marketing</option>
              <option value="ai-tools">AI Tools</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="pit-form-label">
            <span>Image URL (optional)</span>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="pit-input" placeholder="https://..." />
          </label>

          <div className="pit-upload-row">
            <label className="pit-mini-btn pit-upload-btn">
              <Upload size={14} />
              <span>Upload Image</span>
              <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e.target.files?.[0] || null)} />
            </label>
          </div>
        </form>

        <div className="pit-modal-footer">
          <button className="pit-mini-btn" onClick={onClose}>Cancel</button>
          <button className="pit-new-post-btn" onClick={() => submit()}>Publish</button>
        </div>
      </div>
    </div>
  );
}
