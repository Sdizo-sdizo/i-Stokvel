import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, CreditCard, Wallet, Loader2, CheckCircle } from "lucide-react";
import api from "../services/api";
import { getWalletBalance, getCards } from "../services/walletService";

const GroupDetails: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributionAmount, setContributionAmount] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "bank">("wallet");
  const [contributionStatus, setContributionStatus] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      try {
        const groupRes = await api.get(`/api/admin/groups/${groupId}`);
        setGroup(groupRes.data);

        const membersRes = await api.get(`/api/admin/groups/${groupId}/members`);
        setMembers(membersRes.data);

        setContributionAmount(groupRes.data.contribution_amount || 0);
      } catch (err) {
        navigate("/dashboard/stokvel-groups");
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId, navigate]);

  useEffect(() => {
    if (paymentMethod === "wallet") {
      getWalletBalance().then((data) => setWalletBalance(data.balance));
    }
    if (paymentMethod === "bank") {
      getCards().then((data) => setCards(data));
    }
  }, [paymentMethod]);

  const handleContinue = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmContribution = async () => {
    setShowConfirmModal(false);
    setPendingPayment(true);
    setContributionStatus(null);
    try {
      const payload: any = {
        amount: contributionAmount,
        method: paymentMethod,
      };
      if (paymentMethod === "bank") {
        payload.card_id = selectedCardId;
      }
      await api.post(`/api/groups/${groupId}/contribute`, payload);
      setContributionStatus("Contribution successful!");
      setShowSuccessModal(true);
    } catch (err: any) {
      setContributionStatus(err.response?.data?.error || "Contribution failed.");
    } finally {
      setPendingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  if (!group) {
    return <div className="text-center mt-10 text-red-500">Group not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* ...rest of your JSX remains unchanged... */}
    </div>
  );
};

export default GroupDetails;