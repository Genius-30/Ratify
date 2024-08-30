export enum UserRole {
  USER = "USER",
  ORG = "ORGANIZATION",
}

export const Industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Automotive",
  "Manufacturing",
  "Energy",
] as const;

export enum FeedbackStatus {
  Pending = "Pending",
  Reviewed = "Reviewed",
  Implemented = "Implemented",
  Rejected = "Rejected",
  UnPublished = "UnPublished",
}
