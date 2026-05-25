import { Smile } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  onEmoji?: (emoji: string) => void;
}

const EMOJIS = [
  "😀",
  "😄",
  "😍",
  "🤣",
  "😎",
  "🤔",
  "👍",
  "🎉",
  "🙏",
  "🔥",
  "😅",
  "🙌",
];

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  onEmoji,
}: MessageComposerProps) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const disabledClass = disabled ? "cursor-not-allowed opacity-60" : "";
  const helpTextId = disabled ? "message-composer-help" : undefined;

  return (
    <form
      className={`relative flex items-center gap-3 rounded-[20px] bg-[#d7d7d7] p-3 shadow-[0_10px_24px_rgba(17,24,39,0.06)] ${disabledClass}`}
      onSubmit={(event) => {
        event.preventDefault();
        if (disabled) {
          return;
        }
        onSubmit();
      }}
    >
      <label
        className={`flex min-w-0 flex-1 items-center rounded-full bg-white px-4 py-0 ${disabledClass}`}
      >
        <span className="sr-only">Write a message</span>
        <input
          type="text"
          placeholder="Write Something..."
          value={value}
          disabled={disabled}
          aria-describedby={helpTextId}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full bg-transparent text-sm text-[#2b2f38] outline-none placeholder:text-[#c0c5cc] ${disabledClass}`}
        />

        <div className="relative">
          <button
            type="button"
            aria-label="Insert emoji"
            onClick={() => setEmojiOpen((s) => !s)}
            disabled={disabled}
            aria-describedby={helpTextId}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#8a96a3] transition hover:text-brand-orange cursor-pointer ${disabledClass}`}
          >
            <Smile className="h-4 w-4" aria-hidden="true" />
          </button>

          {emojiOpen ? (
            <div className="absolute right-0 bottom-full mb-2 w-44 rounded-lg border border-[#e6e9ef] bg-white p-2 shadow-[0_12px_28px_rgba(17,24,39,0.06)]">
              <div className="grid grid-cols-6 gap-2">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      onEmoji?.(e);
                      setEmojiOpen(false);
                    }}
                    className="h-8 w-8 rounded-md text-lg leading-6 hover:bg-[#f3f4f6]"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </label>

      <button
        type="submit"
        aria-label="Send message"
        disabled={disabled}
        aria-describedby={helpTextId}
        className={`flex h-11 w-11 items-center justify-center rounded-full bg-brand-orange text-white shadow-[0_10px_20px_rgba(255,134,0,0.28)] transition hover:bg-brand-orange/90 cursor-pointer ${disabledClass}`}
      >
        <Image
          src="/icons/send.svg"
          alt="send"
          className="w-5 h-5"
          width={4}
          height={4}
        />
      </button>

      {disabled ? (
        <p id="message-composer-help" className="sr-only" aria-live="polite">
          Select an approved contact and sign in to send messages.
        </p>
      ) : null}
    </form>
  );
}
