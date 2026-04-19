import { UserData } from "@/interface/user"

export const saveUserToCookie = (userData: UserData) => {
  if (typeof document === "undefined") return 

  const userDataJson = JSON.stringify(userData)
  document.cookie = `userDataRedux=${encodeURIComponent(userDataJson)}; path=/; max-age=86400`
}


export const removeUserFromCookie = () => {
  if (typeof document === "undefined") return 

  document.cookie = "userDataRedux=; path=/; max-age=0"
}

export const getUserFromCookie = (): UserData | null => {
  if (typeof document === "undefined") return null 

  const name = "userDataRedux="
  const decodedCookie = decodeURIComponent(document.cookie)
  const cookieArray = decodedCookie.split(";")

  for (let cookie of cookieArray) {
    cookie = cookie.trim()
    if (cookie.indexOf(name) === 0) {
      try {
        const userData = JSON.parse(cookie.substring(name.length))
        return userData
      } catch (error) {
        console.error("Error parsing user cookie:", error)
        return null
      }
    }
  }
  return null
}
