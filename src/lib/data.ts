export type Conversation = {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    avatar: string;
    unread: number;
    type: "lead" | "client";
  }
  
  export const conversations: Conversation[] = [
    {
      id: "1",
      name: "Dr. Navin Agrawal",
      lastMessage: "Brings all your new into one place",
      time: "08:45 AM",
      avatar: "/placeholder.svg",
      unread: 2,
      type: "lead"
    },
    {
      id: "2",
      name: "Dr. Sarah Smith",
      lastMessage: "Thank you for the update",
      time: "09:30 AM",
      avatar: "/placeholder.svg",
      unread: 0,
      type: "client"
    },
    // Add more conversations as needed
  ]
  
  
  