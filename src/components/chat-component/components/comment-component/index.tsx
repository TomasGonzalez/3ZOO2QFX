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

  return <div className="p-2 border-t border-gray-200">
    <div className="flex items-center mb-1">
      <button
        onClick={() => setReplyToComment(comment.id)}
        className="text-blue-500 hover:underline text-sm mr-2"
        data-testid='reply-button'
      >
        reply
      </button>
      <button onClick={onDelete} data-testid="delete-button" className="text-red-500 hover:underline text-sm">
        delete
      </button>
    </div>
    <div>
      <strong className="text-gray-800">{comment.sender}:</strong>{' '}
      <span className="text-gray-600">{comment.body}</span>
    </div>
    {!!comment.children.length && (
      <div className="ml-4 mt-2">
        {comment?.children.map((child) => (
          <CommentComponent comment={child} key={child.id} />
        ))}
      </div>
    )}
    {replyToComment && (
      <div className="mt-2">
        <TextInput
          testId={'reply-input'}
          value={textInputValue}
          onTextChange={(event) => setTextInputValue(event.target.value)}
          onComment={onComment}
        />
      </div>
    )}
  </div>
}