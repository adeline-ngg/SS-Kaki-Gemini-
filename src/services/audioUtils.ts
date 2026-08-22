/**
 * Audio Conversion and PCM Utility Functions for Gemini Live API
 * 
 * - Microphone input: 16-bit linear PCM little-endian @ 16kHz
 * - Gemini Live Output: 16-bit linear PCM little-endian @ 24kHz
 */

/**
 * Converts Float32Array channel data to 16-bit linear PCM Int16Array
 */
export function floatTo16BitPCM(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16Array;
}

/**
 * Encodes Int16Array PCM buffer to Base64 string
 */
export function pcmToBase64(int16Array: Int16Array): string {
  const bytes = new Uint8Array(int16Array.buffer, int16Array.byteOffset, int16Array.byteLength);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a Base64 string into an AudioBuffer @ 24000Hz (Gemini Live standard output sample rate)
 */
export function base64ToAudioBuffer(
  base64Data: string,
  audioContext: AudioContext,
  sampleRate: number = 24000
): AudioBuffer {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const int16 = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
  const float32 = new Float32Array(int16.length);

  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }

  const audioBuffer = audioContext.createBuffer(1, float32.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32);
  return audioBuffer;
}

/**
 * Resamples Float32 audio buffer from native source sample rate to 16kHz
 */
export function downsampleTo16k(
  buffer: Float32Array,
  fromSampleRate: number
): Float32Array {
  if (fromSampleRate === 16000) {
    return buffer;
  }
  const ratio = fromSampleRate / 16000;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const srcIndex = Math.floor(i * ratio);
    result[i] = buffer[srcIndex];
  }
  return result;
}
