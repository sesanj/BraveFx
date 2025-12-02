export const environment = {
  production: false,
  supabase: {
    url: 'https://ppbshpbicprzorjcilcn.supabase.co',
    anonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwYnNocGJpY3Byem9yamNpbGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzM1NjgsImV4cCI6MjA3ODEwOTU2OH0.Ih_GHhjq_ABtrf73hzPp2AgaXm61-vziecGbEqPbc_c',
  },
  stripe: {
    publishableKey:
      'pk_test_51SXUb6BT1NsJU1m05CzFIlFvrUNPa9jyHpnlMoDfJDVd1vcKs4JGfFsHxw6HOUOrusfm8jU1trtHNgz0QCrfEvHZ00WvV1AIUS', // ← Paste your pk_test_... key from Stripe
  },
  coursePrice: 4999, // Price in cents ($49.99)
};
