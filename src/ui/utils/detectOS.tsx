// utils/detectOS.ts
export const detectOS = (): string => {
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();
  
    if (platform.includes("win")) {
      return "Windows";
    }
    if (platform.includes("mac")) {
      return "MacOS";
    }
    if (platform.includes("linux")) {
      return "Linux";
    }
    if (userAgent.includes("android")) {
      return "Android";
    }
    if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
      return "iOS";
    }
  
    return "Unknown";
  };
  