const randomBytes = (length: number) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
};

const textBytes = (value: string) => new TextEncoder().encode(value);

const bytesToBase64Url = (value: ArrayBuffer) => {
  const bytes = new Uint8Array(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export type BiometricVerification = {
  verificada: true;
  metodo: 'platform';
  credential_id: string;
  tipo: string;
  timestamp: string;
};

export const verifyBiometricPresence = async (user: { id: number; correo: string; nombre: string }): Promise<BiometricVerification> => {
  if (!window.PublicKeyCredential || !navigator.credentials) {
    throw new Error('Este dispositivo no permite verificacion biometrica desde la aplicacion.');
  }

  const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.();
  if (!isAvailable) {
    throw new Error('Configura huella, rostro o bloqueo de pantalla en este dispositivo antes de registrar asistencia.');
  }

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: randomBytes(32),
        rp: {
          name: 'Workforce Pro',
        },
        user: {
          id: textBytes(String(user.id)),
          name: user.correo,
          displayName: user.nombre,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          residentKey: 'discouraged',
          userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'none',
      },
    });

    if (!(credential instanceof PublicKeyCredential) || !credential.rawId) {
      throw new Error('La verificacion biometrica no devolvio una credencial valida.');
    }

    return {
      verificada: true,
      metodo: 'platform',
      credential_id: bytesToBase64Url(credential.rawId),
      tipo: credential.type,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      throw new Error('Verificacion biometrica cancelada o no autorizada.');
    }

    throw new Error('No se pudo completar la verificacion biometrica.');
  }
};
