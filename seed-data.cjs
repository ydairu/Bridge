// Firebase Seed Data Script
// Run this script to populate your Firebase database with realistic test data
// Usage: node seed-data.js

const admin = require('firebase-admin');
const serviceAccount = require('./firebase_private_key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper function to create random date in the last N days
function randomDate(daysAgo) {
  const now = new Date();
  const past = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  const random = new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
  return admin.firestore.Timestamp.fromDate(random);
}

// Helper function to shuffle array
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Jobseekers Data
const jobseekers = [
  {
    name: "Ahmad Rahman",
    email: "ahmad.rahman@email.com",
    password: "Password123!",
    skills: ["Scaffolding", "Height Work", "Safety Protocols"],
    experience: "5 years",
    location: "Jurong West",
    phone: "+65 9123 4567",
    bio: "Experienced scaffolder with strong safety record and expertise in high-rise construction."
  },
  {
    name: "Kumar Selvam",
    email: "kumar.selvam@email.com",
    password: "Password123!",
    skills: ["Welding", "Metal Fabrication", "Blueprint Reading"],
    experience: "7 years",
    location: "Woodlands",
    phone: "+65 9234 5678",
    bio: "Certified welder specializing in structural steel and metal fabrication work."
  },
  {
    name: "Liu Wei",
    email: "liu.wei@email.com",
    password: "Password123!",
    skills: ["Concrete Work", "Foundation", "Masonry"],
    experience: "4 years",
    location: "Tampines",
    phone: "+65 9345 6789",
    bio: "Skilled in concrete work and foundation construction with attention to detail."
  },
  {
    name: "Mohammad Hasan",
    email: "m.hasan@email.com",
    password: "Password123!",
    skills: ["Electrical Installation", "Wiring", "Safety Compliance"],
    experience: "6 years",
    location: "Clementi",
    phone: "+65 9456 7890",
    bio: "Licensed electrician with extensive experience in commercial electrical systems."
  },
  {
    name: "Raj Patel",
    email: "raj.patel@email.com",
    password: "Password123!",
    skills: ["Plumbing", "Pipe Fitting", "Water Systems"],
    experience: "5 years",
    location: "Bedok",
    phone: "+65 9567 8901",
    bio: "Professional plumber experienced in residential and commercial installations."
  },
  {
    name: "Nguyen Van",
    email: "nguyen.van@email.com",
    password: "Password123!",
    skills: ["Carpentry", "Formwork", "Finishing"],
    experience: "8 years",
    location: "Yishun",
    phone: "+65 9678 9012",
    bio: "Master carpenter with expertise in formwork and high-quality finishing work."
  },
  {
    name: "Suresh Kumar",
    email: "suresh.kumar@email.com",
    password: "Password123!",
    skills: ["Heavy Machinery", "Crane Operation", "Site Safety"],
    experience: "10 years",
    location: "Jurong East",
    phone: "+65 9789 0123",
    bio: "Experienced crane operator with valid licenses and excellent safety record."
  },
  {
    name: "Abdul Malik",
    email: "abdul.malik@email.com",
    password: "Password123!",
    skills: ["Painting", "Surface Preparation", "Coating Application"],
    experience: "3 years",
    location: "Hougang",
    phone: "+65 9890 1234",
    bio: "Detail-oriented painter skilled in surface preparation and professional finishing."
  },
  {
    name: "Chen Ming",
    email: "chen.ming@email.com",
    password: "Password123!",
    skills: ["Tile Setting", "Flooring", "Finishing Work"],
    experience: "6 years",
    location: "Ang Mo Kio",
    phone: "+65 9901 2345",
    bio: "Expert tile setter with precision skills in various flooring applications."
  },
  {
    name: "Ravi Shankar",
    email: "ravi.shankar@email.com",
    password: "Password123!",
    skills: ["Steel Fixing", "Reinforcement", "Structural Work"],
    experience: "7 years",
    location: "Bukit Batok",
    phone: "+65 9012 3456",
    bio: "Skilled steel fixer specializing in structural reinforcement for large projects."
  },
  {
    name: "Zhang Wei",
    email: "zhang.wei@email.com",
    password: "Password123!",
    skills: ["HVAC Installation", "Air Conditioning", "Ventilation"],
    experience: "5 years",
    location: "Sengkang",
    phone: "+65 9123 4568",
    bio: "HVAC technician with expertise in commercial air conditioning systems."
  },
  {
    name: "Arjun Singh",
    email: "arjun.singh@email.com",
    password: "Password123!",
    skills: ["General Construction", "Site Work", "Team Coordination"],
    experience: "4 years",
    location: "Punggol",
    phone: "+65 9234 5679",
    bio: "Versatile construction worker with strong teamwork and coordination skills."
  },
  {
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    password: "Password123!",
    skills: ["Excavation", "Earth Moving", "Site Preparation"],
    experience: "6 years",
    location: "Choa Chu Kang",
    phone: "+65 9345 6780",
    bio: "Experienced in excavation and site preparation for major construction projects."
  },
  {
    name: "Amir Hassan",
    email: "amir.hassan@email.com",
    password: "Password123!",
    skills: ["Roofing", "Waterproofing", "Height Work"],
    experience: "5 years",
    location: "Pasir Ris",
    phone: "+65 9456 7891",
    bio: "Roofing specialist with expertise in waterproofing and high-altitude work."
  },
  {
    name: "Vikram Kumar",
    email: "vikram.kumar@email.com",
    password: "Password123!",
    skills: ["Demolition", "Site Clearing", "Safety Management"],
    experience: "8 years",
    location: "Sembawang",
    phone: "+65 9567 8902",
    bio: "Safety-focused demolition expert with extensive experience in controlled demolition."
  },
  {
    name: "Li Jun",
    email: "li.jun@email.com",
    password: "Password123!",
    skills: ["Glass Installation", "Glazing", "Facade Work"],
    experience: "4 years",
    location: "Bishan",
    phone: "+65 9678 9013",
    bio: "Specialist in glass installation and modern facade systems."
  },
  {
    name: "Muhamad Rizal",
    email: "m.rizal@email.com",
    password: "Password123!",
    skills: ["Forklift Operation", "Warehouse", "Logistics"],
    experience: "3 years",
    location: "Tuas",
    phone: "+65 9789 0124",
    bio: "Licensed forklift operator with experience in construction logistics."
  },
  {
    name: "Prakash Rao",
    email: "prakash.rao@email.com",
    password: "Password123!",
    skills: ["Site Supervision", "Quality Control", "Team Management"],
    experience: "9 years",
    location: "Queenstown",
    phone: "+65 9890 1235",
    bio: "Experienced site supervisor with strong leadership and quality control skills."
  },
  {
    name: "Wang Feng",
    email: "wang.feng@email.com",
    password: "Password123!",
    skills: ["Drywall Installation", "Partition Work", "Interior Fitting"],
    experience: "5 years",
    location: "Serangoon",
    phone: "+65 9901 2346",
    bio: "Expert in drywall and interior partition systems for commercial spaces."
  },
  {
    name: "Sanjay Patel",
    email: "sanjay.patel@email.com",
    password: "Password123!",
    skills: ["Landscaping", "Ground Work", "Finishing"],
    experience: "4 years",
    location: "Marine Parade",
    phone: "+65 9012 3457",
    bio: "Professional landscaper with expertise in both residential and commercial projects."
  }
];

// Employers Data
const employers = [
  {
    name: "BuildTech Construction",
    email: "hr@buildtech.sg",
    password: "Password123!",
    companyName: "BuildTech Construction Pte Ltd",
    industry: "Commercial Construction",
    companySize: "200-500 employees",
    location: "Marina Bay",
    phone: "+65 6123 4567",
    website: "www.buildtech.sg",
    description: "Leading construction company specializing in commercial high-rise buildings with over 20 years of experience."
  },
  {
    name: "Metro Infrastructure",
    email: "careers@metroinfra.sg",
    password: "Password123!",
    companyName: "Metro Infrastructure Solutions",
    industry: "Infrastructure Development",
    companySize: "500+ employees",
    location: "Jurong East",
    phone: "+65 6234 5678",
    website: "www.metroinfra.sg",
    description: "Major infrastructure contractor for MRT and highway projects across Singapore."
  },
  {
    name: "SkyHigh Builders",
    email: "jobs@skyhigh.sg",
    password: "Password123!",
    companyName: "SkyHigh Builders Pte Ltd",
    industry: "Residential Construction",
    companySize: "100-200 employees",
    location: "Punggol",
    phone: "+65 6345 6789",
    website: "www.skyhigh.sg",
    description: "Specialist in HDB and condominium construction projects with a focus on quality."
  },
  {
    name: "Premier Renovations",
    email: "recruit@premierreno.sg",
    password: "Password123!",
    companyName: "Premier Renovations Group",
    industry: "Renovation & Upgrading",
    companySize: "50-100 employees",
    location: "Orchard",
    phone: "+65 6456 7890",
    website: "www.premierreno.sg",
    description: "Expert in residential and commercial renovation works with creative solutions."
  },
  {
    name: "Industrial Works SG",
    email: "hr@industrialworks.sg",
    password: "Password123!",
    companyName: "Industrial Works Singapore",
    industry: "Industrial Construction",
    companySize: "300-500 employees",
    location: "Tuas",
    phone: "+65 6567 8901",
    website: "www.industrialworks.sg",
    description: "Specialized in factory and warehouse construction for industrial clients."
  },
  {
    name: "Green Earth Landscaping",
    email: "jobs@greenearth.sg",
    password: "Password123!",
    companyName: "Green Earth Landscaping Pte Ltd",
    industry: "Landscaping & Ground Work",
    companySize: "50-100 employees",
    location: "Bishan",
    phone: "+65 6678 9012",
    website: "www.greenearth.sg",
    description: "Professional landscaping and outdoor construction services for sustainable environments."
  },
  {
    name: "Elite Engineering",
    email: "careers@eliteeng.sg",
    password: "Password123!",
    companyName: "Elite Engineering Contractors",
    industry: "MEP Services",
    companySize: "150-300 employees",
    location: "CBD",
    phone: "+65 6789 0123",
    website: "www.eliteeng.sg",
    description: "Mechanical, Electrical & Plumbing specialist contractors for premium buildings."
  },
  {
    name: "Rapid Build",
    email: "hr@rapidbuild.sg",
    password: "Password123!",
    companyName: "Rapid Build Solutions",
    industry: "General Construction",
    companySize: "100-200 employees",
    location: "Novena",
    phone: "+65 6890 1234",
    website: "www.rapidbuild.sg",
    description: "Fast-track construction solutions for commercial projects with guaranteed timelines."
  },
  {
    name: "Foundation Specialists",
    email: "jobs@foundationspec.sg",
    password: "Password123!",
    companyName: "Foundation Specialists Pte Ltd",
    industry: "Foundation & Structural",
    companySize: "100-150 employees",
    location: "Tampines",
    phone: "+65 6901 2345",
    website: "www.foundationspec.sg",
    description: "Expert in foundation work and structural reinforcement for complex projects."
  },
  {
    name: "Urban Development",
    email: "recruit@urbandevelopment.sg",
    password: "Password123!",
    companyName: "Urban Development Corp",
    industry: "Mixed Development",
    companySize: "500+ employees",
    location: "Bugis",
    phone: "+65 6012 3456",
    website: "www.urbandevelopment.sg",
    description: "Large-scale mixed-use development contractor with award-winning projects."
  }
];

// Jobs Data
const jobs = [
  // BuildTech Construction
  {
    employerEmail: "hr@buildtech.sg",
    title: "Senior Scaffolder",
    location: "Marina Bay",
    salary: "$2,800 - $3,500",
    type: "Full-time",
    experience: "5+ years",
    skills: ["Scaffolding", "Height Work", "Safety Protocols"],
    description: "Experienced scaffolder needed for 40-storey commercial tower project. Must be comfortable with heights and have strong knowledge of safety protocols.",
    requirements: ["Valid scaffolding certification", "5+ years experience", "Good physical fitness", "Height safety training"],
    benefits: ["Medical insurance", "Annual bonus", "Safety equipment provided", "Career progression"],
    openings: 3
  },
  {
    employerEmail: "hr@buildtech.sg",
    title: "Concrete Specialist",
    location: "Downtown Core",
    salary: "$2,500 - $3,200",
    type: "Full-time",
    experience: "3+ years",
    skills: ["Concrete Work", "Foundation", "Formwork"],
    description: "Concrete work for high-rise building foundation and structure. Experience with large-scale projects required.",
    requirements: ["3+ years concrete experience", "Knowledge of formwork", "Team player", "Physical stamina"],
    benefits: ["Transport allowance", "Overtime pay", "Medical coverage", "Annual leave"],
    openings: 5
  },
  {
    employerEmail: "hr@buildtech.sg",
    title: "General Construction Worker",
    location: "Marina Bay",
    salary: "$2,200 - $2,800",
    type: "Full-time",
    experience: "2+ years",
    skills: ["General Construction", "Site Work"],
    description: "General construction work for commercial development project. Reliable and hardworking individuals needed.",
    requirements: ["2+ years experience", "Good work attitude", "Team oriented", "Physically fit"],
    benefits: ["Meals provided", "Transport provided", "Medical insurance", "Bonus"],
    openings: 8
  },

  // Metro Infrastructure Solutions
  {
    employerEmail: "careers@metroinfra.sg",
    title: "Heavy Machinery Operator",
    location: "Jurong East",
    salary: "$3,200 - $4,000",
    type: "Full-time",
    experience: "7+ years",
    skills: ["Heavy Machinery", "Crane Operation", "Site Safety"],
    description: "Crane operator for MRT construction project. Valid crane license required. Must have experience with tower cranes.",
    requirements: ["Valid crane operator license", "7+ years experience", "MRT project experience preferred", "Excellent safety record"],
    benefits: ["High salary", "Medical insurance", "Transport provided", "Career growth"],
    openings: 2
  },
  {
    employerEmail: "careers@metroinfra.sg",
    title: "Steel Fixer - MRT Project",
    location: "Toa Payoh",
    salary: "$2,600 - $3,300",
    type: "Full-time",
    experience: "4+ years",
    skills: ["Steel Fixing", "Reinforcement", "Structural Work"],
    description: "Steel reinforcement work for underground MRT tunnel construction. Experience with complex structural work required.",
    requirements: ["4+ years steel fixing", "Blueprint reading", "Underground work experience", "Safety conscious"],
    benefits: ["Competitive salary", "Medical coverage", "Performance bonus", "Skills training"],
    openings: 6
  },
  {
    employerEmail: "careers@metroinfra.sg",
    title: "Site Supervisor",
    location: "Woodlands",
    salary: "$3,800 - $4,500",
    type: "Full-time",
    experience: "8+ years",
    skills: ["Site Supervision", "Team Management", "Safety Management"],
    description: "Supervise construction team for highway expansion project. Strong leadership and safety management skills required.",
    requirements: ["8+ years supervision", "Leadership skills", "Safety certifications", "Project management experience"],
    benefits: ["Senior position", "Medical insurance", "Company vehicle", "Annual bonus"],
    openings: 2
  },
  {
    employerEmail: "careers@metroinfra.sg",
    title: "Excavation Worker",
    location: "Jurong West",
    salary: "$2,400 - $3,000",
    type: "Full-time",
    experience: "3+ years",
    skills: ["Excavation", "Earth Moving", "Site Preparation"],
    description: "Excavation and site preparation for infrastructure project. Experience with heavy equipment preferred.",
    requirements: ["3+ years excavation work", "Equipment operation skills", "Physical fitness", "Team player"],
    benefits: ["Overtime opportunities", "Medical insurance", "Transport provided", "Meal allowance"],
    openings: 4
  },

  // SkyHigh Builders
  {
    employerEmail: "jobs@skyhigh.sg",
    title: "Carpenter - HDB Project",
    location: "Punggol",
    salary: "$2,500 - $3,200",
    type: "Full-time",
    experience: "4+ years",
    skills: ["Carpentry", "Formwork", "Finishing"],
    description: "Carpentry and formwork for new HDB development in Punggol. Long-term project with stable employment.",
    requirements: ["4+ years carpentry", "Formwork experience", "Precision work", "Quality focused"],
    benefits: ["Stable project", "Medical coverage", "Bonus", "Skills development"],
    openings: 4
  },
  {
    employerEmail: "jobs@skyhigh.sg",
    title: "Tile Setter",
    location: "Sengkang",
    salary: "$2,300 - $2,900",
    type: "Full-time",
    experience: "3+ years",
    skills: ["Tile Setting", "Flooring", "Finishing Work"],
    description: "Tile installation for residential condominium project. Must have eye for detail and quality finishing skills.",
    requirements: ["3+ years tile setting", "Attention to detail", "Quality workmanship", "Reliable"],
    benefits: ["Performance bonus", "Medical insurance", "Long-term project", "Transport allowance"],
    openings: 3
  },
  {
    employerEmail: "jobs@skyhigh.sg",
    title: "Painter - Residential",
    location: "Hougang",
    salary: "$2,200 - $2,700",
    type: "Full-time",
    experience: "2+ years",
    skills: ["Painting", "Surface Preparation", "Coating Application"],
    description: "Painting work for residential development completion phase. Multiple units to complete.",
    requirements: ["2+ years painting", "Surface preparation skills", "Detail oriented", "Clean work habits"],
    benefits: ["Steady work", "Medical coverage", "Meal provided", "Bonus"],
    openings: 5
  },

  // Premier Renovations Group
  {
    employerEmail: "recruit@premierreno.sg",
    title: "Renovation Carpenter",
    location: "Islandwide",
    salary: "$2,600 - $3,400",
    type: "Full-time",
    experience: "5+ years",
    skills: ["Carpentry", "Interior Fitting", "Renovation"],
    description: "Carpentry work for commercial and residential renovation projects. Versatile and skilled carpenter needed.",
    requirements: ["5+ years renovation", "Versatile skills", "Customer interaction", "Quality focused"],
    benefits: ["Varied projects", "Medical insurance", "Performance bonus", "Skills training"],
    openings: 3
  },
  {
    employerEmail: "recruit@premierreno.sg",
    title: "Drywall Installer",
    location: "Central Region",
    salary: "$2,400 - $3,000",
    type: "Full-time",
    experience: "3+ years",
    skills: ["Drywall Installation", "Partition Work", "Interior Fitting"],
    description: "Drywall and partition installation for office renovation projects. Clean and precise work required.",
    requirements: ["3+ years drywall", "Partition systems knowledge", "Clean work habits", "Efficient"],
    benefits: ["Indoor work", "Medical coverage", "Regular projects", "Transport allowance"],
    openings: 2
  },

  // Industrial Works Singapore
  {
    employerEmail: "hr@industrialworks.sg",
    title: "Welder - Factory Construction",
    location: "Tuas",
    salary: "$2,800 - $3,600",
    type: "Full-time",
    experience: "5+ years",
    skills: ["Welding", "Metal Fabrication", "Blueprint Reading"],
    description: "Structural welding for new factory construction. Welding certification required. Must be able to read technical drawings.",
    requirements: ["Valid welding certification", "5+ years experience", "Blueprint reading", "Quality welding"],
    benefits: ["High demand skill", "Medical insurance", "Overtime pay", "Career advancement"],
    openings: 4
  },
  {
    employerEmail: "hr@industrialworks.sg",
    title: "Forklift Operator",
    location: "Jurong Industrial Estate",
    salary: "$2,400 - $3,000",
    type: "Full-time",
    experience: "3+ years",
    skills: ["Forklift Operation", "Warehouse", "Logistics"],
    description: "Material handling for warehouse construction site. Valid forklift license required. Safety-first mindset essential.",
    requirements: ["Valid forklift license", "3+ years experience", "Good safety record", "Reliable"],
    benefits: ["Regular hours", "Medical insurance", "Annual bonus", "Stable employment"],
    openings: 2
  },
  {
    employerEmail: "hr@industrialworks.sg",
    title: "General Factory Worker",
    location: "Tuas",
    salary: "$2,000 - $2,500",
    type: "Full-time",
    experience: "1+ years",
    skills: ["General Construction", "Site Work"],
    description: "General construction work for industrial facility construction. Entry-level position with training provided.",
    requirements: ["1+ year experience", "Willing to learn", "Hardworking", "Team player"],
    benefits: ["Training provided", "Medical coverage", "Overtime opportunities", "Growth potential"],
    openings: 6
  },

  // Green Earth Landscaping
  {
    employerEmail: "jobs@greenearth.sg",
    title: "Landscaping Specialist",
    location: "Islandwide",
    salary: "$2,300 - $2,900",
    type: "Full-time",
    experience: "3+ years",
    skills: ["Landscaping", "Ground Work", "Finishing"],
    description: "Landscaping work for residential and commercial developments. Creative and detail-oriented individuals needed.",
    requirements: ["3+ years landscaping", "Plant knowledge", "Hardscaping skills", "Outdoor work comfortable"],
    benefits: ["Outdoor work", "Medical insurance", "Varied projects", "Bonus"],
    openings: 4
  },
  {
    employerEmail: "jobs@greenearth.sg",
    title: "Ground Worker",
    location: "East Region",
    salary: "$2,000 - $2,500",
    type: "Full-time",
    experience: "2+ years",
    skills: ["Ground Work", "Site Preparation", "Landscaping"],
    description: "Ground preparation and landscaping assistance for multiple projects. Entry to mid-level position.",
    requirements: ["2+ years experience", "Physical fitness", "Willing to learn", "Team oriented"],
    benefits: ["Training provided", "Medical coverage", "Regular work", "Career growth"],
    openings: 3
  },

  // Elite Engineering Contractors
  {
    employerEmail: "careers@eliteeng.sg",
    title: "Licensed Electrician",
    location: "Orchard",
    salary: "$3,000 - $3,800",
    type: "Full-time",
    experience: "6+ years",
    skills: ["Electrical Installation", "Wiring", "Safety Compliance"],
    description: "Electrical installation for commercial building. LEW license required. Premium projects in prime locations.",
    requirements: ["Valid LEW license", "6+ years experience", "Commercial projects", "Quality workmanship"],
    benefits: ["Premium salary", "Medical insurance", "Career advancement", "Prestigious projects"],
    openings: 3
  },
  {
    employerEmail: "careers@eliteeng.sg",
    title: "Plumber - Commercial Projects",
    location: "CBD Area",
    salary: "$2,700 - $3,400",
    type: "Full-time",
    experience: "5+ years",
    skills: ["Plumbing", "Pipe Fitting", "Water Systems"],
    description: "Plumbing installation for commercial office buildings. Experience with large-scale systems required.",
    requirements: ["5+ years plumbing", "Commercial experience", "System knowledge", "Problem solving"],
    benefits: ["Competitive pay", "Medical coverage", "Premium projects", "Skills training"],
    openings: 3
  },
  {
    employerEmail: "careers@eliteeng.sg",
    title: "HVAC Technician",
    location: "Marina Bay",
    salary: "$2,800 - $3,500",
    type: "Full-time",
    experience: "4+ years",
    skills: ["HVAC Installation", "Air Conditioning", "Ventilation"],
    description: "HVAC system installation and maintenance for premium office tower. Modern systems and technology.",
    requirements: ["4+ years HVAC", "System knowledge", "Troubleshooting skills", "Technical certification"],
    benefits: ["Advanced systems", "Medical insurance", "Training opportunities", "Career growth"],
    openings: 2
  },

  // Rapid Build Solutions
  {
    employerEmail: "hr@rapidbuild.sg",
    title: "Multi-Skilled Worker",
    location: "Novena",
    salary: "$2,600 - $3,200",
    type: "Full-time",
    experience: "4+ years",
    skills: ["General Construction", "Multiple Trades", "Team Coordination"],
    description: "Versatile worker for fast-track commercial construction project. Must be adaptable and skilled in multiple trades.",
    requirements: ["4+ years experience", "Multiple skills", "Fast-paced work", "Team player"],
    benefits: ["Variety in work", "Medical insurance", "Performance bonus", "Skill development"],
    openings: 4
  },
  {
    employerEmail: "hr@rapidbuild.sg",
    title: "Facade Installer",
    location: "City Hall",
    salary: "$2,800 - $3,600",
    type: "Full-time",
    experience: "5+ years",
    skills: ["Glass Installation", "Glazing", "Facade Work", "Height Work"],
    description: "Curtain wall and facade installation for commercial tower. Specialized skills and height work required.",
    requirements: ["5+ years facade work", "Height comfortable", "Precision skills", "Safety conscious"],
    benefits: ["Specialized skill pay", "Medical insurance", "Safety equipment", "Premium projects"],
    openings: 3
  },

  // Foundation Specialists
  {
    employerEmail: "jobs@foundationspec.sg",
    title: "Foundation Worker",
    location: "Tampines",
    salary: "$2,500 - $3,200",
    type: "Full-time",
    experience: "4+ years",
    skills: ["Foundation", "Concrete Work", "Structural Work"],
    description: "Foundation and piling work for new residential development. Specialized foundation work experience required.",
    requirements: ["4+ years foundation work", "Piling experience", "Physical fitness", "Safety focused"],
    benefits: ["Specialized work", "Medical coverage", "Stable project", "Skills training"],
    openings: 5
  },
  {
    employerEmail: "jobs@foundationspec.sg",
    title: "Reinforcement Specialist",
    location: "Bedok",
    salary: "$2,600 - $3,300",
    type: "Full-time",
    experience: "5+ years",
    skills: ["Steel Fixing", "Reinforcement", "Structural Work"],
    description: "Structural reinforcement work for foundation projects. Must understand structural drawings and specifications.",
    requirements: ["5+ years steel fixing", "Structural knowledge", "Blueprint reading", "Quality work"],
    benefits: ["Specialist pay", "Medical insurance", "Career growth", "Long-term projects"],
    openings: 3
  },

  // Urban Development Corp
  {
    employerEmail: "recruit@urbandevelopment.sg",
    title: "Roofing Specialist",
    location: "Bukit Timah",
    salary: "$2,700 - $3,400",
    type: "Full-time",
    experience: "5+ years",
    skills: ["Roofing", "Waterproofing", "Height Work"],
    description: "Roofing and waterproofing work for mixed-use development. Must have extensive waterproofing experience.",
    requirements: ["5+ years roofing", "Waterproofing expertise", "Height work", "Quality focused"],
    benefits: ["Specialized skill", "Medical insurance", "Premium project", "Performance bonus"],
    openings: 3
  },
  {
    employerEmail: "recruit@urbandevelopment.sg",
    title: "Demolition Worker",
    location: "Kallang",
    salary: "$2,500 - $3,100",
    type: "Full-time",
    experience: "4+ years",
    skills: ["Demolition", "Site Clearing", "Safety Management"],
    description: "Controlled demolition for site redevelopment project. Safety is paramount in this role.",
    requirements: ["4+ years demolition", "Safety certification", "Equipment operation", "Risk awareness"],
    benefits: ["Specialized work", "Medical coverage", "Safety equipment", "Bonus"],
    openings: 4
  },
  {
    employerEmail: "recruit@urbandevelopment.sg",
    title: "Site Coordinator",
    location: "Bugis",
    salary: "$3,500 - $4,200",
    type: "Full-time",
    experience: "7+ years",
    skills: ["Site Supervision", "Quality Control", "Team Management"],
    description: "Coordinate multiple trades for large mixed-use development. Senior role with significant responsibilities.",
    requirements: ["7+ years coordination", "Multi-trade management", "Communication skills", "Problem solving"],
    benefits: ["Senior position", "Medical insurance", "Annual bonus", "Career advancement"],
    openings: 2
  }
];

// Quiz templates for different trades
const quizTemplates = [
  { title: "Scaffolding Safety Quiz", category: "Safety", difficulty: "Intermediate" },
  { title: "Welding Basics Quiz", category: "Technical Skills", difficulty: "Beginner" },
  { title: "Electrical Safety Standards", category: "Safety", difficulty: "Advanced" },
  { title: "Concrete Mixing Quiz", category: "Technical Skills", difficulty: "Beginner" },
  { title: "Height Work Safety", category: "Safety", difficulty: "Intermediate" },
  { title: "Blueprint Reading Basics", category: "Technical Skills", difficulty: "Intermediate" },
  { title: "Construction Safety Fundamentals", category: "Safety", difficulty: "Beginner" },
  { title: "HVAC Systems Overview", category: "Technical Skills", difficulty: "Advanced" }
];

// Seed Functions
async function seedJobseekers() {
  console.log('\n🔷 Creating Jobseekers...');
  const createdJobseekers = [];
  
  for (const jobseeker of jobseekers) {
    try {
      const userData = {
        name: jobseeker.name,
        email: jobseeker.email,
        type: 'jobseeker',
        skills: jobseeker.skills,
        experience: jobseeker.experience,
        location: jobseeker.location,
        phone: jobseeker.phone,
        bio: jobseeker.bio,
        createdAt: randomDate(30),
        isActive: true,
        profileComplete: true,
        achievements: [],
        totalPoints: Math.floor(Math.random() * 500) + 100
      };
      
      const docRef = await db.collection('users').add(userData);
      createdJobseekers.push({ id: docRef.id, ...userData });
      console.log(`  ✓ Created jobseeker: ${jobseeker.name}`);
    } catch (error) {
      console.error(`  ✗ Error creating ${jobseeker.name}:`, error.message);
    }
  }
  
  return createdJobseekers;
}

async function seedEmployers() {
  console.log('\n🏢 Creating Employers...');
  const createdEmployers = [];
  
  for (const employer of employers) {
    try {
      const userData = {
        name: employer.name,
        email: employer.email,
        type: 'employer',
        companyName: employer.companyName,
        industry: employer.industry,
        companySize: employer.companySize,
        location: employer.location,
        phone: employer.phone,
        website: employer.website,
        description: employer.description,
        createdAt: randomDate(60),
        isActive: true,
        profileComplete: true,
        verified: true
      };
      
      const docRef = await db.collection('users').add(userData);
      createdEmployers.push({ id: docRef.id, ...userData });
      console.log(`  ✓ Created employer: ${employer.companyName}`);
    } catch (error) {
      console.error(`  ✗ Error creating ${employer.companyName}:`, error.message);
    }
  }
  
  return createdEmployers;
}

async function seedJobs(createdEmployers) {
  console.log('\n💼 Creating Jobs...');
  const createdJobs = [];
  
  for (const job of jobs) {
    try {
      const employer = createdEmployers.find(e => e.email === job.employerEmail);
      if (!employer) {
        console.log(`  ⚠ Employer not found for job: ${job.title}`);
        continue;
      }
      
      const jobData = {
        employerId: employer.id,
        employerName: employer.companyName,
        title: job.title,
        location: job.location,
        salary: job.salary,
        type: job.type,
        experience: job.experience,
        skills: job.skills,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        openings: job.openings,
        status: 'active',
        postedAt: randomDate(20),
        expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        views: Math.floor(Math.random() * 200) + 50,
        applicants: 0
      };
      
      const docRef = await db.collection('jobs').add(jobData);
      createdJobs.push({ id: docRef.id, ...jobData });
      console.log(`  ✓ Created job: ${job.title} at ${employer.companyName}`);
    } catch (error) {
      console.error(`  ✗ Error creating job ${job.title}:`, error.message);
    }
  }
  
  return createdJobs;
}

async function seedApplications(createdJobseekers, createdJobs) {
  console.log('\n📝 Creating Applications...');
  const statuses = ['pending', 'pending', 'pending', 'reviewed', 'reviewed', 'accepted', 'rejected'];
  let applicationCount = 0;
  
  // Each jobseeker applies to 2-5 random jobs
  for (const jobseeker of createdJobseekers) {
    const numApplications = Math.floor(Math.random() * 4) + 2; // 2-5 applications
    const shuffledJobs = shuffle(createdJobs).slice(0, numApplications);
    
    for (const job of shuffledJobs) {
      try {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const applicationData = {
          jobId: job.id,
          jobTitle: job.title,
          jobseekerId: jobseeker.id,
          jobseekerName: jobseeker.name,
          jobseekerEmail: jobseeker.email,
          employerId: job.employerId,
          employerName: job.employerName,
          status: status,
          appliedAt: randomDate(15),
          coverLetter: `I am very interested in the ${job.title} position. With my ${jobseeker.experience} of experience in ${jobseeker.skills.join(', ')}, I believe I would be a great fit for this role.`,
          resume: 'resume.pdf',
          skills: jobseeker.skills
        };
        
        if (status === 'reviewed' || status === 'accepted') {
          applicationData.reviewedAt = randomDate(7);
        }
        
        await db.collection('applications').add(applicationData);
        
        // Update job applicant count
        await db.collection('jobs').doc(job.id).update({
          applicants: admin.firestore.FieldValue.increment(1)
        });
        
        applicationCount++;
      } catch (error) {
        console.error(`  ✗ Error creating application:`, error.message);
      }
    }
    console.log(`  ✓ Created applications for: ${jobseeker.name}`);
  }
  
  console.log(`  ✓ Total applications created: ${applicationCount}`);
}

async function seedQuizzes(createdJobseekers) {
  console.log('\n📚 Creating Quiz Completions...');
  let quizCount = 0;
  
  // Select 15 random jobseekers to have completed quizzes
  const jobseekersWithQuizzes = shuffle(createdJobseekers).slice(0, 15);
  
  for (const jobseeker of jobseekersWithQuizzes) {
    const numQuizzes = Math.floor(Math.random() * 3) + 1; // 1-3 quizzes per person
    const selectedQuizzes = shuffle(quizTemplates).slice(0, numQuizzes);
    
    for (const quiz of selectedQuizzes) {
      try {
        const score = Math.floor(Math.random() * 3) + 2; // Score between 2-5 (out of 5)
        const quizData = {
          userId: jobseeker.id,
          userName: jobseeker.name,
          quizTitle: quiz.title,
          category: quiz.category,
          difficulty: quiz.difficulty,
          score: score,
          totalQuestions: 5,
          passed: score >= 3,
          completedAt: randomDate(25),
          timeSpent: Math.floor(Math.random() * 300) + 180, // 3-8 minutes
          answers: Array(5).fill(null).map((_, i) => ({
            question: `Question ${i + 1}`,
            correct: i < score
          }))
        };
        
        await db.collection('quizzes').add(quizData);
        quizCount++;
      } catch (error) {
        console.error(`  ✗ Error creating quiz:`, error.message);
      }
    }
    console.log(`  ✓ Created quizzes for: ${jobseeker.name}`);
  }
  
  console.log(`  ✓ Total quizzes created: ${quizCount}`);
}

async function seedChatRooms(createdJobseekers, createdEmployers) {
  console.log('\n💬 Creating Chat Rooms...');
  let chatCount = 0;
  
  // Create 8 random chat conversations
  const shuffledJobseekers = shuffle(createdJobseekers);
  const shuffledEmployers = shuffle(createdEmployers);
  
  for (let i = 0; i < Math.min(8, shuffledJobseekers.length); i++) {
    try {
      const jobseeker = shuffledJobseekers[i];
      const employer = shuffledEmployers[i % shuffledEmployers.length];
      
      const chatData = {
        participants: [jobseeker.id, employer.id],
        participantNames: [jobseeker.name, employer.name],
        participantRoles: ['jobseeker', 'employer'],
        lastMessage: 'Hello, I am interested in discussing job opportunities.',
        lastMessageAt: randomDate(10),
        lastMessageSender: jobseeker.id,
        unreadCount: {
          [jobseeker.id]: 0,
          [employer.id]: Math.floor(Math.random() * 3)
        },
        createdAt: randomDate(12),
        deletedFor: []
      };
      
      await db.collection('chatRooms').add(chatData);
      chatCount++;
      console.log(`  ✓ Created chat: ${jobseeker.name} ↔ ${employer.companyName}`);
    } catch (error) {
      console.error(`  ✗ Error creating chat room:`, error.message);
    }
  }
  
  console.log(`  ✓ Total chat rooms created: ${chatCount}`);
}

// Main seeding function
async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');
  console.log('═══════════════════════════════════════════════════════');
  
  try {
    // Seed in order (maintaining relationships)
    const createdJobseekers = await seedJobseekers();
    const createdEmployers = await seedEmployers();
    const createdJobs = await seedJobs(createdEmployers);
    await seedApplications(createdJobseekers, createdJobs);
    await seedQuizzes(createdJobseekers);
    await seedChatRooms(createdJobseekers, createdEmployers);
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Jobseekers: ${createdJobseekers.length}`);
    console.log(`   • Employers: ${createdEmployers.length}`);
    console.log(`   • Jobs: ${createdJobs.length}`);
    console.log(`   • Applications: Generated based on jobseekers`);
    console.log(`   • Quiz Completions: Generated for 15 jobseekers`);
    console.log(`   • Chat Rooms: 8 conversations`);
    console.log('\n🎉 Your Bridge platform is now ready for deployment!');
    console.log('\n📝 Note: All users have password: Password123!\n');
    
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
  } finally {
    process.exit();
  }
}

// Run the seeder
seedDatabase();

