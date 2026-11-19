import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as authService from "@/shared/services/auth.service"
import { persistAuthTokens, useSessionStore } from "@/shared/stores/session.store"

export const authKeys = {
  me: ["auth", "me"] as const,
}

export function useMeQuery(enabled = true) {
  const accessToken = useSessionStore((s) => s.accessToken)
  const setUser = useSessionStore((s) => s.setUser)

  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const me = await authService.fetchMe()
      setUser(me)
      return me
    },
    enabled: enabled && Boolean(accessToken),
    retry: false,
  })
}

export function useSignupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authService.signup,
    onSuccess: (tokens) => {
      persistAuthTokens(tokens.accessToken, tokens.refreshToken)
      void queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

export function useLoginMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (tokens) => {
      persistAuthTokens(tokens.accessToken, tokens.refreshToken)
      void queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

export function useGoogleLoginMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (idToken: string) => authService.loginWithGoogle(idToken),
    onSuccess: (tokens) => {
      persistAuthTokens(tokens.accessToken, tokens.refreshToken)
      void queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  const setUser = useSessionStore((s) => s.setUser)
  return useMutation({
    mutationFn: (name: string) => authService.updateProfile(name),
    onSuccess: (me) => {
      setUser(me)
      void queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

export function useSetPasswordMutation() {
  const queryClient = useQueryClient()
  const setUser = useSessionStore((s) => s.setUser)
  return useMutation({
    mutationFn: authService.setPassword,
    onSuccess: (me) => {
      setUser(me)
      void queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

export function useLogoutMutation() {
  const clear = useSessionStore((s) => s.clear)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      try {
        await authService.logout()
      } catch {
        // Clear local session even if the API call fails.
      }
    },
    onSuccess: () => {
      clear()
      queryClient.clear()
    },
  })
}
