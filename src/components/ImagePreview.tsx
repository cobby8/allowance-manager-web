import { X } from 'lucide-react';

interface ImagePreviewProps {
    src: string;
    alt: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ImagePreview({ src, alt, isOpen, onClose }: ImagePreviewProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={onClose}>
            <div className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-lg shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="absolute top-2 right-2 z-10">
                    <button 
                        onClick={onClose}
                        className="p-1 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <div className="flex items-center justify-center h-full bg-gray-100 p-2">
                    {src ? (
                        <img 
                            src={src} 
                            alt={alt} 
                            className="max-w-full max-h-[85vh] object-contain" 
                        />
                    ) : (
                        <div className="text-gray-500">No image available</div>
                    )}
                </div>
            </div>
        </div>
    );
}
