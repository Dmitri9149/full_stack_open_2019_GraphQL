const { ApolloServer, UserInputError, gql } = require('apollo-server')
const uuid = require('uuid/v1')
const config = require('./utils/config')

const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')

mongoose.set('useFindAndModify', false)

console.log('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to DB")
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })



const typeDefs = gql`
  type Query {
    hello: String!
    bookCount:Int!
    authorCount:Int!
    allBooks:[Book!]!
    allAuthors:[Author!]!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
      name:String!
      born:Int
      bookCount:Int
      id:ID!
  }

  type Mutation {
    addBook(
      title:String!
      author:String!
      published:Int!
      genres:[String!]!
    ):Book

    editAuthor(
      name:String!
      setBornTo:Int!
    ):Author

  }
 `

const resolvers = {
  Query: {
    hello: () => { return "world" },
    bookCount:() => Author.collections.countDocuments(),
    authorCount:()=> Book.collections.countDocuments(),
    allBooks:() => {
      return Book.find({})  
    },
    allAuthors:() => {
      return Author.find({})
    },
  },
Book:{
  author:root => {
    return {id:root.author}
  }
},
  Mutation: {
    addBook: async (root, args)=> {
      let author = await Author.findOne({name:args.author})
      console.log('let author ', author)
      if (typeof author === 'undefined'|| author === null) {
        console.log('name:', args.author)
        author = new Author({name:args.author})
        console.log('New Author', author)
        await author.save()
      }
      const book = new Book({...args, author:author})
      await book.save()
    },
    editAuthor:(root, args)=> {
      console.log('edit Author request')
      }

  }
} 

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})