import { useState } from "react";
import { Home, Users, Folder, Calendar, FileText, PieChart, ArrowRight } from "lucide-react";
import { ClipLoader } from "react-spinners";

export default function App() {
  const [urls, setUrls] = useState(["", "", ""]);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [chatHistory,setChatHistory]=useState([])


  const fetchData = async () => {
    setProcessing(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/url_fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls }), // Sending the array
      });

      const data = await response.json();
      console.log("Response from server:", data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setProcessing(false);
  };

  const QueryHandle = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query
        })
      });
      const data = await response.json();
      setChatHistory(chatHistory=>[...chatHistory, { query, response: data.response }])
      setQuery("");
      setResult(data.response)
      console.log("Response from server:", data);
    }catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-16 bg-gray-900 flex flex-col items-center py-4 space-y-6">
        <Home className="text-white w-6 h-6 cursor-pointer" />
        <Users className="text-white w-6 h-6 cursor-pointer" />
        <Folder className="text-white w-6 h-6 cursor-pointer" />
        <Calendar className="text-white w-6 h-6 cursor-pointer" />
        <FileText className="text-white w-6 h-6 cursor-pointer" />
        <PieChart className="text-white w-6 h-6 cursor-pointer" />
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Sidebar - URL Inputs */}
        <div className="w-1/4 bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">NEWS ARTICLE URLS</h2>
          {urls.map((url, index) => (
            <div key={index} className="mb-4">
              <label className="block text-sm font-medium">URL{index + 1}</label>
              <input
                type="text"
                className="w-full border rounded-md p-2 bg-gray-200"
                value={url}
                onChange={(e) => {
                  const newUrls = [...urls];
                  newUrls[index] = e.target.value;
                  setUrls(newUrls);
                }}
              />
            </div>
          ))}
          <button className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800"
            onClick={fetchData}
            disabled={processing}
          >
            PROCESS
          </button>
          {processing && <ClipLoader color="#4A90E2" size={35} className="mt-4" />}

        </div>

        {/* Right Content Area */}
<div className="flex-1 bg-gray-300 flex flex-col items-center justify-center">
       <h1 className="text-4xl font-semibold mb-4 items-left justify-left">News Research Tool</h1>
  <div className="w-11/12 h-4/5 bg-gray-600 rounded-md p-4 text-white overflow-auto">
  <div className="flex-1 overflow-y-auto  p-4 rounded-lg shadow-md">
        {chatHistory.length>0 ?chatHistory.map((chat, index) => (
          <div key={index} className="mb-4">
            <div className="aglie right">
      
            <p className="font-semibold text-blue-600">You:</p>
            <p className="p-2 bg-gray-700 rounded-md text-right">{chat.query}</p>
               </div>
            <p className="font-semibold text-green-600 mt-2">AI:</p>
            <pre className="p-2 bg-gray-600 rounded-md whitespace-pre-wrap break-words">
              {chat.response}
            </pre>
          </div>
        )):<p>Hi! I'm your AI assistant. How can I help you today?</p>}
      </div>
  </div>

  {/* Query input */}
  <div className="w-full mt-4 flex justify-center">
    <input
      type="text"
      className="w-3/4 border rounded-md p-2 bg-gray-200"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Enter your query"
      onKeyDown={(e)=>{
        if(e.key==="Enter"){
          QueryHandle()
        }
      }}
    />
    <button className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 ml-2"
      onClick={QueryHandle}
      disabled={loading}
    >
      {loading ? "Processing..." : "QUERY"}
       <ArrowRight className="ml-2" />
    </button>
    {loading && <ClipLoader color="#4A90E2" size={35} className="mt-4" />}
  </div>
</div>

      </div>
    </div>
  );
}
