"use client"

import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setUserData, clearUserData } from "@/store/features/userSlice"
import { getUserFromCookie } from "@/lib/cookieStorage"

export const useRestoreUserData = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const userData = getUserFromCookie()
    if (userData) {
      dispatch(setUserData(userData))
    } else {
      dispatch(clearUserData())
    }
  }, [dispatch])
}
