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

  const onDelete = useCallback(() => {
    chatContext?.removeComment(comment.id)
  }, [chatContext, comment.id])

  const onComment = useCallback(() => {
    chatContext?.addComment({ body: textInputValue, parent: comment.id })
    setReplyToComment(undefined)
    setTextInputValue('')
  }, [chatContext, comment.id, textInputValue])

  return <div style={{ padding: 8 }}>
    <button onClick={() => setReplyToComment(comment.id)}>
      reply
    </button>
    <button onClick={onDelete}>
      delete
    </button>
    <strong style={{ marginLeft: 20 }}>{comment.sender}:</strong> {comment.body}
    {!!comment.children.length &&
      <div style={{ marginLeft: 20 }}>
        {comment?.children.map((comment) => <CommentComponent comment={comment} key={comment.id} />)}
      </div>
    }
    {replyToComment && <TextInput
      value={textInputValue}
      onTextChange={(event) => setTextInputValue(event.target.value)}
      onComment={onComment}
    />}
  </div>
}