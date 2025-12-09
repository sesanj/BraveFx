-- Create function to call the welcome email Edge Function
CREATE OR REPLACE FUNCTION trigger_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url text := 'https://ppbshpbicprzorjcilcn.supabase.co';
  -- REPLACE WITH YOUR SERVICE ROLE KEY from Supabase Dashboard → Settings → API
  supabase_service_role_key text := 'YOUR_SERVICE_ROLE_KEY_HERE';
BEGIN
  -- Call the Supabase Edge Function asynchronously
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || supabase_service_role_key
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'enrollments',
      'record', row_to_json(NEW)
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on enrollments table
DROP TRIGGER IF EXISTS on_enrollment_created ON enrollments;
CREATE TRIGGER on_enrollment_created
  AFTER INSERT ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_welcome_email();

COMMENT ON FUNCTION trigger_welcome_email() IS 'Sends welcome email when a new enrollment is created';
COMMENT ON TRIGGER on_enrollment_created ON enrollments IS 'Triggers welcome email on new enrollment';
