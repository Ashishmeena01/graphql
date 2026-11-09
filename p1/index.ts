
import { ApolloServer, HeaderMap } from "@apollo/server";

const posts = [
    { id: "1", title: "Winning in Life", description: "Live like a fighter.", authorId: "1" },
    { id: "2", title: "Power of Consistency", description: "Small steps lead to massive results.", authorId: "2" },
    { id: "3", title: "Never Give Up", description: "Failure is part of success.", authorId: "3" },
    { id: "4", title: "Focus on Yourself", description: "Everyone has their own timeline.", authorId: "1" },
    { id: "5", title: "Discipline Beats Motivation", description: "Discipline keeps you going.", authorId: "2" },
    { id: "6", title: "Dream Big", description: "Turn your dreams into reality.", authorId: "3" },
    { id: "7", title: "Learn Every Day", description: "Invest in yourself.", authorId: "4" },
    { id: "8", title: "Enjoy the Process", description: "Enjoy the journey.", authorId: "1" }
];

const users = [
    { id: "1", name: "Ashish", role: "ADMIN" },
    { id: "2", name: "Rahul", role: "USER" },
    { id: "3", name: "Priya", role: "USER" },
    { id: "4", name: "Aman", role: "MODERATOR" },
    { id: "5", name: "Hero", role: "ADMIN" }
];

const userById = (id: string) => users.find(user => user.id === id) ?? null;

const typeDefs = `#graphql
    type User {
        id: ID!
        name: String!
        role: String!
        posts: [Post!]!
    }

    type Post {
        id: ID!
        title: String!
        description: String!
        author: User!
    }

    type Query {
        users: [User!]!
        user(id: ID!): User
        posts: [Post!]!
        test: String!
    }

    input CreateUserInput {
        name: String!
        role: String!
    }

    type Mutation {
        createUser(input: CreateUserInput!): User!
    }
`;

const resolvers = {
    Query: {
        users: () => users,
        user: (_: any, { id }: any) => userById(id),
        posts: () => posts,
        test: () => "hello"
    },

    User: {
        posts: (parent: any) =>
            posts.filter(p => p.authorId === parent.id)
    },

    Post: {
        author: (parent: any) =>
            userById(parent.authorId)
    },

    Mutation: {
        createUser: (_: any, { input }: any) => {
            const newUser = {
                id: String(users.length + 1),
                ...input
            };

            users.push(newUser);
            return newUser;
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers
});

await server.start();

// Create Apollo HeaderMap
const headers = new HeaderMap();

headers.set("content-type", "application/json");
headers.set("accept", "application/json");

// HTTP request
const httpGraphQLRequest = {
    method: "POST",
    headers,
    search: "",
    body: {
        query: `
            query GetPosts {
                posts {
                    id
                    title
                    description
                    author {
                        id
                        name
                        role
                    }
                }
            }
        `,
        operationName: "GetPosts",
        variables: {}
    }
};

// Execute request
const response = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest,
    context: async () => ({
        user: null
    })
});

// Print response
if (response.body.kind === "complete") {
    console.log(JSON.parse(response.body.string));
}

await server.stop();
