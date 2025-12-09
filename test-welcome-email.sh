#!/bin/bash

# Test the welcome email Edge Function directly
# Replace with an actual enrollment ID from your database

curl -i --location --request POST 'https://ppbshpbicprzorjcilcn.supabase.co/functions/v1/send-welcome-email' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwYnNocGJpY3Byem9yamNpbGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1NzM3MzgsImV4cCI6MjA0NjE0OTczOH0.vEikjcP7JNWWvzpn_JK8hpqrqzFSmqpL33J9eM8pqQk' \
  --header 'Content-Type: application/json' \
  --data '{"type":"INSERT","table":"enrollments","record":{"id":"test-123","user_id":"YOUR_USER_ID_HERE","course_id":1,"enrolled_at":"2024-12-03T00:00:00Z","status":"active"}}'
