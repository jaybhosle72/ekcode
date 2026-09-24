function ChatBubble({ message, isUser }) {
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-[#3b82f6] text-white rounded-tr-none'
            : 'bg-[#1e293b] text-[#f1f5f9] border border-[#334155] rounded-tl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
}

export default ChatBubble;
