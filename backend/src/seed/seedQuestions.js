const mongoose = require('mongoose');
const Question = require('../models/Question');

/**
 * Randomizes the position of the correct answer within a question's options array.
 * Every question is authored with the correct answer at index 0.
 * This helper picks a random target index (0–3), moves the correct answer
 * there, and updates the `answer` field to match the new position.
 */
const shuffleOptions = (q) => {
    const correctAnswer = q.options[q.answer];
    const distractors = q.options.filter((_, i) => i !== q.answer);
    const newAnswerIndex = Math.floor(Math.random() * 4);
    const shuffledOptions = [...distractors];
    shuffledOptions.splice(newAnswerIndex, 0, correctAnswer);
    return { ...q, options: shuffledOptions, answer: newAnswerIndex };
};

const seedQuestions = async () => {
    try {
        // Full question bank — all questions across all roles
        const questions = [

            // ==================== FRONTEND (25 questions) ====================
            {
                question: 'What is the Virtual DOM in React?',
                options: ['A lightweight copy of the actual DOM', 'A database for storing components', 'A CSS framework', 'A type of React hook'],
                answer: 0, difficulty: 'easy', role: 'frontend', category: 'technical',
                explanation: 'The Virtual DOM is a lightweight JavaScript representation of the actual DOM. React uses it to optimize updates by comparing changes before applying them to the real DOM.'
            },
            {
                question: 'Which CSS property is used to create a flexbox layout?',
                options: ['display: flex', 'layout: flex', 'flex-mode: on', 'position: flex'],
                answer: 0, difficulty: 'easy', role: 'frontend', category: 'technical',
                explanation: 'The display: flex property enables flexbox layout, allowing flexible and responsive alignment of child elements.'
            },
            {
                question: 'What does the useState hook return in React?',
                options: ['An array with state value and setter function', 'Only the state value', 'An object with state properties', 'A promise'],
                answer: 0, difficulty: 'easy', role: 'frontend', category: 'technical',
                explanation: 'useState returns an array with two elements: the current state value and a function to update it.'
            },
            {
                question: 'What is the purpose of the useEffect hook?',
                options: ['To perform side effects in functional components', 'To create stateful variables', 'To handle form submissions', 'To style components'],
                answer: 0, difficulty: 'medium', role: 'frontend', category: 'technical',
                explanation: 'useEffect allows you to perform side effects like data fetching, subscriptions, or DOM manipulation in functional components.'
            },
            {
                question: 'What is event bubbling in JavaScript?',
                options: ['Events propagate from child to parent elements', 'Events are triggered randomly', 'Events propagate from parent to child', 'Events are canceled automatically'],
                answer: 0, difficulty: 'medium', role: 'frontend', category: 'technical',
                explanation: 'Event bubbling means that when an event occurs on an element, it first runs handlers on that element, then on its parent, and so on upward.'
            },
            {
                question: 'What is the purpose of the key prop in React lists?',
                options: ['To help React identify which items have changed', 'To encrypt data', 'To style list items', 'To sort the list'],
                answer: 0, difficulty: 'medium', role: 'frontend', category: 'technical',
                explanation: 'Keys help React identify which items in a list have changed, been added, or removed, optimizing re-renders.'
            },
            {
                question: 'Which method is used to make HTTP requests in modern JavaScript?',
                options: ['fetch()', 'http()', 'request()', 'ajax()'],
                answer: 0, difficulty: 'easy', role: 'frontend', category: 'technical',
                explanation: 'The fetch() API is the modern standard for making HTTP requests in JavaScript, returning a Promise.'
            },
            {
                question: 'What does CSS specificity determine?',
                options: ['Which CSS rule applies when multiple rules target the same element', 'The loading order of stylesheets', 'The performance of CSS', 'The color scheme'],
                answer: 0, difficulty: 'medium', role: 'frontend', category: 'technical',
                explanation: 'CSS specificity determines which styles are applied when multiple rules conflict. More specific selectors override less specific ones.'
            },
            {
                question: 'What is the difference between let and const in JavaScript?',
                options: ['const creates immutable bindings, let creates mutable bindings', 'let is global, const is local', 'const is faster than let', 'No difference'],
                answer: 0, difficulty: 'easy', role: 'frontend', category: 'technical',
                explanation: 'const creates a variable that cannot be reassigned, while let creates a variable that can be reassigned.'
            },
            {
                question: 'What is a closure in JavaScript?',
                options: ['A function that has access to variables in its outer scope', 'A syntax for closing code blocks', 'A method to close browser windows', 'A type of loop'],
                answer: 0, difficulty: 'hard', role: 'frontend', category: 'technical',
                explanation: 'A closure is a function that retains access to variables from its outer (enclosing) scope even after the outer function has finished executing.'
            },
            {
                question: 'What is the purpose of React Router?',
                options: ['To enable navigation and routing in React applications', 'To manage state globally', 'To optimize performance', 'To handle form validation'],
                answer: 0, difficulty: 'medium', role: 'frontend', category: 'technical',
                explanation: 'React Router is a library for handling client-side routing in React applications, enabling navigation between different views.'
            },
            {
                question: 'What does the box-sizing: border-box CSS property do?',
                options: ['Includes padding and border in element\'s total width and height', 'Adds a border around the box', 'Removes the box model', 'Changes the box color'],
                answer: 0, difficulty: 'medium', role: 'frontend', category: 'technical',
                explanation: 'box-sizing: border-box makes width and height include padding and border, making layouts more predictable.'
            },
            {
                question: 'What is the purpose of async/await in JavaScript?',
                options: ['To write asynchronous code in a synchronous style', 'To make code execute faster', 'To create multi-threaded applications', 'To handle CSS animations'],
                answer: 0, difficulty: 'medium', role: 'frontend', category: 'technical',
                explanation: 'async/await provides a cleaner syntax for working with Promises, making asynchronous code easier to read and write.'
            },
            {
                question: 'What is the difference between == and === in JavaScript?',
                options: ['=== checks type and value, == only checks value', '== is faster than ===', 'No difference', '=== is deprecated'],
                answer: 0, difficulty: 'easy', role: 'frontend', category: 'technical',
                explanation: 'The === operator checks both value and type (strict equality), while == performs type coercion before comparison.'
            },
            {
                question: 'What is React Context API used for?',
                options: ['To share data across components without prop drilling', 'To manage HTTP requests', 'To create animations', 'To optimize performance'],
                answer: 0, difficulty: 'hard', role: 'frontend', category: 'technical',
                explanation: 'Context API provides a way to pass data through the component tree without manually passing props at every level.'
            },
            {
                question: 'What does the spread operator (...) do in JavaScript?',
                options: ['Expands an iterable into individual elements', 'Multiplies numbers', 'Creates a new array with zeros', 'Copies only the first element'],
                answer: 0, difficulty: 'medium', role: 'frontend', category: 'technical',
                explanation: 'The spread operator expands iterables like arrays or objects into individual elements, useful for copying or merging.'
            },
            {
                question: 'What is the difference between null and undefined in JavaScript?',
                options: ['null is intentional absence, undefined is an uninitialized variable', 'They are identical', 'undefined is an error state', 'null is faster'],
                answer: 0, difficulty: 'medium', role: 'frontend', category: 'technical',
                explanation: 'undefined means a variable has been declared but not assigned. null is an intentional assignment of no value.'
            },
            {
                question: 'What is localStorage in the browser?',
                options: ['A web API for storing data persistently in the browser', 'A JavaScript framework', 'A CSS feature', 'A type of database'],
                answer: 0, difficulty: 'easy', role: 'frontend', category: 'technical',
                explanation: 'localStorage is a web storage API that lets you store key-value pairs persistently in the browser with no expiration.'
            },
            {
                question: 'What does the map() method do in JavaScript?',
                options: ['Creates a new array with results of calling a function on every element', 'Filters an array', 'Sorts an array', 'Finds an element'],
                answer: 0, difficulty: 'easy', role: 'frontend', category: 'technical',
                explanation: 'Array.map() iterates over each element and returns a new array with the transformed results, without modifying the original.'
            },
            {
                question: 'What is the difference between display:none and visibility:hidden in CSS?',
                options: ['display:none removes the element from layout, visibility:hidden hides but keeps space', 'They are the same', 'visibility:hidden also removes space', 'display:none keeps the space'],
                answer: 0, difficulty: 'medium', role: 'frontend', category: 'technical',
                explanation: 'display:none removes the element from the document flow entirely, while visibility:hidden hides it but still occupies space in the layout.'
            },
            {
                question: 'What is a React custom hook?',
                options: ['A reusable function that uses built-in React hooks', 'A built-in React feature', 'A CSS styling hook', 'A state management library'],
                answer: 0, difficulty: 'hard', role: 'frontend', category: 'technical',
                explanation: 'Custom hooks are JavaScript functions starting with "use" that can call other hooks and encapsulate reusable stateful logic.'
            },
            {
                question: 'What does the filter() method do in JavaScript?',
                options: ['Returns a new array with elements that pass a test', 'Changes elements of an array', 'Adds elements to an array', 'Sorts an array'],
                answer: 0, difficulty: 'easy', role: 'frontend', category: 'technical',
                explanation: 'Array.filter() creates a new array containing only elements for which the callback function returns true.'
            },
            {
                question: 'What is the purpose of a media query in CSS?',
                options: ['To apply styles based on screen size or device type', 'To load media files', 'To animate elements', 'To query a database'],
                answer: 0, difficulty: 'easy', role: 'frontend', category: 'technical',
                explanation: 'Media queries allow CSS to apply different styles depending on device characteristics like screen width, making sites responsive.'
            },
            {
                question: 'What is the event.preventDefault() method used for?',
                options: ['To stop the default browser action for an event', 'To stop event bubbling', 'To delete event listeners', 'To pause JavaScript execution'],
                answer: 0, difficulty: 'medium', role: 'frontend', category: 'technical',
                explanation: 'event.preventDefault() cancels the default action associated with an event, like preventing a form from submitting or a link from navigating.'
            },
            {
                question: 'What is the purpose of useCallback in React?',
                options: ['To memoize a function so it is not recreated on every render', 'To call functions asynchronously', 'To handle form callbacks', 'To replace useEffect'],
                answer: 0, difficulty: 'hard', role: 'frontend', category: 'technical',
                explanation: 'useCallback returns a memoized version of a callback that only changes if its dependencies change, preventing unnecessary re-renders of child components.'
            },

            // ==================== BACKEND (25 questions) ====================
            {
                question: 'What is middleware in Express.js?',
                options: ['Functions that execute during request-response cycle', 'A database management tool', 'A frontend framework', 'A type of routing'],
                answer: 0, difficulty: 'medium', role: 'backend', category: 'technical',
                explanation: 'Middleware functions have access to request and response objects and can execute code, modify them, or end the request-response cycle.'
            },
            {
                question: 'Which HTTP method is used to update existing data?',
                options: ['PUT', 'GET', 'POST', 'DELETE'],
                answer: 0, difficulty: 'easy', role: 'backend', category: 'technical',
                explanation: 'PUT is typically used to update existing resources, while PATCH is used for partial updates.'
            },
            {
                question: 'What is the purpose of JWT (JSON Web Token)?',
                options: ['Secure authentication and information exchange', 'Database encryption', 'Frontend styling', 'File compression'],
                answer: 0, difficulty: 'medium', role: 'backend', category: 'technical',
                explanation: 'JWT is a compact, URL-safe means of representing claims to be transferred between two parties, commonly used for authentication.'
            },
            {
                question: 'What does REST stand for?',
                options: ['Representational State Transfer', 'Remote Exchange State Transfer', 'Rapid Execution State Transfer', 'Reliable Exchange System Transfer'],
                answer: 0, difficulty: 'easy', role: 'backend', category: 'technical',
                explanation: 'REST is an architectural style for designing networked applications using stateless communication and standard HTTP methods.'
            },
            {
                question: 'What is the purpose of bcrypt in Node.js?',
                options: ['To hash passwords securely', 'To compress files', 'To manage databases', 'To handle routing'],
                answer: 0, difficulty: 'medium', role: 'backend', category: 'technical',
                explanation: 'bcrypt is a library used to hash passwords with salt, making them secure for storage in databases.'
            },
            {
                question: 'What is CORS (Cross-Origin Resource Sharing)?',
                options: ['A mechanism to allow requests from different origins', 'A database query language', 'A CSS preprocessor', 'A JavaScript framework'],
                answer: 0, difficulty: 'medium', role: 'backend', category: 'technical',
                explanation: 'CORS is a security feature that allows or restricts web applications running at one origin to access resources from another origin.'
            },
            {
                question: 'Which Node.js module is used for file system operations?',
                options: ['fs', 'http', 'path', 'url'],
                answer: 0, difficulty: 'easy', role: 'backend', category: 'technical',
                explanation: 'The fs (file system) module provides an API for interacting with the file system in a manner similar to POSIX functions.'
            },
            {
                question: 'What is the purpose of environment variables?',
                options: ['To store configuration and sensitive data outside code', 'To improve performance', 'To manage dependencies', 'To handle routing'],
                answer: 0, difficulty: 'easy', role: 'backend', category: 'technical',
                explanation: 'Environment variables keep sensitive information like API keys and database URLs separate from code, improving security.'
            },
            {
                question: 'What is the difference between SQL and NoSQL databases?',
                options: ['SQL uses structured tables, NoSQL uses flexible documents/key-value', 'SQL is faster', 'NoSQL is deprecated', 'No difference'],
                answer: 0, difficulty: 'medium', role: 'backend', category: 'technical',
                explanation: 'SQL databases use structured schemas with tables and relationships, while NoSQL databases offer flexible, schema-less data storage.'
            },
            {
                question: 'What does req.params contain in Express.js?',
                options: ['Route parameters from the URL', 'Query strings', 'Request headers', 'Request body data'],
                answer: 0, difficulty: 'easy', role: 'backend', category: 'technical',
                explanation: 'req.params contains route parameters specified in the URL path, like /users/:id where id is a parameter.'
            },
            {
                question: 'What is the purpose of indexing in MongoDB?',
                options: ['To improve query performance', 'To compress data', 'To encrypt documents', 'To backup data'],
                answer: 0, difficulty: 'medium', role: 'backend', category: 'technical',
                explanation: 'Indexes support efficient execution of queries by creating a data structure that allows fast lookups without scanning every document.'
            },
            {
                question: 'What is a Promise in Node.js?',
                options: ['An object representing the eventual completion of an async operation', 'A type of database', 'A synchronous function', 'A routing method'],
                answer: 0, difficulty: 'medium', role: 'backend', category: 'technical',
                explanation: 'A Promise represents a value that may not be available yet but will be resolved or rejected in the future.'
            },
            {
                question: 'What HTTP status code indicates successful resource creation?',
                options: ['201', '200', '404', '500'],
                answer: 0, difficulty: 'easy', role: 'backend', category: 'technical',
                explanation: 'HTTP 201 Created indicates that a request has succeeded and a new resource has been created as a result.'
            },
            {
                question: 'What is the purpose of the try-catch block?',
                options: ['To handle errors and exceptions', 'To optimize performance', 'To create loops', 'To define functions'],
                answer: 0, difficulty: 'easy', role: 'backend', category: 'technical',
                explanation: 'try-catch blocks allow you to handle errors gracefully by catching exceptions and executing alternative code.'
            },
            {
                question: 'What is the difference between authentication and authorization?',
                options: ['Authentication verifies identity, authorization verifies permissions', 'They are the same', 'Authorization is faster', 'Authentication is deprecated'],
                answer: 0, difficulty: 'medium', role: 'backend', category: 'technical',
                explanation: 'Authentication confirms who you are, while authorization determines what you are allowed to access or do.'
            },
            {
                question: 'What does req.query contain in Express.js?',
                options: ['Query string parameters from the URL', 'Route parameters', 'Request body', 'Request headers'],
                answer: 0, difficulty: 'easy', role: 'backend', category: 'technical',
                explanation: 'req.query contains key-value pairs from the URL query string, e.g., /search?name=John gives req.query.name = "John".'
            },
            {
                question: 'What is the purpose of rate limiting in APIs?',
                options: ['To prevent abuse by limiting the number of requests per time window', 'To speed up the API', 'To compress responses', 'To authenticate users'],
                answer: 0, difficulty: 'medium', role: 'backend', category: 'technical',
                explanation: 'Rate limiting controls how many requests a client can make in a given time period, protecting APIs from abuse and DDoS attacks.'
            },
            {
                question: 'What does the 404 HTTP status code mean?',
                options: ['Resource not found', 'Server error', 'Unauthorized access', 'Bad request'],
                answer: 0, difficulty: 'easy', role: 'backend', category: 'technical',
                explanation: '404 Not Found means the server cannot find the requested resource - the URL does not exist on the server.'
            },
            {
                question: 'What is an ODM (Object Data Mapper)?',
                options: ['A library that maps JavaScript objects to database documents', 'A type of HTTP method', 'A cache system', 'A server configuration tool'],
                answer: 0, difficulty: 'medium', role: 'backend', category: 'technical',
                explanation: 'An ODM (like Mongoose) maps JavaScript objects to MongoDB documents, providing schema validation and query helpers.'
            },
            {
                question: 'What is the purpose of the next() function in Express middleware?',
                options: ['To pass control to the next middleware function', 'To end the request-response cycle', 'To redirect the user', 'To log the request'],
                answer: 0, difficulty: 'medium', role: 'backend', category: 'technical',
                explanation: 'Calling next() passes execution to the next middleware in the stack. Without it, the request will hang.'
            },
            {
                question: 'What is a RESTful API endpoint convention for getting all users?',
                options: ['GET /api/users', 'POST /api/users/get', 'GET /api/getUsers', 'FETCH /api/users'],
                answer: 0, difficulty: 'easy', role: 'backend', category: 'technical',
                explanation: 'RESTful conventions use HTTP methods with noun-based endpoints. GET /api/users is the standard way to retrieve all users.'
            },
            {
                question: 'What is the purpose of the .env file in a Node.js project?',
                options: ['To store secret configuration variables outside of source code', 'To define npm scripts', 'To configure the database schema', 'To store frontend assets'],
                answer: 0, difficulty: 'easy', role: 'backend', category: 'technical',
                explanation: 'The .env file holds environment-specific configurations like DB URIs and API keys, and must never be committed to version control.'
            },
            {
                question: 'What does HTTP 401 Unauthorized mean?',
                options: ['The request requires authentication', 'The resource does not exist', 'The server crashed', 'The request was successful'],
                answer: 0, difficulty: 'easy', role: 'backend', category: 'technical',
                explanation: '401 Unauthorized means the request lacks valid authentication credentials. The client must authenticate to get the response.'
            },
            {
                question: 'What is the difference between PUT and PATCH HTTP methods?',
                options: ['PUT replaces the entire resource, PATCH updates only specified fields', 'They are identical', 'PATCH deletes fields', 'PUT is deprecated'],
                answer: 0, difficulty: 'medium', role: 'backend', category: 'technical',
                explanation: 'PUT sends a complete replacement of the resource, while PATCH sends only the fields that need to be changed (partial update).'
            },
            {
                question: 'What is the purpose of Mongoose Schema?',
                options: ['To define the structure and validation rules for MongoDB documents', 'To speed up queries', 'To create API routes', 'To manage user sessions'],
                answer: 0, difficulty: 'medium', role: 'backend', category: 'technical',
                explanation: 'A Mongoose Schema defines the shape of documents in a collection, including field types, required fields, and default values.'
            },

            // ==================== MERN (25 questions) ====================
            {
                question: 'What does the MERN stack consist of?',
                options: ['MongoDB, Express, React, Node.js', 'MySQL, Express, React, Node.js', 'MongoDB, Ember, React, Node.js', 'MongoDB, Express, Redux, Node.js'],
                answer: 0, difficulty: 'easy', role: 'mern', category: 'technical',
                explanation: 'MERN stands for MongoDB (database), Express (backend framework), React (frontend library), and Node.js (runtime).'
            },
            {
                question: 'How does React communicate with an Express backend?',
                options: ['Through HTTP requests using fetch or axios', 'Direct database connection', 'Shared memory', 'File system'],
                answer: 0, difficulty: 'easy', role: 'mern', category: 'technical',
                explanation: 'React makes HTTP requests to Express API endpoints using libraries like fetch or axios to exchange data.'
            },
            {
                question: 'What is the role of Express.js in the MERN stack?',
                options: ['Backend web framework for creating APIs', 'Database management', 'Frontend rendering', 'State management'],
                answer: 0, difficulty: 'easy', role: 'mern', category: 'technical',
                explanation: 'Express.js is a minimal web framework for Node.js used to build RESTful APIs and handle HTTP requests.'
            },
            {
                question: 'What is Mongoose in the MERN stack?',
                options: ['An ODM (Object Data Modeling) library for MongoDB', 'A frontend framework', 'A testing library', 'A CSS preprocessor'],
                answer: 0, difficulty: 'medium', role: 'mern', category: 'technical',
                explanation: 'Mongoose provides a schema-based solution to model application data and interact with MongoDB in Node.js.'
            },
            {
                question: 'Where should you store JWT tokens in a React application?',
                options: ['localStorage or httpOnly cookies', 'Component state only', 'URL parameters', 'CSS variables'],
                answer: 0, difficulty: 'medium', role: 'mern', category: 'technical',
                explanation: 'JWT tokens are commonly stored in localStorage for easy access or httpOnly cookies for better security.'
            },
            {
                question: 'What is the purpose of Redux in a MERN application?',
                options: ['Centralized state management', 'Database queries', 'Backend routing', 'CSS styling'],
                answer: 0, difficulty: 'medium', role: 'mern', category: 'technical',
                explanation: 'Redux provides a predictable state container for JavaScript apps, managing global state across components.'
            },
            {
                question: 'What is the purpose of body-parser in Express?',
                options: ['To parse incoming request bodies', 'To compress responses', 'To handle authentication', 'To manage routes'],
                answer: 0, difficulty: 'easy', role: 'mern', category: 'technical',
                explanation: 'body-parser middleware parses incoming request bodies before your handlers, making data available under req.body.'
            },
            {
                question: 'What is the typical port for a React development server?',
                options: ['3000', '5000', '8080', '27017'],
                answer: 0, difficulty: 'easy', role: 'mern', category: 'technical',
                explanation: 'React development servers typically run on port 3000 by default when using Create React App.'
            },
            {
                question: 'What is the purpose of schema validation in Mongoose?',
                options: ['To enforce data structure and types', 'To improve performance', 'To handle authentication', 'To manage routing'],
                answer: 0, difficulty: 'medium', role: 'mern', category: 'technical',
                explanation: 'Schema validation ensures that documents conform to a specified structure and data types before being saved to MongoDB.'
            },
            {
                question: 'How do you handle different routes in a React application?',
                options: ['Using React Router', 'Using Express routes', 'Using HTML anchors', 'Using MongoDB queries'],
                answer: 0, difficulty: 'easy', role: 'mern', category: 'technical',
                explanation: 'React Router is the standard library for handling client-side routing in React applications.'
            },
            {
                question: 'What is the purpose of dotenv in a Node.js application?',
                options: ['To load environment variables from a .env file', 'To minify code', 'To test applications', 'To manage packages'],
                answer: 0, difficulty: 'easy', role: 'mern', category: 'technical',
                explanation: 'dotenv loads environment variables from a .env file into process.env, keeping sensitive data out of code.'
            },
            {
                question: 'What is the purpose of CORS middleware in Express?',
                options: ['To allow cross-origin requests from the React frontend', 'To compress data', 'To validate input', 'To manage sessions'],
                answer: 0, difficulty: 'medium', role: 'mern', category: 'technical',
                explanation: 'CORS middleware enables the Express backend to accept requests from the React frontend running on a different port/origin.'
            },
            {
                question: 'What is the recommended way to make API calls in React?',
                options: ['Inside useEffect hook', 'Inside render method', 'Inside constructor', 'Inside CSS files'],
                answer: 0, difficulty: 'medium', role: 'mern', category: 'technical',
                explanation: 'API calls should be made in useEffect to handle side effects and ensure proper component lifecycle management.'
            },
            {
                question: 'What is the purpose of protected routes in a MERN application?',
                options: ['To restrict access to authenticated users only', 'To improve performance', 'To handle errors', 'To manage state'],
                answer: 0, difficulty: 'medium', role: 'mern', category: 'technical',
                explanation: 'Protected routes check authentication status and redirect unauthorized users, securing sensitive pages.'
            },
            {
                question: 'What does a MongoDB connection string typically start with?',
                options: ['mongodb://', 'http://', 'sql://', 'db://'],
                answer: 0, difficulty: 'easy', role: 'mern', category: 'technical',
                explanation: 'MongoDB connection strings use the mongodb:// protocol (or mongodb+srv:// for Atlas cloud).'
            },
            {
                question: 'What is the purpose of nodemon in development?',
                options: ['To automatically restart the server on file changes', 'To compile React code', 'To test APIs', 'To manage databases'],
                answer: 0, difficulty: 'easy', role: 'mern', category: 'technical',
                explanation: 'nodemon monitors for file changes and automatically restarts the Node.js application, improving development workflow.'
            },
            {
                question: 'What is prop drilling in React and how can it be avoided?',
                options: ['Passing props through many levels; use Context API or Redux', 'A performance optimization technique', 'A routing strategy', 'A database query method'],
                answer: 0, difficulty: 'hard', role: 'mern', category: 'technical',
                explanation: 'Prop drilling occurs when you pass props through multiple component levels. Context API or state management libraries can avoid this.'
            },
            {
                question: 'What is the purpose of axios in a MERN project?',
                options: ['To make HTTP requests from the frontend to the backend', 'To manage MongoDB connections', 'To style React components', 'To define Express routes'],
                answer: 0, difficulty: 'easy', role: 'mern', category: 'technical',
                explanation: 'Axios is a popular HTTP client library used in React to make API requests to Express backend endpoints.'
            },
            {
                question: 'What is the default port for MongoDB?',
                options: ['27017', '5000', '3000', '8080'],
                answer: 0, difficulty: 'easy', role: 'mern', category: 'technical',
                explanation: 'MongoDB runs on port 27017 by default. MongoDB Atlas connections use a cloud URI with the mongodb+srv:// scheme.'
            },
            {
                question: 'What is the purpose of React.memo()?',
                options: ['To prevent unnecessary re-renders of functional components', 'To memoize API calls', 'To store state in memory', 'To optimize CSS'],
                answer: 0, difficulty: 'hard', role: 'mern', category: 'technical',
                explanation: 'React.memo() is a higher-order component that only re-renders a component when its props change, improving performance.'
            },
            {
                question: 'How do you send a token in an HTTP request from React to Express?',
                options: ['In the Authorization header as Bearer token', 'In the URL as a query param', 'In a cookie automatically', 'In the request body always'],
                answer: 0, difficulty: 'medium', role: 'mern', category: 'technical',
                explanation: 'The standard way is to send JWT in the Authorization header: "Bearer <token>". Express middleware then extracts and verifies it.'
            },
            {
                question: 'What is the purpose of Model.findById() in Mongoose?',
                options: ['To find a single document by its MongoDB _id field', 'To find all documents', 'To delete a document', 'To update a document'],
                answer: 0, difficulty: 'easy', role: 'mern', category: 'technical',
                explanation: 'Model.findById(id) is a Mongoose shorthand for Model.findOne({ _id: id }), returning a single matching document.'
            },
            {
                question: 'What is the purpose of the useNavigate hook in React Router?',
                options: ['To programmatically navigate to different routes', 'To fetch route data', 'To define route parameters', 'To manage page titles'],
                answer: 0, difficulty: 'medium', role: 'mern', category: 'technical',
                explanation: 'useNavigate returns a function that lets you navigate programmatically, replacing the older useHistory hook.'
            },
            {
                question: 'What is a 500 Internal Server Error?',
                options: ['A generic server-side error when something unexpected went wrong', 'A client authentication error', 'A resource not found error', 'A network timeout'],
                answer: 0, difficulty: 'easy', role: 'mern', category: 'technical',
                explanation: '500 Internal Server Error means the server encountered an unexpected condition that prevented it from fulfilling the request.'
            },
            {
                question: 'What does the useMemo hook do in React?',
                options: ['Memoizes the result of an expensive calculation to avoid recalculation on every render', 'Manages API calls', 'Stores component refs', 'Handles events'],
                answer: 0, difficulty: 'hard', role: 'mern', category: 'technical',
                explanation: 'useMemo caches the result of a function and only recomputes it when specified dependencies change, improving performance.'
            },

            // ==================== HR (20 questions) ====================
            {
                question: 'Tell me about a time you faced a challenging deadline. How did you handle it?',
                options: ['Prioritized tasks and communicated with stakeholders', 'Ignored the deadline', 'Complained to management', 'Quit the project'],
                answer: 0, difficulty: 'medium', role: 'hr', category: 'hr',
                explanation: 'Good answers demonstrate time management, prioritization, and communication skills under pressure.'
            },
            {
                question: 'Why do you want to work for this company?',
                options: ['I align with the company values and growth opportunities', 'I just need any job', 'The office is close to home', 'I heard the salary is good'],
                answer: 0, difficulty: 'easy', role: 'hr', category: 'hr',
                explanation: 'Show genuine interest by researching the company and aligning your answer with their mission and culture.'
            },
            {
                question: 'How do you handle conflicts with team members?',
                options: ['Address issues directly with open communication', 'Avoid the person', 'Report to HR immediately', 'Argue until I win'],
                answer: 0, difficulty: 'medium', role: 'hr', category: 'hr',
                explanation: 'Effective conflict resolution involves direct, respectful communication and finding mutually beneficial solutions.'
            },
            {
                question: 'Describe a situation where you showed leadership.',
                options: ['Led a team project and delegated tasks effectively', 'Always worked alone', 'Only did what I was told', 'Avoided responsibility'],
                answer: 0, difficulty: 'medium', role: 'hr', category: 'hr',
                explanation: 'Leadership examples should show initiative, team coordination, and achieving results through others.'
            },
            {
                question: 'What are your greatest strengths?',
                options: ['Problem-solving, teamwork, and quick learning', 'I have no weaknesses', 'I am perfect at everything', 'I work slowly but surely'],
                answer: 0, difficulty: 'easy', role: 'hr', category: 'hr',
                explanation: 'Choose strengths relevant to the role and provide specific examples of how you have demonstrated them.'
            },
            {
                question: 'What is your biggest weakness?',
                options: ['Sometimes I focus too much on details, but I am working on balancing quality and speed', 'I have no weaknesses', 'I am always late', 'I can\'t work with others'],
                answer: 0, difficulty: 'medium', role: 'hr', category: 'hr',
                explanation: 'Show self-awareness and growth by mentioning a real weakness and steps you are taking to improve.'
            },
            {
                question: 'Where do you see yourself in 5 years?',
                options: ['Growing in technical expertise and taking on more responsibilities', 'Running my own business', 'I don\'t know', 'Retired'],
                answer: 0, difficulty: 'easy', role: 'hr', category: 'hr',
                explanation: 'Show ambition aligned with the company\'s growth path and your career development in relevant skills.'
            },
            {
                question: 'How do you prioritize tasks when everything is urgent?',
                options: ['Assess impact and deadlines, then execute systematically', 'Do tasks randomly', 'Panic and do nothing', 'Only work on fun tasks'],
                answer: 0, difficulty: 'medium', role: 'hr', category: 'hr',
                explanation: 'Effective prioritization considers business impact, urgency, and dependencies, with clear communication.'
            },
            {
                question: 'Tell me about a time you failed. What did you learn?',
                options: ['Missed a deadline but learned to improve planning and ask for help earlier', 'I never fail', 'I blamed others', 'I quit after failing'],
                answer: 0, difficulty: 'medium', role: 'hr', category: 'hr',
                explanation: 'Show accountability, self-reflection, and growth. Emphasize lessons learned and improvements made.'
            },
            {
                question: 'Why should we hire you?',
                options: ['My skills match the role and I am passionate about contributing to your mission', 'I need money', 'I am the best', 'Everyone else is worse'],
                answer: 0, difficulty: 'medium', role: 'hr', category: 'hr',
                explanation: 'Highlight unique value you bring, relevant skills, and genuine enthusiasm for the role and company.'
            },
            {
                question: 'How do you stay updated with technology trends?',
                options: ['Follow tech blogs, take online courses, and work on personal projects', 'I don\'t need to update', 'I only learn at work', 'I wait for others to teach me'],
                answer: 0, difficulty: 'easy', role: 'hr', category: 'hr',
                explanation: 'Show continuous learning through specific resources, courses, communities, and hands-on practice.'
            },
            {
                question: 'Describe a time you went above and beyond.',
                options: ['Volunteered for extra project work and delivered exceptional results', 'I only do what is required', 'I always leave work early', 'I avoid extra work'],
                answer: 0, difficulty: 'medium', role: 'hr', category: 'hr',
                explanation: 'Demonstrate initiative, dedication, and positive outcomes from taking on additional responsibilities.'
            },
            {
                question: 'How do you handle constructive criticism?',
                options: ['Listen actively, reflect, and use it to improve', 'Ignore it', 'Get defensive', 'Argue back'],
                answer: 0, difficulty: 'easy', role: 'hr', category: 'hr',
                explanation: 'Show maturity by demonstrating openness to feedback and commitment to continuous improvement.'
            },
            {
                question: 'What motivates you at work?',
                options: ['Solving challenging problems and learning new technologies', 'Only the paycheck', 'Free food', 'Nothing motivates me'],
                answer: 0, difficulty: 'easy', role: 'hr', category: 'hr',
                explanation: 'Connect motivation to professional growth, impact, and aspects relevant to the role and company.'
            },
            {
                question: 'How do you handle stress and pressure?',
                options: ['Break down tasks, prioritize, and take short breaks to stay focused', 'Avoid stressful situations', 'Panic', 'Blame others'],
                answer: 0, difficulty: 'medium', role: 'hr', category: 'hr',
                explanation: 'Show healthy coping mechanisms, time management, and ability to maintain productivity under pressure.'
            },
            {
                question: 'Give an example of how you worked effectively in a team.',
                options: ['Collaborated on project planning and communicated regularly to meet goals', 'I prefer working alone', 'I let others do all the work', 'I only work when supervised'],
                answer: 0, difficulty: 'easy', role: 'hr', category: 'hr',
                explanation: 'Highlight collaboration, communication, and specific contributions that led to team success.'
            },
            {
                question: 'Are you comfortable working remotely?',
                options: ['Yes, I can manage time effectively and communicate proactively', 'No, I need constant supervision', 'I have never tried', 'I prefer to not work at all'],
                answer: 0, difficulty: 'easy', role: 'hr', category: 'hr',
                explanation: 'Emphasize self-discipline, communication tools, and proven ability to deliver results in a remote setting.'
            },
            {
                question: 'What does teamwork mean to you?',
                options: ['Collaborating, sharing responsibilities, and supporting each other to achieve common goals', 'Everyone working separately', 'Doing whatever the leader says', 'Competing with colleagues'],
                answer: 0, difficulty: 'easy', role: 'hr', category: 'hr',
                explanation: 'Good teamwork answers highlight collaboration, communication, trust, and mutual accountability.'
            },
            {
                question: 'How would your previous colleagues describe you?',
                options: ['Reliable, collaborative, and solution-focused', 'Difficult to work with', 'Very quiet and unresponsive', 'Always absent'],
                answer: 0, difficulty: 'easy', role: 'hr', category: 'hr',
                explanation: 'Use specific traits that match the job description and back them up with real examples from past work.'
            },
            {
                question: 'What do you know about our company?',
                options: ['I researched your mission, products, and recent achievements that align with my goals', 'Nothing, I just applied randomly', 'I only know your office location', 'My friend works here'],
                answer: 0, difficulty: 'medium', role: 'hr', category: 'hr',
                explanation: 'Research the company before the interview. Mention specific products, values, news, or culture that appeal to you.'
            },

            // ==================== APTITUDE (25 questions) ====================
            {
                question: 'If a car travels 60 km in 1 hour, how far will it travel in 2.5 hours at the same speed?',
                options: ['150 km', '120 km', '180 km', '200 km'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: 'Distance = Speed × Time = 60 km/h × 2.5 h = 150 km'
            },
            {
                question: 'What is the next number in the series: 2, 4, 8, 16, ?',
                options: ['32', '24', '20', '18'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: 'Each number is multiplied by 2: 16 × 2 = 32'
            },
            {
                question: 'If 5 workers can complete a task in 12 days, how many days will 10 workers take?',
                options: ['6 days', '8 days', '10 days', '4 days'],
                answer: 0, difficulty: 'medium', role: 'aptitude', category: 'aptitude',
                explanation: 'More workers means less time. Inverse proportion: (5 × 12) / 10 = 6 days'
            },
            {
                question: 'A book costs $40 after a 20% discount. What was the original price?',
                options: ['$50', '$48', '$45', '$60'],
                answer: 0, difficulty: 'medium', role: 'aptitude', category: 'aptitude',
                explanation: 'If 80% = $40, then 100% = ($40 / 0.8) = $50'
            },
            {
                question: 'What is 15% of 200?',
                options: ['30', '25', '35', '20'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: '15% of 200 = (15/100) × 200 = 30'
            },
            {
                question: 'If you flip a fair coin twice, what is the probability of getting heads both times?',
                options: ['1/4', '1/2', '1/3', '2/3'],
                answer: 0, difficulty: 'medium', role: 'aptitude', category: 'aptitude',
                explanation: 'Probability = (1/2) × (1/2) = 1/4'
            },
            {
                question: 'What is the missing number: 3, 9, 27, ?, 243',
                options: ['81', '72', '54', '108'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: 'Each number is multiplied by 3: 27 × 3 = 81'
            },
            {
                question: 'A train 100 meters long passes a pole in 10 seconds. What is its speed in m/s?',
                options: ['10 m/s', '5 m/s', '20 m/s', '15 m/s'],
                answer: 0, difficulty: 'medium', role: 'aptitude', category: 'aptitude',
                explanation: 'Speed = Distance / Time = 100 m / 10 s = 10 m/s'
            },
            {
                question: 'What is the average of 10, 20, 30, 40, 50?',
                options: ['30', '25', '35', '20'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: 'Average = (10 + 20 + 30 + 40 + 50) / 5 = 150 / 5 = 30'
            },
            {
                question: 'If a rectangle has length 10 cm and width 5 cm, what is its area?',
                options: ['50 cm²', '30 cm²', '25 cm²', '15 cm²'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: 'Area of rectangle = Length × Width = 10 × 5 = 50 cm²'
            },
            {
                question: 'Complete the pattern: A, C, E, G, ?',
                options: ['I', 'H', 'J', 'F'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: 'The pattern skips one letter each time: A(+2)C(+2)E(+2)G(+2)I'
            },
            {
                question: 'What is 25% of 80?',
                options: ['20', '15', '25', '30'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: '25% of 80 = (25/100) × 80 = 20'
            },
            {
                question: 'A product costs $120 after a 25% markup. What was the cost price?',
                options: ['$96', '$100', '$90', '$85'],
                answer: 0, difficulty: 'medium', role: 'aptitude', category: 'aptitude',
                explanation: 'If 125% = $120, then 100% = ($120 / 1.25) = $96'
            },
            {
                question: 'How many prime numbers are there between 1 and 10?',
                options: ['4 (2, 3, 5, 7)', '3 (3, 5, 7)', '5 (1, 2, 3, 5, 7)', '2 (2, 7)'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: 'Prime numbers between 1 and 10 are: 2, 3, 5, 7 (total 4 primes)'
            },
            {
                question: 'If the sum of two numbers is 50 and their difference is 10, what is the larger number?',
                options: ['30', '25', '35', '40'],
                answer: 0, difficulty: 'medium', role: 'aptitude', category: 'aptitude',
                explanation: 'Let numbers be x and y. x + y = 50, x - y = 10. Solving: x = 30, y = 20'
            },
            {
                question: 'A shopkeeper sells an item for $75, making a 25% profit. What is the cost price?',
                options: ['$60', '$50', '$65', '$70'],
                answer: 0, difficulty: 'medium', role: 'aptitude', category: 'aptitude',
                explanation: 'If Selling Price = Cost × 1.25, then Cost = 75 / 1.25 = $60'
            },
            {
                question: 'What is the LCM (Least Common Multiple) of 4 and 6?',
                options: ['12', '24', '6', '8'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: 'LCM of 4 and 6 = 12, because 12 is the smallest number divisible by both 4 and 6.'
            },
            {
                question: 'If a pipe fills a tank in 4 hours and another empties it in 8 hours, how long to fill the tank with both open?',
                options: ['8 hours', '4 hours', '6 hours', '12 hours'],
                answer: 0, difficulty: 'hard', role: 'aptitude', category: 'aptitude',
                explanation: 'Net rate = 1/4 - 1/8 = 1/8 per hour. Time to fill = 8 hours.'
            },
            {
                question: 'What is the square root of 144?',
                options: ['12', '14', '11', '13'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: '√144 = 12, because 12 × 12 = 144'
            },
            {
                question: 'If 3x + 5 = 20, what is the value of x?',
                options: ['5', '4', '6', '3'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: '3x = 20 - 5 = 15, therefore x = 15 / 3 = 5'
            },
            {
                question: 'A man walks at 4 km/h. How long will it take him to walk 1 km?',
                options: ['15 minutes', '20 minutes', '10 minutes', '30 minutes'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: 'Time = Distance / Speed = 1 / 4 hours = 0.25 hours = 15 minutes'
            },
            {
                question: 'What is the next term in the sequence: 1, 4, 9, 16, 25, ?',
                options: ['36', '30', '35', '49'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: 'These are perfect squares: 1², 2², 3², 4², 5², so next is 6² = 36'
            },
            {
                question: 'If today is Monday, what day will it be after 100 days?',
                options: ['Wednesday', 'Tuesday', 'Thursday', 'Saturday'],
                answer: 0, difficulty: 'medium', role: 'aptitude', category: 'aptitude',
                explanation: '100 ÷ 7 = 14 weeks + 2 days. Monday + 2 days = Wednesday'
            },
            {
                question: 'What is the ratio of 25 to 75 in simplest form?',
                options: ['1:3', '1:2', '2:5', '5:15'],
                answer: 0, difficulty: 'easy', role: 'aptitude', category: 'aptitude',
                explanation: 'Divide both by GCD (25): 25/25 : 75/25 = 1:3'
            },
            {
                question: 'A certain number when divided by 7 gives a remainder of 3. What is the remainder when twice the number is divided by 7?',
                options: ['6', '3', '1', '5'],
                answer: 0, difficulty: 'hard', role: 'aptitude', category: 'aptitude',
                explanation: 'If n = 7k + 3, then 2n = 14k + 6. 14k is divisible by 7, so remainder is 6.'
            },
        ];

        // Use upsert logic — insert only questions that don't already exist (matched by question text)
        let inserted = 0;
        let skipped = 0;

        for (const q of questions) {
            const shuffled = shuffleOptions(q);
            const exists = await Question.findOne({ question: q.question });
            if (!exists) {
                await Question.create(shuffled);
                inserted++;
            } else {
                skipped++;
            }
        }

        console.log(`✅ Seeding complete! Inserted: ${inserted} new questions | Skipped: ${skipped} duplicates`);

    } catch (error) {
        console.error('Error seeding questions:', error.message);
    }
};

module.exports = seedQuestions;
