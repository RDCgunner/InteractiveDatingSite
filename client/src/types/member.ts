export type Member= {
  id: string
  email: string
  displayName: string
  dateOfBirth: string
  imageUrl?: string
  created: string
  lastActive: string
  gender: string
  description?: string
  city: string
  country: string
}
export type Photo= {
  id: number
  url: string
  publicId?: string
  memberId: string
  isApproved: boolean
}

export type EditableMember ={
  displayName: string
  description?: string
  city: string
  country: string
}

export class MemberParams {
  gender?: string;
  minAge = 18;
  maxAge =100;
  pageNumber = 1;
  pageSize=100;
  orderBy='lastActive';
}