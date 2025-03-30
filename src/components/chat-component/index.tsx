import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  const channel = useMemo(() => new BroadcastChannel(nameSpace), [nameSpace]);

  useEffect(() => {

    if (!chatDBClient) localChatDBClient({ nameSpace }).then(async (dbClient) => {
      const comments = await dbClient.getChatTimeline();
      setTimeline(comments);
      setChatDBClient(dbClient);
    });

    channel.onmessage = (event) => {
      if (event.data?.type === TIMELINE_CONSTANT) {
        chatDBClient?.getChatTimeline().then(setTimeline);
      }
    };

    return () => {
      channel.close();
    };
  }, [channel, chatDBClient, nameSpace]);

  const updateTimeline = useCallback((newTimeline: ResolvedChatComment[]) => { setTimeline(newTimeline); channel?.postMessage({ type: 'update-timeline' }) }, [channel])

  const addComment = useCallback(({ body, parent }: AddComment) => {
    if (!chatDBClient || !userName) return;
    chatDBClient.addComment({
      body,
      timeStamp: new Date().toISOString(),
      sender: userName,
      parent
    });
    chatDBClient?.getChatTimeline().then((timeline) => updateTimeline(timeline))
  }, [chatDBClient, updateTimeline, userName]);


  return (
    <ChatContext.Provider value={{ timeline, chatDBClient, nameSpace, userName, addComment }}>
      <ChatComponent />
    </ChatContext.Provider>
  );
}

function ChatComponent() {
  const [textInputValue, setTextInputValue] = useState('')
  const chatContext = useContext(ChatContext)

  const addComment = useCallback(() => {
    chatContext?.addComment({ body: textInputValue })
    setTextInputValue('')
  }, [chatContext, textInputValue])

  return (
    <div>
      <TextInput
        value={textInputValue}
        onTextChange={(event) => setTextInputValue(event.target.value)}
        onComment={addComment}
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


