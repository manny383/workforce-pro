export const getCurrentPosition = () =>
  new Promise<GeolocationPosition | null>((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
      enableHighAccuracy: true,
      timeout: 6000,
    });
  });
