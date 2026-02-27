const mongoose = require('mongoose');
const Question = require('../models/Question');

// Database seeder for interview questions
// This function checks if the Question collection is empty.
// If empty, it inserts a comprehensive question bank.
// If not empty, it skips seeding.

/**
 * Randomizes the position of the correct answer within a question's options array.
 * Every question is authored with the correct answer at index 0.
 * This helper picks a random target index (0–3), moves the correct answer
 * there, and updates the `answer` field to match the new position.
 */
const shuffleOptions = (q) => {
    const correctAnswer = q.options[q.answer];  // always index 0 in source data
    const distractors = q.options.filter((_, i) => i !== q.answer);
    const newAnswerIndex = Math.floor(Math.random() * 4);
    const shuffledOptions = [...distractors];
    shuffledOptions.splice(newAnswerIndex, 0, correctAnswer);
    return { ...q, options: shuffledOptions, answer: newAnswerIndex };
};

const seedQuestions = async () => {
    try {
        // Check if questions already exist
        const count = await Question.countDocuments();

        if (count > 0) {
            console.log('Question bank already exists — skipping seed');
            return;
        }

        // Question bank with 75+ realistic interview questions
        const questions = [
            // ==================== FRONTEND (15 questions) ====================
            {
                question: 'What is the Virtual DOM in React?',
                options: [
                    'A lightweight copy of the actual DOM',
                    'A database for storing components',
                    'A CSS framework',
                    'A type of React hook'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'frontend',
                category: 'technical',
                explanation: 'The Virtual DOM is a lightweight JavaScript representation of the actual DOM. React uses it to optimize updates by comparing changes before applying them to the real DOM.'
            },
            {
                question: 'Which CSS property is used to create a flexbox layout?',
                options: ['display: flex', 'layout: flex', 'flex-mode: on', 'position: flex'],
                answer: 0,
                difficulty: 'easy',
                role: 'frontend',
                category: 'technical',
                explanation: 'The display: flex property enables flexbox layout, allowing flexible and responsive alignment of child elements.'
            },
            {
                question: 'What does the useState hook return in React?',
                options: [
                    'An array with state value and setter function',
                    'Only the state value',
                    'An object with state properties',
                    'A promise'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'frontend',
                category: 'technical',
                explanation: 'useState returns an array with two elements: the current state value and a function to update it.'
            },
            {
                question: 'What is the purpose of the useEffect hook?',
                options: [
                    'To perform side effects in functional components',
                    'To create stateful variables',
                    'To handle form submissions',
                    'To style components'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'frontend',
                category: 'technical',
                explanation: 'useEffect allows you to perform side effects like data fetching, subscriptions, or DOM manipulation in functional components.'
            },
            {
                question: 'What is event bubbling in JavaScript?',
                options: [
                    'Events propagate from child to parent elements',
                    'Events are triggered randomly',
                    'Events propagate from parent to child',
                    'Events are canceled automatically'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'frontend',
                category: 'technical',
                explanation: 'Event bubbling means that when an event occurs on an element, it first runs handlers on that element, then on its parent, and so on upward.'
            },
            {
                question: 'What is the purpose of the key prop in React lists?',
                options: [
                    'To help React identify which items have changed',
                    'To encrypt data',
                    'To style list items',
                    'To sort the list'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'frontend',
                category: 'technical',
                explanation: 'Keys help React identify which items in a list have changed, been added, or removed, optimizing re-renders.'
            },
            {
                question: 'Which method is used to make HTTP requests in modern JavaScript?',
                options: ['fetch()', 'http()', 'request()', 'ajax()'],
                answer: 0,
                difficulty: 'easy',
                role: 'frontend',
                category: 'technical',
                explanation: 'The fetch() API is the modern standard for making HTTP requests in JavaScript, returning a Promise.'
            },
            {
                question: 'What does CSS specificity determine?',
                options: [
                    'Which CSS rule applies when multiple rules target the same element',
                    'The loading order of stylesheets',
                    'The performance of CSS',
                    'The color scheme'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'frontend',
                category: 'technical',
                explanation: 'CSS specificity determines which styles are applied when multiple rules conflict. More specific selectors override less specific ones.'
            },
            {
                question: 'What is the difference between let and const in JavaScript?',
                options: [
                    'const creates immutable bindings, let creates mutable bindings',
                    'let is global, const is local',
                    'const is faster than let',
                    'No difference'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'frontend',
                category: 'technical',
                explanation: 'const creates a variable that cannot be reassigned, while let creates a variable that can be reassigned.'
            },
            {
                question: 'What is a closure in JavaScript?',
                options: [
                    'A function that has access to variables in its outer scope',
                    'A syntax for closing code blocks',
                    'A method to close browser windows',
                    'A type of loop'
                ],
                answer: 0,
                difficulty: 'hard',
                role: 'frontend',
                category: 'technical',
                explanation: 'A closure is a function that retains access to variables from its outer (enclosing) scope even after the outer function has finished executing.'
            },
            {
                question: 'What is the purpose of React Router?',
                options: [
                    'To enable navigation and routing in React applications',
                    'To manage state globally',
                    'To optimize performance',
                    'To handle form validation'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'frontend',
                category: 'technical',
                explanation: 'React Router is a library for handling client-side routing in React applications, enabling navigation between different views.'
            },
            {
                question: 'What does the box-sizing: border-box CSS property do?',
                options: [
                    'Includes padding and border in element\'s total width and height',
                    'Adds a border around the box',
                    'Removes the box model',
                    'Changes the box color'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'frontend',
                category: 'technical',
                explanation: 'box-sizing: border-box makes width and height include padding and border, making layouts more predictable.'
            },
            {
                question: 'What is the purpose of async/await in JavaScript?',
                options: [
                    'To write asynchronous code in a synchronous style',
                    'To make code execute faster',
                    'To create multi-threaded applications',
                    'To handle CSS animations'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'frontend',
                category: 'technical',
                explanation: 'async/await provides a cleaner syntax for working with Promises, making asynchronous code easier to read and write.'
            },
            {
                question: 'What is the difference between == and === in JavaScript?',
                options: [
                    '=== checks type and value, == only checks value',
                    '== is faster than ===',
                    'No difference',
                    '=== is deprecated'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'frontend',
                category: 'technical',
                explanation: 'The === operator checks both value and type (strict equality), while == performs type coercion before comparison.'
            },
            {
                question: 'What is React Context API used for?',
                options: [
                    'To share data across components without prop drilling',
                    'To manage HTTP requests',
                    'To create animations',
                    'To optimize performance'
                ],
                answer: 0,
                difficulty: 'hard',
                role: 'frontend',
                category: 'technical',
                explanation: 'Context API provides a way to pass data through the component tree without manually passing props at every level.'
            },

            // ==================== BACKEND (15 questions) ====================
            {
                question: 'What is middleware in Express.js?',
                options: [
                    'Functions that execute during request-response cycle',
                    'A database management tool',
                    'A frontend framework',
                    'A type of routing'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'backend',
                category: 'technical',
                explanation: 'Middleware functions have access to request and response objects and can execute code, modify them, or end the request-response cycle.'
            },
            {
                question: 'Which HTTP method is used to update existing data?',
                options: ['PUT', 'GET', 'POST', 'DELETE'],
                answer: 0,
                difficulty: 'easy',
                role: 'backend',
                category: 'technical',
                explanation: 'PUT is typically used to update existing resources, while PATCH is used for partial updates.'
            },
            {
                question: 'What is the purpose of JWT (JSON Web Token)?',
                options: [
                    'Secure authentication and information exchange',
                    'Database encryption',
                    'Frontend styling',
                    'File compression'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'backend',
                category: 'technical',
                explanation: 'JWT is a compact, URL-safe means of representing claims to be transferred between two parties, commonly used for authentication.'
            },
            {
                question: 'What does REST stand for?',
                options: [
                    'Representational State Transfer',
                    'Remote Exchange State Transfer',
                    'Rapid Execution State Transfer',
                    'Reliable Exchange System Transfer'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'backend',
                category: 'technical',
                explanation: 'REST is an architectural style for designing networked applications using stateless communication and standard HTTP methods.'
            },
            {
                question: 'What is the purpose of bcrypt in Node.js?',
                options: [
                    'To hash passwords securely',
                    'To compress files',
                    'To manage databases',
                    'To handle routing'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'backend',
                category: 'technical',
                explanation: 'bcrypt is a library used to hash passwords with salt, making them secure for storage in databases.'
            },
            {
                question: 'What is CORS (Cross-Origin Resource Sharing)?',
                options: [
                    'A mechanism to allow requests from different origins',
                    'A database query language',
                    'A CSS preprocessor',
                    'A JavaScript framework'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'backend',
                category: 'technical',
                explanation: 'CORS is a security feature that allows or restricts web applications running at one origin to access resources from another origin.'
            },
            {
                question: 'Which Node.js module is used for file system operations?',
                options: ['fs', 'http', 'path', 'url'],
                answer: 0,
                difficulty: 'easy',
                role: 'backend',
                category: 'technical',
                explanation: 'The fs (file system) module provides an API for interacting with the file system in a manner similar to POSIX functions.'
            },
            {
                question: 'What is the purpose of environment variables?',
                options: [
                    'To store configuration and sensitive data outside code',
                    'To improve performance',
                    'To manage dependencies',
                    'To handle routing'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'backend',
                category: 'technical',
                explanation: 'Environment variables keep sensitive information like API keys and database URLs separate from code, improving security.'
            },
            {
                question: 'What is the difference between SQL and NoSQL databases?',
                options: [
                    'SQL uses structured tables, NoSQL uses flexible documents/key-value',
                    'SQL is faster',
                    'NoSQL is deprecated',
                    'No difference'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'backend',
                category: 'technical',
                explanation: 'SQL databases use structured schemas with tables and relationships, while NoSQL databases offer flexible, schema-less data storage.'
            },
            {
                question: 'What does req.params contain in Express.js?',
                options: [
                    'Route parameters from the URL',
                    'Query strings',
                    'Request headers',
                    'Request body data'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'backend',
                category: 'technical',
                explanation: 'req.params contains route parameters specified in the URL path, like /users/:id where id is a parameter.'
            },
            {
                question: 'What is the purpose of indexing in MongoDB?',
                options: [
                    'To improve query performance',
                    'To compress data',
                    'To encrypt documents',
                    'To backup data'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'backend',
                category: 'technical',
                explanation: 'Indexes support efficient execution of queries by creating a data structure that allows fast lookups without scanning every document.'
            },
            {
                question: 'What is a Promise in Node.js?',
                options: [
                    'An object representing the eventual completion of an async operation',
                    'A type of database',
                    'A synchronous function',
                    'A routing method'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'backend',
                category: 'technical',
                explanation: 'A Promise represents a value that may not be available yet but will be resolved or rejected in the future.'
            },
            {
                question: 'What HTTP status code indicates successful resource creation?',
                options: ['201', '200', '404', '500'],
                answer: 0,
                difficulty: 'easy',
                role: 'backend',
                category: 'technical',
                explanation: 'HTTP 201 Created indicates that a request has succeeded and a new resource has been created as a result.'
            },
            {
                question: 'What is the purpose of the try-catch block?',
                options: [
                    'To handle errors and exceptions',
                    'To optimize performance',
                    'To create loops',
                    'To define functions'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'backend',
                category: 'technical',
                explanation: 'try-catch blocks allow you to handle errors gracefully by catching exceptions and executing alternative code.'
            },
            {
                question: 'What is the difference between authentication and authorization?',
                options: [
                    'Authentication verifies identity, authorization verifies permissions',
                    'They are the same',
                    'Authorization is faster',
                    'Authentication is deprecated'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'backend',
                category: 'technical',
                explanation: 'Authentication confirms who you are, while authorization determines what you are allowed to access or do.'
            },

            // ==================== MERN (17 questions) ====================
            {
                question: 'What does the MERN stack consist of?',
                options: [
                    'MongoDB, Express, React, Node.js',
                    'MySQL, Express, React, Node.js',
                    'MongoDB, Ember, React, Node.js',
                    'MongoDB, Express, Redux, Node.js'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'mern',
                category: 'technical',
                explanation: 'MERN stands for MongoDB (database), Express (backend framework), React (frontend library), and Node.js (runtime).'
            },
            {
                question: 'How does React communicate with an Express backend?',
                options: [
                    'Through HTTP requests using fetch or axios',
                    'Direct database connection',
                    'Shared memory',
                    'File system'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'mern',
                category: 'technical',
                explanation: 'React makes HTTP requests to Express API endpoints using libraries like fetch or axios to exchange data.'
            },
            {
                question: 'What is the role of Express.js in the MERN stack?',
                options: [
                    'Backend web framework for creating APIs',
                    'Database management',
                    'Frontend rendering',
                    'State management'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'mern',
                category: 'technical',
                explanation: 'Express.js is a minimal web framework for Node.js used to build RESTful APIs and handle HTTP requests.'
            },
            {
                question: 'What is Mongoose in the MERN stack?',
                options: [
                    'An ODM (Object Data Modeling) library for MongoDB',
                    'A frontend framework',
                    'A testing library',
                    'A CSS preprocessor'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'mern',
                category: 'technical',
                explanation: 'Mongoose provides a schema-based solution to model application data and interact with MongoDB in Node.js.'
            },
            {
                question: 'Where should you store JWT tokens in a React application?',
                options: [
                    'localStorage or httpOnly cookies',
                    'Component state only',
                    'URL parameters',
                    'CSS variables'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'mern',
                category: 'technical',
                explanation: 'JWT tokens are commonly stored in localStorage for easy access or httpOnly cookies for better security.'
            },
            {
                question: 'What is the purpose of Redux in a MERN application?',
                options: [
                    'Centralized state management',
                    'Database queries',
                    'Backend routing',
                    'CSS styling'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'mern',
                category: 'technical',
                explanation: 'Redux provides a predictable state container for JavaScript apps, managing global state across components.'
            },
            {
                question: 'What is the purpose of body-parser in Express?',
                options: [
                    'To parse incoming request bodies',
                    'To compress responses',
                    'To handle authentication',
                    'To manage routes'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'mern',
                category: 'technical',
                explanation: 'body-parser middleware parses incoming request bodies before your handlers, making data available under req.body (now built into Express as express.json()).'
            },
            {
                question: 'What is the typical port for a React development server?',
                options: ['3000', '5000', '8080', '27017'],
                answer: 0,
                difficulty: 'easy',
                role: 'mern',
                category: 'technical',
                explanation: 'React development servers typically run on port 3000 by default when using Create React App.'
            },
            {
                question: 'What is the purpose of schema validation in Mongoose?',
                options: [
                    'To enforce data structure and types',
                    'To improve performance',
                    'To handle authentication',
                    'To manage routing'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'mern',
                category: 'technical',
                explanation: 'Schema validation ensures that documents conform to a specified structure and data types before being saved to MongoDB.'
            },
            {
                question: 'How do you handle different routes in a React application?',
                options: [
                    'Using React Router',
                    'Using Express routes',
                    'Using HTML anchors',
                    'Using MongoDB queries'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'mern',
                category: 'technical',
                explanation: 'React Router is the standard library for handling client-side routing in React applications.'
            },
            {
                question: 'What is the purpose of dotenv in a Node.js application?',
                options: [
                    'To load environment variables from a .env file',
                    'To minify code',
                    'To test applications',
                    'To manage packages'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'mern',
                category: 'technical',
                explanation: 'dotenv loads environment variables from a .env file into process.env, keeping sensitive data out of code.'
            },
            {
                question: 'What is the purpose of CORS middleware in Express?',
                options: [
                    'To allow cross-origin requests from the React frontend',
                    'To compress data',
                    'To validate input',
                    'To manage sessions'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'mern',
                category: 'technical',
                explanation: 'CORS middleware enables the Express backend to accept requests from the React frontend running on a different port/origin.'
            },
            {
                question: 'What is the recommended way to make API calls in React?',
                options: [
                    'Inside useEffect hook',
                    'Inside render method',
                    'Inside constructor',
                    'Inside CSS files'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'mern',
                category: 'technical',
                explanation: 'API calls should be made in useEffect to handle side effects and ensure proper component lifecycle management.'
            },
            {
                question: 'What is the purpose of protected routes in a MERN application?',
                options: [
                    'To restrict access to authenticated users only',
                    'To improve performance',
                    'To handle errors',
                    'To manage state'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'mern',
                category: 'technical',
                explanation: 'Protected routes check authentication status and redirect unauthorized users, securing sensitive pages.'
            },
            {
                question: 'What is the MongoDB connection string typically start with?',
                options: ['mongodb://', 'http://', 'sql://', 'db://'],
                answer: 0,
                difficulty: 'easy',
                role: 'mern',
                category: 'technical',
                explanation: 'MongoDB connection strings use the mongodb:// protocol (or mongodb+srv:// for Atlas cloud).'
            },
            {
                question: 'What is the purpose of nodemon in development?',
                options: [
                    'To automatically restart the server on file changes',
                    'To compile React code',
                    'To test APIs',
                    'To manage databases'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'mern',
                category: 'technical',
                explanation: 'nodemon monitors for file changes and automatically restarts the Node.js application, improving development workflow.'
            },
            {
                question: 'What is prop drilling in React and how can it be avoided?',
                options: [
                    'Passing props through many levels; use Context API or Redux',
                    'A performance optimization technique',
                    'A routing strategy',
                    'A database query method'
                ],
                answer: 0,
                difficulty: 'hard',
                role: 'mern',
                category: 'technical',
                explanation: 'Prop drilling occurs when you pass props through multiple component levels. Context API or state management libraries can avoid this.'
            },

            // ==================== HR (16 questions) ====================
            {
                question: 'Tell me about a time you faced a challenging deadline. How did you handle it?',
                options: [
                    'Prioritized tasks and communicated with stakeholders',
                    'Ignored the deadline',
                    'Complained to management',
                    'Quit the project'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'hr',
                category: 'hr',
                explanation: 'Good answers demonstrate time management, prioritization, and communication skills under pressure.'
            },
            {
                question: 'Why do you want to work for this company?',
                options: [
                    'I align with the company values and growth opportunities',
                    'I just need any job',
                    'The office is close to home',
                    'I heard the salary is good'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'hr',
                category: 'hr',
                explanation: 'Show genuine interest by researching the company and aligning your answer with their mission and culture.'
            },
            {
                question: 'How do you handle conflicts with team members?',
                options: [
                    'Address issues directly with open communication',
                    'Avoid the person',
                    'Report to HR immediately',
                    'Argue until I win'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'hr',
                category: 'hr',
                explanation: 'Effective conflict resolution involves direct, respectful communication and finding mutually beneficial solutions.'
            },
            {
                question: 'Describe a situation where you showed leadership.',
                options: [
                    'Led a team project and delegated tasks effectively',
                    'Always worked alone',
                    'Only did what I was told',
                    'Avoided responsibility'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'hr',
                category: 'hr',
                explanation: 'Leadership examples should show initiative, team coordination, and achieving results through others.'
            },
            {
                question: 'What are your greatest strengths?',
                options: [
                    'Problem-solving, teamwork, and quick learning',
                    'I have no weaknesses',
                    'I am perfect at everything',
                    'I work slowly but surely'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'hr',
                category: 'hr',
                explanation: 'Choose strengths relevant to the role and provide specific examples of how you have demonstrated them.'
            },
            {
                question: 'What is your biggest weakness?',
                options: [
                    'Sometimes I focus too much on details, but I am working on balancing quality and speed',
                    'I have no weaknesses',
                    'I am always late',
                    'I can\'t work with others'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'hr',
                category: 'hr',
                explanation: 'Show self-awareness and growth by mentioning a real weakness and steps you are taking to improve.'
            },
            {
                question: 'Where do you see yourself in 5 years?',
                options: [
                    'Growing in technical expertise and taking on more responsibilities',
                    'Running my own business',
                    'I don\'t know',
                    'Retired'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'hr',
                category: 'hr',
                explanation: 'Show ambition aligned with the company\'s growth path and your career development in relevant skills.'
            },
            {
                question: 'How do you prioritize tasks when everything is urgent?',
                options: [
                    'Assess impact and deadlines, then execute systematically',
                    'Do tasks randomly',
                    'Panic and do nothing',
                    'Only work on fun tasks'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'hr',
                category: 'hr',
                explanation: 'Effective prioritization considers business impact, urgency, and dependencies, with clear communication.'
            },
            {
                question: 'Tell me about a time you failed. What did you learn?',
                options: [
                    'Missed a deadline but learned to improve planning and ask for help earlier',
                    'I never fail',
                    'I blamed others',
                    'I quit after failing'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'hr',
                category: 'hr',
                explanation: 'Show accountability, self-reflection, and growth. Emphasize lessons learned and improvements made.'
            },
            {
                question: 'Why should we hire you?',
                options: [
                    'My skills match the role and I am passionate about contributing to your mission',
                    'I need money',
                    'I am the best',
                    'Everyone else is worse'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'hr',
                category: 'hr',
                explanation: 'Highlight unique value you bring, relevant skills, and genuine enthusiasm for the role and company.'
            },
            {
                question: 'How do you stay updated with technology trends?',
                options: [
                    'Follow tech blogs, take online courses, and work on personal projects',
                    'I don\'t need to update',
                    'I only learn at work',
                    'I wait for others to teach me'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'hr',
                category: 'hr',
                explanation: 'Show continuous learning through specific resources, courses, communities, and hands-on practice.'
            },
            {
                question: 'Describe a time you went above and beyond.',
                options: [
                    'Volunteered for extra project work and delivered exceptional results',
                    'I only do what is required',
                    'I always leave work early',
                    'I avoid extra work'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'hr',
                category: 'hr',
                explanation: 'Demonstrate initiative, dedication, and positive outcomes from taking on additional responsibilities.'
            },
            {
                question: 'How do you handle constructive criticism?',
                options: [
                    'Listen actively, reflect, and use it to improve',
                    'Ignore it',
                    'Get defensive',
                    'Argue back'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'hr',
                category: 'hr',
                explanation: 'Show maturity by demonstrating openness to feedback and commitment to continuous improvement.'
            },
            {
                question: 'What motivates you at work?',
                options: [
                    'Solving challenging problems and learning new technologies',
                    'Only the paycheck',
                    'Free food',
                    'Nothing motivates me'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'hr',
                category: 'hr',
                explanation: 'Connect motivation to professional growth, impact, and aspects relevant to the role and company.'
            },
            {
                question: 'How do you handle stress and pressure?',
                options: [
                    'Break down tasks, prioritize, and take short breaks to stay focused',
                    'Avoid stressful situations',
                    'Panic',
                    'Blame others'
                ],
                answer: 0,
                difficulty: 'medium',
                role: 'hr',
                category: 'hr',
                explanation: 'Show healthy coping mechanisms, time management, and ability to maintain productivity under pressure.'
            },
            {
                question: 'Give an example of how you worked effectively in a team.',
                options: [
                    'Collaborated on project planning and communicated regularly to meet goals',
                    'I prefer working alone',
                    'I let others do all the work',
                    'I only work when supervised'
                ],
                answer: 0,
                difficulty: 'easy',
                role: 'hr',
                category: 'hr',
                explanation: 'Highlight collaboration, communication, and specific contributions that led to team success.'
            },

            // ==================== APTITUDE (15 questions) ====================
            {
                question: 'If a car travels 60 km in 1 hour, how far will it travel in 2.5 hours at the same speed?',
                options: ['150 km', '120 km', '180 km', '200 km'],
                answer: 0,
                difficulty: 'easy',
                role: 'aptitude',
                category: 'aptitude',
                explanation: 'Distance = Speed × Time = 60 km/h × 2.5 h = 150 km'
            },
            {
                question: 'What is the next number in the series: 2, 4, 8, 16, ?',
                options: ['32', '24', '20', '18'],
                answer: 0,
                difficulty: 'easy',
                role: 'aptitude',
                category: 'aptitude',
                explanation: 'Each number is multiplied by 2: 16 × 2 = 32'
            },
            {
                question: 'If 5 workers can complete a task in 12 days, how many days will 10 workers take?',
                options: ['6 days', '8 days', '10 days', '4 days'],
                answer: 0,
                difficulty: 'medium',
                role: 'aptitude',
                category: 'aptitude',
                explanation: 'More workers means less time. Inverse proportion: (5 × 12) / 10 = 6 days'
            },
            {
                question: 'A book costs $40 after a 20% discount. What was the original price?',
                options: ['$50', '$48', '$45', '$60'],
                answer: 0,
                difficulty: 'medium',
                role: 'aptitude',
                category: 'aptitude',
                explanation: 'If 80% = $40, then 100% = ($40 / 0.8) = $50'
            },
            {
                question: 'What is 15% of 200?',
                options: ['30', '25', '35', '20'],
                answer: 0,
                difficulty: 'easy',
                role: 'aptitude',
                category: 'aptitude',
                explanation: '15% of 200 = (15/100) × 200 = 30'
            },
            {
                question: 'If you flip a fair coin twice, what is the probability of getting heads both times?',
                options: ['1/4', '1/2', '1/3', '2/3'],
                answer: 0,
                difficulty: 'medium',
                role: 'aptitude',
                category: 'aptitude',
                explanation: 'Probability = (1/2) × (1/2) = 1/4'
            },
            {
                question: 'What is the missing number: 3, 9, 27, ?, 243',
                options: ['81', '72', '54', '108'],
                answer: 0,
                difficulty: 'easy',
                role: 'aptitude',
                category: 'aptitude',
                explanation: 'Each number is multiplied by 3: 27 × 3 = 81'
            },
            {
                question: 'A train 100 meters long passes a pole in 10 seconds. What is its speed in m/s?',
                options: ['10 m/s', '5 m/s', '20 m/s', '15 m/s'],
                answer: 0,
                difficulty: 'medium',
                role: 'aptitude',
                category: 'aptitude',
                explanation: 'Speed = Distance / Time = 100 m / 10 s = 10 m/s'
            },
            {
                question: 'What is the average of 10, 20, 30, 40, 50?',
                options: ['30', '25', '35', '20'],
                answer: 0,
                difficulty: 'easy',
                role: 'aptitude',
                category: 'aptitude',
                explanation: 'Average = (10 + 20 + 30 + 40 + 50) / 5 = 150 / 5 = 30'
            },
            {
                question: 'If a rectangle has length 10 cm and width 5 cm, what is its area?',
                options: ['50 cm²', '30 cm²', '25 cm²', '15 cm²'],
                answer: 0,
                difficulty: 'easy',
                role: 'aptitude',
                category: 'aptitude',
                explanation: 'Area of rectangle = Length × Width = 10 × 5 = 50 cm²'
            },
            {
                question: 'Complete the pattern: A, C, E, G, ?',
                options: ['I', 'H', 'J', 'F'],
                answer: 0,
                difficulty: 'easy',
                role: 'aptitude',
                category: 'aptitude',
                explanation: 'The pattern skips one letter each time: A(+2)C(+2)E(+2)G(+2)I'
            },
            {
                question: 'What is 25% of 80?',
                options: ['20', '15', '25', '30'],
                answer: 0,
                difficulty: 'easy',
                role: 'aptitude',
                category: 'aptitude',
                explanation: '25% of 80 = (25/100) × 80 = 20'
            },
            {
                question: 'A product costs $120 after a 25% markup. What was the cost price?',
                options: ['$96', '$100', '$90', '$85'],
                answer: 0,
                difficulty: 'medium',
                role: 'aptitude',
                category: 'aptitude',
                explanation: 'If 125% = $120, then 100% = ($120 / 1.25) = $96'
            },
            {
                question: 'How many prime numbers are there between 1 and 10?',
                options: ['4 (2, 3, 5, 7)', '3 (3, 5, 7)', '5 (1, 2, 3, 5, 7)', '2 (2, 7)'],
                answer: 0,
                difficulty: 'easy',
                role: 'aptitude',
                category: 'aptitude',
                explanation: 'Prime numbers between 1 and 10 are: 2, 3, 5, 7 (total 4 primes)'
            },
            {
                question: 'If the sum of two numbers is 50 and their difference is 10, what is the larger number?',
                options: ['30', '25', '35', '40'],
                answer: 0,
                difficulty: 'medium',
                role: 'aptitude',
                category: 'aptitude',
                explanation: 'Let numbers be x and y. x + y = 50, x - y = 10. Solving: x = 30, y = 20'
            }
        ];

        // Randomize correct answer position for every question, then insert
        const shuffledQuestions = questions.map(shuffleOptions);
        await Question.insertMany(shuffledQuestions);
        console.log('Question bank seeded successfully');
        console.log(`Total questions inserted: ${questions.length}`);

    } catch (error) {
        console.error('Error seeding questions:', error.message);
    }
};

module.exports = seedQuestions;
