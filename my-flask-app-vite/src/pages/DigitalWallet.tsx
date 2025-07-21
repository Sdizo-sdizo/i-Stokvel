import React, { useEffect, useState } from "react";
import {
  getWalletBalance,
  getTransactions,
  getCards,
  addCard,
  deleteCard,
  makeDeposit,
  makeTransfer,
  Card,
  Transaction,
  updateCard,
  withdraw,
} from "../services/walletService";
import { toast } from "react-toastify";
import { Plus, CreditCard, Send, Loader2, Clipboard, Check } from "lucide-react";
import AddCardModal from "../components/AddCardModal";
import DepositModal from "../components/DepositModal";
import TransferModal from "../components/TransferModal";
import WithdrawModal from "../components/WithdrawModal";
import api from "../services/api";

const Spinner = ({ className = "h-5 w-5" }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const maskCardNumber = (num: string) => {
  if (!num) return "•••• •••• •••• ••••";
  const cleaned = num.replace(/\s/g, '');
  const last4 = cleaned.slice(-4);
  return "•••• •••• •••• " + last4;
};

const DigitalWallet: React.FC = () => {
  // State
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("ZAR");
  const [loading, setLoading] = useState(true);

  // Cards
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Modals
  const [showDeposit, setShowDeposit] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  // Deposit form
  const [depositAmount, setDepositAmount] = useState("");
  const [depositCard, setDepositCard] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);

  // Card editing/deleting
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Account number
  const [accountNumber, setAccountNumber] = useState("");
  const [copied, setCopied] = useState(false);

  // Withdraw modal
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Wallet balance for transfer/withdraw
  const [walletBalance, setWalletBalance] = useState(0.0);

  // Summary
  const [summary, setSummary] = useState({ totalDeposits: 0, totalTransfers: 0, totalWithdrawals: 0 });

  // Add card loading
  const [addCardLoading, setAddCardLoading] = useState(false);

  // Fetch wallet balance
  useEffect(() => {
    setLoading(true);
    getWalletBalance()
      .then((data) => {
        const balanceValue = typeof data.balance === 'number' ? data.balance : parseFloat(data.balance) || 0;
        setBalance(balanceValue);
        setCurrency(data.currency || 'ZAR');
        setWalletBalance(balanceValue);
      })
      .catch(() => {
        toast.error("Failed to load balance");
        setBalance(0);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch cards
  const fetchCards = async () => {
    setCardsLoading(true);
    try {
      const res = await getCards();
      const mapped = res.map((c: any) => ({
        id: c.id,
        card_number: c.card_number,
        card_holder: c.cardholder,
        expiry_date: c.expiry,
        card_type: c.card_type,
        is_default: c.is_primary,
      }));
      setCards(mapped);
    } catch (err) {
      // handle error
    } finally {
      setCardsLoading(false);
    }
  };

  // Fetch transactions
  useEffect(() => {
    setTxLoading(true);
    getTransactions(page, 10)
      .then((data) => {
        setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
        setPages(data.pages || 1);
      })
      .catch(() => toast.error("Failed to load transactions"))
      .finally(() => setTxLoading(false));
  }, [page]);

  // Calculate summary
  useEffect(() => {
    const deposits = transactions.filter(tx => tx.transaction_type === "deposit" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const transfers = transactions.filter(tx => tx.transaction_type === "transfer" && tx.status === "completed")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const withdrawals = transactions.filter(tx => tx.transaction_type === "withdrawal" && tx.status === "completed")
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    setSummary({ 
      totalDeposits: deposits, 
      totalTransfers: transfers,
      totalWithdrawals: withdrawals 
    });
  }, [transactions]);

  // Fetch account number
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/api/user/profile');
        if (data.account_number) {
          setAccountNumber(data.account_number);
        } else {
          setAccountNumber('Generating...');
          setTimeout(() => fetchProfile(), 1000);
        }
      } catch (err) {
        setAccountNumber('Error loading');
      }
    };
    fetchProfile();
  }, []);

  // Add card handler
  const handleAddCard = async (cardData: any) => {
    setAddCardLoading(true);
    try {
      await addCard(cardData);
      toast.success("Card added!");
      setShowAddCard(false);
      await fetchCards();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add card");
    } finally {
      setAddCardLoading(false);
    }
  };

  // Delete card handler
  const handleDeleteCard = async (id: number) => {
    try {
      await deleteCard(id);
      toast.success("Card deleted");
      await fetchCards();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete card");
    }
  };

  // Set default card (requires backend/service implementation)
  const handleSetDefaultCard = async (id: number) => {
    toast.info("Set default card functionality not yet implemented.");
  };

  // Additional handler for editing
  const handleEditCard = (card: Card) => setEditingCard(card);

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // UI
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-background py-10 px-4 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* ... (rest of your UI code remains unchanged) ... */}
      </div>

      <AddCardModal
        open={showAddCard}
        onClose={() => setShowAddCard(false)}
        onSave={handleAddCard}
      />

      <DepositModal
        open={showDeposit}
        onClose={() => setShowDeposit(false)}
        cards={cards.map(card => ({
          id: String(card.id),
          label: `${card.card_type?.toUpperCase() || "Card"} •••• ${card.card_number?.slice(-4)}`,
        }))}
        onDeposit={async (amount, method) => {
          try {
            const res = await makeDeposit({ 
              amount, 
              card_id: Number(method)
            });
            toast.success(res.message || "Deposit successful!");
            setShowDeposit(false);
            const balanceData = await getWalletBalance();
            setBalance(balanceData.balance);
            setWalletBalance(balanceData.balance);
            setPage(1);
          } catch (error: any) {
            toast.error(error.response?.data?.error || "Deposit failed");
            throw error;
          }
        }}
      />

      <TransferModal
        open={showTransfer}
        onClose={() => setShowTransfer(false)}
        onTransfer={async (data) => {
          try {
            await makeTransfer(data);
            toast.success("Transfer successful!");
            const balanceData = await getWalletBalance();
            setBalance(balanceData.balance);
            setWalletBalance(balanceData.balance);
            setPage(1);
          } catch (error: any) {
            toast.error(error.response?.data?.error || "Transfer failed");
            throw error;
          }
        }}
        walletBalance={walletBalance}
      />

      {editingCard && (
        <AddCardModal
          open={!!editingCard}
          onClose={() => setEditingCard(null)}
          onSave={async (form) => {
            const payload = {
              cardholder: form.cardholder,
              cardNumber: form.cardNumber,
              expiry: form.expiry,
              cvv: form.cvv,
              primary: form.primary,
            };
            await updateCard({ ...payload, id: editingCard.id });
            toast.success("Card updated!");
            setEditingCard(null);
            await fetchCards();
          }}
        />
      )}

      {cardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-2 p-6 relative">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
              <h2 className="text-xl font-bold mb-2 text-red-600">Delete Card?</h2>
              <p className="text-gray-600 mb-4 text-center">
                Are you sure you want to delete this card ending in <b>{cardToDelete.card_number.slice(-4)}</b>?<br />
                This action cannot be undone.
              </p>
              <div className="flex gap-2 w-full">
                <button
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold"
                  onClick={() => setCardToDelete(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold"
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      await handleDeleteCard(cardToDelete.id);
                      setCardToDelete(null);
                    } finally {
                      setDeleting(false);
                    }
                  }}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <WithdrawModal
        open={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        onWithdraw={async (data) => {
          try {
            await withdraw(data.amount, data.bank_account_number, data.note);
            toast.success("Withdrawal successful!");
            const balanceData = await getWalletBalance();
            setBalance(balanceData.balance);
            setWalletBalance(balanceData.balance);
            setPage(1);
          } catch (error: any) {
            toast.error(error.response?.data?.error || "Withdrawal failed");
            throw error;
          }
        }}
        walletBalance={walletBalance}
      />
    </div>
  );
};

export default DigitalWallet;