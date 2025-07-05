import { supabase } from './superbase'

export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      }
    }
  })
  
  if (data.user && !error) {
    // Create user record in our users table
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        name: name
      })
    
    if (insertError) {
      console.error('Error creating user record:', insertError)
    }
  }
  
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}