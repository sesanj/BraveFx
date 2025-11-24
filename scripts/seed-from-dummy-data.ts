import { createClient } from '@supabase/supabase-js';

// UPDATE THESE WITH YOUR SUPABASE CREDENTIALS
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Copy from your course.service.ts dummy data
const dummyCourse = {
  title: 'Complete Forex Trading Mastery',
  description:
    'Master forex trading from beginner to advanced with 25+ hours of comprehensive video lessons, 50+ downloadable resources, and skill tests.',
  instructor: 'BraveFx',
  price: 149,
  currency: 'USD',
  thumbnail:
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  duration: 90000, // 25 hours in seconds
  total_lessons: 120,
  rating: 4.6,
  students_enrolled: 6247,
  modules: [
    {
      title: 'Introduction to Forex Trading',
      description: 'Understanding the basics of forex market',
      order_index: 1,
      has_quiz: true,
      lessons: [
        {
          title: 'What is Forex Trading?',
          description: 'Introduction to the foreign exchange market',
          video_url: 'https://player.vimeo.com/video/76979871',
          duration: 1200,
          order_index: 1,
          is_preview: true,
        },
        {
          title: 'Understanding Currency Pairs',
          description: 'Major, minor, and exotic pairs explained',
          video_url: 'https://player.vimeo.com/video/76979871',
          duration: 1800,
          order_index: 2,
          is_preview: false,
        },
        {
          title: 'How the Forex Market Works',
          description: 'Market structure and participants',
          video_url: 'https://player.vimeo.com/video/76979871',
          duration: 1500,
          order_index: 3,
          is_preview: false,
        },
        {
          title: 'Trading Sessions and Market Hours',
          description: 'London, New York, Tokyo, and Sydney sessions',
          video_url: 'https://player.vimeo.com/video/76979871',
          duration: 1320,
          order_index: 4,
          is_preview: false,
        },
      ],
    },
    {
      title: 'Technical Analysis Fundamentals',
      description: 'Learn to read charts and identify patterns',
      order_index: 2,
      has_quiz: false,
      lessons: [
        {
          title: 'Understanding Chart Types',
          description: 'Line, bar, and candlestick charts',
          video_url: 'https://player.vimeo.com/video/76979871',
          duration: 1680,
          order_index: 1,
          is_preview: false,
        },
        {
          title: 'Candlestick Patterns - Part 1',
          description: 'Reading and interpreting candlestick patterns',
          video_url: 'https://player.vimeo.com/video/76979871',
          duration: 2400,
          order_index: 2,
          is_preview: false,
        },
        {
          title: 'Candlestick Patterns - Part 2',
          description: 'Advanced reversal and continuation patterns',
          video_url: 'https://player.vimeo.com/video/76979871',
          duration: 2100,
          order_index: 3,
          is_preview: false,
        },
        {
          title: 'Support and Resistance Levels',
          description: 'Identifying key price levels',
          video_url: 'https://player.vimeo.com/video/76979871',
          duration: 1920,
          order_index: 4,
          is_preview: false,
        },
        {
          title: 'Trend Lines and Channels',
          description: 'Drawing and using trend lines',
          video_url: 'https://player.vimeo.com/video/76979871',
          duration: 1800,
          order_index: 5,
          is_preview: false,
        },
      ],
    },
    // Add all your other modules here...
  ],
};

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // 1. Create the course
    console.log('Creating course...');
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: dummyCourse.title,
        description: dummyCourse.description,
        instructor: dummyCourse.instructor,
        price: dummyCourse.price,
        currency: dummyCourse.currency,
        thumbnail: dummyCourse.thumbnail,
        duration: dummyCourse.duration,
        total_lessons: dummyCourse.total_lessons,
        rating: dummyCourse.rating,
        students_enrolled: dummyCourse.students_enrolled,
      })
      .select()
      .single();

    if (courseError) throw courseError;
    console.log(`✅ Course created: ${course.id}\n`);

    // 2. Create modules and lessons
    for (const moduleData of dummyCourse.modules) {
      console.log(`Creating module: ${moduleData.title}...`);

      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .insert({
          course_id: course.id,
          title: moduleData.title,
          description: moduleData.description,
          order_index: moduleData.order_index,
          has_quiz: moduleData.has_quiz,
        })
        .select()
        .single();

      if (moduleError) throw moduleError;
      console.log(`  ✅ Module created: ${module.id}`);

      // 3. Create lessons for this module
      for (const lessonData of moduleData.lessons) {
        const { error: lessonError } = await supabase.from('lessons').insert({
          module_id: module.id,
          title: lessonData.title,
          description: lessonData.description,
          video_url: lessonData.video_url,
          duration: lessonData.duration,
          order_index: lessonData.order_index,
          is_preview: lessonData.is_preview,
        });

        if (lessonError) throw lessonError;
      }

      console.log(`  ✅ Created ${moduleData.lessons.length} lessons\n`);
    }

    console.log('🎉 Database seeded successfully!');
    console.log(`\nSummary:`);
    console.log(`- 1 course created`);
    console.log(`- ${dummyCourse.modules.length} modules created`);
    console.log(
      `- ${dummyCourse.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0
      )} lessons created`
    );
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seed
seedDatabase();
