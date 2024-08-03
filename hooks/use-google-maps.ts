import { useState, useEffect } from 'react'

export function useGoogleMapsApi() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      setIsLoaded(true)
    } else {
      const timer = setInterval(() => {
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          setIsLoaded(true)
          clearInterval(timer)
        }
      }, 100)

      return () => clearInterval(timer)
    }
  }, [])

  return isLoaded
}