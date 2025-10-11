export const getDeviceInfoString = (): string => {
    const ua = navigator.userAgent;
    const match = ua.match(/\(([^)]+)\)/);
    return match ? `(${match[1]})` : "(Unknown Device)";
  };
  