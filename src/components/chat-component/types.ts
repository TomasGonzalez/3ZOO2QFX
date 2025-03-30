export interface ResolvedChatComment extends ChatComment {
  children: ResolvedChatComment[]
}

export interface ChatComment {
  id: number;
  body: string;
  timeStamp: string;
  sender: string;
  parent?: ChatComment['id'];
}

export interface ChatTimeline {
  comments: ResolvedChatComment['id'][];
}
