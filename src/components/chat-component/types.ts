export interface ResolvedChatComment extends ChatComment {
  children: ResolvedChatComment[]
}

export interface ChatComment {
  id: number;
  body: string;
  timeStamp: string;
  sender: string;
  parent?: ChatComment['id'];
  deleted: boolean
}

export interface ChatTimeline {
  comments: ResolvedChatComment['id'][];
}
