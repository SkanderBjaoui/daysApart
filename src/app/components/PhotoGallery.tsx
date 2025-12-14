import React from 'react';
import { Camera, Plus } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  uploadedBy: 'partner1' | 'partner2';
  timestamp: Date;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onUpload?: (file: File) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, onUpload }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-6 h-6 text-[var(--primary)]" />
          <h3 className="text-[var(--foreground)]">Our Memories</h3>
        </div>
        <input
              type="file"
              accept="image/*"
              className="hidden"
              id="photo-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onUpload) onUpload(file);
              }}
            />
            <label
              htmlFor="photo-upload"
              className="bg-[var(--primary)] hover:bg-[var(--pastel-pink)] text-white px-4 py-2 rounded-full transition-colors cursor-pointer"
            >
              Upload
            </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {photos.slice(0, 6).map((photo) => (
          <div
            key={photo.id}
            className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[var(--pastel-pink)] to-[var(--pastel-lavender)] hover:scale-105 transition-transform cursor-pointer relative group"
          >
            <img
              src={photo.url}
              alt="Memory"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
          </div>
        ))}
        
        {photos.length === 0 && (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-gradient-to-br from-[var(--pastel-pink)]/20 to-[var(--pastel-lavender)]/20 flex items-center justify-center"
              >
                <Camera className="w-8 h-8 text-gray-300" />
              </div>
            ))}
          </>
        )}
      </div>

      {photos.length > 6 && (
        <button className="w-full mt-4 text-[var(--primary)] hover:text-[var(--pastel-pink)] text-center py-2 transition-colors">
          View all {photos.length} memories →
        </button>
      )}
    </div>
  );
};
