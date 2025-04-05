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
    // Only trigger once per session
    const hasShown = sessionStorage.getItem("confettiShown");
    if (!hasShown) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#38bdf8", "#facc15"], // violet, sky, yellow
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
        "service_7o3gb5t", // Replace with your actual EmailJS service ID
        "template_qter767", // Replace with your actual EmailJS template ID
        form.current!,
        "BfC7DmtUny6JPdGq0" // Replace with your EmailJS public key
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
          {/* Logo */}
          <a
            href="#hero"
            className="text-xl font-bold text-violet-400 hover:text-violet-300 transition-colors"
          >
            Hire Me!
          </a>
          {/* Nav Links */}
          <ul className="flex space-x-6 text-sm font-medium text-violet-400">
            <li>
              <a
                href="#about"
                className="hover:text-violet-300 transition-colors"
              >
                About
              </a>
            </li>

            <li>
              <a
                href="#education"
                className="hover:text-violet-300 transition-colors"
              >
                Education
              </a>
            </li>
            <li>
              <a
                href="#experience"
                className="hover:text-violet-300 transition-colors"
              >
                Experience
              </a>
            </li>
            <li>
              <a
                href="#skills"
                className="hover:text-violet-300 transition-colors"
              >
                Skills
              </a>
            </li>
            <li>
              <a
                href="#blogs"
                className="hover:text-violet-300 transition-colors"
              >
                Blogs (Upcoming)
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="hover:text-violet-300 transition-colors"
              >
                Contact Me!
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
          ease: [0.22, 1, 0.36, 1], // cubic bezier (elegant ease-out)
        }}
      >
        <div
          id="hero"
          className="h-screen bg-gradient-to-br from-[#0B1120] to-[#0F172A] flex flex-col justify-center items-center px-4 text-center"
        >
          <header className="space-y-6 max-w-4xl text-center">
            {/* Greeting */}
            <h2 className="text-xl text-sky-400 tracking-wide font-worksans leading-tight">
              Hello! I’m
            </h2>

            {/* Name */}
            <h1 className="text-7xl sm:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-600 font-pacifico">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-7xl sm:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-600 font-pacifico"
              >
                Isha Mishra
              </motion.h1>
            </h1>

            {/* Title */}
            <p className="inline-flex items-center justify-center gap-2 text-purple-300 border border-purple-500 px-5 py-1.5 rounded-full text-base font-medium mx-auto bg-slate-800/60 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-purple-300" />
              Senior Software Engineer
            </p>
            <p className="text-slate-400 mt-2 text-sm italic">
              Passionate about building elegant backend systems and delightful
              user experiences.
            </p>
            {/* Icons and Resume */}
            <div className="flex justify-center items-center flex-wrap gap-5 mt-6 text-violet-400">
              <a
                href="https://github.com/ishamishra0408"
                className="hover:text-violet-600 transition"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com/in/ishamishracalifornia"
                className="hover:text-violet-600 transition"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="mailto:ishamishra0408@gmail.com"
                className="hover:text-violet-600 transition"
              >
                <Mail className="w-6 h-6" />
              </a>
              <a
                href={`${import.meta.env.BASE_URL}IshaSDEResume2025.pdf`}
                download
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg hover:from-violet-600 hover:to-indigo-600 transition-all duration-300 shadow-md"
              >
                <Download className="w-4 h-4" />
                Resume
              </a>
            </div>
          </header>
        </div>

        <section id="about" className="py-12">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
            {/* 👤 Image */}
            <div className="w-60 h-60 rounded-3xl overflow-hidden shadow-xl border-2 border-violet-500 bg-gradient-to-br from-violet-600/10 to-indigo-900/10 hover:shadow-violet-500/50 transition-all duration-300">
            <img
              src={`${import.meta.env.BASE_URL}LinkedInImage1.jpeg`}
              alt="Isha Mishra"
              className="w-full h-full object-cover"
            />
          </div>

            {/* 👋 Info */}
            <div className="flex-1 space-y-6 bg-slate-800/40 backdrop-blur-md border border-violet-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-400">
            <h2 className="text-2xl font-bold text-sky-400 flex items-center gap-2 transition-all duration-300 hover:text-violet-400 hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]">
                <img
                  src={`${import.meta.env.BASE_URL}profile-gradient.jpg`}
                  alt="Profile Icon"
                  className="w-6 h-6"
                />
                Who Am I?
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                I'm a{" "}
                <span className="text-violet-400 font-medium">
                  Senior Software Engineer
                </span>{" "}
                based in{" "}
                <span className="text-violet-300 font-medium">
                  San Francisco, California
                </span>
                , with a passion for building high-performance backend systems
                and scalable web platforms. I specialize in{" "}
                <span className="text-violet-300 font-medium">
                  Node.js, Spring Boot, TypeScript
                </span>
                , and system design — with an eye for clean architecture and
                seamless user experience.
              </p>

              <p className="text-slate-300 text-base leading-relaxed">
                With{" "}
                <span className="text-white font-medium">
                  4+ years of experience
                </span>
                , I've contributed to logistics, enterprise SaaS, and project
                management platforms. I focus on clean, testable code, backend
                performance, and cross-functional collaboration to deliver
                scalable products.
              </p>

              {/* 📇 Info Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-700 p-4 rounded-xl">
                  <p className="text-violet-400 font-semibold">Name:</p>
                  <p className="text-slate-200">Isha Mishra</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-xl">
                  <p className="text-violet-400 font-semibold">Email:</p>
                  <p className="text-slate-200">ishamishra0408@gmail.com</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-xl">
                  <p className="text-violet-400 font-semibold">Location:</p>
                  <p className="text-slate-200">San Francisco, California</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-xl">
                  <p className="text-violet-400 font-semibold">Phone:</p>
                  <p className="text-slate-200">+1 510-542-7675</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="education"
          className="h-screen flex flex-col justify-center items-center px-6 bg-[#0F172A]"
        >
          <h2 className="text-2xl font-bold text-sky-400 flex items-center gap-2 mb-6 transition-all duration-300 hover:text-violet-400 hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]">
            <svg
              className="w-6 h-6 text-violet-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5c-2.13 0-4.14-.55-5.84-1.52L12 14z"
              />
            </svg>
            Education
          </h2>

          <div className="space-y-6">
            {/* Card 1 */}
            <div className="bg-[#1e293b] border border-violet-500 rounded-xl p-6 text-slate-200 shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-400">
              <h3 className="text-lg font-semibold mb-1">
                Masters in Computer Science
              </h3>
              <p className="text-sm text-slate-400">
                Westcliff University, Irvine
              </p>
              <p className="text-sm text-slate-500">2024 – 2025</p>
              <p className="text-sm text-slate-500">Graduated with 4/4 GPA</p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#1e293b] border border-violet-500 rounded-xl p-6 text-slate-200 shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-400">
              <h3 className="text-lg font-semibold mb-1">
                Bachelor of Technology – Electrical, Electronics and
                Communications
              </h3>
              <p className="text-sm text-slate-400">
                Vellore Institute of Technology, Vellore, India
              </p>
              <p className="text-sm text-slate-500">2015 – 2019</p>
              <p className="text-sm text-slate-500">
                Graduated with 3.83/4 GPA
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#1e293b] border border-violet-500 rounded-xl p-6 text-slate-200 shadow-lg transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-400">
              <h3 className="text-lg font-semibold mb-1">
                Senior School (10+2)
              </h3>
              <p className="text-sm text-slate-400">
                City Montessori School, Gomti Nagar, Lucknow
              </p>
              <p className="text-sm text-slate-500">2013 – 2015</p>
              <p className="text-sm text-slate-500">
                Graduated with 97.8% in boards
              </p>
            </div>
          </div>
        </section>

        <section
          id="experience"
          className="h-screen flex flex-col justify-center items-center space-y-6 px-6 bg-[#0F172A]"
        >
          <h2 className="text-2xl font-semibold text-sky-400 flex items-center gap-2 transition-all duration-300 hover:text-violet-400 hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]">
            <Briefcase className="w-6 h-6 text-violet-400" />
            Experience
          </h2>
          <div className="space-y-8">
            {/* 💼 LetsTransport Block */}
            <div className="bg-slate-800 rounded-xl border border-violet-700 p-6 space-y-4 shadow-md transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-500">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-xl font-semibold text-slate-200">
                  LetsTransport (Series E, B2B Logistics)
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">
                    Senior Software Engineer
                  </span>
                  <span className="text-slate-500">July '22 - Sep '23</span>
                </div>
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-2 text-sm">
                <li>
                  Developed the low-level design and implemented a rules engine
                  for storing comprehensive vehicle attributes, enhancing data
                  accuracy and retrieval efficiency.
                </li>
                <li>
                  Developed an interview scheduling and slot discovery product
                  with recruiters using JavaScript and Node.js with MongoDB,
                  improving scheduling efficiency and user experience.
                </li>
                <li>
                  Streamlined partner KYC onboarding, boosting activation by 60%
                  using cron-based push notifications and a custom rules engine.
                </li>
                <li>
                  Built a real-time MongoDB to Elasticsearch sync using
                  Monstache as a POC for enhanced data indexing.
                </li>
                <li>
                  Authored technical documentation across multiple microservices
                  for better maintainability and knowledge transfer.
                </li>
                <li>
                  Mentored junior programmers, reviewed code, and led task
                  delegation, improving team performance and quality.
                </li>
                <li>
                  <strong>Tech Stack:</strong> JavaScript, TypeScript, Node.js,
                  NestJS, Express, MongoDB, Redis, Python.
                </li>
              </ul>
            </div>

            {/* 💼 Oracle Block */}
            <div className="bg-slate-800 rounded-xl border border-violet-700 p-6 space-y-4 shadow-md transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-500">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-xl font-semibold text-slate-200">
                  Oracle (Primavera in C&E vertical)
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">
                    Senior Software Engineer
                  </span>
                  <span className="text-slate-500">Jan '19 - July '21</span>
                </div>
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-2 text-sm">
                <li>
                  Led a team of junior engineers, improving productivity and
                  code quality through mentorship and reviews.
                </li>
                <li>
                  Built Monte Carlo Risk Analysis engine, increasing scheduling
                  efficiency by ~90%.
                </li>
                <li>
                  Designed and implemented rules engine for detailed weather
                  data integration in Risk Module.
                </li>
                <li>
                  Enabled Primavera's data interoperability with legacy systems
                  using import/export tools.
                </li>
                <li>
                  Resolved critical bugs across Activities and Workspaces,
                  enhancing system stability.
                </li>
                <li>
                  Applied TDD practices using Mockito and JUnit, reducing
                  regression and improving confidence in releases.
                </li>
                <li>
                  Followed Agile SDLC practices for improved delivery and
                  collaboration.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section
          id="skills"
          className="h-screen flex flex-col justify-center items-center space-y-10 px-6 bg-[#0B1120]"
        >
          <h2 className="text-3xl font-semibold text-sky-400 transition-all duration-300 hover:text-violet-400 hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]">
            Skills
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 💻 Languages */}
            <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-xl border border-violet-600 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.03] transition-transform duration-300">
              <h3 className="flex items-center gap-2 text-lg font-bold text-violet-400 mb-2">
                <FaCode className="text-sky-400" />
                Languages
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                JavaScript, TypeScript, Java, Python
              </p>
            </div>

            {/* 🖥 Backend */}
            <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-xl border border-violet-600 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.03] transition-transform duration-300">
              <h3 className="flex items-center gap-2 text-lg font-bold text-violet-400 mb-2">
                <FaServer className="text-sky-400" />
                Backend
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Node.js, Spring Boot, Express
              </p>
            </div>

            {/* 🎨 Frontend */}
            <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-xl border border-violet-600 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.03] transition-transform duration-300">
              <h3 className="flex items-center gap-2 text-lg font-bold text-violet-400 mb-2">
                <FaPaintBrush className="text-sky-400" />
                Frontend
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                React, Vite, HTML, CSS, Tailwind CSS
              </p>
            </div>

            {/* 🧮 Databases */}
            <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-xl border border-violet-600 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.03] transition-transform duration-300">
              <h3 className="flex items-center gap-2 text-lg font-bold text-violet-400 mb-2">
                <FaDatabase className="text-sky-400" />
                Databases
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                MongoDB, PostgreSQL, MySQL
              </p>
            </div>

            {/* ☁️ Cloud */}
            <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-xl border border-violet-600 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.03] transition-transform duration-300">
              <h3 className="flex items-center gap-2 text-lg font-bold text-violet-400 mb-2">
                <FaCloud className="text-sky-400" />
                Cloud
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Docker, Kubernetes
              </p>
            </div>

            {/* 🛠 Tools */}
            <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-xl border border-violet-600 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.03] transition-transform duration-300">
              <h3 className="flex items-center gap-2 text-lg font-bold text-violet-400 mb-2">
                <FaTools className="text-sky-400" />
                Tools
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Git, Jenkins, Jira, Kafka, Weblogic
              </p>
            </div>
          </div>
        </section>

        <section
          id="blogs"
          className="h-screen flex flex-col justify-center items-center space-y-6 px-6 bg-[#0F172A]"
        >
          <h2 className="text-2xl font-semibold text-sky-400 transition-all duration-300 hover:text-violet-400 hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]">
            Blogs (Upcoming)
          </h2>
          <p className="text-slate-400 italic">Coming soon...</p>
        </section>

        <section
          id="contact"
          className="py-20 flex justify-center items-center px-4 bg-gradient-to-br from-[#0B1120] to-[#0F172A]"
        >
          <div className="max-w-5xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold text-sky-400 transition-all duration-300 hover:text-violet-400 hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]">
          Get in Touch!</h2>

            <div className="rounded-2xl overflow-hidden border border-violet-400 shadow-xl grid grid-cols-1 md:grid-cols-3 transition-all duration-300 hover:shadow-[0_0_20px_#a855f7] hover:border-violet-500">
              <div className="md:col-span-1 bg-gradient-to-b from-[#1E293B] to-[#0F172A] text-white p-8 space-y-6">
                <h3 className="text-2xl font-bold">Contact Information</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <span>ishamishra0408@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📞</span>
                    <span>+1 510-542-7675</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📍</span>
                    <span>San Francisco, California</span>
                  </div>
                  <div className="flex items-center gap-3">
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
                      className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 w-full text-sm text-white placeholder-slate-400"
                    />
                    <input
                      type="email"
                      name="user_email"
                      placeholder="Your email"
                      required
                      className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 w-full text-sm text-white placeholder-slate-400"
                    />
                  </div>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 w-full text-sm text-white placeholder-slate-400"
                  />
                  <textarea
                    name="message"
                    placeholder="Your message"
                    required
                    className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 w-full h-32 text-sm text-white resize-none placeholder-slate-400"
                  />
                  {errors && <p className="text-red-400 text-sm">{errors}</p>}
                  {success && (
                    <p className="text-green-400 text-sm">
                      Message sent successfully!
                    </p>
                  )}
                  <button
                    type="submit"
                    className="bg-violet-500 hover:bg-violet-600 text-white px-6 py-2 rounded-lg text-sm transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </>
  );
}

export default App;
