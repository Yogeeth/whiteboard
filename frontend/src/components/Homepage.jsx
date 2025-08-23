import React, { useState, useEffect } from 'react';
import { ChevronRight, Users, Palette, Video, Code, Zap, Shield, Globe } from 'lucide-react';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';

const WhiteboardHomepage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const navigare = useNavigate()

  const handleManual = ()=>{
    navigare('video')
  }

  const [moadl,setModal] = useState(true)

  const handleCLose = (a)=>{
    setModal(a)
  }

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Real-time Drawing",
      description: "Collaborate with unlimited brush sizes, colors, and smooth drawing experience"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Video Integration",
      description: "See your collaborators face-to-face while working together"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Live Chat & AI",
      description: "Chat with team members or get AI assistance for your projects"
    }
  ];

  const devFeatures = [
    { icon: Code, title: "Manual WebRTC Setup", desc: "Perfect for learning WebRTC implementation" },
    { icon: Zap, title: "Real-time Sync", desc: "Socket.io powered collaboration" },
    { icon: Shield, title: "Secure Connections", desc: "STUN server configuration included" },
    { icon: Globe, title: "Cross-platform", desc: "Works on desktop and mobile devices" }
  ];

  return (
    <div className={`h-screen bg-neutral-900 text-white ${moadl ? "overflow-hidden" : "overflow-auto"}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 md:p-8">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CollabBoard
          </span>
        </div>
        
        
      </nav>

      {/* Hero Section */}
      <div className={`relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-20 pb-32 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Collaborate
            </span>
            <br />
            <span className="text-white">
              Without Limits
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            The most powerful real-time whiteboard with video chat, AI assistance, and developer-friendly WebRTC implementation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={()=>handleCLose(true)} className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-blue-500/25 flex items-center">
              Launch Whiteboard
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-neutral-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center shadow-lg shadow-cyan-500/25">
              <Video className="mr-2 w-5 h-5" />
              WebRTC Demo
            </button>
          </div>
        </div>

        {/* Floating Feature Cards */}
        <div className="relative">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 transition-all duration-500 hover:bg-white/10 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 ${
                  currentFeature === index ? 'ring-2 ring-blue-400 bg-white/10 shadow-xl shadow-blue-500/20' : ''
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="text-blue-400 mb-4 group-hover:scale-110 group-hover:text-purple-400 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                  {feature.description}
                </p>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <section id="features" className="relative z-10 py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Why Choose CollabBoard?
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built with cutting-edge technology for seamless collaboration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {devFeatures.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-blue-400/30 transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="text-blue-400 mb-4 group-hover:scale-110 group-hover:text-cyan-400 transition-all duration-300">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section id="developers" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-white">Perfect for</span>
                <br />
                <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                  Developers
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Includes a manual WebRTC setup component that's perfect for understanding 
                peer-to-peer connections, SDP exchange, and real-time communication protocols.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                  Complete WebRTC implementation with STUN servers
                </li>
                <li className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
                  Manual SDP offer/answer exchange interface
                </li>
                <li className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
                  Socket.io real-time drawing synchronization
                </li>
                <li className="flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"></div>
                  React hooks for state management
                </li>
              </ul>
              <button onClick={handleManual} className="group bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/25 flex items-center">
                <Code className="mr-2 w-5 h-5" />
                Explore Manual Connection
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            {/* Code Preview */}
            <div className="relative">
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-800/50">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-400 text-sm">WebRTC Setup</span>
                </div>
                <div className="p-6 text-sm font-mono">
                  <pre className="text-cyan-400">
{`const createOffer = async () => {
  const pc = createPeerConnection();
  setPeerConnection(pc);
  
  localStream.getTracks().forEach((track) => 
    pc.addTrack(track, localStream)
  );
  
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  setOfferSDP(JSON.stringify(offer));
};`}
                  </pre>
                </div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-3xl blur-xl -z-10 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center px-6 md:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}Collaborating?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using CollabBoard for their creative projects
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={()=>handleCLose(true)} className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-10 py-5 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/25">
              Create Your Board
              <ChevronRight className="inline ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            
          </div>
        </div>
      </section>

      {
        moadl && 
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-40">
        <button className='absolute top-10 right-10' onClick={()=>handleCLose(false)}>
            Close
        </button>
        <div>
            <Modal />
        </div>
        </div>



      }

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CollabBoard
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              Built with ❤️ for developers and creators.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WhiteboardHomepage;