'use client';

import { useState } from 'react';

const emailTypes = [
  { value: 'verification', label: 'Email Verification' },
  { value: 'admin-notification', label: 'Admin Notification' },
  { value: 'agent-approval', label: 'Agent Approval' },
  { value: 'agent-rejection', label: 'Agent Rejection' },
];

export default function EmailPreviewPage() {
  const [selectedType, setSelectedType] = useState('verification');
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');

  const previewUrl = `/api/email-preview?type=${selectedType}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Email Template Preview</h1>

        <div className="bg-card rounded-lg border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Preview Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {emailTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter email"
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="bg-muted px-6 py-3 border-b">
            <h2 className="text-lg font-semibold">
              Preview: {emailTypes.find(t => t.value === selectedType)?.label}
            </h2>
          </div>

          <div className="p-6">
            <iframe
              src={previewUrl}
              className="w-full h-96 border rounded-md"
              title="Email Preview"
              key={previewUrl}
            />
          </div>

          <div className="px-6 pb-6">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Open in New Tab
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}