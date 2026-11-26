import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, ShieldCheck, Key } from 'lucide-react';
import RoleCard from './RoleCard';

const ROLES_DATA = [
  {
    roleKey: 'owner',
    title: 'Property Owner',
    subtitle: 'List your property with 100% privacy protection. Dedicated in-house broker handles all enquiries and visits.',
    badge: '100% Owner Privacy',
    icon: Home,
    highlights: [
      'Personal contact details are never exposed to clients',
      'Assigned in-house broker coordinates all viewings',
      'Categorized room photo, video & 360° panorama uploads',
      'Track inspection reports, visits, and offers live',
    ],
  },
  {
    roleKey: 'client',
    title: 'Client / Buyer / Tenant',
    subtitle: 'Discover verified homes, explore 360° virtual room tours, and schedule physical visits with licensed brokers.',
    badge: 'Verified Discovery',
    icon: Compass,
    highlights: [
      '100% physically inspected properties across NCR',
      'Interactive 360° virtual panoramic walkthroughs',
      'Accompanied visits with our licensed broker team',
      'Custom budget and requirement matching engine',
    ],
  },
  {
    roleKey: 'broker',
    title: 'In-House Broker',
    subtitle: 'Internal broker workspace for verification queue, inspections, client triage, and deal closing.',
    badge: 'Broker Network',
    icon: ShieldCheck,
    highlights: [
      '6-point physical verification inspection queue',
      'Direct client enquiry triage & accompanied visits',
      'Assigned broker profile on all managed listings',
      'Automated 40% commission ledger calculation',
    ],
  },
  {
    roleKey: 'admin',
    title: 'Admin / Management',
    subtitle: 'Central command panel for broker approvals, property verification signoffs, and revenue governance.',
    badge: 'Executive Control',
    icon: Key,
    highlights: [
      'Final property approval & broker assignments',
      'Broker onboarding and team credential audits',
      'Company 60% revenue share ledger & audit trails',
      'Supply-demand heatmap analytics & business oversight',
    ],
  },
];

const RoleSelection = ({ onSelectRole }) => {
  const [selectedRole, setSelectedRole] = useState('owner');
  const navigate = useNavigate();

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    if (onSelectRole) onSelectRole(roleKey);
  };

  const handleLogin = (roleKey) => {
    navigate(`/login?role=${roleKey}`);
  };

  const handleRegister = (roleKey) => {
    navigate(`/register?role=${roleKey}`);
  };

  return (
    <div className="space-y-6">
      {/* 4 Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ROLES_DATA.map((role) => (
          <RoleCard
            key={role.roleKey}
            {...role}
            isSelected={selectedRole === role.roleKey}
            onSelect={() => handleRoleSelect(role.roleKey)}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;
