-- Create demo class and 20 diverse students with personalized learning profiles

DO $$
DECLARE
    demo_teacher_id UUID;
    demo_class_id UUID;
    student_data RECORD;
    profile_data JSONB;
    student_profiles_data JSONB[] := ARRAY[
        '{"learning_styles": ["visual", "kinesthetic"], "top_interests": ["robotics", "building_tinkering"], "motivation_triggers": ["hands_on_challenge"], "support_needs": ["step_by_step"], "ai_recommendations": {"project_templates": ["robotics_voice_control"], "assignment_preferences": {"presentation_modes": ["video_demo"], "scaffolds": ["checklist_step_by_step"]}}}'::jsonb,
        '{"learning_styles": ["auditory", "read_write"], "top_interests": ["art_music", "reading_writing"], "motivation_triggers": ["creativity"], "support_needs": ["needs_tts"], "ai_recommendations": {"project_templates": ["ai_character_design"], "assignment_preferences": {"presentation_modes": ["video_demo"], "scaffolds": ["example_diagrams"]}}}'::jsonb,
        '{"learning_styles": ["read_write", "visual"], "top_interests": ["gaming_coding", "ai_creation"], "motivation_triggers": ["logic"], "support_needs": ["extra_practice"], "ai_recommendations": {"project_templates": ["ai_character_design"], "assignment_preferences": {"presentation_modes": ["diagram"], "scaffolds": ["retry_tokens"]}}}'::jsonb,
        '{"learning_styles": ["kinesthetic", "visual"], "top_interests": ["sports_movement", "community_help"], "motivation_triggers": ["collaboration", "hands_on_challenge"], "support_needs": ["partner_work"], "ai_recommendations": {"project_templates": ["assistive_ai_for_community"], "assignment_preferences": {"presentation_modes": ["video_demo"], "scaffolds": ["checklist_step_by_step"]}}}'::jsonb,
        '{"learning_styles": ["auditory", "kinesthetic"], "top_interests": ["art_music", "robotics"], "motivation_triggers": ["creativity", "hands_on_challenge"], "support_needs": ["needs_translation:Spanish"], "ai_recommendations": {"project_templates": ["robotics_voice_control"], "assignment_preferences": {"presentation_modes": ["video_demo"], "scaffolds": ["retry_tokens"]}}}'::jsonb,
        '{"learning_styles": ["visual", "read_write"], "top_interests": ["reading_writing", "ai_creation"], "motivation_triggers": ["creativity", "logic"], "support_needs": ["quiet_time"], "ai_recommendations": {"project_templates": ["ai_character_design"], "assignment_preferences": {"presentation_modes": ["diagram"], "scaffolds": ["example_diagrams"]}}}'::jsonb,
        '{"learning_styles": ["kinesthetic", "auditory"], "top_interests": ["building_tinkering", "gaming_coding"], "motivation_triggers": ["hands_on_challenge"], "support_needs": ["frequent_breaks"], "ai_recommendations": {"project_templates": ["robotics_voice_control"], "assignment_preferences": {"presentation_modes": ["lab_report_template"], "scaffolds": ["hands_on_retry"]}}}'::jsonb,
        '{"learning_styles": ["read_write", "auditory"], "top_interests": ["community_help", "reading_writing"], "motivation_triggers": ["collaboration"], "support_needs": ["needs_tts", "step_by_step"], "ai_recommendations": {"project_templates": ["assistive_ai_for_community"], "assignment_preferences": {"presentation_modes": ["video_demo"], "scaffolds": ["checklist_step_by_step"]}}}'::jsonb,
        '{"learning_styles": ["visual", "kinesthetic"], "top_interests": ["art_music", "building_tinkering"], "motivation_triggers": ["creativity", "hands_on_challenge"], "support_needs": ["visual_examples"], "ai_recommendations": {"project_templates": ["ai_character_design"], "assignment_preferences": {"presentation_modes": ["video_demo", "diagram"], "scaffolds": ["example_diagrams"]}}}'::jsonb,
        '{"learning_styles": ["auditory", "read_write"], "top_interests": ["gaming_coding", "sports_movement"], "motivation_triggers": ["logic", "collaboration"], "support_needs": ["partner_work"], "ai_recommendations": {"project_templates": ["ai_character_design"], "assignment_preferences": {"presentation_modes": ["video_demo"], "scaffolds": ["retry_tokens"]}}}'::jsonb,
        '{"learning_styles": ["kinesthetic", "visual"], "top_interests": ["robotics", "ai_creation"], "motivation_triggers": ["hands_on_challenge", "logic"], "support_needs": ["hands_on_retry"], "ai_recommendations": {"project_templates": ["robotics_voice_control"], "assignment_preferences": {"presentation_modes": ["lab_report_template"], "scaffolds": ["retry_tokens"]}}}'::jsonb,
        '{"learning_styles": ["read_write", "auditory"], "top_interests": ["reading_writing", "community_help"], "motivation_triggers": ["creativity", "collaboration"], "support_needs": ["needs_translation:Mandarin"], "ai_recommendations": {"project_templates": ["assistive_ai_for_community"], "assignment_preferences": {"presentation_modes": ["video_demo"], "scaffolds": ["checklist_step_by_step"]}}}'::jsonb,
        '{"learning_styles": ["visual", "kinesthetic"], "top_interests": ["art_music", "gaming_coding"], "motivation_triggers": ["creativity"], "support_needs": ["visual_examples", "frequent_breaks"], "ai_recommendations": {"project_templates": ["ai_character_design"], "assignment_preferences": {"presentation_modes": ["video_demo", "diagram"], "scaffolds": ["example_diagrams"]}}}'::jsonb,
        '{"learning_styles": ["auditory", "kinesthetic"], "top_interests": ["building_tinkering", "sports_movement"], "motivation_triggers": ["hands_on_challenge", "collaboration"], "support_needs": ["partner_work", "step_by_step"], "ai_recommendations": {"project_templates": ["robotics_voice_control"], "assignment_preferences": {"presentation_modes": ["video_demo"], "scaffolds": ["checklist_step_by_step"]}}}'::jsonb,
        '{"learning_styles": ["read_write", "visual"], "top_interests": ["ai_creation", "reading_writing"], "motivation_triggers": ["logic", "creativity"], "support_needs": ["extra_practice", "quiet_time"], "ai_recommendations": {"project_templates": ["ai_character_design"], "assignment_preferences": {"presentation_modes": ["diagram"], "scaffolds": ["example_diagrams", "retry_tokens"]}}}'::jsonb,
        '{"learning_styles": ["kinesthetic", "auditory"], "top_interests": ["robotics", "community_help"], "motivation_triggers": ["hands_on_challenge", "collaboration"], "support_needs": ["needs_translation:Arabic"], "ai_recommendations": {"project_templates": ["robotics_voice_control", "assistive_ai_for_community"], "assignment_preferences": {"presentation_modes": ["video_demo"], "scaffolds": ["checklist_step_by_step"]}}}'::jsonb,
        '{"learning_styles": ["visual", "read_write"], "top_interests": ["art_music", "ai_creation"], "motivation_triggers": ["creativity"], "support_needs": ["visual_examples", "needs_tts"], "ai_recommendations": {"project_templates": ["ai_character_design"], "assignment_preferences": {"presentation_modes": ["video_demo", "diagram"], "scaffolds": ["example_diagrams"]}}}'::jsonb,
        '{"learning_styles": ["auditory", "kinesthetic"], "top_interests": ["gaming_coding", "building_tinkering"], "motivation_triggers": ["logic", "hands_on_challenge"], "support_needs": ["frequent_breaks", "hands_on_retry"], "ai_recommendations": {"project_templates": ["robotics_voice_control"], "assignment_preferences": {"presentation_modes": ["lab_report_template"], "scaffolds": ["retry_tokens"]}}}'::jsonb,
        '{"learning_styles": ["read_write", "visual"], "top_interests": ["community_help", "reading_writing"], "motivation_triggers": ["collaboration", "creativity"], "support_needs": ["needs_translation:Somali", "step_by_step"], "ai_recommendations": {"project_templates": ["assistive_ai_for_community"], "assignment_preferences": {"presentation_modes": ["diagram"], "scaffolds": ["checklist_step_by_step"]}}}'::jsonb,
        '{"learning_styles": ["kinesthetic", "auditory"], "top_interests": ["sports_movement", "robotics"], "motivation_triggers": ["hands_on_challenge", "collaboration"], "support_needs": ["partner_work", "frequent_breaks"], "ai_recommendations": {"project_templates": ["robotics_voice_control"], "assignment_preferences": {"presentation_modes": ["video_demo"], "scaffolds": ["checklist_step_by_step", "hands_on_retry"]}}}'::jsonb
    ];
    student_names TEXT[][] := ARRAY[
        ARRAY['Alex', 'Chen'],
        ARRAY['Maya', 'Rodriguez'],
        ARRAY['Jordan', 'Kim'],
        ARRAY['Zoe', 'Washington'],
        ARRAY['Carlos', 'Gonzalez'],
        ARRAY['Aria', 'Patel'],
        ARRAY['Marcus', 'Johnson'],
        ARRAY['Samira', 'Hassan'],
        ARRAY['Ethan', 'Thompson'],
        ARRAY['Luna', 'Williams'],
        ARRAY['Kai', 'Nakamura'],
        ARRAY['Priya', 'Singh'],
        ARRAY['Davi', 'Santos'],
        ARRAY['Chloe', 'Anderson'],
        ARRAY['River', 'Taylor'],
        ARRAY['Amara', 'Mohamed'],
        ARRAY['Felix', 'Brown'],
        ARRAY['Nova', 'Davis'],
        ARRAY['Aaliyah', 'Ahmed'],
        ARRAY['Leo', 'Martinez']
    ];
    preferred_names TEXT[] := ARRAY[
        'Alex', 'Maya', 'Jordan', 'Zoe', 'Carlos', 'Aria', 'Marcus', 'Sam', 'Ethan', 'Luna',
        'Kai', 'Pri', 'Davi', 'Chloe', 'River', 'Amara', 'Felix', 'Nova', 'Aaliyah', 'Leo'
    ];
    grade_levels TEXT[] := ARRAY['9th', '10th', '11th', '12th'];
    reading_levels TEXT[] := ARRAY['Grade Level', 'Above Grade Level', 'Below Grade Level', 'Advanced'];
    i INTEGER;
    new_student_id UUID;
BEGIN
    -- Get a teacher profile for the demo class
    SELECT id INTO demo_teacher_id FROM teacher_profiles LIMIT 1;
    
    -- If no teacher exists, create a demo teacher
    IF demo_teacher_id IS NULL THEN
        -- Create a demo auth user first (this would typically be done via signup)
        INSERT INTO profiles (id, email, full_name) 
        VALUES (gen_random_uuid(), 'demo.teacher@tailoredu.com', 'Demo Teacher')
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO teacher_profiles (user_id) 
        SELECT id FROM profiles WHERE email = 'demo.teacher@tailoredu.com'
        RETURNING id INTO demo_teacher_id;
    END IF;

    -- Create or find the demo AI class
    INSERT INTO classes (
        teacher_id, 
        name, 
        description, 
        grade_level, 
        subject,
        published,
        status,
        created_at,
        updated_at
    ) VALUES (
        demo_teacher_id,
        'AI for High School Students: Understanding, Using, and Creating with Artificial Intelligence',
        'An innovative course exploring artificial intelligence fundamentals, practical applications, and creative AI projects designed for high school students.',
        'High School',
        'Computer Science / AI',
        true,
        'published',
        now(),
        now()
    )
    ON CONFLICT (name) DO UPDATE SET 
        description = EXCLUDED.description,
        updated_at = now()
    RETURNING id INTO demo_class_id;

    -- Create 20 demo students with diverse profiles
    FOR i IN 1..20 LOOP
        -- Insert student
        INSERT INTO students (
            id,
            class_id,
            first_name,
            last_name,
            grade_level,
            reading_level,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            demo_class_id,
            student_names[i][1],
            student_names[i][2],
            grade_levels[(i % 4) + 1],
            reading_levels[(i % 4) + 1],
            now(),
            now()
        )
        ON CONFLICT (first_name, last_name, class_id) DO UPDATE SET
            updated_at = now()
        RETURNING id INTO new_student_id;

        -- Insert student profile with personalized learning data
        INSERT INTO student_profiles (
            student_id,
            profile_json,
            survey_completed_at,
            created_at,
            updated_at
        ) VALUES (
            new_student_id,
            student_profiles_data[i] || jsonb_build_object(
                'preferred_name', preferred_names[i],
                'notes', 'Demo student profile - automatically generated'
            ),
            now(),
            now(),
            now()
        )
        ON CONFLICT (student_id) DO UPDATE SET
            profile_json = EXCLUDED.profile_json,
            updated_at = now();

    END LOOP;

    RAISE NOTICE 'Successfully created demo class and 20 students with personalized learning profiles';
END $$;