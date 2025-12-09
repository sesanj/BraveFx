import { createClient } from 'jsr:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

interface EnrollmentPayload {
  type: 'INSERT';
  table: 'enrollments';
  record: {
    id: string;
    user_id: string;
    course_id: string;
    created_at: string;
  };
}

Deno.serve(async (req) => {
  try {
    const payload: EnrollmentPayload = await req.json();

    console.log('📧 Welcome email trigger received:', payload);

    // Get user details from profiles table
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', payload.record.user_id)
      .single();

    if (profileError || !profile) {
      throw new Error(`Failed to fetch user profile: ${profileError?.message}`);
    }

    // Get course details
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .select('title')
      .eq('id', payload.record.course_id)
      .single();

    if (courseError || !course) {
      throw new Error(`Failed to fetch course: ${courseError?.message}`);
    }

    console.log(
      `📧 Sending welcome email to ${profile.email} for course: ${course.title}`
    );

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'BraveFx Academy <academy@bravefx.io>',
        to: [profile.email],
        subject: `Welcome to ${course.title}! 🎉`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to BraveFx Academy</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 12px 12px 0 0;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to BraveFx! 🎉</h1>
                        </td>
                      </tr>

                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                            Hi ${profile.full_name || 'there'},
                          </p>

                          <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                            Thank you for enrolling in <strong>${
                              course.title
                            }</strong>! We're excited to have you join our community of traders mastering the Forex market.
                          </p>

                          <p style="margin: 0 0 30px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                            Your journey to Forex mastery starts now. Here's what you can do next:
                          </p>

                          <div style="background-color: #f9fafb; border-left: 4px solid #6366f1; padding: 20px; margin: 0 0 30px; border-radius: 4px;">
                            <p style="margin: 0 0 12px; color: #1f2937; font-size: 16px; font-weight: 600;">✨ Quick Start Guide:</p>
                            <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                              <li>Access your dashboard to start learning</li>
                              <li>Complete lessons at your own pace</li>
                              <li>Track your progress and earn certificates</li>
                              <li>Join our community for support and insights</li>
                            </ul>
                          </div>

                          <table role="presentation" style="width: 100%;">
                            <tr>
                              <td align="center" style="padding: 10px 0;">
                                <a href="https://bravefx.io/dashboard" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
                                  Start Learning Now →
                                </a>
                              </td>
                            </tr>
                          </table>

                          <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                            Need help? Reply to this email or visit our <a href="https://bravefx.io/dashboard/support" style="color: #6366f1; text-decoration: none;">support page</a>.
                          </p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                          <p style="margin: 0 0 10px; color: #1f2937; font-weight: 600; font-size: 16px;">BraveFx Academy</p>
                          <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px;">Master Forex Trading with Confidence</p>

                          <div style="margin: 20px 0;">
                            <a href="https://www.instagram.com/bravefxacademy/" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none; font-size: 14px;">Instagram</a>
                            <span style="color: #d1d5db;">•</span>
                            <a href="https://www.youtube.com/@bravefxacademy/" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none; font-size: 14px;">YouTube</a>
                            <span style="color: #d1d5db;">•</span>
                            <a href="https://discord.gg/ADv27qYas3" style="display: inline-block; margin: 0 8px; color: #6b7280; text-decoration: none; font-size: 14px;">Discord</a>
                          </div>

                          <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px;">
                            © ${new Date().getFullYear()} BraveFx. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(data)}`);
    }

    console.log('✅ Welcome email sent successfully:', data);

    return new Response(JSON.stringify({ success: true, emailId: data.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
