import React, { useEffect, useState } from 'react';
import { getEmbedVideoUrl, resolveMediaUrl } from '../../services/mediaStorage';

interface UniversalVideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
  src,
  className = 'w-full h-full object-cover',
  autoPlay = false,
  muted = false,
  loop = true,
  controls = true,
}) => {
  const [resolvedUrl, setResolvedUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    resolveMediaUrl(src).then((url) => {
      if (active) setResolvedUrl(url);
    });
    return () => {
      active = false;
    };
  }, [src]);

  const embedUrl = getEmbedVideoUrl(src);
  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title="Product Video"
        className={className}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (!resolvedUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-black text-white/70 text-xs ${className}`}
      >
        Loading video...
      </div>
    );
  }

  return (
    <video
      key={resolvedUrl}
      src={resolvedUrl}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline
      preload="metadata"
      className={className}
    />
  );
};
