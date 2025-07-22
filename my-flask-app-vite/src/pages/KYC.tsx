import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { CheckCircle, Clock, FileUp, XCircle, FileText, X } from 'lucide-react';

// --- Constants for dropdowns and lookups ---
const provinces = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
  "Mpumalanga", "Northern Cape", "North West", "Western Cape"
];

const employmentTypes = [
  "Full-time", "Part-time", "Self-employed", "Unemployed", "Student", "Retired"
];

const bankNames = [
  "ABSA", "Capitec", "FNB", "Nedbank", "Standard Bank", "Investec", "TymeBank", "African Bank"
];

const accountTypes = [
  "Savings", "Cheque", "Current", "Transmission", "Business"
];

const bankBranchCodes: { [key: string]: string } = {
  "ABSA": "632005",
  "Capitec": "470010",
  "FNB": "250655",
  "Nedbank": "198765",
  "Standard Bank": "051001",
  "Investec": "580105",
  "TymeBank": "678910",
  "African Bank": "430000"
};

// --- Interfaces ---
interface KYCFormData {
  personal: {
    fullName: string;
    dateOfBirth: string;
    idNumber: string;
    phone: string;
    email: string;
    employmentStatus: string;
    employerName: string;
  };
  address: {
    streetAddress: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  income: {
    monthlyIncome: string;
    incomeSource: string;
    employmentType: string;
  };
  bank: {
    bankName: string;
    accountNumber: string;
    accountType: string;
    branchCode: string;
  };
  documents: {
    idDocument?: File | null;
    proofOfAddress?: File | null;
    proofOfIncome?: File | null;
    bankStatement?: File | null;
  };
}

interface KYCStatus {
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'not_submitted';
  rejection_reason?: string;
  submitted_at?: string;
}

const KYC = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState<KYCFormData>({
    personal: { fullName: '', dateOfBirth: '', idNumber: '', phone: '', email: '', employmentStatus: '', employerName: '' },
    address: { streetAddress: '', city: '', province: '', postalCode: '', country: 'South Africa' },
    income: { monthlyIncome: '', incomeSource: '', employmentType: '' },
    bank: { bankName: '', accountNumber: '', accountType: '', branchCode: '' },
    documents: { idDocument: null, proofOfAddress: null, proofOfIncome: null, bankStatement: null },
  });
  const [kycStatus, setKycStatus] = useState<KYCStatus>({ status: 'draft' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedDocuments, setUploadedDocuments] = useState<{[key: string]: string}>({});
  const [uploadingDocuments, setUploadingDocuments] = useState<{[key: string]: boolean}>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showCongrats, setShowCongrats] = useState(true);

  // --- Data Fetching ---
  const fetchUserProfile = useCallback(async () => {
    try {
      const { data: userData } = await api.get('/api/user/profile');
      setFormData(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          fullName: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          dateOfBirth: userData.date_of_birth ? new Date(userData.date_of_birth).toISOString().split('T')[0] : '',
          employmentStatus: userData.employment_status || '',
        }
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, []);

  const fetchKYCData = useCallback(async () => {
    try {
      const { data } = await api.get('/api/kyc/status');
      if (data && data.status !== 'not_submitted') {
        setKycStatus({
          status: data.status,
          rejection_reason: data.rejection_reason,
          submitted_at: data.created_at,
        });
        setFormData(prev => ({
          ...prev,
          personal: {
            fullName: data.full_name || prev.personal.fullName,
            dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : prev.personal.dateOfBirth,
            idNumber: data.id_number || '',
            phone: data.phone || prev.personal.phone,
            email: data.email || prev.personal.email,
            employmentStatus: data.employment_status || prev.personal.employmentStatus,
            employerName: data.employer_name || '',
          },
          address: {
            streetAddress: data.street_address || '',
            city: data.city || '',
            province: data.province || '',
            postalCode: data.postal_code || '',
            country: data.country || 'South Africa',
          },
          income: {
            monthlyIncome: data.monthly_income ? data.monthly_income.toString() : '',
            incomeSource: data.income_source || '',
            employmentType: data.employment_type || '',
          },
          bank: {
            bankName: data.bank_name || '',
            accountNumber: data.account_number || '',
            accountType: data.account_type || '',
            branchCode: data.branch_code || '',
          },
          documents: prev.documents,
        }));
        const hasExistingDocs = data.id_document_path || data.proof_of_address_path || data.proof_of_income_path || data.bank_statement_path;
        if (hasExistingDocs) {
          toast.info('Existing documents found. You can upload new documents to replace them.');
        }
      } else {
        setKycStatus({ status: 'draft' });
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      setKycStatus({ status: 'draft' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchUserProfile(), fetchKYCData()]);
    };
    loadData();
  }, [fetchUserProfile, fetchKYCData]);

  // --- Handlers ---
  const handleFileChange = (field: keyof KYCFormData['documents'], file: File | null) => {
    setFormData(prev => ({ ...prev, documents: { ...prev.documents, [field]: file } }));
  };

  const saveKYCData = async (section: keyof Omit<KYCFormData, 'documents'>) => {
    try {
      const sectionData = formData[section];
      await api.patch('/api/kyc/update', { [section]: sectionData });
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} information saved successfully!`);
    } catch (error: any) {
      console.error('Error saving KYC data:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save data. Please try again.';
      toast.error(errorMessage);
    }
  };

  // ... (rest of your render functions and return statement remain unchanged) ...
  // (No changes needed to the rest of the file, as the only issues were missing constants and unused functions)

  // ... existing code ...
};

export default KYC;