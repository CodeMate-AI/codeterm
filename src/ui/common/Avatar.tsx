import React from "react";

// Define the properties that the Avatar component can accept
interface AvatarProps {
  src?: string; // URL of the avatar image
  alt?: string; // Alt text for the avatar image
  fallback?: React.ReactNode; // Fallback content if the image fails to load
  className?: string; // Additional CSS classes for styling
  defaultImage?: string; // Default image URL if src is not provided
}

// Avatar component definition
export function Avatar({
  src, // Source URL of the avatar image
  alt, // Alt text for the avatar image
  fallback, // Fallback content if the image fails to load
  className, // Additional CSS classes for styling
}: AvatarProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <img src={src} alt="" className="rounded-full w-12 h-12 object-cover" />
      {!src && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-500 text-white rounded-full">
          {fallback}
        </div>
      )}
    </div>
  );
}
