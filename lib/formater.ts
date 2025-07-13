
export  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    }
    return date.toLocaleDateString("id-ID", options)
  }

export  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

export  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)} km`
  }

export  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }