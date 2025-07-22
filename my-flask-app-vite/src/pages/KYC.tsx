import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

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

const KYC: React.FC = () => {
  const [formData, setFormData] = useState<KYCFormData>({
    personal: { fullName: '', dateOfBirth: '', idNumber: '', phone: '', email: '', employmentStatus: '', employerName: '' },
    address: { streetAddress: '', city: '', province: '', postalCode: '', country: 'South Africa' },
    income: { monthlyIncome: '', incomeSource: '', employmentType: '' },
    bank: { bankName: '', accountNumber: '', accountType: '', branchCode: '' },
    documents: { idDocument: null, proofOfAddress: null, proofOfIncome: null, bankStatement: null },
  });

  // Example: Fetch user profile and prefill form
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
      toast.error('Error fetching user profile');
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Example: Handle input change
  const handleInputChange = (section: keyof Omit<KYCFormData, 'documents'>, field: string, value: string) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  // Example: Handle file change
  const handleFileChange = (field: keyof KYCFormData['documents'], file: File | null) => {
    setFormData(prev => ({ ...prev, documents: { ...prev.documents, [field]: file } }));
  };

  // Example: Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/kyc/submit', formData);
      toast.success('KYC submitted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit KYC');
    }
  };

  return (
    <div>
      <h1>KYC Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label>
          <input
            value={formData.personal.fullName}
            onChange={e => handleInputChange('personal', 'fullName', e.target.value)}
          />
        </div>
        {/* Add more fields as needed */}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default KYC;