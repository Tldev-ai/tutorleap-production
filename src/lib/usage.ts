import { supabase } from './superbase'

export const checkDailyLimit = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0]
  
  const { data: user, error } = await supabase
    .from('users')
    .select('conversions_used_today, last_conversion_date, subscription_type')
    .eq('id', userId)
    .single()
  
  if (error) return { canConvert: false, error }
  
  // Reset count if it's a new day
  if (user.last_conversion_date !== today) {
    await supabase
      .from('users')
      .update({
        conversions_used_today: 0,
        last_conversion_date: today
      })
      .eq('id', userId)
    
    return { canConvert: true, conversionsLeft: user.subscription_type === 'pro' ? 999 : 3 }
  }
  
  // Check limits
  const limit = user.subscription_type === 'pro' ? 999 : 3
  const canConvert = user.conversions_used_today < limit
  const conversionsLeft = limit - user.conversions_used_today
  
  return { canConvert, conversionsLeft }
}

export const recordConversion = async (userId: string, conversionData: any) => {
  // Record the conversion
  const { error: conversionError } = await supabase
    .from('conversions')
    .insert({
      user_id: userId,
      ...conversionData
    })
  
  if (conversionError) return { error: conversionError }
  
  // Increment usage count
  const { error: updateError } = await supabase
    .rpc('increment_conversions', { user_id: userId })
  
  return { error: updateError }
}