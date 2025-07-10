const mongoose = require('mongoose');
const { User, Resume } = require('./schema');
const faker = require('faker');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: '../backend/config.env' });

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('DB connection successful!'));

// Delete all existing data
const cleanDB = async () => {
  await User.deleteMany();
  await Resume.deleteMany();
  console.log('Database cleaned');
};

// Create sample users
const createUsers = async (count = 5) => {
  const users = [];
  const password = await bcrypt.hash('password123', 12);

  // Create admin user
  users.push({
    name: 'Admin User',
    email: 'admin@intellimatch.com',
    password,
    role: 'admin',
    phone: '+15551234567',
    linkedin: 'https://linkedin.com/in/admin',
    github: 'https://github.com/admin'
  });

  // Create regular users
  for (let i = 0; i < count - 1; i++) {
    users.push({
      name: faker.name.findName(),
      email: faker.internet.email().toLowerCase(),
      password,
      phone: faker.phone.phoneNumber(),
      linkedin: `https://linkedin.com/in/${faker.internet.userName()}`,
      github: `https://github.com/${faker.internet.userName()}`
    });
  }

  await User.create(users);
  console.log(`${users.length} users created`);
  return User.find();
};

// Create sample resumes
const createResumes = async (users) => {
  const resumes = [];
  const jobTitles = [
    'Software Engineer', 
    'Product Manager',
    'Data Scientist',
    'UX Designer',
    'DevOps Engineer'
  ];
  const skills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'AWS',
    'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'GraphQL'
  ];

  for (const user of users) {
    const resumeCount = faker.datatype.number({ min: 1, max: 3 });
    
    for (let i = 0; i < resumeCount; i++) {
      const experienceCount = faker.datatype.number({ min: 1, max: 3 });
      const experiences = [];
      
      for (let j = 0; j < experienceCount; j++) {
        experiences.push({
          role: jobTitles[j % jobTitles.length],
          company: faker.company.companyName(),
          period: `${faker.date.past(2).getFullYear()} - ${faker.date.recent().getFullYear()}`,
          bullets: [
            faker.lorem.sentence(),
            faker.lorem.sentence(),
            faker.lorem.sentence()
          ]
        });
      }

      const resume = {
        user: user._id,
        name: `${user.name.split(' ')[0]}'s Resume ${i + 1}`,
        fileUrl: `https://s3.amazonaws.com/intellimatch-resumes/${user._id}_${i}.pdf`,
        originalName: `resume_${user._id}_${i}.pdf`,
        content: {
          name: user.name,
          title: jobTitles[i % jobTitles.length],
          contact: `${user.email} | ${user.phone}`,
          summary: faker.lorem.paragraph(),
          experience: experiences,
          education: [{
            degree: faker.random.arrayElement(['B.S.', 'M.S.', 'Ph.D.']) + ' ' + 
                   faker.random.arrayElement(['Computer Science', 'Engineering', 'Mathematics']),
            school: faker.company.companyName() + ' University',
            year: faker.date.past(10).getFullYear()
          }],
          skills: faker.helpers.shuffle(skills).slice(0, 5),
          projects: [{
            name: faker.commerce.productName() + ' Project',
            description: faker.lorem.sentences(2),
            technologies: faker.helpers.shuffle(skills).slice(0, 3)
          }]
        },
        isPublic: faker.datatype.boolean(),
        atsScore: faker.datatype.number({ min: 60, max: 95 })
      };

      resumes.push(resume);
    }
  }

  await Resume.create(resumes);
  console.log(`${resumes.length} resumes created`);
};

// Main seeding function
const seedDB = async () => {
  try {
    await cleanDB();
    const users = await createUsers();
    await createResumes(users);
    console.log('Database seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

// Run seeding
seedDB();