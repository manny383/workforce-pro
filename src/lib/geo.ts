const positionErrorMessage = (error: GeolocationPositionError) => {
  if (error.code === error.PERMISSION_DENIED) return 'Permiso de ubicacion denegado. Habilitalo en los ajustes del navegador o de la aplicacion.';
  if (error.code === error.POSITION_UNAVAILABLE) return 'La ubicacion no esta disponible. Activa el GPS e intenta al aire libre.';
  if (error.code === error.TIMEOUT) return 'La ubicacion tardo demasiado en responder. Intenta nuevamente.';
  return error.message || 'No se pudo obtener la ubicacion.';
};

const readPosition = (enableHighAccuracy: boolean, timeout: number) =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy,
      timeout,
      maximumAge: 15000,
    });
  });

export const getCurrentPosition = async () => {
  if (!navigator.geolocation) {
    throw new Error('Este dispositivo no permite obtener la ubicacion.');
  }

  try {
    return await readPosition(true, 12000);
  } catch {
    try {
      return await readPosition(false, 12000);
    } catch (error) {
      throw new Error(positionErrorMessage(error as GeolocationPositionError));
    }
  }
};
