export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface PassKey {
  id: string;
  name: string;
  createdAt: string;
  lastUsed: string;
}

export const mockSessions: Session[] = [
  {
    id: "1",
    device: "Chrome on Windows",
    location: "New York, NY",
    lastActive: "2 minutes ago",
    current: true,
  },
  {
    id: "2",
    device: "Safari on iPhone",
    location: "San Francisco, CA",
    lastActive: "1 hour ago",
    current: false,
  },
  {
    id: "3",
    device: "Firefox on Mac",
    location: "London, UK",
    lastActive: "3 days ago",
    current: false,
  },
];

export const mockPassKeys: PassKey[] = [
  {
    id: "1",
    name: "MacBook Pro Touch ID",
    createdAt: "2024-01-15",
    lastUsed: "2 minutes ago",
  },
  {
    id: "2",
    name: "iPhone Face ID",
    createdAt: "2024-01-10",
    lastUsed: "1 hour ago",
  },
]; 