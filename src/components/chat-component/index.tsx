import { useRef } from 'react';
import localChatDBClient from './services/localChatDBClient'

interface ChatComponentProps {
  nameSpace: string;
}

export default function ChatComponent({ nameSpace }: ChatComponentProps) {
  const chatDBClient = useRef(localChatDBClient({ nameSpace }))

  // I want to implement a context API to handle the actual state of the components. 
  return <div>
    This is the chat component
    <div>
      <input
        placeholder={"Type your comment here..."} />
      <button>
        Comment
      </button>
    </div>
  </div>;
}
