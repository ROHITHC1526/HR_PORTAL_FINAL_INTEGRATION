export interface TicketReply {
  id: string;
  author_name: string;
  author_role: string;
  message: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  employee_id: string;
  employee_name: string;
  subject: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In progress" | "Resolved";
  assigned_to?: string;
  created_at: string;
  replies: TicketReply[];
}

export const defaultTickets: Ticket[] = [
  {
    id: "T-101",
    employee_id: "EMP-001",
    employee_name: "Ananya Rao",
    subject: "Salary Account Bank Change",
    category: "Payroll & tax",
    priority: "High",
    status: "In progress",
    assigned_to: "Karthik Nair",
    created_at: "2026-10-13T10:00:00Z",
    replies: [
      {
        id: "r-1",
        author_name: "Ananya Rao",
        author_role: "Employee",
        message: "I have updated my primary salary account to HDFC Bank. Attached the cancelled cheque for IFSC verification.",
        created_at: "2026-10-13T10:00:00Z",
      },
      {
        id: "r-2",
        author_name: "Karthik Nair",
        author_role: "HR Partner",
        message: "Received your document Ananya. Forwarding to the finance payroll team for verification with bank portal.",
        created_at: "2026-10-13T14:30:00Z",
      },
    ],
  },
  {
    id: "T-102",
    employee_id: "EMP-004",
    employee_name: "Vikram Malhotra",
    subject: "Medical Insurance Dependent Endorsement",
    category: "Benefits & insurance",
    priority: "Medium",
    status: "Open",
    created_at: "2026-10-14T09:15:00Z",
    replies: [
      {
        id: "r-3",
        author_name: "Vikram Malhotra",
        author_role: "Employee",
        message: "Need to add my newborn daughter to the corporate group health policy. Please share the endorsement form.",
        created_at: "2026-10-14T09:15:00Z",
      },
    ],
  },
  {
    id: "T-103",
    employee_id: "EMP-002",
    employee_name: "Karthik Nair",
    subject: "HRA Exemption Rent Receipt Verification",
    category: "Payroll & tax",
    priority: "Low",
    status: "Resolved",
    assigned_to: "Ananya Rao",
    created_at: "2026-10-10T11:20:00Z",
    replies: [
      {
        id: "r-4",
        author_name: "Karthik Nair",
        author_role: "Employee",
        message: "Submitted landlord PAN and registered lease for Q3 HRA exemption.",
        created_at: "2026-10-10T11:20:00Z",
      },
      {
        id: "r-5",
        author_name: "Ananya Rao",
        author_role: "HR Partner",
        message: "Verified with IT declarations. Exemptions applied in October payroll run.",
        created_at: "2026-10-11T16:00:00Z",
      },
    ],
  },
];
