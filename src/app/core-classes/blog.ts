// this is from the server
export class Article {
  imageUrl: string
  subTitle: string
  body: string
  category: string
  author: string
  title: string
  datePosted: string // or Date if you're converting it
  slug: string
  tags: string[]
  imageBodyArray: string
}

// this is what we are using on the frontend
export class Blog {
  imageUrl: string
  subTitle: string
  body: string
  category: string
  author: string
  title: string
  datePosted: string // or Date if you're converting it
  slug: string
  tags: string[]
  imageBodyArray: string[] // Assuming this is an array of image URLs
}
