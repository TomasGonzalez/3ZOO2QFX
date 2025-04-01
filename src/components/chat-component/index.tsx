import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import TextInput from './components/text-input'
import CommentComponent from './components/comment-component';
import { AddComment, ChatContext } from './context-provider';
import localChatDBClient, { dbClientReturnTypes } from './services/localChatDBClient';
import { ResolvedChatComment } from './types';

interface ChatComponentProps {
  nameSpace: string;
  userName: string;
}

const TIMELINE_CONSTANT = 'update-timeline'

export default function ChatComponentWithContext({ nameSpace, userName }: ChatComponentProps) {
  const [timeline, setTimeline] = useState<ResolvedChatComment[]>([]);
  const [chatDBClient, setChatDBClient] = useState<dbClientReturnTypes>();
  const channel = useRef(new BroadcastChannel(nameSpace));

  useEffect(() => {
    const channelRef = channel.current
    if (!chatDBClient) localChatDBClient({ nameSpace }).then(async (dbClient) => {
      const comments = await dbClient.getChatTimeline();
      setTimeline(comments);
      setChatDBClient(dbClient);
    });

    channelRef.onmessage = (event) => {
      if (event.data?.type === TIMELINE_CONSTANT) chatDBClient?.getChatTimeline().then(setTimeline);
    };

    return () => {
      if (process.env.NODE_ENV !== 'development') channelRef.close();
    };
  }, [channel, chatDBClient, nameSpace]);

  const updateTimeline = useCallback((newTimeline: ResolvedChatComment[]) => {
    setTimeline(newTimeline);
    channel?.current.postMessage({ type: TIMELINE_CONSTANT })
  }, [channel])

  const addComment = useCallback(({ body, parent }: AddComment) => {
    if (!chatDBClient || !userName) return;
    chatDBClient.addComment({
      body,
      timeStamp: new Date().toISOString(),
      sender: userName,
      parent,
      deleted: false
    });
    chatDBClient?.getChatTimeline().then(updateTimeline)
  }, [chatDBClient, updateTimeline, userName]);

  const removeComment = useCallback((commentId: number) => {
    chatDBClient?.removeComment(commentId)
    chatDBClient?.getChatTimeline().then(updateTimeline)
    channel?.current.postMessage({ type: TIMELINE_CONSTANT })
  }, [channel, chatDBClient, updateTimeline])

  return (
    <ChatContext.Provider value={{ timeline, chatDBClient, nameSpace, userName, addComment, removeComment }}>
      <ChatComponent />
    </ChatContext.Provider>
  );
}

function ChatComponent() {
  const [textInputValue, setTextInputValue] = useState('')
  const chatContext = useContext(ChatContext)

  const onComment = useCallback(() => {
    chatContext?.addComment({ body: textInputValue })
    setTextInputValue('')
  }, [chatContext, textInputValue])

  return <div className="p-4 bg-gray-100">
    <TextInput
      testId={'comment-input'}
      value={textInputValue}
      onTextChange={(event) => setTextInputValue(event.target.value)}
      onComment={onComment}
    />
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Timeline</h3>
      {chatContext &&
        chatContext?.timeline?.map((comment) => (
          <CommentComponent key={comment?.id} comment={comment} />
        ))}
    </div>
  </div>
}


