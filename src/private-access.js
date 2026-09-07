// ACCESO MEDIANTE ENLACE SECRETO (no es autenticación ni seguridad real).
// Pega aquí el SHA-256 de tu token cuando lo generes. Nunca guardes el token
// original en el repositorio. Mientras este valor sea el marcador, todo acceso
// quedará bloqueado.
export const AUTHORIZED_TOKEN_HASH = '6641668b008e41aefdac7f84c426c8af69e2d5d3561e79cebb819e35ddc645d0';

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function validateSecretLink() {
  const blocker = document.querySelector('#access-blocker');
  const token = new URLSearchParams(location.hash.slice(1)).get('access');

  // GitHub Pages es estático: esto solo dificulta el acceso casual. Quien obtenga
  // el enlace puede compartirlo y los archivos publicados no son privados. Para
  // privacidad real se necesita autenticación y un backend.
  if (!token || !globalThis.crypto?.subtle || AUTHORIZED_TOKEN_HASH.startsWith('REEMPLAZA_')) {
    blocker.hidden = false;
    return false;
  }

  try {
    const valid = (await sha256(token)) === AUTHORIZED_TOKEN_HASH.toLowerCase();
    blocker.hidden = valid;
    return valid;
  } catch (error) {
    console.warn('No se pudo validar el enlace de acceso.', error);
    blocker.hidden = false;
    return false;
  }
}
