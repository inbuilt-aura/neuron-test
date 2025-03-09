import type { RootState } from "../store/store"

interface DecodedToken {
  exp: number
}

function decodeJWT(token: string): DecodedToken {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error decoding token:", error)
    return { exp: 0 }
  }
}

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true

  try {
    const decodedToken = decodeJWT(token)
    const currentTime = Date.now() / 1000
    return decodedToken.exp < currentTime
  } catch (error) {
    console.error("Error checking token expiration:", error)
    return true
  }
}

export const getAccessToken = (state: RootState): string | null => {
  return state.auth.token?.access?.token || null
}

