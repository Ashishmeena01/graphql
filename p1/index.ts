import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

type Role = "ADMIN" | "USER" | "MODERATOR";
type User = { id: string; name: string; role: Role; createdAt: string };
type Post = { id: string; title: string; description: string; authorId: string; tags: string[]; createdAt: string; updatedAt: string };

const users: User[] = [
  { id: "1", name: "Ashish", role: "ADMIN", createdAt: new Date().toISOString() },
  { id: "2", name: "Rahul", role: "USER", createdAt: new Date().toISOString() },
  { id: "3", name: "Priya", role: "USER", createdAt: new Date().toISOString() },
  { id: "4", name: "Aman", role: "MODERATOR", createdAt: new Date().toISOString() },
];
const posts: Post[] = [
  { id: "1", title: "Winning in Life", description: "Live like a fighter.", authorId: "1", tags: ["life", "growth"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "2", title: "Power of Consistency", description: "Small steps lead to massive results.", authorId: "2", tags: ["habits"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];
let userSequence = 5;
let postSequence = 3;
const byId = <T extends { id: string }>(items: T[], id: string) => items.find(item => item.id === id) ?? null;
const requiredText = (value: string, label: string, max = 200): string => {
  const cleaned = value.trim();
  if (!cleaned) throw new Error(`${label} cannot be empty`);
  if (cleaned.length > max) throw new Error(`${label} must be at most ${max} characters`);
  return cleaned;
};
const page = <T>(items: T[], first = 20, after = 0) => {
  const size = Math.min(Math.max(first, 1), 100);
  const start = Math.max(after, 0);
  const nodes = items.slice(start, start + size);
  return { nodes, totalCount: items.length, hasNextPage: start + nodes.length < items.length, endCursor: String(start + nodes.length) };
};

const typeDefs = `#graphql
  enum Role { ADMIN USER MODERATOR }
  type User { id: ID!, name: String!, role: Role!, createdAt: String!, posts: [Post!]! }
  type Post { id: ID!, title: String!, description: String!, tags: [String!]!, createdAt: String!, updatedAt: String!, author: User! }
  type PageInfo { totalCount: Int!, hasNextPage: Boolean!, endCursor: String! }
  type UserPage { nodes: [User!]!, pageInfo: PageInfo! }
  type PostPage { nodes: [Post!]!, pageInfo: PageInfo! }
  input CreateUserInput { name: String!, role: Role! }
  input UpdateUserInput { name: String, role: Role }
  input CreatePostInput { title: String!, description: String!, authorId: ID!, tags: [String!] = [] }
  input UpdatePostInput { title: String, description: String, tags: [String!] }
  type Query {
    users(search: String, role: Role, first: Int = 20, after: String = "0"): UserPage!
    user(id: ID!): User
    posts(search: String, tag: String, authorId: ID, first: Int = 20, after: String = "0"): PostPage!
    post(id: ID!): Post
    roles: [Role!]!
    health: String!
  }
  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User
    deleteUser(id: ID!): Boolean!
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post
    deletePost(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    users: (_: unknown, args: { search?: string; role?: Role; first?: number; after?: string }) => {
      let result = users;
      if (args.search) result = result.filter(user => user.name.toLowerCase().includes(args.search!.trim().toLowerCase()));
      if (args.role) result = result.filter(user => user.role === args.role);
      const resultPage = page(result, args.first, Number(args.after));
      return { nodes: resultPage.nodes, pageInfo: { totalCount: resultPage.totalCount, hasNextPage: resultPage.hasNextPage, endCursor: resultPage.endCursor } };
    },
    user: (_: unknown, { id }: { id: string }) => byId(users, id),
    posts: (_: unknown, args: { search?: string; tag?: string; authorId?: string; first?: number; after?: string }) => {
      let result = posts;
      if (args.search) { const q = args.search.trim().toLowerCase(); result = result.filter(post => `${post.title} ${post.description}`.toLowerCase().includes(q)); }
      if (args.tag) result = result.filter(post => post.tags.includes(args.tag!));
      if (args.authorId) result = result.filter(post => post.authorId === args.authorId);
      const resultPage = page(result, args.first, Number(args.after));
      return { nodes: resultPage.nodes, pageInfo: { totalCount: resultPage.totalCount, hasNextPage: resultPage.hasNextPage, endCursor: resultPage.endCursor } };
    },
    post: (_: unknown, { id }: { id: string }) => byId(posts, id),
    roles: () => ["ADMIN", "USER", "MODERATOR"],
    health: () => "ok",
  },
  User: { posts: (user: User) => posts.filter(post => post.authorId === user.id) },
  Post: { author: (post: Post) => byId(users, post.authorId) },
  Mutation: {
    createUser: (_: unknown, { input }: { input: { name: string; role: Role } }) => {
      const user = { id: String(userSequence++), name: requiredText(input.name, "Name", 80), role: input.role, createdAt: new Date().toISOString() };
      users.push(user); return user;
    },
    updateUser: (_: unknown, { id, input }: { id: string; input: { name?: string; role?: Role } }) => {
      const user = byId(users, id); if (!user) return null;
      if (input.name !== undefined) user.name = requiredText(input.name, "Name", 80);
      if (input.role !== undefined) user.role = input.role;
      return user;
    },
    deleteUser: (_: unknown, { id }: { id: string }) => {
      if (posts.some(post => post.authorId === id)) throw new Error("Cannot delete a user who still has posts");
      const index = users.findIndex(user => user.id === id); if (index < 0) return false;
      users.splice(index, 1); return true;
    },
    createPost: (_: unknown, { input }: { input: { title: string; description: string; authorId: string; tags?: string[] } }) => {
      if (!byId(users, input.authorId)) throw new Error("Author does not exist");
      const now = new Date().toISOString();
      const post: Post = { id: String(postSequence++), title: requiredText(input.title, "Title", 120), description: requiredText(input.description, "Description", 5000), authorId: input.authorId, tags: (input.tags ?? []).map(tag => requiredText(tag, "Tag", 30)), createdAt: now, updatedAt: now };
      posts.push(post); return post;
    },
    updatePost: (_: unknown, { id, input }: { id: string; input: { title?: string; description?: string; tags?: string[] } }) => {
      const post = byId(posts, id); if (!post) return null;
      if (input.title !== undefined) post.title = requiredText(input.title, "Title", 120);
      if (input.description !== undefined) post.description = requiredText(input.description, "Description", 5000);
      if (input.tags !== undefined) post.tags = input.tags.map(tag => requiredText(tag, "Tag", 30));
      post.updatedAt = new Date().toISOString(); return post;
    },
    deletePost: (_: unknown, { id }: { id: string }) => {
      const index = posts.findIndex(post => post.id === id); if (index < 0) return false;
      posts.splice(index, 1); return true;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
const port = Number(Bun.env.PORT ?? 4000);
const { url } = await startStandaloneServer(server, { listen: { port } });
console.log(`GraphQL API ready at ${url}`);
