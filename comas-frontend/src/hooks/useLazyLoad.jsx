import { useEffect, useState } from "react"

export const useLazyLoad = src => {  
    const [sourceLoaded, setSourceLoaded] = useState(null)
  
    useEffect(() => {
      const img = new Image()
      img.src = src
      img.onload = () => setSourceLoaded(src)
    }, [src])
  
    return sourceLoaded 
  }