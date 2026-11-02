const firstAttemptOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
}

const retryAttemptOptions = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 0,
}

const retryableErrorCodes = new Set([2, 3])

export const getReliableLocation = (onSuccess, onError) => {
  let isCancelled = false

  const requestLocation = (attempt) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isCancelled) onSuccess(position)
      },
      (error) => {
        if (isCancelled) return
        if (attempt === 1 && retryableErrorCodes.has(error.code)) {
          requestLocation(2)
          return
        }
        onError(error)
      },
      attempt === 1 ? firstAttemptOptions : retryAttemptOptions,
    )
  }

  requestLocation(1)

  return () => {
    isCancelled = true
  }
}