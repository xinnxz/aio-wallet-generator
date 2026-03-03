/**
 * encryption.js — AES-256-GCM Encryption/Decryption
 * 
 * PENJELASAN LENGKAP:
 * ==================
 * Ketika kamu export file wallet yang berisi private keys, file tersebut
 * SANGAT SENSITIF. Siapapun yang punya file = punya akses ke semua wallet.
 * 
 * Solusi: ENCRYPT file sebelum menyimpan/mengirim.
 * 
 * ALGORITMA YANG DIPAKAI:
 * 
 * 1. AES-256-GCM
 *    - AES = Advanced Encryption Standard (standar enkripsi pemerintah AS)
 *    - 256 = panjang kunci dalam bits (sangat kuat, butuh 2^256 percobaan untuk brute-force)
 *    - GCM = Galois/Counter Mode
 *      → Authenticated encryption: BUKAN hanya encrypt, tapi juga VERIFY integritas
 *      → Jika data diubah 1 bit pun, decryption akan GAGAL
 *      → Ini mencegah tampering (seseorang memodifikasi file encrypted)
 * 
 * 2. PBKDF2 (Password-Based Key Derivation Function 2)
 *    - Mengubah password teks biasa → encryption key 256-bit
 *    - 100.000 iterasi = membuat brute-force SANGAT lambat
 *    - Perkiraan: 1000 password/detik → butuh ~316 tahun untuk bruteforce password 8 char
 * 
 * 3. Salt (32 bytes random)
 *    - Ditambahkan ke password sebelum hashing
 *    - Membuat rainbow table attack tidak berguna
 *    - Random per operasi → password sama, ciphertext berbeda
 * 
 * 4. IV / Initialization Vector (16 bytes random)
 *    - Memastikan enkripsi data yang sama menghasilkan ciphertext berbeda
 *    - Mencegah pattern analysis
 * 
 * FORMAT FILE ENCRYPTED:
 * [salt 32 bytes] [iv 16 bytes] [authTag 16 bytes] [encrypted data...]
 * Total overhead: 64 bytes di awal file
 */

import crypto from 'crypto';
import { EXPORT_CONFIG } from '../utils/config.js';

const {
  encryptionAlgorithm,
  pbkdf2Iterations,
  saltLength,
  ivLength,
} = EXPORT_CONFIG;

/**
 * Derive encryption key dari password menggunakan PBKDF2
 * 
 * @param {string} password - Password dari user
 * @param {Buffer} salt - Random salt
 * @returns {Buffer} 32-byte encryption key
 * 
 * PROSES:
 * password + salt → PBKDF2 (100.000 iterasi SHA-512) → 256-bit key
 * 
 * Kenapa 100.000 iterasi?
 * Supaya brute-force jadi lambat. Tanpa iterasi, attacker bisa
 * mencoba jutaan password per detik. Dengan 100K iterasi,
 * setiap percobaan butuh ~0.1 detik → hanya ~10 password/detik.
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(
    password,       // Password asli
    salt,           // Random salt
    pbkdf2Iterations, // 100.000 iterasi
    32,             // Output: 32 bytes (256 bits)
    'sha512'        // Hash function
  );
}

/**
 * Encrypt data menggunakan AES-256-GCM
 * 
 * @param {string|Object} data - Data yang mau di-encrypt (string atau object)
 * @param {string} password - Password untuk encryption
 * @returns {Buffer} Encrypted data (salt + iv + authTag + ciphertext)
 * 
 * ALUR:
 * 1. Generate random salt (32 bytes)
 * 2. Derive key dari password + salt
 * 3. Generate random IV (16 bytes)
 * 4. Encrypt data → ciphertext + authentication tag
 * 5. Gabungkan: salt + iv + authTag + ciphertext
 */
export function encrypt(data, password) {
  // Convert object ke JSON string jika perlu
  const plaintext = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  // Step 1: Random salt — berbeda setiap kali encrypt
  const salt = crypto.randomBytes(saltLength);

  // Step 2: Derive encryption key dari password
  const key = deriveKey(password, salt);

  // Step 3: Random IV — initialization vector, juga berbeda setiap kali
  const iv = crypto.randomBytes(ivLength);

  // Step 4: Create cipher dan encrypt
  const cipher = crypto.createCipheriv(encryptionAlgorithm, key, iv);
  
  // Update cipher dengan plaintext → hasilnya ciphertext
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);

  // Authentication tag — digunakan untuk verifikasi integritas saat decrypt
  // Jika file dimodifikasi, tag tidak akan match → decryption gagal
  const authTag = cipher.getAuthTag();

  // Step 5: Gabungkan semua komponen
  // Format: [salt][iv][authTag][ciphertext]
  return Buffer.concat([salt, iv, authTag, encrypted]);
}

/**
 * Decrypt data yang sudah di-encrypt
 * 
 * @param {Buffer} encryptedData - Data encrypted (output dari encrypt())
 * @param {string} password - Password yang dipakai saat encrypt
 * @returns {string} Data asli (plaintext)
 * @throws {Error} Jika password salah atau data corrupt
 * 
 * ALUR:
 * 1. Extract salt, iv, authTag, ciphertext dari encrypted data
 * 2. Derive key dari password + salt
 * 3. Set auth tag untuk verifikasi
 * 4. Decrypt → jika gagal, password salah atau data corrupt
 */
export function decrypt(encryptedData, password) {
  // Step 1: Extract komponen dari encrypted data
  const salt = encryptedData.subarray(0, saltLength);  // 32 bytes pertama
  const iv = encryptedData.subarray(saltLength, saltLength + ivLength);  // 16 bytes berikutnya
  const authTag = encryptedData.subarray(saltLength + ivLength, saltLength + ivLength + 16); // 16 bytes berikutnya
  const ciphertext = encryptedData.subarray(saltLength + ivLength + 16);  // Sisanya = ciphertext

  // Step 2: Derive key yang sama dari password + salt yang sama
  const key = deriveKey(password, salt);

  // Step 3: Create decipher
  const decipher = crypto.createDecipheriv(encryptionAlgorithm, key, iv);
  decipher.setAuthTag(authTag); // Set tag untuk verifikasi integritas

  // Step 4: Decrypt
  try {
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()  // Ini akan throw error jika password salah!
    ]);
    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(
      'Decryption failed! Kemungkinan penyebab:\n' +
      '1. Password salah\n' +
      '2. File encrypted corrupt/dimodifikasi\n' +
      '3. File bukan format yang valid'
    );
  }
}

/**
 * Encrypt ke format Base64 (untuk file .encrypted)
 */
export function encryptToBase64(data, password) {
  const encrypted = encrypt(data, password);
  return encrypted.toString('base64');
}

/**
 * Decrypt dari format Base64
 */
export function decryptFromBase64(base64Data, password) {
  const encryptedBuffer = Buffer.from(base64Data, 'base64');
  return decrypt(encryptedBuffer, password);
}
