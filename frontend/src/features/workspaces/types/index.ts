export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  jobTitle?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  slug: string;
  isPublic: boolean;
  ownerId: string;
  owner?: User;
  myRole?: string;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}


export interface WorkspaceMember {
  id: string;
  role: string;
  joinedAt: string;
  user: User;
}
