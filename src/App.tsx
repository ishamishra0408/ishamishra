import React, { useRef, useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import {
  Github,
  Linkedin,
  Mail,
  Download,
  ExternalLink,
  Briefcase,
  Sparkles,
  Award,
  TrendingUp,
  Users,
  Code2,
  Rocket,
  CheckCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import Sparkle from "react-sparkle";
import WelcomeAudio from "./WelcomeAudio";
import { motion } from "framer-motion";
import {
  FaCode,
  FaDatabase,
  FaCloud,
  FaTools,
  FaServer,
  FaPaintBrush,
} from "react-icons/fa";

function App() {
  useEffect(() => {
    const hasShown = sessionStorage.getItem("confettiShown");
    if (!hasShown) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#38bdf8", "#facc15"],
      });
      sessionStorage.setItem("confettiShown", "true");
    }
  }, []);
  
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = (data: any) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameRegex.test(data.name)) {
      return "Name must not contain numbers or special characters.";
    }

    if (!emailRegex.test(data.email)) {
      return "Please enter a valid email address.";
    }

    if (!data.message.trim()) {
      return "Message cannot be empty.";
    }

    return null;
  };
  
  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      name: form.current?.["user_name"].value,
      email: form.current?.["user_email"].value,
      subject: form.current?.["subject"].value,
      message: form.current?.["message"].value,
    };

    const validationError = validateForm(formData);
    if (validationError) {
      setErrors(validationError);
      return;
    }

    setErrors(null);

    emailjs
      .sendForm(
        "service_7o3gb5t",
        "template_qter767",
        form.current!,
        "BfC7DmtUny6JPdGq0"
      )
      .then(() => setSuccess(true))
      .catch(() => setErrors("Something went wrong. Please try again later."));
  };

  return (
    <>
      <WelcomeAudio />
      <Sparkle
        color="violet"
        count={40}
        minSize={7}
        maxSize={12}
        overflowPx={100}
        fadeOutSpeed={10}
      />

      <header className="fixed top-0 w-full z-50 bg-[#0B1120]/90 backdrop-blur-md shadow-md">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a
            href="#hero"
            className="text-xl font-bold text-violet-400 hover:text-violet-300 transition-colors"
          >
            Isha Mishra
          </a>
          <ul className="flex space-x-6 text-sm font-medium text-violet-400">
            <li>
              <a href="#about" className="hover:text-violet-300 transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="#highlights" className="hover:text-violet-300 transition-colors">
                Highlights
              </a>
            </li>
            <li>
              <a href="#experience" className="hover:text-violet-300 transition-colors">
                Experience
              </a>
            </li>
            <li>
              <a href="#skills" className="hover:text-violet-300 transition-colors">
                Skills
              </a>
            </li>
            <li>
              <a href="#education" className="hover:text-violet-300 transition-colors">
                Education
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-violet-300 transition-colors">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 1.1,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Hero Section */}
        <div
          id="hero"
          className="min-h-screen bg-gradient-to-br from-[#0B1120] to-[#0F172A] flex flex-col justify-center items-center px-4 text-center pt-20"
        >
          <header className="space-y-6 max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl text-sky-400 tracking-wide font-worksans leading-tight">
                Hello! I'm
              </h2>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-7xl sm:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-600 font-pacifico"
            >
              Isha Mishra
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="inline-flex items-center justify-center gap-2 text-purple-300 border border-purple-500 px-5 py-1.5 rounded-full text-base font-medium mx-auto bg-slate-800/60 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-purple-300" />
                Senior Software Engineer
              </p>
              <p className="text-slate-400 mt-4 text-base max-w-2xl mx-auto">
                Transforming complex challenges into elegant solutions with 5+ years of expertise in 
                <span className="text-violet-400 font-semibold"> backend architecture</span>, 
                <span className="text-violet-400 font-semibold"> microservices</span>, and 
                <span className="text-violet-400 font-semibold"> scalable systems</span>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center items-center flex-wrap gap-5 mt-8 text-violet-400"
            >
              <a
                href="https://github.com/ishamishra0408"
                className="hover:text-violet-600 transition hover:scale-110 transform"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com/in/ishamishracalifornia"
                className="hover:text-violet-600 transition hover:scale-110 transform"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="mailto:ishamishra0408@gmail.com"
                className="hover:text-violet-600 transition hover:scale-110 transform"
              >
                <Mail className="w-6 h-6" />
              </a>
              <a
                href={`${import.meta.env.BASE_URL}IMP_SWE_Resume.pdf`}
                download
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg hover:from-violet-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-violet-500/50 hover:scale-105 transform"
              >
                <Download className="w-4 h-4" />
                Download Resume
              </a>
            </motion.div>
          </header>
        </div>

        {/* Career Highlights Section - NEW! */}
        <section id="highlights" className="py-20 bg-gradient-to-br from-[#0F172A] to-[#0B1120]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-sky-400 text-center mb-12 transition-all duration-300 hover:text-violet-400 hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]">
              <Award className="w-8 h-8 inline-block mr-2 text-violet-400" />
              Career Highlights
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat 1 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-violet-900/40 to-slate-800/40 backdrop-blur-md p-6 rounded-xl border border-violet-500 text-center hover:shadow-[0_0_30px_#a855f7] transition-all duration-300"
              >
                <TrendingUp className="w-12 h-12 text-violet-400 mx-auto mb-3" />
                <h3 className="text-4xl font-bold text-white mb-2">5+</h3>
                <p className="text-slate-300 text-sm">Years Experience</p>
              </motion.div>

              {/* Stat 2 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-sky-900/40 to-slate-800/40 backdrop-blur-md p-6 rounded-xl border border-sky-500 text-center hover:shadow-[0_0_30px_#38bdf8] transition-all duration-300"
              >
                <Rocket className="w-12 h-12 text-sky-400 mx-auto mb-3" />
                <h3 className="text-4xl font-bold text-white mb-2">50%</h3>
                <p className="text-slate-300 text-sm">API Performance Boost</p>
              </motion.div>

              {/* Stat 3 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-indigo-900/40 to-slate-800/40 backdrop-blur-md p-6 rounded-xl border border-indigo-500 text-center hover:shadow-[0_0_30px_#6366f1] transition-all duration-300"
              >
                <Users className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-4xl font-bold text-white mb-2">60%</h3>
                <p className="text-slate-300 text-sm">Partner Activation Increase</p>
              </motion.div>

              {/* Stat 4 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-900/40 to-slate-800/40 backdrop-blur-md p-6 rounded-xl border border-purple-500 text-center hover:shadow-[0_0_30px_#a855f7] transition-all duration-300"
              >
                <Code2 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-4xl font-bold text-white mb-2">10+</h3>
                <p className="text-slate-300 text-sm">Technologies Mastered</p>
              </motion.div>
            </div>

            {/* Key Achievements */}
            <div className="mt-12 bg-slate-800/40 backdrop-blur-md border border-violet-500 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-violet-400 mb-6 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Key Achievements
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300">Reduced release cycles by <span className="text-white font-semibold">50%</span> through CI/CD automation</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300">Improved system performance by <span className="text-white font-semibold">40%</span> with optimized algorithms</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300">Reduced post-release bugs by <span className="text-white font-semibold">15%</span> through code reviews</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300">Cut query response time by <span className="text-white font-semibold">300ms</span> with Elasticsearch integration</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-[#0B1120]">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-60 h-60 rounded-3xl overflow-hidden shadow-xl border-2 border-violet-500 bg-gradient-to-br from-violet-600/10 to-indigo-900/10 hover:shadow-violet-500/50 transition-all duration-300"
            >
              <img
                src={`${import.meta.env.BASE_URL}LinkedInImage1.jpeg`}
                alt="Isha Mishra"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <div className="flex-1 space-y-6 bg-slate-800/40 backdrop-blur-md border border-violet-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-400">
              <h2 className="text-3xl font-bold text-sky-400 flex items-center gap-2 transition-all duration-300 hover:text-violet-400 hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]">
                <img
                  src={`${import.meta.env.BASE_URL}profile-gradient.jpg`}
                  alt="Profile Icon"
                  className="w-8 h-8"
                />
                About Me
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                I'm a <span className="text-violet-400 font-medium">Senior Software Engineer</span> based in{" "}
                <span className="text-violet-300 font-medium">Palo Alto, California</span>, passionate about crafting 
                high-performance backend systems and scalable web platforms. I specialize in{" "}
                <span className="text-violet-300 font-medium">Node.js, Spring Boot, TypeScript</span>, and system design — 
                with an eye for clean architecture and seamless user experience.
              </p>
              
              <p className="text-slate-300 text-base leading-relaxed">
                With <span className="text-white font-medium">over 5 years of experience</span> at companies like 
                Oracle, WNS, and LetsTransport, I've delivered impactful solutions in logistics, enterprise SaaS, 
                and project management. I focus on clean, testable code, backend performance, and cross-functional 
                collaboration to build products that scale.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl border border-violet-500/30">
                  <p className="text-violet-400 font-semibold">📧 Email:</p>
                  <p className="text-slate-200 text-sm">ishamishra0408@gmail.com</p>
                </div>
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl border border-violet-500/30">
                  <p className="text-violet-400 font-semibold">📍 Location:</p>
                  <p className="text-slate-200 text-sm">Palo Alto, California</p>
                </div>
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl border border-violet-500/30">
                  <p className="text-violet-400 font-semibold">📞 Phone:</p>
                  <p className="text-slate-200 text-sm">[phone removed]</p>
                </div>
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl border border-violet-500/30">
                  <p className="text-violet-400 font-semibold">🎓 Education:</p>
                  <p className="text-slate-200 text-sm">MS in CS (4.0 GPA)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section with Timeline */}
        <section id="experience" className="py-20 bg-gradient-to-br from-[#0F172A] to-[#0B1120]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-semibold text-sky-400 flex items-center justify-center gap-2 mb-12 transition-all duration-300 hover:text-violet-400 hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]">
              <Briefcase className="w-8 h-8 text-violet-400" />
              Professional Experience
            </h2>
            
            <div className="space-y-8 relative">
              {/* Timeline line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-sky-500 to-indigo-500 transform md:-translate-x-1/2"></div>
              
              {/* LetsTransport */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="ml-8 md:ml-0 md:w-[calc(50%-2rem)] md:ml-auto bg-slate-800 rounded-xl border border-violet-700 p-6 space-y-4 shadow-md transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-500">
                  <div className="absolute left-0 md:left-auto md:right-full top-6 w-4 h-4 bg-violet-500 rounded-full border-4 border-[#0B1120] md:mr-[calc(50%-0.5rem)]"></div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-200">
                      LetsTransport
                    </h3>
                    <p className="text-sm text-slate-400">B2B Logistics Tech Provider • Series E</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full border border-violet-500">
                        Senior Software Engineer
                      </span>
                      <span className="text-slate-500">July '22 - Sep '23</span>
                    </div>
                  </div>
                  
                  <ul className="list-disc list-inside text-slate-300 space-y-2 text-sm">
                    <li>Built interview scheduling platform with <span className="text-violet-400">Node.js & MongoDB</span></li>
                    <li>Accelerated API communication by <span className="text-green-400 font-semibold">50%</span> with Spring Boot</li>
                    <li>Boosted partner activation by <span className="text-green-400 font-semibold">60%</span> via automated KYC</li>
                    <li>Reduced query time by <span className="text-green-400 font-semibold">300ms</span> with Elasticsearch integration</li>
                    <li>Cut post-release bugs by <span className="text-green-400 font-semibold">15%</span> through code reviews</li>
                  </ul>
                </div>
              </motion.div>

              {/* WNS Global */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="ml-8 md:ml-0 md:w-[calc(50%-2rem)] bg-slate-800 rounded-xl border border-violet-700 p-6 space-y-4 shadow-md transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-500">
                  <div className="absolute left-0 md:left-1/2 top-6 w-4 h-4 bg-sky-500 rounded-full border-4 border-[#0B1120] md:ml-[calc(-0.5rem)]"></div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-200">
                      WNS Global Services
                    </h3>
                    <p className="text-sm text-slate-400">Customer Insights Platform • BFSI Vertical</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-3 py-1 bg-sky-500/20 text-sky-300 rounded-full border border-sky-500">
                        Senior Software Engineer
                      </span>
                      <span className="text-slate-500">Aug '21 - Jun '22</span>
                    </div>
                  </div>
                  
                  <ul className="list-disc list-inside text-slate-300 space-y-2 text-sm">
                    <li>Led full-stack development with <span className="text-sky-400">Spring Boot & Angular</span></li>
                    <li>Reduced response time by <span className="text-green-400 font-semibold">30%</span> with API optimization</li>
                    <li>Cut release cycles from <span className="text-green-400 font-semibold">7 to 2 days</span> via CI/CD</li>
                    <li>Improved sprint velocity by <span className="text-green-400 font-semibold">15%</span> through collaboration</li>
                  </ul>
                </div>
              </motion.div>

              {/* Oracle */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="ml-8 md:ml-0 md:w-[calc(50%-2rem)] md:ml-auto bg-slate-800 rounded-xl border border-violet-700 p-6 space-y-4 shadow-md transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-500">
                  <div className="absolute left-0 md:left-auto md:right-full top-6 w-4 h-4 bg-indigo-500 rounded-full border-4 border-[#0B1120] md:mr-[calc(50%-0.5rem)]"></div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-200">
                      Oracle
                    </h3>
                    <p className="text-sm text-slate-400">Primavera • Construction & Engineering</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500">
                        Senior Software Engineer
                      </span>
                      <span className="text-slate-500">Jan '19 - Jul '21</span>
                    </div>
                  </div>
                  
                  <ul className="list-disc list-inside text-slate-300 space-y-2 text-sm">
                    <li>Improved scheduler performance by <span className="text-green-400 font-semibold">40%</span> via Monte Carlo optimization</li>
                    <li>Designed rules engine for comprehensive weather data storage</li>
                    <li>Built import/export features for legacy system integration</li>
                    <li>Reduced release cycles by <span className="text-green-400 font-semibold">50%</span> with Jenkins automation</li>
                    <li>Improved team efficiency by <span className="text-green-400 font-semibold">30%</span> through mentorship</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Skills Section with Proficiency Bars */}
        <section id="skills" className="py-20 bg-[#0B1120]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-semibold text-sky-400 text-center mb-12 transition-all duration-300 hover:text-violet-400 hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]">
              Technical Expertise
            </h2>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Backend Skills */}
              <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-xl border border-violet-600">
                <h3 className="flex items-center gap-2 text-xl font-bold text-violet-400 mb-6">
                  <FaServer className="text-sky-400" />
                  Backend Development
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 text-sm">Node.js</span>
                      <span className="text-violet-400 text-sm">Expert</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full" style={{width: '95%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 text-sm">Spring Boot</span>
                      <span className="text-violet-400 text-sm">Expert</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full" style={{width: '90%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 text-sm">TypeScript</span>
                      <span className="text-violet-400 text-sm">Advanced</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-sky-500 to-violet-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 text-sm">Java</span>
                      <span className="text-violet-400 text-sm">Expert</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full" style={{width: '90%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Database & Cloud */}
              <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-xl border border-violet-600">
                <h3 className="flex items-center gap-2 text-xl font-bold text-violet-400 mb-6">
                  <FaCloud className="text-sky-400" />
                  Cloud & Databases
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 text-sm">MongoDB</span>
                      <span className="text-violet-400 text-sm">Expert</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full" style={{width: '90%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 text-sm">Docker/Kubernetes</span>
                      <span className="text-violet-400 text-sm">Advanced</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-sky-500 to-violet-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 text-sm">PostgreSQL/MySQL</span>
                      <span className="text-violet-400 text-sm">Advanced</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-sky-500 to-violet-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 text-sm">GCP/Cloud Platforms</span>
                      <span className="text-violet-400 text-sm">Advanced</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-sky-500 to-violet-500 h-2 rounded-full" style={{width: '80%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-xl border border-violet-600 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.03] transition-transform duration-300">
                <h3 className="flex items-center gap-2 text-lg font-bold text-violet-400 mb-2">
                  <FaCode className="text-sky-400" />
                  Languages
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Java, Python, JavaScript, TypeScript, Kotlin, C++
                </p>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-xl border border-violet-600 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.03] transition-transform duration-300">
                <h3 className="flex items-center gap-2 text-lg font-bold text-violet-400 mb-2">
                  <FaPaintBrush className="text-sky-400" />
                  Frontend
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  React, Angular, Vite, Tailwind CSS
                </p>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-xl border border-violet-600 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.03] transition-transform duration-300">
                <h3 className="flex items-center gap-2 text-lg font-bold text-violet-400 mb-2">
                  <FaTools className="text-sky-400" />
                  Tools & DevOps
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Jenkins, Kafka, GraphQL, Elasticsearch, Redis
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="py-20 bg-gradient-to-br from-[#0F172A] to-[#0B1120]">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-sky-400 flex items-center justify-center gap-2 mb-12 transition-all duration-300 hover:text-violet-400 hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]">
              <svg
                className="w-8 h-8 text-violet-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5c-2.13 0-4.14-.55-5.84-1.52L12 14z" />
              </svg>
              Education
            </h2>
          
            <div className="space-y-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-[#1e293b] border border-violet-500 rounded-xl p-6 text-slate-200 shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-400"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">Masters in Computer Science</h3>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500">4.0 GPA</span>
                </div>
                <p className="text-base text-slate-400">Westcliff University, Irvine</p>
                <p className="text-sm text-slate-500">2024 – 2025</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-[#1e293b] border border-violet-500 rounded-xl p-6 text-slate-200 shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-400"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">Bachelor of Technology</h3>
                  <span className="px-3 py-1 bg-sky-500/20 text-sky-300 rounded-full text-xs border border-sky-500">3.83 GPA</span>
                </div>
                <p className="text-base text-slate-400">Electrical, Electronics & Communications</p>
                <p className="text-sm text-slate-400">Vellore Institute of Technology, India</p>
                <p className="text-sm text-slate-500">2015 – 2019</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-[#1e293b] border border-violet-500 rounded-xl p-6 text-slate-200 shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-400"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">Senior School (10+2)</h3>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs border border-yellow-500">Top Performer</span>
                </div>
                <p className="text-base text-slate-400">City Montessori School, Lucknow</p>
                <p className="text-sm text-slate-500">2013 – 2015</p>
                <p className="text-sm text-green-400 mt-2">
                  97.8% in Science & Math • All India Rank: 4/500,000
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-gradient-to-br from-[#0B1120] to-[#0F172A]">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-sky-400 text-center mb-4 transition-all duration-300 hover:text-violet-400 hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]">
              Let's Connect!
            </h2>
            <p className="text-center text-slate-400 mb-10 max-w-2xl mx-auto">
              I'm always open to discussing new opportunities, innovative projects, or potential collaborations. 
              Feel free to reach out!
            </p>
            
            <div className="rounded-2xl overflow-hidden border border-violet-400 shadow-xl grid grid-cols-1 md:grid-cols-3 transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-500">
              <div className="md:col-span-1 bg-gradient-to-b from-[#1E293B] to-[#0F172A] text-white p-8 space-y-6">
                <h3 className="text-2xl font-bold">Contact Information</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 hover:text-violet-300 transition">
                    <Mail className="w-5 h-5" />
                    <span>ishamishra0408@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3 hover:text-violet-300 transition">
                    <span className="text-lg">📞</span>
                    <span>[phone removed]</span>
                  </div>
                  <div className="flex items-center gap-3 hover:text-violet-300 transition">
                    <span className="text-lg">📍</span>
                    <span>Palo Alto, California</span>
                  </div>
                  <div className="flex items-center gap-3 hover:text-violet-300 transition">
                    <ExternalLink className="w-5 h-5" />
                    <a
                      href="https://linkedin.com/in/ishamishracalifornia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                  <div className="flex items-center gap-3 hover:text-violet-300 transition">
                    <Github className="w-5 h-5" />
                    <a
                      href="https://github.com/ishamishra0408"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      GitHub Profile
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 bg-[#0B1120] text-white p-8 space-y-4">
                <h3 className="text-xl font-semibold text-violet-400">
                  Send Me a Message
                </h3>
                <form ref={form} onSubmit={sendEmail} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="user_name"
                      placeholder="Your name"
                      required
                      className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 w-full text-sm text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none transition"
                    />
                    <input
                      type="email"
                      name="user_email"
                      placeholder="Your email"
                      required
                      className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 w-full text-sm text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none transition"
                    />
                  </div>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 w-full text-sm text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none transition"
                  />
                  <textarea
                    name="message"
                    placeholder="Your message"
                    required
                    className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 w-full h-32 text-sm text-white resize-none placeholder-slate-400 focus:border-violet-500 focus:outline-none transition"
                  />
                  {errors && <p className="text-red-400 text-sm">{errors}</p>}
                  {success && (
                    <p className="text-green-400 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Message sent successfully!
                    </p>
                  )}
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-violet-500/50 hover:scale-105 transform"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-[#0B1120] border-t border-violet-500/30">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-slate-400 text-sm">
              © 2025 Isha Mishra. Built with React, TypeScript & Tailwind CSS.
            </p>
            <p className="text-slate-500 text-xs mt-2">
              Available for full-time opportunities • Open to relocation
            </p>
          </div>
        </footer>
      </motion.div>
    </>
  );
}

export default App;