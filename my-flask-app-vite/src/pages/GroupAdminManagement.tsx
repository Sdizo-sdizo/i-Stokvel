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
  const filteredRequests = requests.filter(r => statusFilter === 'all' || r.status === statusFilter);
  const allSelected = selectedRequests.length === filteredRequests.length && filteredRequests.length > 0;

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

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && group.is_active) ||
      (filter === 'inactive' && !group.is_active);
    return matchesSearch && matchesFilter;
  });

  const totalGroups = groups.length;
  const activeGroups = groups.filter(g => g.is_active).length;

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createGroup(form);
      setShowCreate(false);
      setForm(initialForm);
      fetchGroups();
    } catch {
      alert('Failed to create group');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    try {
      await adminAPI.updateGroup(selectedGroup.id, editForm);
      setShowEdit(false);
      setEditForm(initialForm);
      setSelectedGroup(null);
      fetchGroups();
    } catch {
      alert('Failed to update group');
    }
  };

  const handleDelete = async () => {
    if (!selectedGroup) return;
    try {
      await adminAPI.deleteGroup(selectedGroup.id);
      setShowDelete(false);
      setSelectedGroup(null);
      fetchGroups();
    } catch {
      alert('Failed to delete group');
    }
  };

  const openEdit = (group: any) => {
    setSelectedGroup(group);
    setEditForm({
      name: group.name || '',
      description: group.description || '',
      contribution_amount: group.contribution_amount || '',
      frequency: group.frequency || 'monthly',
      max_members: group.max_members || '',
      tier: group.tier || '',
    });
    setShowEdit(true);
  };

  const openDelete = (group: any) => {
    setSelectedGroup(group);
    setShowDelete(true);
  };

  const handleApprove = async (requestId: number) => {
    try {
      await adminAPI.approveJoinRequest(requestId);
      toast.success("Request approved successfully!");
      fetchRequests();
    } catch (err: any) {
      if (err.response?.status === 400) {
        const data = err.response.data;
        toast.error(`${data.error} Notification sent to user.`);
      } else {
        toast.error("Failed to approve request");
      }
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await adminAPI.rejectJoinRequest(id, { reason: rejectReason });
      toast.success("Request rejected!");
      setRejectReason("");
      fetchRequests();
    } catch {
      toast.error("Failed to reject request");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="flex-1 p-6 md:p-10 overflow-y-auto">
      {/* ...rest of your JSX remains unchanged... */}
    </main>
  );
};

export default GroupAdminManagement;