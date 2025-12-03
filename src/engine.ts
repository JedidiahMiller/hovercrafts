import { Vector3 } from "./lib/vector.js";

export class HovercraftAudioEngine {
  private audioContext: AudioContext;
  private audioBuffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode;
  private isPlaying: boolean = false;

  // Audio parameters
  private minPitch: number = 0.5;  // Pitch when stationary
  private maxPitch: number = 2.5;  // Pitch at max speed
  private minSpeed: number = 0;
  private maxSpeed: number = 350;

  constructor() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 0.4; // Default volume
  }

  // Load your engine audio file
  async loadAudio(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error("Failed to load audio: ", error);
    }
  }

  start(): void {
    if (!this.audioBuffer || this.isPlaying) return;

    // Resume audio context if it's suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.loop = true;
    this.sourceNode.connect(this.gainNode);
    this.sourceNode.start(0);
    this.isPlaying = true;
  }

  updatePitch(linearVelocity: Vector3): void {
    if (!this.sourceNode || !this.isPlaying) return;

    // Calculate speed (magnitude of velocity vector)
    const speed = linearVelocity.magnitude;

    // Normalize speed to 0-1 range
    const normalizedSpeed = Math.max(0, Math.min(1, 
      (speed - this.minSpeed) / (this.maxSpeed - this.minSpeed)
    ));

    // Calculate pitch with slight easing for smoother transitions.
    const pitch = this.minPitch + (this.maxPitch - this.minPitch) * normalizedSpeed;
    
    this.sourceNode.playbackRate.value = pitch;
  }

  // Stop the engine sound
  stop(): void {
    if (this.sourceNode && this.isPlaying) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
      this.sourceNode = null;
      this.isPlaying = false;
    }
  }

  // Set volume (0 to 1)
  setVolume(volume: number): void {
    this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  get playing(): boolean {
    return this.isPlaying;
  }
}