// Audio manager for swipe sounds
let kissAudios: HTMLAudioElement[] = [];
let popAudio: HTMLAudioElement | null = null;
let swooshAudio: HTMLAudioElement | null = null;

// Initialize audio only in browser environment
if (typeof window !== 'undefined') {
  kissAudios = [
    new Audio('/audios/short-kiss-96901.mp3'),
    new Audio('/audios/long-kiss-242243.mp3'),
    new Audio('/audios/long-kiss-41029.mp3'),
    new Audio('/audios/kiss-89981.mp3'),
    new Audio('/audios/kisspop3wav-14505.mp3')
  ];

  popAudio = new Audio('/audios/happy-pop-2-185287.mp3');
  swooshAudio = new Audio('/audios/swoop1-108087.mp3');
}

// Helper function to safely play audio
async function safePlayAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  
  try {
    // Check if playback is allowed
    if (document.documentElement.hasAttribute('data-user-interacted')) {
      await audio.play();
    }
  } catch (error) {
    // Silently fail if playback is not allowed
    console.debug('Audio playback failed:', error);
  }
}

export function playRandomKissSound() {
  if (kissAudios.length === 0) return;
  const randomIndex = Math.floor(Math.random() * kissAudios.length);
  safePlayAudio(kissAudios[randomIndex]);
}

export function playPopSound() {
  safePlayAudio(popAudio);
}

export function playSwooshSound() {
  safePlayAudio(swooshAudio);
}

// Function to mark that user has interacted
export function markUserInteraction() {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-user-interacted', 'true');
  }
} 