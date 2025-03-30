import { useCallback, useContext, useState } from "react"
import { ResolvedChatComment } from "../../types"
import TextInput from "../text-input"
import { ChatContext } from "../../context-provider"

interface CommentComponentProps {
  comment: ResolvedChatComment
}

export default function CommentComponent({ comment }: CommentComponentProps) {
  const chatContext = useContext(ChatContext)
  const [replyToComment, setReplyToComment] = useState<number | undefined>()
  const [textInputValue, setTextInputValue] = useState('')

  const onComment = useCallback(() => {
    if (!chatContext?.chatDBClient || !chatContext.userName) return;
    chatContext.chatDBClient.addComment({
      body: textInputValue,
      timeStamp: new Date().toISOString(),
      sender: chatContext?.userName,
      parent: comment.id
    });
    setTextInputValue('')
  }, [chatContext?.chatDBClient, chatContext?.userName, textInputValue, comment.id]);

  return <div style={{ padding: 8 }}>
    <strong>{comment.sender}:</strong> {comment.body}
    {!!comment.children.length && <div style={{ marginLeft: 20 }}>
      {comment?.children.map((comment) => <CommentComponent comment={comment} key={comment.id} />)}
    </div>}
    <div onClick={() => setReplyToComment(comment.id)}>
      reply
    </div>
    {replyToComment && <TextInput
      value={textInputValue}
      onTextChange={(event) => setTextInputValue(event.target.value)}
      onComment={onComment}
    />}
  </div>
}