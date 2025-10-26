// Comprehensive Skill Test Question Bank
// Case study based MCQs - 2 questions per skill topic
// Each question requires reasoning for the answer

module.exports = {
  // FRONTEND DEVELOPMENT
  React: [
    {
      id: 'REACT_Q1',
      question: 'You are building an e-commerce application where the product list needs to update in real-time when items are added to cart from any component. Which React pattern would be most efficient?',
      caseStudy: 'Your team is working on a shopping cart that needs to sync across multiple components: ProductList, Cart, and Checkout. Users complain about page refreshes being slow.',
      options: [
        'Use prop drilling to pass cart state through all components',
        'Implement Context API with useContext hook',
        'Store cart data in localStorage and poll it every second',
        'Use separate useState in each component and sync with API calls'
      ],
      correctAnswer: 1,
      difficulty: 'intermediate',
      points: 10,
      timeLimit: 180, // 3 minutes
      skills: ['React', 'State Management', 'Performance'],
      explanation: 'Context API provides a way to share values between components without prop drilling, perfect for global state like shopping carts.',
      evaluationCriteria: 'Should mention performance, reusability, or avoiding unnecessary re-renders'
    },
    {
      id: 'REACT_Q2',
      question: 'Your React app is experiencing performance issues when rendering a list of 10,000 items. The entire list re-renders whenever any single item is clicked. How would you optimize this?',
      caseStudy: 'A data dashboard displays thousands of rows. Users report lag when clicking on individual rows to view details. Each row is a separate component.',
      options: [
        'Use React.memo() to memoize list item components',
        'Replace functional components with class components',
        'Split the list into multiple smaller components',
        'Disable React StrictMode in production'
      ],
      correctAnswer: 0,
      difficulty: 'advanced',
      points: 10,
      timeLimit: 180,
      skills: ['React', 'Performance Optimization', 'Memoization'],
      explanation: 'React.memo() prevents unnecessary re-renders of components when props haven\'t changed, significantly improving performance for large lists.',
      evaluationCriteria: 'Should discuss when memoization is appropriate and potential trade-offs'
    }
  ],

  NodeJS: [
    {
      id: 'NODE_Q1',
      question: 'Your Node.js API server crashes under high load (1000+ concurrent requests). Memory usage spikes before crash. What is the most likely cause and solution?',
      caseStudy: 'An e-learning platform API serves course content. During exam periods with 5000+ students, the server crashes. Logs show increasing memory before crash.',
      options: [
        'Memory leak - implement proper connection pooling and close DB connections',
        'CPU bottleneck - upgrade server hardware',
        'Too many routes - reduce API endpoints',
        'JavaScript is single-threaded - rewrite in Java'
      ],
      correctAnswer: 0,
      difficulty: 'advanced',
      points: 10,
      timeLimit: 240,
      skills: ['Node.js', 'Memory Management', 'Scalability'],
      explanation: 'Memory leaks often occur from unclosed database connections. Connection pooling reuses connections and prevents memory buildup.',
      evaluationCriteria: 'Should mention connection pooling, garbage collection, or monitoring tools like clinic.js'
    },
    {
      id: 'NODE_Q2',
      question: 'You need to process uploaded CSV files (100MB+) containing user data. Which approach prevents server timeout and memory issues?',
      caseStudy: 'HR system allows bulk employee upload via CSV. Files contain 50,000+ rows. Current implementation loads entire file into memory and times out.',
      options: [
        'Increase server timeout limits and RAM allocation',
        'Use Stream API to process file in chunks',
        'Split file on client-side before upload',
        'Use worker threads to process entire file in background'
      ],
      correctAnswer: 1,
      difficulty: 'intermediate',
      points: 10,
      timeLimit: 180,
      skills: ['Node.js', 'Streams', 'File Processing'],
      explanation: 'Node.js Streams process data in chunks without loading everything into memory, ideal for large files.',
      evaluationCriteria: 'Should explain streaming vs loading into memory and mention backpressure handling'
    }
  ],

  MongoDB: [
    {
      id: 'MONGO_Q1',
      question: 'A social media app query to fetch user posts with comments and likes takes 15+ seconds. Posts collection has 10M documents. How would you optimize?',
      caseStudy: 'Query: db.posts.find({userId: "123"}).populate("comments").populate("likes"). Users see loading spinners for too long.',
      options: [
        'Add compound index on userId and createdAt fields',
        'Denormalize data by embedding comments in posts',
        'Switch to MySQL for better JOIN performance',
        'Cache all posts in Redis'
      ],
      correctAnswer: 0,
      difficulty: 'advanced',
      points: 10,
      timeLimit: 240,
      skills: ['MongoDB', 'Indexing', 'Query Optimization'],
      explanation: 'Compound indexes dramatically speed up queries on frequently searched field combinations. Embedding would cause document size issues.',
      evaluationCriteria: 'Should discuss index strategy, query patterns, or explain/analyze command usage'
    },
    {
      id: 'MONGO_Q2',
      question: 'Your application needs to ensure that either both "debit account A" and "credit account B" operations succeed, or neither happens. How would you implement this in MongoDB?',
      caseStudy: 'Banking app transfers money between accounts. Previously, money was deducted from source but network failure prevented crediting destination.',
      options: [
        'Use MongoDB transactions with startSession()',
        'Implement application-level rollback logic',
        'Use findAndModify with upsert:true',
        'MongoDB doesn\'t support this - use PostgreSQL'
      ],
      correctAnswer: 0,
      difficulty: 'intermediate',
      points: 10,
      timeLimit: 180,
      skills: ['MongoDB', 'Transactions', 'ACID'],
      explanation: 'MongoDB supports multi-document ACID transactions using sessions, ensuring atomicity across multiple operations.',
      evaluationCriteria: 'Should mention ACID properties, session handling, or error handling in transactions'
    }
  ],

  Python: [
    {
      id: 'PYTHON_Q1',
      question: 'Your Flask API endpoint takes 5 seconds to return results because it makes 10 sequential database queries. How would you optimize this without changing the database?',
      caseStudy: 'Dashboard API fetches: user info, recent orders, order items, shipping info, payment info - each from different tables sequentially.',
      options: [
        'Use asyncio with async/await to make concurrent queries',
        'Cache all database responses in Redis',
        'Reduce number of queries by fetching less data',
        'Switch to Django ORM for better performance'
      ],
      correctAnswer: 0,
      difficulty: 'advanced',
      points: 10,
      timeLimit: 240,
      skills: ['Python', 'Async Programming', 'Performance'],
      explanation: 'Asyncio enables concurrent I/O operations, allowing multiple DB queries to run in parallel rather than sequentially.',
      evaluationCriteria: 'Should explain async/await, event loop, or mention async DB drivers'
    },
    {
      id: 'PYTHON_Q2',
      question: 'You are processing a list of 1 million records and need to filter, transform, and aggregate data. Which approach is most memory-efficient?',
      caseStudy: 'ETL job processes customer transaction logs. Current list comprehension loads all 1M records into memory causing OOM errors on production server.',
      options: [
        'Use generator expressions instead of list comprehensions',
        'Increase Python heap size using gc module',
        'Split into smaller lists of 100k each',
        'Use pandas DataFrame for better performance'
      ],
      correctAnswer: 0,
      difficulty: 'intermediate',
      points: 10,
      timeLimit: 180,
      skills: ['Python', 'Memory Optimization', 'Generators'],
      explanation: 'Generators yield items one at a time without storing the entire list in memory, ideal for large datasets.',
      evaluationCriteria: 'Should explain lazy evaluation, memory usage difference, or mention itertools'
    }
  ],

  'Machine Learning': [
    {
      id: 'ML_Q1',
      question: 'Your classification model achieves 95% accuracy but users complain it never detects fraud cases (only 2% of data). What is the issue and solution?',
      caseStudy: 'Credit card fraud detection model trained on 1M transactions: 980k legitimate, 20k fraud. Model predicts "legitimate" for almost everything.',
      options: [
        'Imbalanced dataset - use SMOTE, class weights, or stratified sampling',
        'Model is working fine - 95% accuracy is excellent',
        'Increase training epochs to 1000+',
        'Switch from Random Forest to Neural Network'
      ],
      correctAnswer: 0,
      difficulty: 'advanced',
      points: 10,
      timeLimit: 300,
      skills: ['Machine Learning', 'Class Imbalance', 'Model Evaluation'],
      explanation: 'Accuracy is misleading for imbalanced data. The model achieves 95% by always predicting majority class. Need to balance classes or adjust metrics.',
      evaluationCriteria: 'Should mention F1-score, precision/recall, ROC-AUC, or resampling techniques'
    },
    {
      id: 'ML_Q2',
      question: 'Your neural network training loss decreases but validation loss increases after epoch 10. Training continues to epoch 100. What is happening and how to fix?',
      caseStudy: 'Image classification model for medical diagnosis. Training accuracy: 98%, Validation accuracy: 62%. Model performs poorly on new patient images.',
      options: [
        'Overfitting - implement early stopping and regularization (dropout, L2)',
        'Underfitting - add more layers and increase model complexity',
        'Validation set is too small - ignore validation loss',
        'Learning rate is too low - increase it significantly'
      ],
      correctAnswer: 0,
      difficulty: 'advanced',
      points: 10,
      timeLimit: 300,
      skills: ['Machine Learning', 'Overfitting', 'Regularization'],
      explanation: 'Diverging train/validation loss indicates overfitting. Model memorizes training data but fails to generalize. Early stopping prevents this.',
      evaluationCriteria: 'Should explain overfitting vs underfitting, mention regularization techniques, or cross-validation'
    }
  ],

  Docker: [
    {
      id: 'DOCKER_Q1',
      question: 'Your Docker image size is 2.5GB and takes 15 minutes to deploy. The app is a simple Node.js API. How would you reduce image size?',
      caseStudy: 'Dockerfile uses FROM node:latest, installs dev dependencies, copies entire project including node_modules, tests, and .git folder.',
      options: [
        'Use multi-stage builds, alpine base image, and .dockerignore',
        'Compress the image with gzip before deploying',
        'Use docker image prune regularly',
        'Switch to Kubernetes for better deployment'
      ],
      correctAnswer: 0,
      difficulty: 'intermediate',
      points: 10,
      timeLimit: 240,
      skills: ['Docker', 'Optimization', 'DevOps'],
      explanation: 'Multi-stage builds separate build and runtime, alpine reduces base size, .dockerignore excludes unnecessary files - combined can reduce GB to MB.',
      evaluationCriteria: 'Should explain multi-stage benefits, layer caching, or mention specific alpine advantages'
    },
    {
      id: 'DOCKER_Q2',
      question: 'Your dockerized app loses all user-uploaded files when container restarts. How would you persist this data?',
      caseStudy: 'Photo sharing app stores uploads in /app/uploads directory. After deployment update, all user photos are gone. Users are complaining.',
      options: [
        'Use Docker volumes to mount /app/uploads to host filesystem',
        'Store files in the Docker image itself',
        'Use environment variables to save file paths',
        'Disable container auto-restart to prevent data loss'
      ],
      correctAnswer: 0,
      difficulty: 'intermediate',
      points: 10,
      timeLimit: 180,
      skills: ['Docker', 'Data Persistence', 'Volumes'],
      explanation: 'Docker volumes persist data outside container lifecycle. Files in volumes survive container restarts, deletions, and updates.',
      evaluationCriteria: 'Should explain volumes vs bind mounts, volume drivers, or backup strategies'
    }
  ],

  AWS: [
    {
      id: 'AWS_Q1',
      question: 'Your application serves users globally but users in Asia report 3-second load times while US users see 200ms. Architecture: Single EC2 in us-east-1, RDS database, static assets in S3. How to optimize for global users?',
      caseStudy: 'SaaS application used by customers worldwide. Asian users complaining about slow dashboard loading. 80% of payload is static JavaScript bundles.',
      options: [
        'Use CloudFront CDN for static assets and consider multi-region deployment',
        'Upgrade EC2 instance type to larger size',
        'Move everything to S3 static hosting',
        'Tell Asian users to upgrade their internet connection'
      ],
      correctAnswer: 0,
      difficulty: 'advanced',
      points: 10,
      timeLimit: 300,
      skills: ['AWS', 'CDN', 'Global Architecture'],
      explanation: 'CloudFront caches content at edge locations worldwide, dramatically reducing latency for global users. Multi-region adds redundancy.',
      evaluationCriteria: 'Should discuss edge locations, latency reduction, or mention Route53 for routing'
    },
    {
      id: 'AWS_Q2',
      question: 'Your AWS bill jumped from $500 to $5000 this month. CloudWatch shows an EC2 instance making 1M S3 GET requests/hour. The app is a simple blog. What likely happened and how to fix?',
      caseStudy: 'Static blog with images stored in S3. Each page load fetches the same logo image from S3. Recent traffic spike from viral post.',
      options: [
        'Infinite loop in code requesting S3 - add caching and fix application logic',
        'S3 pricing increased - switch to cheaper storage',
        'This is normal cost for viral traffic - accept it',
        'EC2 instance is hacked - terminate it immediately'
      ],
      correctAnswer: 0,
      difficulty: 'intermediate',
      points: 10,
      timeLimit: 240,
      skills: ['AWS', 'Cost Optimization', 'Debugging'],
      explanation: 'Repetitive S3 requests indicate missing caching. Adding CloudFront and browser caching would reduce requests by 99%+ and costs dramatically.',
      evaluationCriteria: 'Should mention caching strategies, CloudWatch alarms, or S3 request pricing'
    }
  ],

  Git: [
    {
      id: 'GIT_Q1',
      question: 'You accidentally committed AWS credentials to GitHub in a public repo. The commit is 50 commits back. What is the correct action?',
      caseStudy: 'Team member pushed .env file with production database credentials. Repo has 100+ stars. Simply deleting the file in new commit won\'t remove it from history.',
      options: [
        'Immediately rotate credentials, use git filter-branch/BFG to remove from history, force push',
        'Delete the file and make a new commit with "removed credentials"',
        'Delete the entire repository and create a new one',
        'Make the repository private to hide the credentials'
      ],
      correctAnswer: 0,
      difficulty: 'advanced',
      points: 10,
      timeLimit: 240,
      skills: ['Git', 'Security', 'Version Control'],
      explanation: 'Credentials in history are still accessible. Must rewrite history to remove AND rotate credentials as they may already be compromised.',
      evaluationCriteria: 'Should emphasize security implications, mention git-secrets, or discuss prevention strategies'
    },
    {
      id: 'GIT_Q2',
      question: 'Your team\'s main branch has diverged from your feature branch. You have 10 commits that aren\'t in main, main has 15 commits you don\'t have. What strategy should you use?',
      caseStudy: 'Working on feature for 2 weeks while team made multiple hotfixes to main. Need to integrate changes without messy merge commits. Team prefers linear history.',
      options: [
        'Use git rebase main to replay your commits on top of latest main',
        'Use git merge main to combine histories',
        'Delete your branch and start over from main',
        'Use git cherry-pick for each commit individually'
      ],
      correctAnswer: 0,
      difficulty: 'intermediate',
      points: 10,
      timeLimit: 180,
      skills: ['Git', 'Branching Strategy', 'Collaboration'],
      explanation: 'Rebase creates a linear history by replaying your commits on top of main, cleaner than merge commits for long-running branches.',
      evaluationCriteria: 'Should explain rebase vs merge trade-offs, mention force-push implications, or conflict resolution'
    }
  ],

  SQL: [
    {
      id: 'SQL_Q1',
      question: 'Query to find "top 10 customers by total purchase amount" takes 45 seconds on a 5M row orders table. Current query: SELECT customer_id, SUM(amount) FROM orders GROUP BY customer_id ORDER BY SUM(amount) DESC LIMIT 10. How to optimize?',
      caseStudy: 'E-commerce dashboard shows top buyers. Query runs every page load. Users see timeout errors during peak hours.',
      options: [
        'Add index on customer_id and amount columns, consider materialized view',
        'Use LIMIT without ORDER BY for faster results',
        'Split query into smaller date ranges',
        'Increase database server RAM'
      ],
      correctAnswer: 0,
      difficulty: 'advanced',
      points: 10,
      timeLimit: 300,
      skills: ['SQL', 'Query Optimization', 'Indexing'],
      explanation: 'Index on customer_id speeds up grouping. Materialized view pre-computes aggregates. Both dramatically reduce query time.',
      evaluationCriteria: 'Should discuss covering indexes, execution plans, or partitioning strategies'
    },
    {
      id: 'SQL_Q2',
      question: 'Your application needs to store money values (prices, balances). You\'re debating between DECIMAL(10,2) and FLOAT. Which should you use for financial data?',
      caseStudy: 'Banking application stores account balances. Some test runs showed: $100.00 - $99.99 = $0.009999999 instead of $0.01 with FLOAT type.',
      options: [
        'Use DECIMAL(10,2) for exact precision in financial calculations',
        'Use FLOAT for better performance',
        'Use VARCHAR to store as strings',
        'Use INTEGER and store cents (multiply by 100)'
      ],
      correctAnswer: 0,
      difficulty: 'intermediate',
      points: 10,
      timeLimit: 180,
      skills: ['SQL', 'Data Types', 'Financial Systems'],
      explanation: 'FLOAT uses binary representation causing rounding errors. DECIMAL stores exact decimal values, critical for financial accuracy.',
      evaluationCriteria: 'Should explain floating-point precision issues or mention regulatory compliance'
    }
  ],

  JavaScript: [
    {
      id: 'JS_Q1',
      question: 'You have an array of 10,000 objects and need to find items matching a condition. The search happens 1000+ times per second. Current code uses array.filter(). How to optimize?',
      caseStudy: 'Real-time stock trading app searches for stocks by symbol. Users type in search box, triggering search on every keystroke. UI freezes during typing.',
      options: [
        'Convert array to Map/Object for O(1) lookup instead of O(n) filter',
        'Use array.find() instead of filter for better performance',
        'Reduce array size by deleting unused items',
        'Use Web Workers to run filter in background'
      ],
      correctAnswer: 0,
      difficulty: 'advanced',
      points: 10,
      timeLimit: 240,
      skills: ['JavaScript', 'Data Structures', 'Performance'],
      explanation: 'Map provides O(1) constant-time lookup vs O(n) linear search. For frequent lookups on large datasets, the difference is massive.',
      evaluationCriteria: 'Should explain Big O notation, hash table concepts, or mention debouncing search input'
    },
    {
      id: 'JS_Q2',
      question: 'Your async function sometimes returns undefined even though the API call succeeds. Code: async function getData() { fetch("/api/data").then(d => d.json()) }. What\'s wrong?',
      caseStudy: 'Frontend intermittently displays "undefined" in user profile. API logs show successful 200 responses. Data exists in response.',
      options: [
        'Missing return statement - should return fetch().then() or use await',
        'API is returning undefined - fix backend',
        'fetch() requires await keyword always',
        'Need to add .catch() handler'
      ],
      correctAnswer: 0,
      difficulty: 'intermediate',
      points: 10,
      timeLimit: 180,
      skills: ['JavaScript', 'Async/Await', 'Promises'],
      explanation: 'Async functions return promises. Without returning the promise chain or awaiting, the function returns undefined before fetch completes.',
      evaluationCriteria: 'Should explain promise chains, async/await mechanics, or implicit returns'
    }
  ],

  'UI/UX Design': [
    {
      id: 'UIUX_Q1',
      question: 'User testing shows 60% of users can\'t find the "Checkout" button on mobile. The button is bright green and says "Complete Purchase Now". What is likely the issue?',
      caseStudy: 'E-commerce app has low mobile conversion. Desktop conversion is fine. Heat maps show users scrolling past checkout button. Button is above the fold.',
      options: [
        'Button suffers from "banner blindness" - consider size, position, and visual hierarchy',
        'Green is wrong color - change to red for urgency',
        'Text is too long - shorten to just "Buy"',
        'Mobile users don\'t want to buy - remove mobile support'
      ],
      correctAnswer: 0,
      difficulty: 'intermediate',
      points: 10,
      timeLimit: 240,
      skills: ['UI/UX Design', 'User Testing', 'Conversion Optimization'],
      explanation: 'Banner blindness causes users to ignore prominent elements they perceive as ads. Position, surrounding elements, and visual hierarchy matter more than color.',
      evaluationCriteria: 'Should mention F-pattern reading, visual weight, or A/B testing methodology'
    },
    {
      id: 'UIUX_Q2',
      question: 'Your signup form has 15 fields. Completion rate is 12%. Industry average is 60-80%. Which UX principle would most improve this?',
      caseStudy: 'SaaS product signup asks for: name, email, phone, company, address, tax ID, payment method, 3 security questions, and employment history. Users abandon at field 4-5.',
      options: [
        'Progressive disclosure - multi-step form collecting essential fields first',
        'Add more validation to ensure data quality',
        'Make all fields required with asterisks',
        'Reduce font size to fit all fields above fold'
      ],
      correctAnswer: 0,
      difficulty: 'intermediate',
      points: 10,
      timeLimit: 180,
      skills: ['UI/UX Design', 'Form Design', 'User Psychology'],
      explanation: 'Progressive disclosure reduces cognitive load by showing only necessary fields initially. Multi-step forms have higher completion rates for long forms.',
      evaluationCriteria: 'Should discuss cognitive load, completion rate metrics, or mention Hick\'s Law'
    }
  ],

  REST_API: [
    {
      id: 'API_Q1',
      question: 'Your API endpoint /api/users/:id/posts/:postId/comments/:commentId/replies is called frequently. What RESTful design principle is being violated?',
      caseStudy: 'Social media API has deeply nested resources. Frontend makes multiple chained requests. Response times are slow due to multiple DB joins.',
      options: [
        'Over-nesting resources - replies should be /api/replies/:id with query params for filtering',
        'Not using HTTPS - security issue',
        'Missing API versioning in URL',
        'Should use GraphQL instead of REST'
      ],
      correctAnswer: 0,
      difficulty: 'advanced',
      points: 10,
      timeLimit: 240,
      skills: ['REST API', 'API Design', 'Backend Architecture'],
      explanation: 'Deep nesting creates tight coupling and complex routes. RESTful design favors flat resource structures with query parameters for relationships.',
      evaluationCriteria: 'Should mention resource-oriented design, query parameters, or HATEOAS principles'
    },
    {
      id: 'API_Q2',
      question: 'Your API returns 200 OK when creating a user fails due to duplicate email. What HTTP status code should you return instead?',
      caseStudy: 'Mobile app shows "User created successfully" but backend logs show duplicate key error. Users try to login with new password and fail.',
      options: [
        '409 Conflict - indicates resource already exists',
        '200 OK is correct - always return 200 for successful HTTP request',
        '500 Internal Server Error - database error occurred',
        '404 Not Found - email not found in request'
      ],
      correctAnswer: 0,
      difficulty: 'intermediate',
      points: 10,
      timeLimit: 180,
      skills: ['REST API', 'HTTP Status Codes', 'Error Handling'],
      explanation: '409 Conflict indicates the request conflicts with current state (duplicate). 200 OK should only be used when operation actually succeeds.',
      evaluationCriteria: 'Should explain proper use of status codes or mention idempotency'
    }
  ]
};

// Helper function to get random questions for a test
module.exports.generateSkillTest = function(skills, questionsPerSkill = 2) {
  const allQuestions = module.exports;
  const selectedQuestions = [];
  
  skills.forEach(skill => {
    if (allQuestions[skill] && Array.isArray(allQuestions[skill])) {
      const skillQuestions = allQuestions[skill].slice(0, questionsPerSkill);
      selectedQuestions.push(...skillQuestions);
    }
  });
  
  return {
    questions: selectedQuestions,
    totalPoints: selectedQuestions.reduce((sum, q) => sum + q.points, 0),
    totalTime: selectedQuestions.reduce((sum, q) => sum + q.timeLimit, 0)
  };
};
