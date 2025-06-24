import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
<main>
  <h1>{lesson.title}</h1>
  <ReadAloudLesson lessonText={lesson.text} lessonId={lesson.id} />
</main>
