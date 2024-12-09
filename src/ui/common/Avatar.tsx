import React from "react"

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Avatar({
  src,
  alt,
  fallback,
  className = "",
  size = "md",
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  }

  return (
    <div className={`relative inline-block ${sizeClasses[size]} ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={alt || ""} 
          className="rounded-full w-full h-full object-cover"
        />
      ) : (
        <div 
          className="absolute inset-0 flex items-center justify-center rounded-full bg-[--orangeColor] text-[--primaryTextColor] font-medium"
          style={{ fontSize: size === "lg" ? "1.25rem" : "1rem" }}
        >
          {fallback}
        </div>
      )}
    </div>
  )
}

