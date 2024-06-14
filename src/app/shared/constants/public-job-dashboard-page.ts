export const HeroService = {
  title: 'Browse Job Board',
  searchPlaceholder: 'Search Job Board',
  buttonText1: 'Search',
}

export const FilterService = {
  verification: ['Verified'],
  fixedscope: [
    { scope: '$0 - $500', id: 0 },
    { scope: '$500 - $1000', id: 500 },
    { scope: '$1000 - $5000', id: 1000 },
    { scope: '$5000 - $10,000', id: 5000 },
    { scope: '$10,000 >', id: 10000 },
  ],
  skills: [
    'Javascript',
    'Html',
    'React',
    'Angular',
    'NodeJs',
    'Web Design',
    'UI/UX Design',
    'User Research',
    'Journey Maps',
    'Content Writer',
    'Digital Marketing',
    'Power Point Presentation',
    'Figma',
    'VueJs',
    'Project Management',
  ],
  categories: [
    {
      name: 'Content Creators',
      code: 'contentCreator',
    },
    {
      name: 'Software Developers',
      code: 'softwareDev',
    },
    {
      name: 'Designers & Creatives',
      code: 'designer',
    },
    {
      name: 'Marketing & SEO',
      code: 'marketing',
    },
    {
      name: 'Virtual Assistants',
      code: 'virtualAssistant',
    },
  ],
  experiencelevel: ['Entry Level', 'Intermediate', 'Expert Level'],
  rating: [5, 4, 3, 2, 1],
}

export const providerJobTypeArray = [
  {
    title: 'Web design',
    id: 'designer',
  },
  {
    title: 'UI/UX Design',
    id: 'designer',
  },
  {
    title: 'Front End',
    id: 'designer',
  },
  {
    title: 'Copyrighting',
    id: 'designer',
  },
  {
    title: 'Angular',
    id: 'designer',
  },
  {
    title: 'Java Script',
    id: 'designer',
  },
]
