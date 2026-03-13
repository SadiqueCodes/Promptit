import { useState } from 'react';
import { X, Upload, Sparkles } from 'lucide-react';
import type { Template, TemplatePostPayload } from './types';

interface NewPostModalProps {
  templates: Template[];
  initialTemplateId?: string;
  onClose: () => void;
  onSubmit: (payload: TemplatePostPayload) => Promise<void> | void;
}

export function NewPostModal({ templates, initialTemplateId = '', onClose, onSubmit }: NewPostModalProps) {
  const CUSTOM_TEMPLATE_ID = '__custom__';
  const hasTemplates = templates.length > 0;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [templateId, setTemplateId] = useState(initialTemplateId || templates[0]?.id || '');
  const [customPrompt, setCustomPrompt] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handleImageUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const normalizeTag = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-');

  const addTag = (raw: string) => {
    const normalized = normalizeTag(raw);
    if (!normalized) return;
    if (tags.includes(normalized)) return;
    setTags((prev) => [...prev, normalized]);
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const detectedCategory = (() => {
    const set = new Set(tags.map((tag) => tag.trim().toLowerCase()));
    if (set.has('writing')) return 'Writing';
    if (set.has('coding') || set.has('code') || set.has('dev')) return 'Coding';
    if (set.has('marketing') || set.has('seo') || set.has('ads')) return 'Marketing';
    if (set.has('ai-tools') || set.has('ai') || set.has('llm') || set.has('prompt')) return 'AI Tools';
    return 'Other';
  })();

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isPublishing) return;
    if (!title.trim() || !templateId) return;
    if (templateId === CUSTOM_TEMPLATE_ID && !customPrompt.trim()) return;

    setIsPublishing(true);
    try {
      await Promise.resolve(onSubmit({
        title: title.trim(),
        caption: caption.trim(),
        templateId,
        customPrompt: templateId === CUSTOM_TEMPLATE_ID ? customPrompt.trim() : undefined,
        tags,
        imageUrl: imageUrl || undefined,
      }));
    } finally {
      setIsPublishing(false);
    }
  };

  const canContinueStep1 = Boolean(templateId) && (templateId !== CUSTOM_TEMPLATE_ID || Boolean(customPrompt.trim()));
  const canContinueStep2 = Boolean(title.trim());

  return (
    <div className="pit-modal-overlay">
      <div className="pit-modal-card pit-modal-card-post">
        <div className="pit-modal-head">
          <h3>Create Template Post</h3>
          <button onClick={onClose} className="pit-icon-btn"><X size={18} /></button>
        </div>

        <form className="pit-form-grid" onSubmit={submit}>
          <p className="pit-muted">Step {step} of 3</p>

          {step === 1 && (
            <>
              <label className="pit-form-label">
                <span>Select Template</span>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="pit-select"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" disabled>{hasTemplates ? 'Select a template option' : 'No templates found - choose an option'}</option>
                  <option value={CUSTOM_TEMPLATE_ID}>Enter your own prompt</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>{template.title}</option>
                  ))}
                </select>
              </label>

              {templateId === CUSTOM_TEMPLATE_ID && (
                <label className="pit-form-label">
                  <span>Enter your prompt</span>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="pit-input pit-textarea"
                    placeholder="Write your own prompt template..."
                    required
                  />
                </label>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <label className="pit-form-label">
                <span>Title</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="pit-input" placeholder="Fantasy Adventure Epic Quest" required />
              </label>

              <label className="pit-form-label">
                <span>Caption</span>
                <textarea value={caption} onChange={(e) => setCaption(e.target.value)} className="pit-input pit-textarea" placeholder="Add context for the community..." />
              </label>
            </>
          )}

          {step === 3 && (
            <>
              <label className="pit-form-label">
                <span>Tags</span>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(tagInput);
                      setTagInput('');
                    }
                  }}
                  className="pit-input"
                  placeholder="Type a tag (e.g. writing) and press Enter"
                />
                {tags.length > 0 && (
                  <div className="pit-tags-wrap">
                    {tags.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        className="pit-tag-chip"
                        onClick={() => removeTag(tag)}
                        title="Remove tag"
                      >
                        <span>#{tag}</span>
                        <span className="pit-tag-remove">x</span>
                      </button>
                    ))}
                  </div>
                )}
                <p className="pit-muted">Detected category: {detectedCategory}</p>
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
            </>
          )}
        </form>

        <div className="pit-modal-footer">
          <button className="pit-mini-btn" onClick={onClose} disabled={isPublishing}>Cancel</button>
          {step > 1 && (
            <button className="pit-mini-btn" onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)} disabled={isPublishing}>
              Previous
            </button>
          )}
          {step < 3 ? (
            <button
              className="pit-new-post-btn"
              onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3)}
              disabled={isPublishing || (step === 1 && !canContinueStep1) || (step === 2 && !canContinueStep2)}
            >
              Next
            </button>
          ) : (
            <button className="pit-new-post-btn" onClick={() => submit()} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Sparkles size={14} className="animate-pulse" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
