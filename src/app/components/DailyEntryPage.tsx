import React, { useState } from 'react';
import { Cloud, Heart, Camera, Smile, Send, Eye, X, Maximize2 } from 'lucide-react';

interface Entry {
  date: string;
  photo?: string;
  text: string;
  stickers: string[];
  mood: string;
  author_id: string;
  created_at?: string;
  updated_at?: string;
}

interface DailyEntryPageProps {
  currentUser?: 'partner1' | 'partner2';
  partnerEntry?: Entry;
  onSave: (entry: Entry) => void;
  onPhotoUpload?: (file: File) => Promise<string>;
}

const STICKERS = ['🐱', '🐰', '🐼', '🐻', '🦊', '🐨', '🦝', '🐹'];
const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '🥰', label: 'Loving' },
  { emoji: '😢', label: 'Missing You' },
  { emoji: '😴', label: 'Sleepy' },
  { emoji: '🎉', label: 'Excited' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '🌟', label: 'Hopeful' },
  { emoji: '💭', label: 'Thinking of You' },
];

export const DailyEntryPage: React.FC<DailyEntryPageProps> = ({
  currentUser = 'partner1',
  partnerEntry,
  onSave,
  onPhotoUpload,
}) => {
  const [photo, setPhoto] = useState<string>('');
  const [multiplePhotos, setMultiplePhotos] = useState<File[]>([]);
  const [text, setText] = useState('');
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState('😊');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const compressImage = async (file: File, maxWidth = 800, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsCompressing(true);
    const newPhotos: File[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          // Compress image before adding
          const compressedFile = await compressImage(file);
          const originalSize = (file.size / 1024).toFixed(1);
          const compressedSize = (compressedFile.size / 1024).toFixed(1);
          console.log(`Compressed: ${originalSize}KB → ${compressedSize}KB`);
          newPhotos.push(compressedFile);
        }
      }
      
      setMultiplePhotos([...multiplePhotos, ...newPhotos]);
    } finally {
      setIsCompressing(false);
    }
  };

  const toggleSticker = (sticker: string) => {
    if (selectedStickers.includes(sticker)) {
      setSelectedStickers(selectedStickers.filter((s) => s !== sticker));
    } else if (selectedStickers.length < 5) {
      setSelectedStickers([...selectedStickers, sticker]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      let uploadedPhotoUrl: string | undefined;
      
      // Upload photo if there's one
      if (multiplePhotos.length > 0 && onPhotoUpload) {
        uploadedPhotoUrl = await onPhotoUpload(multiplePhotos[0]);
      }
      
      setTimeout(() => {
        onSave({
          date: today.toISOString().split('T')[0],
          photo: uploadedPhotoUrl,
          text,
          stickers: selectedStickers,
          mood: selectedMood,
          author_id: currentUser === 'partner1' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
        });
        setIsSaving(false);
      }, 1500);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setIsSaving(false);
    }
  };

  const userColor = currentUser === 'partner1' ? 'from-[var(--pastel-pink)] to-[var(--primary)]' : 'from-[var(--pastel-blue)] to-[var(--secondary)]';
  const currentUserName = currentUser === 'partner1' ? 'Nour' : 'Skander';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Date Header */}
      <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--pastel-pink)] to-[var(--pastel-lavender)] text-white px-6 py-3 rounded-full">
          <Heart className="w-5 h-5 fill-white animate-pulse" />
          <span className="font-medium">{formattedDate}</span>
          <Heart className="w-5 h-5 fill-white animate-pulse" />
        </div>
        <p className="text-[var(--muted-foreground)] mt-4">
          "What made you smile today, my love?" 💕
        </p>
      </div>

      
      {/* Two Column Layout: Your Entry & Partner's Entry */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Your Entry */}
        <div className="space-y-4">
          <h3 className="text-[var(--foreground)] flex items-center gap-2">
            <Heart className={`w-5 h-5 fill-current bg-gradient-to-br ${userColor} rounded-full p-1`} />
            {currentUserName}'s Entry
          </h3>

          {/* Multiple Photo Upload */}
          <div className="relative bg-gradient-to-br from-white to-[var(--pastel-blue)]/20 border-2 border-dashed border-[var(--secondary)] rounded-[2rem] p-6 cursor-pointer hover:shadow-lg transition-all group overflow-hidden">
            {isCompressing && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="text-[var(--foreground)]">Compressing images...</div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id="photo-upload"
              onChange={(e) => handlePhotoUpload(e.target.files)}
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              {multiplePhotos.length === 0 ? (
                <div className="text-center">
                  <Cloud className="w-16 h-16 text-[var(--secondary)] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-[var(--foreground)]">+ Add Photos</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Click to upload multiple memories
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[var(--foreground)] font-medium">
                      {multiplePhotos.length} photo{multiplePhotos.length > 1 ? 's' : ''} selected
                    </p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setMultiplePhotos([]);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {multiplePhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                          {(photo.size / 1024).toFixed(1)}KB
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setMultiplePhotos(multiplePhotos.filter((_, i) => i !== index));
                          }}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-lg hover:bg-red-50 transition-colors"
                        >
                          <X className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <Cloud className="w-8 h-8 text-[var(--secondary)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Click to add more photos
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>

          {/* Heart-shaped Text Area */}
          <div className="relative bg-gradient-to-br from-[var(--pastel-pink)]/10 to-[var(--pastel-lavender)]/10 rounded-[2rem] p-6 border-2 border-[var(--primary)]/20">
            <div className="absolute -top-3 left-6 bg-white px-3 py-1 rounded-full border-2 border-[var(--primary)] text-sm text-[var(--primary)]">
              💭 Your thoughts...
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share what's in your heart today... How are you feeling? What reminded you of us? Any fun moments to share?"
              className="w-full h-40 bg-transparent border-none resize-none focus:outline-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] mt-4"
              maxLength={500}
            />
            <div className="text-right text-sm text-[var(--muted-foreground)]">
              {text.length}/500
            </div>
          </div>

          {/* Mood Selector */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <label className="text-sm text-[var(--foreground)] mb-3 flex items-center gap-2">
              <Smile className="w-4 h-4 text-[var(--primary)]" />
              How are you feeling?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.emoji}
                  onClick={() => setSelectedMood(mood.emoji)}
                  className={`p-3 rounded-xl text-2xl transition-all flex flex-col items-center ${
                    selectedMood === mood.emoji
                      ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--pastel-pink)] scale-110 shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  title={mood.label}
                >
                  {mood.emoji}
                  <span className="text-xs mt-1">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sticker Selector */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <label className="text-sm text-[var(--foreground)] mb-3 block">
              Add cute stickers (max 5):
            </label>
            <div className="grid grid-cols-8 gap-2 mb-3">
              {STICKERS.map((sticker) => (
                <button
                  key={sticker}
                  onClick={() => toggleSticker(sticker)}
                  className={`p-2 text-2xl rounded-xl transition-all ${
                    selectedStickers.includes(sticker)
                      ? 'bg-gradient-to-br from-[var(--pastel-pink)] to-[var(--pastel-lavender)] scale-110 shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {sticker}
                </button>
              ))}
            </div>
            {selectedStickers.length > 0 && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-[var(--muted-foreground)]">Selected:</span>
                {selectedStickers.map((sticker, i) => (
                  <span key={i} className="text-xl">{sticker}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Partner's Entry */}
        <div className="space-y-4">
          <h3 className="text-[var(--foreground)] flex items-center gap-2">
            <Heart className="w-5 h-5 fill-[var(--secondary)] text-[var(--secondary)]" />
            Partner's Entry
          </h3>

          {partnerEntry ? (
            <div 
              className="bg-gradient-to-br from-[var(--pastel-blue)]/20 to-[var(--pastel-lavender)]/20 rounded-2xl p-6 shadow-lg border-2 border-[var(--secondary)]/30 max-h-[calc(100vh-200px)] overflow-y-auto cursor-pointer hover:shadow-xl transition-all duration-300 group relative"
              onClick={() => setShowPartnerModal(true)}
            >
              {/* Preview indicator */}
              <div className="absolute top-2 right-2 bg-white/80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4 text-[var(--secondary)]" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{partnerEntry.mood}</div>
                <div>
                  <p className="text-[var(--foreground)]">Feeling {MOODS.find(m => m.emoji === partnerEntry.mood)?.label}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Posted {partnerEntry.created_at ? new Date(partnerEntry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(partnerEntry.date).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {partnerEntry.photo && (
                <img
                  src={partnerEntry.photo}
                  alt="Partner's memory"
                  className="w-full h-auto max-h-64 object-cover rounded-xl mb-4"
                />
              )}

              <div className="bg-white/50 rounded-xl p-4 mb-4">
                <p className="text-[var(--foreground)]">{partnerEntry.text}</p>
              </div>

              {partnerEntry.stickers.length > 0 && (
                <div className="flex gap-2">
                  {partnerEntry.stickers.map((sticker, i) => (
                    <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                      {sticker}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/50 rounded-2xl p-12 text-center border-2 border-dashed border-[var(--border)]">
              <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-[var(--muted-foreground)] mb-2">
                Your partner hasn't posted yet today
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                "Hang in there, bunny! They'll share soon!" 🐰
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-[var(--foreground)] rounded-full transition-all shadow-lg"
        >
          <Eye className="w-5 h-5" />
          {showPreview ? 'Hide' : 'Show'} Preview
        </button>

        <button
          onClick={handleSave}
          disabled={!text.trim() || isSaving}
          className="relative flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--pastel-peach)] hover:shadow-xl text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
        >
          {isSaving ? (
            <>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span>Saving with love...</span>
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
              <span>Save Today's Memory</span>
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
          
          {/* Heart animation on hover */}
          <div className="absolute inset-0 pointer-events-none">
            <Heart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 fill-white text-white opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500" />
          </div>
        </button>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-[var(--foreground)] mb-4 text-center">
            📅 Calendar Preview
          </h3>
          <div className="max-w-md mx-auto">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-[var(--pastel-pink)] to-[var(--pastel-lavender)] p-4 relative shadow-lg">
              <div className="text-sm text-white mb-2">{today.getDate()}</div>
              
              {photo && (
                <img
                  src={photo}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-xl mb-2"
                />
              )}
              
              <div className="bg-white/80 rounded-xl p-2 mb-2 text-xs text-[var(--foreground)] line-clamp-2">
                {text || 'Your thoughts will appear here...'}
              </div>
              
              <div className="flex gap-1 mb-2">
                {selectedStickers.slice(0, 3).map((sticker, i) => (
                  <span key={i} className="text-sm">{sticker}</span>
                ))}
              </div>
              
              <div className="absolute bottom-2 right-2 flex gap-1">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${userColor} border-2 border-white shadow-md flex items-center justify-center text-white text-xs`}>
                  {currentUser === 'partner1' ? 'A' : 'B'}
                </div>
                <div className="text-2xl">{selectedMood}</div>
              </div>

              <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 fill-white text-white opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* Partner Entry Modal */}
      {showPartnerModal && partnerEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{partnerEntry.mood}</div>
                <div>
                  <p className="text-lg font-semibold text-[var(--foreground)]">
                    Feeling {MOODS.find(m => m.emoji === partnerEntry.mood)?.label}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Posted {partnerEntry.created_at ? new Date(partnerEntry.created_at).toLocaleString([], { 
                      weekday: 'long', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : new Date(partnerEntry.date).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPartnerModal(false)}
                className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Full Image */}
              {partnerEntry.photo && (
                <div className="mb-6">
                  <img
                    src={partnerEntry.photo}
                    alt="Partner's memory"
                    className="w-full h-auto rounded-xl shadow-lg"
                  />
                </div>
              )}

              {/* Text Content */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 mb-6">
                <p className="text-[var(--foreground)] whitespace-pre-wrap text-lg leading-relaxed">
                  {partnerEntry.text}
                </p>
              </div>

              {/* Stickers */}
              {partnerEntry.stickers.length > 0 && (
                <div className="flex gap-3 justify-center">
                  {partnerEntry.stickers.map((sticker, i) => (
                    <span key={i} className="text-4xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                      {sticker}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
