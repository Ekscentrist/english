export const plan = {
  title: 'План подготовки к англоязычным IT-собеседованиям',
  subtitle: 'Laravel Backend · голосовой режим с ИИ · в своём темпе',
  format: 'Только голосовой режим с ИИ',
  pace: 'В своём темпе',
  sessionLength: 'Сессия ~30–50 мин, когда готов',
  goals: [
    'Свободно говорить на английском',
    'Уверенно проходить технические интервью',
    'Думать вслух на английском',
    'Звучать естественно, а не как человек, читающий заученный текст',
    'Уверенно проходить screening, live coding и closing на EN-рынке',
  ],

  warmup: {
    title: 'Перед каждой сессией',
    note: 'Никогда не начинай сразу с технических вопросов. Разминка ~5 минут — ориентир, не таймер.',
    tag: '~5 мин',
    prompt:
      "Hi! Let's start with a five-minute warm-up. Be a friendly recruiter. Ask me simple small-talk questions like we're just starting a real interview. Don't interrupt me. Correct me only after I finish.",
    exampleQuestions: [
      'How has your day been?',
      'What have you been working on recently?',
      'How is life in your city?',
      'Did you have a busy week?',
      'Have you learned anything new lately?',
    ],
  },

  postSession: {
    title: 'После каждой сессии',
    prompt: `Rate my performance from 1 to 5 in:
Grammar
Fluency
Technical English
Confidence
Structure
Naturalness

Then give me:
3 more natural English phrases I should use
5 words or expressions I was missing
The biggest mistake I made
One thing I improved compared to my previous session`,
    ratingKeys: [
      { key: 'grammar', label: 'Grammar' },
      { key: 'fluency', label: 'Fluency' },
      { key: 'technical', label: 'Technical English' },
      { key: 'confidence', label: 'Confidence' },
      { key: 'structure', label: 'Structure' },
      { key: 'naturalness', label: 'Naturalness' },
    ],
  },

  homework: {
    title: 'Домашнее задание',
    description: 'Записать голосом три версии рассказа о себе',
    items: [
      { id: '30s', label: '30 секунд' },
      { id: '1m', label: '1 минута' },
      { id: '3m', label: '3 минуты' },
    ],
  },

  shadowing: {
    title: 'Shadowing',
    description:
      'Когда занимаешься — выбери 5–10 фраз. Повтори каждую 10–20 раз вслух, затем составь с ней 2–3 своих предложения. ~10 минут за раз.',
    phrases: [
      "One thing I'd like to highlight is...",
      'From a scalability perspective...',
      'The main trade-off here is...',
      'Let me clarify that.',
      'In my experience...',
      'If I had to redesign it today...',
      'The bottleneck would most likely be...',
      "That's a good question.",
      'It depends on the requirements.',
      "I'd probably start with...",
      "I'm currently on a X-week notice period...",
      'My expected range is... depending on the full package.',
      'Let me walk you through my approach...',
      'One clarifying question before I start...',
      "I'd be curious how the team handles on-call...",
      'What does success look like in the first 90 days?',
      "I'm looking for a fully remote / hybrid setup...",
      'Do you have any concerns about my profile so far?',
    ],
  },

  readiness: {
    title: 'Готов к рынку',
    description:
      'Отмечай, когда реально чувствуешь уверенность — не когда «просто прошёл сессию».',
    items: [
      { id: 'pitch', label: 'Pitch 60с и 3 мин без запинок' },
      { id: 'star', label: 'STAR-истории: project / mistake / conflict / deadline' },
      {
        id: 'tech',
        label: 'Могу объяснить Container, Eloquent/N+1, queues, Docker, indexes',
      },
      { id: 'design', label: '2 system design вслух без паники' },
      { id: 'mock', label: '1 полный mock + 1 pressure' },
      { id: 'questions', label: 'Есть 5 questions for interviewer' },
      { id: 'comp', label: 'Compensation answer готов на ~20 секунд' },
    ],
  },

  technicalPrompt:
    'You are a Senior Backend Engineer. Ask me to explain the topic in depth. Interrupt me whenever my explanation becomes too generic. Ask "why?" and "can you explain deeper?" as often as necessary.',

  systemDesignPrompt:
    "Let's do a System Design interview. Give me a system design problem. I will think aloud while designing the architecture. Challenge every important decision I make. Ask follow-up questions about scalability, databases, caching, monitoring, fault tolerance, and trade-offs.",

  liveCodingPrompt:
    'You are a technical interviewer running a live coding session. Give me a problem. I will think aloud in English while solving it. If I go silent for more than 10 seconds, gently interrupt and ask what I am thinking. Push me to state approach, complexity, and edge cases before coding details.',

  stages: [
    {
      id: 1,
      title: 'Self Introduction',
      description: 'Привыкнуть говорить о себе уверенно и без стресса.',
      showHomework: true,
      sessions: [
        {
          id: 1,
          title: 'Breaking the Ice',
          goal: 'Привыкнуть говорить без стресса.',
          prompt:
            'You are a friendly IT recruiter. Ask me "How are you today and what motivated you to start looking for new opportunities?" Let me answer without interruptions. After I finish, give feedback only about clarity and pronunciation.',
        },
        {
          id: 2,
          title: 'Tell me about yourself',
          goal: '2–3 минуты без запинок.',
          prompt:
            'You are a technical interviewer. Ask me "Tell me about yourself and your professional background." Evaluate whether my story clearly explains my experience, responsibilities, technical stack, and business impact.',
        },
        {
          id: 3,
          title: 'Elevator Pitch',
          goal: 'Представиться за ~60 секунд.',
          prompt:
            'Ask me to introduce myself in exactly one minute. Stop me if I exceed the time limit. Then explain what information was missing.',
        },
      ],
    },
    {
      id: 2,
      title: 'Behavioral (STAR)',
      description: 'Ответы на поведенческие вопросы по методу STAR.',
      sessions: [
        {
          id: 4,
          title: 'Самый сложный проект',
          goal: 'STAR с инженерными деталями в Action.',
          prompt:
            'Ask me "What is the most technically challenging project you have worked on?" I will answer using the STAR method. Focus your feedback on whether my Action section contains enough engineering details.',
        },
        {
          id: 5,
          title: 'Ошибка',
          goal: 'Профессионально рассказать об ошибке и уроках.',
          prompt:
            'Ask me "Tell me about a mistake you made." Evaluate whether I sound professional and whether I clearly explain what I learned.',
        },
        {
          id: 6,
          title: 'Конфликт',
          goal: 'Показать коммуникативные навыки.',
          prompt:
            'Ask me about a disagreement with another developer. Evaluate my communication skills.',
        },
        {
          id: 7,
          title: 'Дедлайн',
          goal: 'Описать работу под жёстким дедлайном.',
          prompt:
            'Tell me about a situation where you had very little time to deliver a feature.',
        },
      ],
    },
    {
      id: 3,
      title: 'Recruiter Screening',
      description:
        'Первый звонок с рекрутером: availability, resume walkthrough, motivation, compensation.',
      sessions: [
        {
          id: 8,
          title: 'Availability & Setup',
          goal: 'Чётко назвать notice period, remote/hybrid и timezone.',
          prompt:
            'You are a friendly IT recruiter doing a first screening call. Ask about my notice period, earliest start date, remote/hybrid preference, and timezone overlap. Let me answer fully. Then give feedback on clarity, confidence, and whether I sounded natural — not rehearsed.',
        },
        {
          id: 9,
          title: 'Walk me through your resume',
          goal: 'Короткий walkthrough резюме (короче full intro).',
          prompt:
            'You are a recruiter. Ask me to walk you through my resume in about two minutes — highlight recent roles, stack, and impact. Interrupt only if I ramble. After I finish, say what was strong and what a hiring manager would still ask.',
        },
        {
          id: 10,
          title: 'Why leaving / why this company',
          goal: 'Мотивация без негатива про текущего работодателя.',
          prompt:
            'You are a recruiter. Ask why I am looking for a new role and why I am interested in this company. Evaluate whether I stay professional, avoid negativity, and connect my goals to the role. Give feedback on naturalness.',
        },
        {
          id: 11,
          title: 'Compensation Range',
          goal: 'Спокойно и коротко назвать ожидаемый range.',
          prompt:
            'You are a recruiter. Ask about my expected compensation or day rate. I should give a clear range and mention that it depends on the full package (benefits, remote, seniority). Keep the conversation professional. Then critique whether I sounded confident and concise.',
        },
      ],
    },
    {
      id: 4,
      title: 'Technical English (Laravel)',
      description:
        'Объяснение технологий. Каждая тема — ориентир 5–10 минут монолога.',
      sessions: [
        {
          id: 12,
          title: 'Service Container & DI',
          goal: 'Монолог по теме, пока не станет конкретно.',
          topics: ['Laravel Service Container', 'Dependency Injection'],
          promptKey: 'technical',
        },
        {
          id: 13,
          title: 'Eloquent & Loading',
          goal: 'Монолог по теме, пока не станет конкретно.',
          topics: ['Eloquent', 'N+1', 'eager loading', 'lazy loading'],
          promptKey: 'technical',
        },
        {
          id: 14,
          title: 'Redis, Queues & Cache',
          goal: 'Монолог по теме, пока не станет конкретно.',
          topics: ['Redis', 'queues', 'Horizon', 'caching'],
          promptKey: 'technical',
        },
        {
          id: 15,
          title: 'Docker',
          goal: 'Монолог по теме, пока не станет конкретно.',
          topics: ['Docker', 'containers', 'volumes', 'networking'],
          promptKey: 'technical',
        },
        {
          id: 16,
          title: 'Database Internals',
          goal: 'Монолог по теме, пока не станет конкретно.',
          topics: ['transactions', 'indexes', 'deadlocks', 'replication'],
          promptKey: 'technical',
        },
      ],
    },
    {
      id: 5,
      title: 'Live Coding Think-Aloud',
      description:
        'Не писать код на странице — говорить вслух approach, complexity и edge cases.',
      sessions: [
        {
          id: 17,
          title: 'PHP Array / String',
          goal: 'Озвучить подход → сложность → edge cases.',
          prompt:
            'You are a technical interviewer running a live coding session. Give me a medium PHP array or string problem. I will think aloud in English while solving it. If I go silent for more than 10 seconds, gently interrupt and ask what I am thinking. Push me to state approach, time/space complexity, and edge cases before diving into code details.',
        },
        {
          id: 18,
          title: 'SQL / Eloquent aloud',
          goal: 'Объяснить query и trade-offs вслух.',
          prompt:
            'You are a Senior Backend Engineer. Give me a data-modeling or query problem involving SQL or Eloquent (for example N+1, filtering, aggregation, or pagination). I must explain my query aloud in English: what I select, joins/eager loads, indexes I would add, and trade-offs. Interrupt if my explanation is too vague.',
        },
        {
          id: 19,
          title: 'Debug First Steps',
          goal: 'Назвать, что проверяешь первым при баге.',
          prompt:
            'You are a Tech Lead. Describe a production bug in a Laravel API (for example intermittent 500s, slow endpoint, or wrong data). Ask me what I would check first and why. Make me narrate my debugging steps in English. Challenge weak or generic answers.',
        },
      ],
    },
    {
      id: 6,
      title: 'System Design',
      description: 'Думать вслух при проектировании архитектуры.',
      sessions: [
        {
          id: 20,
          title: 'Booking System',
          goal: 'Спроектировать backend для booking system.',
          topics: ['Backend for a booking system'],
          promptKey: 'systemDesign',
          designProblem: 'Backend for a booking system.',
        },
        {
          id: 21,
          title: 'High-load API',
          goal: 'Спроектировать high-load API.',
          topics: ['High-load API'],
          promptKey: 'systemDesign',
          designProblem: 'High-load API.',
        },
        {
          id: 22,
          title: 'Chat Application',
          goal: 'Спроектировать chat application.',
          topics: ['Chat application'],
          promptKey: 'systemDesign',
          designProblem: 'Chat application.',
        },
        {
          id: 23,
          title: 'Video Streaming',
          goal: 'Спроектировать video streaming backend.',
          topics: ['Video streaming backend'],
          promptKey: 'systemDesign',
          designProblem: 'Video streaming backend.',
        },
        {
          id: 24,
          title: 'E-commerce Platform',
          goal: 'Спроектировать large e-commerce platform.',
          topics: ['Large e-commerce platform'],
          promptKey: 'systemDesign',
          designProblem: 'Large e-commerce platform.',
        },
      ],
    },
    {
      id: 7,
      title: 'Closing the Interview',
      description:
        'Финал: вопросы интервьюеру, compensation soft script, follow-up.',
      sessions: [
        {
          id: 25,
          title: 'Questions for Interviewer',
          goal: '5–7 сильных вопросов к команде / роли.',
          prompt:
            "You just finished interviewing me for a Laravel Backend role. Ask: 'Do you have any questions for me?' I will ask 5–7 strong questions. Rate each question for quality and suggest better alternatives where needed. Prefer questions about team process, ownership, on-call, tech debt, and growth.",
        },
        {
          id: 26,
          title: 'Salary Negotiation Soft Script',
          goal: 'Спокойно обсудить деньги без паники.',
          prompt:
            'You are a hiring manager closing the loop. Ask about my salary expectations and whether I am interviewing elsewhere. I should negotiate politely: give a range, anchor on market + experience, and ask about the full package. Give feedback on tone, clarity, and whether I sounded desperate or confident.',
        },
        {
          id: 27,
          title: 'Any Concerns About My Profile?',
          goal: 'Спросить про concerns и ответить спокойно.',
          prompt:
            'Simulate the end of a technical interview. I will ask: "Do you have any concerns about my profile so far?" Invent one realistic concern (for example system design depth, English fluency, or Laravel version exposure). I must respond professionally. Then critique my answer.',
        },
        {
          id: 28,
          title: 'Follow-up & Thank You',
          goal: 'Короткий thank-you / follow-up на английском.',
          prompt:
            'Help me practice a short spoken thank-you and follow-up after an interview. Ask me to say a 30–45 second message covering gratitude, one specific thing I enjoyed discussing, and continued interest. Then rewrite a more natural version and have me repeat it.',
        },
      ],
    },
    {
      id: 8,
      title: 'Full Mock Interview',
      description: 'Полные mock-интервью разной сложности. Длительность — ориентир.',
      sessions: [
        {
          id: 29,
          title: 'Настоящее интервью',
          goal: 'Реалистичное интервью ~40 минут.',
          duration: '~40 мин',
          prompt:
            'Conduct a realistic technical interview for a Laravel backend developer role lasting about 40 minutes. Cover small talk, background, behavioral questions, and core technical topics. Stay professional and give structured feedback at the end.',
        },
        {
          id: 30,
          title: 'Hard Mode',
          goal: 'Интервьюер постоянно спорит.',
          mode: 'hard',
          prompt:
            'Be a skeptical Tech Lead. Challenge almost every design decision I make. Ask me to justify my choices with technical arguments.',
        },
        {
          id: 31,
          title: 'Pressure Interview',
          goal: 'Перебивай, проси короче, спрашивай быстрее.',
          mode: 'pressure',
          prompt:
            'Simulate a stressful technical interview. Interrupt me naturally. Ask follow-up questions before I finish my thoughts. Push me to clarify vague answers. Stay professional but demanding.',
        },
        {
          id: 32,
          title: 'Полный Mock Interview',
          goal: 'Полный mock ~45–60 минут.',
          duration: '~45–60 мин',
          structure: [
            'Small Talk',
            'Tell me about yourself',
            'Behavioral',
            'Laravel',
            'PHP',
            'Database',
            'Docker',
            'Redis',
            'System Design',
            'Questions for interviewer',
            'Финальный фидбек',
          ],
          prompt: `Conduct a full mock interview lasting about 45–60 minutes for a Laravel Backend Engineer role. Follow this structure in order:
1. Small Talk
2. Tell me about yourself
3. Behavioral
4. Laravel
5. PHP
6. Database
7. Docker
8. Redis
9. System Design
10. Questions for interviewer
11. Final feedback

Be professional, challenge vague answers, and give detailed feedback at the end.`,
        },
      ],
    },
  ],
}

export function getSessionPrompt(session) {
  if (session.prompt) return session.prompt
  if (session.promptKey === 'technical') {
    const topics = (session.topics || []).join(', ')
    return `${plan.technicalPrompt}\n\nTopic to explain: ${topics}`
  }
  if (session.promptKey === 'systemDesign') {
    return `${plan.systemDesignPrompt}\n\nProblem: ${session.designProblem || (session.topics || []).join(', ')}`
  }
  if (session.promptKey === 'liveCoding') {
    return plan.liveCodingPrompt
  }
  return ''
}

export function findSessionMeta(sessionId) {
  for (const stage of plan.stages) {
    const session = stage.sessions.find((s) => s.id === sessionId)
    if (session) {
      return { stage, session }
    }
  }
  return null
}

export function getAllSessions() {
  return plan.stages.flatMap((stage) =>
    stage.sessions.map((session) => ({
      ...session,
      stageId: stage.id,
      stageTitle: stage.title,
    })),
  )
}

export const TOTAL_SESSIONS = getAllSessions().length
