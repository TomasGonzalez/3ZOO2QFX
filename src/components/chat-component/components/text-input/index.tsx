import { ChangeEventHandler } from "react"

interface TextInputProps {
  onTextChange: ChangeEventHandler<HTMLInputElement>
  testId: string
  onComment: () => void
  value: string
}

export default function TextInput({ onComment, onTextChange, value, testId }: TextInputProps) {
  return (
    <div className="flex mb-4">
      <input
        type="text"
        value={value}
        onChange={onTextChange}
        data-testid={testId}
        className="flex-1 p-2 border border-gray-300 rounded-l"
      />
      <button
        onClick={onComment}
        className="p-2 bg-blue-500 text-white rounded-r"
        data-testid="comment-button"
      >
        Comment
      </button>
    </div>
  )
}