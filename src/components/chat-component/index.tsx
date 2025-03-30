import { useCallback, useEffect, useState } from 'react';
import localChatDBClient, { dbClientReturnTypes } from './services/localChatDBClient';
import { ChatComment } from './types';

interface ChatComponentProps {
  nameSpace: string;
  userName: string;
}

export default function ChatComponent({ nameSpace, userName }: ChatComponentProps) {
  const [timeline, setTimeline] = useState<ChatComment[]>([]);
  const [chatDBClient, setChatDBClient] = useState<dbClientReturnTypes>();

  const onComment = useCallback(() => {
    if (!chatDBClient) return;
    chatDBClient.addComment({
      body: 'This is a test comment...',
      timeStamp: new Date().toISOString(),
      sender: userName,
      parent: undefined
    });
  }, [chatDBClient, userName]);

  useEffect(() => {
    localChatDBClient({ nameSpace }).then(async (dbClientReturnTypes) => {
      const comments = await dbClientReturnTypes.getChatTimeline();
      console.log(comments);
      setTimeline(comments);
      setChatDBClient(dbClientReturnTypes);
    });
  }, [nameSpace]);

  return (
    <div>
      This is the chat component
      <div onClick={onComment} />
      <div>
        <h3>Timeline</h3>
        {timeline.map(comment => (
          <div key={comment.id}>
            <strong>{comment.sender}:</strong> {comment.body}
          </div>
        ))}
      </div>
    </div>
  );
}
