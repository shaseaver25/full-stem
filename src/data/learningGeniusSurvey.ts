import { Survey } from '@/types/surveyTypes';

export const LEARNING_GENIUS_SURVEY: Survey = {
  survey_id: "learning_genius_v1",
  title: "Learning Genius – Onboarding Quiz",
  questions: [
    {
      id: "q1",
      type: "short_text",
      prompt: "What is your preferred name or nickname?",
      tags_on_answer: []
    },
    {
      id: "q2",
      type: "multi_select",
      max_select: 2,
      prompt: "What do you love to do outside of school? (pick 2)",
      options: [
        { label: "Sports & movement", tags: ["sports_movement", "kinesthetic"] },
        { label: "Art or music", tags: ["art_music", "creativity", "visual"] },
        { label: "Gaming or coding", tags: ["gaming_coding", "logic"] },
        { label: "Reading or writing stories", tags: ["reading_writing", "read_write"] },
        { label: "Helping people or solving community problems", tags: ["community_help", "collaboration"] },
        { label: "Building or tinkering with things", tags: ["building_tinkering", "hands_on_challenge", "kinesthetic"] }
      ]
    },
    {
      id: "q3",
      type: "single_select",
      prompt: "When I learn something new, I prefer to:",
      options: [
        { label: "See pictures, diagrams, or videos", tags: ["visual"] },
        { label: "Listen to someone explain it", tags: ["auditory"] },
        { label: "Read about it or write notes", tags: ["read_write"] },
        { label: "Try it out hands-on", tags: ["kinesthetic"] }
      ]
    },
    {
      id: "q4",
      type: "single_select",
      prompt: "If a teacher gives me directions, I like them:",
      options: [
        { label: "Written step-by-step", tags: ["read_write", "step_by_step"] },
        { label: "Said out loud", tags: ["auditory"] },
        { label: "Shown in a video or picture", tags: ["visual"] },
        { label: "Given while I practice", tags: ["kinesthetic"] }
      ]
    },
    {
      id: "q5",
      type: "single_select",
      prompt: "In group work, I usually:",
      options: [
        { label: "Share ideas and enjoy discussion", tags: ["collaboration", "auditory"] },
        { label: "Listen and think quietly", tags: ["read_write"] },
        { label: "Take notes and organize tasks", tags: ["read_write", "logic"] },
        { label: "Lead the hands-on part", tags: ["kinesthetic", "hands_on_challenge"] }
      ]
    },
    {
      id: "q6",
      type: "single_select",
      prompt: "When I'm stuck on a problem, I:",
      options: [
        { label: "Draw it out or make a mind map", tags: ["visual"] },
        { label: "Talk it out with a friend or teacher", tags: ["auditory", "collaboration"] },
        { label: "Look for written instructions or examples", tags: ["read_write", "extra_practice"] },
        { label: "Experiment until I figure it out", tags: ["kinesthetic", "hands_on_retry"] }
      ]
    },
    {
      id: "q7",
      type: "single_select",
      prompt: "If I'm watching a movie, I remember the:",
      options: [
        { label: "Way it looked", tags: ["visual"] },
        { label: "Sounds or voices", tags: ["auditory"] },
        { label: "Words or story", tags: ["read_write"] },
        { label: "Actions or movement", tags: ["kinesthetic"] }
      ]
    },
    {
      id: "q8",
      type: "single_select",
      prompt: "The easiest way for me to study is:",
      options: [
        { label: "Flashcards with pictures/charts", tags: ["visual"] },
        { label: "Listening to recordings", tags: ["auditory"] },
        { label: "Writing summaries", tags: ["read_write"] },
        { label: "Doing practice problems", tags: ["kinesthetic", "hands_on_retry"] }
      ]
    },
    {
      id: "q9",
      type: "single_select",
      prompt: "My notes usually look like:",
      options: [
        { label: "Doodles, diagrams, or charts", tags: ["visual"] },
        { label: "Short voice notes", tags: ["auditory"] },
        { label: "Bullet points or paragraphs", tags: ["read_write"] },
        { label: "Lists of steps I tried", tags: ["kinesthetic", "logic"] }
      ]
    },
    {
      id: "q10",
      type: "single_select",
      prompt: "I learn better when:",
      options: [
        { label: "I can see it", tags: ["visual"] },
        { label: "I can hear it", tags: ["auditory"] },
        { label: "I can read it", tags: ["read_write"] },
        { label: "I can do it", tags: ["kinesthetic"] }
      ]
    },
    {
      id: "q11",
      type: "single_select",
      prompt: "If AI could help you with one thing right now, it would be:",
      options: [
        { label: "Create art, music, or a game", tags: ["art_music", "creativity", "ai_creation"] },
        { label: "Help with homework or studying", tags: ["read_write", "extra_practice"] },
        { label: "Make life easier for my family/community", tags: ["community_help", "collaboration"] },
        { label: "Build something new with technology", tags: ["building_tinkering", "hands_on_challenge"] }
      ]
    },
    {
      id: "q12",
      type: "single_select",
      prompt: "Which project sounds most fun?",
      options: [
        { label: "Design a video game character with AI", tags: ["art_music", "gaming_coding", "creativity", "ai_creation", "visual"] },
        { label: "Use AI to write a song or poem", tags: ["art_music", "creativity", "read_write", "ai_creation"] },
        { label: "Train AI to solve puzzles or math problems", tags: ["logic", "gaming_coding", "ai_creation"] },
        { label: "Build a robot that responds to voice commands", tags: ["robotics", "hands_on_challenge", "kinesthetic", "auditory"] }
      ]
    },
    {
      id: "q13",
      type: "single_select",
      prompt: "If I could join a team, I'd pick:",
      options: [
        { label: "Creative team (designers, artists)", tags: ["creativity", "visual", "art_music"] },
        { label: "Research team (scientists, thinkers)", tags: ["logic", "read_write"] },
        { label: "Problem-solvers (engineers, builders)", tags: ["hands_on_challenge", "kinesthetic", "building_tinkering"] },
        { label: "Helpers (community, teachers, caregivers)", tags: ["community_help", "collaboration"] }
      ]
    },
    {
      id: "q14",
      type: "single_select",
      prompt: "When I dream about the future, I see myself:",
      options: [
        { label: "Inventing or designing", tags: ["creativity", "visual", "ai_creation"] },
        { label: "Teaching, sharing, or speaking", tags: ["collaboration", "auditory"] },
        { label: "Researching or writing", tags: ["read_write", "logic"] },
        { label: "Leading or building something", tags: ["hands_on_challenge", "kinesthetic"] }
      ]
    },
    {
      id: "q15",
      type: "single_select",
      prompt: "My favorite kind of challenge is:",
      options: [
        { label: "Creative (art, music, design)", tags: ["creativity", "art_music", "visual"] },
        { label: "Brain (logic puzzles, math)", tags: ["logic", "read_write"] },
        { label: "Social (group project, debate)", tags: ["collaboration", "auditory"] },
        { label: "Physical (sports, robotics, hands-on)", tags: ["hands_on_challenge", "kinesthetic"] }
      ]
    },
    {
      id: "q16",
      type: "multi_select",
      max_select: 2,
      prompt: "Do you learn best with:",
      options: [
        { label: "Regular breaks", tags: ["frequent_breaks"] },
        { label: "Step-by-step instructions", tags: ["step_by_step", "read_write"] },
        { label: "Working with a partner", tags: ["partner_work", "collaboration"] },
        { label: "Independent quiet time", tags: ["quiet_time", "read_write"] }
      ]
    },
    {
      id: "q17",
      type: "boolean",
      prompt: "Would you like content read aloud to you?",
      true_tags: ["needs_tts"],
      false_tags: []
    },
    {
      id: "q18",
      type: "short_text",
      prompt: "Would you like materials in another language? If yes, which one?",
      tags_on_answer: ["needs_translation"]
    },
    {
      id: "q19",
      type: "single_select",
      prompt: "When school feels hard, what helps most?",
      options: [
        { label: "Encouragement from a teacher or friend", tags: ["collaboration"] },
        { label: "Extra practice problems", tags: ["extra_practice", "read_write"] },
        { label: "Visual examples", tags: ["visual_examples", "visual"] },
        { label: "Trying again with hands-on practice", tags: ["hands_on_retry", "kinesthetic"] }
      ]
    },
    {
      id: "q20",
      type: "long_text",
      prompt: "One thing a teacher should know about me is:",
      tags_on_answer: []
    }
  ]
};