export const environment = {
  production: true, // ← CHANGED TO TRUE for live payments
  supabase: {
    url: 'https://ppbshpbicprzorjcilcn.supabase.co',
    anonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwYnNocGJpY3Byem9yamNpbGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzM1NjgsImV4cCI6MjA3ODEwOTU2OH0.Ih_GHhjq_ABtrf73hzPp2AgaXm61-vziecGbEqPbc_c',
  },
  stripe: {
    publishableKey:
      'pk_live_51SXUawB6m33aaawHscaFBtzzWXBVdX5MtLHj0FecjTqlqxB5K9oAKMZAFd8ct2N7MzK7gmAtFWcOmxJeh27Wbk6q00lcNM0YGX', // ← PASTE YOUR LIVE pk_live_... KEY
  },
  coursePrice: 14900, // Price in cents ($149.00)
};
