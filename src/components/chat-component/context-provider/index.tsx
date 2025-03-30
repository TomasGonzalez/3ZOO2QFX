import { createContext } from 'react';
import { dbClientReturnTypes } from '../services/localChatDBClient';
import { ResolvedChatComment } from '../types';

export interface AddComment {
  body: string,
  parent?: number
}

interface ChatContext {
  chatDBClient?: dbClientReturnTypes
  timeline?: ResolvedChatComment[]
  nameSpace?: string
  userName?: string
  addComment: ({ body, parent }: AddComment) => void
}

export const ChatContext = createContext<ChatContext | undefined>(undefined);
