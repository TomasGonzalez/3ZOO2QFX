import { useCallback, useContext, useEffect, useState } from 'react';
import TextInput from './components/text-input'
import CommentComponent from './components/comment-component';
import { ChatContext } from './context-provider';
import localChatDBClient, { dbClientReturnTypes } from './services/localChatDBClient';
import { ResolvedChatComment } from './types';

interface ChatComponentProps {
  nameSpace: string;
  userName: string;
}

export default function ChatComponentWithContext({ nameSpace, userName }: ChatComponentProps) {
  const [timeline, setTimeline] = useState<ResolvedChatComment[]>([]);
  const [chatDBClient, setChatDBClient] = useState<dbClientReturnTypes>();


  useEffect(() => {
    const channel = new BroadcastChannel(nameSpace);

    localChatDBClient({ nameSpace }).then(async (dbClient) => {
      const comments = await dbClient.getChatTimeline();
      setTimeline(comments);
      setChatDBClient(dbClient);
    });

    channel.onmessage = (event) => {
      if (event.data?.type === 'new-comment') {
        chatDBClient?.getChatTimeline().then(setTimeline);
      }
    };

    return () => {
      channel.close();
    };
  }, [nameSpace, chatDBClient]);

  const updateTimeline = (newTimeline: ResolvedChatComment[]) => setTimeline(newTimeline)

  return (
    <ChatContext.Provider value={{ timeline, chatDBClient, nameSpace, userName, updateTimeline }}>
      <ChatComponent />
    </ChatContext.Provider>
  );
}

function ChatComponent() {
  const [textInputValue, setTextInputValue] = useState('')
  const chatContext = useContext(ChatContext)

  const onComment = useCallback(() => {
    if (!chatContext?.chatDBClient || !chatContext.userName) return;
    chatContext.chatDBClient.addComment({
      body: textInputValue,
      timeStamp: new Date().toISOString(),
      sender: chatContext.userName,
      parent: undefined
    });
    setTextInputValue('')
    chatContext?.chatDBClient?.getChatTimeline().then((timeline) => chatContext.updateTimeline(timeline))
  }, [chatContext, textInputValue]);

  return (
    <div>
      <TextInput
        value={textInputValue}
        onTextChange={(event) => setTextInputValue(event.target.value)}
        onComment={onComment}
      />
      <div>
        <h3>Timeline</h3>
        {chatContext &&
          chatContext?.timeline?.map(comment =>
            <CommentComponent key={comment?.id} comment={comment} />
          )
        }
      </div>
    </div>
  );
}


