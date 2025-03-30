import { createContext } from 'react';
import { dbClientReturnTypes } from '../services/localChatDBClient';
import { ResolvedChatComment } from '../types';


interface ChatContext {
  chatDBClient?: dbClientReturnTypes
  timeline?: ResolvedChatComment[]
  nameSpace?: string
  userName?: string
  updateTimeline: (timeline: ResolvedChatComment[]) => void
}

export const ChatContext = createContext<ChatContext | undefined>(undefined);
