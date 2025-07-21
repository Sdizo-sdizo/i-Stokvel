import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Gift, Users, TrendingUp, CheckCircle, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// --- Paste your full tierDetails object here ---
const tierDetails: Record<string, Record<string, {
  amountRange: string;
  interest: string;
  access: string;
  description: string;
  support: string;
}>> = {
  // ... your full tierDetails object ...
};

function getAmountsInRange(range: string) {
  const match = range.match(/R(\d+)[–-]R?(\d+)?/);
  if (!match) return [];
  const min = parseInt(match[1], 10);
  const max = match[2] ? parseInt(match[2], 10) : min;
  let amounts = [];
  for (let amt = min; amt <= max; amt += 50) {
    amounts.push(amt);
  }
  return amounts;
}

const TierDetails: React.FC = () => {
  const { category, tier } = useParams();
  const { user } = useAuth();

  function capitalize(str: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  function findKeyInsensitive(obj: Record<string, any>, key: string) {
    const lowerKey = key.toLowerCase();
    return Object.keys(obj).find(k => k.toLowerCase() === lowerKey);
  }

  const categoryKey = findKeyInsensitive(tierDetails, category || "");
  if (!categoryKey) return <div>Category not found.</div>;

  const tierKey = findKeyInsensitive(tierDetails[categoryKey], tier || "");
  if (!tierKey) return <div>Tier not found.</div>;

  const details = tierDetails[categoryKey][tierKey];
  const amounts = getAmountsInRange(details.amountRange);
  const [selectedAmount, setSelectedAmount] = useState(amounts[0] || "");
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    fetch('/api/user/join-requests', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        const pending = data.some((req: any) =>
          req.category === (category || "") &&
          req.tier === (tier || "") &&
          req.amount === selectedAmount &&
          req.status === "pending"
        );
        setIsPending(pending);
      });
  }, [category, tier, selectedAmount]);

  const handleJoin = (amount: number) => {
    fetch('/api/stokvel/join-group', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        category: category || "",
        tier: tier || "",
        amount,
      }),
    })
      .then(res => res.json())
      .then(() => {
        fetch('/api/user/join-requests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then(data => {
            const pending = data.some((req: any) =>
              req.category === (category || "") &&
              req.tier === (tier || "") &&
              req.amount === selectedAmount &&
              req.status === "pending"
            );
            setIsPending(pending);
          });
      });
  };

  const faqs = [
    {
      question: "Who can join?",
      answer: "Anyone with a valid South African ID and a group of at least 3 members."
    },
    {
      question: "Are there any fees?",
      answer: "No monthly fees. Only a small withdrawal fee applies."
    },
    {
      question: "How do I get started?",
      answer: "Click 'Join Now' above or contact our support team for help."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6 space-x-2">
          <Link to="/dashboard" className="hover:underline text-blue-600">Dashboard</Link>
          <span>/</span>
          <Link to="/dashboard/stokvel-groups" className="hover:underline text-blue-600">Stokvel Groups</Link>
          <span>/</span>
          <span className="text-gray-700 font-semibold">{capitalize(tier || "")} {capitalize(category || "")}</span>
        </div>

        {/* Hero Section */}
        <div className="bg-blue-50 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 mb-8">
          <div className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold shadow-lg bg-white text-blue-600 mb-4 md:mb-0">
            {capitalize(tier || "")[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{capitalize(tier || "")} {capitalize(category || "")} Stokvel</h1>
            <p className="text-lg text-gray-600 mb-4">{details.description}</p>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition mt-4 disabled:opacity-50"
              onClick={() => setShowModal(true)}
              disabled={isPending}
            >
              {isPending ? "Pending Approval" : "Join Now"}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center mb-8">
          <label className="block text-lg font-semibold mb-2 text-gray-700">
            Choose your monthly contribution
          </label>
          <div className="w-full max-w-xs">
            <select
              className="block w-full px-5 py-3 rounded-xl border-2 border-blue-300 bg-white text-blue-700 font-bold text-lg shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition"
              value={selectedAmount}
              onChange={e => setSelectedAmount(Number(e.target.value))}
            >
              {amounts.map(amt => (
                <option key={amt} value={amt}>
                  R{amt}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Selected: <span className="font-bold text-blue-700">R{selectedAmount}</span>
          </div>
        </div>

        {/* Quick Facts */}
        <div className="bg-blue-100 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <div className="font-semibold text-gray-700">Interest Rate</div>
            <div className="text-xl font-bold">{details.interest}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Access</div>
            <div className="text-xl font-bold">{details.access}</div>
          </div>
        </div>

        {/* What You Get */}
        <h2 className="text-2xl font-bold mb-4 text-center">What You Get</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <Users className="w-12 h-12 mb-2 text-blue-600" />
            <h3 className="font-semibold text-lg mb-1">Group Savings</h3>
            <p className="text-gray-500 text-center text-sm mb-2">
              Save together and reach your goals faster with pooled resources.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <CheckCircle className="w-12 h-12 mb-2 text-green-600" />
            <h3 className="font-semibold text-lg mb-1">Safe & Secure</h3>
            <p className="text-gray-500 text-center text-sm mb-2">
              Your funds are protected and always accessible.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <Gift className="w-12 h-12 mb-2 text-pink-600" />
            <h3 className="font-semibold text-lg mb-1">Exclusive Perks</h3>
            <p className="text-gray-500 text-center text-sm mb-2">
              {details.support}
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">How it Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <Users className="w-10 h-10 mb-2 text-blue-600" />
              <div className="font-semibold mb-1">Invite Members</div>
              <div className="text-gray-500 text-center text-sm">Invite your group members to join the stokvel.</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <TrendingUp className="w-10 h-10 mb-2 text-green-600" />
              <div className="font-semibold mb-1">Set Contributions</div>
              <div className="text-gray-500 text-center text-sm">Set your monthly contribution and savings goal.</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <CheckCircle className="w-10 h-10 mb-2 text-purple-600" />
              <div className="font-semibold mb-1">Track Progress</div>
              <div className="text-gray-500 text-center text-sm">Track your progress and earn interest together.</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <Calendar className="w-10 h-10 mb-2 text-yellow-600" />
              <div className="font-semibold mb-1">Withdraw Funds</div>
              <div className="text-gray-500 text-center text-sm">Withdraw funds anytime or set payout dates.</div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-4">
                <button
                  className="w-full flex justify-between items-center text-left font-semibold text-blue-700"
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                >
                  {faq.question}
                  <span>{openIndex === idx ? "−" : "+"}</span>
                </button>
                {openIndex === idx && (
                  <div className="mt-2 text-gray-600 text-sm">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal and Success Modal code remains unchanged, just ensure you use: */}
      {/* {user?.fullName || (user as any)?.full_name || ""} for user name */}
      {/* capitalize(category || "") and capitalize(tier || "") everywhere */}
    </div>
  );
};

export default TierDetails;