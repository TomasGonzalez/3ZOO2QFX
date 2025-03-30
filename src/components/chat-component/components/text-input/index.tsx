interface TextInputProps {
  onComment: () => void
}

export default function TextInput({ onComment }: TextInputProps) {
  return (
    <div>
      <input placeholder={"Type your comment here..."} />
      <button onClick={onComment}>Comment</button>
    </div>
  )
}