import { MediaNotes } from '@/components/media';

// Sample data for demonstration
const sampleData = {
  media_id: 'demo-123',
  transcript: 'This is a sample transcript of the educational content. It contains information about photosynthesis, the process by which plants convert light energy into chemical energy. Chlorophyll in the leaves absorbs sunlight, and through a series of complex reactions, glucose is produced. This process is fundamental to life on Earth as it produces oxygen and serves as the base of the food chain.',
  summary_teacher: 'This content covers the fundamental process of photosynthesis in plants. Students should understand the role of chlorophyll, the inputs (sunlight, water, carbon dioxide), and outputs (glucose, oxygen). The lesson emphasizes the importance of photosynthesis in sustaining life on Earth and its connection to the carbon cycle. Consider demonstrating the concept with a live plant experiment.',
  summary_student: 'Photosynthesis is how plants make their own food using sunlight. Plants take in sunlight, water, and carbon dioxide, and make glucose (sugar) and oxygen. The green color in leaves (chlorophyll) helps capture the sunlight. This process is super important because it gives us oxygen to breathe and is the start of the food chain!',
  themes: [
    'Energy Conversion',
    'Plant Biology',
    'Ecosystem Sustainability',
    'Chemical Reactions',
  ],
  vocab_list: [
    {
      word: 'Photosynthesis',
      definition: 'The process by which green plants use sunlight to convert carbon dioxide and water into glucose and oxygen.',
    },
    {
      word: 'Chlorophyll',
      definition: 'The green pigment in plants that captures light energy from the sun.',
    },
    {
      word: 'Glucose',
      definition: 'A simple sugar that serves as an energy source for living organisms.',
    },
    {
      word: 'Carbon Dioxide',
      definition: 'A gas that plants absorb from the air to use in photosynthesis.',
    },
  ],
  questions: {
    comprehension: [
      'What are the three main inputs required for photosynthesis?',
      'What role does chlorophyll play in photosynthesis?',
      'What are the two main outputs of photosynthesis?',
    ],
    reflection: [
      'Why is photosynthesis important for life on Earth?',
      'How might climate change affect the process of photosynthesis?',
    ],
    challenge: 'Design an experiment to test which color of light is most effective for photosynthesis. What variables would you control, and how would you measure success?',
  },
  translations: {
    es: 'La fotosíntesis es cómo las plantas producen su propio alimento usando la luz solar. Las plantas absorben luz solar, agua y dióxido de carbono, y producen glucosa (azúcar) y oxígeno. El color verde en las hojas (clorofila) ayuda a capturar la luz solar. ¡Este proceso es súper importante porque nos da oxígeno para respirar y es el inicio de la cadena alimentaria!',
    so: 'Photosynthesis waa sida dhirtu u samaysato cuntadooda iyagoo isticmaalaya iftiinka qorraxda. Dhirtu waxay qaataan iftiinka qorraxda, biyaha, iyo kaarboon diyoksaydhka, waxayna soo saaraan glucose (sonkor) iyo ogsijiinta. Midabka cagaaran ee caleemaha (chlorophyll) wuxuu caawiyaa in lagu qaado iftiinka qorraxda. Habkani aad buu muhiim u yahay sababtoo ah wuxuu ina siiyaa ogsijiinta aan ku neefsanno, wuxuuna yahay bilawga silsiladda cuntada!',
    hm: 'Photosynthesis yog li cas cov nroj tsuag ua lawv tus kheej cov zaub mov siv tshav ntuj. Cov nroj tsuag nqus tshav ntuj, dej, thiab carbon dioxide, thiab tsim glucose (qab zib) thiab oxygen. Xim ntsuab hauv nplooj (chlorophyll) pab ntes tshav ntuj. Cov txheej txheem no tseem ceeb heev vim nws muab oxygen rau peb ua pa thiab yog qhov pib ntawm kev noj zaub mov!',
    om: 'Photosynthesis akkamitti biqiltoonni nyaata ofii isaanii aduu fayyadamuun akka hojjatan agarsiisa. Biqiltoonni ifa aduu, bishaan, fi kaarboon daayoksaayidii fudhatu, fi glucose (sukkaara) fi oksijiinii uumu. Halluu magariisa kan baala keessa jiru (chlorophyll) ifa aduu qabachuuf gargaara. Adeemsi kun baayee barbaachisaadha sababni isaas oksijiinii hafuura baafachuuf nuuf kennaatii fi jalqaba riqicha nyaataa waan taheef!',
  },
  recommended_next: [
    'The Carbon Cycle and its relationship to photosynthesis',
    'Cellular Respiration: The opposite process of photosynthesis',
    'Different types of photosynthesis in various plant species',
  ],
};

export default function MediaNotesDemo() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Educational Media Notes
        </h1>
        <p className="text-muted-foreground">
          AI-generated educational content from media transcripts
        </p>
      </div>

      <MediaNotes {...sampleData} />
    </div>
  );
}
