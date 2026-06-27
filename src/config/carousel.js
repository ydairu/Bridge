const carouselModules = import.meta.glob('../assets/carousel/*.{jpg,jpeg,png,webp}', { 
  eager: true,
  import: 'default'
})

export const getCarouselImagesFromConfig = () => {
  const images = Object.keys(carouselModules).map((path, index) => {
    const filename = path.split('/').pop().replace(/\.(jpg|jpeg|png|webp)$/i, '')
    const altText = filename
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim() || `Carousel Image ${index + 1}`
    
    return {
      src: carouselModules[path],
      alt: altText
    }
  })

  return images.sort((a, b) => {
    const filenameA = a.src.split('/').pop()
    const filenameB = b.src.split('/').pop()
    return filenameA.localeCompare(filenameB)
  })
}
