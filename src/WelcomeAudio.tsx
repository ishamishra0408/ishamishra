import React, { useEffect, useRef, useState } from 'react';

const WelcomeAudio = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showPlay, setShowPlay] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Preload muted
      audio.volume = 0;
      audio.play().catch(() => {
        // ignored if autoplay blocked
      });
    }
  }, []);

  const handlePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 1;
      audio.currentTime = 0;
      audio.play();

      // Stop after 20 seconds
      setTimeout(() => {
        audio.pause();
        setShowPlay(false);
      }, 120000);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/welcome-audio.mp3" preload="auto" />
      {showPlay && (
        <div className="fixed bottom-6 right-6 bg-violet-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 cursor-pointer hover:bg-violet-700 transition" onClick={handlePlay}>
          🎧 Unleash my Anthem!
        </div>
      )}
    </>
  );
};

export default WelcomeAudio;
