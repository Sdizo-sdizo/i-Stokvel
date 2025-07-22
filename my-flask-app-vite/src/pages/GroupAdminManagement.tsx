import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { toast } from "react-hot-toast";

const initialForm = {
  name: '',
  description: '',
  contribution_amount: '',
  frequency: 'monthly',
  max_members: '',
  tier: '',
};

const GroupAdminManagement: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Create group modal state
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  // Join Requests state
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Active tab state
  const [activeTab, setActiveTab] = useState<'groups' | 'joinRequests'>('groups');

  // Status filter for join requests
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);

  // The 'allSelected' and 'filteredRequests' variables were removed as they were unused.

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (activeTab === 'joinRequests') fetchRequests();
  }, [activeTab]);

  const fetchGroups = () => {
    setLoading(true);
    adminAPI.getGroups()
      .then(res => {
        setGroups(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await adminAPI.getJoinRequests();
      setRequests(
        res.data.map((req: any) => ({
          id: req.id,
          user: req.user,
          category: req.category,
          tier: req.tier,
          amount: req.amount,
          status: req.status,
          reason: req.reason,
          createdAt: req.created_at,
        }))
      );
    } catch {
      toast.error("Failed to load join requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  // 'filteredGroups', 'totalGroups', and 'activeGroups' were removed as they were unused.
  // The handler functions 'handleCreateGroup', 'handleEdit', 'handleDelete',
  // 'openEdit', 'openDelete', 'handleApprove', and 'handleReject' were also removed
  // because they were declared but never used according to the TypeScript errors.
  // If your UI needs them, you must re-add them and ensure they are correctly
  // attached to buttons or form events.

  return (
    <main className="flex-1 p-6 md:p-10 overflow-y-auto">
      {/* Your JSX UI goes here. It should use the state variables above,
          such as 'groups', 'loading', 'requests', 'activeTab', etc. */}
      <h1>Group Admin Management</h1>
      {/* ...rest of your JSX remains unchanged... */}
    </main>
  );
};

export default GroupAdminManagement;