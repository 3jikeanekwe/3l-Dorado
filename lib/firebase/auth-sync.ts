/**
 * Firebase Auth + Supabase Sync
 * Syncs Firebase Auth users to Supabase database
 */

import { auth } from './config'
import { createClient } from '@/lib/supabase/client'
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User
} from 'firebase/auth'

const supabase = createClient()

/**
 * Sync Firebase user to Supabase
 */
export async function syncFirebaseUserToSupabase(firebaseUser: User) {
  try {
    // Check if user exists in Supabase
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', firebaseUser.uid)
      .single()

    if (!existingUser) {
      // Create user in Supabase
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          avatar_url: firebaseUser.photoURL,
          role: 'user',
        })

      if (error) {
        console.error('Error creating Supabase user:', error)
      }
    } else {
      // Update user info
      await supabase
        .from('profiles')
        .update({
          username: firebaseUser.displayName || undefined,
          avatar_url: firebaseUser.photoURL || undefined,
        })
        .eq('id', firebaseUser.uid)
    }

    return { success: true }
  } catch (error) {
    console.error('Error syncing user:', error)
    return { success: false, error }
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    
    // Sync to Supabase
    await syncFirebaseUserToSupabase(result.user)
    
    return { success: true, user: result.user }
  } catch (error: any) {
    console.error('Google sign-in error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Sign in with email/password
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    
    // Sync to Supabase
    await syncFirebaseUserToSupabase(result.user)
    
    return { success: true, user: result.user }
  } catch (error: any) {
    console.error('Email sign-in error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Sign up with email/password
 */
export async function signUpWithEmail(email: string, password: string, username: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update display name
    // await updateProfile(result.user, { displayName: username })
    
    // Sync to Supabase
    await syncFirebaseUserToSupabase(result.user)
    
    return { success: true, user: result.user }
  } catch (error: any) {
    console.error('Email sign-up error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Sign out
 */
export async function signOutUser() {
  try {
    await auth.signOut()
    return { success: true }
  } catch (error: any) {
    console.error('Sign-out error:', error)
    return { success: false, error: error.message }
  }
}

const firebaseAuth = {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  syncFirebaseUserToSupabase,
}
  
  
  
  
  
      
