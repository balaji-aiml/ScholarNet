import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Connection from './models/Connection.js';
import Event from './models/Event.js';
import Message from './models/Message.js';

const domain = process.env.CAMPUS_EMAIL_DOMAIN || 'campus.edu';
const PASSWORD = 'password123';
const day = (n, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return d;
};

await connectDB();
await mongoose.connection.dropDatabase();
await Promise.all([User, Connection, Event, Message].map((m) => m.syncIndexes()));
const u = (name, role, department, year, skills, interests, bio) => ({
  name, role, department, year, skills, interests, bio, password: PASSWORD,
  email: `${name.split(' ')[0].toLowerCase()}@${domain}`,
});

const [admin, meera, rohan, tanvi, arjun, divya, karthik, sana, vikram, lakshmi] = await User.create([
  u('Campus Admin', 'admin', 'Information Technology', 4, ['moderation'], ['campus life'], 'Runs the notice board.'),
  u('Meera Iyer', 'senior', 'Computer Science', 4, ['React', 'Node.js', 'MongoDB'], ['hackathons', 'open source'], 'Final year. Happy to review your projects and resumes.'),
  u('Rohan Nair', 'senior', 'AI & ML', 4, ['Python', 'PyTorch', 'Data Analysis'], ['research', 'kaggle'], 'Placement coordinator for AI & ML.'),
  u('Tanvi Shah', 'senior', 'Electronics', 4, ['Embedded C', 'IoT', 'PCB Design'], ['robotics', 'photography'], 'Robotics club lead.'),
  u('Arjun Das', 'student', 'Computer Science', 2, ['JavaScript', 'HTML/CSS'], ['web dev', 'football'], 'Learning the MERN stack.'),
  u('Divya Menon', 'student', 'AI & ML', 3, ['Python', 'Pandas', 'scikit-learn'], ['machine learning', 'chess'], 'Looking for a project partner.'),
  u('Karthik Raj', 'student', 'Mechanical', 1, ['CAD', 'SolidWorks'], ['drones', 'cricket'], 'First year, curious about everything.'),
  u('Sana Fatima', 'student', 'Information Technology', 3, ['Java', 'Spring Boot', 'SQL'], ['backend', 'debate'], 'Preparing for placements.'),
  u('Vikram Singh', 'student', 'Electrical', 2, ['MATLAB', 'Arduino'], ['EVs', 'music'], 'Building a small EV charger.'),
  u('Lakshmi Priya', 'student', 'Computer Science', 4, ['Python', 'Django', 'Docker'], ['cloud', 'UI design'], 'Open to referrals and mentoring.'),
]);

const link = (a, b, status = 'accepted') => ({ requester: a._id, recipient: b._id, status });
await Connection.create([
  link(arjun, meera), link(divya, rohan), link(arjun, divya), link(sana, meera),
  link(lakshmi, rohan), link(karthik, tanvi), link(vikram, tanvi),
  link(arjun, rohan, 'pending'), link(sana, divya, 'pending'), link(meera, lakshmi, 'pending'),
]);

const events = await Event.create([
  { title: 'Hack the Campus 2026', category: 'club', date: day(5, 9), location: 'Innovation Lab, Block C', organizer: meera._id,
    description: '24-hour hackathon open to all departments. Teams of 3-4. Mentors from alumni working in product companies will be around all night.' },
  { title: 'Resume & LinkedIn Clinic', category: 'career', date: day(3, 15), location: 'Seminar Hall 2', organizer: rohan._id,
    description: 'Bring your resume. Seniors who cleared placements last year will review it one-on-one.' },
  { title: 'Intro to Embedded Systems Workshop', category: 'workshop', date: day(8, 10), location: 'Electronics Lab', organizer: tanvi._id,
    description: 'Hands-on session with Arduino and ESP32. Kits provided, limited to 40 seats.' },
  { title: 'Inter-Department Football League', category: 'sports', date: day(12, 16), location: 'Main Ground', organizer: admin._id,
    description: 'Register your department team with the sports office by Friday. Fixtures will be shared on this board.' },
  { title: 'Cultural Night: Rhythms', category: 'cultural', date: day(20, 18), location: 'Open Air Theatre', organizer: admin._id,
    description: 'Music, dance and a student-run food street. Performance slots are still open.' },
  { title: 'Machine Learning Reading Group', category: 'academic', date: day(2, 17), location: 'Library Discussion Room', organizer: rohan._id,
    description: 'This week: attention mechanisms. Read the paper beforehand if you can. Beginners welcome.' },
  { title: 'Alumni Talk: Life at a Startup', category: 'career', date: day(-6, 14), location: 'Auditorium', organizer: meera._id,
    description: 'Recording and slides will be shared with registered attendees.' },
]);

events[0].likes = [arjun._id, divya._id, sana._id, lakshmi._id];
events[0].comments.push(
  { user: arjun._id, text: 'Is there a team-matching round for people without a team?' },
  { user: meera._id, text: 'Yes! We will match solo registrations at the kickoff.' }
);
events[1].likes = [sana._id, vikram._id];
events[5].likes = [divya._id];
await Promise.all(events.map((e) => e.save()));

const at = (mins) => new Date(Date.now() - mins * 60000);
await Message.create([
  { sender: arjun._id, recipient: meera._id, text: 'Hi Meera, could you review my portfolio site?', read: true, createdAt: at(120) },
  { sender: meera._id, recipient: arjun._id, text: 'Sure! Send me the link. Also check out the hackathon next week.', read: true, createdAt: at(110) },
  { sender: arjun._id, recipient: meera._id, text: 'Will do. Thanks!', read: false, createdAt: at(100) },
  { sender: divya._id, recipient: rohan._id, text: 'Sir, which resources do you suggest for starting with Kaggle?', read: false, createdAt: at(30) },
]);

console.log(`Seeded ${await User.countDocuments()} users, ${await Event.countDocuments()} events.`);
console.log(`Login: arjun@${domain} (student), meera@${domain} (senior), campus@${domain} (admin). Password for all: ${PASSWORD}`);
await mongoose.disconnect();
