import { ChangeEventHandler } from "react"

interface TextInputProps {
  onTextChange: ChangeEventHandler<HTMLInputElement>
  onComment: () => void
  value: string
}

export default function TextInput({ onComment, onTextChange, value }: TextInputProps) {
  return (
    <div>
      <input
        onChange={onTextChange}
        placeholder={"Type your comment here..."}
        value={value}
      />
      <button onClick={onComment}>Comment</button>
    </div>
  )
}