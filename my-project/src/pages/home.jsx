import React, { useState, useRef, useEffect } from "react";

const FREE_LIMIT = 5;

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userPlan, setUserPlan] = useState("Free");
  const [messagesSent, setMessagesSent] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userEmail = localStorage.getItem("email");
    const token = localStorage.getItem("access_token");

    if (userEmail) {
      const emailKey = userEmail.toLowerCase().replace(/[@.]/g, "_");
      setUserPlan(localStorage.getItem(`user_plan_${emailKey}`) || "Free");
      setMessagesSent(parseInt(localStorage.getItem(`total_messages_sent_${emailKey}`) || "0"));

      // Try fetching from backend first if token exists
      if (token) {
        fetchHistory(token);
      } else {
        const savedMessages = localStorage.getItem(`chat_messages_${emailKey}`);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      }
    }
  }, []);

  const fetchHistory = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/history`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const formattedMessages = data.messages.map(m => ({
          role: m.role,
          content: m.content
        }));
        setMessages(formattedMessages);

        // Also update local storage for fallback
        const userEmail = localStorage.getItem("email");
        if (userEmail) {
          const emailKey = userEmail.toLowerCase().replace(/[@.]/g, "_");
          localStorage.setItem(`chat_messages_${emailKey}`, JSON.stringify(formattedMessages));
        }
      } else if (response.status === 401) {
        // Token expired or invalid
        console.error("Session expired. Please log in again.");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      // Fallback to local storage if backend fails
      const userEmail = localStorage.getItem("email");
      if (userEmail) {
        const emailKey = userEmail.toLowerCase().replace(/[@.]/g, "_");
        const savedMessages = localStorage.getItem(`chat_messages_${emailKey}`);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      }
    }
  };

  const isLimitReached = userPlan === "Free" && messagesSent >= FREE_LIMIT;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    const userEmail = localStorage.getItem("email");
    if (userEmail && messages.length > 0) {
      const emailKey = userEmail.toLowerCase().replace(/[@.]/g, "_");
      localStorage.setItem(`chat_messages_${emailKey}`, JSON.stringify(messages));
    }
  }, [messages]);

  const handleUpgrade = () => {
    const userEmail = localStorage.getItem("email");
    if (userEmail) {
      const emailKey = userEmail.toLowerCase().replace(/[@.]/g, "_");
      localStorage.setItem(`user_plan_${emailKey}`, "Pro");
      setUserPlan("Pro");
      alert("Upgraded to Pro successfully! Unlimited access unlocked.");
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please log in to send messages.");
      return;
    }

    if (isLimitReached) {
      alert("Free limit reached! Please upgrade to Pro for more messages.");
      return;
    }

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: input,
          system_prompt: "You are a helpful assistant.",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);

        const userEmail = localStorage.getItem("email");
        const emailKey = userEmail ? userEmail.toLowerCase().replace(/[@.]/g, "_") : "default";

        const recentActivity = JSON.parse(localStorage.getItem(`recent_activity_${emailKey}`) || "[]");
        const newActivity = {
          title: input.length > 30 ? input.substring(0, 30) + "..." : input,
          time: "Just now",
          id: Date.now(),
        };
        const updatedActivity = [newActivity, ...recentActivity];
        localStorage.setItem(`recent_activity_${emailKey}`, JSON.stringify(updatedActivity));
        localStorage.setItem(`total_conversations_${emailKey}`, updatedActivity.length.toString());

        const newTotalMessagesSent = messagesSent + 1;
        setMessagesSent(newTotalMessagesSent);
        localStorage.setItem(`total_messages_sent_${emailKey}`, newTotalMessagesSent.toString());
      } else if (response.status === 401) {
        alert("Session expired. Please log in again.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${errorData.detail || "Failed to get response."}` },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Could not connect to the server. Please ensure the backend is running." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 pb-6 relative overflow-hidden page-transition">
      <div className="h-20"></div>

      {/* Hero section when no messages */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center animate-slide-up text-center px-4">
          <div className="w-20 h-20 bg-linear-to-br from-brand-primary to-brand-accent rounded-3xl mb-8 flex items-center justify-center shadow-2xl shadow-brand-primary/20 rotate-12 hover:rotate-0 transition-transform duration-500">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            How can I <span className="gradient-text">ignite</span> your creativity?
          </h1>
          <p className="text-slate-400 max-w-lg text-lg mb-8">
            Ask anything. I'm here to help you build, learn, and explore new horizons with the power of AI.
          </p>

          {localStorage.getItem('access_token') && (
            <div className="mb-12 flex justify-center animate-fade-in [animation-delay:0.3s]">
              <button
                onClick={() => navigate('/dashboard')}
                className="group relative flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl"
              >
                <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary group-hover:rotate-12 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-0.5">Account Sync</p>
                  <p className="text-sm font-bold text-white uppercase tracking-widest">Neural Dashboard</p>
                </div>
                <svg className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            {[
              { title: "Design a logo", icon: "🎨" },
              { title: "Plan a trip", icon: "✈️" },
              { title: "Debug code", icon: "💻" },
              { title: "Explain physics", icon: "⚛️" }
            ].map(item => (
              <button
                key={item.title}
                onClick={() => setInput(item.title)}
                className="glass-card p-4 rounded-2xl text-left hover:bg-white/10 transition-all group flex items-center space-x-3 active:scale-95"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-slate-200 font-medium group-hover:text-white transition-colors">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat History */}
      <div className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto space-y-8 py-8 custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}>
            <div
              className={`max-w-[85%] rounded-3xl px-6 py-4 shadow-xl ${msg.role === "user"
                ? "bg-brand-primary text-white ml-12"
                : "glass-card text-slate-100 mr-12"
                }`}
            >
              <p className="whitespace-pre-wrap text-[16px] leading-relaxed">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass-card rounded-2xl px-6 py-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Upgrade Notification */}
      {isLimitReached && (
        <div className="absolute inset-x-0 bottom-40 flex justify-center px-4 animate-slide-up">
          <div className="bg-linear-to-br from-brand-primary to-brand-secondary text-white rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-white/20 backdrop-blur-2xl">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-white/20 rounded-2xl p-3">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-5">
                <h3 className="text-2xl font-bold mb-2">Upgrade to Pro</h3>
                <p className="text-white/80 leading-relaxed mb-6">
                  You've reached your free limit. Unlock unlimited conversations and pro features for just <span className="font-black text-white">$9.99/month</span>.
                </p>
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-white text-brand-primary font-bold py-4 px-6 rounded-2xl hover:bg-slate-100 transition-all shadow-xl active:scale-95"
                >
                  Get Started for $9.99/mo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="w-full max-w-4xl mx-auto pt-4 relative">
        <form onSubmit={handleSend} className="relative z-10">
          <div className={`glass-input rounded-3xl px-6 py-4 flex items-center gap-4 transition-all ${isLimitReached ? "opacity-30 pointer-events-none" : "hover:border-white/20"
            }`}>
            <textarea
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLimitReached}
              placeholder={isLimitReached ? "Limit reached" : "Type your message..."}
              className="flex-1 outline-none text-[16px] text-white placeholder-slate-500 bg-transparent resize-none py-1 max-h-48 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isLimitReached}
              className={`p-3 rounded-2xl transition-all shadow-lg ${input.trim() && !isLoading && !isLimitReached
                ? "bg-brand-primary text-white hover:scale-110 active:scale-95"
                : "bg-white/5 text-slate-600"
                }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </form>

        <div className="flex justify-between items-center mt-4 px-2">
          <div className="flex space-x-4">
            {["Image", "File", "Code"].map(btn => (
              <button key={btn} className="text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors">
                +{btn}
              </button>
            ))}
          </div>
          <p className="text-[11px] font-medium tracking-wide">
            {userPlan === "Free"
              ? <span className="text-slate-500">Free Plan <span className="text-brand-primary font-bold mx-1">{messagesSent}/{FREE_LIMIT}</span> used</span>
              : <span className="gradient-text font-bold">PRO PLAN ACTIVE</span>
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;